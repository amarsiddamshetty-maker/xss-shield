import { test, expect } from '@playwright/test';
import { mkdirSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const screenshots = resolve('docs/screenshots');
mkdirSync(screenshots, { recursive: true });
let consoleErrors;
let externalRequests;

test.beforeEach(async ({ page }) => {
  consoleErrors = [];
  externalRequests = [];
  page.on('pageerror', error => consoleErrors.push(error.message));
  page.on('console', message => { if (message.type() === 'error') consoleErrors.push(message.text()); });
  page.on('request', req => { if (/^https?:/.test(req.url()) && !req.url().startsWith('http://127.0.0.1:3100/')) externalRequests.push(req.url()); });
});
test.afterEach(() => {
  expect(consoleErrors, 'no unexpected JavaScript or CSP errors').toEqual([]);
  expect(externalRequests, 'all browser requests stay on the local application').toEqual([]);
});

async function navigate(page, name) {
  await page.getByRole('navigation', { name: 'Main navigation' }).getByRole('link', { name, exact: true }).click();
}
async function runScan(page, html) {
  await page.getByLabel('HTML to analyze').fill(html);
  await page.getByRole('button', { name: 'Analyze and Sanitize' }).click();
  await expect(page.getByTestId('scan-result')).toBeVisible();
}

test('all seven navigation links work and main pages have desktop screenshots', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto('/');
  await expect(page).toHaveTitle(/Home.*XSS Shield/);
  const destinations = [
    ['Home', 'home'], ['XSS Scanner', 'scanner'], ['Learning Lab', 'learning-lab'],
    ['Real-World Demo', 'real-world-demo'], ['Protection', 'protection'], ['Dashboard', 'dashboard'], ['Activity Logs', 'activity-logs'], ['Reports', 'reports'], ['About', 'about'],
  ];
  for (const [name, file] of destinations) {
    await navigate(page, name);
    await expect(page.locator('main h1')).toBeVisible();
    await expect(page.getByRole('status')).toHaveCount(0);
    await page.screenshot({ path: resolve(screenshots, `${file}.png`), fullPage: true });
  }
});

test('scanner accepts normal text and allowed formatting with a real preview', async ({ page }) => {
  await page.goto('/#scanner');
  await runScan(page, 'A harmless college demonstration');
  await expect(page.getByTestId('scan-result')).toContainText('Safe / Unchanged');
  await runScan(page, '<p>Hello <strong>students</strong></p>');
  await expect(page.getByTestId('safe-preview').locator('strong')).toHaveText('students');
  await expect(page.getByLabel('Sanitized HTML', { exact: true })).toHaveText('<p>Hello <strong>students</strong></p>');
});

test('unsafe original remains text and disallowed elements never execute', async ({ page }) => {
  await page.goto('/#scanner');
  const html = '<p onclick="window.__xssProbe=true">Safe lesson</p><script>window.__xssProbe=true</script>';
  await runScan(page, html);
  await expect(page.getByTestId('scan-result')).toContainText('Sanitized');
  await expect(page.getByLabel('Original input', { exact: true })).toHaveText(html);
  await expect(page.getByLabel('Original input', { exact: true }).locator('script,p')).toHaveCount(0);
  await expect(page.getByTestId('safe-preview')).toHaveText('Safe lesson');
  await expect(page.getByTestId('safe-preview').locator('script,[onclick]')).toHaveCount(0);
  await page.getByTestId('safe-preview').click();
  expect(await page.evaluate(() => window.__xssProbe)).toBeUndefined();
  await page.screenshot({ path: resolve(screenshots, 'scanner.png'), fullPage: true });
});

test('normalization is separate from removals and clear resets the scanner', async ({ page }) => {
  await page.goto('/#scanner');
  await page.getByLabel('Try a harmless example').selectOption({ label: 'HTML normalization' });
  await page.getByRole('button', { name: 'Analyze and Sanitize' }).click();
  await expect(page.getByTestId('scan-result')).toContainText('Normalized');
  await page.getByRole('button', { name: 'Clear', exact: true }).click();
  await expect(page.getByLabel('HTML to analyze')).toHaveValue('');
  await expect(page.getByTestId('scan-result')).toHaveCount(0);
});

