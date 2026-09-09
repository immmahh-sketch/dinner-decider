// Read-only dump of beta groups + their testers + attached builds.
//   node scripts/check-beta-groups.mjs
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

const groups = await asc(`/v1/betaGroups?filter[app]=${APP_ID}&limit=50&fields[betaGroups]=name,isInternalGroup,hasAccessToAllBuilds,createdDate`);
if (!groups.ok) { console.error(JSON.stringify(groups.json, null, 2)); process.exit(1); }
for (const g of groups.json.data || []) {
  const a = g.attributes;
  console.log(`\n== ${a.name}  (id ${g.id})`);
  console.log(`   internal=${a.isInternalGroup}  allBuilds=${a.hasAccessToAllBuilds}`);
  const testers = await asc(`/v1/betaGroups/${g.id}/betaTesters?limit=200&fields[betaTesters]=email,firstName,lastName,inviteType,state`);
  for (const t of testers.json.data || []) {
    const ta = t.attributes;
    console.log(`   tester: ${ta.email}  ${ta.firstName || ''} ${ta.lastName || ''}  state=${ta.state}  invite=${ta.inviteType}`);
  }
  const builds = await asc(`/v1/betaGroups/${g.id}/builds?limit=20&fields[builds]=version,processingState`);
  for (const b of builds.json.data || []) {
    console.log(`   build: ${b.attributes.version}  ${b.attributes.processingState}`);
  }
}
