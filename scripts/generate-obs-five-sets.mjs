import fs from "node:fs/promises";
import path from "node:path";
import { createHash } from "node:crypto";
import sharp from "sharp";

const repo = process.cwd();
const root = path.join(repo, "streaming", "cival-obs-five-sets-v1");
const editRoot = path.join(root, "editable-svg");
const records = [];
const themes = [
  { slug: "01-system-grid", name: "SYSTEM GRID", accent: "#4ade9f", second: "#7fffc8", edge: "#174d3b", style: "grid" },
  { slug: "02-agent-mesh", name: "AGENT MESH", accent: "#7fffc8", second: "#4ade9f", edge: "#215648", style: "mesh" },
  { slug: "03-terminal-ops", name: "TERMINAL OPS", accent: "#4ade9f", second: "#5eb0c9", edge: "#245046", style: "terminal" },
  { slug: "04-signal-glass", name: "SIGNAL GLASS", accent: "#50d2c1", second: "#7fffc8", edge: "#1b5b51", style: "glass" },
  { slug: "05-source-minimal", name: "SOURCE MINIMAL", accent: "#4ade9f", second: "#d5e1dc", edge: "#2a4840", style: "minimal" },
];
const ink = { black: "#06110e", deep: "#0b1f19", white: "#effff7", gray: "#9eaaa5" };

const mkdir = (dir) => fs.mkdir(dir, { recursive: true });
const esc = (v) => String(v).replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;");
function doc(w, h, t, body) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}"><defs><filter id="glow" x="-100%" y="-100%" width="300%" height="300%"><feGaussianBlur stdDeviation="7" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter><filter id="shadow" x="-30%" y="-30%" width="160%" height="160%"><feDropShadow dx="0" dy="12" stdDeviation="16" flood-color="#000" flood-opacity=".58"/></filter><linearGradient id="panel" x1="0" y1="0" x2="1" y2="1"><stop stop-color="${ink.deep}" stop-opacity=".96"/><stop offset="1" stop-color="${ink.black}" stop-opacity=".76"/></linearGradient><linearGradient id="accent" x1="0" y1="0" x2="1" y2="1"><stop stop-color="${t.second}"/><stop offset="1" stop-color="${t.accent}"/></linearGradient></defs>${body}</svg>`;
}

function brand(t, x, y, compact = false) {
  const size = compact ? 46 : 54;
  return `<g transform="translate(${x} ${y})"><rect width="${size}" height="${size}" rx="${t.style === "terminal" ? 2 : 11}" fill="${ink.black}" fill-opacity=".88" stroke="${t.edge}" stroke-width="2"/><path d="M${size * .69} ${size * .3}c-${size * .07}-${size * .1}-${size * .17}-${size * .14}-${size * .29}-${size * .14}-${size * .23} 0-${size * .36} ${size * .19}-${size * .36} ${size * .49}s${size * .13} ${size * .49} ${size * .36} ${size * .49}c${size * .13} 0 ${size * .23}-${size * .05} ${size * .3}-${size * .15}" fill="none" stroke="${t.accent}" stroke-width="${size * .11}" stroke-linecap="round"/><text x="${size + 18}" y="21" fill="${ink.white}" font-family="Arial,Helvetica,sans-serif" font-size="15" font-weight="700" letter-spacing="3">CIVAL SYSTEMS</text><text x="${size + 18}" y="42" fill="${t.accent}" font-family="Consolas,monospace" font-size="8" font-weight="700" letter-spacing="2">${t.name}</text></g>`;
}

