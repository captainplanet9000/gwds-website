import fs from "node:fs/promises";
import path from "node:path";
import { createHash } from "node:crypto";
import sharp from "sharp";

const repo = process.cwd();
const root = path.join(repo, "streaming", "cival-obs-transparent-overlays-v1");
const editable = path.join(root, "editable-svg");
const assets = [];
const C = { black: "#06110e", deep: "#0b1f19", mint: "#4ade9f", signal: "#7fffc8", circuit: "#174d3b", gray: "#9eaaa5", white: "#effff7" };

const esc = (value) => String(value).replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;");
const mkdir = (dir) => fs.mkdir(dir, { recursive: true });

function svg(width, height, body) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}"><defs><filter id="g" x="-80%" y="-80%" width="260%" height="260%"><feGaussianBlur stdDeviation="6" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter><filter id="s" x="-30%" y="-30%" width="160%" height="160%"><feDropShadow dx="0" dy="10" stdDeviation="14" flood-color="#000" flood-opacity=".55"/></filter><linearGradient id="p" x1="0" y1="0" x2="1" y2="1"><stop stop-color="${C.deep}" stop-opacity=".95"/><stop offset="1" stop-color="${C.black}" stop-opacity=".78"/></linearGradient></defs>${body}</svg>`;
}

function corners(width, height, inset = 24, length = 92) {
  return `<g fill="none" stroke="${C.mint}" stroke-width="2"><path d="M${inset} ${inset + length}V${inset}H${inset + length}"/><path d="M${width - inset - length} ${inset}H${width - inset}V${inset + length}"/><path d="M${inset} ${height - inset - length}V${height - inset}H${inset + length}"/><path d="M${width - inset - length} ${height - inset}H${width - inset}V${height - inset - length}"/></g>`;
}

function brand(x, y, scale = 1, withTagline = true) {
  const z = 52 * scale;
  return `<g transform="translate(${x} ${y})"><rect width="${z}" height="${z}" rx="${10 * scale}" fill="${C.black}" fill-opacity=".9" stroke="${C.circuit}" stroke-width="2"/><path d="M${z * .68} ${z * .31}c-${z * .07}-${z * .1}-${z * .17}-${z * .14}-${z * .28}-${z * .14}-${z * .23} 0-${z * .36} ${z * .19}-${z * .36} ${z * .48}s${z * .13} ${z * .48} ${z * .36} ${z * .48}c${z * .12} 0 ${z * .22}-${z * .05} ${z * .29}-${z * .15}" fill="none" stroke="${C.mint}" stroke-width="${z * .11}" stroke-linecap="round"/><text x="${z + 18 * scale}" y="${21 * scale}" fill="${C.white}" font-family="Arial,Helvetica,sans-serif" font-size="${15 * scale}" font-weight="700" letter-spacing="${3 * scale}">CIVAL SYSTEMS</text>${withTagline ? `<text x="${z + 18 * scale}" y="${41 * scale}" fill="${C.gray}" font-family="Consolas,monospace" font-size="${8 * scale}" letter-spacing="${2 * scale}">TRADING SYSTEMS, SHIPPED AS SOURCE</text>` : ""}</g>`;
}

function pill(x, y, label = "PAPER MODE / LIVE BUILD", width = 300) {
  return `<g transform="translate(${x} ${y})"><rect width="${width}" height="38" rx="19" fill="${C.black}" fill-opacity=".82" stroke="${C.mint}" stroke-opacity=".6"/><circle cx="20" cy="19" r="4" fill="${C.mint}" filter="url(#g)"/><text x="36" y="24" fill="${C.mint}" font-family="Consolas,monospace" font-size="11" font-weight="700" letter-spacing="1.6">${esc(label)}</text></g>`;
}

