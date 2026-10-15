import assert from "node:assert/strict";
import test from "node:test";

import { BLOG_POSTS } from "../src/lib/blog-posts.mjs";

test("blog posts use unique slugs and the real publication date", () => {
  const slugs = BLOG_POSTS.map((post) => post.slug);
  const publishedAt = BLOG_POSTS.map((post) => post.datePublished);

  assert.equal(new Set(slugs).size, BLOG_POSTS.length);
  assert.ok(publishedAt.every((date) => date === "2026-10-16"));
});

test("every post connects a parent question to a real Sena Kids destination", () => {
  for (const post of BLOG_POSTS) {
    assert.ok(post.title.length > 20);
    assert.ok(post.description.length > 80);
    assert.ok(post.relatedLinks.length >= 2);
    assert.ok(post.relatedLinks.every((link) => link.href.startsWith("/")));
  }
});
