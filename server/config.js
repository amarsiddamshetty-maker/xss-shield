import { resolve } from 'node:path';

export const DEMO_EVENT_LIMIT = 500;
const loopback = new Set(['localhost', '127.0.0.1', '[::1]']);

export function parsePublicOrigin(value) {
  let url;
  try { url = new URL(value); } catch { throw new Error('Public demo requires a valid PUBLIC_ORIGIN or RENDER_EXTERNAL_URL.'); }
  if (url.username || url.password || url.search || url.hash || url.pathname !== '/' ||
    (url.protocol !== 'https:' && !(url.protocol === 'http:' && loopback.has(url.hostname)))) {
    throw new Error('PUBLIC_ORIGIN must be an HTTPS origin without credentials, paths, or query strings. HTTP is permitted only on loopback for tests.');
  }
  return url.origin;
}

export function readRuntimeConfig(env = process.env) {
  if (env.PUBLIC_DEMO && !['true', 'false'].includes(env.PUBLIC_DEMO)) throw new Error('PUBLIC_DEMO must be true or false.');
  const publicDemo = env.PUBLIC_DEMO === 'true';
  const publicOrigin = publicDemo ? parsePublicOrigin(env.PUBLIC_ORIGIN || env.RENDER_EXTERNAL_URL) : undefined;
  const port = Number(env.PORT || 3000);
  if (!Number.isInteger(port) || port < 1 || port > 65535) throw new Error('PORT must be an integer between 1 and 65535.');
  const rateLimitMax = Number(env.RATE_LIMIT_MAX || 120);
  if (!Number.isInteger(rateLimitMax) || rateLimitMax < 1) throw new Error('RATE_LIMIT_MAX must be a positive integer.');
  return {
    port,
    // Public listening requires explicit demo mode and a validated site origin.
    host: publicDemo && !loopback.has(new URL(publicOrigin).hostname) ? '0.0.0.0' : '127.0.0.1',
    publicDemo, publicOrigin, rateLimitMax,
    dbPath: env.DB_PATH || resolve('data', publicDemo ? 'public-demo.sqlite' : 'xss-shield.sqlite'),
    trustProxy: publicDemo && env.RENDER === 'true' ? 1 : false,
    allowedOrigins: !publicDemo && env.NODE_ENV === 'development' ? ['http://localhost:5173', 'http://127.0.0.1:5173'] : [],
  };
}
