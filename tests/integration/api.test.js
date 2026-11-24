import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import request from 'supertest';
import { createApp } from '../../server/app.js';

let app;
beforeEach(() => { app = createApp({ dbPath: ':memory:' }); });
afterEach(() => app.locals.close());
const scan = html => request(app).post('/api/scan').send({ html });

describe('REST API and security boundaries', () => {
  it('reports healthy database and restrictive security headers', async () => {
    const response = await request(app).get('/api/health').expect(200);
    expect(response.body.data).toMatchObject({ status: 'ok', storage: 'sqlite' });
    expect(response.headers['content-security-policy']).toContain("script-src 'self'");
    expect(response.headers['content-security-policy']).not.toContain('unsafe-inline');
    expect(response.headers['x-content-type-options']).toBe('nosniff');
    expect(response.headers['cache-control']).toBe('no-store');
    expect(response.headers['x-powered-by']).toBeUndefined();
  });
  it('sanitizes, persists and retrieves an event without raw input', async () => {
    const response = await scan('<p title="private-marker">Hello</p>').expect(201);
    const event = response.body.data;
    expect(event).toMatchObject({ status: 'sanitized', sanitized_content: '<p>Hello</p>', removed_attributes: 1 });
    expect(JSON.stringify(event)).not.toContain('private-marker');
    const stored = await request(app).get(`/api/events/${event.id}`).expect(200);
    expect(stored.body.data).toEqual(event);
    const all = await request(app).get('/api/events').expect(200);
    expect(all.body.data.total).toBe(1);
    expect(all.body.data.items).toEqual([event]);
  });
  it('uses real totals for summaries and reports', async () => {
    await scan('Plain'); await scan('<P>Normalized'); await scan('<p title="x">Changed</p>');
    const { body } = await request(app).get('/api/summary').expect(200);
    expect(body.data).toMatchObject({ total: 3, unchanged: 1, sanitized: 1, normalized: 1, removed_count: 1, removed_attributes: 1 });
    expect(body.data.daily).toHaveLength(7);
    expect(body.data.daily.reduce((sum, day) => sum + day.count, 0)).toBe(3);
    const report = (await request(app).get('/api/report').expect(200)).body.data;
    expect(report.summary.total).toBe(3);
    expect(report.events).toHaveLength(3);
    expect(Number.isNaN(Date.parse(report.generated_at))).toBe(false);
    expect(report.limitations.length).toBeGreaterThan(0);
    expect(report.recommendations.length).toBeGreaterThan(0);
  });
  it('filters content, status and UTC dates with paginated newest-first results', async () => {
    await scan('Alpha'); await scan('Beta'); await scan('<p title="x">Alpha</p>');
    const today = new Date().toISOString().slice(0, 10);
    const filtered = await request(app).get('/api/events').query({ search: 'Alpha', status: 'sanitized', from: today, to: today }).expect(200);
    expect(filtered.body.data.total).toBe(1);
    expect(filtered.body.data.items[0].sanitized_content).toBe('<p>Alpha</p>');
    const paged = await request(app).get('/api/events?page=2&pageSize=1').expect(200);
    expect(paged.body.data).toMatchObject({ total: 3, page: 2, pageSize: 1, totalPages: 3 });
    expect(paged.body.data.items[0].sanitized_content).toBe('Beta');
    const empty = await request(app).get('/api/events?to=2000-01-01').expect(200);
    expect(empty.body.data.items).toEqual([]);
  });
  it('treats SQL-like searches and LIKE wildcards as literal values', async () => {
    await scan('ordinary'); await scan('100% done');
    const wildcard = await request(app).get('/api/events').query({ search: '%' }).expect(200);
    expect(wildcard.body.data.total).toBe(1);
    const malicious = await request(app).get('/api/events').query({ search: "' OR 1=1 --" }).expect(200);
    expect(malicious.body.data.total).toBe(0);
  });
  it.each([{}, { html: '' }, { html: 2 }, { html: null }, { html: [] }, [], { html: 'ok', extra: true }])('rejects malformed scan bodies %j', async body => {
    const response = await request(app).post('/api/scan').send(body).expect(400);
    expect(response.body.error.code).toBe('INVALID_INPUT');
    expect((await request(app).get('/api/summary')).body.data.total).toBe(0);
  });
  it('rejects excessive input and request body sizes', async () => {
    await scan('a'.repeat(20001)).expect(413);
    await scan('a'.repeat(140000)).expect(413);
  });
  it('accepts the maximum multibyte input within the transport limit', async () => {
    await scan('学'.repeat(20000)).expect(201);
  });
  it('rejects malformed JSON, wrong content type and unsupported charset', async () => {
    await request(app).post('/api/scan').set('Content-Type', 'application/json').send('{broken').expect(400);
    await request(app).post('/api/scan').type('text').send('plain').expect(415);
    await request(app).post('/api/scan').set('Content-Type', 'application/json; charset=ascii').send('{}').expect(415);
  });
  it.each([
    { page: '0' }, { page: '1.5' }, { page: '1000001' }, { page: '9007199254740992' },
    { pageSize: '101' }, { status: 'attack' }, { search: 'a'.repeat(201) },
    { from: 'today' }, { from: '2026-02-30' }, { to: '2026-99-99' },
    { from: '2026-02-02', to: '2026-01-01' },
  ])('rejects invalid query %j', async query => {
    const response = await request(app).get('/api/events').query(query).expect(400);
    expect(response.body.error.code).toBe('INVALID_QUERY');
  });
  it('rejects duplicated query values instead of coercing arrays', async () => {
    await request(app).get('/api/events?page=1&page=2').expect(400);
    await request(app).get('/api/events?search=x&search=y').expect(400);
    await request(app).get('/api/events?from=2026-01-01&from=2026-02-01').expect(400);
  });
  it('handles missing events, invalid IDs and unknown API paths', async () => {
    await request(app).get('/api/events/999').expect(404);
    await request(app).get('/api/events/not-a-number').expect(400);
    const response = await request(app).get('/api/missing').expect(404);
    expect(response.body.error.code).toBe('NOT_FOUND');
  });
  it('rejects foreign Host and cross-origin writes', async () => {
    await request(app).get('/api/health').set('Host', 'example.com').expect(403);
    await request(app).get('/api/health').set('Host', 'user@localhost').expect(403);
    await request(app).post('/api/scan').set('Origin', 'https://example.com').send({ html: 'demo' }).expect(403);
    await request(app).post('/api/scan').set('Sec-Fetch-Site', 'cross-site').send({ html: 'demo' }).expect(403);
  });
  it('accepts same-origin browser writes', async () => {
    await request(app).post('/api/scan').set('Host', 'localhost:3000').set('Origin', 'http://localhost:3000').send({ html: 'demo' }).expect(201);
  });
  it('enforces the request rate limit', async () => {
    const limited = createApp({ dbPath: ':memory:', rateLimitMax: 2 });
    try {
      await request(limited).get('/api/health').expect(200);
      await request(limited).get('/api/health').expect(200);
      const response = await request(limited).get('/api/health').expect(429);
      expect(response.body.error.code).toBe('RATE_LIMITED');
      expect(response.headers['ratelimit']).toBeTruthy();
    } finally { limited.locals.close(); }
  });
  it('returns a generic response on an internal database failure', async () => {
    const broken = createApp({ dbPath: ':memory:' });
    broken.locals.close();
    const response = await request(broken).get('/api/health').expect(500);
    expect(response.body).toEqual({ error: { code: 'INTERNAL_ERROR', message: 'The request could not be completed. Please try again.' } });
  });
  it('explains a missing frontend build', async () => {
    const unbuilt = createApp({ dbPath: ':memory:', staticDir: 'nonexistent-test-build' });
    try { expect((await request(unbuilt).get('/').expect(503)).text).toContain('npm run build'); }
    finally { unbuilt.locals.close(); }
  });
});
