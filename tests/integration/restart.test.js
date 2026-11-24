import { it, expect } from 'vitest';
import { spawn } from 'node:child_process';
import { once } from 'node:events';
import { createServer } from 'node:net';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { setTimeout } from 'node:timers/promises';

it('retains an API security event after the actual server process restarts', async () => {
  const directory = mkdtempSync(join(tmpdir(), 'xss-shield-restart-'));
  if (dirname(resolve(directory)) !== resolve(tmpdir())) throw new Error('Unexpected temporary path');
  const reservation = createServer();
  reservation.listen(0, '127.0.0.1');
  await once(reservation, 'listening');
  const port = reservation.address().port;
  await new Promise(resolve => reservation.close(resolve));
  const base = `http://127.0.0.1:${port}`;
  let child;
  async function start() {
    child = spawn(process.execPath, ['server/index.js'], {
      cwd: process.cwd(), windowsHide: true,
      env: { ...process.env, PORT: String(port), DB_PATH: join(directory, 'events.sqlite'), PUBLIC_DEMO: 'false' },
      stdio: 'ignore',
    });
    for (let attempt = 0; attempt < 50; attempt++) {
      if (child.exitCode !== null) throw new Error('Server stopped before becoming healthy');
      try { if ((await fetch(`${base}/api/health`)).ok) return; } catch { /* Startup is asynchronous. */ }
      await setTimeout(100);
    }
    throw new Error('Local server readiness timed out');
  }
  async function stop() {
    if (child && child.exitCode === null) {
      const exited = once(child, 'exit');
      child.kill();
      await exited;
    }
  }
  try {
    await start();
    const response = await fetch(`${base}/api/scan`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ html: '<p title="remove">Restart demonstration</p>' }) });
    expect(response.status).toBe(201);
    const event = (await response.json()).data;
    await stop();
    await start();
    const restored = await fetch(`${base}/api/events/${event.id}`);
    expect(restored.status).toBe(200);
    expect((await restored.json()).data).toEqual(event);
    expect((await (await fetch(`${base}/api/summary`)).json()).data.total).toBe(1);
  } finally {
    await stop();
    rmSync(directory, { recursive: true, force: true });
  }
}, 15000);
