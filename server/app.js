import express from 'express';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRepository } from './database/repository.js';
import { analyzeHtml } from './services/sanitizer.js';
import { errorHandler, HttpError } from './middleware/errors.js';
import { parseEventQuery, positiveInteger } from './middleware/validation.js';
import { registerDemoRoutes } from './demo-routes.js';
import { DEMO_EVENT_LIMIT, parsePublicOrigin } from './config.js';

const projectRoot = fileURLToPath(new URL('../', import.meta.url));
const loopbackNames = new Set(['localhost', '127.0.0.1', '[::1]']);

export function createApp({ dbPath = resolve(projectRoot, 'data/xss-shield.sqlite'), rateLimitMax = 120, rateLimitWindowMs = 60000, allowedOrigins = [], staticDir = resolve(projectRoot, 'dist'), publicDemo = false, publicOrigin, trustProxy = false } = {}) {
  const siteOrigin = publicDemo ? parsePublicOrigin(publicOrigin) : undefined;
  const siteHost = siteOrigin ? new URL(siteOrigin).host : undefined;
  const secureSite = siteOrigin?.startsWith('https:');
  const repository = createRepository(dbPath, { maxEvents: publicDemo ? DEMO_EVENT_LIMIT : undefined });
  const app = express();
  app.disable('x-powered-by');
  if (publicDemo && trustProxy === 1) app.set('trust proxy', 1);
  app.locals.repository = repository;
  app.locals.db = repository.db;
  app.locals.close = repository.close;
  app.use(helmet({
    contentSecurityPolicy: { directives: {
      defaultSrc: ["'self'"], scriptSrc: ["'self'"], scriptSrcAttr: ["'none'"],
      styleSrc: ["'self'"], imgSrc: ["'self'", 'data:'], fontSrc: ["'self'"], connectSrc: ["'self'"],
      objectSrc: ["'none'"], frameSrc: ["'none'"], frameAncestors: ["'none'"], baseUri: ["'none'"], formAction: ["'none'"], upgradeInsecureRequests: secureSite ? [] : null,
    } },
    strictTransportSecurity: secureSite ? { maxAge: 31536000 } : false,
  }));
  app.use((req, res, next) => {
    try {
      const host = new URL(`http://${req.get('host') || ''}`);
      const localHealthCheck = req.method === 'GET' && req.path === '/api/health' && loopbackNames.has(host.hostname);
      if (host.username || host.password || (publicDemo ? host.host !== siteHost && !localHealthCheck : !loopbackNames.has(host.hostname))) throw new Error('host');
      if (req.method !== 'GET' && req.method !== 'HEAD') {
        const origin = req.get('origin');
        const acceptedOrigin = publicDemo ? siteOrigin : host.origin;
        if ((origin && origin !== acceptedOrigin && (publicDemo || !allowedOrigins.includes(origin))) || req.get('sec-fetch-site') === 'cross-site') throw new Error('origin');
      }
      next();
    } catch {
      next(new HttpError(403, publicDemo ? 'INVALID_ORIGIN' : 'LOCAL_ONLY', publicDemo ? 'This demo accepts requests for its configured site origin only.' : 'This application accepts local, same-origin requests only.'));
    }
  });
  app.use('/api', (req, res, next) => { res.setHeader('Cache-Control', 'no-store'); next(); });
  app.use('/api', rateLimit({ windowMs: rateLimitWindowMs, limit: rateLimitMax, standardHeaders: 'draft-7', legacyHeaders: false, message: { error: { code: 'RATE_LIMITED', message: 'Too many requests. Wait a minute and try again.' } } }));
  app.use(express.json({ limit: '128kb', strict: true }));

  registerDemoRoutes(app, repository.db);
  app.get('/api/health', (req, res) => {
    repository.db.prepare('SELECT 1').get();
    res.json({ data: { status: 'ok', service: 'XSS Shield', protection: 'active', storage: 'sqlite', publicDemo, eventLimit: publicDemo ? DEMO_EVENT_LIMIT : null } });
  });
  app.post('/api/scan', (req, res) => {
    if (!req.is('application/json')) throw new HttpError(415, 'INVALID_INPUT', 'Send the request as application/json.');
    if (!req.body || typeof req.body !== 'object' || Array.isArray(req.body) || Object.keys(req.body).length !== 1 || !Object.hasOwn(req.body, 'html')) {
      throw new HttpError(400, 'INVALID_INPUT', 'The request must be a JSON object containing only an html field.');
    }
    const event = repository.addEvent(analyzeHtml(req.body.html));
    res.status(201).json({ data: event });
  });
  app.get('/api/events', (req, res) => res.json({ data: repository.listEvents(parseEventQuery(req.query)) }));
  app.get('/api/events/:id', (req, res) => {
    const id = positiveInteger(req.params.id, 'id');
    const event = repository.getEvent(id);
    if (!event) throw new HttpError(404, 'NOT_FOUND', 'This security event was not found.');
    res.json({ data: event });
  });
  app.get('/api/summary', (req, res) => res.json({ data: repository.getSummary() }));
  app.get('/api/report', (req, res) => res.json({ data: {
    generated_at: new Date().toISOString(), publicDemo, summary: repository.getSummary(), events: repository.listEvents({ pageSize: 100 }).items,
    recommendations: ['Validate input shape and size on the server.', 'Sanitize untrusted HTML with a maintained library and a restrictive policy.', 'Use output encoding when displaying text, and avoid unsafe DOM sinks.', 'Keep dependencies updated and retain a strict Content Security Policy.', 'Submit demonstration content only; sanitized text can still contain personal information.'],
    limitations: [publicDemo ? `Public demo: all visitors share the latest ${DEMO_EVENT_LIMIT} saved events. History can disappear on hosting sleep, restart, or redeploy. Totals describe retained records only. Do not submit private information.` : 'Local mode: records are retained in this installation.', 'Educational application-level prototype; not an enterprise Web Application Firewall or external website scanner.', 'Sanitization is a policy decision and does not prove an attack occurred.', 'Summary totals cover all stored scans; activity lists the latest 100 events only.', 'Invalid requests are rejected and are not stored as security events.', 'Only basic formatting is supported; all HTML attributes are removed.', 'Stored sanitized content may contain user-written text. Do not submit secrets or personal information.'],
  } }));
  app.use('/api', (req, res, next) => next(new HttpError(404, 'NOT_FOUND', 'This API endpoint was not found.')));
  if (existsSync(resolve(staticDir, 'index.html'))) {
    app.use(express.static(staticDir));
    app.get('/{*path}', (req, res) => res.sendFile(resolve(staticDir, 'index.html')));
  } else {
    app.get('/', (req, res) => res.status(503).type('text').send('Frontend build is missing. Run npm run build, then restart the server.'));
  }
  app.use(errorHandler);
  return app;
}
