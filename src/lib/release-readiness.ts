import releases from './source-releases.json';

// Owner-authorized sale of downloadable UI/source and strategy frameworks.
// This registry establishes exact artifact identity, not unattended trading certification.
export const SOURCE_RELEASES_ON_HOLD = false;
export function needsReleaseAcceptance(id: string): boolean {
  return id === 'everything-bundle';
}
export function matchesSourceRelease(id: string, sha256: string | null | undefined, bytes: number | null | undefined, version: string | null | undefined): boolean {
  const release = (releases as Record<string, {sha256: string; bytes: number; version: string}>)[id];
  return !!release && release.sha256 === sha256 && release.bytes === Number(bytes) && release.version === version;
}
