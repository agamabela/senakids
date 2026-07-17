import { spawn } from "node:child_process";
const CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const PORT = 9461;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const chrome = spawn(CHROME, ["--headless=new", `--remote-debugging-port=${PORT}`, "--remote-debugging-address=127.0.0.1", `--user-data-dir=/tmp/bgv-${Date.now()}`, "--no-first-run", "--no-default-browser-check", "--disable-gpu", "--no-sandbox", "--autoplay-policy=no-user-gesture-required", "--window-size=900,800", "about:blank"]);
chrome.stderr.on("data", () => {});
let id = 0; const send = (ws, m, p = {}) => { const i = ++id; ws.send(JSON.stringify({ id: i, method: m, params: p })); return i; };
const ev = (ws, e) => { const i = send(ws, "Runtime.evaluate", { expression: e, returnByValue: true }); return new Promise((r) => { const h = (x) => { const m = JSON.parse(x.data); if (m.id === i) { ws.removeEventListener("message", h); r(m.result?.result?.value); } }; ws.addEventListener("message", h); setTimeout(() => r(undefined), 5000); }); };
async function main() {
  for (let i = 0; i < 30; i++) { try { await fetch(`http://127.0.0.1:${PORT}/json/version`); break; } catch { await sleep(500); } }
  await sleep(400);
  const tg = await (await fetch(`http://127.0.0.1:${PORT}/json`)).json();
  const ws = new WebSocket(tg.find((x) => x.type === "page").webSocketDebuggerUrl);
  await new Promise((r) => ws.addEventListener("open", r));
  send(ws, "Runtime.enable"); send(ws, "Page.enable"); await sleep(200);
  send(ws, "Page.navigate", { url: "http://localhost:3000/home" });
  await sleep(4000);
  console.log("toggle present:", await ev(ws, `!!document.querySelector('button[aria-label="Nyalakan musik"]')`));
  console.log("yt iframe present:", await ev(ws, `!!document.querySelector('iframe[src*="youtube"]')`));
  // turn it on
  await ev(ws, `(()=>{const b=document.querySelector('button[aria-label="Nyalakan musik"]');b&&b.click();})()`);
  await sleep(4000);
  console.log("now 'Matikan musik':", await ev(ws, `!!document.querySelector('button[aria-label="Matikan musik"]')`));
  // inspect the youtube iframe target: is a <video> playing?
  const tg2 = await (await fetch(`http://127.0.0.1:${PORT}/json`)).json();
  const yt = tg2.find((t) => (t.url || "").includes("youtube") && t.type === "iframe");
  if (yt) {
    const ws2 = new WebSocket(yt.webSocketDebuggerUrl);
    await new Promise((r) => ws2.addEventListener("open", r));
    send(ws2, "Runtime.enable"); await sleep(200);
    const evf = (e) => { const i = send(ws2, "Runtime.evaluate", { expression: e, returnByValue: true }); return new Promise((r) => { const h = (x) => { const m = JSON.parse(x.data); if (m.id === i) { ws2.removeEventListener("message", h); r(m.result?.result?.value); } }; ws2.addEventListener("message", h); setTimeout(() => r(undefined), 5000); }); };
    const info = await evf(`(()=>{const v=document.querySelector('video');if(!v)return 'no video';return JSON.stringify({paused:v.paused,t:Math.round(v.currentTime*10)/10,muted:v.muted,vol:v.volume});})()`);
    console.log("player video:", info);
    ws2.close();
  } else console.log("no youtube iframe target found");
  ws.close(); chrome.kill(); process.exit(0);
}
main().catch((e) => { console.error(e); chrome.kill(); process.exit(1); });
