# AuraMi.AI — Complete Website Specification

> **Purpose**: This document gives Claude Code (or any developer) everything needed to build the AuraMi.AI website exactly as designed. It covers brand identity, design tokens, every component, animations, content, and the full page structure.

---

## 1. Brand Identity

### Name & Wordmark
- **Brand**: AuraMi.AI
- **Wordmark structure**: `Aura` (shimmer animated, light weight) + `Mi` (bold, gradient fill) + `.AI` (medium weight, gradient fill)
- **Tagline**: "Your Family's Essence, Preserved Forever"
- **Concept**: A family history/genealogy platform where users build family trees, preserve stories/photos, and ask AI about their origins. Designed for Baby Boomers, Gen X, and Millennials to enter data — Gen Alpha consumes it.

### Logo — The Living Aura (Morphing Blob)
The logo is a CSS-only morphing blob with 4 concentric layers that continuously shape-shift. No SVG paths — pure CSS `border-radius` animation.

**Structure** (outermost to innermost):
1. `.blob-outer` — inset: 0, lightest opacity, slowest morph (8s)
2. `.blob-mid` — inset: 15%, medium opacity, medium morph (6s)
3. `.blob-inner` — inset: 30%, higher opacity, faster morph (5s)
4. `.blob-core` — inset: 40%, solid circle (border-radius: 50%), white gradient fill with glow shadow

**Sizes**:
- `.blob-hero`: 80×80px (hero section, centered above headline)
- `.blob-sm`: 34×34px (navbar, footer)
- `.blob-xs`: 30×30px (app sidebar)

**Morph Keyframes**:
```css
@keyframes blob-morph-1 {
  0%,100% { border-radius: 60% 40% 30% 70%/60% 30% 70% 40%; transform: rotate(0deg) }
  25%     { border-radius: 30% 60% 70% 40%/50% 60% 30% 60%; transform: rotate(45deg) }
  50%     { border-radius: 50% 60% 30% 60%/40% 30% 60% 50%; transform: rotate(90deg) }
  75%     { border-radius: 40% 60% 50% 40%/60% 50% 30% 70%; transform: rotate(135deg) }
}
@keyframes blob-morph-2 {
  0%,100% { border-radius: 40% 60% 50% 50%/50% 40% 60% 50%; transform: scale(1) }
  33%     { border-radius: 50% 30% 60% 40%/40% 60% 30% 60%; transform: scale(1.02) }
  66%     { border-radius: 60% 50% 40% 50%/30% 50% 60% 40%; transform: scale(.98) }
}
@keyframes blob-morph-3 {
  0%,100% { border-radius: 50% 40% 60% 40%/40% 50% 40% 60%; transform: scale(1) }
  50%     { border-radius: 40% 50% 40% 60%/60% 40% 50% 40%; transform: scale(1.04) }
}
```

### "Aura" Text — Animated Shimmer
The word "Aura" in the wordmark has a light beam that continuously sweeps left-to-right:
```css
.brand-aura {
  font-weight: 400;
  background: linear-gradient(90deg,
    var(--pink) 0%, var(--t4) 20%, var(--t1) 40%,
    var(--t4) 60%, var(--pink) 80%, var(--t4) 100%);
  background-size: 200% 100%;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  animation: aura-shimmer 3s linear infinite;
}
@keyframes aura-shimmer {
  0%   { background-position: 200% center }
  100% { background-position: -200% center }
}
```
"Mi" and ".AI" use the horizontal gradient (`--gh`) with `-webkit-background-clip: text`.

---

## 2. Design Tokens — Aurora Night Theme

This is a **dark theme**. All colors are designed for dark backgrounds.

