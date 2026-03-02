import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

const OUT = 'public/images';
fs.mkdirSync(`${OUT}/products`, { recursive: true });
fs.mkdirSync(`${OUT}/categories`, { recursive: true });

// Color schemes
const purple = '#8B5CF6';
const cyan = '#06B6D4';
const dark = '#0A0A0F';

function svgWrap(w, h, content) {
  return `<svg width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="gp" x1="0" y1="0" x2="${w}" y2="${h}" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stop-color="#8B5CF6"/>
        <stop offset="50%" stop-color="#6D28D9"/>
        <stop offset="100%" stop-color="#06B6D4"/>
      </linearGradient>
      <linearGradient id="gi" x1="0" y1="0" x2="${w}" y2="${h}" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stop-color="#A78BFA"/>
        <stop offset="100%" stop-color="#22D3EE"/>
      </linearGradient>
      <filter id="gl"><feGaussianBlur stdDeviation="4" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
      <filter id="gl2"><feGaussianBlur stdDeviation="20" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
      <radialGradient id="orb1" cx="30%" cy="30%" r="50%"><stop stop-color="${purple}" stop-opacity="0.3"/><stop offset="1" stop-color="${purple}" stop-opacity="0"/></radialGradient>
      <radialGradient id="orb2" cx="70%" cy="70%" r="50%"><stop stop-color="${cyan}" stop-opacity="0.2"/><stop offset="1" stop-color="${cyan}" stop-opacity="0"/></radialGradient>
    </defs>
    <rect width="${w}" height="${h}" fill="${dark}"/>
    ${content}
  </svg>`;
}

async function save(name, svg) {
  const buf = Buffer.from(svg);
  await sharp(buf).png().toFile(name);
  console.log(`✓ ${name}`);
}

// ===== LOGO (dark bg) =====
const logoSvg = svgWrap(400, 400, `
  <rect width="400" height="400" rx="80" fill="url(#gp)"/>
  <rect x="32" y="32" width="336" height="336" rx="56" fill="${dark}" fill-opacity="0.85"/>
  <path d="M100 200 Q130 120, 160 200 Q190 280, 220 200 Q250 120, 280 200" stroke="url(#gi)" stroke-width="12" stroke-linecap="round" fill="none" filter="url(#gl)"/>
  <path d="M140 130 C110 130, 90 155, 90 200 C90 245, 110 270, 140 270 C160 270, 175 258, 180 242 L180 208 L155 208" stroke="url(#gi)" stroke-width="10" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
  <circle cx="310" cy="130" r="12" fill="${cyan}" opacity="0.9"/>
  <circle cx="310" cy="130" r="18" fill="${cyan}" opacity="0.25"/>
`);
await save(`${OUT}/logo.png`, logoSvg);

// Logo light version
const logoLightSvg = logoSvg.replace(`fill="${dark}"`, 'fill="#FFFFFF"').replace('fill-opacity="0.85"', 'fill-opacity="0.95"');
await save(`${OUT}/logo-light.png`, logoLightSvg);

// ===== FAVICON =====
const faviconSvg = svgWrap(32, 32, `
  <rect width="32" height="32" rx="6" fill="url(#gp)"/>
  <path d="M8 16 Q11 10, 14 16 Q17 22, 20 16 Q23 10, 26 16" stroke="white" stroke-width="2.5" stroke-linecap="round" fill="none"/>
`);
await sharp(Buffer.from(faviconSvg)).png().toFile(`${OUT}/favicon.png`);
// Also create ico-compatible
await sharp(Buffer.from(faviconSvg)).resize(32, 32).png().toFile('public/favicon.ico');

const icon192Svg = svgWrap(192, 192, `
  <rect width="192" height="192" rx="40" fill="url(#gp)"/>
  <rect x="16" y="16" width="160" height="160" rx="28" fill="${dark}" fill-opacity="0.85"/>
  <path d="M48 96 Q62 56, 76 96 Q90 136, 104 96 Q118 56, 132 96" stroke="url(#gi)" stroke-width="6" stroke-linecap="round" fill="none" filter="url(#gl)"/>
`);
await save(`${OUT}/icon-192.png`, icon192Svg);

