import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About — GWDS",
  description: "One-person digital products studio combining AI, trading, and 3D to create exceptional products. Learn about our flywheel, values, and tech stack.",
  openGraph: {
    title: "About — GWDS",
    description: "One-person digital products studio combining AI, trading, and 3D to create exceptional products.",
  },
};

export default function AboutLayout({ children }: { children: React.ReactNode }) {
  return children;
}
