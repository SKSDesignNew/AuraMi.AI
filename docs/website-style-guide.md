# MyVansh.AI — Website Style Guide

Reference for all visual styles, tokens, and component patterns used across the website.

---

## Color Palette

All colors are defined in `tailwind.config.ts` under `theme.extend.colors`.

### Primary Gradient Colors

| Token | Hex | Tailwind Class | Usage |
|-------|-----|----------------|-------|
| Pink | `#F093FB` | `pink` | Gradient start, accent highlights |
| Pink Deep | `#D462E5` | `pink-deep` | Hover/active states |
| Coral | `#F5576C` | `coral` | Gradient middle, primary accent, active nav items |
| Coral Deep | `#E03E54` | `coral-deep` | Hover/active states |
| Gold | `#FFD452` | `gold` | Gradient end, warm accents |
| Gold Deep | `#F0B429` | `gold-deep` | Hover/active states |

### Brand Gradient

The signature gradient is used on CTAs, user message bubbles, the logo text, and headings:

```
bg-gradient-to-r from-pink via-coral to-gold
```

For gradient text (logo, hero headings):

```html
<span class="bg-gradient-to-r from-pink via-coral to-gold bg-clip-text text-transparent">
  MyVansh.AI
</span>
```

CSS custom properties (defined in `app/globals.css`):

```css
--gradient: linear-gradient(135deg, #F093FB, #F5576C, #FFD452);   /* diagonal */
--gradient-h: linear-gradient(90deg, #F093FB, #F5576C, #FFD452);  /* horizontal */
```

### Backgrounds

| Token | Hex | Tailwind Class | Usage |
|-------|-----|----------------|-------|
| Background | `#FBF8F3` | `bg-bg` | Page background (warm off-white) |
| Background Alt | `#F4EFE6` | `bg-bg-alt` | Cards, sidebar hover, secondary surfaces |
| Dark | `#1A1215` | `bg-bg-dark` | Footer background |
| White | `#FFFFFF` | `bg-white` | Cards, chat input bar, sidebar |

### Text Scale

| Token | Hex | Tailwind Class | Usage |
|-------|-----|----------------|-------|
| 900 | `#1A1215` | `text-text-900` | Primary headings, body default |
| 800 | `#2D2328` | `text-text-800` | Chat text, form inputs |
| 700 | `#4A3F46` | `text-text-700` | Body text, labels, quotes |
| 600 | `#6B5E64` | `text-text-600` | Secondary body text, nav links |
| 500 | `#8B7E84` | `text-text-500` | Descriptions, subtitles, placeholders |
| 400 | `#A89CA2` | `text-text-400` | Timestamps, muted text, footer links |
| 300 | `#C4BAC0` | `text-text-300` | Borders (via `border-text-300/20`) |

### Accent Colors

| Token | Hex | Tailwind Class | Usage |
|-------|-----|----------------|-------|
| Teal | `#2DD4BF` | `teal` | Success states, checkmarks in pricing |
| Blue | `#60A5FA` | `blue` | Info highlights |
| Purple | `#A78BFA` | `purple` | Decorative accents |

---

## Typography

Fonts are loaded via Google Fonts in `app/globals.css` and configured in `tailwind.config.ts`.

### Font Families

| Token | Font | Tailwind Class | Usage |
|-------|------|----------------|-------|
| Display | Fraunces (serif) | `font-display` | Headings, brand name, step numbers |
| Body | Plus Jakarta Sans (sans-serif) | `font-body` | All body text, buttons, labels, nav |
| Mono | IBM Plex Mono (monospace) | `font-mono` | Code/technical elements |

### Heading Patterns

```html
<!-- Hero heading -->
<h1 class="font-display text-5xl md:text-7xl font-bold leading-tight">

<!-- Section heading -->
<h2 class="font-display text-3xl md:text-4xl font-bold text-text-900">

<!-- Card heading -->
<h3 class="font-display text-lg font-bold text-text-900">

<!-- Section label (above heading) -->
<p class="text-coral font-body font-semibold text-sm tracking-wide uppercase">
```

### Body Text Patterns

```html
<!-- Primary body -->
<p class="font-body text-text-600 text-lg leading-relaxed">

<!-- Card description -->
<p class="font-body text-text-500 text-sm leading-relaxed">

<!-- Small/muted text -->
<p class="font-body text-text-400 text-xs">
```

---

## Shadows

Defined in `tailwind.config.ts` under `theme.extend.boxShadow`.

| Token | Value | Tailwind Class | Usage |
|-------|-------|----------------|-------|
| Small | `0 1px 6px rgba(0,0,0,0.035)` | `shadow-sm` | Buttons, message bubbles |
| Medium | `0 4px 16px rgba(0,0,0,0.06)` | `shadow-md` | Cards, modals, button hover |
| Large | `0 12px 40px rgba(0,0,0,0.08)` | `shadow-lg` | Hero elements, elevated cards |

Common hover pattern:

```html
<button class="shadow-sm hover:shadow-md transition-shadow">
```

---

## Layout

| Token | Value | Usage |
|-------|-------|-------|
| `--sidebar-w` | `260px` | Dashboard sidebar width |
| Max content width | `max-w-6xl` (1152px) | Landing page sections |
| Max chat width | `max-w-3xl` | Chat input area |
| Section padding | `py-20 md:py-28` | Landing page sections |
| Container padding | `px-6` | Horizontal page padding |

