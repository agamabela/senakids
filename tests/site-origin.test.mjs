import test from 'node:test';
import assert from 'node:assert/strict';
import { getSiteUrl } from '../src/lib/site-url.js';

test('canonical origin rejects preview, local, malformed and insecure origins', () => {
  const saved = process.env.NEXT_PUBLIC_SITE_URL;
  try {
    for (const input of ['http://senakids.web.id', 'https://branch.vercel.app', 'http://127.0.0.1:3000', 'https://localhost:3000', 'not a url', 'https://preview.vercel.app/path']) {
      process.env.NEXT_PUBLIC_SITE_URL = input;
      assert.equal(getSiteUrl(), 'https://senakids.web.id', input);
    }
    process.env.NEXT_PUBLIC_SITE_URL = 'https://senakids.web.id/some-path/';
    assert.equal(getSiteUrl(), 'https://senakids.web.id');
  } finally {
    if (saved === undefined) delete process.env.NEXT_PUBLIC_SITE_URL;
    else process.env.NEXT_PUBLIC_SITE_URL = saved;
  }
});
