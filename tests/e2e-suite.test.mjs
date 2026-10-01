import test from "node:test";
import assert from "node:assert/strict";

const BASE_URL = "http://localhost:3000";

test("GET /robots.txt returns HTTP 200 with valid directives", async () => {
  const res = await fetch(`${BASE_URL}/robots.txt`);
  assert.equal(res.status, 200);
  const text = await res.text();
  assert.match(text, /User-Agent:\s*\*/i);
  assert.match(text, /Allow:\s*\//i);
  assert.match(text, /Disallow:\s*\/admin/i);
  assert.match(text, /Sitemap:\s*http.*\/sitemap\.xml/i);
});

test("GET /sitemap.xml returns HTTP 200 with public routes and no private routes", async () => {
  const res = await fetch(`${BASE_URL}/sitemap.xml`);
  assert.equal(res.status, 200);
  const xml = await res.text();
  assert.match(xml, /<loc>.*\/home<\/loc>/);
  assert.match(xml, /<loc>.*\/books<\/loc>/);
  assert.match(xml, /<loc>.*\/tv<\/loc>/);
  assert.match(xml, /<loc>.*\/games<\/loc>/);
  assert.match(xml, /<loc>.*\/books\/stories\/jangan-sampai-ibu-tahu<\/loc>/);
  assert.doesNotMatch(xml, /<loc>.*\/admin/);
  assert.doesNotMatch(xml, /<loc>.*\/api/);
});

test("GET / returns 308 Permanent Redirect to /home", async () => {
  const res = await fetch(`${BASE_URL}/`, { redirect: "manual" });
  assert.equal(res.status, 308);
  assert.equal(res.headers.get("location"), "/home");
});

test("GET /non-existent-page returns 404 Not Found", async () => {
  const res = await fetch(`${BASE_URL}/random-page-12345`);
  assert.equal(res.status, 404);
});

test("Security headers are enforced on public routes", async () => {
  const res = await fetch(`${BASE_URL}/home`);
  assert.equal(res.status, 200);
  const csp = res.headers.get("content-security-policy");
  assert.ok(csp, "CSP header missing");
  assert.match(csp, /default-src 'self'/);
  assert.match(csp, /frame-ancestors 'none'/);
  assert.match(csp, /object-src 'none'/);

  assert.equal(res.headers.get("x-content-type-options"), "nosniff");
  assert.equal(res.headers.get("referrer-policy"), "strict-origin-when-cross-origin");
  assert.match(res.headers.get("permissions-policy"), /camera=\(\)/);
  assert.ok(res.headers.get("strict-transport-security"), "HSTS header missing");
  assert.equal(res.headers.get("access-control-allow-origin"), null, "Access-Control-Allow-Origin should NOT be * on HTML pages");
});

test("Story route contains CreativeWork JSON-LD and CC BY 4.0 license", async () => {
  const res = await fetch(`${BASE_URL}/books/stories/jangan-sampai-ibu-tahu`);
  assert.equal(res.status, 200);
  const html = await res.text();
  assert.match(html, /schema\.org/);
  assert.match(html, /CreativeWork/);
  assert.match(html, /CC BY 4\.0/);
  assert.match(html, /Jangan Sampai Ibu Tahu/);
});

test("Auth register endpoint enforces minimum password length and parental consent", async () => {
  // Missing parental consent
  const res1 = await fetch(`${BASE_URL}/api/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: "Test Parent",
      email: "test_missing_consent@example.com",
      password: "StrongPassword123!",
      parentalConsent: false,
    }),
  });
  const data1 = await res1.json();
  assert.equal(res1.status, 400);
  assert.match(data1.error, /orang tua/i);

  // Weak password
  const res2 = await fetch(`${BASE_URL}/api/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: "Test Parent",
      email: "test_weak_pass@example.com",
      password: "123",
      parentalConsent: true,
    }),
  });
  const data2 = await res2.json();
  assert.equal(res2.status, 400);
  assert.match(data2.error, /8 karakter/i);
});

test("Forgot-password endpoint handles unknown email safely without user enumeration", async () => {
  const res = await fetch(`${BASE_URL}/api/auth/forgot-password`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: "definitely_unknown_email_9988@test.com" }),
  });
  assert.equal(res.status, 200);
  const data = await res.json();
  assert.equal(data.success, true);
});