### Color Palette
```css
:root {
  /* Primary accent colors */
  --pink: #00F5FF;        /* Electric cyan — primary accent */
  --pink-d: #00C4CC;      /* Cyan darker */
  --coral: #7B61FF;       /* Indigo purple — secondary */
  --coral-d: #5E48CC;     /* Purple darker */
  --gold: #BFFF00;        /* Acid lime — tertiary */
  --gold-d: #A3D900;      /* Lime darker */
  --teal: #00F5FF;        /* Same as pink (cyan) */
  --teal-d: #00C4CC;
  --blue: #7B61FF;        /* Same as coral (purple) */
  --blue-d: #5E48CC;
  --purple: #B388FF;      /* Light purple */
  --purple-d: #9060E8;

  /* Backgrounds (darkest to lightest) */
  --bg-dark: #04060E;     /* Footer, CTA sections */
  --bg: #080C18;          /* Main body background */
  --bg-alt: #0E1324;      /* Alternate section background */
  --bg-w: #131830;        /* "White" replacement (cards, inputs) */
  --card: #131830;        /* Card background */

  /* Borders & Shadows */
  --bdr: rgba(0,245,255,.08);
  --sh: 0 1px 6px rgba(0,0,0,.15);
  --sh-md: 0 4px 16px rgba(0,245,255,.06);
  --sh-lg: 0 12px 40px rgba(0,0,0,.25);
  --sh-hover: 0 16px 48px rgba(0,245,255,.12), 0 4px 16px rgba(0,0,0,.2);

  /* Text scale (lightest → darkest for dark mode) */
  --t9: #E8F4FF;          /* Headings, primary text */
  --t8: #C4DCF0;          /* Strong secondary */
  --t7: #94B8D8;          /* Secondary text */
  --t6: #6E96BC;          /* Body text (default) */
  --t5: #5078A0;          /* Muted text */
  --t4: #3D5E82;          /* Subtle text */
  --t3: #2C4568;          /* Very subtle */
  --t2: #1E3050;          /* Near-invisible */
  --t1: #142040;          /* Barely visible */

  /* Gradients */
  --g: linear-gradient(135deg, #00F5FF, #7B61FF, #BFFF00);   /* Diagonal — buttons, badges */
  --gh: linear-gradient(90deg, #00F5FF, #7B61FF, #BFFF00);   /* Horizontal — text fills */

  /* RGB values for rgba() usage */
  --accent-rgb: 0,245,255;
  --teal-rgb: 0,245,255;
  --gold-rgb: 191,255,0;
  --bg-rgb: 8,12,24;
  --ink-rgb: 232,244,255;

  /* Blob logo layer colors */
  --blob-o1: rgba(0,245,255,.12);  --blob-o2: rgba(123,97,255,.08);
  --blob-m1: rgba(0,245,255,.28);  --blob-m2: rgba(123,97,255,.18);
  --blob-i1: rgba(191,255,0,.35);  --blob-i2: rgba(0,245,255,.3);
  --blob-c1: #fff;                 --blob-c2: #E0FFF8;
  --blob-sh: rgba(0,245,255,.25);
}
```

### Typography
```css
--fd: 'Fraunces', serif;           /* Display headings — variable optical size */
--fb: 'Plus Jakarta Sans', sans-serif; /* Body text, buttons, UI */
--fm: 'IBM Plex Mono', monospace;  /* Labels, code, section tags */
```

**Google Fonts import**:
```
Fraunces:ital,opsz,wght@0,9..144,300..800;1,9..144,400;1,9..144,700
Plus Jakarta Sans:ital,wght@0,300..800;1,300;1,400
IBM Plex Mono:wght@400;500;600
```

**Type scale**:
- Hero h1: `clamp(2.8rem, 6.5vw, 4.8rem)`, Fraunces, weight 800, letter-spacing -0.035em
- Section h2: `clamp(2rem, 4.5vw, 3rem)`, Fraunces, weight 800, letter-spacing -0.025em
- Body: 15px base (set on html), Plus Jakarta Sans, weight 400, color var(--t6)
- Section labels: IBM Plex Mono, 0.66rem, uppercase, letter-spacing 0.18em, gradient text fill
- Nav logo: Fraunces, 1.35rem, weight 800

### Base Styles
- `html { font-size: 15px; scroll-behavior: smooth }`
- Antialiased rendering: `-webkit-font-smoothing: antialiased`
- Custom scrollbar: 6px wide, transparent track, `--t2` thumb
- Grain overlay on body::after (SVG noise texture at 1.6% opacity, fixed, pointer-events none, z-index 9999)

---

## 3. Animations

### Fade Up (page load stagger)
```css
@keyframes fu {
  from { opacity: 0; transform: translateY(20px) }
  to   { opacity: 1; transform: translateY(0) }
}
```
Applied with delays: hero badge (0.2s), h1 (0.35s), sub (0.5s), buttons (0.65s), proof (0.85s).

### Scroll Reveal
Elements with class `.reveal` start at `opacity: 0; transform: translateY(24px)` and transition to visible when intersecting viewport (IntersectionObserver, threshold 0.1, rootMargin -40px bottom).

### Badge Pulse
```css
@keyframes pulse {
  0%,100% { opacity: 1; box-shadow: 0 0 0 0 rgba(var(--accent-rgb),.3) }
  50%     { opacity: .7; box-shadow: 0 0 0 6px rgba(var(--accent-rgb),0) }
}
```

### Glow Drift (hero background)
Three radial gradient blobs with blur(100px) that drift slowly:
```css
@keyframes gd {
  0%,100% { transform: translate(0,0) scale(1) }
  33%     { transform: translate(20px,-15px) scale(1.04) }
  66%     { transform: translate(-15px,10px) scale(.96) }
}
```
Durations: 16s, 12s, 18s. Colors use teal-rgb, accent-rgb, gold-rgb at low opacity (0.07–0.1).

