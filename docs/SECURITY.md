# 🔐 Segurança

> Documentação de segurança do Teki para CISOs, DPOs, auditores e equipes de compliance.

## Resumo Executivo

O Teki implementa criptografia em 3 camadas (trânsito, end-to-end, repouso), autenticação multi-método com MFA, compliance LGPD/GDPR nativo e privacidade by design no módulo de Screen Inspection.

Nenhum dado de tela é transmitido para a nuvem. O processamento de OCR é 100% local.

## Criptografia em 3 Camadas

### Camada 1 — Trânsito (TLS 1.3)

Toda comunicação entre cliente e servidor é protegida por TLS 1.3. Certificados gerenciados automaticamente via Vercel (web) e atualizados periodicamente.

- Protocolo: TLS 1.3
- Cipher suites: apenas AES-256-GCM e ChaCha20-Poly1305
- HSTS habilitado com max-age de 1 ano
- Certificate pinning no app desktop

### Camada 2 — End-to-End (ECDH X25519 + AES-256-GCM)

Mensagens sensíveis entre usuários (ex: credenciais compartilhadas, dados de cliente) são criptografadas end-to-end usando o protocolo ECDH com curva X25519.

**Como funciona (simplificado):**

1. Cada usuário tem um par de chaves (pública + privada)
2. Chave privada fica no dispositivo do usuário (nunca sai)
3. Para enviar uma mensagem criptografada, o remetente usa a chave pública do destinatário + sua chave privada para derivar uma chave compartilhada (ECDH)
4. A mensagem é criptografada com AES-256-GCM usando essa chave compartilhada
5. Nem o servidor do Teki pode ler o conteúdo

### Camada 3 — Repouso (AES-256-GCM)

Dados sensíveis armazenados no banco de dados são criptografados antes de serem salvos:

| Dado | Criptografia |
|------|-------------|
| API keys de providers | AES-256-GCM |
| Credenciais de integração | AES-256-GCM |
| Tokens de acesso | AES-256-GCM |
| Chaves privadas de E2E | Derivada da senha do usuário |

A chave mestre (`ENCRYPTION_KEY`) é armazenada como variável de ambiente, nunca no código ou banco.

## Autenticação

### Métodos Disponíveis

| Método | Planos | Descrição |
|--------|--------|-----------|
| Email + Senha | Todos | Senha hashada com argon2id (salt único) |
| OAuth | Todos | Google e GitHub SSO |
| API Key | Todos | Bearer token para integrações (prefixo `tk_live_` / `tk_test_`) |
| SSO/SAML | Enterprise | Single Sign-On corporativo |

### Política de Senhas

- Mínimo 8 caracteres
- Hash: argon2id com salt único por usuário
- Recuperação: token de uso único com expiração de 1 hora
- Bloqueio após 10 tentativas falhas consecutivas

### MFA / TOTP

Autenticação de dois fatores via aplicativo (Google Authenticator, Authy, 1Password):

- Setup via QR code
- Códigos de recuperação (8 códigos de uso único)
- Obrigatório para roles `owner` e `admin` no plano Enterprise

### Sessions

- Sessions gerenciadas via NextAuth com cookies httpOnly
- Timeout de inatividade: 30 minutos
- Refresh automático em atividade
- Revogação imediata ao mudar senha

## LGPD / GDPR Compliance

O Teki foi desenhado para compliance desde o dia zero, não como uma adaptação posterior.

### Consentimento Granular

Cada finalidade de uso de dados requer consentimento separado:

| Finalidade | Descrição | Obrigatório |
|-----------|-----------|:-----------:|
| `essential` | Funcionamento básico da conta | ✅ |
| `analytics` | Métricas de uso agregadas | Opt-in |
| `marketing` | Comunicações promocionais | Opt-in |
| `ai_training` | Uso de dados para melhorar IA | Opt-in |
| `screen_capture` | Screen Inspection | Opt-in |

O usuário pode revogar qualquer consentimento a qualquer momento.

### Direitos do Titular

| Direito | Implementação |
|---------|--------------|
| **Acesso** | Endpoint que retorna todos os dados do usuário em JSON |
| **Retificação** | Edição via interface + API |
| **Eliminação** | Anonimização real (dados substituídos por hashes) |
| **Portabilidade** | Exportação completa em JSON |
| **Oposição** | Revogação de consentimento granular |

### Anonimização Real

Quando um usuário solicita exclusão, o Teki não faz soft-delete. Os dados são **anonimizados de verdade**:

- Nome → `Usuário Removido #hash`
- Email → `anon_hash@removed.teki.app`
- Avatar → Removido
- IP → Mascarado
- Status → `ANONYMIZED`

Dados estatísticos são preservados para analytics sem identificação.

### Data Access Log

Toda vez que dados pessoais são acessados, um registro é criado:

```
WHO: admin@empresa.com
WHEN: 2025-01-15T14:30:00Z
WHAT: user_profile (name, email)
WHY: support_request
HOW: api/v1/users/123
```

Esse log é imutável e auditável.

## Rate Limiting

Proteção contra abuso e DDoS:

| Endpoint | Limite | Janela |
|----------|--------|--------|
| Login | 10 tentativas | 15 minutos |
| API (Free) | 100 req | 1 minuto |
| API (Starter) | 300 req | 1 minuto |
| API (Pro) | 1000 req | 1 minuto |
| API (Enterprise) | Customizável | — |
| Chat (IA) | 50 mensagens | 1 hora |

Implementado via Redis com sliding window.

## Screen Inspection — Privacidade

O módulo mais sensível do ponto de vista de privacidade. Controles implementados:

| Controle | Detalhe |
|----------|---------|
| **Opt-in explícito** | Desativado por padrão. Requer consentimento `screen_capture`. |
| **Processamento local** | OCR via Tesseract.js rodando no Electron (no dispositivo) |
| **Sem armazenamento** | Screenshots nunca são salvos em disco ou banco |
| **Sem transmissão** | Nenhum dado de tela é enviado para servidores |
| **Mascaramento** | Campos de senha e dados sensíveis são automaticamente mascarados |
| **Controle do usuário** | Pause/stop a qualquer momento com 1 clique |
| **Indicador visual** | Ícone na barra de status quando ativo |
| **Audit** | Log de quando o feature foi ativado/desativado |

## Relatório de Vulnerabilidades

Se você encontrar uma vulnerabilidade de segurança no Teki:

1. **NÃO** reporte via issue pública
2. Envie email para security@teki.app com detalhes
3. Responderemos em até 48 horas
4. Agradecemos com menção no hall of fame (se autorizado)

---

📚 **Próximos:** [Arquitetura](ARCHITECTURE.md) · [Planos](PLANS.md) · [API](API.md)
