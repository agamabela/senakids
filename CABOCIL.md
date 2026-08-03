# CaBocil Design System Guidelines

## Context and Goals

### Mission
Create implementation-ready, token-driven UI guidance for CaBocil that is optimized for consistency, accessibility, and fast delivery across the documentation site.

### Brand Context
- **Product/Brand**: CaBocil
- **Product Surface**: Documentation & Hub Site
- **Target Audience**: Developers, educators, and technical teams
- **Core Principle**: Deliver a minimal, utility-first, accessibility-prioritized design system that works seamlessly for games, stories, and developer guides.

---

## Design Tokens and Foundations

### Typography
The typography system is built around the **Nunito** font stack to maintain readability while ensuring a modern, clean look.

- **Primary Font Family**: `Nunito`
- **Fallback Font Stack**: `Nunito, Nunito Fallback, system-ui, sans-serif`
- **Base Font Size**: `14px` (`0.875rem`)
- **Base Font Weight**: `400` (Regular)
- **Base Line Height**: `17.5px` (1.25)
- **Typography Scale**:
  - `font.size.xs`: `14px` (`0.875rem`)
  - `font.size.sm`: `18px` (`1.125rem`)
  - `font.size.md`: `24px` (`1.5rem`)
  - `font.size.lg`: `32px` (`2rem`)

### Color Palette & Semantic Tokens
To enforce **WCAG 2.2 AA Compliance**, color tokens are divided into strict light and dark semantic themes. Teams must use these semantic tokens instead of hardcoded hex values.

| Token Name | Light Theme Value | Dark Theme Value | Design Intent & Usage |
| :--- | :--- | :--- | :--- |
| `color.text.primary` | `#334155` (Slate-700) | `#f1f5f9` (Slate-100) | Main body text and descriptive content. |
| `color.text.heading` | `#000000` (Black) | `#ffffff` (White) | Titles, headers, and major subtitles. |
| `color.text.muted` | `#64748b` (Slate-500) | `#94a3b8` (Slate-400) | Subtexts, disabled text states, and captions. |
| `color.surface.base` | `#ffffff` (White) | `#000000` (Black) | Document canvas and root background. |
| `color.surface.card` | `#f8fafc` (Slate-50) | `#0d111c` (Slate-950) | Inner card bodies and panels. |
| `color.border.default` | `#c9d8ec` (Soft light-blue) | `#334155` (Slate-700) | Standard divider borders and button outlines. |
| `color.focus.ring` | `oklab(0.718 0.151 0.090 / 0.5)` | `oklab(0.718 0.151 0.090 / 0.7)` | High-contrast amber-orange outline glow. |

### Spacing Scale
The spacing scale is derived from a strict modular grid to maintain layout consistency.

- `--space-xs`: `4px` (`0.25rem`)
- `--space-sm`: `8px` (`0.5rem`)
- `--space-md`: `12px` (`0.75rem`)
- `--space-lg`: `16px` (`1rem`)
- `--space-xl`: `24px` (`1.5rem`)
- `--space-2xl`: `32px` (`2rem`)
- `--space-3xl`: `48px` (`3rem`)

### Radius, Shadow, & Motion
- **Radius Sm**: `8px`
- **Radius Md**: `12px`
- **Radius Lg**: `16px`
- **Radius Full**: `9999px`
- **Shadow Default**: `0 1px 2px 0 rgba(0, 0, 0, 0.05)`
- **Shadow Hover**: `0 4px 12px 0 rgba(0, 0, 0, 0.08)`
- **Transition Duration (Instant)**: `180ms` (using `--transition-instant: 180ms cubic-bezier(0.16, 1, 0.3, 1)`)

---

## Component-Level Rules

All components must define state rules for the 7 primary states: **Default, Hover, Focus-visible, Active, Disabled, Loading, and Error**.

### 1. Cards (Component Density: 869)
Cards are the primary content grouping elements.

- **Anatomy**: Card wrapper, marker/icon placeholder, content area (title + subtitle), action indicator (arrow).
- **Spacing**: Card wrapper must use `--space-lg` padding with `--space-md` gaps.
- **States**:
  - *Default*: Border `color.border.default`, Background `color.surface.card`.
  - *Hover*: Border becomes primary accent, Background shifts slightly, Arrow moves `2px` horizontally.
  - *Focus-visible*: Focus outline `3px solid color.focus.ring` with `outline-offset: 3px`.
  - *Active*: Scale down by 2% (transform: `scale(0.98)`).
  - *Disabled*: Opacity `0.5`, pointer-events `none`.
  - *Loading*: Show skeleton overlay pulsing between `0.4` and `0.8` opacity.
  - *Error*: Border color shifts to red alert (`#ef4444`).
- **Behaviors**:
  - *Pointer*: Cursor must be `pointer`. Entire card body must be clickable.
  - *Keyboard*: Card must be focusable using `Tab` key if it acts as a link. Triggering `Enter` or `Space` must navigate to the destination.
  - *Touch*: Minimum target size must be at least `44px` height/width.
  - *Overflow & Empty*: Long titles must truncate using `text-overflow: ellipsis` at 2 lines. Empty states must render a placeholder illustration with a descriptive text block.

