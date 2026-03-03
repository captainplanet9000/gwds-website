import Link from "next/link";

const projects = [
  {
    title: "Cival Trading Dashboard",
    description: "Autonomous AI trading platform with 7 strategy farms, 36+ agents, and real-money execution on Hyperliquid mainnet. Goal-based trading, risk analytics, and 24/7 operation.",
    tags: ["Next.js 15", "TypeScript", "Supabase", "Hyperliquid SDK", "AI Agents"],
    link: "/store/trading-dashboard-template",
    emoji: "📊",
    status: "LIVE",
  },
  {
    title: "Meme Trading System",
    description: "Automated meme coin discovery and execution engine. Detects trending tokens, analyzes momentum, and executes trades with configurable risk parameters.",
    tags: ["Next.js 15", "TypeScript", "Hyperliquid", "Signal Engine"],
    link: "/store/meme-trading-template",
    emoji: "🐸",
    status: "LIVE",
  },
  {
    title: "Second Brain",
    description: "PARA-organized personal knowledge base with Kanban tasks, documents, AI chat, weekly digests, and full-text search. Your productivity command center.",
    tags: ["Next.js 15", "Supabase", "TailwindCSS", "AI Integration"],
    link: "/store/second-brain-template",
    emoji: "🧠",
    status: "LIVE",
  },
  {
    title: "The 400 Club",
    description: "9,400-piece generative art NFT collection on Ethereum. Unique characters with trait-based rarity, community perks, and holder benefits.",
    tags: ["Ethereum", "Solidity", "Generative Art", "NFTs"],
    link: "https://fourhundred.club",
    emoji: "🎭",
    status: "IN PROGRESS",
  },
  {
    title: "GWDS Digital Store",
    description: "Full e-commerce platform selling digital products — templates, trading tools, prompt packs, and wallpapers. Stripe payments, instant downloads, email delivery.",
    tags: ["Next.js 16", "Stripe", "Supabase", "Resend"],
    link: "/store",
    emoji: "🛒",
    status: "LIVE",
  },
  {
    title: "Clay Verse Animations",
    description: "Claymation-style animated content for TikTok. Robot Chicken-inspired skits with custom character library and full production pipeline.",
    tags: ["Remotion", "React", "3D Animation", "TikTok"],
    link: "/store/clay-verse-pack",
    emoji: "🏗️",
    status: "IN PROGRESS",
  },
];

export default function WorkPage() {
  return (
    <main style={{ minHeight: "100vh", background: "#0a0a0a", color: "#fff", padding: "120px 24px 80px" }}>
      <div style={{ maxWidth: 1000, margin: "0 auto" }}>
        <p style={{ color: "#8B5CF6", fontSize: 14, fontWeight: 600, letterSpacing: 2, marginBottom: 8 }}>
          OUR WORK
        </p>
        <h1 style={{ fontSize: 48, fontWeight: 800, marginBottom: 16, fontFamily: "'Space Grotesk', sans-serif" }}>
          What We Build
        </h1>
        <p style={{ color: "#999", fontSize: 18, marginBottom: 64, maxWidth: 600 }}>
          Real products. Real code. Everything ships with source code and documentation.
        </p>

        <div style={{ display: "grid", gap: 24 }}>
          {projects.map((project) => (
            <Link
              key={project.title}
              href={project.link}
              style={{
                display: "block",
                background: "#111",
                border: "1px solid #222",
                borderRadius: 16,
                padding: 32,
                textDecoration: "none",
                color: "#fff",
                transition: "border-color 0.2s",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <span style={{ fontSize: 32 }}>{project.emoji}</span>
                  <h2 style={{ fontSize: 24, fontWeight: 700, fontFamily: "'Space Grotesk', sans-serif" }}>
                    {project.title}
                  </h2>
                </div>
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 700,
                    letterSpacing: 1,
                    padding: "4px 10px",
                    borderRadius: 6,
                    background: project.status === "LIVE" ? "#10B98120" : "#F59E0B20",
                    color: project.status === "LIVE" ? "#10B981" : "#F59E0B",
                  }}
                >
                  {project.status}
                </span>
              </div>
              <p style={{ color: "#999", fontSize: 15, lineHeight: 1.6, marginBottom: 16 }}>
                {project.description}
              </p>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {project.tags.map((tag) => (
                  <span
                    key={tag}
                    style={{
                      fontSize: 12,
                      padding: "4px 10px",
                      borderRadius: 6,
                      background: "#1a1a2e",
                      color: "#8B5CF6",
                      border: "1px solid #2a2a4e",
                    }}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}
