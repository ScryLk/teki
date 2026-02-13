'use client';

import { LandingNavbar } from '@/components/landing/LandingNavbar';
import { HeroSection } from '@/components/landing/HeroSection';
import { DemoSection } from '@/components/landing/DemoSection';
import { FeaturesSection } from '@/components/landing/FeaturesSection';
import { HowItWorksSection } from '@/components/landing/HowItWorksSection';
import { TechStackSection } from '@/components/landing/TechStackSection';
import { FAQSection } from '@/components/landing/FAQSection';
import { CTASection } from '@/components/landing/CTASection';
import { LandingFooter } from '@/components/landing/LandingFooter';

export default function LandingPage() {
  return (
    <div className="font-inter min-h-screen bg-[#09090b] text-[#fafafa]">
      <LandingNavbar />
      <main>
        <HeroSection />
        <DemoSection />
        <FeaturesSection />
        <HowItWorksSection />
        <TechStackSection />
        <FAQSection />
        <CTASection />
      </main>
      <LandingFooter />
    </div>
  );
}
