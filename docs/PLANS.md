# 📐 Planos

> Comparação detalhada dos 4 planos do Teki. Todos incluem o core da plataforma — a diferença está nos limites e funcionalidades avançadas.

## Visão Geral

| | Free | Starter | Pro | Enterprise |
|---|:---:|:---:|:---:|:---:|
| **Preço** | R$ 0 | R$ 49,90/mês | R$ 149,90/mês | Sob consulta |
| **Para quem** | Experimentar | Equipes pequenas | Equipes médias | Grandes operações |

## Comparação Completa

### Equipe e Acesso

| Recurso | Free | Starter | Pro | Enterprise |
|---------|:----:|:-------:|:---:|:----------:|
| Membros | 3 | 5 | 10 | Ilimitado |
| Agentes de IA | 1 | 2 | 5 | Ilimitado |
| Roles disponíveis | owner, agent | Todos | Todos | Todos + custom |
| SSO/SAML | — | — | — | ✅ |
| MFA/TOTP | Opcional | Opcional | Opcional | Obrigatório (admin) |

### Conversas e IA

| Recurso | Free | Starter | Pro | Enterprise |
|---------|:----:|:-------:|:---:|:----------:|
| Conversas/mês | 50 | 200 | 500 | Ilimitado |
| Providers de IA | 1 | 2 | Todos (6) | Todos + custom |
| BYOK (API keys próprias) | — | ✅ | ✅ | ✅ |
| Budget mensal por tenant | — | — | ✅ | ✅ + alertas |
| Confidence Score | Básico | Completo | Completo + presets | Completo + custom |
| Query Expansion | Layer 0-1 | Layer 0-2 | Layer 0-3 | Layer 0-3 + custom |

### Base de Conhecimento

| Recurso | Free | Starter | Pro | Enterprise |
|---------|:----:|:-------:|:---:|:----------:|
| Artigos KB | 20 | 100 | 200 | Ilimitado |
| Upload de documentos | 5MB total | 25MB total | 100MB total | Ilimitado |
| Embeddings | ✅ | ✅ | ✅ | ✅ |
| Templates de prompt | 1 | 5 | 20 | Ilimitado |
| Idiomas de fallback | 1 (EN) | 3 | Todos (7) | Todos + custom |

### Funcionalidades Avançadas

| Recurso | Free | Starter | Pro | Enterprise |
|---------|:----:|:-------:|:---:|:----------:|
| Screen Inspection | — | — | ✅ | ✅ |
| Floating Assistant | — | — | ✅ | ✅ |
| Integrações (GLPI, etc.) | — | 1 (read_only) | 3 (todos os modos) | Ilimitado |
| Feature flags | — | — | ✅ | ✅ |
| Analytics detalhado | Básico | Completo | Completo | Completo + export |
| Audit log | 7 dias | 30 dias | 90 dias | Ilimitado |

### Segurança

| Recurso | Free | Starter | Pro | Enterprise |
|---------|:----:|:-------:|:---:|:----------:|
| TLS 1.3 | ✅ | ✅ | ✅ | ✅ |
| Criptografia E2E | — | ✅ | ✅ | ✅ |
| Criptografia em repouso | — | ✅ | ✅ | ✅ |
| LGPD compliance | ✅ | ✅ | ✅ | ✅ + DPA |
| IP allowlist | — | — | — | ✅ |

### Suporte

| Recurso | Free | Starter | Pro | Enterprise |
|---------|:----:|:-------:|:---:|:----------:|
| Comunidade (GitHub) | ✅ | ✅ | ✅ | ✅ |
| Email | — | ✅ | ✅ | ✅ |
| Prioritário | — | — | ✅ | ✅ |
| Dedicado + SLA | — | — | — | ✅ |
| Onboarding guiado | — | — | — | ✅ |

## Detalhes por Plano

### Free — R$ 0/mês

Para experimentar o Teki sem compromisso. Ideal para freelancers e técnicos individuais.

- 3 membros, 1 agente de IA, 50 conversas/mês
- 20 artigos na KB com 5MB de armazenamento
- 1 provider de IA (escolha entre os disponíveis)
- Busca inteligente com layers 0-1
- Suporte via comunidade GitHub

### Starter — R$ 49,90/mês

Para equipes pequenas que querem produtividade com IA. Primeiro upgrade depois do Free.

- 5 membros, 2 agentes de IA, 200 conversas/mês
- 100 artigos KB com 25MB
- 2 providers de IA com BYOK
- Busca inteligente com layers 0-2 e 3 idiomas
- 1 integração (read-only)
- Criptografia E2E e em repouso
- Suporte por email

### Pro — R$ 149,90/mês

Para equipes que dependem do suporte técnico no dia a dia. Funcionalidades completas.

- 10 membros, 5 agentes de IA, 500 conversas/mês
- 200 artigos KB com 100MB
- Todos os 6 providers de IA
- Busca inteligente completa (layers 0-3, 7 idiomas)
- Screen Inspection + Floating Assistant
- 3 integrações (todos os modos)
- Confidence Score com presets configuráveis
- Analytics detalhado + feature flags
- Suporte prioritário

### Enterprise — Sob consulta

Para operações grandes com requisitos de compliance e SLA.

- Tudo do Pro, sem limites
- SSO/SAML, IP allowlist, MFA obrigatório
- Integrações ilimitadas com webhook
- Audit log ilimitado
- DPA (Data Processing Agreement) customizado
- Suporte dedicado com SLA
- Onboarding guiado pela equipe Teki

## FAQ

**Posso trocar de plano a qualquer momento?**
Sim. Upgrade é imediato (proporcional). Downgrade ao final do ciclo de cobrança.

**O que acontece se eu exceder os limites?**
O sistema avisa quando você atinge 80% do limite. Ao atingir 100%, novas operações são bloqueadas até o próximo ciclo ou upgrade.

**Posso usar minha própria API key de IA?**
Sim, a partir do plano Starter. O BYOK (Bring Your Own Key) permite usar sua chave de qualquer provider suportado.

**O plano Free tem alguma propaganda ou marca d'água?**
Não. O plano Free é funcional e limpo. A única diferença são os limites de uso.

---

📚 **Próximos:** [Segurança](SECURITY.md) · [API](API.md) · [Features](FEATURES.md)
