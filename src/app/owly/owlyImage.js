// ═══════════════════════════════════════════════════════════════════════════
// OWLY — Image helper
// ---------------------------------------------------------------------------
// Builds a text-to-image URL for every picture used in the program. We keep the
// subject short in the data (e.g. "a shiny red apple") and append a consistent
// child-friendly art style here so all illustrations match.
// ═══════════════════════════════════════════════════════════════════════════

// Every picture subject (e.g. "a shiny red apple") maps to a real image that
// was downloaded once from a free image source into /public/owly-img. We serve
// those local static files so nothing depends on a live external API at runtime.

// Turn a subject description into a stable file slug.
// "a shiny red apple" -> "a-shiny-red-apple"
export function owlySlug(subject) {
  return String(subject)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function owlyImg(subject) {
  return `/owly-img/${owlySlug(subject)}.jpg`;
}

// The mascot: a single consistent character reused everywhere.
export const OWLY_SUBJECT =
  "a friendly cartoon baby owl mascot named Owly, big round eyes, " +
  "fluffy teal and cream feathers, tiny orange beak, cheerful expression";

export function owlyMascot() {
  return owlyImg(OWLY_SUBJECT);
}