// ===== HERO BG =====
const heroBg = svgWrap(1920, 1080, `
  <rect width="1920" height="1080" fill="${dark}"/>
  <circle cx="300" cy="200" r="400" fill="url(#orb1)" filter="url(#gl2)"/>
  <circle cx="1600" cy="800" r="350" fill="url(#orb2)" filter="url(#gl2)"/>
  <circle cx="960" cy="540" r="250" fill="${purple}" opacity="0.04" filter="url(#gl2)"/>
  ${Array.from({length:8}, (_,i) => `<path d="M0 ${400+i*40} Q480 ${350+i*40+(i%2?30:-30)}, 960 ${400+i*40} Q1440 ${450+i*40+(i%2?-30:30)}, 1920 ${400+i*40}" stroke="${i%2?purple:cyan}" stroke-width="1" fill="none" opacity="${0.03+i*0.01}"/>`).join('')}
  ${Array.from({length:20}, (_,i) => `<circle cx="${100+i*95}" cy="${200+(i*37)%700}" r="${1+i%3}" fill="${i%2?purple:cyan}" opacity="${0.1+i*0.02}"/>`).join('')}
  <line x1="0" y1="0" x2="1920" y2="1080" stroke="${purple}" stroke-width="0.5" opacity="0.03"/>
  <line x1="1920" y1="0" x2="0" y2="1080" stroke="${cyan}" stroke-width="0.5" opacity="0.03"/>
`);
await save(`${OUT}/hero-bg.png`, heroBg);

// ===== OG IMAGE =====
const ogImage = svgWrap(1200, 630, `
  <rect width="1200" height="630" fill="${dark}"/>
  <circle cx="200" cy="150" r="250" fill="url(#orb1)" filter="url(#gl2)"/>
  <circle cx="1000" cy="500" r="200" fill="url(#orb2)" filter="url(#gl2)"/>
  ${Array.from({length:5}, (_,i) => `<path d="M0 ${250+i*30} Q300 ${220+i*30+(i%2?20:-20)}, 600 ${250+i*30} Q900 ${280+i*30+(i%2?-20:20)}, 1200 ${250+i*30}" stroke="${i%2?purple:cyan}" stroke-width="1.5" fill="none" opacity="${0.06+i*0.02}"/>`).join('')}
  <rect x="80" y="180" width="500" height="280" rx="20" fill="${dark}" fill-opacity="0.7" stroke="${purple}" stroke-width="1" stroke-opacity="0.2"/>
  <text x="120" y="260" font-family="system-ui,sans-serif" font-weight="800" font-size="56" fill="white">GWDS</text>
  <text x="120" y="310" font-family="system-ui,sans-serif" font-weight="400" font-size="18" fill="#94A3B8">Gamma Waves Design Studio</text>
  <text x="120" y="365" font-family="system-ui,sans-serif" font-weight="500" font-size="16" fill="#64748B">AI Templates · Trading Tools · Animations</text>
  <text x="120" y="395" font-family="system-ui,sans-serif" font-weight="500" font-size="16" fill="#64748B">NFTs · Wallpapers · Creative Assets</text>
  <line x1="120" y1="330" x2="300" y2="330" stroke="url(#gp)" stroke-width="2"/>
`);
await save(`${OUT}/og-image.png`, ogImage);

