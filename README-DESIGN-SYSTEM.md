# GWDS Website - Design System Implementation

## 📋 What's Been Created

### 1. **Brand Guide** (`BRAND-GUIDE.md`)
Complete visual identity and brand guidelines:
- Mission & vision statements
- Brand personality (Innovative, Empowering, Autonomous, Professional, Direct)
- Color system (Electric Purple, Cyan, neutrals)
- Typography (Space Grotesk + Inter + JetBrains Mono)
- Spacing, borders, shadows, elevation
- Component patterns (buttons, cards, inputs, badges)
- Motion & animation guidelines
- Voice & tone (writing principles, vocabulary, headline formulas)
- Accessibility standards (WCAG AA compliance)

### 2. **Design System** (`DESIGN-SYSTEM.md`)
Technical implementation guide:
- **CSS Design Tokens** — All variables in CSS custom properties
- **Component Library** — React/TypeScript components (Button, Card, Input, Badge)
- **Layout Patterns** — Container, Section components
- **Animation Utilities** — ScrollReveal, micro-interactions
- **Responsive Breakpoints** — Mobile-first approach
- **Usage Examples** — Hero sections, feature grids, etc.

### 3. **Updated CSS** (`src/app/globals.css`)
Modern, token-based styling:
- OKLCH color system (modern, perceptually uniform)
- Complete design token set (colors, spacing, typography, shadows)
- Utility classes (gradient-text, glass-card, bg-grid-pattern)
- Smooth animations (float, glow-pulse, slide-up, fade-in, etc.)
- Accessibility features (focus states, reduced motion support)
- Custom scrollbar styling
- Responsive utilities

### 4. **UI Component Library** (`src/components/ui/`)
Reusable, polished components:
- **Button** — Primary, secondary, ghost, danger variants + loading states
- **Card** — Glass, solid, bordered variants + hover effects
- **Badge** — Primary, success, warning, error, neutral + dot indicators
- **Container** — Responsive width containers (sm, md, lg, xl, full)
- **Section** — Layout sections with background options

## 🎨 Design System Highlights

### Color Palette
```
Electric Purple: oklch(0.65 0.29 295) — Primary brand color
Cyan Bright: oklch(0.75 0.15 195) — Accent color
Void Black: oklch(0.08 0 0) — Background
```

### Typography Scale
```
Display: Space Grotesk (headlines, bold, -0.02em tracking)
Body: Inter (paragraphs, line-height 1.7)
Mono: JetBrains Mono (code, terminal)

Scale: 1.250 (Major Third)
- text-base: 16px
- text-xl: 25px
- text-3xl: 39px
- text-5xl: 61px
```

### Spacing System
8px grid (0.5rem base):
```
--space-4: 1rem (16px)
--space-6: 1.5rem (24px)
--space-8: 2rem (32px)
--space-12: 3rem (48px)
--space-16: 4rem (64px)
```

### Animation Timing
```
--duration-fast: 150ms (button press)
--duration-base: 200ms (hover states)
--duration-slow: 300ms (card transitions)
--duration-slower: 400ms (page transitions)
```

## 🚀 How to Use

### Import Components
```tsx
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Container } from '@/components/ui/Container';
import { Section } from '@/components/ui/Section';
```

### Example Usage
```tsx
<Section background="grid">
  <Container size="xl">
    <Badge variant="primary" dot>New Release</Badge>
    <h1 className="gradient-text">Autonomous Systems</h1>
    <p>Build tools that work while you sleep.</p>
    
    <div className="flex gap-4">
      <Button variant="primary" size="lg">Get Started</Button>
      <Button variant="secondary" size="lg">Learn More</Button>
    </div>
    
    <Card variant="glass" hoverable padding="lg">
      <h3>Feature Title</h3>
      <p>Feature description...</p>
    </Card>
  </Container>
</Section>
```

### CSS Utilities
```tsx
// Gradient text
<h1 className="gradient-text">Hello World</h1>

// Glass card (pre-built class)
<div className="glass-card p-6 rounded-lg">...</div>

// Grid background
<section className="bg-grid-pattern">...</section>

// Animations
<div className="animate-slide-up stagger-2">...</div>
```

## 📐 Layout Patterns

### Hero Section
- Full viewport height
- Centered content (max-width 900px)
- Badge → Headline → Subline → CTAs → Stats
- Grid background + glow effects

### Feature Grid
- 3-column grid (responsive: 1 col mobile, 2 col tablet, 3 col desktop)
- Glass cards with hover effects
- Icon → Title → Description structure
- Staggered animations (ScrollReveal)

### Product Cards
- Solid card variant
- Image + Badge + Title + Price + CTA
- Hover: border glow + lift effect