### 2. Buttons (Component Density: 378)
Buttons trigger actions.

- **Anatomy**: Button container, optional leading icon, label text, optional trailing icon.
- **Spacing**: Padding must be exactly `10px 18px` with `--space-sm` gap between icon and text.
- **States**:
  - *Default*: Border `1px solid color.border.default`, background `color.surface.base`, text `color.text.primary`.
  - *Hover*: Background color shifts to slightly muted shade of primary/accent.
  - *Focus-visible*: Outline `3px solid color.focus.ring` with `outline-offset: 3px`.
  - *Active*: Transform `scale(0.96)`.
  - *Disabled*: Opacity `0.5`, cursor `not-allowed`.
  - *Loading*: Button label is hidden; spinner container is centered with same dimensions.
  - *Error*: Border color shifts to `#ef4444`.
- **Behaviors**:
  - *Pointer/Touch*: Minimum target size must be at least `44px` height and width.
  - *Keyboard*: Triggering `Enter` or `Space` must invoke the action handler.

### 3. Links (Component Density: 65)
Links are inline navigation tags.

- **Anatomy**: Inline text link, optional external link icon.
- **States**:
  - *Default*: Underline decoration must be visible on hover or default. Color must be `color.text.primary`.
  - *Hover*: Underline weight increases or shifts color.
  - *Focus-visible*: Outline `2px solid color.focus.ring` with `outline-offset: 2px`.
  - *Active*: Color shifts to darker shade.
  - *Disabled*: Opacity `0.4`, pointer-events `none`.
  - *Loading & Error*: Display fallback standard states.
- **Behaviors**:
  - *Keyboard*: Triggering `Enter` must activate navigation.

### 4. Navigation (Component Density: 2)
Navigation wraps pages and directs users across sections.

- **Anatomy**: Sticky container, brand logo, navigation links list, action area (language toggle, session controller).
- **States**:
  - *Default*: Sticky header at `top: 0`, z-index `40`, border-bottom `1px solid color.border.default`.
  - *Focus-visible*: Any interactive nav-link must show the `color.focus.ring`.
  - *Responsive*: Below `768px`, navigation should collapse secondary items into a slide-over mobile menu drawer.
- **Behaviors**:
  - *Keyboard*: Must support `Tab` navigation through all links in a logical order (left to right).

---

## Accessibility Requirements (WCAG 2.2 AA)

To satisfy accessibility gates, every implementation must comply with:
1. **Focus Outline Visibility**: Interactive elements must not hide the default outline unless a custom `:focus-visible` ring is defined.
2. **Text Contrast**: Text colors must have a minimum contrast ratio of `4.5:1` against their backgrounds (and `3.0:1` for large text > 18pt).
3. **Keyboard Access**: Users must be able to navigate and activate all components using only the `Tab`, `Shift+Tab`, `Enter`, and `Space` keys.
4. **Accessible Labels**: Every icon-only button must have an explicit `aria-label` or `sr-only` text label.

### Testable Acceptance Criteria
- [ ] PASS: Element contrast ratio is checked using Chrome DevTools and passes >= 4.5:1.
- [ ] PASS: Navigating with the Tab key highlights each interactive element in order with a checked focus ring.
- [ ] PASS: Pressing Enter or Space triggers the action or link.
- [ ] PASS: Screen reader announces correct roles for all custom components (e.g. `role="dialog"` for modals).

---

## Content and Tone Standards

### Tone Rules
- **Concise**: Say what needs to be said without flowery adjectives.
- **Confident**: Use active voice. Avoid words like "might", "may", or "please".
- **Implementation-Focused**: Explain *how* components behave, not just how they look.

### Writing Examples
- *Bad*: "You might want to click this button to save your work, if that's okay."
- *Good*: "Click **Save** to persist changes. Unsaved progress will be lost."

---

## Anti-Patterns and Prohibited Actions

- **Do NOT** use hardcoded hexadecimal colors (`#ffffff`, `#334155`) in component styling. You must reference semantic variables.
- **Do NOT** hide focus indicators. If standard outline is disabled, you must replace it with the custom `color.focus.ring`.
- **Do NOT** allow layout heights that clip text. Ensure containers support responsive auto-heights.
- **Do NOT** use ambiguous button actions like "Click Here" or "Go". Use descriptive names like "Explore Games" or "Back to Home".

---

## QA Checklist

- [ ] All colors resolve back to theme-defined semantic tokens.
- [ ] The font stack resolved is Nunito.
- [ ] Font size base starts at `14px` on html/body.
- [ ] Transitions use `180ms` instant timing where specified.
- [ ] Focus rings utilize the `oklab(...)` formula and are visible on keyboard Tab focus.
- [ ] Buttons and links possess a minimum tap target of `44px` on mobile layouts.
- [ ] Page builds successfully without any syntax errors.