// ===== PRODUCT IMAGES =====
const productDesigns = {
  'trading-dashboard-template': { colors: ['#8B5CF6','#6D28D9'], icon: `
    <rect x="100" y="80" width="600" height="440" rx="16" fill="#12121A" stroke="#8B5CF6" stroke-width="1" stroke-opacity="0.3"/>
    <rect x="100" y="80" width="600" height="50" rx="16" fill="#1A1A2E"/>
    <circle cx="130" cy="105" r="6" fill="#EF4444"/><circle cx="150" cy="105" r="6" fill="#F59E0B"/><circle cx="170" cy="105" r="6" fill="#10B981"/>
    <rect x="130" y="160" width="260" height="160" rx="8" fill="#1A1A2E" stroke="#8B5CF6" stroke-width="0.5" stroke-opacity="0.2"/>
    <polyline points="150,290 190,250 220,270 260,220 300,240 340,200 370,210" stroke="#06B6D4" stroke-width="2" fill="none"/>
    <polyline points="150,290 190,260 220,280 260,240 300,260 340,230 370,240" stroke="#8B5CF6" stroke-width="2" fill="none" opacity="0.5"/>
    <rect x="420" y="160" width="250" height="70" rx="8" fill="#1A1A2E" stroke="#10B981" stroke-width="0.5" stroke-opacity="0.2"/>
    <text x="440" y="190" font-size="12" fill="#64748B" font-family="monospace">Portfolio Value</text>
    <text x="440" y="215" font-size="22" fill="#10B981" font-family="monospace" font-weight="700">$127,450.00</text>
    <rect x="420" y="250" width="250" height="70" rx="8" fill="#1A1A2E" stroke="#8B5CF6" stroke-width="0.5" stroke-opacity="0.2"/>
    <text x="440" y="280" font-size="12" fill="#64748B" font-family="monospace">24h Change</text>
    <text x="440" y="305" font-size="22" fill="#8B5CF6" font-family="monospace" font-weight="700">+3.24%</text>
    <rect x="130" y="350" width="540" height="140" rx="8" fill="#1A1A2E" stroke="#8B5CF6" stroke-width="0.5" stroke-opacity="0.15"/>
    ${Array.from({length:20},(_,i)=>`<rect x="${145+i*26}" y="${440-20-Math.random()*60}" width="18" height="${20+Math.random()*60}" rx="2" fill="${i%3?'#8B5CF6':'#06B6D4'}" opacity="${0.3+Math.random()*0.4}"/>`).join('')}
  `},
  'second-brain-template': { colors: ['#A78BFA','#818CF8'], icon: `
    <circle cx="400" cy="300" r="180" fill="none" stroke="#8B5CF6" stroke-width="1" opacity="0.15"/>
    <circle cx="400" cy="300" r="120" fill="none" stroke="#06B6D4" stroke-width="1" opacity="0.2"/>
    <circle cx="400" cy="300" r="60" fill="#8B5CF6" opacity="0.1"/>
    <circle cx="400" cy="300" r="20" fill="#8B5CF6" opacity="0.4"/>
    ${[0,60,120,180,240,300].map((a,i)=>{const r=Math.PI*a/180;const x=400+150*Math.cos(r);const y=300+150*Math.sin(r);return `<circle cx="${x}" cy="${y}" r="8" fill="${i%2?'#06B6D4':'#A78BFA'}" opacity="0.6"/><line x1="400" y1="300" x2="${x}" y2="${y}" stroke="${i%2?'#06B6D4':'#A78BFA'}" stroke-width="0.5" opacity="0.2"/>`}).join('')}
    <text x="350" y="308" font-size="28" fill="white" font-family="system-ui" font-weight="700" opacity="0.8">PARA</text>
    ${['Projects','Areas','Resources','Archive'].map((t,i)=>{const a=Math.PI*(i*90+45)/180;const x=400+100*Math.cos(a);const y=300+100*Math.sin(a);return `<text x="${x-30}" y="${y}" font-size="10" fill="#94A3B8" font-family="system-ui">${t}</text>`}).join('')}
  `},
  'ai-saas-starter': { colors: ['#7C3AED','#2563EB'], icon: `
    <rect x="150" y="100" width="500" height="400" rx="20" fill="#12121A" stroke="#8B5CF6" stroke-width="1" stroke-opacity="0.2"/>
    <rect x="150" y="100" width="500" height="55" rx="20" fill="#1A1A2E"/>
    <text x="185" y="135" font-size="16" fill="#F8FAFC" font-family="system-ui" font-weight="700">SaaS Dashboard</text>
    <rect x="180" y="185" width="440" height="50" rx="10" fill="url(#gp)" opacity="0.15"/>
    <text x="330" y="216" font-size="16" fill="#A78BFA" font-family="system-ui" font-weight="600">🚀 Launch Your AI Product</text>
    <rect x="180" y="260" width="135" height="90" rx="10" fill="#1A1A2E" stroke="#10B981" stroke-width="0.5" stroke-opacity="0.3"/>
    <text x="200" y="290" font-size="11" fill="#64748B" font-family="system-ui">Users</text>
    <text x="200" y="320" font-size="24" fill="#10B981" font-family="system-ui" font-weight="700">2.4k</text>
    <rect x="330" y="260" width="135" height="90" rx="10" fill="#1A1A2E" stroke="#8B5CF6" stroke-width="0.5" stroke-opacity="0.3"/>
    <text x="350" y="290" font-size="11" fill="#64748B" font-family="system-ui">MRR</text>
    <text x="350" y="320" font-size="24" fill="#8B5CF6" font-family="system-ui" font-weight="700">$18k</text>
    <rect x="480" y="260" width="135" height="90" rx="10" fill="#1A1A2E" stroke="#06B6D4" stroke-width="0.5" stroke-opacity="0.3"/>
    <text x="500" y="290" font-size="11" fill="#64748B" font-family="system-ui">API Calls</text>
    <text x="500" y="320" font-size="24" fill="#06B6D4" font-family="system-ui" font-weight="700">890k</text>
    <rect x="180" y="375" width="440" height="100" rx="10" fill="#1A1A2E"/>
    <polyline points="200,440 240,420 280,430 320,400 360,410 400,380 440,390 480,370 520,385 560,360 600,375" stroke="#8B5CF6" stroke-width="2" fill="none"/>
  `},
  'darvas-indicator': { colors: ['#06B6D4','#0891B2'], icon: `
    ${Array.from({length:5},(_,i)=>`<rect x="${200+i*80}" y="${150+Math.random()*100}" width="60" height="${100+Math.random()*150}" rx="2" fill="none" stroke="#06B6D4" stroke-width="1.5" stroke-dasharray="4 2" opacity="0.4"/>`).join('')}
    <polyline points="180,400 220,380 260,350 300,320 340,280 380,300 420,260 460,230 500,250 540,220 580,240 620,200" stroke="#06B6D4" stroke-width="2.5" fill="none"/>
    ${[340,460,580].map(x=>`<circle cx="${x}" cy="${x===340?280:x===460?230:200}" r="5" fill="#10B981"/>`).join('')}
    <text x="200" y="470" font-size="12" fill="#475569" font-family="monospace">BREAKOUT DETECTED ↑</text>
    <rect x="260" y="280" width="80" height="80" rx="2" fill="#06B6D4" opacity="0.06" stroke="#06B6D4" stroke-width="1" stroke-opacity="0.3"/>
    <text x="270" y="330" font-size="10" fill="#06B6D4" font-family="monospace" opacity="0.6">BOX</text>
  `},
  'elliott-wave-agent': { colors: ['#8B5CF6','#EC4899'], icon: `
    <path d="M120,400 L200,350 L240,380 L320,200 L380,280 L420,250 L520,100 L560,180 L580,160 L680,300" stroke="url(#gi)" stroke-width="3" fill="none" filter="url(#gl)"/>
    <text x="195" y="340" font-size="10" fill="#A78BFA" font-family="system-ui" font-weight="600">1</text>
    <text x="235" y="395" font-size="10" fill="#A78BFA" font-family="system-ui" font-weight="600">2</text>
    <text x="315" y="190" font-size="10" fill="#A78BFA" font-family="system-ui" font-weight="600">3</text>
    <text x="375" y="295" font-size="10" fill="#A78BFA" font-family="system-ui" font-weight="600">4</text>
    <text x="515" y="90" font-size="10" fill="#A78BFA" font-family="system-ui" font-weight="600">5</text>
    <text x="555" y="195" font-size="10" fill="#EC4899" font-family="system-ui" font-weight="600">A</text>
    <text x="575" y="150" font-size="10" fill="#EC4899" font-family="system-ui" font-weight="600">B</text>
    <text x="675" y="310" font-size="10" fill="#EC4899" font-family="system-ui" font-weight="600">C</text>
    <circle cx="520" cy="100" r="8" fill="#10B981" opacity="0.3"/><circle cx="520" cy="100" r="3" fill="#10B981"/>
    <text x="540" y="105" font-size="9" fill="#10B981" font-family="monospace">SIGNAL</text>
  `},
  'multi-strat-bundle': { colors: ['#10B981','#06B6D4'], icon: `
    ${[0,1,2,3,4,5].map((i)=>{
      const y = 100 + i * 70;
      const colors = ['#8B5CF6','#06B6D4','#10B981','#F59E0B','#EC4899','#EF4444'];
      const names = ['Darvas','Williams','Elliott','Heikin','Renko','Multi'];
      return `<rect x="150" y="${y}" width="500" height="55" rx="10" fill="#12121A" stroke="${colors[i]}" stroke-width="1" stroke-opacity="0.3"/>
        <circle cx="185" cy="${y+27}" r="12" fill="${colors[i]}" opacity="0.2"/>
        <circle cx="185" cy="${y+27}" r="4" fill="${colors[i]}"/>
        <text x="210" y="${y+32}" font-size="14" fill="#CBD5E1" font-family="system-ui" font-weight="600">${names[i]}</text>
        <rect x="420" y="${y+15}" width="80" height="25" rx="12" fill="${colors[i]}" opacity="0.15"/>
        <text x="438" y="${y+32}" font-size="10" fill="${colors[i]}" font-family="system-ui" font-weight="600">ACTIVE</text>
        <text x="580" y="${y+32}" font-size="12" fill="#10B981" font-family="monospace">+${(Math.random()*15).toFixed(1)}%</text>`;
    }).join('')}
  `},
  'content-creator-prompts': { colors: ['#F59E0B','#F97316'], icon: `
    ${[0,1,2,3,4].map((i)=>{
      const y = 100 + i * 90;
      const x = 160 + (i%2) * 40;
      return `<rect x="${x}" y="${y}" width="${480-i*20}" height="70" rx="12" fill="#12121A" stroke="#F59E0B" stroke-width="0.5" stroke-opacity="${0.2+i*0.05}"/>
        <rect x="${x+15}" y="${y+15}" width="40" height="40" rx="8" fill="#F59E0B" opacity="0.1"/>
        <text x="${x+25}" y="${y+42}" font-size="20" fill="#F59E0B" text-anchor="middle">${['✍️','🎬','📸','📝','🎯'][i]}</text>
        <rect x="${x+70}" y="${y+20}" width="${200+Math.random()*100}" height="8" rx="4" fill="#F59E0B" opacity="0.08"/>
        <rect x="${x+70}" y="${y+38}" width="${150+Math.random()*80}" height="8" rx="4" fill="#F59E0B" opacity="0.04"/>`;
    }).join('')}
    <text x="400" y="570" font-size="36" fill="#F59E0B" font-family="system-ui" font-weight="800" text-anchor="middle" opacity="0.15">500+</text>
  `},
  'trading-analysis-prompts': { colors: ['#06B6D4','#8B5CF6'], icon: `
    <rect x="150" y="100" width="500" height="400" rx="16" fill="#12121A" stroke="#06B6D4" stroke-width="0.5" stroke-opacity="0.2"/>
    <text x="400" y="160" font-size="18" fill="#06B6D4" font-family="system-ui" font-weight="700" text-anchor="middle">Market Analysis</text>
    <line x1="200" y1="180" x2="600" y2="180" stroke="#06B6D4" stroke-width="0.5" opacity="0.2"/>
    ${Array.from({length:8},(_,i)=>`
      <rect x="200" y="${200+i*40}" width="${250+Math.random()*150}" height="6" rx="3" fill="#06B6D4" opacity="${0.05+i*0.02}"/>
      <text x="200" y="${195+i*40}" font-size="10" fill="#475569" font-family="monospace">prompt_${String(i+1).padStart(3,'0')}</text>
    `).join('')}
    <rect x="450" y="380" width="180" height="100" rx="10" fill="#06B6D4" opacity="0.05" stroke="#06B6D4" stroke-width="0.5" stroke-opacity="0.2"/>
    <text x="540" y="410" font-size="10" fill="#64748B" font-family="system-ui" text-anchor="middle">Signal Score</text>
    <text x="540" y="450" font-size="32" fill="#06B6D4" font-family="system-ui" font-weight="800" text-anchor="middle">87</text>
  `},
  'ai-art-prompts': { colors: ['#EC4899','#8B5CF6'], icon: `
    ${[0,1,2].map((row)=>[0,1,2].map((col)=>{
      const x=160+col*200; const y=100+row*160;
      const colors=['#EC4899','#8B5CF6','#06B6D4','#F59E0B','#10B981','#F97316','#EF4444','#A78BFA','#22D3EE'];
      const c=colors[(row*3+col)%9];
      return `<rect x="${x}" y="${y}" width="180" height="140" rx="12" fill="#12121A" stroke="${c}" stroke-width="0.5" stroke-opacity="0.2"/>
        <rect x="${x+10}" y="${y+10}" width="160" height="90" rx="8" fill="${c}" opacity="0.06"/>
        <circle cx="${x+90}" cy="${y+55}" r="25" fill="${c}" opacity="0.1"/>
        <rect x="${x+15}" y="${y+110}" width="100" height="6" rx="3" fill="${c}" opacity="0.15"/>
        <rect x="${x+15}" y="${y+122}" width="70" height="4" rx="2" fill="${c}" opacity="0.08"/>`;
    }).join('')).join('')}
  `},
  'cyber-wave-pack': { colors: ['#06B6D4','#8B5CF6'], icon: `
    <rect width="800" height="600" fill="#0A0A0F"/>
    <circle cx="400" cy="300" r="300" fill="${cyan}" opacity="0.03" filter="url(#gl2)"/>
    ${Array.from({length:20},(_,i)=>`<line x1="0" y1="${i*30}" x2="800" y2="${i*30}" stroke="${cyan}" stroke-width="0.5" opacity="0.06"/>`).join('')}
    ${Array.from({length:15},(_,i)=>`<line x1="${i*57}" y1="0" x2="${i*57}" y2="600" stroke="${purple}" stroke-width="0.5" opacity="0.04"/>`).join('')}
    ${Array.from({length:8},(_,i)=>`<path d="M0 ${200+i*25} Q200 ${180+i*25+(i%2?20:-20)}, 400 ${200+i*25} Q600 ${220+i*25+(i%2?-20:20)}, 800 ${200+i*25}" stroke="${i%2?cyan:purple}" stroke-width="1.5" fill="none" opacity="${0.1+i*0.03}"/>`).join('')}
    <rect x="200" y="380" width="400" height="120" rx="8" fill="${dark}" fill-opacity="0.8" stroke="${cyan}" stroke-width="0.5" stroke-opacity="0.3"/>
    <text x="400" y="430" font-size="28" fill="${cyan}" font-family="system-ui" font-weight="800" text-anchor="middle" opacity="0.8">CYBER WAVE</text>
    <text x="400" y="465" font-size="14" fill="#475569" font-family="system-ui" text-anchor="middle">4K + 8K · 20 Wallpapers</text>
  `},
  'abstract-flow-pack': { colors: ['#EC4899','#8B5CF6'], icon: `
    <circle cx="250" cy="250" r="200" fill="#EC4899" opacity="0.04" filter="url(#gl2)"/>
    <circle cx="550" cy="350" r="180" fill="#8B5CF6" opacity="0.04" filter="url(#gl2)"/>
    <circle cx="400" cy="200" r="150" fill="#06B6D4" opacity="0.03" filter="url(#gl2)"/>
    ${Array.from({length:12},(_,i)=>{
      const cx=200+Math.random()*400; const cy=150+Math.random()*300;
      return `<circle cx="${cx}" cy="${cy}" r="${20+Math.random()*60}" fill="none" stroke="${['#EC4899','#8B5CF6','#06B6D4'][i%3]}" stroke-width="0.5" opacity="${0.1+Math.random()*0.15}"/>`;
    }).join('')}
    <text x="400" y="520" font-size="22" fill="#94A3B8" font-family="system-ui" font-weight="600" text-anchor="middle" opacity="0.4">Abstract Flow</text>
  `},
  '400-club': { colors: ['#10B981','#059669'], icon: `
    ${Array.from({length:12},(_,i)=>{
      const cx = (i%4)*180+130; const cy = Math.floor(i/4)*180+130;
      return `<polygon points="${cx},${cy-40} ${cx+35},${cy-20} ${cx+35},${cy+20} ${cx},${cy+40} ${cx-35},${cy+20} ${cx-35},${cy-20}" fill="none" stroke="#10B981" stroke-width="1.5" opacity="${0.15+i*0.03}"/>
        <polygon points="${cx},${cy-20} ${cx+17},${cy-10} ${cx+17},${cy+10} ${cx},${cy+20} ${cx-17},${cy+10} ${cx-17},${cy-10}" fill="#10B981" opacity="0.05"/>`;
    }).join('')}
    <text x="400" y="540" font-size="48" fill="#10B981" font-family="system-ui" font-weight="900" text-anchor="middle" opacity="0.2">400</text>
    <text x="400" y="570" font-size="14" fill="#475569" font-family="system-ui" text-anchor="middle">9,400 Unique Pieces</text>
  `},
  'clay-verse-pack': { colors: ['#F97316','#EA580C'], icon: `
    ${Array.from({length:6},(_,i)=>{
      const x=170+i*80; const h=100+Math.random()*150;
      return `<rect x="${x}" y="${500-h}" width="60" height="${h}" rx="30" fill="#F97316" opacity="${0.08+i*0.03}"/>
        <circle cx="${x+30}" cy="${500-h}" r="30" fill="#F97316" opacity="${0.1+i*0.03}"/>
        <circle cx="${x+20}" cy="${500-h-5}" r="4" fill="white" opacity="0.3"/>
        <circle cx="${x+40}" cy="${500-h-5}" r="4" fill="white" opacity="0.3"/>
        <path d="M${x+20} ${500-h+10} Q${x+30} ${500-h+18}, ${x+40} ${500-h+10}" stroke="white" stroke-width="1.5" fill="none" opacity="0.3"/>`;
    }).join('')}
    <text x="400" y="560" font-size="16" fill="#F97316" font-family="system-ui" font-weight="700" text-anchor="middle" opacity="0.5">CLAY VERSE</text>
  `},
  '3d-render-pack': { colors: ['#F97316','#8B5CF6'], icon: `
    ${Array.from({length:3},(_,row)=>Array.from({length:3},(_,col)=>{
      const x=180+col*180; const y=120+row*150;
      return `<g transform="translate(${x},${y})">
        <rect x="-40" y="-20" width="80" height="60" rx="6" fill="#1A1A2E" stroke="#8B5CF6" stroke-width="0.5" stroke-opacity="0.3" transform="skewY(-5)"/>
        <rect x="-35" y="-30" width="70" height="50" rx="4" fill="#12121A" stroke="#F97316" stroke-width="0.5" stroke-opacity="0.2" transform="skewY(-5) skewX(5)"/>
        <circle cx="0" cy="-10" r="15" fill="url(#gp)" opacity="0.15"/>
      </g>`;
    }).join('')).join('')}
    <text x="400" y="540" font-size="14" fill="#94A3B8" font-family="system-ui" text-anchor="middle" opacity="0.5">20 Isometric Renders · 4K</text>
  `},
};

