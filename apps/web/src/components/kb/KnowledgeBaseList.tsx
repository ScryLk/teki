'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
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
import { Plus, Search, BookOpen } from 'lucide-react';
import { KbArticleCard } from './KbArticleCard';
import { KnowledgeBaseMetrics } from './KnowledgeBaseMetrics';
import { KnowledgeBasePreview } from './KnowledgeBasePreview';
import type { KbCategoryData, KbStats } from '@/lib/kb/types';
import type { KbArticleStatus } from '@prisma/client';

interface PaginatedResponse {
  data: ArticleItem[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

interface ArticleItem {
  id: string;
  articleNumber: string;
  title: string;
  category: KbCategoryData;
  tags: string[];
  softwareName: string | null;
  errorCodes: string[];
  status: KbArticleStatus;
  solutionType: string;
  usageCount: number;
  successRate: number;
  lastUsedAt: string | null;
  updatedAt: string;
}

export function KnowledgeBaseList() {
  const router = useRouter();
  const [articles, setArticles] = useState<ArticleItem[]>([]);
  const [categories, setCategories] = useState<KbCategoryData[]>([]);
  const [stats, setStats] = useState<KbStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');

  // Pagination
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Preview
  const [previewId, setPreviewId] = useState<string | null>(null);

  // Debounced search
  const [debouncedSearch, setDebouncedSearch] = useState('');
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  // Fetch categories
  useEffect(() => {
    fetch('/api/kb/categories')
      .then((res) => res.json())
      .then((data) => setCategories(data))
      .catch(console.error);
  }, []);

  // Fetch stats
  useEffect(() => {
    setStatsLoading(true);
    fetch('/api/kb/stats')
      .then((res) => res.json())
      .then((data) => setStats(data))
      .catch(console.error)
      .finally(() => setStatsLoading(false));
  }, []);

  // Fetch articles
  const fetchArticles = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), limit: '20' });
      if (debouncedSearch) params.set('q', debouncedSearch);
      if (filterCategory !== 'all') params.set('categoryId', filterCategory);
      if (filterStatus !== 'all') params.set('status', filterStatus);

      const res = await fetch(`/api/kb?${params}`);
      if (res.ok) {
        const data: PaginatedResponse = await res.json();
        setArticles(data.data);
        setTotalPages(data.pagination.totalPages);
      }
    } catch (error) {
      console.error('Error fetching articles:', error);
    } finally {
      setLoading(false);
    }
  }, [page, debouncedSearch, filterCategory, filterStatus]);

  useEffect(() => {
    fetchArticles();
  }, [fetchArticles]);

  const handleEdit = (id: string) => {
    router.push(`/settings/knowledge-base/${id}`);
  };

  const handleDuplicate = async (id: string) => {
    try {
      const res = await fetch(`/api/kb/${id}/duplicate`, { method: 'POST' });
      if (res.ok) {
        fetchArticles();
        // Refresh stats
        fetch('/api/kb/stats')
          .then((r) => r.json())
          .then(setStats)
          .catch(console.error);
      }
    } catch (error) {
      console.error('Error duplicating article:', error);
    }
  };

  const handleChangeStatus = async (id: string, status: KbArticleStatus) => {
    try {
      const res = await fetch(`/api/kb/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        fetchArticles();
        fetch('/api/kb/stats')
          .then((r) => r.json())
          .then(setStats)
          .catch(console.error);
      }
    } catch (error) {
      console.error('Error changing status:', error);
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Page Header */}
      <div className="px-4 lg:px-6 py-4 border-b flex-shrink-0">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-lg font-semibold">Base de Conhecimento</h1>
            <p className="text-sm text-muted-foreground">
              Gerencie os artigos de suporte para a IA
            </p>
          </div>
          <Link href="/settings/knowledge-base/new">
            <Button size="sm" className="gap-1.5 bg-white text-black hover:bg-white/90">
              <Plus size={14} />
              Novo Artigo
            </Button>
          </Link>
        </div>

        {/* Metrics */}
        <KnowledgeBaseMetrics stats={stats} loading={statsLoading} />

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-2 mt-4">
          <div className="relative flex-1">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar artigos..."
              className="pl-9 h-9 text-sm"
            />
          </div>
          <Select value={filterCategory} onValueChange={(v) => { setFilterCategory(v); setPage(1); }}>
            <SelectTrigger className="w-full sm:w-[180px] h-9 text-xs">
              <SelectValue placeholder="Categoria" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas categorias</SelectItem>
              {categories.filter((c) => c.active).map((cat) => (
                <SelectItem key={cat.id} value={cat.id}>
                  {cat.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={filterStatus} onValueChange={(v) => { setFilterStatus(v); setPage(1); }}>
            <SelectTrigger className="w-full sm:w-[150px] h-9 text-xs">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos status</SelectItem>
              <SelectItem value="DRAFT">Rascunho</SelectItem>
              <SelectItem value="REVIEW">Em revisao</SelectItem>
              <SelectItem value="PUBLISHED">Publicado</SelectItem>
              <SelectItem value="ARCHIVED">Arquivado</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Articles List */}
      <ScrollArea className="flex-1">
        <div className="p-4 lg:p-6">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <p className="text-sm text-muted-foreground">Carregando...</p>
            </div>
          ) : articles.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="h-14 w-14 rounded-xl bg-muted flex items-center justify-center mb-4">
                <BookOpen size={24} className="text-muted-foreground" />
              </div>
              <h3 className="text-sm font-medium mb-1">
                {debouncedSearch || filterCategory !== 'all' || filterStatus !== 'all'
                  ? 'Nenhum resultado encontrado'
                  : 'Nenhum artigo cadastrado'}
              </h3>
              <p className="text-xs text-muted-foreground mb-4">
                {debouncedSearch || filterCategory !== 'all' || filterStatus !== 'all'
                  ? 'Tente ajustar os filtros ou termos de busca.'
                  : 'Comece adicionando o primeiro artigo a base de conhecimento.'}
              </p>
              {!debouncedSearch && filterCategory === 'all' && filterStatus === 'all' && (
                <Link href="/settings/knowledge-base/new">
                  <Button size="sm" className="gap-1.5 bg-white text-black hover:bg-white/90">
                    <Plus size={14} />
                    Novo Artigo
                  </Button>
                </Link>
              )}
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
                {articles.map((article) => (
                  <KbArticleCard
                    key={article.id}
                    article={article}
                    onEdit={handleEdit}
                    onDuplicate={handleDuplicate}
                    onChangeStatus={handleChangeStatus}
                    onPreview={setPreviewId}
                  />
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-6">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                  >
                    Anterior
                  </Button>
                  <span className="text-sm text-muted-foreground">
                    Pagina {page} de {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                  >
                    Proxima
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </ScrollArea>

      {/* Preview Modal */}
      <KnowledgeBasePreview
        articleId={previewId}
        open={!!previewId}
        onOpenChange={(open) => {
          if (!open) setPreviewId(null);
        }}
      />
    </div>
  );
}