function decor(t, w, h) {
  const i = w > h ? 24 : 28;
  if (t.style === "grid") return `<g fill="none" stroke="${t.accent}" stroke-width="2"><path d="M${i} ${i + 92}V${i}H${i + 92}M${w - i - 92} ${i}H${w - i}V${i + 92}M${i} ${h - i - 92}V${h - i}H${i + 92}M${w - i - 92} ${h - i}H${w - i}V${h - i - 92}"/></g><g fill="${t.edge}" opacity=".55">${Array.from({ length: 11 }, (_, n) => `<circle cx="${i + 16 + n * 18}" cy="${h - i - 18}" r="2"/>`).join("")}</g>`;
  if (t.style === "mesh") return `<g fill="none" stroke="${t.edge}" stroke-width="2"><path d="M${i + 34} ${i}h82l22 38-22 38h-82l-22-38zM${w - i - 116} ${i}h82l22 38-22 38h-82l-22-38zM${i + 34} ${h - i - 76}h82l22 38-22 38h-82l-22-38zM${w - i - 116} ${h - i - 76}h82l22 38-22 38h-82l-22-38z"/><path d="M${i + 138} ${i + 38}H${w - i - 138}M${i + 138} ${h - i - 38}H${w - i - 138}" opacity=".5"/></g><g fill="${t.accent}"><circle cx="${i + 138}" cy="${i + 38}" r="4"/><circle cx="${w - i - 138}" cy="${h - i - 38}" r="4"/></g>`;
  if (t.style === "terminal") return `<g fill="none" stroke="${t.accent}" stroke-width="3"><path d="M${i} ${i + 82}V${i}H${i + 82}M${w - i - 82} ${i}H${w - i}V${i + 82}M${i} ${h - i - 82}V${h - i}H${i + 82}M${w - i - 82} ${h - i}H${w - i}V${h - i - 82}"/></g><g fill="${t.second}" font-family="Consolas,monospace" font-size="10" letter-spacing="2"><text x="${i + 102}" y="${i + 5}">00:VIEW</text><text x="${w - i - 102}" y="${h - i - 4}" text-anchor="end">SRC/CIVAL</text></g>`;
  if (t.style === "glass") return `<g fill="none" stroke="${t.accent}" opacity=".9"><path d="M${i} ${i + 105}Q${i} ${i} ${i + 105} ${i}H${i + 180}" stroke-width="3"/><path d="M${w - i - 180} ${i}H${w - i - 105}Q${w - i} ${i} ${w - i} ${i + 105}" stroke-width="3"/><path d="M${i} ${h - i - 105}Q${i} ${h - i} ${i + 105} ${h - i}H${i + 180}" stroke-width="3"/><path d="M${w - i - 180} ${h - i}H${w - i - 105}Q${w - i} ${h - i} ${w - i} ${h - i - 105}" stroke-width="3"/><path d="M${i + 210} ${h - i - 14}q70-28 140 0t140 0t140 0" stroke="${t.second}" stroke-width="2" opacity=".55"/></g>`;
  return `<g fill="none"><path d="M${i} ${i}H${w * .33}" stroke="${t.accent}" stroke-width="4"/><path d="M${w * .67} ${h - i}H${w - i}" stroke="${t.second}" stroke-width="2"/><path d="M${i} ${i}V${i + 68}M${w - i} ${h - i - 68}V${h - i}" stroke="${t.edge}" stroke-width="1"/></g><text x="${w - i}" y="${i + 38}" text-anchor="end" fill="${t.edge}" font-family="Arial,Helvetica,sans-serif" font-size="${w > h ? 54 : 38}" font-weight="700" letter-spacing="10" opacity=".38">CIVAL</text>`;
}

function status(t, x, y, label, width = 304) {
  if (t.style === "mesh") return `<g transform="translate(${x} ${y})"><path d="M16 0h${width - 32}l16 19-16 19H16L0 19z" fill="${ink.black}" fill-opacity=".84" stroke="${t.edge}"/><circle cx="24" cy="19" r="4" fill="${t.accent}" filter="url(#glow)"/><text x="40" y="24" fill="${t.accent}" font-family="Consolas,monospace" font-size="10" font-weight="700" letter-spacing="1.5">${esc(label)}</text></g>`;
  if (t.style === "terminal") return `<g transform="translate(${x} ${y})"><path d="M12 0H0v38h12M${width - 12} 0h12v38h-12" fill="none" stroke="${t.accent}" stroke-width="2"/><text x="18" y="24" fill="${t.second}" font-family="Consolas,monospace" font-size="11" font-weight="700" letter-spacing="1.4">&gt; ${esc(label)}_</text></g>`;
  if (t.style === "minimal") return `<g transform="translate(${x} ${y})"><text x="${width}" y="20" text-anchor="end" fill="${ink.white}" font-family="Consolas,monospace" font-size="10" font-weight="700" letter-spacing="1.8">${esc(label)}</text><line x1="${width * .36}" y1="34" x2="${width}" y2="34" stroke="${t.accent}" stroke-width="3"/></g>`;
  return `<g transform="translate(${x} ${y})"><rect width="${width}" height="38" rx="${t.style === "glass" ? 19 : 8}" fill="${ink.black}" fill-opacity=".82" stroke="${t.accent}" stroke-opacity=".7"/><circle cx="20" cy="19" r="4" fill="${t.accent}" filter="url(#glow)"/><text x="36" y="24" fill="${t.accent}" font-family="Consolas,monospace" font-size="10" font-weight="700" letter-spacing="1.5">${esc(label)}</text></g>`;
}