test('invalid empty and excessive input show actionable errors without logging an event', async ({ page, request }) => {
  const before = (await (await request.get('/api/summary')).json()).data.total;
  await page.goto('/#scanner');
  await page.getByRole('button', { name: 'Analyze and Sanitize' }).click();
  await expect(page.getByRole('alert')).toContainText('Invalid Input');
  await page.getByLabel('HTML to analyze').fill('a'.repeat(20001));
  await page.getByRole('button', { name: 'Analyze and Sanitize' }).click();
  await expect(page.getByRole('alert')).toContainText('20,000');
  expect((await (await request.get('/api/summary')).json()).data.total).toBe(before);
});

test('browser sanitization protects the preview even if a response contains unexpected markup', async ({ page }) => {
  await page.route('**/api/scan', async route => {
    const response = await route.fetch();
    const body = await response.json();
    body.data.sanitized_content = '<p onclick="window.__browserProbe=true">Rechecked</p><img src="/no-image" onerror="window.__browserProbe=true">';
    await route.fulfill({ response, json: body });
  });
  await page.goto('/#scanner');
  await runScan(page, 'Browser boundary test');
  await expect(page.getByTestId('safe-preview')).toHaveText('Rechecked');
  await expect(page.getByTestId('safe-preview').locator('img,[onclick]')).toHaveCount(0);
  expect(await page.evaluate(() => window.__browserProbe)).toBeUndefined();
});

test('dashboard refreshes from SQLite after a new scan', async ({ page, request }) => {
  const before = (await (await request.get('/api/summary')).json()).data.total;
  await page.goto('/#scanner');
  await runScan(page, 'Dashboard workflow record');
  await navigate(page, 'Dashboard');
  await expect(page.getByRole('status')).toHaveCount(0);
  const after = (await (await request.get('/api/summary')).json()).data;
  expect(after.total).toBe(before + 1);
  await expect(page.locator('.stat-card').filter({ hasText: 'Total scans' })).toContainText(String(after.total));
  await page.screenshot({ path: resolve(screenshots, 'dashboard.png'), fullPage: true });
});

test('activity supports search, status, UTC dates, pagination and accessible details', async ({ page, request }) => {
  for (let index = 0; index < 12; index++) {
    const response = await request.post('/api/scan', { data: { html: index % 2 ? `<p title="example">Pagination sample ${index}</p>` : `Pagination sample ${index}` } });
    expect(response.status()).toBe(201);
  }
  await page.goto('/#logs');
  await expect(page.locator('tbody tr')).toHaveCount(10);
  await page.getByRole('button', { name: 'Next', exact: true }).click();
  await expect(page.locator('.pagination')).toContainText('Page 2');
  await page.getByLabel('Search activity').fill('Pagination sample');
  await expect(page.locator('.pagination')).toContainText('12 events');
  await page.getByLabel('Scan status').selectOption('sanitized');
  await expect(page.locator('tbody tr')).toHaveCount(6);
  const today = new Date().toISOString().slice(0, 10);
  await page.getByLabel('From (UTC)').fill(today);
  await page.getByLabel('To (UTC)').fill(today);
  await expect(page.locator('tbody tr')).toHaveCount(6);
  await page.getByRole('button', { name: /View event/ }).first().click();
  await expect(page.getByRole('dialog')).toBeVisible();
  await expect(page.getByRole('dialog')).toContainText('Removed attributes');
  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog')).toHaveCount(0);
  await page.getByLabel('Search activity').fill('this-content-does-not-exist');
  await expect(page.getByText('No matching events')).toBeVisible();
  await page.getByRole('button', { name: 'Clear filters' }).click();
  await expect(page.locator('tbody tr')).toHaveCount(10);
  await page.screenshot({ path: resolve(screenshots, 'activity-logs.png'), fullPage: true });
});

test('learning laboratory provides protected and unprotected simulations for every type', async ({ page }) => {
  await page.goto('/#lab');
  for (const label of ['Stored XSS', 'Reflected XSS', 'DOM-based XSS']) {
    await page.getByRole('tab', { name: label }).click();
    await page.getByRole('checkbox').check();
    await page.getByRole('button', { name: 'Run visual simulation' }).click();
    await expect(page.getByRole('heading', { name: 'Protected path', exact: true })).toBeVisible();
    await page.getByRole('checkbox').uncheck();
    await page.getByRole('button', { name: 'Run visual simulation' }).click();
    await expect(page.getByRole('heading', { name: /Unprotected path/ })).toBeVisible();
  }
});