---

## Borders

Borders use the `text-300` color at low opacity for a subtle, warm feel:

```html
<!-- Standard border -->
border border-text-300/15

<!-- Slightly more visible -->
border border-text-300/20

<!-- Divider lines -->
border-b border-text-300/20

<!-- Hover border -->
hover:border-coral/30
```

---

## Component Patterns

### Buttons

**Primary CTA (gradient):**
```html
<button class="px-8 py-3.5 rounded-full bg-gradient-to-r from-pink via-coral to-gold text-white font-body font-semibold shadow-sm hover:shadow-md transition-shadow">
  Start Your Family Story
</button>
```

**Secondary (outline):**
```html
<button class="px-8 py-3.5 rounded-full border border-text-300/40 text-text-700 font-body font-medium hover:bg-white transition-colors">
  See How It Works
</button>
```

**Disabled state:**
```html
disabled:opacity-50 disabled:cursor-not-allowed
```

### Cards

```html
<div class="p-6 rounded-2xl border border-text-300/15 hover:border-coral/30 hover:shadow-md transition-all">
  <!-- Card content -->
</div>
```

### Form Inputs

```html
<input class="w-full rounded-lg border border-text-300/30 bg-bg px-4 py-2.5 text-text-800 placeholder:text-text-400 focus:outline-none focus:ring-2 focus:ring-coral/40 font-body text-sm" />
```

### Chat Textarea

```html
<textarea class="flex-1 resize-none rounded-xl border border-text-300/30 bg-bg px-4 py-3 text-text-800 placeholder:text-text-400 focus:outline-none focus:ring-2 focus:ring-coral/40 font-body" />
```

### Navigation Bar

```html
<nav class="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-text-300/15">
```

### Sidebar Navigation Items

```html
<!-- Active -->
<button class="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-body bg-coral/10 text-coral font-semibold">

<!-- Inactive -->
<button class="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-body text-text-600 hover:bg-bg-alt">
```

### Message Bubbles

**User message:**
```html
<div class="bg-gradient-to-r from-pink via-coral to-gold text-white rounded-2xl px-4 py-3">
```

**Assistant message:**
```html
<div class="bg-white border border-text-300/20 text-text-800 shadow-sm rounded-2xl px-4 py-3">
  <div class="text-xs font-semibold text-coral mb-1 font-body">MyVansh.AI</div>
  <!-- content -->
</div>
```

### Loading Indicator

```html
<span class="w-2 h-2 bg-coral rounded-full animate-bounce" />
<span class="w-2 h-2 bg-coral rounded-full animate-bounce [animation-delay:0.1s]" />
<span class="w-2 h-2 bg-coral rounded-full animate-bounce [animation-delay:0.2s]" />
```

---

## Rounded Corners

| Size | Usage |
|------|-------|
| `rounded-lg` | Inputs, sidebar nav items |
| `rounded-xl` | Chat input, icon containers |
| `rounded-2xl` | Cards, message bubbles, modals |
| `rounded-full` | CTA buttons, avatar images |

---

## Background Decorations

The landing page hero uses soft gradient blurs for depth:

```html
<div class="absolute top-20 left-1/4 w-96 h-96 bg-pink/10 rounded-full blur-3xl" />
<div class="absolute top-40 right-1/4 w-80 h-80 bg-gold/10 rounded-full blur-3xl" />
```

---

## How to Make Style Changes

### Changing Brand Colors

Edit `tailwind.config.ts` under `theme.extend.colors`. Update the corresponding CSS custom properties in `app/globals.css` to keep them in sync.

### Adding a New Color

1. Add the color to `tailwind.config.ts`:
   ```ts
   colors: {
     'new-color': '#HEX_VALUE',
   }
   ```
2. Use it in components as `text-new-color`, `bg-new-color`, `border-new-color`, etc.

### Changing Fonts

1. Update the Google Fonts import URL in `app/globals.css`
2. Update `fontFamily` in `tailwind.config.ts`
3. Update the `body` rule in `globals.css` if changing the default body font

### Adding a New Component

Follow these conventions:
- Use `font-display` for headings, `font-body` for everything else
- Use `rounded-2xl` for cards, `rounded-full` for buttons
- Use `border-text-300/15` or `border-text-300/20` for borders
- Use `shadow-sm` by default, `hover:shadow-md` for interactive elements
- Use `transition-shadow` or `transition-colors` for hover effects
- Apply the brand gradient for primary actions

### Key Files

| File | Purpose |
|------|---------|
| `tailwind.config.ts` | Color tokens, fonts, shadows |
| `app/globals.css` | Font imports, CSS variables, base body styles |
| `app/layout.tsx` | Root HTML structure, global CSS import |
| `app/page.tsx` | Landing page (hero, features, pricing, footer) |
| `app/login/page.tsx` | Login form |
| `app/dashboard/page.tsx` | Dashboard layout |
| `components/Sidebar.tsx` | Dashboard sidebar navigation |
| `components/ChatWindow.tsx` | Chat interface |
| `components/MessageBubble.tsx` | Chat message styling |
