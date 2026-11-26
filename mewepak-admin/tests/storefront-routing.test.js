import assert from 'node:assert/strict';
import test from 'node:test';
import worker from '../worker/index.js';

const origin = 'https://storefront.example.test';

test('slashless asset redirects keep their status, destination and query', async () => {
  const location = '/products/?utm_source=guide';
  const environment = {
    ASSETS: {
      async fetch(request) {
        if (new URL(request.url).pathname === '/assets/original/seo-page-defaults.json') {
          return Response.json({});
        }
        assert.equal(request.url, origin + '/products?utm_source=guide');
        return new Response(null, { status: 307, headers: { location } });
      },
    },
  };
  const response = await worker.fetch(new Request(origin + '/products?utm_source=guide'), environment);
  assert.equal(response.status, 307);
  assert.equal(response.headers.get('location'), location);
});

test('a HEAD request can check the canonical products page without an HTML body', async () => {
  const environment = {
    ASSETS: {
      async fetch(request) {
        assert.equal(request.url, origin + '/products/');
        assert.equal(request.method, 'HEAD');
        return new Response(null, { headers: { 'content-type': 'text/html; charset=utf-8' } });
      },
    },
  };
  const response = await worker.fetch(new Request(origin + '/products/', { method: 'HEAD' }), environment);
  assert.equal(response.status, 200);
  assert.equal(response.headers.get('x-robots-tag'), 'noindex, follow');
  assert.equal(response.body, null);
});
