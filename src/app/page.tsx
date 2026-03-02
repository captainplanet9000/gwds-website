'use client';

import Navbar from '@/components/Navbar';
import Hero from '@/components/Hero';
import WorkShowcase from '@/components/WorkShowcase';
import ProductGrid from '@/components/ProductGrid';
import Philosophy from '@/components/Philosophy';
import CTASection from '@/components/CTASection';
import Footer from '@/components/Footer';

export default function Home() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <WorkShowcase />
        <ProductGrid />
        <Philosophy />
        <CTASection />
      </main>
      <Footer />
    </>
  );
}