---

## 4. Page Structure — Landing Page

### 4.1 Navigation (fixed)
- Fixed top, full width, z-index 1000
- Background: `rgba(8,12,24,.92)` with `backdrop-filter: blur(20px)`
- Border-bottom: 1px solid `rgba(ink-rgb, .08)`
- Left: Blob logo (34px) + Wordmark ("Aura" shimmer + "Mi" gradient + ".AI" gradient)
- Right: Links (Features, How It Works, Pricing) + CTA button ("Launch Dashboard →")
- CTA: gradient background, white text, 100px border-radius pill, glow shadow
- Mobile: hamburger menu (3 spans, 26px wide)

### 4.2 Hero Section
- Full viewport height, centered content, max-width 800px
- Background: 3 blurred gradient orbs drifting (hero-glow)
- Content stack (all centered, staggered fade-up):
  1. **Blob logo** (80px, hero size)
  2. **Badge**: "The essence of your essence · preserved with AI" — pill shape, gradient dot pulse
  3. **Headline**: "Every family carries / an aura worth *preserving*" — italic "preserving" has gradient fill
  4. **Subtext**: "Sign up on web, iPhone, or iPad. Build your family tree..." — max-width 550px
  5. **Buttons**: "Start Your Family Tree" (gradient primary) + "See It in Action" (card secondary with border)
  6. **Social proof**: 4 avatar circles (overlapping, -9px margin) + "2,400+ families preserving their aura"

### 4.3 Household Model Strip
- 4-column grid of feature cards:
  - 🏠 1 household owner
  - 👨‍👩‍👧‍👦 +4 members included
  - 🌳 Unlimited family chart
  - 🔗 Connect households
- Each card: emoji icon (28px, rounded), title (Fraunces), description
- Note below: "Designed for Baby Boomers, Gen X, and Millennials..."

### 4.4 Demo Section
- macOS-style window with 3 dots (colored: cyan, lime, cyan)
- Title bar: "AuraMi.AI — The Kumar Family"
- Left sidebar: 4 family members (Ramesh, Savitri, Arjun, Priya Kumar) with colored avatars
- Right: AI chat conversation showing user asking about grandfather, AI responding with sourced answers
- Chat input with microphone button (gradient, circular)

### 4.5 Why Section (The Problem)
- Background: `--bg-alt`
- Label: "The Problem" (mono, gradient)
- Headline: "Memories fade. Stories get *lost*."
- Lead paragraph about families losing their stories
- 3 stats: "87%", "3 Gen", "∞" with descriptions

### 4.6 Features Section
- 6-card grid (3×2 on desktop, 2×3 on tablet, 1 column mobile)
- Each card: colored emoji icon, h3 title (Fraunces), description
- Features: Visual Family Tree, AI Family Historian, Photo & Document Vault, Story Preservation, Voice-First on iPhone, Link Family Branches

### 4.7 How It Works
- 3 numbered steps with gradient number badges
- Steps: Create household → Build tree & add memories → Ask the AI

### 4.8 Linking Section (Growing Together)
- Split layout: text left, visual right
- Visual: household cards connected by gradient link icons
- Shows Sharma Family → connected to → Kapoor Family + London Sharmas

### 4.9 Quote/Testimonial
- Large quote mark (Fraunces, 4.5rem, gradient)
- Italic quote about Partition story
- Attribution: "Anita S. · San Francisco, CA"

### 4.10 Pricing
- 2-card grid (Free Forever vs Heritage Plan $9/mo)
- Free card has "Most Popular" badge
- Feature lists with gradient checkmarks
- CTAs: "Get Started Free" (gradient) / "Coming Soon" (outline)

### 4.11 CTA Section
- Dark background with radial glow
- "Don't let your family's aura become a *whisper*"
- Two buttons: Start free + Download for iPhone
- Note: "No credit card required · Free forever plan available"

### 4.12 Footer
- Dark background (`--bg-dark`)
- Left: Logo + tagline
- Right: 3 columns (Product, Resources, Company) with links
- Bottom: Copyright + social icons (X, Instagram, LinkedIn)

---

## 5. App Shell (Dashboard)

Activated by clicking "Launch Dashboard" — hides landing page, shows app.

### Layout
- Full viewport height, flex row
- Left sidebar (256px) + main content area

### Sidebar
- Logo (blob-xs + wordmark)
- Household pill (gradient background)
- Member avatars (5 circular, 30px)
- Navigation: Dashboard, Family Tree (2 items with icons)
- Bottom: owner avatar + name + "Owner" role

