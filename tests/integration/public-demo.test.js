import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import request from 'supertest';
import { createApp } from '../../server/app.js';
import { DEMO_EVENT_LIMIT } from '../../server/config.js';
import { analyzeHtml } from '../../server/services/sanitizer.js';
import { createRepository } from '../../server/database/repository.js';

let app;
beforeEach(() => { app = createApp({ dbPath: ':memory:', publicDemo: true, publicOrigin: 'https://demo.onrender.com', trustProxy: 1 }); });
afterEach(() => app.locals.close());

describe('public demo boundaries and disclosure', () => {
  it('reports public mode and enables HTTPS security headers', async () => {
    const response = await request(app).get('/api/health').set('Host', 'demo.onrender.com').expect(200);
    expect(response.body.data).toMatchObject({ publicDemo: true, eventLimit: 500 });
    expect(response.headers['strict-transport-security']).toContain('max-age=31536000');
    expect(response.headers['content-security-policy']).toContain('upgrade-insecure-requests');
    expect(response.headers['content-security-policy']).not.toContain('unsafe-inline');
  });
  it('accepts same-origin HTTPS writes behind the hosting proxy', async () => {
    const response = await request(app).post('/api/scan').set('Host', 'demo.onrender.com').set('Origin', 'https://demo.onrender.com')
      .set('X-Forwarded-Proto', 'https').send({ html: '<p title="demo">Public demonstration</p>' }).expect(201);
    expect(response.body.data.sanitized_content).toBe('<p>Public demonstration</p>');
  });
  it('rejects foreign hosts, origins, spoofed forwarded hosts, local writes and insecure browser origins', async () => {
    await request(app).get('/api/summary').set('Host', 'evil.example').set('X-Forwarded-Host', 'demo.onrender.com').expect(403);
    await request(app).post('/api/scan').set('Host', 'demo.onrender.com').set('Origin', 'https://evil.example').send({ html: 'sample' }).expect(403);
    await request(app).post('/api/scan').set('Host', 'demo.onrender.com').set('Origin', 'http://demo.onrender.com').send({ html: 'sample' }).expect(403);
    await request(app).post('/api/scan').send({ html: 'sample' }).expect(403);
    await request(app).post('/api/scan').set('Host', 'demo.onrender.com').set('Sec-Fetch-Site', 'cross-site').send({ html: 'sample' }).expect(403);
  });
  it('permits local health checks but not local reads of shared records', async () => {
    await request(app).get('/api/health').expect(200);
    await request(app).get('/api/events').expect(403);
  });
  it('retains only the newest 500 demo events and reports accurate retained totals', async () => {
    const result = analyzeHtml('<p>Demonstration</p>');
    for (let index = 0; index < DEMO_EVENT_LIMIT + 2; index++) app.locals.repository.addEvent(result);
    const response = await request(app).get('/api/report').set('Host', 'demo.onrender.com').expect(200);
    expect(response.body.data).toMatchObject({ publicDemo: true, summary: { total: DEMO_EVENT_LIMIT, unchanged: DEMO_EVENT_LIMIT } });
    expect(response.body.data.events).toHaveLength(100);
    expect(response.body.data.limitations.join(' ')).toMatch(/all visitors share.*500/);
    expect(app.locals.repository.getEvent(1)).toBeUndefined();
    expect(app.locals.repository.getEvent(3)).toBeDefined();
  });
  it('limits requests per forwarded client address', async () => {
    const limited = createApp({ dbPath: ':memory:', publicDemo: true, publicOrigin: 'https://demo.onrender.com', trustProxy: 1, rateLimitMax: 1 });
    try {
      const health = ip => request(limited).get('/api/health').set('Host', 'demo.onrender.com').set('X-Forwarded-For', ip);
      await health('192.0.2.1').expect(200);
      await health('192.0.2.1').expect(429);
      await health('192.0.2.2').expect(200);
    } finally { limited.locals.close(); }
  });
  it('rejects a public app without an explicit valid origin', () => {
    expect(() => createApp({ dbPath: ':memory:', publicDemo: true })).toThrow();
  });
  it('rejects invalid retention configuration before opening SQLite', () => {
    expect(() => createRepository(':memory:', { maxEvents: 0 })).toThrow();
  });
});
