'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Search, BookOpen } from 'lucide-react';
import { SolutionCard } from '@/components/base-conhecimento/SolutionCard';
import { DeleteSolutionDialog } from '@/components/base-conhecimento/DeleteSolutionDialog';
import { KbInsertionDropdown } from '@/components/base-conhecimento/KbInsertionDropdown';
import { KbQuickAddModal } from '@/components/base-conhecimento/KbQuickAddModal';
import { KbFileUploadModal } from '@/components/base-conhecimento/KbFileUploadModal';
import { KbReviewScreen } from '@/components/base-conhecimento/KbReviewScreen';
import { KbUsageBar } from '@/components/base-conhecimento/KbUsageBar';
import { KbUpgradeModal } from '@/components/base-conhecimento/KbUpgradeModal';
import { useKbUsage } from '@/hooks/use-kb-usage';
import { CATEGORIES } from '@/lib/types';
import type { SolutionRecord } from '@/lib/types';
import type { InsertionMode } from '@/lib/kb/types';
import type { KbArticleSummary } from '@/lib/kb/types';

export default function BaseConhecimentoPage() {
  // Legacy solutions
  const [solutions, setSolutions] = useState<SolutionRecord[]>([]);

  // KB Articles (new system)
  const [articles, setArticles] = useState<KbArticleSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState('todas');
  const [filterStatus, setFilterStatus] = useState('todos');
  const [filterCriticality, setFilterCriticality] = useState('todas');

  const [deleteTarget, setDeleteTarget] = useState<SolutionRecord | null>(null);

  // KB Usage & Modals
  const { data: usageData, refetch: refetchUsage } = useKbUsage();
  const [quickAddOpen, setQuickAddOpen] = useState(false);
  const [fileUploadOpen, setFileUploadOpen] = useState(false);
  const [reviewOpen, setReviewOpen] = useState(false);
  const [upgradeOpen, setUpgradeOpen] = useState(false);
  const [upgradeRequiredPlan, setUpgradeRequiredPlan] = useState('PRO');
  const [upgradeFeature, setUpgradeFeature] = useState<string | undefined>();

  // Review screen data
  const [reviewData, setReviewData] = useState<{
    suggestion: Record<string, unknown>;
    ai: Record<string, unknown>;
    categories: Array<{ id: string; name: string; slug: string }>;
    insertionMode: InsertionMode;
  } | null>(null);

  // Fetch legacy solutions
  const fetchSolutions = useCallback(async () => {
    try {
      const res = await fetch('/api/solucoes');
      if (res.ok) {
        const data = await res.json();
        setSolutions(data);
      }
    } catch (error) {
      console.error('Error fetching solutions:', error);
    }
  }, []);

  // Fetch KB articles
  const fetchArticles = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (search) params.set('search', search);
      if (filterStatus !== 'todos') params.set('status', filterStatus);
      const res = await fetch(`/api/kb/articles?${params}`);
      if (res.ok) {
        const data = await res.json();
        setArticles(data.articles ?? []);
      }
    } catch (error) {
      console.error('Error fetching articles:', error);
    } finally {
      setLoading(false);
    }
  }, [search, filterStatus]);

  useEffect(() => {
    fetchSolutions();
    fetchArticles();
  }, [fetchSolutions, fetchArticles]);

  // Poll for processing solutions
  useEffect(() => {
    const hasProcessing = solutions.some(
      (s) => s.status === 'uploading' || s.status === 'extracting' || s.status === 'indexing'
    );
    if (!hasProcessing) return;
    const interval = setInterval(fetchSolutions, 3000);
    return () => clearInterval(interval);
  }, [solutions, fetchSolutions]);

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/solucoes/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setSolutions((prev) => prev.filter((s) => s.id !== id));
      }
    } catch (error) {
      console.error('Error deleting solution:', error);
    }
  };

  const handleDeleteArticle = async (id: string) => {
    try {
      const res = await fetch(`/api/kb/articles/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setArticles((prev) => prev.filter((a) => a.id !== id));
        refetchUsage();
      }
    } catch (error) {
      console.error('Error deleting article:', error);
    }
  };

  const handleSelectMode = (mode: InsertionMode) => {
    switch (mode) {
      case 'quick_add':
        setQuickAddOpen(true);
        break;
      case 'file_upload':
        setFileUploadOpen(true);
        break;
      case 'full_form':
        window.location.href = '/base-conhecimento/nova?mode=full_form';
        break;
      case 'from_chat':
        // Would be triggered from within chat
        break;
    }
  };

  const handleUpgradeClick = (requiredPlan: string) => {
    setUpgradeRequiredPlan(requiredPlan);
    const featureMap: Record<string, string> = {
      PRO: 'Upload de Arquivo',
      Pro: 'Upload de Arquivo',
      STARTER: 'Salvar do Chat',
      Starter: 'Salvar do Chat',
    };
    setUpgradeFeature(featureMap[requiredPlan]);
    setUpgradeOpen(true);
  };

  const handleAnalyzed = (
    data: {
      suggestion: Record<string, unknown>;
      ai: Record<string, unknown>;
      categories: Array<Record<string, unknown>>;
    },
    mode: InsertionMode
  ) => {
    setReviewData({
      suggestion: data.suggestion,
      ai: data.ai,
      categories: data.categories as Array<{ id: string; name: string; slug: string }>,
      insertionMode: mode,
    });
    setReviewOpen(true);
  };

  const handleArticleSaved = () => {
    fetchArticles();
    refetchUsage();
  };

  const filteredSolutions = solutions.filter((s) => {
    if (search) {
      const q = search.toLowerCase();
      const match =
        s.titulo.toLowerCase().includes(q) ||
        s.descricao.toLowerCase().includes(q) ||
        s.tags.some((t) => t.includes(q));
      if (!match) return false;
    }
    if (filterCategory !== 'todas' && s.categoria !== filterCategory) return false;
    if (filterCriticality !== 'todas' && s.criticidade !== filterCriticality) return false;
    return true;
  });

  const totalCount = articles.length + solutions.length;

  return (
    <div className="flex flex-col h-full">
      {/* Page Header */}
      <div className="px-4 lg:px-6 py-4 border-b flex-shrink-0">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-lg font-semibold">Base de Conhecimento</h1>
            <p className="text-sm text-muted-foreground">
              {usageData
                ? `${usageData.usage.articles.used}/${usageData.usage.articles.limit} artigos · ${usageData.usage.storage.usedFormatted}/${usageData.usage.storage.limitFormatted}`
                : `${totalCount} ${totalCount === 1 ? 'item cadastrado' : 'itens cadastrados'}`}
            </p>
          </div>
          {usageData ? (
            <KbInsertionDropdown
              allowedModes={usageData.limits.allowedInsertionModes}
              modeBadges={usageData.modeBadges}
              canCreate={articles.length < usageData.usage.articles.limit}
              articleCount={usageData.usage.articles.used}
              articleLimit={usageData.usage.articles.limit}
              onSelectMode={handleSelectMode}
              onUpgradeClick={handleUpgradeClick}
            />
          ) : (
            <Link href="/base-conhecimento/nova">
              <Button size="sm" className="gap-1.5 bg-white text-black hover:bg-white/90">
                <Plus size={14} />
                Nova Solucao
              </Button>
            </Link>
          )}
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="relative flex-1">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar artigos..."
              className="pl-9 h-9 text-sm"
            />
          </div>
          <Select value={filterCategory} onValueChange={setFilterCategory}>
            <SelectTrigger className="w-full sm:w-[160px] h-9 text-xs">
              <SelectValue placeholder="Categoria" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todas">Todas categorias</SelectItem>
              {CATEGORIES.map((cat) => (
                <SelectItem key={cat} value={cat}>
                  {cat}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Tabs value={filterStatus} onValueChange={setFilterStatus}>
            <TabsList className="h-9">
              <TabsTrigger value="todos" className="text-xs px-3">Todos</TabsTrigger>
              <TabsTrigger value="published" className="text-xs px-3">Publicados</TabsTrigger>
              <TabsTrigger value="draft" className="text-xs px-3">Rascunhos</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Main content */}
        <ScrollArea className="flex-1">
          <div className="p-4 lg:p-6">
            {/* KB Articles */}
            {articles.length > 0 && (
              <div className="mb-6">
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
                  {articles.map((article) => (
                    <div
                      key={article.id}
                      className="rounded-lg border p-4 hover:bg-accent/30 transition-colors group"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <h3 className="text-sm font-medium truncate">{article.title}</h3>
                          <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                            {article.summary ?? ''}
                          </p>
                        </div>
                        <button
                          className="text-xs text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => handleDeleteArticle(article.id)}
                        >
                          Excluir
                        </button>
                      </div>
                      <div className="flex flex-wrap items-center gap-1.5 mt-3">
                        {article.categoryName && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded border bg-accent/50">
                            {article.categoryName}
                          </span>
                        )}
                        <span
                          className={`text-[10px] px-1.5 py-0.5 rounded ${
                            article.status === 'published'
                              ? 'bg-emerald-500/20 text-emerald-400'
                              : 'bg-amber-500/20 text-amber-400'
                          }`}
                        >
                          {article.status === 'published' ? 'Publicado' : 'Rascunho'}
                        </span>
                        {article.tags.slice(0, 3).map((tag) => (
                          <span
                            key={tag}
                            className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                      <div className="flex items-center justify-between mt-2 text-[10px] text-muted-foreground">
                        <span>{article.difficulty}</span>
                        <span>{new Date(article.createdAt).toLocaleDateString('pt-BR')}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Legacy Solutions */}
            {loading ? (
              <div className="flex items-center justify-center py-16">
                <p className="text-sm text-muted-foreground">Carregando...</p>
              </div>
            ) : filteredSolutions.length === 0 && articles.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="h-14 w-14 rounded-xl bg-muted flex items-center justify-center mb-4">
                  <BookOpen size={24} className="text-muted-foreground" />
                </div>
                <h3 className="text-sm font-medium mb-1">
                  Nenhum artigo cadastrado
                </h3>
                <p className="text-xs text-muted-foreground mb-4">
                  Comece adicionando o primeiro artigo à base de conhecimento.
                </p>
              </div>
            ) : filteredSolutions.length > 0 ? (
              <>
                {articles.length > 0 && (
                  <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">
                    Soluções (legado)
                  </h3>
                )}
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
                  {filteredSolutions.map((solution) => (
                    <SolutionCard
                      key={solution.id}
                      solution={solution}
                      onDelete={(id) => {
                        const s = solutions.find((sol) => sol.id === id);
                        if (s) setDeleteTarget(s);
                      }}
                    />
                  ))}
                </div>
              </>
            ) : null}
          </div>
        </ScrollArea>

        {/* Sidebar - Usage */}
        {usageData && (
          <div className="hidden lg:block w-[260px] border-l p-4 flex-shrink-0">
            <KbUsageBar
              plan={usageData.plan}
              usage={usageData.usage}
              onUpgradeClick={() => handleUpgradeClick(usageData.plan === 'free' ? 'STARTER' : 'PRO')}
            />
          </div>
        )}
      </div>

      {/* Modals */}
      <DeleteSolutionDialog
        open={!!deleteTarget}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null);
        }}
        onConfirm={() => {
          if (deleteTarget) handleDelete(deleteTarget.id);
        }}
        solutionTitle={deleteTarget?.titulo}
      />

      <KbQuickAddModal
        open={quickAddOpen}
        onOpenChange={setQuickAddOpen}
        onAnalyzed={(data) => handleAnalyzed(data, 'quick_add')}
      />

      {usageData && (
        <KbFileUploadModal
          open={fileUploadOpen}
          onOpenChange={setFileUploadOpen}
          maxFileSize={usageData.limits.maxFileSizeBytes}
          allowedFileTypes={usageData.limits.allowedFileTypes}
          storageUsed={usageData.usage.storage.usedFormatted}
          storageLimit={usageData.usage.storage.limitFormatted}
          storagePercentage={usageData.usage.storage.percentage}
          onAnalyzed={(data) => handleAnalyzed(data, 'file_upload')}
        />
      )}

      {reviewData && (
        <KbReviewScreen
          open={reviewOpen}
          onOpenChange={setReviewOpen}
          suggestion={reviewData.suggestion}
          insertionMode={reviewData.insertionMode}
          aiInfo={reviewData.ai as { model?: string; latencyMs?: number; tokensUsed?: number }}
          categories={reviewData.categories}
          onSaved={handleArticleSaved}
        />
      )}

      <KbUpgradeModal
        open={upgradeOpen}
        onOpenChange={setUpgradeOpen}
        requiredPlan={upgradeRequiredPlan}
        currentPlan={usageData?.plan ?? 'free'}
        feature={upgradeFeature}
      />
    </div>
  );
}