function box(t, x, y, w, h, label = "", fill = 0) {
  let shape;
  if (t.style === "mesh") shape = `<path d="M${x + 22} ${y}H${x + w - 22}L${x + w} ${y + 22}V${y + h - 22}L${x + w - 22} ${y + h}H${x + 22}L${x} ${y + h - 22}V${y + 22}z" fill="${ink.black}" fill-opacity="${fill}" stroke="${t.edge}" stroke-width="2"/><path d="M${x + 22} ${y}h52M${x + w - 74} ${y}h52M${x + 22} ${y + h}h52M${x + w - 74} ${y + h}h52" stroke="${t.accent}" stroke-width="4"/>`;
  else if (t.style === "terminal") shape = `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${ink.black}" fill-opacity="${fill}" stroke="${t.edge}" stroke-width="2"/><path d="M${x} ${y + 58}V${y}H${x + 58}M${x + w - 58} ${y}H${x + w}V${y + 58}M${x} ${y + h - 58}V${y + h}H${x + 58}M${x + w - 58} ${y + h}H${x + w}V${y + h - 58}" fill="none" stroke="${t.accent}" stroke-width="3"/>`;
  else if (t.style === "glass") shape = `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="28" fill="${ink.black}" fill-opacity="${fill}" stroke="${t.edge}" stroke-width="2"/><path d="M${x + 28} ${y}H${x + w * .38}M${x + w * .62} ${y + h}H${x + w - 28}" stroke="${t.second}" stroke-width="4" stroke-linecap="round"/>`;
  else if (t.style === "minimal") shape = `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${ink.black}" fill-opacity="${fill}" stroke="${t.edge}"/><rect x="${x}" y="${y}" width="6" height="${h}" fill="${t.accent}"/><line x1="${x + w * .68}" y1="${y}" x2="${x + w}" y2="${y}" stroke="${t.second}" stroke-width="3"/>`;
  else shape = `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="14" fill="${ink.black}" fill-opacity="${fill}" stroke="${t.edge}" stroke-width="2"/><path d="M${x} ${y + 54}V${y}H${x + 54}M${x + w - 54} ${y}H${x + w}V${y + 54}M${x} ${y + h - 54}V${y + h}H${x + 54}M${x + w - 54} ${y + h}H${x + w}V${y + h - 54}" fill="none" stroke="${t.accent}" stroke-width="3"/>`;
  return `<g filter="url(#shadow)">${shape}${label ? `<g transform="translate(${x + 18} ${y + h - 28})"><rect width="${Math.max(150, label.length * 9 + 36)}" height="28" rx="${t.style === "terminal" ? 2 : 14}" fill="${ink.black}" fill-opacity=".92" stroke="${t.edge}"/><text x="18" y="18" fill="${t.accent}" font-family="Consolas,monospace" font-size="9" font-weight="700" letter-spacing="1.3">${esc(label)}</text></g>` : ""}</g>`;
}

function foot(t, w, h, left = "CIVAL SYSTEMS IN ACTION", right = "DEMO · NOT FINANCIAL ADVICE") {
  const x = w > h ? 38 : 40, y = h - (w > h ? 62 : 78), fw = w - x * 2, fh = w > h ? 36 : 42;
  if (t.style === "terminal") return `<g transform="translate(${x} ${y})"><path d="M12 0H0v${fh}h12M${fw - 12} 0h12v${fh}h-12" fill="none" stroke="${t.accent}" stroke-width="2"/><text x="20" y="${fh * .65}" fill="${t.second}" font-family="Consolas,monospace" font-size="${w > h ? 10 : 9}" letter-spacing="1.3">&gt; ${esc(left)}</text><text x="${fw - 20}" y="${fh * .65}" text-anchor="end" fill="${ink.gray}" font-family="Consolas,monospace" font-size="${w > h ? 9 : 7}">${esc(right)}</text></g>`;
  if (t.style === "minimal") return `<g><line x1="${x}" y1="${y}" x2="${w * .43}" y2="${y}" stroke="${t.accent}" stroke-width="3"/><text x="${x}" y="${y + 28}" fill="${ink.white}" font-family="Consolas,monospace" font-size="${w > h ? 10 : 9}" font-weight="700" letter-spacing="1.5">${esc(left)}</text><text x="${w - x}" y="${y + 28}" text-anchor="end" fill="${ink.gray}" font-family="Consolas,monospace" font-size="${w > h ? 9 : 7}">${esc(right)}</text></g>`;
  return `<g transform="translate(${x} ${y})"><rect width="${fw}" height="${fh}" rx="${t.style === "mesh" ? 4 : fh / 2}" fill="${ink.black}" fill-opacity=".8" stroke="${t.edge}"/><rect width="6" height="${fh}" rx="3" fill="${t.accent}"/><text x="28" y="${fh * .65}" fill="${ink.white}" font-family="Consolas,monospace" font-size="${w > h ? 10 : 9}" font-weight="700" letter-spacing="1.3">${esc(left)}</text><text x="${fw - 20}" y="${fh * .65}" text-anchor="end" fill="${ink.gray}" font-family="Consolas,monospace" font-size="${w > h ? 9 : 7}">${esc(right)}</text></g>`;
}

