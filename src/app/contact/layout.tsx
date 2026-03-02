import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact — GWDS",
  description: "Get in touch with Gamma Waves Design Studio. Questions about products, licensing, collaborations, or custom work.",
  openGraph: {
    title: "Contact — GWDS",
    description: "Get in touch with Gamma Waves Design Studio for product questions, collaborations, and custom work.",
  },
};

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return children;
}