### Dashboard Page
- Top bar with page title + search input + "Add Person" button
- Stats row: 4 cards (People: 19, Stories: 24, Photos: 47, Generations: 4)
- Content grid: Timeline (left) + AI Chat + Recent Activity (right)
- Timeline: 5 events with gradient dots and date badges
- AI Chat: 2 messages + input with mic button
- Activity: 4 items with relative timestamps

### Family Tree Page
- Full interactive tree with pan/zoom
- 19 family members across 4 generations (sample Kumar family data)
- Nodes: rounded rectangles with avatar circle, name, role, dates
- Male = blue gradient, Female = pink/cyan gradient, Deceased = lower opacity
- Lines connecting parent→child and spouse pairs
- Zoom controls (fit, zoom in/out, percentage label)
- Filter buttons: All, Living, country flags (IN, US, UK, CA)
- Click node → detail panel slides in from right

### Detail Panel
- Slide-in overlay from right
- Avatar, name, role, birth/death dates
- Details: birth place, current location, country
- Relationships: spouse, children, parent (clickable)
- Actions: Stories, Photos, Ask AI buttons

---

## 6. Responsive Breakpoints

### ≤900px
- Nav links hidden, hamburger shown
- Household grid: 2 columns
- Demo: single column (sidebar hidden)
- Features grid: 2 columns
- Linking section: single column stack
- Pricing: single column
- Footer links wrap

### ≤640px
- Hero padding reduced
- Buttons stack vertically, full width
- Features: single column
- Pricing cards: single column
- Stats row wraps
- Demo body: single column
- Detail panel: full width

---

## 7. Technical Notes

- **Single HTML file**: All CSS inline in `<style>`, all JS inline in `<script>`
- **No build tools**: Pure HTML/CSS/JS, no framework
- **Fonts**: Google Fonts CDN
- **Family tree**: Pure CSS/JS with absolute positioning, CSS transforms for pan/zoom
- **No localStorage dependency**: App state is in-memory only
- **SVG**: Only one hidden SVG with `<linearGradient>` for the auraGrad (used by some elements)
- **Tree rendering**: JavaScript builds DOM nodes from a family data array, positions them in a grid based on generation and parent relationships
- **Pan/zoom**: mousedown/mousemove/mouseup for pan, wheel for zoom, CSS transform on canvas container

---

## 8. Key CSS Patterns

### Gradient text fill
```css
.gradient-text {
  background: var(--gh);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}
```

### Primary button
```css
.btn-primary {
  display: inline-flex; align-items: center; gap: .5rem;
  padding: .82rem 2rem;
  background: var(--g);
  color: #fff; font-weight: 700; font-size: .9rem;
  border-radius: 100px;
  box-shadow: 0 4px 24px rgba(var(--accent-rgb), .25);
  transition: all .3s;
}
.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 36px rgba(var(--accent-rgb), .35);
}
```

### Card
```css
.card {
  background: var(--card);  /* #131830 */
  border: 1px solid var(--bdr);  /* rgba(0,245,255,.08) */
  border-radius: 18px;
  padding: 2.1rem 1.7rem;
  box-shadow: var(--sh);
  transition: all .35s;
}
```

### Glass nav/topbar
```css
.glass-bar {
  background: rgba(8,12,24,.92);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-bottom: 1px solid rgba(var(--ink-rgb), .08);
}
```

---

## 9. Content Reference

### Hero
- Badge: "The essence of your essence · preserved with AI"
- H1: "Every family carries / an aura worth *preserving*"
- Sub: "Sign up on web, iPhone, or iPad. Build your family tree, preserve stories and photos, and ask AI anything about your origin — all in one shared family space."

### Stats
- 87% — "of families have no written record of their grandparents' stories"
- 3 Gen — "is all it takes for family history to be completely forgotten"
- ∞ — "stories waiting to be preserved by families like yours"

### Testimonial
- "My mother told me stories about our family leaving Lahore during Partition. I always meant to write them down. With AuraMi.AI, I finally did — and now my kids can ask the AI about their great-grandmother's journey whenever they want."
- — Anita S., San Francisco, CA

### CTA
- "Don't let your family's aura become a *whisper*"
- "The best time to preserve your family's aura was 20 years ago. The second best time is today."

### Footer
- "Preserving family heritage with the power of AI. Your aura — your essence — kept alive for every generation to come."
- © 2026 AuraMi.AI. All rights reserved.

---

## 10. Reference File

The complete, working HTML file is provided alongside this spec as `aurami-final-aurora.html`. It is the single source of truth. When in doubt about any implementation detail, refer to that file directly.