async function make(t, group, name, w, h, body) {
  const rel = path.join(t.slug, group, name);
  const png = path.join(root, rel);
  const svgPath = path.join(editRoot, rel.replace(/\.png$/, ".svg"));
  await Promise.all([mkdir(path.dirname(png)), mkdir(path.dirname(svgPath))]);
  const markup = doc(w, h, t, body);
  await Promise.all([sharp(Buffer.from(markup), { density: 144 }).resize(w, h).png({ compressionLevel: 9, adaptiveFiltering: true }).toFile(png), fs.writeFile(svgPath, markup)]);
  records.push({ set: t.slug, group, path: rel.replaceAll("\\", "/"), editable: path.relative(root, svgPath).replaceAll("\\", "/"), width: w, height: h });
}

function desktopLayouts(t) {
  const base = `${decor(t, 1920, 1080)}${brand(t, 42, 34)}${status(t, 1580, 36, "PAPER MODE / LIVE", 300)}${foot(t, 1920, 1080)}`;
  return [
    ["01-clean.png", base],
    ["02-product-webcam.png", `${base}${box(t, 1436, 738, 424, 238, "SYSTEM OPERATOR")}`],
    ["03-product-chat.png", `${base}${box(t, 40, 126, 1400, 790, "PRODUCT CAPTURE")}${box(t, 1470, 126, 390, 790, "LIVE CHAT", .8)}`],
    ["04-product-camera-chat.png", `${base}${box(t, 40, 126, 1400, 790, "PRODUCT CAPTURE")}${box(t, 1470, 126, 390, 470, "LIVE CHAT", .8)}${box(t, 1470, 622, 390, 219, "SYSTEM OPERATOR")}`],
    ["05-just-chatting.png", `${decor(t, 1920, 1080)}${brand(t, 52, 38)}${status(t, 1580, 42, "SYSTEMS DEEP DIVE", 300)}${box(t, 62, 132, 1216, 792, "SYSTEM OPERATOR")}${box(t, 1320, 132, 538, 792, "SESSION MAP", .86)}${foot(t, 1920, 1080, "CIVALSYSTEMS.COM", "ASK QUESTIONS IN CHAT")}`],
  ];
}

function mobileLayouts(t) {
  const base = `${decor(t, 1080, 1920)}${brand(t, 40, 48, true)}${status(t, 716, 54, "PAPER MODE / LIVE", 324)}${foot(t, 1080, 1920)}`;
  return [
    ["01-clean.png", base],
    ["02-product-camera.png", `${base}${box(t, 40, 230, 1000, 562, "PRODUCT CAPTURE")}${box(t, 210, 890, 830, 467, "SYSTEM OPERATOR")}`],
    ["03-product-chat.png", `${base}${box(t, 40, 230, 1000, 562, "PRODUCT CAPTURE")}${box(t, 40, 850, 1000, 850, "LIVE CHAT", .8)}`],
    ["04-product-camera-chat.png", `${base}${box(t, 40, 230, 1000, 562, "PRODUCT CAPTURE")}${box(t, 40, 850, 480, 270, "SYSTEM OPERATOR")}${box(t, 550, 850, 490, 850, "LIVE CHAT", .8)}`],
    ["05-just-chatting.png", `${decor(t, 1080, 1920)}${brand(t, 40, 48, true)}${status(t, 716, 54, "SYSTEMS DEEP DIVE", 324)}${box(t, 40, 230, 1000, 1120, "SYSTEM OPERATOR")}${box(t, 40, 1400, 1000, 300, "SESSION MAP", .84)}${foot(t, 1080, 1920, "CIVALSYSTEMS.COM", "ASK QUESTIONS IN CHAT")}`],
  ];
}

