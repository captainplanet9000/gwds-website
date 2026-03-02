# GWDS Brand Guide
**Gamma Waves Design Studio**

---

## Brand Identity

### Mission
**Empowering creators with cutting-edge tools and systems that turn ideas into revenue.**

GWDS is the intersection of AI, design, and autonomous systems. We build tools that work for you — trading systems, content pipelines, productivity frameworks, and digital assets that compound value over time.

### Vision
**Every creator should have access to institutional-grade tools.**

We're democratizing the infrastructure that tech giants use internally. From AI-powered trading agents to automated content pipelines, GWDS makes advanced systems accessible to solo founders and small teams.

### Brand Personality
- **Innovative** — Cutting-edge tech, always ahead
- **Empowering** — Tools that multiply your capabilities
- **Autonomous** — Systems that work while you sleep
- **Professional** — Enterprise-grade quality at creator scale
- **Direct** — No fluff, real results

---

## Visual Identity

### Logo System

**Primary Logo**
- Wordmark: "GWDS" in bold geometric sans
- Icon: Stylized wave (gamma wave concept)
- Colors: Gradient from Electric Purple to Cyan

**Logo Variations**
- Full lockup: GWDS + Gamma Waves Design Studio
- Icon only: For small applications (favicon, avatar)
- Monochrome: White/black for special contexts

### Color System

**Primary Palette**
```css
--electric-purple: oklch(0.65 0.29 295);    /* #8B5CF6 */
--deep-purple: oklch(0.58 0.32 290);        /* #7C3AED */
--light-purple: oklch(0.75 0.20 295);       /* #A78BFA */

--cyan-bright: oklch(0.75 0.15 195);        /* #06B6D4 */
--cyan-deep: oklch(0.65 0.18 195);          /* #0891B2 */
```

**Neutral Palette**
```css
--void-black: oklch(0.08 0 0);              /* #0A0A0F - background */
--space-dark: oklch(0.12 0.01 270);         /* #12121A - cards */
--slate-medium: oklch(0.15 0.02 270);       /* #1A1A2E - hover */
--border-dim: oklch(0.20 0.03 260);         /* #1E293B - borders */

--text-bright: oklch(0.98 0 0);             /* #F8FAFC - headings */
--text-muted: oklch(0.68 0.01 250);         /* #94A3B8 - body */
```

**Semantic Colors**
```css
--success: oklch(0.70 0.18 145);            /* Green */
--warning: oklch(0.75 0.20 85);             /* Amber */
--error: oklch(0.65 0.25 25);               /* Red */
--info: oklch(0.70 0.15 235);               /* Blue */
```

**Color Usage Rules**
- **Electric Purple** — Primary CTAs, brand moments, highlights
- **Cyan Bright** — Accents, links, secondary actions
- **Void Black** — Backgrounds, foundations
- **Gradients** — Purple → Cyan for hero sections, featured content
- **Glow effects** — Use sparingly, 15-25% opacity

### Typography

**Font Stack**
```css
--font-display: 'Space Grotesk', 'Inter', sans-serif;
--font-body: 'Inter', 'SF Pro Display', -apple-system, sans-serif;
--font-mono: 'JetBrains Mono', 'Fira Code', monospace;
```

**Type Scale** (based on 1.250 — Major Third)
```css
--text-xs: 0.64rem;     /* 10.24px */
--text-sm: 0.8rem;      /* 12.8px */
--text-base: 1rem;      /* 16px */
--text-lg: 1.25rem;     /* 20px */
--text-xl: 1.563rem;    /* 25px */
--text-2xl: 1.953rem;   /* 31.25px */
--text-3xl: 2.441rem;   /* 39px */
--text-4xl: 3.052rem;   /* 48.8px */
--text-5xl: 3.815rem;   /* 61px */
--text-6xl: 4.768rem;   /* 76px */
```

**Hierarchy Rules**
- **Headlines** — Space Grotesk, bold (700), letter-spacing: -0.02em
- **Body Text** — Inter, regular (400), line-height: 1.7
- **Labels** — Inter, medium (500), uppercase, letter-spacing: 0.05em
- **Code** — JetBrains Mono, regular (400), syntax highlighting

