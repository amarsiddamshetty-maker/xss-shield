import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

// Every browser run gets its own database; demonstration records are never touched.
const directory = mkdtempSync(join(tmpdir(), 'xss-shield-e2e-'));
process.env.PORT = '3100';
process.env.DB_PATH = join(directory, 'events.sqlite');
process.env.NODE_ENV = 'test';
process.env.PUBLIC_DEMO = 'false';
await import('../server/index.js');
process.on('exit', () => {
  try { rmSync(directory, { recursive: true, force: true }); } catch { /* Windows may still hold a closed SQLite handle. */ }
});
