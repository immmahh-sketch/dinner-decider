// Adds external TestFlight testers to the Dinner Decider app via the App Store
// Connect API. Idempotent — re-running just ensures each email is in the group.
//
//   node scripts/add-testflight-testers.mjs
//
// Needs: credentials/asc-api-key.p8

import { readFileSync } from 'node:fs';
import { createSign, createPrivateKey } from 'node:crypto';

const KEY_ID = '4ZR5S4Q694';
const ISSUER_ID = 'f8769ad5-5ffd-49be-9b53-a5071535fa8c';
const APP_ID = '6809964712';

const TESTERS = [
  { email: 'immmahh@hotmail.com', firstName: 'Paul', lastName: 'Riley' },
  { email: 'laurabethriley@hotmail.com', firstName: 'Laura', lastName: 'Riley' },
];

const p8 = readFileSync('credentials/asc-api-key.p8', 'utf8');
function jwt() {
  const header = { alg: 'ES256', kid: KEY_ID, typ: 'JWT' };
  const now = Math.floor(Date.now() / 1000);
  const payload = { iss: ISSUER_ID, iat: now, exp: now + 1140, aud: 'appstoreconnect-v1' };
  const b64 = (o) => Buffer.from(JSON.stringify(o)).toString('base64url');
  const input = `${b64(header)}.${b64(payload)}`;
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
  const text = await res.text();
  let json;
  try { json = text ? JSON.parse(text) : {}; } catch { json = { raw: text }; }
  return { ok: res.ok, status: res.status, json };
}

// 1. find (or report) the external beta group
const groups = await asc('GET', `/v1/apps/${APP_ID}/betaGroups?limit=200`);
if (!groups.ok) {
  console.error('Could not list beta groups:', JSON.stringify(groups.json, null, 2));
  process.exit(1);
}
const all = groups.json.data || [];
console.log('Beta groups:');
for (const g of all) {
  console.log(
    `  ${g.id}  "${g.attributes.name}"  internal=${g.attributes.isInternalGroup}  public=${g.attributes.publicLinkEnabled}`,
  );
}
let group = all.find((g) => !g.attributes.isInternalGroup);
if (!group) {
  console.log('\nNo external group found — creating "External Testers"…');
  const created = await asc('POST', '/v1/betaGroups', {
    data: {
      type: 'betaGroups',
      attributes: { name: 'External Testers', publicLinkEnabled: false },
      relationships: { app: { data: { type: 'apps', id: APP_ID } } },
    },
  });
  if (!created.ok) {
    console.error('Create group failed:', JSON.stringify(created.json, null, 2));
    process.exit(1);
  }
  group = created.json.data;
}
console.log(`\nUsing group ${group.id} "${group.attributes.name}"\n`);

// 2. add each tester to that group
for (const t of TESTERS) {
  const r = await asc('POST', '/v1/betaTesters', {
    data: {
      type: 'betaTesters',
      attributes: { email: t.email, firstName: t.firstName, lastName: t.lastName },
      relationships: {
        betaGroups: { data: [{ type: 'betaGroups', id: group.id }] },
      },
    },
  });
  if (r.ok) {
    console.log(`  + ${t.email} — invited & added to group`);
    continue;
  }
  const code = (r.json.errors || [])[0]?.code || '';
  if (r.status === 409 || /ENTITY_ERROR.*EXISTS|already exists/i.test(JSON.stringify(r.json))) {
    // tester exists — find their id and attach to the group
    const found = await asc(
      'GET',
      `/v1/betaTesters?filter[email]=${encodeURIComponent(t.email)}&limit=1`,
    );
    const id = found.json.data?.[0]?.id;
    if (!id) {
      console.log(`  ! ${t.email} — exists but couldn't resolve id:`, JSON.stringify(r.json));
      continue;
    }
    const link = await asc('POST', `/v1/betaGroups/${group.id}/relationships/betaTesters`, {
      data: [{ type: 'betaTesters', id }],
    });
    console.log(
      link.ok
        ? `  = ${t.email} — already a tester, ensured in group`
        : `  ! ${t.email} — link failed: ${JSON.stringify(link.json)}`,
    );
  } else {
    console.log(`  ! ${t.email} — ${r.status} ${code}\n    ${JSON.stringify(r.json)}`);
  }
}
console.log('\nDone. Testers get an email invite; they redeem it in the TestFlight app.');
