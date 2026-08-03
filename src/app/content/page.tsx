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
    name: "Cival Systems Behind the Scenes",
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

function statusTagClass(status: string) {
  if (status === "Ready to Launch") return "tag-accent-2";
  if (status === "In Production") return "tag-accent";
  return "tag-neutral";
}

export default function ContentPage() {
  return (
    <div className="cival">
      <PageTransition>
        <Navbar />
        <main className="cival-fade" style={{ paddingTop: 150, minHeight: "100vh" }}>
          <FadeIn>
            <section style={{ padding: "0 24px 64px", maxWidth: 760, margin: "0 auto", textAlign: "center" }}>
              <h6 style={{ marginBottom: 14 }}>Content · 6 channels</h6>
              <h1
                style={{
                  fontSize: "clamp(40px, 6vw, 62px)",
                  letterSpacing: "-0.018em",
                  lineHeight: 1.08,
                  margin: "0 0 22px",
                }}
              >
                Content <span style={{ color: "var(--color-accent)" }}>machine</span>
              </h1>
              <p style={{ color: "var(--color-neutral-700)", fontSize: 16.5, lineHeight: 1.7, maxWidth: 560, margin: "0 auto" }}>
                6 channels. 5 videos per day. All powered by AI generation tools, 3D workflows, and automated pipelines.
                Content is the engine that drives the Cival Systems flywheel.
              </p>
            </section>
          </FadeIn>

          <ScrollReveal>
            <section style={{ padding: "0 24px 100px", maxWidth: 1080, margin: "0 auto" }}>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 20 }}>
                {channels.map((ch) => (
                  <div
                    key={ch.name}
                    style={{
                      borderRadius: "calc(var(--radius-lg) * 1.15)",
                      background: "var(--color-surface)",
                      padding: "28px 26px",
                      display: "flex",
                      flexDirection: "column",
                      gap: 12,
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                      <span style={{ fontSize: 34 }}>{ch.emoji}</span>
                      <span className={`tag ${statusTagClass(ch.status)}`}>{ch.status}</span>
                    </div>
                    <h3 style={{ fontSize: 20, letterSpacing: "-0.015em", margin: 0, lineHeight: 1.2 }}>
                      {ch.name}
                    </h3>
                    <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, letterSpacing: "0.06em", textTransform: "uppercase", color: "var(--color-accent)" }}>
                      {ch.platform} · {ch.episodes}
                    </span>
                    <p style={{ color: "var(--color-neutral-800)", fontSize: 14, lineHeight: 1.6, margin: 0 }}>{ch.desc}</p>
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
                borderTop: "1px solid var(--color-divider)",
                textAlign: "center",
              }}
            >
              <h2
                style={{
                  fontSize: 32,
                  letterSpacing: "-0.015em",
                  marginBottom: 32,
                }}
              >
                Publishing <span style={{ color: "var(--color-accent)" }}>everywhere</span>
              </h2>
              <div style={{ display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap" }}>
                {["TikTok", "YouTube", "Instagram Reels", "X (Twitter)"].map((p) => (
                  <div
                    key={p}
                    style={{
                      padding: "14px 28px",
                      borderRadius: 999,
                      background: "var(--color-surface)",
                      border: "1px solid var(--color-divider)",
                      fontFamily: "var(--font-mono)",
                      fontSize: 13,
                      letterSpacing: "0.04em",
                      textTransform: "uppercase",
                      color: "var(--color-text)",
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
    </div>
  );
}
