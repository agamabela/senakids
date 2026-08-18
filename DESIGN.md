# Sena Kids Design Direction

## Brand & Product Identity

- **Product**: Sena Kids
- **Purpose**: An interactive educational hub providing storybooks, literacy activities, creative tools, and mini-games for children, supported by parents and educators.
- **Tone & Mood**: Friendly, approachable, warm, tactile, and clear. Inspires curiosity without over-stimulating visual noise or generic AI tropes.
- **Audience**: Children aged 4–10 as primary users; educators and parents as facilitators.

---

## Design Dials (Anti-Slop Framework)

- **ENERGY: 2 / 5** — Calm, grounded earthy tones with purposeful warm accents; no neon glows or rainbow gradients.
- **RHYTHM: 3 / 5** — Structured visual variety: featured storybook showcases, categorized activity shelves, interactive arcade clusters.
- **MOTION: 2 / 5** — Tactile responsiveness (`180ms` spring press, subtle elevation on hover, zero unprompted looping pulses).
- **DENSITY: 2 / 5** — Spacious touch-first layouts with minimum `44px` interactive hit targets and generous margins.

---

## Typography

- **Heading Font**: `Nunito, 'Fredoka', cursive, system-ui, sans-serif` (Soft, friendly, legible letterforms for children).
- **Body Font**: `Nunito, system-ui, sans-serif` (Clean geometry, high legibility).
- **Base Font Size**: `14px` (`0.875rem`) to `16px` (`1rem`) on desktop.
- **Type Scale**:
  - `Display / Hero`: `2rem` (`32px`), weight 800
  - `Heading 2`: `1.5rem` (`24px`), weight 700
  - `Heading 3`: `1.125rem` (`18px`), weight 700
  - `Body / Subtitle`: `0.9375rem` (`15px`), weight 500 / 600
  - `Caption / Meta`: `0.8125rem` (`13px`), weight 600

---

## Color System (WCAG 2.2 AA Compliant)

### Light Theme (Default)
- **Page Canvas (`--color-background`)**: `#FAF6F0` (Warm cream/linen)
- **Card Surface (`--color-card` / `--color-surface`)**: `#FFFFFF` (Crisp clean white)
- **Muted Surface (`--color-surface-muted`)**: `#F2EBE1` (Soft warm beige)
- **Primary Text (`--color-text`)**: `#382E26` (Espresso brown, contrast > 8:1)
- **Heading Text (`--color-text-heading`)**: `#241C15` (Deep warm dark, contrast > 11:1)
- **Muted Text (`--color-text-muted`)**: `#6E5D4F` (Warm slate brown, contrast > 4.5:1)
- **Primary Accent (`--color-primary`)**: `#3D7843` (Deep friendly forest green, contrast > 4.5:1 on white/light)
- **Primary Surface Light (`--color-primary-light`)**: `#EAF2EB`
- **Border Default (`--color-border`)**: `#E2D7CB`
- **Focus Ring (`--color-focus-ring`)**: `oklab(0.718 0.151 0.090 / 0.7)`

### Dark Theme
- **Page Canvas (`--color-background`)**: `#161311` (Deep warm charcoal)
- **Card Surface (`--color-card` / `--color-surface`)**: `#211D19` (Elevated warm charcoal)
- **Muted Surface (`--color-surface-muted`)**: `#2C2622` (Subtle container surface)
- **Primary Text (`--color-text`)**: `#F4EFEA` (Warm soft off-white, contrast > 10:1)
- **Heading Text (`--color-text-heading`)**: `#FFFFFF` (Pure white)
- **Muted Text (`--color-text-muted`)**: `#B0A296` (Warm muted cream, contrast > 4.5:1)
- **Primary Accent (`--color-primary`)**: `#72AB79` (Soft sage green)
- **Primary Surface Light (`--color-primary-light`)**: `#2A3B2D`
- **Border Default (`--color-border`)**: `#38312A`
- **Focus Ring (`--color-focus-ring`)**: `oklab(0.718 0.151 0.090 / 0.85)`

### Semantic Category Color Badges
- **Books / Reading**: Forest Green (`#3D7843` light / `#72AB79` dark)
- **Science & Nature**: Ocean Slate (`#2A6F97` light / `#58A4D8` dark)
- **Logic & Math**: Warm Terracotta (`#C25732` light / `#E07A57` dark)
- **Creative & Arts**: Plum Rose (`#8A4F7D` light / `#B87BAA` dark)
- **Arcade & Games**: Warm Ochre (`#A8681A` light / `#DDA040` dark)

---

## Component Standards & States

Every interactive element must support 7 core states:
1. **Default**: Clear hierarchy, defined border and readable text.
2. **Hover**: Smooth `180ms` micro-lift (`translateY(-2px)`), slight border enhancement.
3. **Focus-visible**: High-contrast outline `3px solid var(--color-focus-ring)` with `2px` offset.
4. **Active**: Gentle press feedback (`scale(0.98)`).
5. **Disabled**: Reduced opacity (`0.5`), cursor `not-allowed`.
6. **Loading**: Skeleton pulse with accessible screen-reader announcement.
7. **Error**: Clear error border `#D32F2F` and descriptive error message.

---

## Craftsmanship & Anti-Slop Check

- [x] Zero generic em-dashes in copy.
- [x] Zero fake statistics or fabricated testimonials.
- [x] Zero non-functional decorative buttons or dead navigation links.
- [x] All touch targets at least `44px` on mobile.
- [x] Full keyboard navigability (Tab / Enter / Space / Escape).
