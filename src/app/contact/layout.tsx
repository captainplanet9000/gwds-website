import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact",
  description: "Get in touch with Cival Systems. Questions about products, licensing, collaborations, or custom work.",
  openGraph: {
    title: "Contact — Cival Systems",
    description: "Get in touch with Cival Systems for product questions, collaborations, and custom work.",
  },
};

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return children;
}
