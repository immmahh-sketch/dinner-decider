// Creates an Apple Distribution certificate + App Store provisioning profile for
// com.dinnerdecider.app via the App Store Connect API, packages them, and writes
// credentials.json so `eas build --profile testflight` can sign locally.
//
//   node scripts/make-ios-credentials.mjs
//
// Needs: credentials/asc-api-key.p8, key id + issuer id below, openssl on PATH.
import { execFileSync } from 'node:child_process';
import { writeFileSync, readFileSync, mkdirSync } from 'node:fs';
import { createSign, createPrivateKey } from 'node:crypto';

const KEY_ID = '4ZR5S4Q694';
const ISSUER_ID = 'f8769ad5-5ffd-49be-9b53-a5071535fa8c';
const BUNDLE_ID = 'com.dinnerdecider.app';
const APP_NAME = 'Dinner Decider';
const P12_PASSWORD = 'dinnerdecider';
const DIR = 'credentials';
mkdirSync(DIR, { recursive: true });

// ---- ASC API JWT (ES256) ------------------------------------------------
const p8 = readFileSync(`${DIR}/asc-api-key.p8`, 'utf8');
function jwt() {
  const header = { alg: 'ES256', kid: KEY_ID, typ: 'JWT' };
  const now = Math.floor(Date.now() / 1000);
  const payload = { iss: ISSUER_ID, iat: now, exp: now + 1140, aud: 'appstoreconnect-v1' };
  const b64 = (o) => Buffer.from(JSON.stringify(o)).toString('base64url');
  const signingInput = `${b64(header)}.${b64(payload)}`;
  const signer = createSign('SHA256');
  signer.update(signingInput);
  const der = signer.sign({ key: createPrivateKey(p8), dsaEncoding: 'ieee-p1363' });
  return `${signingInput}.${der.toString('base64url')}`;
}
const API = 'https://api.appstoreconnect.apple.com';
async function asc(method, path, body) {
  const res = await fetch(API + path, {
    method,
    headers: { Authorization: `Bearer ${jwt()}`, 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  let json;
  try { json = text ? JSON.parse(text) : {}; } catch { json = { raw: text }; }
  if (!res.ok) {
    const err = new Error(`${method} ${path} -> ${res.status}\n${JSON.stringify(json, null, 2)}`);
    err.status = res.status;
    err.json = json;
    throw err;
  }
  return json;
}

const run = (cmd, args, opts = {}) => execFileSync(cmd, args, { stdio: ['pipe', 'pipe', 'inherit'], ...opts });

// ---- 1. private key + CSR --------------------------------------------------
console.log('· generating private key + CSR');
run('openssl', ['genrsa', '-out', `${DIR}/dist.key`, '2048']);
run('openssl', ['req', '-new', '-key', `${DIR}/dist.key`, '-out', `${DIR}/dist.csr`,
  '-subj', `/CN=${APP_NAME} Distribution/O=${APP_NAME}/C=GB`]);
const csr = readFileSync(`${DIR}/dist.csr`, 'utf8');

// ---- 2. list existing distribution certs (headroom check) ---------------
const certs = await asc('GET', '/v1/certificates?limit=200');
const dist = certs.data.filter((c) => /DISTRIBUTION/.test(c.attributes.certificateType));
console.log(`· existing distribution certs: ${dist.length}`);
dist.forEach((c) => console.log(`    ${c.id}  ${c.attributes.certificateType}  ${c.attributes.name}  exp ${c.attributes.expirationDate}`));

// ---- 3. create the certificate ----------------------------------------
console.log('· creating Apple Distribution certificate');
let cert;
try {
  cert = await asc('POST', '/v1/certificates', {
    data: { type: 'certificates', attributes: { certificateType: 'DISTRIBUTION', csrContent: csr } },
  });
} catch (e) {
  if (e.status === 409 || /maximum/i.test(JSON.stringify(e.json))) {
    console.error('\n!! Apple says the certificate limit is reached. Revoke an unused distribution');
    console.error('   certificate at https://developer.apple.com/account/resources/certificates and re-run.\n');
  }
  throw e;
}
const certId = cert.data.id;
const certContentB64 = cert.data.attributes.certificateContent; // base64 DER
writeFileSync(`${DIR}/dist.cer`, Buffer.from(certContentB64, 'base64'));
console.log(`    cert id ${certId}`);

// ---- 4. package cert + key into a .p12 --------------------------------
console.log('· packaging .p12');
run('openssl', ['x509', '-inform', 'der', '-in', `${DIR}/dist.cer`, '-out', `${DIR}/dist.pem`]);
run('openssl', ['pkcs12', '-export', '-legacy',
  '-out', `${DIR}/dist.p12`,
  '-inkey', `${DIR}/dist.key`,
  '-in', `${DIR}/dist.pem`,
  '-name', `${APP_NAME} Distribution`,
  '-passout', `pass:${P12_PASSWORD}`]);

// ---- 5. ensure the bundle id exists ---------------------------------
console.log('· ensuring bundle id');
const bundleIds = await asc('GET', `/v1/bundleIds?filter[identifier]=${encodeURIComponent(BUNDLE_ID)}&limit=200`);
let bundleId = bundleIds.data.find((b) => b.attributes.identifier === BUNDLE_ID);
if (!bundleId) {
  bundleId = (await asc('POST', '/v1/bundleIds', {
    data: { type: 'bundleIds', attributes: { identifier: BUNDLE_ID, name: APP_NAME.replace(/[^A-Za-z0-9 ]/g, ''), platform: 'IOS' } },
  })).data;
  console.log(`    registered ${bundleId.id}`);
} else {
  console.log(`    exists ${bundleId.id}`);
}

// ---- 6. create the App Store provisioning profile -------------------
console.log('· creating App Store provisioning profile');
// remove any stale profile of the same name first
const existingProfiles = await asc('GET', '/v1/profiles?limit=200');
for (const p of existingProfiles.data) {
  if (p.attributes.name === `${APP_NAME} App Store`) {
    await asc('DELETE', `/v1/profiles/${p.id}`).catch(() => {});
    console.log(`    removed stale profile ${p.id}`);
  }
}
const profile = await asc('POST', '/v1/profiles', {
  data: {
    type: 'profiles',
    attributes: { name: `${APP_NAME} App Store`, profileType: 'IOS_APP_STORE' },
    relationships: {
      bundleId: { data: { type: 'bundleIds', id: bundleId.id } },
      certificates: { data: [{ type: 'certificates', id: certId }] },
    },
  },
});
writeFileSync(`${DIR}/dinnerdecider.mobileprovision`, Buffer.from(profile.data.attributes.profileContent, 'base64'));
console.log(`    profile id ${profile.data.id}`);

// ---- 7. credentials.json ------------------------------------------------
writeFileSync('credentials.json', JSON.stringify({
  ios: {
    provisioningProfilePath: `${DIR}/dinnerdecider.mobileprovision`,
    distributionCertificate: { path: `${DIR}/dist.p12`, password: P12_PASSWORD },
  },
}, null, 2) + '\n');

console.log('\n✓ wrote credentials.json, credentials/dist.p12, credentials/dinnerdecider.mobileprovision');
