import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Content — GWDS",
  description: "6 content channels, 5 videos per day. Claymation, cooking shows, motivation, trading education — all AI-powered.",
  openGraph: {
    title: "Content — GWDS",
    description: "6 content channels, 5 videos per day — all AI-powered content creation.",
  },
};

export default function ContentLayout({ children }: { children: React.ReactNode }) {
  return children;
}
