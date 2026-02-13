import type { Metadata } from 'next';
import { Geist, Geist_Mono, Inter, JetBrains_Mono } from 'next/font/google';
import './globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
});

const jetbrainsMono = JetBrains_Mono({
  variable: '--font-jetbrains-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Teki — Assistente IA para Suporte Técnico | Download Grátis',
  description:
    'Teki é um assistente inteligente com IA para técnicos de suporte de TI. Diagnósticos em tempo real, busca em base de conhecimento em menos de 50ms e um gato mascote que observa sua tela.',
  openGraph: {
    title: 'Teki — Assistente IA para Suporte Técnico',
    description:
      'Assistente inteligente com IA para técnicos de suporte de TI. Diagnósticos em tempo real e busca ultra-rápida.',
    images: ['/og-image.png'],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className="dark">
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${inter.variable} ${jetbrainsMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
