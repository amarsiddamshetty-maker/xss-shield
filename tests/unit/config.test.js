import { describe, expect, it } from 'vitest';
import { readRuntimeConfig, parsePublicOrigin } from '../../server/config.js';

describe('explicit public demonstration configuration', () => {
  it('keeps local defaults and ignores hosting variables without opt-in', () => {
    const config = readRuntimeConfig({ RENDER: 'true', RENDER_EXTERNAL_URL: 'https://demo.onrender.com' });
    expect(config).toMatchObject({ port: 3000, host: '127.0.0.1', publicDemo: false, trustProxy: false, rateLimitMax: 120 });
    expect(config.dbPath).toMatch(/xss-shield\.sqlite$/);
    expect(config.allowedOrigins).toEqual([]);
  });
  it('uses Render public URL and port only in opted-in demo mode', () => {
    expect(readRuntimeConfig({ PUBLIC_DEMO: 'true', RENDER: 'true', RENDER_EXTERNAL_URL: 'https://demo.onrender.com', PORT: '10000' })).toMatchObject({
      port: 10000, host: '0.0.0.0', publicDemo: true, publicOrigin: 'https://demo.onrender.com', trustProxy: 1,
    });
  });
  it('uses a separate demo database and explicit overrides', () => {
    const base = { PUBLIC_DEMO: 'true', PUBLIC_ORIGIN: 'https://demo.example' };
    expect(readRuntimeConfig(base).dbPath).toMatch(/public-demo\.sqlite$/);
    expect(readRuntimeConfig({ ...base, DB_PATH: ':memory:', RATE_LIMIT_MAX: '50' })).toMatchObject({ dbPath: ':memory:', rateLimitMax: 50, trustProxy: false });
  });
  it('allows a loopback-only HTTP preview for hosted-mode tests', () => {
    expect(readRuntimeConfig({ PUBLIC_DEMO: 'true', PUBLIC_ORIGIN: 'http://127.0.0.1:3101' })).toMatchObject({ host: '127.0.0.1', publicOrigin: 'http://127.0.0.1:3101' });
  });
  it('only adds Vite origins in local development', () => {
    expect(readRuntimeConfig({ NODE_ENV: 'development', PUBLIC_DEMO: 'false' }).allowedOrigins).toHaveLength(2);
    expect(readRuntimeConfig({ NODE_ENV: 'development', PUBLIC_DEMO: 'true', PUBLIC_ORIGIN: 'https://demo.example' }).allowedOrigins).toEqual([]);
  });
  it.each([undefined, 'not-a-url', 'http://demo.example', 'https://user:pass@demo.example', 'https://demo.example/path', 'https://demo.example/?query=1', 'https://demo.example/#hash', 'file:///tmp/example'])('rejects unsafe or missing origins: %s', value => {
    expect(() => parsePublicOrigin(value)).toThrow();
  });
  it('normalizes the public origin', () => expect(parsePublicOrigin('https://DEMO.example:443/')).toBe('https://demo.example'));
  it.each(['0', '-1', '65536', '1.5', 'invalid'])('rejects invalid port %s', PORT => expect(() => readRuntimeConfig({ PORT })).toThrow());
  it.each(['0', '-1', '1.5', 'invalid'])('rejects invalid rate limit %s', RATE_LIMIT_MAX => expect(() => readRuntimeConfig({ RATE_LIMIT_MAX })).toThrow());
  it('rejects a mistyped public-demo flag', () => expect(() => readRuntimeConfig({ PUBLIC_DEMO: 'yes' })).toThrow());
});