for (const [id, design] of Object.entries(productDesigns)) {
  const svg = svgWrap(800, 600, `
    <rect width="800" height="600" fill="${dark}"/>
    <circle cx="100" cy="100" r="200" fill="${design.colors[0]}" opacity="0.04" filter="url(#gl2)"/>
    <circle cx="700" cy="500" r="150" fill="${design.colors[1]||design.colors[0]}" opacity="0.03" filter="url(#gl2)"/>
    ${design.icon}
  `);
  await save(`${OUT}/products/${id}.png`, svg);
}

// ===== CATEGORY BANNERS =====
const categoryDesigns = {
  templates: { color: '#8B5CF6', label: 'AI Templates', desc: 'Production-ready dashboards, apps, tools', icon: `
    ${Array.from({length:6},(_,i)=>`<rect x="${100+i*170}" y="120" width="140" height="160" rx="10" fill="#12121A" stroke="#8B5CF6" stroke-width="0.5" stroke-opacity="${0.15+i*0.03}"/><rect x="${110+i*170}" y="130" width="120" height="80" rx="6" fill="#8B5CF6" opacity="0.04"/>`).join('')}
  `},
  trading: { color: '#06B6D4', label: 'Trading Tools', desc: 'Indicators, agents, systems for real markets', icon: `
    <polyline points="100,300 200,250 350,280 500,180 650,220 800,150 950,170 1100,120" stroke="#06B6D4" stroke-width="3" fill="none" opacity="0.5"/>
    ${[200,500,800].map(x=>`<circle cx="${x}" cy="${x===200?250:x===500?180:150}" r="4" fill="#10B981"/>`).join('')}
  `},
  prompts: { color: '#F59E0B', label: 'Prompt Packs', desc: 'Curated prompts for content, code, trading', icon: `
    ${Array.from({length:8},(_,i)=>`<rect x="${150+i*100}" y="${150+(i%2)*30}" width="80" height="100" rx="8" fill="#12121A" stroke="#F59E0B" stroke-width="0.5" stroke-opacity="${0.1+i*0.02}"/>`).join('')}
  `},
  wallpapers: { color: '#EC4899', label: 'Wallpapers', desc: 'AI-generated art for desktop, mobile', icon: `
    <circle cx="400" cy="200" r="120" fill="#EC4899" opacity="0.05" filter="url(#gl2)"/>
    <circle cx="800" cy="200" r="100" fill="#8B5CF6" opacity="0.04" filter="url(#gl2)"/>
    <circle cx="600" cy="200" r="80" fill="#06B6D4" opacity="0.04" filter="url(#gl2)"/>
  `},
  nfts: { color: '#10B981', label: 'NFT Collections', desc: 'Generative art, collectibles on-chain', icon: `
    ${Array.from({length:8},(_,i)=>{const cx=200+i*120;return `<polygon points="${cx},130 ${cx+35},150 ${cx+35},185 ${cx},205 ${cx-35},185 ${cx-35},150" fill="none" stroke="#10B981" stroke-width="1" opacity="${0.15+i*0.03}"/>`;}).join('')}
  `},
  animations: { color: '#F97316', label: 'Animations', desc: 'Claymation, 3D renders, animated content', icon: `
    ${Array.from({length:5},(_,i)=>`<circle cx="${250+i*150}" cy="200" r="${30+i*5}" fill="none" stroke="#F97316" stroke-width="1.5" opacity="${0.15+i*0.05}"/><circle cx="${250+i*150}" cy="200" r="${15+i*3}" fill="#F97316" opacity="0.05"/>`).join('')}
  `},
};

for (const [id, design] of Object.entries(categoryDesigns)) {
  const svg = svgWrap(1200, 400, `
    <rect width="1200" height="400" fill="${dark}"/>
    <circle cx="200" cy="100" r="250" fill="${design.color}" opacity="0.03" filter="url(#gl2)"/>
    <circle cx="1000" cy="300" r="200" fill="${design.color}" opacity="0.02" filter="url(#gl2)"/>
    ${design.icon}
    <rect x="80" y="280" width="400" height="90" rx="12" fill="${dark}" fill-opacity="0.8"/>
    <text x="100" y="325" font-size="28" fill="white" font-family="system-ui" font-weight="800">${design.label}</text>
    <text x="100" y="355" font-size="14" fill="#64748B" font-family="system-ui">${design.desc}</text>
  `);
  await save(`${OUT}/categories/${id}.png`, svg);
}

console.log('\n✅ All images generated!');
