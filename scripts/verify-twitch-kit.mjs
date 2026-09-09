import fs from "node:fs/promises";
import path from "node:path";
import { createHash } from "node:crypto";
import sharp from "sharp";

const kitRoot = path.join(process.cwd(), "streaming", "cival-twitch-kit-v1");
const manifest = JSON.parse(await fs.readFile(path.join(kitRoot, "manifest.json"), "utf8"));
const failures = [];
let verified = 0;

for (const asset of manifest.assets) {
  const full = path.join(kitRoot, asset.path);
  try {
    const data = await fs.readFile(full);
    const hash = createHash("sha256").update(data).digest("hex");
    if (asset.bytes !== data.length) failures.push(`${asset.path}: expected ${asset.bytes} bytes, found ${data.length}`);
    if (asset.sha256 !== hash) failures.push(`${asset.path}: SHA-256 mismatch`);
    if (asset.format === "png") {
      const metadata = await sharp(data).metadata();
      if (metadata.width !== asset.width || metadata.height !== asset.height) failures.push(`${asset.path}: expected ${asset.width}x${asset.height}, found ${metadata.width}x${metadata.height}`);
      if (asset.transparent && !metadata.hasAlpha) failures.push(`${asset.path}: transparency was expected but alpha is absent`);
      if (asset.path.startsWith("panels/") && data.length > 1_000_000) failures.push(`${asset.path}: exceeds Twitch's 1 MB panel limit`);
      if (asset.path.startsWith("emotes/") && /-(112|56|28)\.png$/.test(asset.path) && data.length > 1_000_000) failures.push(`${asset.path}: exceeds Twitch's 1 MB emote limit`);
      if (asset.path.startsWith("subscriber-badges/") && data.length > 25_000) failures.push(`${asset.path}: exceeds Twitch's 25 KB badge limit`);
    }
    verified += 1;
  } catch (error) {
    failures.push(`${asset.path}: ${error.message}`);
  }
}

const expected = [
  "scenes/01-starting-soon.png",
  "scenes/02-be-right-back.png",
  "scenes/03-stream-ending.png",
  "scenes/04-offline.png",
  "overlays/product-clean-1920x1080.png",
  "overlays/product-webcam-1920x1080.png",
  "overlays/product-chat-1920x1080.png",
  "profile/twitch-profile-banner-1200x480.png",
  "profile/twitch-profile-picture-256.png",
];
for (const relative of expected) {
  try {
    await fs.access(path.join(kitRoot, relative));
  } catch {
    failures.push(`${relative}: required package asset is missing`);
  }
}

if (failures.length) {
  console.error(`Twitch kit verification failed (${failures.length} issues):`);
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exit(1);
}

console.log(`Twitch kit verified: ${verified} manifest assets, dimensions/hashes valid, upload limits passed.`);
