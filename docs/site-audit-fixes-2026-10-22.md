# Sena Kids audit fixes, October 22, 2026

## Scope and design decisions

Addresses the ten findings from the live-site audit: silent music, hidden blog,
unsupported trust claims, broken game art, timer anchor, incomplete drawing tools,
unavailable history-download promise, ambiguous parent navigation, oversized mobile
hero, and insufficient game suitability guidance.

The existing DESIGN.md direction is retained (Energy 2, Rhythm 3, Motion 2,
Density 2). Anti-slop is applied during implementation. The small-screen hero
prioritizes four activity choices over decorative art. Parent articles use a
separate text-led shelf and a visible shortcut rather than competing with child
activity cards. Local game illustrations replace broken external assets. Music
has no perpetual pulse and starts only on explicit interaction.

## Functional changes

- An original local 24-second music-box track replaces the hidden YouTube player.
  Loading/error/playing feedback follows real audio state. Quiet Mode pauses it
  immediately across route transitions and responds to browser preference changes.
- Drawing supports brush, eraser, three stamps, Undo, Redo, reversible Clear,
  and PNG export. Logical canvas coordinates preserve art when its display size
  changes. Keyboard arrows and Enter/Space provide an alternative to pointer input.
- Timer preferences now drive a real, once-per-day break reminder based on visible
  time in this browser. It is a reminder, not an enforced lock or account-wide limit.
- Articles have desktop navigation, a hero shortcut, homepage previews and clear
  menu/footer labels. Parent settings use a different name from editorial content.
- Third-party content is identified without claiming tracking or advertising is
  impossible. Nonexistent history-download promises are removed.
- Game ages are explicitly suggestions, not a certification. Controls are stated
  for known supported games; other cards direct users to the game's controls.

## Search and deployment

- Sitemap uses the canonical HTTPS origin, includes learning journeys and Ski Free,
  and omits unverified blanket modification dates. Article publication dates remain.
- Canonical-origin validation rejects insecure/local/preview/malformed origins.
- The HTTP homepage exclusion in Search Console is expected: it redirects to HTTPS.
  It should not be made independently indexable.
- At inspection, Search Console had no submitted sitemap. Submit the verified
  production sitemap after deployment and request indexing for key destinations.
- Builds now generate Prisma's client and compile Next.js only. Database schema
  changes and administrator provisioning are no longer deployment side effects.

## Verification before deployment

- Production compilation passed.
- 34 unit/source checks and 21 route/integration checks passed.
- All 89 sitemap destinations returned HTTP 200 with canonical tags and no noindex
  directive in the production preview.
- Browser checks: actual music playback and advancing time; immediate Quiet Mode
  pause; stamps and Undo; valid 900x500 PNG export; repaired game images; article
  shortcut; no horizontal overflow at the available narrow and wide browser sizes.
- The browser automation download event did not expose data-URL downloads. The
  actual exported PNG bytes were saved and visually inspected instead.
- The separate database rate-limiter suite did not pass in the restricted initial
  run; it is not included in the 55 passing checks above.

## Rollback

Revert the audit-fix commits and redeploy. No database migration is required.
Google decides when to recrawl and index submitted URLs; submission does not
promise indexing or rankings.
