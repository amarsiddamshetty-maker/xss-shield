// Hosted behavior is tested on loopback only, with an independent in-memory DB.
process.env.PORT = '3101';
process.env.PUBLIC_DEMO = 'true';
process.env.PUBLIC_ORIGIN = 'http://127.0.0.1:3101';
process.env.DB_PATH = ':memory:';
process.env.NODE_ENV = 'test';
process.env.RENDER = 'false';
await import('../server/index.js');
