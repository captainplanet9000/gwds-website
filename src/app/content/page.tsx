"use client";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Newsletter from "@/components/Newsletter";
import { PageTransition, FadeIn, ScrollReveal } from "@/components/motion";

const channels = [
  {
    name: "Clay Verse",
    emoji: "🏗️",
    platform: "TikTok",
    desc: "150-episode claymation series. Charming stop-motion style storytelling, all AI-generated. Think Robot Chicken meets wholesome internet culture.",
    episodes: "150 episodes scripted",
    status: "In Production",
  },
  {
    name: "Hunni Bunni Kitchen",
    emoji: "🍳",
    platform: "TikTok",
    desc: "3D animated cooking show. Cute characters make real recipes in a beautifully rendered kitchen. Full recipe breakdowns included.",
    episodes: "Framework complete",
    status: "In Production",
  },
  {
    name: "What I Need to Hear",
    emoji: "💜",
    platform: "TikTok",
    desc: "Daily affirmation and motivation content. ASMPro script framework — 25 powerful scripts designed to hit different emotional needs.",
    episodes: "25 scripts ready",
    status: "Ready to Launch",
  },
  {
    name: "Honey Bunny",
    emoji: "🐰",
    platform: "TikTok / YouTube",
    desc: "Full motivational video pipeline using Monroe's Motivated Sequence. 6 character archetypes, professional-grade content.",
    episodes: "Pipeline complete",
    status: "Ready to Launch",
  },
  {
    name: "GWDS Behind the Scenes",
    emoji: "🎬",
    platform: "YouTube / TikTok",
    desc: "The making-of content. How we use AI to build products, run trading agents, create animations. Real process, no fluff.",
    episodes: "Ongoing",
    status: "Planning",
  },
  {
    name: "Trading Education",
    emoji: "📊",
    platform: "YouTube",
    desc: "Breaking down our autonomous trading systems, agent strategies, and real results. From Darvas boxes to Elliott waves.",
    episodes: "Ongoing",
    status: "Planning",
  },
];

export default function ContentPage() {
  return (
    <PageTransition>
      <Navbar />
      <main style={{ paddingTop: 72, minHeight: "100vh" }}>
        <FadeIn>
        <section style={{ padding: "80px 24px", maxWidth: 900, margin: "0 auto", textAlign: "center" }}>
          <h1
            style={{
              fontFamily: "'Space Grotesk', sans-serif",
              fontSize: "clamp(36px, 6vw, 52px)",
              fontWeight: 800,
              letterSpacing: "-0.03em",
              marginBottom: 24,
            }}
          >
            Content <span className="gradient-text">Machine</span>
          </h1>
          <p style={{ color: "#94A3B8", fontSize: 18, lineHeight: 1.7, maxWidth: 600, margin: "0 auto" }}>
            6 channels. 5 videos per day. All powered by AI generation tools, 3D workflows, and automated pipelines.
            Content is the engine that drives the GWDS flywheel.
          </p>
        </section>
        </FadeIn>

        <ScrollReveal>
        <section style={{ padding: "0 24px 100px", maxWidth: 1080, margin: "0 auto" }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))", gap: 24 }}>
            {channels.map((ch) => (
              <div key={ch.name} className="glass-card" style={{ borderRadius: 16, padding: 32, display: "flex", flexDirection: "column", gap: 12 }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <span style={{ fontSize: 36 }}>{ch.emoji}</span>
                  <span
                    style={{
                      fontSize: 11,
                      fontWeight: 600,
                      padding: "4px 10px",
                      borderRadius: 6,
                      background: ch.status === "Ready to Launch" ? "rgba(16,185,129,0.15)" :
                        ch.status === "In Production" ? "rgba(139,92,246,0.15)" :
                        "rgba(100,116,139,0.15)",
                      color: ch.status === "Ready to Launch" ? "#10B981" :
                        ch.status === "In Production" ? "#A78BFA" :
                        "#94A3B8",
                      letterSpacing: "0.03em",
                    }}
                  >
                    {ch.status}
                  </span>
                </div>
                <h3 style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600, fontSize: 20, color: "#F8FAFC" }}>
                  {ch.name}
                </h3>
                <span style={{ fontSize: 12, color: "#8B5CF6", fontWeight: 500 }}>{ch.platform} • {ch.episodes}</span>
                <p style={{ color: "#64748B", fontSize: 14, lineHeight: 1.6 }}>{ch.desc}</p>
              </div>
            ))}
          </div>
        </section>
        </ScrollReveal>

        {/* Platforms */}
        <ScrollReveal>
        <section
          style={{
            padding: "80px 24px",
            maxWidth: 900,
            margin: "0 auto",
            borderTop: "1px solid rgba(139,92,246,0.06)",
            textAlign: "center",
          }}
        >
          <h2
            style={{
              fontFamily: "'Space Grotesk', sans-serif",
              fontSize: 32,
              fontWeight: 700,
              marginBottom: 32,
            }}
          >
            Publishing <span className="gradient-text">Everywhere</span>
          </h2>
          <div style={{ display: "flex", gap: 24, justifyContent: "center", flexWrap: "wrap" }}>
            {["TikTok", "YouTube", "Instagram Reels", "X (Twitter)"].map((p) => (
              <div
                key={p}
                style={{
                  padding: "16px 32px",
                  borderRadius: 12,
                  background: "rgba(139,92,246,0.06)",
                  border: "1px solid rgba(139,92,246,0.1)",
                  fontWeight: 600,
                  color: "#CBD5E1",
                  fontSize: 15,
                }}
              >
                {p}
              </div>
            ))}
          </div>
        </section>
        </ScrollReveal>

        <Newsletter />
      </main>
      <Footer />
    </PageTransition>
  );
}
