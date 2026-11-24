import { createApp } from './app.js';
import { readRuntimeConfig } from './config.js';

const config = readRuntimeConfig();
const { port, host, publicDemo, publicOrigin } = config;
const app = createApp(config);
const server = app.listen(port, host, () => {
  console.log(`XSS Shield is running at ${publicDemo ? publicOrigin : `http://localhost:${port}`} (${publicDemo ? 'public demo; shared temporary history' : 'loopback only'})`);
});
server.on('error', error => {
  console.error(error.code === 'EADDRINUSE' ? `Port ${port} is occupied. Set PORT to an available local port.` : 'Unable to start the local server.');
  app.locals.close();
  process.exitCode = 1;
});
for (const signal of ['SIGINT', 'SIGTERM']) {
  process.on(signal, () => server.close(() => { app.locals.close(); process.exit(0); }));
}