test('downloads a real multi-page PDF with live data, scope and page numbers', async ({ page, request }, testInfo) => {
  const response = await request.post('/api/scan', { data: { html: `<p>${'Long report content '.repeat(600)}</p>` } });
  expect(response.status()).toBe(201);
  const report = (await (await request.get('/api/report')).json()).data;
  await page.goto('/#reports');
  const downloadPromise = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Download PDF report' }).click();
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toMatch(/\.pdf$/);
  const path = testInfo.outputPath('security-report.pdf');
  await download.saveAs(path);
  const contents = readFileSync(path).toString('latin1');
  expect(contents.startsWith('%PDF-')).toBe(true);
  expect((contents.match(/\/Type \/Page\b/g) || []).length).toBeGreaterThan(1);
  expect(contents).toContain('XSS Shield');
  expect(contents).toContain('Page 1');
  expect(contents).toContain(`Total scans: ${report.summary.total}`);
  expect(contents).toContain(`Sanitized: ${report.summary.sanitized}`);
  expect(contents).toContain('Long report content');
  expect(contents).toContain('[excerpt truncated]');
  expect(contents).toContain('Security recommendations');
  expect(contents).toContain('Project scope and limitations');
  expect(contents).toContain('Validate input shape and size on the server.');
  await page.screenshot({ path: resolve(screenshots, 'reports.png'), fullPage: true });
});

test('all pages fit a mobile viewport and scanning remains usable', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  for (const hash of ['home', 'scanner', 'lab', 'demo', 'protection', 'dashboard', 'logs', 'reports', 'about']) {
    await page.goto(`/#${hash}`);
    await expect(page.locator('main h1')).toBeVisible();
    await expect(page.getByRole('status')).toHaveCount(0);
    const dimensions = await page.evaluate(() => ({ scroll: document.documentElement.scrollWidth, viewport: innerWidth }));
    expect(dimensions.scroll, `no horizontal page overflow on ${hash}`).toBeLessThanOrEqual(dimensions.viewport);
  }
  await navigate(page, 'XSS Scanner');
  await runScan(page, '<strong>Mobile preview</strong>');
  await expect(page.getByTestId('safe-preview')).toHaveText('Mobile preview');
  await page.screenshot({ path: resolve(screenshots, 'mobile.png'), fullPage: true });
});

test('real-world demo distinguishes server search, stored review and browser preview', async ({page})=>{
  await page.goto('/#demo');
  await page.getByLabel('Search products').fill('Notebook');
  const search=page.waitForResponse(r=>r.url().includes('/api/demo/search')&&r.ok());
  await page.getByRole('button',{name:'Search',exact:true}).click();
  await search;
  await expect(page.getByTestId('demo-safe-text')).toHaveText('Notebook');
  await page.getByRole('button',{name:'Customer review'}).click();
  await page.getByRole('button',{name:'Post sample review'}).click();
  await expect(page.getByText(/SQLite saved review/)).toBeVisible();
  await page.reload();
  await page.getByRole('button',{name:'Customer review'}).click();
  await page.getByRole('button',{name:'Retrieve saved reviews'}).click();
  await expect(page.getByTestId('safe-preview').first().locator('strong')).toHaveText('Excellent notebook!');
  await expect(page.getByTestId('safe-preview').first().locator('[style]')).toHaveCount(0);
  await page.getByRole('button',{name:'Live message'}).click();
  const calls=[];
  page.on('request',req=>{if(req.url().includes('/api/'))calls.push(req.url());});
  await page.getByLabel('Preview message').fill('<b>Welcome</b>');
  await expect(page.getByTestId('demo-safe-text')).toHaveText('<b>Welcome</b>');
  expect(calls).toEqual([]);
});
test('protection page explains encoding using literal text', async ({page})=>{
  await page.goto('/#protection');
  await page.getByLabel('Sample text').fill('<b>Hello</b>');
  await expect(page.getByLabel('Encoded representation')).toHaveText('&lt;b&gt;Hello&lt;/b&gt;');
  await expect(page.getByTestId('encoding-safe-text')).toHaveText('<b>Hello</b>');
  await expect(page.getByTestId('encoding-safe-text').locator('b')).toHaveCount(0);
});

