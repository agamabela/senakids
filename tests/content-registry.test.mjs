import test from "node:test";
import assert from "node:assert/strict";
import {
  validateGameUrl,
  validateToyTheaterGame,
  ALLOWED_EXTERNAL_ORIGINS,
  LETS_READ_STORIES,
  INTERACTIVE_LEARNING_BOOKS,
  CURATED_TV_VIDEOS,
  getStoryBySlug,
} from "../src/lib/content-registry.js";

test("validateGameUrl approves exact whitelisted origins with HTTPS", () => {
  const allowedSamples = [
    "https://kindahardgolf.com",
    "https://kindahardgolf.com/play",
    "https://plastelina.net/cannibals-missionaries-fullscreen",
    "https://game.rodocodo.com/hour-of-code",
    "https://genshin-music.specy.app/zen-keyboard",
    "https://toytheater.com/basketball/",
  ];

  for (const url of allowedSamples) {
    const res = validateGameUrl(url);
    assert.equal(res.allowed, true, `Expected ${url} to be allowed`);
    assert.ok(res.origin);
  }
});

test("validateGameUrl rejects arbitrary, insecure, or malicious URLs", () => {
  const rejectedSamples = [
    "",
    null,
    undefined,
    "http://kindahardgolf.com", // Insecure HTTP
    "https://evil-site.com/game",
    "https://scratch.mit.edu.malicious.com",
    "javascript:alert(1)",
    "data:text/html,<script>alert(1)</script>",
    "file:///etc/passwd",
    "ftp://example.com",
    "https://subdomain.fake-rodocodo.com",
  ];

  for (const url of rejectedSamples) {
    const res = validateGameUrl(url);
    assert.equal(res.allowed, false, `Expected ${url} to be rejected`);
    assert.ok(res.error);
  }
});

test("validateToyTheaterGame approves valid games and rejects unknown", () => {
  assert.equal(validateToyTheaterGame("basketball"), true);
  assert.equal(validateToyTheaterGame("bowling"), true);
  assert.equal(validateToyTheaterGame("fruit-fall"), true);
  assert.equal(validateToyTheaterGame("unknown-game-xyz"), false);
  assert.equal(validateToyTheaterGame(""), false);
});

test("All Let's Read stories have unique slugs, valid attributes, and attribution", () => {
  const slugs = new Set();
  const ids = new Set();

  for (const story of LETS_READ_STORIES) {
    assert.ok(story.id, "Story must have an ID");
    assert.ok(story.slug, `Story ${story.id} must have a slug`);
    assert.ok(!slugs.has(story.slug), `Duplicate slug detected: ${story.slug}`);
    assert.ok(!ids.has(story.id), `Duplicate ID detected: ${story.id}`);
    slugs.add(story.slug);
    ids.add(story.id);

    assert.ok(story.title.id && story.title.en, `Story ${story.slug} must have ID and EN title`);
    assert.ok(story.description.id && story.description.en, `Story ${story.slug} must have ID and EN description`);
    assert.ok(story.cover.startsWith("https://"), `Story ${story.slug} must have secure cover URL`);
    assert.ok(story.url.startsWith("https://www.letsreadasia.org/"), `Story ${story.slug} must point to Let's Read`);
    assert.equal(story.publisher, "The Asia Foundation");
    assert.equal(story.license, "CC BY 4.0");
  }

  assert.ok(LETS_READ_STORIES.length >= 15, "Should have at least 15 curated stories");
});

test("getStoryBySlug resolves stories by slug or ID", () => {
  const story = getStoryBySlug("jangan-sampai-ibu-tahu");
  assert.ok(story);
  assert.equal(story.title.id, "Jangan Sampai Ibu Tahu");

  const storyById = getStoryBySlug("b2dfb64f-5b97-4697-86f3-f1f583e08553");
  assert.ok(storyById);
  assert.equal(storyById.slug, "jangan-sampai-ibu-tahu");

  assert.equal(getStoryBySlug("non-existent-slug"), null);
});

test("Curated TV videos have valid YouTube IDs and metadata", () => {
  for (const video of CURATED_TV_VIDEOS) {
    assert.ok(video.id);
    assert.ok(video.title);
    assert.ok(video.channel);
    assert.ok(video.youtubeId && video.youtubeId.length === 11, `Invalid youtubeId on ${video.id}`);
    assert.ok(video.duration);
    assert.ok(video.topics.length > 0);
  }
});
