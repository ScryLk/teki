'use client';

import { useState, useEffect, useCallback } from 'react';
import type { Agent, AgentFormData, KBDocument } from '@/types/agent';

export function useAgents() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAgents = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/agents');
      if (!res.ok) throw new Error('Falha ao carregar agentes');
      const data = await res.json();
      setAgents(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAgents();
  }, [fetchAgents]);

  const createAgent = async (data: AgentFormData): Promise<Agent> => {
    const res = await fetch('/api/agents', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Falha ao criar agente');
    }
    const agent = await res.json();
    await fetchAgents();
    return agent;
  };

  const deleteAgent = async (id: string) => {
    const res = await fetch(`/api/agents/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Falha ao excluir agente');
    await fetchAgents();
  };

  return { agents, loading, error, fetchAgents, createAgent, deleteAgent };
}

export function useAgent(id: string) {
  const [agent, setAgent] = useState<Agent | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAgent = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/agents/${id}`);
      if (!res.ok) throw new Error('Agente não encontrado');
      const data = await res.json();
      setAgent(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchAgent();
  }, [fetchAgent]);

  const updateAgent = async (data: Partial<AgentFormData>) => {
    const res = await fetch(`/api/agents/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Falha ao atualizar agente');
    }
    const updated = await res.json();
    setAgent(updated);
    return updated;
  };

  return { agent, loading, error, fetchAgent, updateAgent };
}

export function useKnowledgeBase(agentId: string) {
  const [documents, setDocuments] = useState<KBDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  const fetchDocuments = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/agents/${agentId}/kb`);
      if (!res.ok) throw new Error('Falha ao carregar documentos');
      const data = await res.json();
      setDocuments(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [agentId]);

  useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments]);

  const uploadDocument = async (file: File) => {
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await fetch(`/api/agents/${agentId}/kb`, {
        method: 'POST',
        body: formData,
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Falha ao enviar documento');
      }
      await fetchDocuments();
      return await res.json();
    } finally {
      setUploading(false);
    }
  };

  const deleteDocument = async (documentId: string) => {
    const res = await fetch(`/api/agents/${agentId}/kb?documentId=${documentId}`, {
      method: 'DELETE',
    });
    if (!res.ok) throw new Error('Falha ao excluir documento');
    await fetchDocuments();
  };

  return { documents, loading, uploading, fetchDocuments, uploadDocument, deleteDocument };
}
