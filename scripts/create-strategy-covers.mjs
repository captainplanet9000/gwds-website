import fs from 'node:fs';
const covers=[
 ['darvas-indicator','DARVAS','Boxes. Breakouts. Volume.','#2563eb','M100 280 H280 V220 H480 V160 H680 V110 H860','<rect x="160" y="210" width="230" height="110" rx="6"/><rect x="460" y="145" width="220" height="100" rx="6"/>'],
 ['elliott-wave-agent','ELLIOTT WAVE','Swing structure. Fibonacci rules.','#7c3aed','M100 300 L240 190 L340 245 L520 85 L640 170 L800 55 L910 160','<path d="M100 190H940M100 245H940" stroke-dasharray="8 12"/>'],
 ['vwap-momentum-agent','VWAP','Price, weighted by volume.','#0891b2','M100 280 C240 290 250 150 400 210 S650 120 900 90','<path d="M100 260 Q500 150 920 170M100 160 Q500 50 920 70M100 350 Q500 250 920 270"/>'],
 ['heikin-ashi-agent','HEIKIN ASHI','Smooth the candles. Inspect the trend.','#059669','M100 310 Q340 280 520 180 T910 75','<path d="M240 230V330M390 185V285M540 120V220M690 70V170M840 45V135" stroke-width="18"/>'],
 ['mean-reversion-agent','MEAN REVERSION','Bands. Deviation. Return.','#ea580c','M100 210 Q180 50 270 180 T450 210 T650 190 T900 200','<path d="M100 90 Q500 60 920 100M100 300 Q500 340 920 300M100 200H920" stroke-dasharray="8 12"/>'],
 ['macro-sentiment-agent','SENTIMENT PROXY','Candle-derived research signals.','#475569','M110 265 L270 210 L440 250 L620 110 L810 170 L920 90','<circle cx="270" cy="210" r="45"/><circle cx="620" cy="110" r="50"/><circle cx="810" cy="170" r="35"/>'],
];
fs.mkdirSync('public/images/products/verified-copy',{recursive:true});
for(const [id,title,subtitle,color,line,shape] of covers){
 const svg=`<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="750" viewBox="0 0 1200 750"><rect width="1200" height="750" fill="#f1eee7"/><text x="70" y="76" font-family="Arial,sans-serif" font-size="18" letter-spacing="4" fill="#53545b">CIVAL / STRATEGY SOURCE</text><text x="70" y="154" font-family="Arial,sans-serif" font-size="48" font-weight="700" fill="#191b22">${title}</text><text x="72" y="195" font-family="Arial,sans-serif" font-size="23" fill="#53545b">${subtitle}</text><g transform="translate(30,230)"><rect x="40" width="1060" height="350" rx="24" fill="#fff"/><g transform="translate(40,-10)" fill="none" stroke="${color}" stroke-width="3" opacity=".24">${shape}</g><path transform="translate(40,-10)" d="${line}" fill="none" stroke="${color}" stroke-width="7" stroke-linecap="round" stroke-linejoin="round"/></g><text x="72" y="657" font-family="Arial,sans-serif" font-size="18" fill="#53545b">Conceptual strategy illustration · Not a product screenshot</text><text x="72" y="699" font-family="Arial,sans-serif" font-size="16" fill="#53545b">READ THE SOURCE / CONFIGURE / VALIDATE</text></svg>`;
 fs.writeFileSync(`public/images/products/verified-copy/${id}.svg`,svg);
}
