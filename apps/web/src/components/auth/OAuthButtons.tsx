'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { IconBrandGoogle, IconBrandGithub, IconLoader2 } from '@tabler/icons-react';

interface OAuthButtonsProps {
  /** Show only these providers (if empty, shows all available) */
  providers?: string[];
  disabled?: boolean;
  callbackUrl?: string;
}

const PROVIDERS = [
  {
    id: 'google',
    label: 'Google',
    icon: IconBrandGoogle,
  },
  {
    id: 'github',
    label: 'GitHub',
    icon: IconBrandGithub,
  },
] as const;

export function OAuthButtons({
  providers,
  disabled,
  callbackUrl = '/chat',
}: OAuthButtonsProps) {
  const [loading, setLoading] = useState<string | null>(null);

  const visibleProviders = providers
    ? PROVIDERS.filter((p) => providers.includes(p.id))
    : PROVIDERS;

  if (visibleProviders.length === 0) return null;

  const handleOAuth = async (providerId: string) => {
    setLoading(providerId);
    try {
      await signIn(providerId, { callbackUrl });
    } catch {
      // signIn redirects — errors are handled by NextAuth
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="flex flex-col gap-2">
      {visibleProviders.map(({ id, label, icon: Icon }) => (
        <Button
          key={id}
          type="button"
          variant="outline"
          size="lg"
          className="w-full"
          disabled={disabled || loading !== null}
          onClick={() => handleOAuth(id)}
        >
          {loading === id ? (
            <IconLoader2 className="size-4 animate-spin" />
          ) : (
            <Icon className="size-4" />
          )}
          Continuar com {label}
        </Button>
      ))}
    </div>
  );
}