### Spacing System

**8px Grid** (0.5rem base unit)
```css
--space-0: 0;
--space-1: 0.25rem;     /* 4px */
--space-2: 0.5rem;      /* 8px */
--space-3: 0.75rem;     /* 12px */
--space-4: 1rem;        /* 16px */
--space-5: 1.25rem;     /* 20px */
--space-6: 1.5rem;      /* 24px */
--space-8: 2rem;        /* 32px */
--space-10: 2.5rem;     /* 40px */
--space-12: 3rem;       /* 48px */
--space-16: 4rem;       /* 64px */
--space-20: 5rem;       /* 80px */
--space-24: 6rem;       /* 96px */
--space-32: 8rem;       /* 128px */
```

### Border & Radius

**Border Widths**
```css
--border-thin: 1px;
--border-medium: 2px;
--border-thick: 3px;
```

**Border Radius**
```css
--radius-sm: 0.375rem;   /* 6px - buttons, inputs */
--radius-md: 0.5rem;     /* 8px - cards */
--radius-lg: 0.75rem;    /* 12px - modals */
--radius-xl: 1rem;       /* 16px - hero sections */
--radius-2xl: 1.5rem;    /* 24px - feature cards */
--radius-full: 9999px;   /* Pills, avatars */
```

### Shadows & Elevation

**Shadow Layers**
```css
--shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.3);
--shadow-md: 0 4px 6px rgba(0, 0, 0, 0.4);
--shadow-lg: 0 10px 15px rgba(0, 0, 0, 0.5);
--shadow-xl: 0 20px 25px rgba(0, 0, 0, 0.6);

--glow-primary: 0 0 30px rgba(139, 92, 246, 0.25);
--glow-accent: 0 0 30px rgba(6, 182, 212, 0.25);
```

**Elevation Rules**
- **Level 0** — Backgrounds, no shadow
- **Level 1** — Cards at rest (shadow-sm)
- **Level 2** — Cards on hover (shadow-md + glow-primary)
- **Level 3** — Modals, dropdowns (shadow-lg)
- **Level 4** — Critical UI (shadow-xl)

---

## Component Patterns

### Buttons

**Primary CTA**
```css
background: linear-gradient(135deg, var(--electric-purple), var(--deep-purple));
padding: var(--space-3) var(--space-6);
border-radius: var(--radius-sm);
font-weight: 600;
transition: all 200ms ease;

/* Hover */
transform: translateY(-2px);
box-shadow: var(--glow-primary);

/* Active */
transform: translateY(0);
```

**Secondary**
```css
background: transparent;
border: 2px solid var(--electric-purple);
color: var(--electric-purple);

/* Hover */
background: rgba(139, 92, 246, 0.1);
```

**Ghost**
```css
background: transparent;
color: var(--text-muted);

/* Hover */
color: var(--text-bright);
background: rgba(255, 255, 255, 0.05);
```

### Cards

**Glass Card**
```css
background: rgba(18, 18, 26, 0.8);
backdrop-filter: blur(20px);
border: 1px solid rgba(139, 92, 246, 0.1);
border-radius: var(--radius-lg);
padding: var(--space-6);

/* Hover */
border-color: rgba(139, 92, 246, 0.3);
box-shadow: var(--glow-primary);
transform: translateY(-4px);
```

**Product Card**
```css
background: var(--space-dark);
border: 1px solid var(--border-dim);
border-radius: var(--radius-md);
overflow: hidden;
transition: all 300ms ease;

/* Hover */
border-color: var(--electric-purple);
box-shadow: 0 8px 24px rgba(139, 92, 246, 0.2);
```

### Input Fields

```css
background: rgba(255, 255, 255, 0.03);
border: 1px solid var(--border-dim);
border-radius: var(--radius-sm);
padding: var(--space-3) var(--space-4);
color: var(--text-bright);
font-family: var(--font-body);

/* Focus */
border-color: var(--electric-purple);
box-shadow: 0 0 0 3px rgba(139, 92, 246, 0.1);
outline: none;

/* Error */
border-color: var(--error);
```

