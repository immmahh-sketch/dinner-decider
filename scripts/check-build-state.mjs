// Quick read-only poll of App Store Connect build processing state.
//   node scripts/check-build-state.mjs
// Needs: credentials/asc-api-key.p8

import { readFileSync } from 'node:fs';
import { createSign, createPrivateKey } from 'node:crypto';

const KEY_ID = '4ZR5S4Q694';
const ISSUER_ID = 'f8769ad5-5ffd-49be-9b53-a5071535fa8c';
const APP_ID = '6809964712';

const p8 = readFileSync('credentials/asc-api-key.p8', 'utf8');
function jwt() {
  const now = Math.floor(Date.now() / 1000);
  const b64 = (o) => Buffer.from(JSON.stringify(o)).toString('base64url');
  const input = `${b64({ alg: 'ES256', kid: KEY_ID, typ: 'JWT' })}.${b64({
    iss: ISSUER_ID, iat: now, exp: now + 1140, aud: 'appstoreconnect-v1',
  })}`;
  const sig = createSign('SHA256').update(input).sign({ key: createPrivateKey(p8), dsaEncoding: 'ieee-p1363' });
  return `${input}.${sig.toString('base64url')}`;
}
const API = 'https://api.appstoreconnect.apple.com';
async function asc(path) {
  const res = await fetch(API + path, { headers: { Authorization: `Bearer ${jwt()}` } });
  const t = await res.text();
  let j; try { j = t ? JSON.parse(t) : {}; } catch { j = { raw: t }; }
  return { ok: res.ok, status: res.status, json: j };
}

const builds = await asc(
  `/v1/builds?filter[app]=${APP_ID}&sort=-uploadedDate&limit=8&fields[builds]=version,processingState,uploadedDate,expired,usesNonExemptEncryption`,
);
if (!builds.ok) { console.error(JSON.stringify(builds.json, null, 2)); process.exit(1); }
for (const b of builds.json.data || []) {
  const a = b.attributes;
  console.log(`build ${a.version.padEnd(4)} state=${(a.processingState || '?').padEnd(12)} enc=${String(a.usesNonExemptEncryption)} expired=${a.expired} uploaded=${a.uploadedDate}`);
}
