import fs from "node:fs/promises";
import path from "node:path";
import { createHash } from "node:crypto";
import sharp from "sharp";

const projectRoot = process.cwd();
const kitRoot = path.join(projectRoot, "streaming", "cival-twitch-kit-v1");
const masterRoot = path.join(kitRoot, "masters");
const editableRoot = path.join(kitRoot, "editable-svg");
const bgPath = path.join(masterRoot, "cival-broadcast-background-gpt-v1.png");
const corePath = path.join(masterRoot, "cival-agent-core-gpt-v1.png");
const monogramPath = path.join(projectRoot, "public", "brand", "cival-monogram-v1.svg");
const dashboardPath = path.join(projectRoot, "public", "images", "products", "core-v2", "overview.png");

const C = {
  black: "#06110e",
  deep: "#0b1f19",
  mint: "#4ade9f",
  signal: "#7fffc8",
  circuit: "#174d3b",
  gray: "#9eaaa5",
  white: "#effff7",
  amber: "#ffc857",
  red: "#ff6b6b",
};

const created = [];

function esc(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function svgDoc(width, height, body, defs = "") {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
  <defs>
    <filter id="mintGlow" x="-80%" y="-80%" width="260%" height="260%"><feGaussianBlur stdDeviation="8" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
    <filter id="softShadow" x="-30%" y="-30%" width="160%" height="160%"><feDropShadow dx="0" dy="12" stdDeviation="18" flood-color="#000000" flood-opacity="0.55"/></filter>
    <linearGradient id="sceneShade" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#06110e" stop-opacity="0.96"/><stop offset="0.52" stop-color="#06110e" stop-opacity="0.74"/><stop offset="1" stop-color="#06110e" stop-opacity="0.20"/></linearGradient>
    <linearGradient id="panelFill" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#0b1f19" stop-opacity="0.98"/><stop offset="1" stop-color="#06110e" stop-opacity="0.93"/></linearGradient>
    ${defs}
  </defs>
  ${body}
</svg>`;
}

function cornerRails(width, height, inset = 36) {
  const long = 92;
  return `<g fill="none" stroke="${C.mint}" stroke-width="2" opacity="0.9">
    <path d="M${inset} ${inset + long}V${inset}H${inset + long}"/>
    <path d="M${width - inset - long} ${inset}H${width - inset}V${inset + long}"/>
    <path d="M${inset} ${height - inset - long}V${height - inset}H${inset + long}"/>
    <path d="M${width - inset - long} ${height - inset}H${width - inset}V${height - inset - long}"/>
  </g>`;
}

function brandLockup(x = 72, y = 56, scale = 1) {
  const icon = 52 * scale;
  return `<g transform="translate(${x} ${y})">
    <rect width="${icon}" height="${icon}" rx="${10 * scale}" fill="${C.black}" stroke="${C.circuit}" stroke-width="2"/>
    <path d="M${icon * 0.68} ${icon * 0.31}c-${icon * 0.07}-${icon * 0.10}-${icon * 0.17}-${icon * 0.14}-${icon * 0.28}-${icon * 0.14}-${icon * 0.23} 0-${icon * 0.36} ${icon * 0.19}-${icon * 0.36} ${icon * 0.48}s${icon * 0.13} ${icon * 0.48} ${icon * 0.36} ${icon * 0.48}c${icon * 0.12} 0 ${icon * 0.22}-${icon * 0.05} ${icon * 0.29}-${icon * 0.15}" fill="none" stroke="${C.mint}" stroke-width="${icon * 0.11}" stroke-linecap="round"/>
    <text x="${icon + 22 * scale}" y="${22 * scale}" fill="${C.white}" font-family="Arial, Helvetica, sans-serif" font-size="${16 * scale}" font-weight="700" letter-spacing="${4 * scale}">CIVAL SYSTEMS</text>
    <text x="${icon + 22 * scale}" y="${43 * scale}" fill="${C.gray}" font-family="Consolas, monospace" font-size="${9 * scale}" letter-spacing="${2.4 * scale}">TRADING SYSTEMS, SHIPPED AS SOURCE</text>
  </g>`;
}

function statusPill(x, y, text, tone = C.mint) {
  const width = Math.max(182, text.length * 11 + 54);
  return `<g transform="translate(${x} ${y})">
    <rect width="${width}" height="38" rx="19" fill="${C.black}" fill-opacity="0.86" stroke="${tone}" stroke-opacity="0.55"/>
    <circle cx="20" cy="19" r="4" fill="${tone}" filter="url(#mintGlow)"/>
    <text x="36" y="24" fill="${tone}" font-family="Consolas, monospace" font-size="12" font-weight="700" letter-spacing="1.6">${esc(text)}</text>
  </g>`;
}

async function ensureDir(dir) {
  await fs.mkdir(dir, { recursive: true });
}

async function writeSvg(relativePath, width, height, body, defs = "") {
  const full = path.join(editableRoot, relativePath);
  await ensureDir(path.dirname(full));
  await fs.writeFile(full, svgDoc(width, height, body, defs));
  created.push({ path: path.relative(kitRoot, full).replaceAll("\\", "/"), width, height, format: "svg", transparent: true });
  return full;
}

async function renderSvg(relativePath, width, height, body, options = {}) {
  const full = path.join(kitRoot, relativePath);
  await ensureDir(path.dirname(full));
  const svg = Buffer.from(svgDoc(width, height, body, options.defs ?? ""));
  await sharp(svg, { density: 144 }).resize(width, height).png({ compressionLevel: 9, adaptiveFiltering: true }).toFile(full);
  created.push({ path: relativePath.replaceAll("\\", "/"), width, height, format: "png", transparent: options.transparent ?? true });
  if (options.editable !== false) {
    const sourceName = relativePath.replace(/\.png$/i, ".svg");
    await writeSvg(sourceName, width, height, body, options.defs ?? "");
  }
  return full;
}

async function renderScene(fileName, titleLines, kicker, subline, footer, options = {}) {
  const width = options.width ?? 1920;
  const height = options.height ?? 1080;
  const target = path.join(kitRoot, options.folder ?? "scenes", fileName);
  await ensureDir(path.dirname(target));
  const titleSize = options.titleSize ?? 94;
  const titleY = options.titleY ?? 445;
  const lineGap = titleSize * 0.94;
  const titles = titleLines.map((line, i) => `<text x="104" y="${titleY + i * lineGap}" fill="${i === titleLines.length - 1 ? C.mint : C.white}" font-family="Arial, Helvetica, sans-serif" font-size="${titleSize}" font-weight="750" letter-spacing="-2">${esc(line)}</text>`).join("\n");
  const textEnd = titleY + (titleLines.length - 1) * lineGap;
  const body = `<rect width="${width}" height="${height}" fill="url(#sceneShade)"/>
    ${cornerRails(width, height, 52)}
    ${brandLockup(104, 82, 1.12)}
    ${statusPill(width - 430, 86, options.status ?? "PAPER MODE / SYSTEM NOMINAL", options.tone ?? C.mint)}
    <text x="104" y="${titleY - 82}" fill="${options.tone ?? C.mint}" font-family="Consolas, monospace" font-size="15" font-weight="700" letter-spacing="4">${esc(kicker)}</text>
    ${titles}
    <rect x="104" y="${textEnd + 36}" width="84" height="3" rx="2" fill="${options.tone ?? C.mint}"/>
    <text x="104" y="${textEnd + 92}" fill="${C.gray}" font-family="Arial, Helvetica, sans-serif" font-size="24" letter-spacing="0.4">${esc(subline)}</text>
    <g transform="translate(104 ${height - 118})">
      <text y="0" fill="${C.white}" font-family="Consolas, monospace" font-size="14" font-weight="700" letter-spacing="2">${esc(footer)}</text>
      <text x="${width - 208}" y="0" text-anchor="end" fill="${C.gray}" font-family="Consolas, monospace" font-size="12" letter-spacing="1.5">CIVALSYSTEMS.COM</text>
    </g>`;
  const overlay = Buffer.from(svgDoc(width, height, body));
  let base;
  if (width / height > 1) {
    base = sharp(bgPath).resize(width, height, { fit: "cover", position: "center" }).modulate({ brightness: 0.58, saturation: 0.78 });
  } else {
    base = sharp(bgPath).resize(width, height, { fit: "cover", position: "right" }).modulate({ brightness: 0.45, saturation: 0.76 });
  }
  await base.composite([{ input: overlay }]).png({ compressionLevel: 9, adaptiveFiltering: true }).toFile(target);
  created.push({ path: path.relative(kitRoot, target).replaceAll("\\", "/"), width, height, format: "png", transparent: false });
  await writeSvg(path.join(options.folder ?? "scenes", fileName.replace(/\.png$/i, ".overlay.svg")), width, height, body);
  return target;
}

function overlayChrome(kind = "clean") {
  const camera = kind.includes("webcam") ? `<g filter="url(#softShadow)">
      <rect x="1452" y="744" width="408" height="236" rx="16" fill="${C.black}" fill-opacity="0.32" stroke="${C.mint}" stroke-width="2"/>
      <path d="M1452 784v-40h40M1820 744h40v40M1452 940v40h40M1820 980h40v-40" fill="none" stroke="${C.signal}" stroke-width="3"/>
      <rect x="1472" y="952" width="178" height="28" rx="14" fill="${C.black}" stroke="${C.circuit}"/>
      <text x="1491" y="970" fill="${C.mint}" font-family="Consolas, monospace" font-size="10" font-weight="700" letter-spacing="1.5">SYSTEM OPERATOR</text>
    </g>` : "";
  const chat = kind.includes("chat") ? `<g filter="url(#softShadow)">
      <rect x="1488" y="126" width="372" height="786" rx="16" fill="${C.black}" fill-opacity="0.84" stroke="${C.circuit}" stroke-width="2"/>
      <text x="1516" y="170" fill="${C.mint}" font-family="Consolas, monospace" font-size="12" font-weight="700" letter-spacing="2.4">LIVE CHAT</text>
      <line x1="1516" y1="190" x2="1832" y2="190" stroke="${C.circuit}"/>
      <text x="1516" y="886" fill="${C.gray}" font-family="Consolas, monospace" font-size="10" letter-spacing="1.2">RESPECT THE SYSTEM / NO SIGNALS</text>
    </g>` : "";
  const capture = kind.includes("chat") ? `<g fill="none" stroke="${C.circuit}" stroke-width="2"><rect x="40" y="126" width="1418" height="786" rx="12"/><path d="M40 186v-60h60M1398 126h60v60M40 852v60h60M1398 912h60v-60" stroke="${C.mint}"/></g>` : "";
  return `${cornerRails(1920, 1080, 24)}
    ${statusPill(1602, 34, "PAPER MODE / LIVE BUILD")}
    <g transform="translate(38 1018)">
      <rect width="1844" height="36" rx="18" fill="${C.black}" fill-opacity="0.82" stroke="${C.circuit}"/>
      <circle cx="22" cy="18" r="4" fill="${C.mint}" filter="url(#mintGlow)"/>
      <text x="38" y="23" fill="${C.white}" font-family="Consolas, monospace" font-size="11" font-weight="700" letter-spacing="1.5">CIVAL SYSTEMS IN ACTION</text>
      <text x="1808" y="23" text-anchor="end" fill="${C.gray}" font-family="Consolas, monospace" font-size="10" letter-spacing="1.4">DEMO ENVIRONMENT · NOT FINANCIAL ADVICE</text>
    </g>
    ${capture}${camera}${chat}`;
}

function frameBody(width, height, label, orientation = "landscape") {
  const pad = Math.max(18, Math.round(width * 0.03));
  const r = Math.max(14, Math.round(width * 0.025));
  const labelW = Math.min(width - pad * 2, Math.max(190, label.length * 12 + 44));
  return `<rect x="${pad}" y="${pad}" width="${width - pad * 2}" height="${height - pad * 2}" rx="${r}" fill="none" stroke="${C.circuit}" stroke-width="${Math.max(2, Math.round(width / 420))}"/>
    <path d="M${pad} ${pad + 70}V${pad}H${pad + 70}M${width - pad - 70} ${pad}H${width - pad}V${pad + 70}M${pad} ${height - pad - 70}V${height - pad}H${pad + 70}M${width - pad - 70} ${height - pad}H${width - pad}V${height - pad - 70}" fill="none" stroke="${C.mint}" stroke-width="${Math.max(3, Math.round(width / 300))}"/>
    <g transform="translate(${pad + 18} ${height - pad - 46})"><rect width="${labelW}" height="32" rx="16" fill="${C.black}" stroke="${C.circuit}"/><circle cx="18" cy="16" r="4" fill="${C.mint}"/><text x="32" y="21" fill="${C.white}" font-family="Consolas, monospace" font-size="${orientation === "portrait" ? 10 : 12}" font-weight="700" letter-spacing="1.4">${esc(label)}</text></g>`;
}

async function createCoreCanvas(size = 512, badge = null) {
  const iconSize = Math.round(size * 0.80);
  const icon = await sharp(corePath).trim({ background: { r: 0, g: 0, b: 0, alpha: 0 } }).resize(iconSize, iconSize, { fit: "contain" }).png().toBuffer();
  const composites = [{ input: icon, left: Math.round((size - iconSize) / 2), top: Math.round((size - iconSize) / 2) }];
  if (badge) {
    const bx = Math.round(size * 0.69);
    const by = Math.round(size * 0.69);
    const br = Math.round(size * 0.13);
    const marks = {
      nominal: `<path d="M${bx - br * .45} ${by}l${br * .3} ${br * .34} ${br * .66}-${br * .76}" fill="none" stroke="${C.black}" stroke-width="${Math.round(size * .035)}" stroke-linecap="round" stroke-linejoin="round"/>`,
      paper: `<path d="M${bx - br * .38} ${by - br * .52}h${br * .55}l${br * .3} ${br * .3}v${br * .74}h-${br * .85}zM${bx + br * .17} ${by - br * .52}v${br * .3}h${br * .3}" fill="none" stroke="${C.black}" stroke-width="${Math.round(size * .028)}" stroke-linejoin="round"/>`,
      debug: `<path d="M${bx - br * .45} ${by + br * .36}l${br * .28}-${br * .28}m${br * .08}-${br * .08}l${br * .5}-${br * .5}m-${br * .1}-${br * .12}l${br * .22} ${br * .22}" fill="none" stroke="${C.black}" stroke-width="${Math.round(size * .045)}" stroke-linecap="round"/>`,
      ship: `<path d="M${bx - br * .48} ${by + br * .22}h${br * .58}v-${br * .58}m0 0l-${br * .22} ${br * .22}m${br * .22}-${br * .22}l${br * .22} ${br * .22}" fill="none" stroke="${C.black}" stroke-width="${Math.round(size * .04)}" stroke-linecap="round" stroke-linejoin="round"/>`,
    };
    const badgeSvg = svgDoc(size, size, `<circle cx="${bx}" cy="${by}" r="${br}" fill="${C.mint}" stroke="${C.signal}" stroke-width="${Math.round(size * .012)}"/>${marks[badge] ?? marks.nominal}`);
    composites.push({ input: Buffer.from(badgeSvg), left: 0, top: 0 });
  }
  return sharp({ create: { width: size, height: size, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } } }).composite(composites).png().toBuffer();
}

async function saveResizedPng(source, relativePath, width, height = width, options = {}) {
  const target = path.join(kitRoot, relativePath);
  await ensureDir(path.dirname(target));
  await sharp(source).resize(width, height, { fit: options.fit ?? "contain", position: options.position ?? "center" }).png({ compressionLevel: 9, adaptiveFiltering: true, palette: options.palette ?? false }).toFile(target);
  created.push({ path: relativePath.replaceAll("\\", "/"), width, height, format: "png", transparent: options.transparent ?? true });
  return target;
}

async function main() {
  await Promise.all(["scenes", "overlays", "frames", "lower-thirds", "alerts", "panels", "profile", "emotes", "subscriber-badges", "channel-points", "social", "previews", "editable-svg"].map((dir) => ensureDir(path.join(kitRoot, dir))));

  const scenes = [
    ["01-starting-soon.png", ["STARTING", "SOON"], "SYSTEM BOOT / 00", "AI trading infrastructure, built in the open.", "INSPECT THE CODE · START IN PAPER MODE", { status: "PAPER MODE / PRE-FLIGHT" }],
    ["02-be-right-back.png", ["BE RIGHT", "BACK"], "SESSION PAUSED / 01", "The system is safe. The operator will return shortly.", "NO LIVE ORDERS · DEMO ENVIRONMENT", { status: "PAPER MODE / HOLD" }],
    ["03-stream-ending.png", ["SYSTEM", "SIGN-OFF"], "SESSION COMPLETE / 02", "Thanks for inspecting the build with us.", "SOURCE TEMPLATES AT CIVALSYSTEMS.COM", { status: "PAPER MODE / COMPLETE" }],
    ["04-offline.png", ["CURRENTLY", "OFFLINE"], "CHANNEL STATUS / 03", "Follow to catch the next systems build.", "TRADING SYSTEMS, SHIPPED AS SOURCE", { status: "SYSTEM STANDBY" }],
    ["05-technical-difficulties.png", ["RECONNECTING", "THE SYSTEM"], "RECOVERY MODE / 04", "Telemetry interrupted. No live execution is active.", "SAFE STATE VERIFIED · PLEASE STAND BY", { status: "RECOVERY / SAFE STATE", tone: C.amber }],
    ["06-intermission.png", ["SYSTEMS", "INTERMISSION"], "BUILD BREAK / 05", "Next: architecture, agents, and paper-mode testing.", "QUESTIONS WELCOME IN CHAT", { status: "PAPER MODE / PAUSED" }],
    ["07-scene-transition.png", ["SYSTEM", "HANDOFF"], "SCENE ROUTING / 06", "Moving to the next view.", "CONTROL PATH VERIFIED", { status: "ROUTING FEED" }],
  ];
  for (const [file, lines, kicker, subline, footer, options] of scenes) await renderScene(file, lines, kicker, subline, footer, options);

  await renderScene("twitch-profile-banner-1200x480.png", ["BUILD. TEST.", "INSPECT."], "CIVAL SYSTEMS / LIVE", "Trading systems, shipped as source.", "PAPER MODE FIRST", { width: 1200, height: 480, titleSize: 54, titleY: 255, status: "SYSTEM NOMINAL", folder: "profile" });
  await renderScene("going-live-1600x900.png", ["WE ARE", "LIVE"], "CIVAL SYSTEMS / BUILD SESSION", "Watch the system move from source to paper mode.", "LIVE NOW · CIVALSYSTEMS.COM", { width: 1600, height: 900, titleSize: 80, titleY: 380, status: "PAPER MODE / LIVE", folder: "social" });
  await renderScene("vertical-story-1080x1920.png", ["CIVAL", "SYSTEMS", "LIVE"], "BUILD SESSION / NOW", "AI trading infrastructure in action.", "PAPER MODE · CIVALSYSTEMS.COM", { width: 1080, height: 1920, titleSize: 86, titleY: 760, status: "LIVE / PAPER MODE", folder: "social" });
  await renderScene("vod-thumbnail-1280x720.png", ["BUILDING AI", "TRADING SYSTEMS"], "LIVE ENGINEERING / EPISODE", "Source · agents · paper-mode testing", "CIVAL SYSTEMS", { width: 1280, height: 720, titleSize: 58, titleY: 330, status: "PAPER MODE", folder: "social" });
  await renderScene("schedule-card-1080x1350.png", ["NEXT BUILD", "SESSION"], "SCHEDULE / FOLLOW", "Live times are posted on the channel.", "FOLLOW FOR THE NEXT STREAM", { width: 1080, height: 1350, titleSize: 76, titleY: 590, status: "FOLLOW FOR UPDATES", folder: "social" });

  for (const [file, kind] of [["product-clean-1920x1080.png", "clean"], ["product-webcam-1920x1080.png", "webcam"], ["product-chat-1920x1080.png", "chat"], ["product-webcam-chat-1920x1080.png", "webcam-chat"]]) {
    await renderSvg(path.join("overlays", file), 1920, 1080, overlayChrome(kind));
  }

  const justChatting = `${cornerRails(1920, 1080, 24)}${brandLockup(54, 38, 0.9)}${statusPill(1592, 42, "SYSTEMS DEEP DIVE")}
    <g filter="url(#softShadow)"><rect x="62" y="132" width="1216" height="792" rx="22" fill="none" stroke="${C.mint}" stroke-width="3"/><path d="M62 212v-80h80M1198 132h80v80M62 844v80h80M1198 924h80v-80" fill="none" stroke="${C.signal}" stroke-width="4"/></g>
    <g transform="translate(1320 132)"><rect width="538" height="792" rx="22" fill="${C.black}" fill-opacity="0.88" stroke="${C.circuit}" stroke-width="2"/><text x="32" y="54" fill="${C.mint}" font-family="Consolas, monospace" font-size="13" font-weight="700" letter-spacing="2.5">SESSION MAP</text><line x1="32" y1="78" x2="506" y2="78" stroke="${C.circuit}"/><text x="32" y="132" fill="${C.white}" font-family="Arial, Helvetica, sans-serif" font-size="24" font-weight="700">Architecture</text><text x="32" y="178" fill="${C.gray}" font-family="Arial, Helvetica, sans-serif" font-size="18">Agents + orchestration</text><text x="32" y="224" fill="${C.gray}" font-family="Arial, Helvetica, sans-serif" font-size="18">Risk boundaries</text><text x="32" y="270" fill="${C.gray}" font-family="Arial, Helvetica, sans-serif" font-size="18">Paper-mode validation</text><line x1="32" y1="316" x2="506" y2="316" stroke="${C.circuit}"/><text x="32" y="370" fill="${C.mint}" font-family="Consolas, monospace" font-size="12" font-weight="700" letter-spacing="2">ASK QUESTIONS IN CHAT</text><text x="32" y="748" fill="${C.gray}" font-family="Consolas, monospace" font-size="11">NOT FINANCIAL ADVICE</text></g>
    <text x="62" y="1004" fill="${C.white}" font-family="Consolas, monospace" font-size="13" font-weight="700" letter-spacing="2">CIVALSYSTEMS.COM</text>`;
  await renderSvg(path.join("overlays", "just-chatting-1920x1080.png"), 1920, 1080, justChatting);

  await renderSvg(path.join("frames", "camera-landscape-1280x720.png"), 1280, 720, frameBody(1280, 720, "SYSTEM OPERATOR"));
  await renderSvg(path.join("frames", "camera-square-800x800.png"), 800, 800, frameBody(800, 800, "SYSTEM OPERATOR", "square"));
  await renderSvg(path.join("frames", "camera-portrait-720x1280.png"), 720, 1280, frameBody(720, 1280, "SYSTEM OPERATOR", "portrait"));
  await renderSvg(path.join("frames", "chat-480x920.png"), 480, 920, `<rect x="16" y="16" width="448" height="888" rx="20" fill="${C.black}" fill-opacity="0.84" stroke="${C.circuit}" stroke-width="2"/><path d="M16 80V16h64M400 16h64v64M16 840v64h64M400 904h64v-64" fill="none" stroke="${C.mint}" stroke-width="3"/><text x="42" y="66" fill="${C.mint}" font-family="Consolas, monospace" font-size="14" font-weight="700" letter-spacing="2.6">LIVE CHAT</text><text x="42" y="870" fill="${C.gray}" font-family="Consolas, monospace" font-size="10" letter-spacing="1.2">NO SIGNALS · RESPECT THE SYSTEM</text>`);

  const lowerThirds = [
    ["host.png", "SYSTEM OPERATOR", "CIVAL SYSTEMS / LIVE BUILD"],
    ["topic.png", "NOW BUILDING", "AI AGENT ORCHESTRATION"],
    ["paper-mode.png", "SAFETY STATE", "PAPER MODE LOCKED"],
    ["cta.png", "SOURCE TEMPLATES", "CIVALSYSTEMS.COM"],
    ["disclaimer.png", "STREAM NOTICE", "DEMO ONLY · NOT FINANCIAL ADVICE"],
  ];
  for (const [file, label, value] of lowerThirds) {
    const body = `<g transform="translate(34 34)" filter="url(#softShadow)"><path d="M0 0h880l92 86-92 86H0z" fill="url(#panelFill)" stroke="${C.circuit}" stroke-width="2"/><rect width="8" height="172" fill="${C.mint}"/><text x="42" y="60" fill="${C.mint}" font-family="Consolas, monospace" font-size="14" font-weight="700" letter-spacing="3">${esc(label)}</text><text x="42" y="116" fill="${C.white}" font-family="Arial, Helvetica, sans-serif" font-size="32" font-weight="700" letter-spacing="0.8">${esc(value)}</text><text x="42" y="148" fill="${C.gray}" font-family="Consolas, monospace" font-size="10" letter-spacing="1.5">TRADING SYSTEMS, SHIPPED AS SOURCE</text></g>`;
    await renderSvg(path.join("lower-thirds", file), 1080, 240, body);
  }

  const alerts = [["follow.png", "FOLLOW DETECTED"], ["subscriber.png", "NEW SUBSCRIBER"], ["raid.png", "RAID INBOUND"], ["support.png", "SUPPORT RECEIVED"], ["member.png", "SYSTEM MEMBER ADDED"]];
  for (const [file, label] of alerts) {
    const body = `<g transform="translate(20 20)" filter="url(#softShadow)"><path d="M0 0h610l70 70-70 70H0z" fill="url(#panelFill)" stroke="${C.circuit}" stroke-width="2"/><rect width="8" height="140" fill="${C.mint}"/><circle cx="74" cy="70" r="29" fill="none" stroke="${C.mint}" stroke-width="2"/><circle cx="74" cy="70" r="7" fill="${C.signal}" filter="url(#mintGlow)"/><text x="126" y="58" fill="${C.mint}" font-family="Consolas, monospace" font-size="13" font-weight="700" letter-spacing="2.6">${esc(label)}</text><line x1="126" y1="82" x2="560" y2="82" stroke="${C.circuit}"/><text x="126" y="111" fill="${C.gray}" font-family="Consolas, monospace" font-size="10" letter-spacing="1.5">DYNAMIC NAME SAFE AREA</text></g>`;
    await renderSvg(path.join("alerts", file), 740, 180, body);
  }

  const panels = ["ABOUT", "SCHEDULE", "CIVAL CORE", "LIVE DEMO", "STORE", "COMMUNITY", "SOCIALS", "SETUP GUIDE", "FAQ", "SUPPORT", "RULES", "DISCLAIMER"];
  for (let index = 0; index < panels.length; index++) {
    const label = panels[index];
    const file = `${String(index + 1).padStart(2, "0")}-${label.toLowerCase().replaceAll(" ", "-")}.png`;
    const body = `<rect x="2" y="2" width="316" height="96" rx="12" fill="url(#panelFill)" stroke="${C.circuit}" stroke-width="2"/><rect x="2" y="2" width="6" height="96" rx="3" fill="${C.mint}"/><circle cx="42" cy="50" r="16" fill="none" stroke="${C.mint}" stroke-width="2"/><circle cx="42" cy="50" r="4" fill="${C.signal}"/><text x="72" y="57" fill="${C.white}" font-family="Arial, Helvetica, sans-serif" font-size="18" font-weight="700" letter-spacing="1.4">${esc(label)}</text><path d="M284 42l8 8-8 8" fill="none" stroke="${C.mint}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>`;
    await renderSvg(path.join("panels", file), 320, 100, body);
  }

  await saveResizedPng(monogramPath, path.join("profile", "twitch-profile-picture-256.png"), 256, 256, { transparent: false });
  await saveResizedPng(monogramPath, path.join("profile", "twitch-profile-picture-512.png"), 512, 512, { transparent: false });

  const emoteVariants = [["core", null], ["nominal", "nominal"], ["paper", "paper"], ["debug", "debug"], ["ship", "ship"]];
  for (const [name, badge] of emoteVariants) {
    const master = await createCoreCanvas(512, badge);
    await saveResizedPng(master, path.join("emotes", `${name}-master-512.png`), 512, 512);
    for (const size of [112, 56, 28]) await saveResizedPng(master, path.join("emotes", `${name}-${size}.png`), size, size, { palette: true });
  }

  const badgeTiers = [
    ["01-node", 1], ["02-circuit", 2], ["03-mesh", 3], ["04-core", 4], ["05-prime", 5],
  ];
  for (const [name, tier] of badgeTiers) {
    const rings = Array.from({ length: tier }, (_, i) => `<circle cx="128" cy="128" r="${48 + i * 12}" fill="none" stroke="${i === tier - 1 ? C.mint : C.circuit}" stroke-width="${i === tier - 1 ? 8 : 5}" opacity="${0.95 - i * 0.08}"/>`).join("");
    const body = `<circle cx="128" cy="128" r="104" fill="${C.black}" stroke="${C.circuit}" stroke-width="8"/>${rings}<circle cx="128" cy="128" r="22" fill="${C.mint}" filter="url(#mintGlow)"/><path d="M135 113c-4-5-9-8-16-8-13 0-21 10-21 24s8 24 21 24c7 0 13-3 17-9" fill="none" stroke="${C.black}" stroke-width="8" stroke-linecap="round"/>`;
    const master = Buffer.from(svgDoc(256, 256, body));
    for (const size of [72, 36, 18]) await saveResizedPng(master, path.join("subscriber-badges", `${name}-${size}.png`), size, size, { palette: true });
  }

  const pointMaster = await createCoreCanvas(512, null);
  for (const size of [112, 56, 28]) await saveResizedPng(pointMaster, path.join("channel-points", `cival-compute-${size}.png`), size, size, { palette: true });

  const previewOverlay = path.join(kitRoot, "overlays", "product-webcam-1920x1080.png");
  const dashboard = await sharp(dashboardPath).resize(1920, 1080, { fit: "cover", position: "center" }).png().toBuffer();
  await sharp(dashboard).composite([{ input: previewOverlay }]).png({ compressionLevel: 9 }).toFile(path.join(kitRoot, "previews", "product-overlay-in-use.png"));
  created.push({ path: "previews/product-overlay-in-use.png", width: 1920, height: 1080, format: "png", transparent: false });

  const sceneFiles = scenes.map(([file]) => path.join(kitRoot, "scenes", file));
  const thumbs = await Promise.all(sceneFiles.map((file) => sharp(file).resize(480, 270).png().toBuffer()));
  const sheetHeight = 72 + Math.ceil(thumbs.length / 3) * 280;
  const sheetSvg = Buffer.from(svgDoc(1500, sheetHeight, `<rect width="1500" height="${sheetHeight}" fill="${C.black}"/><text x="30" y="36" fill="${C.mint}" font-family="Consolas, monospace" font-size="14" font-weight="700" letter-spacing="3">CIVAL TWITCH SCENE DECK / V1</text>`));
  const montage = sharp(sheetSvg).composite(thumbs.map((input, i) => ({ input, left: 30 + (i % 3) * 490, top: 62 + Math.floor(i / 3) * 280 })));
  await montage.png({ compressionLevel: 9 }).toFile(path.join(kitRoot, "previews", "scene-contact-sheet.png"));
  created.push({ path: "previews/scene-contact-sheet.png", width: 1500, height: sheetHeight, format: "png", transparent: false });

  const verifiedAssets = await Promise.all(created.map(async (asset) => {
    const full = path.join(kitRoot, asset.path);
    const data = await fs.readFile(full);
    return {
      ...asset,
      bytes: data.length,
      sha256: createHash("sha256").update(data).digest("hex"),
    };
  }));
  const manifest = {
    package: "Cival Systems Twitch Stream Kit",
    version: "1.0.0",
    generatedAt: new Date().toISOString(),
    brand: C,
    productionNotes: {
      canvas: "1920x1080 at 60fps recommended",
      safety: "All trading scenes identify the environment as paper/demo and avoid performance claims.",
      dynamicText: "Place the alert provider's dynamic display-name field over the safe area marked in each alert card.",
      editableSources: "Matching SVG sources live in editable-svg/.",
    },
    assets: verifiedAssets,
  };
  await fs.writeFile(path.join(kitRoot, "manifest.json"), `${JSON.stringify(manifest, null, 2)}\n`);
  console.log(`Generated ${created.length} assets in ${kitRoot}`);
}

await main();