---

## Motion & Animation

### Timing Functions
```css
--ease-in: cubic-bezier(0.4, 0, 1, 1);
--ease-out: cubic-bezier(0, 0, 0.2, 1);
--ease-in-out: cubic-bezier(0.4, 0, 0.2, 1);
--ease-bounce: cubic-bezier(0.68, -0.55, 0.265, 1.55);
```

### Duration Scale
```css
--duration-fast: 150ms;      /* Button press */
--duration-base: 200ms;      /* Hover states */
--duration-slow: 300ms;      /* Card transitions */
--duration-slower: 400ms;    /* Page transitions */
```

### Common Animations

**Fade In**
```css
@keyframes fade-in {
  from { opacity: 0; }
  to { opacity: 1; }
}
/* Duration: 400ms, ease-out */
```

**Slide Up**
```css
@keyframes slide-up {
  from { opacity: 0; transform: translateY(30px); }
  to { opacity: 1; transform: translateY(0); }
}
/* Duration: 600ms, ease-out */
```

**Glow Pulse**
```css
@keyframes glow-pulse {
  0%, 100% { opacity: 0.5; }
  50% { opacity: 1; }
}
/* Duration: 3s, ease-in-out, infinite */
```

**Float**
```css
@keyframes float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
}
/* Duration: 6s, ease-in-out, infinite */
```

---

## Voice & Tone

### Writing Principles
1. **Be direct** — No corporate speak, no fluff
2. **Be specific** — Numbers, examples, outcomes
3. **Be empowering** — "Build", "Create", "Launch" (not "Try", "Learn")
4. **Be human** — Conversational but professional

### Vocabulary

**Use:**
- Autonomous, Compound, Systems, Infrastructure, Revenue
- Build, Ship, Deploy, Execute, Scale
- Real-time, Live, Active, Running
- Intelligence, Agent, Orchestration

**Avoid:**
- "Solutions", "Leverage", "Synergy", "Ecosystem"
- "Revolutionary", "Game-changing", "Disrupting"
- Vague promises without specifics
- Excessive exclamation marks!!!

### Headline Formulas
```
[Action] + [Outcome] + [Timeframe]
"Build Trading Agents That Run 24/7"

[Tool] + [Benefit] + [For Whom]
"AI Content Pipeline for Solo Creators"

[Problem] + [Solution]
"Stop Trading Manually. Start Compounding."
```

---

## Applications

### Website
- **Hero sections** — Large headlines (text-5xl), gradient text, CTA prominence
- **Product cards** — Clear imagery, pricing, quick-view modals
- **Navigation** — Sticky header, minimal links, search prominent

### Social Media
- **Profile** — Logo + tagline: "Autonomous Systems for Creators"
- **Posts** — 1200x675 OG images, gradient backgrounds, bold typography
- **Colors** — Always use brand purple/cyan, never generic blues

### Documentation
- **Code blocks** — JetBrains Mono, syntax highlighting
- **Callouts** — Color-coded (info=cyan, warning=amber, error=red)
- **Screenshots** — Dark theme, purple accents

### Product UI
- **Dashboards** — Dark theme, data-dense, real-time updates
- **Status indicators** — Green=active, amber=pending, red=error
- **Tables** — Zebra striping subtle, hover highlights

---

## Accessibility

### WCAG AA Compliance
- **Color contrast** — 4.5:1 minimum for body text
- **Focus states** — 2px purple outline, 2px offset
- **Keyboard navigation** — All interactive elements accessible
- **Screen readers** — Semantic HTML, ARIA labels where needed

### Reduced Motion
```css
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

## File Naming Conventions

### Images
```
logo-primary.svg
logo-icon.svg
logo-white.svg
og-image-home.png
og-image-store.png
product-dashboard-pro.png
category-banner-trading.png
favicon-32x32.png
```

### Components
```
Button.tsx
Card.tsx
ProductCard.tsx
Hero.tsx
Navbar.tsx
```

---

*This brand guide is a living document. Update as GWDS evolves.*
