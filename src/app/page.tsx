"use client";
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import CategorySection from "@/components/CategorySection";
import FeaturedProducts from "@/components/FeaturedProducts";
import StickySections from "@/components/StickySections";
import HowItWorks from "@/components/HowItWorks";
import Newsletter from "@/components/Newsletter";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <CategorySection />
        <FeaturedProducts />
        <StickySections />
        <HowItWorks />
        <Newsletter />
      </main>
      <Footer />
    </>
  );
}
