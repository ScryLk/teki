# 🚀 Funcionalidades do Teki

> Catálogo completo de funcionalidades organizadas por módulo. Cada módulo foi especificado em detalhes nos prompts de implementação.

**Legenda de status:** ✅ Pronto · 🚧 Em desenvolvimento · 📋 Especificado

---

## 🛠️ Módulo 0 — DevTools e Dev Mode

**Status:** ✅ Pronto

Kit de desenvolvimento interno com painel de debug integrado. Permite simular planos, roles, latência e estados do sistema sem afetar dados reais.

**Exemplo de uso:** Desenvolvedor testa como a interface se comporta no plano Free, sem criar um tenant separado. Ativa "Mock AI" para trabalhar offline.

- Painel flutuante/drawer/tab com 7 abas (Controls, Data, Inspector, Events, Info, KB Search, Confidence)
- Overrides de plano, role, estado do gato mascote
- Mock de latência e modo offline
- Log de chamadas de IA e eventos em tempo real

---

## 👤 Módulo 0.5 — Schema de Usuários (LGPD)

**Status:** ✅ Pronto

Modelo de dados de usuários desenhado para compliance com LGPD/GDPR desde o dia zero. Consentimento granular, anonimização real e portabilidade de dados.

**Exemplo de uso:** Usuário solicita exclusão de dados. O sistema anonimiza todos os campos pessoais, mantendo dados estatísticos para analytics sem identificação.

- Multi-tenant com roles (owner, admin, agent, viewer)
- Consentimento granular por finalidade (analytics, marketing, ai_training)
- Data Access Log — registro de quem acessou quais dados
- Anonimização real (substitui dados por hashes, sem soft-delete fake)
- Exportação de dados em JSON para portabilidade

---

## 📚 Módulo 1 — Base de Conhecimento + IA

**Status:** ✅ Pronto

Motor de busca inteligente que combina embeddings vetoriais com PostgreSQL. Artigos são processados em chunks, cada chunk ganha um embedding para busca semântica.

**Exemplo de uso:** Técnico digita "impressora não conecta na rede". O sistema encontra artigos sobre "configuração de impressora wireless", "troubleshooting de rede TCP/IP" e "driver de impressora HP" — mesmo sem match exato de palavras.

- Upload de documentos (PDF, DOC, TXT) com chunking automático
- Embeddings via Gemini text-embedding-004
- Busca vetorial por similaridade (pgvector cosine distance)
- Formatação de contexto para injeção no prompt da IA

---

## 📝 Módulo 2 — Interface de Gestão da KB

**Status:** 📋 Especificado

Interface CRUD completa para gestão da base de conhecimento. Lista, cria, edita e arquiva artigos com editor rich text.

**Exemplo de uso:** Gestor acessa `/base-conhecimento`, vê artigos ordenados por relevância, filtra por categoria e publica um novo procedimento sobre atualização de certificados digitais.

- Lista com busca, filtros e ordenação
- Editor rich text com preview
- Controle de status (rascunho, publicado, arquivado)
- Tags e categorização
- Histórico de edições

---

## 🤖 Módulo 3 — Multi-Provider de IA

**Status:** ✅ Pronto

Router inteligente que distribui chamadas entre múltiplos providers de IA com fallback automático. Se o Claude falha, redireciona para Gemini. Se Gemini está lento, vai para GPT.

**Exemplo de uso:** Provider Gemini retorna erro 429 (rate limit). Em menos de 100ms, o sistema redireciona automaticamente para Claude e o técnico nem percebe a mudança.

- 6 providers: Anthropic Claude, Google Gemini, OpenAI GPT, DeepSeek, Groq, Ollama
- Estratégias de roteamento: prioridade, custo, latência
- Fallback automático com retry em providers alternativos
- Budget mensal por tenant com alertas e hard stop
- API keys do tenant (BYOK) com criptografia AES-256-GCM

---

## 📋 Módulo 4 — Logs e Auditoria

**Status:** ✅ Pronto

Sistema de logging estruturado para todas as operações da plataforma. Cada ação gera um registro imutável com contexto completo.

**Exemplo de uso:** Admin investiga por que um agente parou de funcionar. Consulta logs filtrados por tenant + período e encontra que a API key do provider expirou.

- Logs estruturados com nível (debug, info, warn, error)
- Filtros por tenant, usuário, período, nível
- Audit trail de ações administrativas
- Retenção configurável por plano

---

## 📊 Módulo 5 — Rastreamento de Atividade

**Status:** 📋 Especificado

Tracking de atividade dos usuários para analytics e compliance. Registra sessões, ações e métricas de uso sem dados pessoais identificáveis.

**Exemplo de uso:** Gestor quer saber quantas conversas o time fez na última semana e qual a taxa de resolução. O dashboard mostra métricas agregadas por período.

- Tracking de sessões e ações
- Métricas de uso por tenant, usuário e agente
- Dashboard de atividade
- Exportação para analytics externo

---

## 📎 Módulo 6 — Formulário de Inserção KB

**Status:** 📋 Especificado

Formulário inteligente para técnicos adicionarem conhecimento à base diretamente do fluxo de trabalho. "Acabou de resolver? Documente em 2 minutos."

**Exemplo de uso:** Técnico resolve problema de certificado expirado. Clica em "Adicionar à KB", preenche título e solução, o sistema gera tags automaticamente e publica como rascunho para revisão.

