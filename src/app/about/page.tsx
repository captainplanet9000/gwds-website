"use client";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Newsletter from "@/components/Newsletter";
import { PageTransition, FadeIn, ScrollReveal } from "@/components/motion";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { Card } from "@/components/ui/Card";

const tools = [
  { name: "Next.js", cat: "Development" },
  { name: "TypeScript", cat: "Development" },
  { name: "Tailwind CSS", cat: "Development" },
  { name: "Supabase", cat: "Backend" },
  { name: "Vercel", cat: "Deployment" },
  { name: "Houdini / VEX", cat: "3D / VFX" },
  { name: "DaVinci Resolve", cat: "Video" },
  { name: "ComfyUI", cat: "AI Art" },
  { name: "Higgsfield.ai", cat: "AI Video" },
  { name: "Claude / GPT-4 / Gemini", cat: "AI Models" },
  { name: "Midjourney / Flux", cat: "AI Art" },
  { name: "Hyperliquid", cat: "Trading" },
];

const values = [
  {
    emoji: "🔨",
    title: "Build First, Sell Second",
    desc: "We don't make products to sell. We build tools for ourselves, battle-test them with real money and real workflows, then package the best ones for you.",
  },
  {
    emoji: "🤖",
    title: "AI-Native",
    desc: "Every product leverages AI — not as a gimmick, but as a core capability. We use the latest models and workflows because that's genuinely how we work.",
  },
  {
    emoji: "💎",
    title: "Quality Over Quantity",
    desc: "We'd rather ship 5 exceptional products than 50 mediocre ones. Every template has full source code. Every asset is production-ready.",
  },
  {
    emoji: "⚡",
    title: "One-Person Speed",
    desc: "No committees, no approvals, no bureaucracy. One founder with AI leverage moves faster than teams of 20. That speed shows up in everything we ship.",
  },
];

