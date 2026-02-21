import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Configuracoes — Teki',
  description: 'Gerencie suas configuracoes do Teki',
};

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