- Formulário com auto-preenchimento a partir do contexto da conversa
- Geração automática de tags e categoria via IA
- Preview em tempo real
- Fluxo de aprovação (rascunho → revisão → publicado)

---

## 💬 Módulo 7 — Floating Assistant

**Status:** 📋 Especificado

Assistente flutuante que funciona como overlay em qualquer aplicação. Analisa o contexto da tela e sugere soluções proativamente.

**Exemplo de uso:** Técnico está no sistema do cliente e um erro aparece. O floating assistant detecta o erro via OCR, busca na KB e exibe uma sugestão de solução como tooltip — tudo sem o técnico precisar trocar de janela.

- Overlay sempre visível (widget flutuante)
- Integração com Screen Inspection
- Sugestões proativas baseadas no contexto da tela
- Atalhos de teclado para interação rápida

---

## 🔐 Módulo 10 — Segurança e Criptografia

**Status:** ✅ Pronto

3 camadas de criptografia + autenticação multi-método + LGPD compliance. Para detalhes completos, veja [SECURITY.md](SECURITY.md).

- TLS 1.3 em trânsito
- ECDH X25519 + AES-256-GCM end-to-end
- AES-256-GCM para dados em repouso
- Auth com argon2id, OAuth, SSO (Enterprise), MFA/TOTP
- Rate limiting e proteção contra abuso

---

## 🔑 Módulo 11 — Interface de Autenticação

**Status:** ✅ Pronto

Telas de login, registro, recuperação de senha e MFA. Design minimalista com tema dark.

- Login com email/senha ou OAuth (Google, GitHub)
- Registro com verificação de email
- Recuperação de senha segura (token expirado em 1h)
- Setup de MFA/TOTP com QR code

---

## 💬 Módulo 12 — Schema de Conversas

**Status:** ✅ Pronto

Modelo de dados para conversas multi-tipo (chat, screen_inspection, floating_assistant) com metadados de IA por mensagem.

- Conversas com tipo, status e contexto
- Mensagens com metadata de IA (tokens, latência, provider, custo)
- Feedback por mensagem (rating + comentário)
- Pinning de mensagens importantes

---

## 🧩 Módulo 13 — Schemas Complementares

**Status:** ✅ Pronto

Modelos auxiliares: planos, feature flags, notificações, templates de prompt, API keys, onboarding.

- Definição de planos com limites detalhados
- Feature flags com targeting por tenant/plano
- Templates de prompt por agente e tipo de conversa

---

## 🔌 Módulo 14 — Integrações Externas

**Status:** ✅ Pronto

Connector pattern para GLPI, Zendesk, Freshdesk e OTRS. Para detalhes, veja [INTEGRATIONS.md](INTEGRATIONS.md).

- Setup em 3 passos (credenciais → teste → mapeamento)
- 3 modos de sync: read_only, bidirectional, write_back_notes
- Field mapping e user mapping configuráveis
- Sync automático com webhook e polling

---

## ⚙️ Módulo 15 — Interface de Configurações

**Status:** ✅ Pronto

Página de configurações com seções para IA & Modelos, incluindo busca inteligente e cálculo de confiança.

- Sidebar com 8 seções (IA & Modelos habilitada, demais em breve)
- Configuração de Query Expansion (idiomas, profundidade, threshold)
- Configuração de Confidence Score (presets, pesos dos 8 sinais)
- Auto-save via API PATCH

---

## 🖥️ Módulo 16 — Screen Inspection Engine

**Status:** 📋 Especificado

Motor de captura e análise de tela para detecção automática de erros. Para detalhes, veja [SCREEN-INSPECTION.md](SCREEN-INSPECTION.md).

- Captura periódica com diff check (93% skip rate)
- OCR via Tesseract.js (local, sem nuvem)
- 30+ patterns de erro built-in
- 15+ assinaturas de softwares reconhecidos

---

## 🛡️ Módulo 17 — Painel Super Admin

**Status:** ✅ Pronto

Painel administrativo completo com 12 páginas para gestão cross-tenant da plataforma.

- Dashboard com KPIs em tempo real
- Monitoramento SSE com alertas
- Gestão de usuários e tenants
- Analytics de uso e custos de IA
- Feature flags, broadcast, audit log
- Analytics de Query Expansion e Confidence Score

---

## 🔄 Módulo 18 — Query Expansion Fallback

**Status:** ✅ Pronto

Pipeline de busca progressiva com 4 layers. Para detalhes, veja [AI-SYSTEM.md](AI-SYSTEM.md).

- Layer 0: Busca primária (custo zero)
- Layer 1: Expansão semântica em PT
- Layer 2: Tradução multilíngue (7 idiomas com term maps)
- Layer 3: Decomposição em sub-problemas
- Budget control (800 tokens, 5s timeout)

---

## 🎯 Módulo 19 — Confidence Scoring + Settings

**Status:** ✅ Pronto

Score de confiança pós-resposta com 8 sinais ponderados e UI de configuração. Para detalhes, veja [AI-SYSTEM.md](AI-SYSTEM.md).

- 8 sinais: KB relevance, source coverage, specificity, context match e mais
- 3 presets de peso (default, kb_heavy, ai_heavy)
- Classificação: BASE LOCAL / INFERIDO / GENÉRICO
- Settings UI para admins do tenant
- DevTools tabs para debug

---

📚 **Próximos:** [Arquitetura](ARCHITECTURE.md) · [Sistema de IA](AI-SYSTEM.md) · [Screen Inspection](SCREEN-INSPECTION.md)