async function main() {
  await Promise.all([mkdir(root), mkdir(editRoot), mkdir(path.join(root, "previews"))]);
  for (const t of themes) {
    for (const [name, body] of desktopLayouts(t)) await make(t, "desktop-1920x1080", name, 1920, 1080, body);
    for (const [name, body] of mobileLayouts(t)) await make(t, "mobile-1080x1920", name, 1080, 1920, body);
    await make(t, "modules", "lower-third-blank-1000x200.png", 1000, 200, `${box(t, 20, 20, 900, 160, "")}<circle cx="68" cy="70" r="7" fill="${t.accent}"/><line x1="98" y1="70" x2="760" y2="70" stroke="${t.edge}"/><line x1="60" y1="128" x2="650" y2="128" stroke="${t.edge}"/>`);
    await make(t, "modules", "alert-blank-740x180.png", 740, 180, `${box(t, 20, 20, 680, 140, "", .82)}<circle cx="90" cy="90" r="28" fill="none" stroke="${t.accent}" stroke-width="2"/><circle cx="90" cy="90" r="6" fill="${t.accent}" filter="url(#glow)"/><line x1="140" y1="68" x2="580" y2="68" stroke="${t.edge}"/><line x1="140" y1="112" x2="520" y2="112" stroke="${t.edge}"/>`);
  }

  const checkerDesktop = Buffer.from(doc(1920, 1080, themes[0], `<defs><pattern id="q" width="80" height="80" patternUnits="userSpaceOnUse"><rect width="80" height="80" fill="#202825"/><rect width="40" height="40" fill="#303936"/><rect x="40" y="40" width="40" height="40" fill="#303936"/></pattern></defs><rect width="1920" height="1080" fill="url(#q)"/>`));
  const checkerMobile = Buffer.from(doc(1080, 1920, themes[0], `<defs><pattern id="q" width="80" height="80" patternUnits="userSpaceOnUse"><rect width="80" height="80" fill="#202825"/><rect width="40" height="40" fill="#303936"/><rect x="40" y="40" width="40" height="40" fill="#303936"/></pattern></defs><rect width="1080" height="1920" fill="url(#q)"/>`));
  const rows = [];
  for (const t of themes) {
    const deskComposite = await sharp(checkerDesktop).composite([{ input: path.join(root, t.slug, "desktop-1920x1080", "04-product-camera-chat.png") }]).png().toBuffer();
    const mobileComposite = await sharp(checkerMobile).composite([{ input: path.join(root, t.slug, "mobile-1080x1920", "04-product-camera-chat.png") }]).png().toBuffer();
    const desk = await sharp(deskComposite).resize(640, 360).png().toBuffer();
    const mobile = await sharp(mobileComposite).resize(203, 360).png().toBuffer();
    rows.push({ t, desk, mobile });
  }
  const sheetH = 90 + rows.length * 400;
  const sheet = Buffer.from(doc(1050, sheetH, themes[0], `<rect width="1050" height="${sheetH}" fill="${ink.black}"/><text x="36" y="48" fill="#4ade9f" font-family="Consolas,monospace" font-size="16" font-weight="700" letter-spacing="3">CIVAL OBS / FIVE TRANSPARENT SETS</text>${rows.map((r, i) => `<text x="36" y="${94 + i * 400}" fill="${r.t.accent}" font-family="Consolas,monospace" font-size="12" font-weight="700" letter-spacing="2">${r.t.slug.toUpperCase().replace("-", " / ")}</text>`).join("")}`));
  await sharp(sheet).composite(rows.flatMap((r, i) => [{ input: r.desk, left: 36, top: 110 + i * 400 }, { input: r.mobile, left: 712, top: 110 + i * 400 }])).png({ compressionLevel: 9 }).toFile(path.join(root, "previews", "five-set-contact-sheet.png"));

  for (const record of records) {
    const data = await fs.readFile(path.join(root, record.path));
    const meta = await sharp(data).metadata();
    if (!meta.hasAlpha) throw new Error(`${record.path}: alpha channel missing`);
    const sampleY = record.height > record.width ? 500 : Math.floor(record.height / 2);
    const { data: center } = await sharp(data).ensureAlpha().extract({ left: Math.floor(record.width / 2), top: sampleY, width: 1, height: 1 }).raw().toBuffer({ resolveWithObject: true });
    if (record.group !== "modules" && center[3] !== 0) throw new Error(`${record.path}: capture center is not transparent`);
    record.bytes = data.length;
    record.sha256 = createHash("sha256").update(data).digest("hex");
  }
  await fs.writeFile(path.join(root, "manifest.json"), `${JSON.stringify({ package: "Cival OBS Five Transparent Sets", version: "1.0.0", sets: themes, assets: records }, null, 2)}\n`);
  console.log(`Generated and verified ${records.length} transparent PNG overlays with matching SVGs.`);
}

await main();
