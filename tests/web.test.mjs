import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createLead, updateLeadStatus } from '../apps/web/src/api.js';
test('authenticated mutations preserve JSON Content-Type', async () => {
  const previous = globalThis.fetch;
  const requests=[];
  globalThis.fetch = async (url, options) => { requests.push(options); return new Response('{}', {headers:{'Content-Type':'application/json'}}); };
  try {
    await createLead('token', {companyName:'Test'});
    await updateLeadStatus('token', 1, 'won');
    for (const request of requests) {
      assert.equal(request.headers['Content-Type'], 'application/json');
      assert.equal(request.headers.Authorization, 'Bearer token');
      assert.doesNotThrow(() => JSON.parse(request.body));
    }
  } finally { globalThis.fetch=previous; }
});
