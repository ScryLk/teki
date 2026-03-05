import { AmbientOrbs } from '@/components/landing/AmbientOrbs';
import { LandingNavbar } from '@/components/landing/LandingNavbar';
import { HeroSection } from '@/components/landing/HeroSection';
import { FeaturesSection } from '@/components/landing/FeaturesSection';
import { ShowcaseSection } from '@/components/landing/ShowcaseSection';
import { StatsSection } from '@/components/landing/StatsSection';
import { HowItWorksSection } from '@/components/landing/HowItWorksSection';
import { PricingSection } from '@/components/landing/PricingSection';
import { FAQSection } from '@/components/landing/FAQSection';
import { CTASection } from '@/components/landing/CTASection';
import { LandingFooter } from '@/components/landing/LandingFooter';

export const metadata = {
  title: 'Teki — Atendimento inteligente, humanizado por IA',
  description:
    'Transforme conversas em conhecimento. O Teki conecta IA ao seu time para resolver tickets mais rápido e nunca perder contexto.',
  keywords: ['suporte técnico', 'IA', 'help desk', 'base de conhecimento', 'WhatsApp', 'atendimento'],
  openGraph: {
    title: 'Teki — Atendimento inteligente, humanizado por IA',
    description: 'Transforme conversas em conhecimento. IA que resolve tickets mais rápido.',
    url: 'https://teki.com.br',
    siteName: 'Teki',
    images: [{ url: 'https://teki.com.br/og-image.png', width: 1200, height: 630 }],
    locale: 'pt_BR',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Teki — Atendimento inteligente, humanizado por IA',
    description: 'Transforme conversas em conhecimento. IA que resolve tickets mais rápido.',
    images: ['https://teki.com.br/og-image.png'],
  },
};

export default function LandingPage() {
  return (
    <div className="font-inter min-h-screen bg-[#07090b] text-[#f0eeeb]">
      <AmbientOrbs />
      <LandingNavbar />
      <main>
        <HeroSection />
        <FeaturesSection />
        <ShowcaseSection />
        <StatsSection />
        <HowItWorksSection />
        <PricingSection />
        <FAQSection />
        <CTASection />
      </main>
      <LandingFooter />
    </div>
  );
}
