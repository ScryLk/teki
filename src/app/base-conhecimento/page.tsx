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
import { Plus, Search, BookOpen } from 'lucide-react';
import { SolutionCard } from '@/components/base-conhecimento/SolutionCard';
import { DeleteSolutionDialog } from '@/components/base-conhecimento/DeleteSolutionDialog';
import { CATEGORIES } from '@/lib/types';
import type { SolutionRecord } from '@/lib/types';

export default function BaseConhecimentoPage() {
  const [solutions, setSolutions] = useState<SolutionRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState('todas');
  const [filterCriticality, setFilterCriticality] = useState('todas');

  const [deleteTarget, setDeleteTarget] = useState<SolutionRecord | null>(null);

  const fetchSolutions = useCallback(async () => {
    try {
      const res = await fetch('/api/solucoes');
      if (res.ok) {
        const data = await res.json();
        setSolutions(data);
      }
    } catch (error) {
      console.error('Error fetching solutions:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSolutions();
  }, [fetchSolutions]);

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

  const filtered = solutions.filter((s) => {
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

  return (
    <div className="flex flex-col h-full">
      {/* Page Header */}
      <div className="px-4 lg:px-6 py-4 border-b flex-shrink-0">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-lg font-semibold">Base de Conhecimento</h1>
            <p className="text-sm text-muted-foreground">
              {solutions.length} {solutions.length === 1 ? 'solucao cadastrada' : 'solucoes cadastradas'}
            </p>
          </div>
          <Link href="/base-conhecimento/nova">
            <Button size="sm" className="gap-1.5 bg-white text-black hover:bg-white/90">
              <Plus size={14} />
              Nova Solucao
            </Button>
          </Link>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="relative flex-1">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar solucoes..."
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
          <Select value={filterCriticality} onValueChange={setFilterCriticality}>
            <SelectTrigger className="w-full sm:w-[140px] h-9 text-xs">
              <SelectValue placeholder="Criticidade" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todas">Todas</SelectItem>
              <SelectItem value="baixa">Baixa</SelectItem>
              <SelectItem value="media">Media</SelectItem>
              <SelectItem value="alta">Alta</SelectItem>
              <SelectItem value="critica">Critica</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Solutions List */}
      <ScrollArea className="flex-1">
        <div className="p-4 lg:p-6">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <p className="text-sm text-muted-foreground">Carregando...</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="h-14 w-14 rounded-xl bg-muted flex items-center justify-center mb-4">
                <BookOpen size={24} className="text-muted-foreground" />
              </div>
              <h3 className="text-sm font-medium mb-1">
                {solutions.length === 0
                  ? 'Nenhuma solucao cadastrada'
                  : 'Nenhum resultado encontrado'}
              </h3>
              <p className="text-xs text-muted-foreground mb-4">
                {solutions.length === 0
                  ? 'Comece adicionando a primeira solucao a base de conhecimento.'
                  : 'Tente ajustar os filtros ou termos de busca.'}
              </p>
              {solutions.length === 0 && (
                <Link href="/base-conhecimento/nova">
                  <Button size="sm" className="gap-1.5 bg-white text-black hover:bg-white/90">
                    <Plus size={14} />
                    Nova Solucao
                  </Button>
                </Link>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
              {filtered.map((solution) => (
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
          )}
        </div>
      </ScrollArea>

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
    </div>
  );
}
