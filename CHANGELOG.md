# Changelog

Todas as mudanças notáveis do projeto Teki serão documentadas neste arquivo.

O formato é baseado em [Keep a Changelog](https://keepachangelog.com/pt-BR/1.1.0/), e o projeto segue [Semantic Versioning](https://semver.org/lang/pt-BR/).

## [Unreleased]

### Adicionado

- README e documentação completa do projeto (11 documentos)
- Especificação dos 19 módulos do sistema

### Especificado (aguardando implementação)

- Módulo 0: DevTools e Dev Mode
- Módulo 0.5: Schema de Usuários (LGPD)
- Módulo 1: Base de Conhecimento + IA
- Módulo 2: Interface de Gestão da KB
- Módulo 3: Multi-Provider de IA
- Módulo 4: Logs e Auditoria
- Módulo 5: Rastreamento de Atividade
- Módulo 6: Formulário de Inserção KB
- Módulo 7: Floating Assistant
- Módulo 10: Segurança e Criptografia
- Módulo 11: Interface de Autenticação
- Módulo 12: Schema de Conversas
- Módulo 13: Schemas Complementares
- Módulo 14: Integrações Externas
- Módulo 15: Interface de Configurações
- Módulo 16: Screen Inspection Engine
- Módulo 17: Painel Super Admin
- Módulo 18: Query Expansion Fallback
- Módulo 19: Confidence Scoring + Settings UI

### Implementado

- DevTools com painel flutuante/drawer/tab e 7 abas
- Schema de Usuários com compliance LGPD (consentimento granular, anonimização)
- Multi-Provider de IA (Claude, Gemini, GPT, DeepSeek, Groq, Ollama)
- Pipeline de Query Expansion com 4 layers progressivos
- Term maps multilíngues (7 idiomas) para Layer 2
- Confidence Score com 8 sinais ponderados e 3 presets
- Settings UI para configuração de IA e confiança
- Painel Super Admin com 12 páginas
- Analytics de Query Expansion e Confidence no Admin
