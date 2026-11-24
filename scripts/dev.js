import { spawn } from 'node:child_process';
import { createServer } from 'vite';

const backend = spawn(process.execPath, ['--watch', '--env-file-if-exists=.env', 'server/index.js'], { stdio: 'inherit', env: { ...process.env, NODE_ENV: 'development' } });
const frontend = await createServer({ configFile: 'client/vite.config.js' });
await frontend.listen();
frontend.printUrls();
let closing = false;
async function close() {
  if (closing) return;
  closing = true;
  backend.kill();
  await frontend.close();
}
process.on('SIGINT', close);
process.on('SIGTERM', close);
backend.on('exit', close);