## 🎯 Brand Voice

### Writing Style
- **Direct** — No corporate fluff
- **Specific** — Use numbers, examples, outcomes
- **Empowering** — "Build", "Create", "Launch" (not "Try", "Learn")
- **Human** — Conversational but professional

### Vocabulary
✅ Use: Autonomous, Compound, Systems, Infrastructure, Revenue, Build, Ship, Deploy, Execute, Scale
❌ Avoid: "Solutions", "Leverage", "Synergy", "Revolutionary", vague promises

### Headline Formulas
```
[Action] + [Outcome] + [Timeframe]
"Build Trading Agents That Run 24/7"

[Tool] + [Benefit] + [For Whom]
"AI Content Pipeline for Solo Creators"

[Problem] + [Solution]
"Stop Trading Manually. Start Compounding."
```

## ♿ Accessibility

### Built-In Features
- Semantic HTML (header, main, nav, section, article)
- Keyboard navigation support
- Focus states (2px purple outline, 2px offset)
- ARIA labels on interactive elements
- Color contrast: 4.5:1 minimum
- Reduced motion support (@media prefers-reduced-motion)

### Testing Checklist
- [ ] Tab through all interactive elements
- [ ] Test with screen reader
- [ ] Verify color contrast (use tool)
- [ ] Test on mobile devices
- [ ] Verify animations respect reduced motion preference

## 🔧 Development Workflow

### Local Development
```bash
cd C:\GWDS\gwds-website
npm run dev  # Starts on localhost:3000
```

### File Structure
```
src/
├── app/
│   ├── globals.css         # Design tokens + utilities
│   ├── layout.tsx          # Root layout
│   ├── page.tsx            # Home page
│   └── [routes]/           # Other pages
├── components/
│   ├── ui/                 # Reusable UI components
│   │   ├── Button.tsx
│   │   ├── Card.tsx
│   │   ├── Badge.tsx
│   │   ├── Container.tsx
│   │   └── Section.tsx
│   ├── Navbar.tsx          # Site navigation
│   ├── Hero.tsx            # Homepage hero
│   ├── Footer.tsx          # Site footer
│   └── [features]/         # Feature components
└── lib/
    └── products.ts         # Product data
```

### Git Workflow
```bash
# After making changes
git add .
git commit -m "feat: implement design system"
git push origin main
```

## 📦 Component API Reference

### Button
```tsx
<Button
  variant="primary" | "secondary" | "ghost" | "danger"
  size="sm" | "md" | "lg"
  icon={<Icon />}
  iconPosition="left" | "right"
  loading={boolean}
  fullWidth={boolean}
  onClick={handler}
>
  Button Text
</Button>
```

### Card
```tsx
<Card
  variant="glass" | "solid" | "bordered"
  hoverable={boolean}
  padding="none" | "sm" | "md" | "lg"
>
  Card content
</Card>
```

### Badge
```tsx
<Badge
  variant="primary" | "success" | "warning" | "error" | "neutral"
  dot={boolean}
>
  Badge text
</Badge>
```

### Container
```tsx
<Container size="sm" | "md" | "lg" | "xl" | "full">
  Page content
</Container>
```

### Section
```tsx
<Section
  id="section-id"
  background="default" | "dark" | "grid"
>
  Section content
</Section>
```

## 🎨 Color Reference

| Token | Value | Usage |
|-------|-------|-------|
| `--color-electric-purple` | oklch(0.65 0.29 295) | Primary CTAs, brand highlights |
| `--color-cyan-bright` | oklch(0.75 0.15 195) | Accents, links, secondary actions |
| `--color-void-black` | oklch(0.08 0 0) | Background, foundations |
| `--color-space-dark` | oklch(0.12 0.01 270) | Cards, elevated surfaces |
| `--color-text-bright` | oklch(0.98 0 0) | Headlines, primary text |
| `--color-text-muted` | oklch(0.68 0.01 250) | Body text, secondary content |

## 🚦 Status

✅ **Completed:**
- Brand Guide created
- Design System documented
- CSS tokens implemented
- UI component library built
- globals.css updated

🔄 **In Progress:**
- Sub-agent modernizing all website pages
- Updating existing components to use new design system
- Enhancing mobile responsiveness
- Adding micro-interactions

## 📚 Resources

- **Brand Guide**: `BRAND-GUIDE.md`
- **Design System**: `DESIGN-SYSTEM.md`
- **Figma** (if you want): Design tokens can be imported
- **Storybook** (optional): Could set up component showcase

---

**Questions?** Refer to the Brand Guide for visual identity questions, Design System for technical implementation, or just ask me!
