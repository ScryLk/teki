import type {
  PotentialError,
  KbMatchResult,
  KbArticleMatch,
  KbMatchType,
  DetectedSoftware,
} from '@teki/shared';
import { ErrorExtractor } from './error-patterns';

// ═══════════════════════════════════════════════════════════════
// KB Matcher Service
// Automatically searches the knowledge base when errors are detected
// ═══════════════════════════════════════════════════════════════

interface KbSearchOptions {
  tenantId?: string;
  maxResults?: number;
}

export class KbMatcherService {
  private errorExtractor: ErrorExtractor;
  private apiBaseUrl: string | null = null;

  constructor(errorExtractor: ErrorExtractor) {
    this.errorExtractor = errorExtractor;
  }

  setApiBaseUrl(url: string): void {
    this.apiBaseUrl = url;
  }

  async findMatches(
    errors: PotentialError[],
    software?: DetectedSoftware,
    options: KbSearchOptions = {}
  ): Promise<KbMatchResult[]> {
    const results: KbMatchResult[] = [];

    for (const error of errors) {
      const matchResult = await this.matchError(error, software, options);
      if (matchResult.matches.length > 0) {
        results.push(matchResult);
      }
    }

    return results;
  }

  private async matchError(
    error: PotentialError,
    software?: DetectedSoftware,
    options: KbSearchOptions = {}
  ): Promise<KbMatchResult> {
    const maxResults = options.maxResults ?? 5;
    const searchTermsUsed: string[] = [];
    const allMatches: KbArticleMatch[] = [];

    // 1. Exact code match (highest priority)
    if (error.code) {
      const codeTerms = this.getCodeSearchTerms(error);
      searchTermsUsed.push(...codeTerms);

      const codeMatches = await this.searchKb(codeTerms.join(' '), 'exact_code', options);
      allMatches.push(...codeMatches);
    }

    // 2. Keyword match from error pattern's KB search terms
    const patternId = error.source !== 'generic' ? error.source : undefined;
    if (patternId) {
      const kbTerms = this.errorExtractor.getKbSearchTerms(patternId, error.code);
      if (kbTerms.length > 0) {
        searchTermsUsed.push(...kbTerms);
        const keywordMatches = await this.searchKb(kbTerms.join(' '), 'keyword', options);
        allMatches.push(...keywordMatches);
      }
    }

    // 3. Semantic search with error text
    if (error.text.length > 10) {
      const semanticQuery = this.buildSemanticQuery(error, software);
      searchTermsUsed.push(semanticQuery);
      const semanticMatches = await this.searchKb(semanticQuery, 'semantic', options);
      allMatches.push(...semanticMatches);
    }

    // 4. Category-based search
    if (software) {
      const categoryQuery = `${software.name} ${error.severity} error`;
      searchTermsUsed.push(categoryQuery);
      const categoryMatches = await this.searchKb(categoryQuery, 'category', options);
      allMatches.push(...categoryMatches);
    }

    // Deduplicate and rank matches
    const dedupedMatches = this.deduplicateMatches(allMatches);
    const rankedMatches = dedupedMatches
      .sort((a, b) => b.relevanceScore - a.relevanceScore)
      .slice(0, maxResults);

    return {
      error,
      matches: rankedMatches,
      bestMatch: rankedMatches[0],
      searchTermsUsed,
    };
  }

  private async searchKb(
    query: string,
    matchType: KbMatchType,
    options: KbSearchOptions
  ): Promise<KbArticleMatch[]> {
    // If we have an API endpoint, use it for real KB search
    if (this.apiBaseUrl) {
      try {
        const url = new URL('/api/kb/search', this.apiBaseUrl);
        url.searchParams.set('q', query);
        if (options.tenantId) {
          url.searchParams.set('tenantId', options.tenantId);
        }
        url.searchParams.set('limit', String(options.maxResults ?? 5));

        const response = await fetch(url.toString());
        if (response.ok) {
          const data = await response.json();
          return (data.results ?? []).map((r: Record<string, unknown>) => ({
            articleId: r.id as string,
            title: r.title as string,
            excerpt: (r.excerpt ?? r.content ?? '') as string,
            relevanceScore: (r.score ?? r.relevanceScore ?? 0.5) as number,
            matchType,
          }));
        }
      } catch {
        // Fallback silently if KB API is unavailable
      }
    }

    // Return empty if no API is configured
    return [];
  }

  private getCodeSearchTerms(error: PotentialError): string[] {
    const terms: string[] = [];

    if (error.code) {
      terms.push(error.code);
      terms.push(`código ${error.code}`);
      terms.push(`code ${error.code}`);

      // For SEFAZ rejeições, add specific terms
      if (error.source.includes('sefaz')) {
        terms.push(`rejeição ${error.code}`);
      }
    }

    return terms;
  }

  private buildSemanticQuery(error: PotentialError, software?: DetectedSoftware): string {
    const parts: string[] = [];

    if (software) {
      parts.push(software.name);
    }

    // Clean up the error text for semantic search
    const cleanText = error.text
      .replace(/[^a-zA-ZÀ-ÿ0-9\s]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
      .substring(0, 100);

    parts.push(cleanText);

    return parts.join(' ');
  }

  private deduplicateMatches(matches: KbArticleMatch[]): KbArticleMatch[] {
    const seen = new Map<string, KbArticleMatch>();

    for (const match of matches) {
      const existing = seen.get(match.articleId);
      if (!existing || match.relevanceScore > existing.relevanceScore) {
        seen.set(match.articleId, match);
      }
    }

    return Array.from(seen.values());
  }
}

export default KbMatcherService;
