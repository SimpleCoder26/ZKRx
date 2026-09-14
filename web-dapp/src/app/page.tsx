"use client";

import BackedBySection from "@/components/BackedBySection";
import HeroSection from "@/components/HeroSection";
import InfoSection from "@/components/InfoSection";
import Navbar from "@/components/Navbar";
import UseCasesSection from "@/components/UseCasesSection";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <main className="flex flex-col bg-[#F5F5F5] min-h-screen">
      <div className="relative h-screen flex flex-col overflow-hidden">
        <Navbar />
        <HeroSection />
      </div>
      <InfoSection />
      <BackedBySection />
      <UseCasesSection />
      <Footer />
    </main>
  );
}
