"use client";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { PageTransition, FadeIn } from "@/components/motion";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

export default function ContactPage() {
  return (
    <PageTransition>
      <Navbar />
      <main style={{ paddingTop: 72, minHeight: "100vh" }}>
        <FadeIn>
          <Section>
            <Container size="sm">
              <div style={{ textAlign: "center", marginBottom: "var(--space-16)" }}>
                <h1
                  style={{
                    fontFamily: "var(--font-display)",
                    fontSize: "clamp(2.25rem, 5vw, 3rem)",
                    fontWeight: 800,
                    letterSpacing: "var(--tracking-tight)",
                    marginBottom: "var(--space-4)",
                  }}
                >
                  Get in <span className="gradient-text">Touch</span>
                </h1>
                <p style={{ 
                  color: "var(--color-text-muted)", 
                  fontSize: "var(--text-base)", 
                  maxWidth: "30rem", 
                  margin: "0 auto" 
                }}>
                  Questions about products, licensing, collaborations, or custom work? We&apos;d love to hear from you.
                </p>
              </div>

              <Card variant="glass" padding="lg">
                <form
                  onSubmit={(e) => e.preventDefault()}
                  style={{ display: "flex", flexDirection: "column", gap: "var(--space-5)" }}
                >
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--space-4)" }}>
                    <div>
                      <label style={{ 
                        display: "block", 
                        fontSize: "var(--text-sm)", 
                        fontWeight: 500, 
                        color: "var(--color-text-muted)", 
                        marginBottom: "var(--space-1_5)" 
                      }}>
                        Name
                      </label>
                      <input
                        type="text"
                        placeholder="Your name"
                        style={{
                          width: "100%",
                          padding: "var(--space-3_5) var(--space-4)",
                          borderRadius: "var(--radius-lg)",
                          border: "1px solid rgba(139,92,246,0.15)",
                          background: "rgba(10,10,15,0.6)",
                          color: "var(--color-text-bright)",
                          fontSize: "var(--text-sm)",
                          outline: "none",
                          transition: "all var(--duration-base)",
                        }}
                        onFocus={(e) => {
                          e.currentTarget.style.borderColor = "var(--color-electric-purple)";
                          e.currentTarget.style.boxShadow = "0 0 0 3px rgba(139,92,246,0.1)";
                        }}
                        onBlur={(e) => {
                          e.currentTarget.style.borderColor = "rgba(139,92,246,0.15)";
                          e.currentTarget.style.boxShadow = "none";
                        }}
                      />
                    </div>
                    <div>
                      <label style={{ 
                        display: "block", 
                        fontSize: "var(--text-sm)", 
                        fontWeight: 500, 
                        color: "var(--color-text-muted)", 
                        marginBottom: "var(--space-1_5)" 
                      }}>
                        Email
                      </label>
                      <input
                        type="email"
                        placeholder="you@email.com"
                        style={{
                          width: "100%",
                          padding: "var(--space-3_5) var(--space-4)",
                          borderRadius: "var(--radius-lg)",
                          border: "1px solid rgba(139,92,246,0.15)",
                          background: "rgba(10,10,15,0.6)",
                          color: "var(--color-text-bright)",
                          fontSize: "var(--text-sm)",
                          outline: "none",
                          transition: "all var(--duration-base)",
                        }}
                        onFocus={(e) => {
                          e.currentTarget.style.borderColor = "var(--color-electric-purple)";
                          e.currentTarget.style.boxShadow = "0 0 0 3px rgba(139,92,246,0.1)";
                        }}
                        onBlur={(e) => {
                          e.currentTarget.style.borderColor = "rgba(139,92,246,0.15)";
                          e.currentTarget.style.boxShadow = "none";
                        }}
                      />
                    </div>
                  </div>

                  <div>
                    <label style={{ 
                      display: "block", 
                      fontSize: "var(--text-sm)", 
                      fontWeight: 500, 
                      color: "var(--color-text-muted)", 
                      marginBottom: "var(--space-1_5)" 
                    }}>
                      Subject
                    </label>
                    <select
                      style={{
                        width: "100%",
                        padding: "var(--space-3_5) var(--space-4)",
                        borderRadius: "var(--radius-lg)",
                        border: "1px solid rgba(139,92,246,0.15)",
                        background: "rgba(10,10,15,0.6)",
                        color: "var(--color-text-muted)",
                        fontSize: "var(--text-sm)",
                        outline: "none",
                        cursor: "pointer",
                      }}
                    >
                      <option>Product Question</option>
                      <option>Custom Work</option>
                      <option>Collaboration</option>
                      <option>Licensing</option>
                      <option>Other</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ 
                      display: "block", 
                      fontSize: "var(--text-sm)", 
                      fontWeight: 500, 
                      color: "var(--color-text-muted)", 
                      marginBottom: "var(--space-1_5)" 
                    }}>
                      Message
                    </label>
                    <textarea
                      rows={6}
                      placeholder="Tell us what you need..."
                      style={{
                        width: "100%",
                        padding: "var(--space-3_5) var(--space-4)",
                        borderRadius: "var(--radius-lg)",
                        border: "1px solid rgba(139,92,246,0.15)",
                        background: "rgba(10,10,15,0.6)",
                        color: "var(--color-text-bright)",
                        fontSize: "var(--text-sm)",
                        outline: "none",
                        resize: "vertical",
                        fontFamily: "inherit",
                        lineHeight: "var(--leading-relaxed)",
                        transition: "all var(--duration-base)",
                      }}
                      onFocus={(e) => {
                        e.currentTarget.style.borderColor = "var(--color-electric-purple)";
                        e.currentTarget.style.boxShadow = "0 0 0 3px rgba(139,92,246,0.1)";
                      }}
                      onBlur={(e) => {
                        e.currentTarget.style.borderColor = "rgba(139,92,246,0.15)";
                        e.currentTarget.style.boxShadow = "none";
                      }}
                    />
                  </div>

                  <Button type="submit" variant="primary" size="lg" fullWidth>
                    Send Message
                  </Button>
                </form>
              </Card>

              {/* Direct contact */}
              <div style={{ textAlign: "center", marginTop: "var(--space-12)" }}>
                <p style={{ 
                  color: "var(--color-text-muted)", 
                  fontSize: "var(--text-sm)", 
                  marginBottom: "var(--space-3)" 
                }}>
                  Or reach out directly:
                </p>
                <a
                  href="mailto:gammawavesdesign@gmail.com"
                  style={{
                    color: "var(--color-electric-purple)",
                    textDecoration: "none",
                    fontWeight: 500,
                    fontSize: "var(--text-base)",
                    transition: "color var(--duration-fast)",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = "var(--color-cyan-bright)")}
                  onMouseLeave={(e) => (e.currentTarget.style.color = "var(--color-electric-purple)")}
                >
                  gammawavesdesign@gmail.com
                </a>
              </div>
            </Container>
          </Section>
        </FadeIn>
      </main>
      <Footer />
    </PageTransition>
  );
}
