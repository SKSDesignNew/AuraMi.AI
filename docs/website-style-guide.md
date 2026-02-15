# AuraMi.AI — Website Style Guide (Aurora Night Theme)

Reference for all visual styles, tokens, and component patterns used across the website.

---

## Brand Identity

- **Name**: AuraMi.AI
- **Tagline**: "Your Family's Essence, Preserved Forever"
- **Theme**: Aurora Night (dark mode)
- **Wordmark**: `Aura` (shimmer animated) + `Mi` (bold, gradient) + `.AI` (medium, gradient)

---

## Color Palette

All colors are defined in `tailwind.config.ts` under `theme.extend.colors`.

### Primary Gradient Colors (Cyan / Purple / Lime)

| Token | Hex | Tailwind Class | Usage |
|-------|-----|----------------|-------|
| Pink (Cyan) | `#00F5FF` | `pink` | Primary accent, active states, glow effects |
| Pink Deep | `#00C4CC` | `pink-deep` | Hover/darker accent |
| Coral (Purple) | `#7B61FF` | `coral` | Secondary accent, gradient middle |
| Coral Deep | `#5E48CC` | `coral-deep` | Hover/darker purple |
| Gold (Lime) | `#BFFF00` | `gold` | Tertiary accent, gradient end |
| Gold Deep | `#A3D900` | `gold-deep` | Hover/darker lime |

### Brand Gradient

```
bg-gradient-to-r from-pink via-coral to-gold
```

CSS custom properties (in `app/globals.css`):
```css
--g: linear-gradient(135deg, #00F5FF, #7B61FF, #BFFF00);   /* diagonal */
--gh: linear-gradient(90deg, #00F5FF, #7B61FF, #BFFF00);   /* horizontal */
```

### Backgrounds (Dark)

| Token | Hex | Tailwind Class | Usage |
|-------|-----|----------------|-------|
| Main Background | `#080C18` | `bg-bg` | Primary page background |
| Alt Background | `#0E1324` | `bg-bg-alt` | Alternate sections, assistant bubbles |
| Dark Background | `#04060E` | `bg-bg-dark` | Footer, CTA sections |
| Card / White | `#131830` | `bg-card` or `bg-bg-white` | Cards, sidebar, inputs, modals |

### Text Scale (Light on Dark)

| Token | Hex | Tailwind Class | Usage |
|-------|-----|----------------|-------|
| 900 | `#E8F4FF` | `text-text-900` | Primary headings |
| 800 | `#C4DCF0` | `text-text-800` | Chat text, form inputs |
| 700 | `#94B8D8` | `text-text-700` | Body text, descriptions |
| 600 | `#6E96BC` | `text-text-600` | Secondary body, nav links |
| 500 | `#5078A0` | `text-text-500` | Muted text, subtitles |
| 400 | `#3D5E82` | `text-text-400` | Timestamps, very muted |
| 300 | `#2C4568` | `text-text-300` | Subtle elements |

### Accent Colors

| Token | Hex | Tailwind Class | Usage |
|-------|-----|----------------|-------|
| Teal | `#00F5FF` | `teal` | Same as pink (cyan primary) |
| Blue | `#7B61FF` | `blue` | Same as coral (purple) |
| Purple | `#B388FF` | `purple` | Light purple accents |

---

## Typography

### Font Families

| Token | Font | Tailwind Class | Usage |
|-------|------|----------------|-------|
| Display | Fraunces (serif) | `font-display` | Headings, brand, step numbers |
| Body | Plus Jakarta Sans (sans-serif) | `font-body` | Body text, buttons, nav |
| Mono | IBM Plex Mono (monospace) | `font-mono` | Section labels, badges, code |

### Heading Patterns

```html
<!-- Hero heading (clamp responsive) -->
<h1 class="font-display text-[clamp(2.8rem,6.5vw,4.8rem)] font-extrabold leading-[1.1] tracking-display">

<!-- Section heading -->
<h2 class="font-display text-[clamp(2rem,4.5vw,3rem)] font-extrabold tracking-section text-text-900">

<!-- Section label (mono, gradient) -->
<p class="section-label">Features</p>
```

---

## Shadows

| Token | Value | Tailwind Class | Usage |
|-------|-------|----------------|-------|
| Small | `0 1px 6px rgba(0,0,0,0.15)` | `shadow-sm` | Cards default |
| Medium | `0 4px 16px rgba(0,245,255,0.06)` | `shadow-md` | Elevated cards |
| Large | `0 12px 40px rgba(0,0,0,0.25)` | `shadow-lg` | Hero, demo window |
| Hover | Cyan glow + dark shadow | `shadow-hover` | Card/button hover |
| Glow | `0 4px 24px rgba(0,245,255,0.25)` | `shadow-glow` | Primary buttons |