function footer(label = "CIVAL SYSTEMS IN ACTION", right = "DEMO ENVIRONMENT · NOT FINANCIAL ADVICE") {
  return `<g transform="translate(38 1018)"><rect width="1844" height="36" rx="18" fill="${C.black}" fill-opacity=".78" stroke="${C.circuit}"/><circle cx="22" cy="18" r="4" fill="${C.mint}"/><text x="38" y="23" fill="${C.white}" font-family="Consolas,monospace" font-size="11" font-weight="700" letter-spacing="1.5">${esc(label)}</text><text x="1808" y="23" text-anchor="end" fill="${C.gray}" font-family="Consolas,monospace" font-size="10" letter-spacing="1.3">${esc(right)}</text></g>`;
}

function frame(x, y, width, height, label = "", fillOpacity = 0) {
  const tag = label ? `<g transform="translate(${x + 18} ${y + height - 28})"><rect width="${Math.max(154, label.length * 10 + 38)}" height="28" rx="14" fill="${C.black}" fill-opacity=".9" stroke="${C.circuit}"/><text x="18" y="18" fill="${C.mint}" font-family="Consolas,monospace" font-size="9" font-weight="700" letter-spacing="1.3">${esc(label)}</text></g>` : "";
  return `<g filter="url(#s)"><rect x="${x}" y="${y}" width="${width}" height="${height}" rx="16" fill="${C.black}" fill-opacity="${fillOpacity}" stroke="${C.circuit}" stroke-width="2"/><path d="M${x} ${y + 54}V${y}H${x + 54}M${x + width - 54} ${y}H${x + width}V${y + 54}M${x} ${y + height - 54}V${y + height}H${x + 54}M${x + width - 54} ${y + height}H${x + width}V${y + height - 54}" fill="none" stroke="${C.mint}" stroke-width="3"/>${tag}</g>`;
}

async function output(relative, width, height, body) {
  const png = path.join(root, relative);
  const source = path.join(editable, relative.replace(/\.png$/i, ".svg"));
  await Promise.all([mkdir(path.dirname(png)), mkdir(path.dirname(source))]);
  const markup = svg(width, height, body);
  await Promise.all([
    sharp(Buffer.from(markup), { density: 144 }).resize(width, height).png({ compressionLevel: 9, adaptiveFiltering: true }).toFile(png),
    fs.writeFile(source, markup),
  ]);
  assets.push({ path: relative.replaceAll("\\", "/"), editable: path.relative(root, source).replaceAll("\\", "/"), width, height, transparent: true });
}