export default function AboutPage() {
  return (
    <PageTransition>
      <Navbar />
      <main style={{ paddingTop: 72, minHeight: "100vh" }}>
        {/* Hero */}
        <FadeIn>
          <Section>
            <Container size="md" style={{ textAlign: "center" }}>
              <h1
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: "clamp(2.25rem, 6vw, 3.5rem)",
                  fontWeight: 800,
                  letterSpacing: "var(--tracking-tight)",
                  marginBottom: "var(--space-6)",
                  lineHeight: "var(--leading-tight)",
                }}
              >
                One Studio.<br />
                <span className="gradient-text">Infinite Output.</span>
              </h1>
              <p style={{ 
                color: "var(--color-text-muted)", 
                fontSize: "var(--text-lg)", 
                lineHeight: "var(--leading-relaxed)", 
                maxWidth: "40rem", 
                margin: "0 auto" 
              }}>
                Gamma Waves Design Studio is a one-person digital products company that punches way above its weight.
                We combine cutting-edge AI, real trading experience, 3D production skills, and relentless shipping speed
                to create products that actually work — because we use them ourselves, every single day.
              </p>
            </Container>
          </Section>
        </FadeIn>

        {/* Values */}
        <ScrollReveal>
          <Section>
            <Container size="lg">
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(min(280px, 100%), 1fr))",
                  gap: "var(--space-6)",
                }}
              >
                {values.map((v) => (
                  <Card key={v.title} variant="glass" hoverable padding="lg">
                    <span style={{ fontSize: "var(--text-4xl)", display: "block", marginBottom: "var(--space-4)" }}>
                      {v.emoji}
                    </span>
                    <h3
                      style={{
                        fontFamily: "var(--font-display)",
                        fontWeight: 600,
                        fontSize: "var(--text-xl)",
                        color: "var(--color-text-bright)",
                        marginBottom: "var(--space-2)",
                      }}
                    >
                      {v.title}
                    </h3>
                    <p style={{ 
                      color: "var(--color-text-muted)", 
                      fontSize: "var(--text-sm)", 
                      lineHeight: "var(--leading-relaxed)" 
                    }}>
                      {v.desc}
                    </p>
                  </Card>
                ))}
              </div>
            </Container>
          </Section>
        </ScrollReveal>

        {/* The Flywheel */}
        <ScrollReveal>
          <Section style={{ borderTop: "1px solid rgba(139,92,246,0.06)" }}>
            <Container size="md">
              <div style={{ textAlign: "center", marginBottom: "var(--space-12)" }}>
                <h2
                  style={{
                    fontFamily: "var(--font-display)",
                    fontSize: "var(--text-4xl)",
                    fontWeight: 700,
                    marginBottom: "var(--space-4)",
                  }}
                >
                  The <span className="gradient-text">Flywheel</span>
                </h2>
                <p style={{ 
                  color: "var(--color-text-muted)", 
                  fontSize: "var(--text-base)", 
                  maxWidth: "35rem", 
                  margin: "0 auto" 
                }}>
                  Everything feeds into everything. Content generates revenue. Revenue funds trading. Trading generates capital. Capital funds more products.
                </p>
              </div>

              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "var(--space-0_5)",
                  maxWidth: "32rem",
                  margin: "0 auto",
                }}
              >
                {[
                  { label: "Products & Content", arrow: true },
                  { label: "Revenue", arrow: true },
                  { label: "Trading Capital", arrow: true },
                  { label: "Compounding Returns", arrow: true },
                  { label: "More Products", arrow: false },
                ].map((item, i) => (
                  <div key={i} style={{ textAlign: "center" }}>
                    <div
                      style={{
                        padding: "var(--space-4) var(--space-8)",
                        borderRadius: "var(--radius-lg)",
                        background: "rgba(139,92,246,0.08)",
                        border: "1px solid rgba(139,92,246,0.12)",
                        fontWeight: 600,
                        fontSize: "var(--text-base)",
                        color: "var(--color-text-bright)",
                      }}
                    >
                      {item.label}
                    </div>
                    {item.arrow && (
                      <div style={{ 
                        color: "var(--color-electric-purple)", 
                        fontSize: "var(--text-xl)", 
                        padding: "var(--space-1) 0" 
                      }}>
                        ↓
                      </div>
                    )}
                  </div>
                ))}
                <div style={{ 
                  textAlign: "center", 
                  color: "var(--color-electric-purple)", 
                  fontSize: "var(--text-xl)", 
                  padding: "var(--space-1) 0" 
                }}>
                  ↻ repeat
                </div>
              </div>
            </Container>
          </Section>
        </ScrollReveal>

        {/* Tech Stack */}
        <ScrollReveal>
          <Section style={{ borderTop: "1px solid rgba(139,92,246,0.06)" }}>
            <Container size="lg">
              <div style={{ textAlign: "center", marginBottom: "var(--space-12)" }}>
                <h2
                  style={{
                    fontFamily: "var(--font-display)",
                    fontSize: "var(--text-4xl)",
                    fontWeight: 700,
                    marginBottom: "var(--space-4)",
                  }}
                >
                  Our <span className="gradient-text">Stack</span>
                </h2>
                <p style={{ color: "var(--color-text-muted)", fontSize: "var(--text-base)" }}>
                  The tools and technologies behind every GWDS product.
                </p>
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "var(--space-2_5)", justifyContent: "center" }}>
                {tools.map((t) => (
                  <Card
                    key={t.name}
                    variant="glass"
                    hoverable
                    padding="sm"
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "var(--space-0_5)",
                    }}
                  >
                    <span style={{ 
                      fontWeight: 600, 
                      fontSize: "var(--text-sm)", 
                      color: "var(--color-text-bright)" 
                    }}>
                      {t.name}
                    </span>
                    <span style={{ fontSize: "var(--text-xs)", color: "var(--color-text-muted)" }}>
                      {t.cat}
                    </span>
                  </Card>
                ))}
              </div>
            </Container>
          </Section>
        </ScrollReveal>

        <Newsletter />
      </main>
      <Footer />
    </PageTransition>
  );
}
