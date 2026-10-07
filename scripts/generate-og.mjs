// Preserve the approved Cival Systems artwork; never regenerate legacy branding.
import { copyFileSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
const imageDirectory = join(dirname(fileURLToPath(import.meta.url)), '..', 'public', 'images');
const approved = join(imageDirectory, 'cival-systems-brand-20261006.png');
if (!existsSync(approved)) throw new Error('Approved Cival Systems social artwork is missing');
for (const filename of ['og-image.png', 'og-store.png']) copyFileSync(approved, join(imageDirectory, filename));
console.log('Cival Systems social images synchronized with approved artwork.');
