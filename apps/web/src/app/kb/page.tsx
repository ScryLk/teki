'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Plus, Search, BookOpen, TrendingUp } from 'lucide-react';

interface KbArticle {
  id: string;
  articleNumber: string;
  title: string;
  category: string;
  subcategory: string | null;
  solutionType: string | null;
  tags: string[];
  usageCount: number;
  successRate: number;
  status: string;
  updatedAt: string;
}

const statusColors: Record<string, string> = {
  draft: 'bg-gray-500/10 text-gray-400 border-gray-500/20',
  published: 'bg-green-500/10 text-green-400 border-green-500/20',
  archived: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
  deprecated: 'bg-red-500/10 text-red-400 border-red-500/20',
};

export default function KbPage() {
  const [articles, setArticles] = useState<KbArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');

  const fetchArticles = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (statusFilter !== 'all') params.set('status', statusFilter);
    if (searchQuery) params.set('search', searchQuery);

    const res = await fetch(`/api/kb?${params.toString()}`);
    if (res.ok) {
      const data = await res.json();
      setArticles(data.data);
    }
    setLoading(false);
  }, [statusFilter, searchQuery]);

  useEffect(() => {
    const timer = setTimeout(fetchArticles, 300);
    return () => clearTimeout(timer);
  }, [fetchArticles]);

  const categories = [...new Set(articles.map(a => a.category))];

  const filtered = categoryFilter === 'all'
    ? articles
    : articles.filter(a => a.category === categoryFilter);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <BookOpen className="w-6 h-6" />
          Base de Conhecimento
        </h1>
        <Link href="/kb/new">
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Novo Artigo
          </Button>
        </Link>
      </div>

      <div className="flex gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Buscar artigos..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="draft">Rascunho</SelectItem>
            <SelectItem value="published">Publicado</SelectItem>
            <SelectItem value="archived">Arquivado</SelectItem>
          </SelectContent>
        </Select>
        {categories.length > 0 && (
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Categoria" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas</SelectItem>
              {categories.map((c) => (
                <SelectItem key={c} value={c}>{c}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>

      {loading ? (
        <div className="text-center py-12 text-muted-foreground">Carregando artigos...</div>
      ) : filtered.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            Nenhum artigo encontrado.
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map((article) => (
            <Link key={article.id} href={`/kb/${article.id}/edit`}>
              <Card className="hover:bg-accent/50 transition-colors cursor-pointer h-full">
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-mono text-muted-foreground">
                          {article.articleNumber}
                        </span>
                        <Badge variant="outline" className={statusColors[article.status]}>
                          {article.status}
                        </Badge>
                      </div>
                      <CardTitle className="text-sm line-clamp-2">{article.title}</CardTitle>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="flex items-center gap-3 text-xs text-muted-foreground mb-2">
                    <span>{article.category}</span>
                    {article.solutionType && (
                      <>
                        <span>|</span>
                        <span>{article.solutionType}</span>
                      </>
                    )}
                  </div>
                  <div className="flex items-center gap-4 text-xs">
                    <span className="flex items-center gap-1">
                      <TrendingUp className="w-3 h-3" />
                      {article.usageCount} usos
                    </span>
                    <span className={article.successRate > 70 ? 'text-green-400' : 'text-muted-foreground'}>
                      {article.successRate.toFixed(0)}% sucesso
                    </span>
                  </div>
                  {article.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {article.tags.slice(0, 4).map((tag) => (
                        <Badge key={tag} variant="secondary" className="text-xs py-0">
                          {tag}
                        </Badge>
                      ))}
                      {article.tags.length > 4 && (
                        <span className="text-xs text-muted-foreground">+{article.tags.length - 4}</span>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
