'use client';

import { useState, useEffect, useCallback } from 'react';
import type { KbUsageSummary, InsertionMode } from '@/lib/kb/types';

interface KbUsageData {
  plan: string;
  usage: KbUsageSummary;
  limits: {
    maxKbArticles: number;
    maxStorageBytes: number;
    maxFileSizeBytes: number;
    allowedInsertionModes: InsertionMode[];
    allowedFileTypes: string[];
    maxAiSuggestionsPerDay: number;
  };
  modeBadges: Partial<Record<InsertionMode, string>>;
}

export function useKbUsage() {
  const [data, setData] = useState<KbUsageData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUsage = useCallback(async () => {
    try {
      const res = await fetch('/api/kb/usage');
      if (!res.ok) throw new Error('Falha ao buscar uso');
      const json = await res.json();
      setData(json);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsage();
  }, [fetchUsage]);

  const isModeAllowed = useCallback(
    (mode: InsertionMode): boolean => {
      if (!data) return false;
      return data.limits.allowedInsertionModes.includes(mode);
    },
    [data]
  );

  const getModeBadge = useCallback(
    (mode: InsertionMode): string | null => {
      if (!data) return null;
      return data.modeBadges[mode] ?? null;
    },
    [data]
  );

  const canCreateArticle = data
    ? data.usage.articles.used < data.usage.articles.limit
    : false;

  return {
    data,
    loading,
    error,
    refetch: fetchUsage,
    isModeAllowed,
    getModeBadge,
    canCreateArticle,
  };
}
