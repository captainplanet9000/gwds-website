'use client';

import { useRef, useState } from 'react';
import Image from 'next/image';
import { type ProductScreenshot, screenshotLabels, screenshotDisclosure } from '@/lib/product-media';
import styles from './ProductGallery.module.css';
import dimensions from '@/lib/product-capture-dimensions.json';

const size = (src: string) => (dimensions as Record<string, { width: number; height: number }>)[src.split('/').pop()!] || { width: 1272, height: 716 };

export default function ProductGallery({ images, name }: { images: ProductScreenshot[]; name: string }) {
  const [selected, setSelected] = useState(0);
  const dialog = useRef<HTMLDialogElement>(null);
  const current = images[selected];
  if (!current) return null;
  const move = (direction: number) => setSelected(i => (i + direction + images.length) % images.length);

  return <div className={styles.gallery}>
    <button className={styles.hero} onClick={() => dialog.current?.showModal()} aria-label={`Enlarge ${current.title}`}>
      <Image src={current.src} alt={current.title} {...size(current.src)} sizes="(max-width: 800px) 100vw, 620px" priority />
      <span className={styles.badge}>{screenshotLabels[current.source]}</span>
      <span className={styles.enlarge}>Enlarge ↗</span>
    </button>
    <div className={styles.caption} aria-live="polite"><strong>{current.title}</strong><p>{current.caption}</p></div>
    <div className={styles.thumbnails} aria-label={`${name} screenshots`}>
      {images.map((image, i) => <button key={image.src} aria-label={`View ${image.title}`} aria-pressed={i === selected} onClick={() => setSelected(i)}>
        <Image src={image.src} alt="" width={144} height={100} sizes="110px" />
        <span>{image.title}</span>
      </button>)}
    </div>
    <details className={styles.disclosure}><summary>About these screenshots and editions</summary><p>{screenshotDisclosure}</p><a href="https://ai-trading-dashboard-demo.vercel.app/dashboard" target="_blank" rel="noopener noreferrer">Explore the broader interactive demo ↗</a></details>
    <dialog ref={dialog} className={styles.dialog} aria-label={`${name} screenshot gallery`} onKeyDown={e => {
      if (e.key === 'ArrowRight') { e.preventDefault(); move(1); }
      if (e.key === 'ArrowLeft') { e.preventDefault(); move(-1); }
    }} onClick={e => { if (e.target === e.currentTarget) dialog.current?.close(); }}>
      <div className={styles.viewer}>
        <div className={styles.toolbar}><span>{screenshotLabels[current.source]} · {selected + 1}/{images.length}</span><button autoFocus onClick={() => dialog.current?.close()} aria-label="Close screenshot gallery">Close ✕</button></div>
        <Image src={current.src} alt={current.title} {...size(current.src)} sizes="95vw" />
        <div className={styles.caption}><strong>{current.title}</strong><p>{current.caption}</p></div>
        <div className={styles.controls}><button onClick={() => move(-1)} aria-label="Previous screenshot">← Previous</button><a href={current.src} target="_blank" rel="noopener noreferrer" style={{color:'#bfdbfe'}}>Open original image ↗</a><button onClick={() => move(1)} aria-label="Next screenshot">Next →</button></div>
      </div>
    </dialog>
  </div>;
}
