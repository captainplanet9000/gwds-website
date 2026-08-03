import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Checkout",
  description: "Complete your purchase of Cival Systems trading software.",
};

export default function CheckoutLayout({ children }: { children: React.ReactNode }) {
  return children;
}