test('rich review removes disallowed formatting attributes and records a real scan', async ({page,request})=>{
  const before=(await (await request.get('/api/summary')).json()).data.total;
  await page.goto('/#demo');
  await page.getByRole('button',{name:'Customer review'}).click();
  await page.getByLabel('Sample review').selectOption('styled');
  await page.getByRole('button',{name:'Post sample review'}).click();
  await expect(page.getByTestId('safe-preview').locator('strong')).toHaveText('Excellent notebook!');
  await expect(page.getByTestId('safe-preview').locator('[style]')).toHaveCount(0);
  await expect(page.getByRole('link',{name:'View actual security event'})).toBeVisible();
  expect((await (await request.get('/api/summary')).json()).data.total).toBe(before+1);
});

test('real-world illustrations track the selected sample and both DOM protections work', async ({page})=>{
  await page.goto('/#demo');
  await page.getByRole('button',{name:'Markup-like search'}).click();
  await page.getByRole('button',{name:'Search',exact:true}).click();
  await expect(page.getByTestId('unsafe-illustration').locator('b')).toHaveText('Notebook');
  await expect(page.getByTestId('demo-safe-text')).toHaveText('<b>Notebook</b>');
  await page.getByRole('button',{name:'Customer review'}).click();
  await page.getByLabel('Sample review').selectOption('list');
  await expect(page.getByTestId('unsafe-illustration').locator('li')).toHaveCount(2);
  await page.getByLabel('Sample review').selectOption('styled');
  await expect(page.getByTestId('unsafe-illustration').locator('.illustration-red')).toBeVisible();
  await page.getByRole('button',{name:'Live message'}).click();
  await page.getByRole('button',{name:'Styled rich-text sample'}).click();
  await expect(page.getByTestId('unsafe-illustration').locator('.illustration-red')).toBeVisible();
  await expect(page.getByTestId('comparison-text')).toHaveText('<p style="color:red"><strong>Excellent notebook!</strong></p>');
  await expect(page.getByTestId('safe-preview').locator('strong')).toHaveText('Excellent notebook!');
  await expect(page.getByTestId('safe-preview').locator('[style]')).toHaveCount(0);
  await page.getByLabel('Preview message').fill('Different custom message');
  await expect(page.getByTestId('unsafe-illustration')).toHaveText('Different custom message');
});
test('protection page compares text and sanitized formatting for the same input', async ({page})=>{
  await page.goto('/#protection');
  await page.getByLabel('Sample text').fill('<b>Hello</b>');
  await expect(page.getByTestId('comparison-text')).toHaveText('<b>Hello</b>');
  await expect(page.getByTestId('safe-preview').locator('b')).toHaveText('Hello');
});

test('sample verdicts explain both visible and invisible changes', async ({page})=>{
  await page.goto('/#demo');
  await page.getByRole('button',{name:'Search',exact:true}).click();
  await expect(page.getByTestId('learning-outcome')).toContainText('formatting is not interpreted');
  await page.getByRole('button',{name:'Customer review'}).click();
  await page.getByLabel('Sample review').selectOption('titled');
  await expect(page.getByTestId('unsafe-illustration').locator('p')).toHaveAttribute('title','Sample review');
  await page.getByRole('button',{name:'Post sample review'}).click();
  await expect(page.getByTestId('learning-outcome')).toContainText('tooltip removed; visible words unchanged');
  await expect(page.getByTestId('safe-preview').locator('[title]')).toHaveCount(0);
  await page.getByLabel('Sample review').selectOption('formatted');
  await page.getByRole('button',{name:'Post sample review'}).click();
  await expect(page.getByTestId('learning-outcome')).toContainText('permitted formatting preserved');
  await expect(page.getByTestId('safe-preview').locator('b')).toHaveText('Excellent notebook!');
  await page.getByLabel('Sample review').selectOption('plain');
  await page.getByRole('button',{name:'Post sample review'}).click();
  await expect(page.getByTestId('learning-outcome')).toContainText('ordinary text preserved');
});
