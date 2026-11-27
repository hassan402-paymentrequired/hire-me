// Render every canvas artboard (.dc.html) to a full-page PNG with headless Chrome over CDP.
// Usage: node render-designs.mjs <baseUrl> <canvas.json> <outDir>
import { spawn } from 'node:child_process';
import { mkdirSync, mkdtempSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const [, , BASE, canvasPath, OUT] = process.argv;
const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const PORT = 9334;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const canvas = JSON.parse(readFileSync(canvasPath, 'utf8'));

const chrome = spawn(CHROME, ['--headless=new', `--remote-debugging-port=${PORT}`, '--hide-scrollbars', '--no-first-run', `--user-data-dir=${mkdtempSync(join(tmpdir(), 'dc-'))}`, 'about:blank']);
await sleep(2500);
const page = (await (await fetch(`http://127.0.0.1:${PORT}/json`)).json()).find((t) => t.type === 'page');
const ws = new WebSocket(page.webSocketDebuggerUrl);
await new Promise((r) => ws.addEventListener('open', r));
let seq = 0;
const waiting = new Map();
ws.addEventListener('message', (e) => {
    const m = JSON.parse(e.data);
    if (m.id && waiting.has(m.id)) { waiting.get(m.id)(m.result ?? m.error); waiting.delete(m.id); }
});
const send = (method, params = {}) => new Promise((r) => { seq += 1; waiting.set(seq, r); ws.send(JSON.stringify({ id: seq, method, params })); });
const run = (expression) => send('Runtime.evaluate', { expression, awaitPromise: true, returnByValue: true });
await send('Page.enable');

async function capture(file, name, w, h, clicks = []) {
    await send('Emulation.setDeviceMetricsOverride', { width: w, height: Math.min(h, 1200), deviceScaleFactor: 1, mobile: w < 500 });
    await send('Page.navigate', { url: `${BASE}/screens/${file}` });
    await sleep(4500);
    for (const text of clicks) {
        await run(`(() => { const el = [...document.querySelectorAll('button, a')].find((b) => b.textContent.trim().startsWith(${JSON.stringify(text)})); el && el.click(); })()`);
        await sleep(900);
    }
    const { cssContentSize } = await send('Page.getLayoutMetrics');
    const height = Math.max(Math.ceil(cssContentSize.height), Math.min(h, 1200));
    const { data } = await send('Page.captureScreenshot', { format: 'png', captureBeyondViewport: true, clip: { x: 0, y: 0, width: w, height: Math.min(height, 14000), scale: 1 } });
    writeFileSync(join(OUT, `${name}.png`), Buffer.from(data, 'base64'));
    console.log('rendered', name);
}

mkdirSync(OUT, { recursive: true });
for (const file of canvas.order) {
    const board = canvas.boards[file];
    await capture(file, file.replace('.dc.html', ''), board.w, board.h);
}

// Extra interactive states worth having as references
const extras = [
    ['Booking.dc.html', 'Booking--page-2', ['2']],
    ['Booking.dc.html', 'Booking--done', ['Continue', 'Continue', 'Confirm and pay']],
    ['Bookings.dc.html', 'Bookings--past-tab', ['Past']],
    ['Bookings.dc.html', 'Bookings--cancelled-tab', ['Cancelled']],
    ['BookingDetail.dc.html', 'BookingDetail--cancel-dialog', ['Cancel booking']],
    ['BookingDetail.dc.html', 'BookingDetail--cancelled', ['Cancel booking', 'Yes, cancel']],
    ['Settings.dc.html', 'Settings--addresses', ['Addresses']],
    ['Settings.dc.html', 'Settings--security', ['Security']],
    ['Settings.dc.html', 'Settings--notifications', ['Notifications']],
    ['Legal.dc.html', 'Legal--terms', ['Terms & conditions']],
    ['Notifications.dc.html', 'Notifications--all-read', ['Mark all as read']],
];
for (const [file, name, clicks] of extras) {
    const board = canvas.boards[file];
    await capture(file, name, board.w, board.h, clicks);
}

ws.close();
chrome.kill();