---

## Borders

All borders use cyan at low opacity:

```html
border border-[rgba(0,245,255,0.08)]     <!-- standard -->
border border-[rgba(0,245,255,0.15)]     <!-- emphasized -->
hover:border-[rgba(0,245,255,0.2)]       <!-- hover -->
border-[rgba(232,244,255,0.06)]          <!-- footer dividers -->
```

---

## Animations

### Morphing Blob Logo
4-layer CSS blob that continuously shape-shifts. Classes: `blob-container`, `blob-outer`, `blob-mid`, `blob-inner`, `blob-core`. Sizes: `blob-hero` (80px), `blob-sm` (34px), `blob-xs` (30px).

### Aura Shimmer
Light beam sweeps across "Aura" text. Class: `brand-aura`.

### Fade Up
Staggered entrance animation. Class: `animate-fade-up` with `animationDelay` styles.

### Glow Drift
Background orbs drift slowly. Classes: `animate-glow-drift-1`, `animate-glow-drift-2`, `animate-glow-drift-3`.

### Badge Pulse
Pulsing dot in hero badge. Class: `animate-pulse`.

---

## Component Patterns

### Primary Button (Gradient Pill)
```html
<button class="px-8 py-3.5 rounded-full bg-gradient-to-r from-pink via-coral to-gold text-white font-body font-bold shadow-glow hover:shadow-hover transition-all hover:-translate-y-0.5">
```

### Secondary Button (Card Outline)
```html
<button class="px-8 py-3.5 rounded-full border border-[rgba(0,245,255,0.15)] bg-card text-text-700 font-body font-medium hover:border-[rgba(0,245,255,0.3)] transition-colors">
```

### Cards
```html
<div class="p-6 rounded-card bg-card border border-[rgba(0,245,255,0.08)] hover:border-[rgba(0,245,255,0.2)] shadow-sm hover:shadow-hover transition-all duration-300">
```

### Glass Navigation
```html
<nav class="glass fixed top-0 left-0 right-0 z-[1000] h-16">
```
Uses `.glass` class: `rgba(8,12,24,0.92)` + `backdrop-filter: blur(20px)`.

### Form Inputs
```html
<input class="w-full rounded-lg border border-[rgba(0,245,255,0.1)] bg-bg px-4 py-2.5 text-text-800 placeholder:text-text-400 focus:outline-none focus:ring-2 focus:ring-pink/30 font-body text-sm" />
```

### Gradient Text
```html
<span class="gradient-text">text</span>        <!-- static gradient -->
<span class="brand-aura">Aura</span>           <!-- animated shimmer -->
<p class="section-label">Label</p>             <!-- mono uppercase gradient -->
```

### Message Bubbles

**User:**
```html
<div class="bg-[rgba(0,245,255,0.06)] border border-[rgba(0,245,255,0.1)] text-text-800 rounded-2xl px-4 py-3">
```

**Assistant:**
```html
<div class="bg-bg-alt border border-[rgba(0,245,255,0.06)] text-text-700 shadow-sm rounded-2xl px-4 py-3">
  <div class="text-xs font-semibold text-pink mb-1 font-body">AuraMi.AI</div>
</div>
```

### Sidebar Nav Items

**Active:**
```html
<button class="bg-[rgba(0,245,255,0.08)] text-pink font-semibold">
```

**Inactive:**
```html
<button class="text-text-600 hover:bg-bg-alt">
```

---

## Key Files

| File | Purpose |
|------|---------|
| `tailwind.config.ts` | Color tokens, fonts, shadows, animations, keyframes |
| `app/globals.css` | Font imports, CSS variables, blob logo, shimmer, glass, grain overlay |
| `app/layout.tsx` | Root HTML structure |
| `app/page.tsx` | Landing page (hero, features, pricing, footer) |
| `app/login/page.tsx` | Login form |
| `app/dashboard/dashboard-client.tsx` | Dashboard layout with glass topbar |
| `components/Sidebar.tsx` | Dashboard sidebar (dark card background) |
| `components/ChatWindow.tsx` | Chat interface |
| `components/MessageBubble.tsx` | Chat message styling |
| `AURAMI-WEBSITE-SPEC.md` | Full design specification reference |
