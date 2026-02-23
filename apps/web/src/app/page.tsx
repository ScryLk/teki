import { LandingNavbar } from '@/components/landing/LandingNavbar';
import { HeroSection } from '@/components/landing/HeroSection';
import { DemoSection } from '@/components/landing/DemoSection';
import { FeaturesSection } from '@/components/landing/FeaturesSection';
import { HowItWorksSection } from '@/components/landing/HowItWorksSection';
import { OpenClawSection } from '@/components/landing/OpenClawSection';
import { PricingSection } from '@/components/landing/PricingSection';
import { TestimonialsSection } from '@/components/landing/TestimonialsSection';
import { FAQSection } from '@/components/landing/FAQSection';
import { CTASection } from '@/components/landing/CTASection';
import { LandingFooter } from '@/components/landing/LandingFooter';

export const metadata = {
  title: 'Teki — Suporte Técnico com IA que Vê a Tela',
  description:
    'Assistente de TI que analisa screenshots, consulta sua base de conhecimento e responde no WhatsApp. Comece grátis.',
  keywords: ['suporte técnico', 'IA', 'help desk', 'base de conhecimento', 'WhatsApp', 'Gemini'],
  openGraph: {
    title: 'Teki — Suporte Técnico com IA',
    description: 'Assistente de TI que vê a tela e responde no WhatsApp.',
    url: 'https://teki.com.br',
    siteName: 'Teki',
    images: [{ url: 'https://teki.com.br/og-image.png', width: 1200, height: 630 }],
    locale: 'pt_BR',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Teki — Suporte Técnico com IA que Vê a Tela',
    description: 'Assistente de TI que analisa screenshots e responde no WhatsApp.',
    images: ['https://teki.com.br/og-image.png'],
  },
};

export default function LandingPage() {
  return (
    <div className="font-inter min-h-screen bg-[#09090b] text-[#fafafa]">
      <LandingNavbar />
      <main>
        <HeroSection />
        <DemoSection />
        <FeaturesSection />
        <HowItWorksSection />
        <OpenClawSection />
        <PricingSection />
        <TestimonialsSection />
        <FAQSection />
        <CTASection />
      </main>
      <LandingFooter />
    </div>
  );
}
