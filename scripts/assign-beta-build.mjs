// After `eas submit` uploads a build and Apple finishes processing it, this
// assigns the newest processed build to the External Testers beta group and
// submits it for Beta App Review so external testers can install it.
//
//   node scripts/assign-beta-build.mjs [buildNumber]
//
// Needs: credentials/asc-api-key.p8

import { readFileSync } from 'node:fs';
import { createSign, createPrivateKey } from 'node:crypto';

const KEY_ID = '4ZR5S4Q694';
const ISSUER_ID = 'f8769ad5-5ffd-49be-9b53-a5071535fa8c';
const APP_ID = '6809964712';
const GROUP_ID = 'fb5b5865-0c81-4301-9a94-1e8600926eba'; // "External Testers"
const WANT_BUILD_NUMBER = process.argv[2] || null;

const p8 = readFileSync('credentials/asc-api-key.p8', 'utf8');
function jwt() {
  const now = Math.floor(Date.now() / 1000);
  const b64 = (o) => Buffer.from(JSON.stringify(o)).toString('base64url');
  const input = `${b64({ alg: 'ES256', kid: KEY_ID, typ: 'JWT' })}.${b64({
    iss: ISSUER_ID,
    iat: now,
    exp: now + 1140,
    aud: 'appstoreconnect-v1',
  })}`;
  const sig = createSign('SHA256')
    .update(input)
    .sign({ key: createPrivateKey(p8), dsaEncoding: 'ieee-p1363' });
  return `${input}.${sig.toString('base64url')}`;
}
const API = 'https://api.appstoreconnect.apple.com';
async function asc(method, path, body) {
  const res = await fetch(API + path, {
    method,
    headers: { Authorization: `Bearer ${jwt()}`, 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
  });
  const t = await res.text();
  let j;
  try { j = t ? JSON.parse(t) : {}; } catch { j = { raw: t }; }
  return { ok: res.ok, status: res.status, json: j };
}

// 1. list recent builds
const builds = await asc(
  'GET',
  `/v1/builds?filter[app]=${APP_ID}&sort=-version&limit=10&include=preReleaseVersion&fields[builds]=version,processingState,uploadedDate,expired`,
);
if (!builds.ok) {
  console.error('list builds failed:', JSON.stringify(builds.json, null, 2));
  process.exit(1);
}
const list = builds.json.data || [];
console.log('Recent builds:');
for (const b of list) {
  console.log(
    `  id=${b.id}  build=${b.attributes.version}  state=${b.attributes.processingState}  uploaded=${b.attributes.uploadedDate}`,
  );
}

let build = WANT_BUILD_NUMBER
  ? list.find((b) => b.attributes.version === String(WANT_BUILD_NUMBER))
  : list.find((b) => b.attributes.processingState === 'VALID') || list[0];

if (!build) {
  console.log('\nNo matching build found yet.');
  process.exit(2);
}
if (build.attributes.processingState !== 'VALID') {
  console.log(
    `\nBuild ${build.attributes.version} is "${build.attributes.processingState}" — Apple is still processing it. Re-run in a few minutes.`,
  );
  process.exit(3);
}

console.log(`\nUsing build ${build.attributes.version} (id ${build.id}), state VALID.`);

// 2. set export compliance (no non-exempt encryption) if needed
const bd = await asc('GET', `/v1/builds/${build.id}?fields[builds]=usesNonExemptEncryption`);
if (bd.ok && bd.json.data?.attributes?.usesNonExemptEncryption == null) {
  const cc = await asc('PATCH', `/v1/builds/${build.id}`, {
    data: { type: 'builds', id: build.id, attributes: { usesNonExemptEncryption: false } },
  });
  console.log(cc.ok ? '  export compliance set (no non-exempt encryption)' : `  compliance PATCH: ${JSON.stringify(cc.json)}`);
}

// 3. attach the build to the External Testers group
const link = await asc('POST', `/v1/betaGroups/${GROUP_ID}/relationships/builds`, {
  data: [{ type: 'builds', id: build.id }],
});
console.log(
  link.ok
    ? '  build attached to "External Testers" group'
    : `  attach: ${link.status} ${JSON.stringify(link.json)}`,
);

// 4. submit for Beta App Review (external testing)
const review = await asc('POST', '/v1/betaAppReviewSubmissions', {
  data: { type: 'betaAppReviewSubmissions', relationships: { build: { data: { type: 'builds', id: build.id } } } },
});
if (review.ok) {
  console.log('  submitted for Beta App Review ✓');
} else {
  const msg = JSON.stringify(review.json);
  if (/already|exists|state/i.test(msg)) console.log('  Beta App Review: already submitted / not required');
  else console.log(`  Beta App Review: ${review.status} ${msg}`);
}

console.log('\nDone. Once Apple approves (email notification), testers see it in TestFlight.');