async function main() {
  await Promise.all(["full-canvas", "desktop", "mobile", "modules", "frames", "lower-thirds", "alerts", "browser-source", "previews", "editable-svg"].map((dir) => mkdir(path.join(root, dir))));

  const full = [
    ["01-minimal-corners-1920x1080.png", corners(1920, 1080)],
    ["02-status-footer-1920x1080.png", `${corners(1920, 1080)}${pill(1592, 34)}${footer()}`],
    ["03-product-webcam-1920x1080.png", `${corners(1920, 1080)}${pill(1592, 34)}${frame(1434, 738, 426, 240, "SYSTEM OPERATOR")}${footer()}`],
    ["04-product-chat-1920x1080.png", `${corners(1920, 1080)}${pill(1592, 34)}${frame(40, 126, 1400, 790)}${frame(1470, 126, 390, 790, "LIVE CHAT", .78)}${footer()}`],
    ["05-product-webcam-chat-1920x1080.png", `${corners(1920, 1080)}${pill(1592, 34)}${frame(40, 126, 1400, 790)}${frame(1470, 126, 390, 470, "LIVE CHAT", .78)}${frame(1470, 622, 390, 219, "SYSTEM OPERATOR")}${footer()}`],
    ["06-brand-clean-1920x1080.png", `${corners(1920, 1080)}${brand(42, 34, .84)}${pill(1592, 34)}${footer()}`],
    ["07-just-chatting-1920x1080.png", `${corners(1920, 1080)}${brand(52, 38, .9)}${pill(1592, 42, "SYSTEMS DEEP DIVE", 268)}${frame(62, 132, 1216, 792)}${frame(1320, 132, 538, 792, "SESSION MAP", .88)}${footer("CIVALSYSTEMS.COM", "ASK QUESTIONS IN CHAT")}`],
    ["08-vertical-camera-1080x1920.png", `${corners(1080, 1920, 28, 94)}${brand(52, 48, .88)}${pill(688, 52, "LIVE / PAPER MODE", 304)}${frame(64, 286, 952, 1188, "SYSTEM OPERATOR")}${pill(64, 1520, "CIVALSYSTEMS.COM", 270)}<text x="64" y="1810" fill="${C.gray}" font-family="Consolas,monospace" font-size="14" letter-spacing="1.4">DEMO ENVIRONMENT · NOT FINANCIAL ADVICE</text>`],
  ];
  for (const [name, body] of full) {
    const width = name.includes("vertical") ? 1080 : 1920;
    const height = name.includes("vertical") ? 1920 : 1080;
    await output(path.join("full-canvas", name), width, height, body);
    if (!name.includes("vertical")) await output(path.join("desktop", name), width, height, body);
  }

  const mobileFooter = (left = "CIVAL SYSTEMS IN ACTION", right = "DEMO · NOT FINANCIAL ADVICE") => `<g transform="translate(40 1842)"><rect width="1000" height="42" rx="21" fill="${C.black}" fill-opacity=".8" stroke="${C.circuit}"/><circle cx="22" cy="21" r="4" fill="${C.mint}"/><text x="40" y="26" fill="${C.white}" font-family="Consolas,monospace" font-size="10" font-weight="700" letter-spacing="1.2">${esc(left)}</text><text x="968" y="26" text-anchor="end" fill="${C.gray}" font-family="Consolas,monospace" font-size="8" letter-spacing=".9">${esc(right)}</text></g>`;
  const mobileHeader = (status = "PAPER MODE / LIVE") => `${brand(40, 48, .82, false)}${pill(720, 54, status, 320)}`;
  const mobile = [
    ["01-minimal-corners-1080x1920.png", corners(1080, 1920, 28, 96)],
    ["02-status-footer-1080x1920.png", `${corners(1080, 1920, 28, 96)}${mobileHeader()}${mobileFooter()}`],
    ["03-product-camera-1080x1920.png", `${corners(1080, 1920, 28, 96)}${mobileHeader()}${frame(40, 230, 1000, 562, "PRODUCT CAPTURE")}${frame(210, 890, 830, 467, "SYSTEM OPERATOR")}${mobileFooter()}`],
    ["04-product-chat-1080x1920.png", `${corners(1080, 1920, 28, 96)}${mobileHeader()}${frame(40, 230, 1000, 562, "PRODUCT CAPTURE")}${frame(40, 850, 1000, 850, "LIVE CHAT", .78)}${mobileFooter()}`],
    ["05-product-camera-chat-1080x1920.png", `${corners(1080, 1920, 28, 96)}${mobileHeader()}${frame(40, 230, 1000, 562, "PRODUCT CAPTURE")}${frame(40, 850, 480, 270, "SYSTEM OPERATOR")}${frame(550, 850, 490, 850, "LIVE CHAT", .78)}${mobileFooter()}`],
    ["06-just-chatting-1080x1920.png", `${corners(1080, 1920, 28, 96)}${mobileHeader("SYSTEMS DEEP DIVE")}${frame(40, 230, 1000, 1120, "SYSTEM OPERATOR")}${frame(40, 1400, 1000, 300, "SESSION MAP", .82)}${mobileFooter("CIVALSYSTEMS.COM", "ASK QUESTIONS IN CHAT")}`],
    ["07-brand-clean-1080x1920.png", `${corners(1080, 1920, 28, 96)}${mobileHeader()}${frame(40, 230, 1000, 1470)}${mobileFooter()}`],
  ];
  for (const [name, body] of mobile) await output(path.join("mobile", name), 1080, 1920, body);

  await output("modules/brand-bug-480x96.png", 480, 96, brand(12, 12, 1.25));
  await output("modules/corner-rails-1920x1080.png", 1920, 1080, corners(1920, 1080));
  await output("modules/status-paper-live-340x50.png", 340, 50, pill(0, 6, "PAPER MODE / LIVE BUILD", 336));
  await output("modules/status-paper-locked-340x50.png", 340, 50, pill(0, 6, "PAPER MODE / LOCKED", 336));
  await output("modules/status-blank-340x50.png", 340, 50, `<g transform="translate(0 6)"><rect width="336" height="38" rx="19" fill="${C.black}" fill-opacity=".82" stroke="${C.mint}" stroke-opacity=".6"/><circle cx="20" cy="19" r="4" fill="${C.mint}" filter="url(#g)"/></g>`);
  await output("modules/footer-disclaimer-1920x60.png", 1920, 60, `<g transform="translate(38 12)"><rect width="1844" height="36" rx="18" fill="${C.black}" fill-opacity=".78" stroke="${C.circuit}"/><circle cx="22" cy="18" r="4" fill="${C.mint}"/><text x="38" y="23" fill="${C.white}" font-family="Consolas,monospace" font-size="11" font-weight="700" letter-spacing="1.5">CIVAL SYSTEMS IN ACTION</text><text x="1808" y="23" text-anchor="end" fill="${C.gray}" font-family="Consolas,monospace" font-size="10" letter-spacing="1.3">DEMO ENVIRONMENT · NOT FINANCIAL ADVICE</text></g>`);
  await output("modules/footer-blank-1920x60.png", 1920, 60, `<g transform="translate(38 12)"><rect width="1844" height="36" rx="18" fill="${C.black}" fill-opacity=".78" stroke="${C.circuit}"/><circle cx="22" cy="18" r="4" fill="${C.mint}"/></g>`);

  const frames = [["webcam-16x9-640x360.png", 640, 360, "SYSTEM OPERATOR"], ["webcam-16x9-960x540.png", 960, 540, "SYSTEM OPERATOR"], ["webcam-square-720x720.png", 720, 720, "SYSTEM OPERATOR"], ["webcam-portrait-608x1080.png", 608, 1080, "SYSTEM OPERATOR"], ["chat-420x860.png", 420, 860, "LIVE CHAT"]];
  for (const [name, width, height, label] of frames) await output(path.join("frames", name), width, height, frame(14, 14, width - 28, height - 28, label, label === "LIVE CHAT" ? .78 : 0));

  const lower = `<g transform="translate(20 20)" filter="url(#s)"><path d="M0 0h820l88 80-88 80H0z" fill="url(#p)" stroke="${C.circuit}" stroke-width="2"/><rect width="8" height="160" fill="${C.mint}"/><circle cx="48" cy="50" r="8" fill="${C.mint}"/><line x1="78" y1="52" x2="720" y2="52" stroke="${C.circuit}"/><line x1="40" y1="112" x2="610" y2="112" stroke="${C.circuit}"/></g>`;
  await output("lower-thirds/lower-third-blank-1000x200.png", 1000, 200, lower);
  await output("lower-thirds/lower-third-cival-1000x200.png", 1000, 200, `${lower}<text x="60" y="78" fill="${C.mint}" font-family="Consolas,monospace" font-size="12" font-weight="700" letter-spacing="2.5">CIVAL SYSTEMS</text><text x="60" y="132" fill="${C.white}" font-family="Arial,Helvetica,sans-serif" font-size="28" font-weight="700">TRADING SYSTEMS, SHIPPED AS SOURCE</text>`);

  const alert = `<g transform="translate(20 20)" filter="url(#s)"><path d="M0 0h610l70 70-70 70H0z" fill="url(#p)" stroke="${C.circuit}" stroke-width="2"/><rect width="8" height="140" fill="${C.mint}"/><circle cx="74" cy="70" r="29" fill="none" stroke="${C.mint}" stroke-width="2"/><circle cx="74" cy="70" r="7" fill="${C.signal}" filter="url(#g)"/><line x1="126" y1="50" x2="560" y2="50" stroke="${C.circuit}"/><line x1="126" y1="92" x2="510" y2="92" stroke="${C.circuit}"/></g>`;
  await output("alerts/alert-blank-740x180.png", 740, 180, alert);
  for (const [name, label] of [["follow", "NEW FOLLOWER"], ["subscriber", "NEW SUBSCRIBER"], ["raid", "RAID INBOUND"], ["support", "SUPPORT RECEIVED"]]) await output(`alerts/alert-${name}-740x180.png`, 740, 180, `${alert}<text x="146" y="62" fill="${C.mint}" font-family="Consolas,monospace" font-size="12" font-weight="700" letter-spacing="2.2">${esc(label)}</text>`);

  const html = `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Cival OBS Overlay</title><style>:root{--a:#4ade9f;--b:#174d3b;--bg:#06110ecc;--fg:#effff7;--muted:#9eaaa5}*{box-sizing:border-box}html,body{margin:0;width:100%;height:100%;overflow:hidden;background:transparent;font-family:Arial,Helvetica,sans-serif}.o{position:relative;width:100vw;height:100vh;color:var(--fg)}.c{position:absolute;width:5vw;height:5vw;border-color:var(--a);border-style:solid}.tl{left:1.25vw;top:2.2vh;border-width:2px 0 0 2px}.tr{right:1.25vw;top:2.2vh;border-width:2px 2px 0 0}.bl{left:1.25vw;bottom:2.2vh;border-width:0 0 2px 2px}.br{right:1.25vw;bottom:2.2vh;border-width:0 2px 2px 0}.status{position:absolute;right:1.8vw;top:3vh;padding:.7rem 1.35rem;border:1px solid var(--a);border-radius:999px;background:var(--bg);color:var(--a);font:700 .72rem Consolas,monospace;letter-spacing:.14em}.status:before{content:'';display:inline-block;width:.45rem;height:.45rem;margin-right:.7rem;border-radius:50%;background:var(--a);box-shadow:0 0 12px var(--a)}.foot{position:absolute;left:2vw;right:2vw;bottom:2.4vh;height:2.2rem;border:1px solid var(--b);border-radius:999px;background:var(--bg);display:flex;align-items:center;justify-content:space-between;padding:0 1rem;font:700 .65rem Consolas,monospace;letter-spacing:.12em}.foot span:last-child{color:var(--muted);font-weight:400}.cam,.chat{display:none;position:absolute;border:2px solid var(--a);border-radius:16px;box-shadow:0 14px 38px #0008}.cam{right:3.1vw;bottom:9.2vh;width:22.2vw;aspect-ratio:16/9}.chat{right:3.1vw;top:11.6vh;width:20.3vw;height:72.8vh;border-color:var(--b);background:#06110ed9}.camera .cam,.camera-chat .cam,.chat-mode .chat,.camera-chat .chat{display:block}.camera-chat .cam{bottom:9.2vh}.camera-chat .chat{height:43vh}</style></head><body><div id="overlay" class="o"><i class="c tl"></i><i class="c tr"></i><i class="c bl"></i><i class="c br"></i><div class="status" id="status"></div><div class="cam"></div><div class="chat"></div><div class="foot"><span id="left"></span><span id="right"></span></div></div><script>const q=new URLSearchParams(location.search),o=document.getElementById('overlay');o.classList.add(q.get('mode')||'clean');document.documentElement.style.setProperty('--a',q.get('accent')||'#4ade9f');document.getElementById('status').textContent=q.get('status')||'PAPER MODE / LIVE BUILD';document.getElementById('left').textContent=q.get('left')||'CIVAL SYSTEMS IN ACTION';document.getElementById('right').textContent=q.get('right')||'DEMO ENVIRONMENT · NOT FINANCIAL ADVICE';</script></body></html>`;
  await fs.writeFile(path.join(root, "browser-source", "cival-overlay.html"), html);

  for (const asset of assets) {
    const full = path.join(root, asset.path);
    const data = await fs.readFile(full);
    const meta = await sharp(data).metadata();
    if (!meta.hasAlpha) throw new Error(`${asset.path} is missing alpha transparency`);
    asset.bytes = data.length;
    asset.sha256 = createHash("sha256").update(data).digest("hex");
  }
  await fs.writeFile(path.join(root, "manifest.json"), `${JSON.stringify({ package: "Cival OBS Transparent Overlays", version: "1.0.0", assets }, null, 2)}\n`);

  const checker = Buffer.from(svg(1920, 1080, `<defs><pattern id="q" width="80" height="80" patternUnits="userSpaceOnUse"><rect width="80" height="80" fill="#222b28"/><rect width="40" height="40" fill="#303a36"/><rect x="40" y="40" width="40" height="40" fill="#303a36"/></pattern></defs><rect width="1920" height="1080" fill="url(#q)"/><text x="960" y="540" text-anchor="middle" fill="#9eaaa5" font-family="Consolas,monospace" font-size="28" letter-spacing="4">TRANSPARENT CAPTURE AREA</text>`));
  const previewOverlay = path.join(root, "full-canvas", "05-product-webcam-chat-1920x1080.png");
  await sharp(checker).composite([{ input: previewOverlay }]).png({ compressionLevel: 9 }).toFile(path.join(root, "previews", "alpha-proof-webcam-chat.png"));
  const mobileChecker = Buffer.from(svg(1080, 1920, `<defs><pattern id="q" width="80" height="80" patternUnits="userSpaceOnUse"><rect width="80" height="80" fill="#222b28"/><rect width="40" height="40" fill="#303a36"/><rect x="40" y="40" width="40" height="40" fill="#303a36"/></pattern></defs><rect width="1080" height="1920" fill="url(#q)"/><text x="540" y="960" text-anchor="middle" fill="#9eaaa5" font-family="Consolas,monospace" font-size="24" letter-spacing="3">TRANSPARENT CAPTURE AREA</text>`));
  const mobileOverlay = path.join(root, "mobile", "05-product-camera-chat-1080x1920.png");
  const mobileProof = await sharp(mobileChecker).composite([{ input: mobileOverlay }]).resize(405, 720).png().toBuffer();
  const desktopProof = await sharp(path.join(root, "previews", "alpha-proof-webcam-chat.png")).resize(960, 540).png().toBuffer();
  const pairCanvas = Buffer.from(svg(1440, 800, `<rect width="1440" height="800" fill="${C.black}"/><text x="40" y="50" fill="${C.mint}" font-family="Consolas,monospace" font-size="15" font-weight="700" letter-spacing="3">CIVAL OBS / DESKTOP + MOBILE ALPHA SET</text><text x="40" y="94" fill="${C.gray}" font-family="Consolas,monospace" font-size="12" letter-spacing="2">1920 × 1080</text><text x="1030" y="94" fill="${C.gray}" font-family="Consolas,monospace" font-size="12" letter-spacing="2">1080 × 1920</text>`));
  await sharp(pairCanvas).composite([{ input: desktopProof, left: 40, top: 120 }, { input: mobileProof, left: 1010, top: 80 }]).png({ compressionLevel: 9 }).toFile(path.join(root, "previews", "desktop-mobile-alpha-pair.png"));
  console.log(`Generated ${assets.length} transparent OBS assets in ${root}`);
}

await main();
