-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateExtension
CREATE EXTENSION IF NOT EXISTS "vector";

-- CreateEnum
CREATE TYPE "TenantStatus" AS ENUM ('TRIAL', 'ACTIVE', 'SUSPENDED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "PlanTier" AS ENUM ('FREE', 'STARTER', 'PRO', 'ENTERPRISE');

-- CreateEnum
CREATE TYPE "UserStatus" AS ENUM ('PENDING_VERIFICATION', 'ACTIVE', 'SUSPENDED', 'DEACTIVATED', 'ANONYMIZED');

-- CreateEnum
CREATE TYPE "HashAlgorithm" AS ENUM ('ARGON2ID', 'BCRYPT');

-- CreateEnum
CREATE TYPE "MfaMethod" AS ENUM ('TOTP', 'SMS', 'EMAIL');

-- CreateEnum
CREATE TYPE "AuthProvider" AS ENUM ('GOOGLE', 'GITHUB', 'MICROSOFT', 'SAML', 'OIDC');

-- CreateEnum
CREATE TYPE "MemberRole" AS ENUM ('OWNER', 'ADMIN', 'AGENT', 'VIEWER', 'BILLING', 'CUSTOM');

-- CreateEnum
CREATE TYPE "MemberStatus" AS ENUM ('INVITED', 'ACTIVE', 'SUSPENDED', 'REMOVED');

-- CreateEnum
CREATE TYPE "Theme" AS ENUM ('DARK', 'LIGHT', 'SYSTEM');

-- CreateEnum
CREATE TYPE "ConsentPurpose" AS ENUM ('TERMS_OF_SERVICE', 'PRIVACY_POLICY', 'DATA_PROCESSING', 'AI_DATA_USAGE', 'MARKETING_EMAIL', 'ANALYTICS_TRACKING', 'THIRD_PARTY_SHARING', 'AUDIO_RECORDING', 'SCREEN_CAPTURE', 'COOKIE_ANALYTICS', 'COOKIE_MARKETING');

-- CreateEnum
CREATE TYPE "LegalBasis" AS ENUM ('CONSENT', 'CONTRACT', 'LEGAL_OBLIGATION', 'LEGITIMATE_INTEREST');

-- CreateEnum
CREATE TYPE "ConsentCollectionMethod" AS ENUM ('SIGNUP_FORM', 'BANNER', 'SETTINGS', 'PROMPT', 'API', 'MIGRATION');

-- CreateEnum
CREATE TYPE "AccessorType" AS ENUM ('USER', 'ADMIN', 'SYSTEM', 'API_ACCESSOR', 'SUPPORT');

-- CreateEnum
CREATE TYPE "DataAccessAction" AS ENUM ('VIEW', 'EXPORT', 'MODIFY', 'DELETE', 'ANONYMIZE', 'SHARE', 'PROCESS');

-- CreateEnum
CREATE TYPE "MemberRemovalPolicy" AS ENUM ('ANONYMIZE', 'HARD_DELETE', 'RETAIN');

-- CreateEnum
CREATE TYPE "DeviceType" AS ENUM ('DESKTOP_APP', 'WEB_BROWSER', 'MOBILE_APP', 'API_CLIENT');

-- CreateEnum
CREATE TYPE "SessionRevokeReason" AS ENUM ('USER_LOGOUT', 'ADMIN_REVOKE', 'PASSWORD_CHANGED', 'SUSPICIOUS_ACTIVITY', 'SESSION_LIMIT', 'ACCOUNT_SUSPENDED', 'ACCOUNT_ANONYMIZED');

-- CreateEnum
CREATE TYPE "ApiKeyType" AS ENUM ('LIVE', 'TEST');

-- CreateEnum
CREATE TYPE "DocumentStatus" AS ENUM ('UPLOADING', 'EXTRACTING', 'EMBEDDING', 'INDEXED', 'ERROR');

-- CreateEnum
CREATE TYPE "Platform" AS ENUM ('WHATSAPP', 'TELEGRAM', 'DISCORD', 'SLACK');

-- CreateEnum
CREATE TYPE "ChannelStatus" AS ENUM ('PENDING', 'CONNECTING', 'ACTIVE', 'DISCONNECTED', 'ERROR');

-- CreateEnum
CREATE TYPE "MessageRole" AS ENUM ('USER', 'ASSISTANT', 'SYSTEM');

-- CreateEnum
CREATE TYPE "ConversationType" AS ENUM ('AI_CHAT', 'FLOATING', 'INTERNAL_NOTE', 'SUPPORT_CHAT', 'BOT_FLOW', 'VOICE_TRANSCRIPT', 'GROUP_CHAT');

-- CreateEnum
CREATE TYPE "ConversationStatus" AS ENUM ('ACTIVE', 'ARCHIVED', 'CLOSED', 'DELETED');

-- CreateEnum
CREATE TYPE "ParticipantRole" AS ENUM ('CREATOR', 'PARTICIPANT', 'OBSERVER', 'MENTIONED');

-- CreateEnum
CREATE TYPE "ParticipantStatus" AS ENUM ('ACTIVE', 'LEFT', 'REMOVED', 'MUTED');

-- CreateEnum
CREATE TYPE "NotificationLevel" AS ENUM ('ALL', 'MENTIONS', 'NONE');

-- CreateEnum
CREATE TYPE "SenderType" AS ENUM ('user', 'ai', 'system', 'bot');

-- CreateEnum
CREATE TYPE "MessageContentType" AS ENUM ('TEXT', 'RICH_TEXT', 'CODE', 'IMAGE', 'FILE', 'AUDIO', 'SYSTEM_EVENT', 'SUGGESTION', 'TEMPLATE', 'COMPOSITE');

-- CreateEnum
CREATE TYPE "MessageStatus" AS ENUM ('SENDING', 'SENT', 'DELIVERED', 'READ', 'EDITED', 'DELETED', 'FAILED', 'STREAMING');

-- CreateEnum
CREATE TYPE "SourceType" AS ENUM ('KB_ARTICLE', 'KB_SEARCH', 'WEB_SEARCH', 'WEB_PAGE', 'TICKET_HISTORY', 'CONVERSATION', 'UPLOADED_FILE', 'SCREEN_CAPTURE', 'AUDIO_TRANSCRIPT', 'AI_KNOWLEDGE', 'TEMPLATE', 'API_RESPONSE', 'DATABASE_QUERY');

-- CreateEnum
CREATE TYPE "FeedbackRating" AS ENUM ('POSITIVE', 'NEGATIVE', 'MIXED');

-- CreateEnum
CREATE TYPE "AttachmentCategory" AS ENUM ('IMAGE', 'SCREENSHOT', 'DOCUMENT', 'AUDIO', 'VIDEO', 'LOG_FILE', 'CODE', 'FILE');

-- CreateEnum
CREATE TYPE "AttachmentProcessingStatus" AS ENUM ('UPLOADED', 'PROCESSING', 'COMPLETED', 'FAILED');

-- CreateEnum
CREATE TYPE "KbArticleStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "KbDifficulty" AS ENUM ('BASIC', 'INTERMEDIATE', 'ADVANCED');

-- CreateEnum
CREATE TYPE "KbAudience" AS ENUM ('END_USER', 'TECHNICIAN', 'ADMIN');

-- CreateEnum
CREATE TYPE "KbInsertionMode" AS ENUM ('QUICK_ADD', 'FILE_UPLOAD', 'FULL_FORM', 'FROM_CHAT');

-- CreateEnum
CREATE TYPE "SlaClockStatus" AS ENUM ('RUNNING', 'PAUSED', 'STOPPED');

-- CreateEnum
CREATE TYPE "NotificationPriority" AS ENUM ('URGENT', 'HIGH', 'NORMAL', 'LOW');

-- CreateEnum
CREATE TYPE "RoutingStrategy" AS ENUM ('PRIORITY', 'ROUND_ROBIN', 'COST_OPTIMIZED', 'LATENCY_OPTIMIZED');

-- CreateEnum
CREATE TYPE "TemplateScope" AS ENUM ('PERSONAL', 'TEAM', 'PUBLIC');

-- CreateEnum
CREATE TYPE "TemplateStatus" AS ENUM ('DRAFT', 'ACTIVE', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "ConnectorPlatform" AS ENUM ('GLPI', 'ZENDESK', 'FRESHDESK', 'OTRS');

-- CreateEnum
CREATE TYPE "ConnectorAuthType" AS ENUM ('API_TOKEN', 'BASIC_AUTH', 'OAUTH2', 'API_KEY_HEADER');

-- CreateEnum
CREATE TYPE "SyncDirection" AS ENUM ('READ_ONLY', 'BIDIRECTIONAL', 'WRITE_BACK_NOTES');

-- CreateEnum
CREATE TYPE "ConnectorStatus" AS ENUM ('CONFIGURING', 'TESTING', 'ACTIVE', 'PAUSED', 'ERROR', 'DISCONNECTED');

-- CreateEnum
CREATE TYPE "HealthStatus" AS ENUM ('HEALTHY', 'DEGRADED', 'DOWN', 'UNKNOWN');

-- CreateEnum
CREATE TYPE "CacheSource" AS ENUM ('POLL', 'WEBHOOK', 'ON_DEMAND', 'AI_CONTEXT');

-- CreateEnum
CREATE TYPE "SyncType" AS ENUM ('FULL', 'INCREMENTAL', 'SINGLE', 'WEBHOOK', 'WRITE_BACK');

-- CreateEnum
CREATE TYPE "SyncLogStatus" AS ENUM ('SUCCESS', 'PARTIAL', 'ERROR');

-- CreateEnum
CREATE TYPE "DeviceCodeStatus" AS ENUM ('PENDING', 'AUTHORIZED', 'EXPIRED', 'DENIED');

-- CreateTable
CREATE TABLE "tenants" (
    "id" UUID NOT NULL,
    "name" VARCHAR(200) NOT NULL,
    "slug" VARCHAR(100) NOT NULL,
    "email" VARCHAR(255),
    "phone" VARCHAR(20),
    "website" VARCHAR(500),
    "country" VARCHAR(2) NOT NULL DEFAULT 'BR',
    "state" VARCHAR(100),
    "city" VARCHAR(100),
    "default_timezone" VARCHAR(50) NOT NULL DEFAULT 'America/Sao_Paulo',
    "default_locale" VARCHAR(10) NOT NULL DEFAULT 'pt-BR',
    "tax_id" VARCHAR(20),
    "tax_id_type" VARCHAR(10),
    "plan" "PlanTier" NOT NULL DEFAULT 'FREE',
    "plan_started_at" TIMESTAMP(3),
    "plan_expires_at" TIMESTAMP(3),
    "billing_email" VARCHAR(255),
    "stripe_customer_id" VARCHAR(255),
    "mp_preapproval_id" TEXT,
    "abacate_billing_id" TEXT,
    "abacate_customer_id" TEXT,
    "status" "TenantStatus" NOT NULL DEFAULT 'ACTIVE',
    "trial_ends_at" TIMESTAMP(3),
    "settings" JSONB NOT NULL DEFAULT '{}',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tenants_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users" (
    "id" UUID NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "email_verified" BOOLEAN NOT NULL DEFAULT false,
    "email_verified_at" TIMESTAMP(3),
    "first_name" VARCHAR(100) NOT NULL,
    "last_name" VARCHAR(100),
    "display_name" VARCHAR(200),
    "phone" VARCHAR(20),
    "phone_verified" BOOLEAN NOT NULL DEFAULT false,
    "avatar_url" VARCHAR(500),
    "email_verification_token_hash" VARCHAR(255),
    "status" "UserStatus" NOT NULL DEFAULT 'PENDING_VERIFICATION',
    "last_login_at" TIMESTAMP(3),
    "last_login_ip" TEXT,
    "last_login_user_agent" TEXT,
    "deactivated_at" TIMESTAMP(3),
    "deactivated_reason" VARCHAR(500),
    "anonymized_at" TIMESTAMP(3),
    "anonymized_by" UUID,
    "name" VARCHAR(200),
    "image" VARCHAR(500),
    "onboarding_step" INTEGER NOT NULL DEFAULT 0,
    "ai_tone" VARCHAR(50),
    "area" VARCHAR(50),
    "user_role" VARCHAR(50),
    "company" VARCHAR(200),
    "first_login_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "billing_name" VARCHAR(200),
    "billing_company" VARCHAR(200),
    "billing_tax_id" VARCHAR(20),
    "plan_activated_at" TIMESTAMP(3),
    "plan_expires_at" TIMESTAMP(3),
    "plan_cancelled_at" TIMESTAMP(3),

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_credentials" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "password_hash" VARCHAR(255) NOT NULL,
    "hash_algorithm" "HashAlgorithm" NOT NULL DEFAULT 'ARGON2ID',
    "password_changed_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "password_expires_at" TIMESTAMP(3),
    "must_change_password" BOOLEAN NOT NULL DEFAULT false,
    "failed_attempts" INTEGER NOT NULL DEFAULT 0,
    "locked_until" TIMESTAMP(3),
    "mfa_enabled" BOOLEAN NOT NULL DEFAULT false,
    "mfa_method" "MfaMethod",
    "mfa_secret_encrypted" VARCHAR(500),
    "mfa_backup_codes_encrypted" TEXT,
    "mfa_verified_at" TIMESTAMP(3),
    "recovery_token_hash" VARCHAR(255),
    "recovery_token_expires_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_credentials_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_auth_providers" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "provider" "AuthProvider" NOT NULL DEFAULT 'GOOGLE',
    "provider_user_id" VARCHAR(255) NOT NULL,
    "access_token_encrypted" TEXT,
    "refresh_token_encrypted" TEXT,
    "token_expires_at" TIMESTAMP(3),
    "provider_email" VARCHAR(255),
    "provider_name" VARCHAR(200),
    "provider_avatar_url" VARCHAR(500),
    "sso_tenant_id" VARCHAR(255),
    "sso_issuer_url" VARCHAR(500),
    "sso_metadata" JSONB,
    "is_primary" BOOLEAN NOT NULL DEFAULT false,
    "linked_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "last_used_at" TIMESTAMP(3),
    "revoked_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_auth_providers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tenant_members" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "role" "MemberRole" NOT NULL DEFAULT 'AGENT',
    "permissions" JSONB,
    "job_title" VARCHAR(100),
    "department" VARCHAR(100),
    "status" "MemberStatus" NOT NULL DEFAULT 'ACTIVE',
    "invited_by" UUID,
    "invited_at" TIMESTAMP(3),
    "invite_token_hash" VARCHAR(255),
    "invite_expires_at" TIMESTAMP(3),
    "accepted_at" TIMESTAMP(3),
    "last_active_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tenant_members_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_preferences" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "tenant_id" UUID,
    "timezone" VARCHAR(50) NOT NULL DEFAULT 'America/Sao_Paulo',
    "timezone_auto_detected" BOOLEAN NOT NULL DEFAULT true,
    "locale" VARCHAR(10) NOT NULL DEFAULT 'pt-BR',
    "theme" "Theme" NOT NULL DEFAULT 'DARK',
    "notification_settings" JSONB NOT NULL DEFAULT '{"email":{"enabled":true,"digest":"daily","types":["ticket_assigned","ticket_resolved","mention"]},"desktop":{"enabled":true,"sound":true,"types":["ticket_assigned","new_message","alert"]},"in_app":{"enabled":true,"types":["all"]}}',
    "ai_settings" JSONB NOT NULL DEFAULT '{"preferred_provider":null,"preferred_model":null,"auto_suggest":true,"suggestion_language":"pt-BR","show_cost":true,"show_tokens":false}',
    "floating_assistant_settings" JSONB NOT NULL DEFAULT '{"side":"right","width":320,"collapsed":false,"always_on_top":true,"opacity":0.85,"stealth_mode":true,"shortcuts":{"toggle":"CommandOrControl+Shift+Space","capture":"CommandOrControl+Shift+S","audio":"CommandOrControl+Shift+A","quick_input":"CommandOrControl+Shift+Q"}}',
    "ui_settings" JSONB NOT NULL DEFAULT '{"sidebar_collapsed":false,"density":"comfortable","font_size":"medium","animations":true,"cat_mascot_visible":true,"keyboard_shortcuts_enabled":true,"default_kb_view":"list","default_ticket_view":"kanban"}',
    "custom_settings" JSONB NOT NULL DEFAULT '{}',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_preferences_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_consents" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "purpose" "ConsentPurpose" NOT NULL,
    "granted" BOOLEAN NOT NULL,
    "legal_basis" "LegalBasis" NOT NULL,
    "policy_version" VARCHAR(20) NOT NULL,
    "policy_url" VARCHAR(500),
    "collection_method" "ConsentCollectionMethod" NOT NULL,
    "ip_address" TEXT,
    "user_agent" TEXT,
    "geo_country" VARCHAR(2),
    "expires_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_consents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "data_access_log" (
    "id" UUID NOT NULL,
    "accessor_id" UUID NOT NULL,
    "accessor_type" "AccessorType" NOT NULL,
    "accessor_tenant_id" UUID,
    "subject_id" UUID NOT NULL,
    "action" "DataAccessAction" NOT NULL,
    "data_categories" TEXT[],
    "details" JSONB,
    "legal_basis" VARCHAR(50),
    "justification" TEXT,
    "ip_address" TEXT,
    "user_agent" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "data_access_log_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tenant_data_policies" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "member_removal_policy" "MemberRemovalPolicy" NOT NULL DEFAULT 'ANONYMIZE',
    "retention_days" INTEGER NOT NULL DEFAULT 30,
    "keep_tickets" BOOLEAN NOT NULL DEFAULT true,
    "keep_kb_articles" BOOLEAN NOT NULL DEFAULT true,
    "keep_activity_logs" BOOLEAN NOT NULL DEFAULT true,
    "keep_ai_history" BOOLEAN NOT NULL DEFAULT false,
    "personal_data_retention_months" INTEGER NOT NULL DEFAULT 24,
    "notify_user_on_data_deletion" BOOLEAN NOT NULL DEFAULT true,
    "notify_admin_on_data_request" BOOLEAN NOT NULL DEFAULT true,
    "dpo_name" VARCHAR(200),
    "dpo_email" VARCHAR(255),
    "terms_accepted_at" TIMESTAMP(3),
    "terms_accepted_by" UUID,
    "terms_version" VARCHAR(20),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tenant_data_policies_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_sessions" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "tenant_id" UUID,
    "token_hash" VARCHAR(255) NOT NULL,
    "refresh_token_hash" VARCHAR(255),
    "device_fingerprint" VARCHAR(255),
    "device_type" "DeviceType",
    "device_name" VARCHAR(100),
    "os" VARCHAR(50),
    "browser" VARCHAR(50),
    "ip_address" TEXT NOT NULL,
    "geo_country" VARCHAR(2),
    "geo_region" VARCHAR(100),
    "geo_city" VARCHAR(100),
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "last_activity_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "revoked_at" TIMESTAMP(3),
    "revoked_by" UUID,
    "revoke_reason" "SessionRevokeReason",
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ApiKey" (
    "id" TEXT NOT NULL,
    "userId" UUID NOT NULL,
    "keyHash" TEXT NOT NULL,
    "keyPrefix" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "ApiKeyType" NOT NULL,
    "lastUsedAt" TIMESTAMP(3),
    "expiresAt" TIMESTAMP(3),
    "isRevoked" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ApiKey_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "api_key_usage_logs" (
    "id" TEXT NOT NULL,
    "apiKeyId" TEXT NOT NULL,
    "userId" UUID NOT NULL,
    "endpoint" VARCHAR(200) NOT NULL,
    "method" VARCHAR(10) NOT NULL,
    "tokensIn" INTEGER NOT NULL DEFAULT 0,
    "tokensOut" INTEGER NOT NULL DEFAULT 0,
    "costUsd" DECIMAL(10,8) NOT NULL DEFAULT 0,
    "latencyMs" INTEGER NOT NULL DEFAULT 0,
    "modelId" VARCHAR(100),
    "statusCode" INTEGER NOT NULL DEFAULT 200,
    "period" VARCHAR(7) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "api_key_usage_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProviderKey" (
    "id" TEXT NOT NULL,
    "userId" UUID NOT NULL,
    "provider" TEXT NOT NULL,
    "encryptedKey" TEXT NOT NULL,
    "iv" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'unconfigured',
    "lastValidatedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProviderKey_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Agent" (
    "id" TEXT NOT NULL,
    "userId" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "systemPrompt" TEXT NOT NULL,
    "model" TEXT NOT NULL DEFAULT 'gemini-flash',
    "welcomeMessage" TEXT,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Agent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Document" (
    "id" TEXT NOT NULL,
    "agentId" TEXT NOT NULL,
    "userId" UUID NOT NULL,
    "filename" TEXT NOT NULL,
    "originalName" TEXT NOT NULL,
    "fileType" TEXT NOT NULL,
    "fileSize" INTEGER NOT NULL,
    "fileUrl" TEXT NOT NULL,
    "status" "DocumentStatus" NOT NULL DEFAULT 'UPLOADING',
    "totalChunks" INTEGER NOT NULL DEFAULT 0,
    "errorMsg" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Document_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DocumentChunk" (
    "id" TEXT NOT NULL,
    "documentId" TEXT NOT NULL,
    "chunkIndex" INTEGER NOT NULL,
    "content" TEXT NOT NULL,
    "embedding" vector(768),
    "tokenCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DocumentChunk_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Channel" (
    "id" TEXT NOT NULL,
    "userId" UUID NOT NULL,
    "agentId" TEXT NOT NULL,
    "platform" "Platform" NOT NULL,
    "status" "ChannelStatus" NOT NULL DEFAULT 'PENDING',
    "displayName" TEXT NOT NULL,
    "platformConfig" JSONB NOT NULL,
    "welcomeMessage" TEXT,
    "modelOverride" TEXT,
    "businessHoursStart" TEXT,
    "businessHoursEnd" TEXT,
    "businessHoursTimezone" TEXT NOT NULL DEFAULT 'America/Sao_Paulo',
    "respondOutsideHours" BOOLEAN NOT NULL DEFAULT true,
    "outsideHoursMessage" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Channel_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ChannelConversation" (
    "id" TEXT NOT NULL,
    "channelId" TEXT NOT NULL,
    "externalUserId" TEXT NOT NULL,
    "externalUserName" TEXT,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastMessageAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "messageCount" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "ChannelConversation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ChannelMessage" (
    "id" TEXT NOT NULL,
    "conversationId" TEXT NOT NULL,
    "role" "MessageRole" NOT NULL,
    "content" TEXT NOT NULL,
    "imageUrl" TEXT,
    "modelUsed" TEXT,
    "tokensIn" INTEGER,
    "tokensOut" INTEGER,
    "latencyMs" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ChannelMessage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "conversations" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "type" "ConversationType" NOT NULL,
    "title" VARCHAR(300),
    "slug" VARCHAR(100),
    "context" JSONB NOT NULL DEFAULT '{}',
    "settings" JSONB NOT NULL DEFAULT '{}',
    "status" "ConversationStatus" NOT NULL DEFAULT 'ACTIVE',
    "message_count" INTEGER NOT NULL DEFAULT 0,
    "participant_count" INTEGER NOT NULL DEFAULT 0,
    "unread_count" JSONB NOT NULL DEFAULT '{}',
    "ai_summary" TEXT,
    "ai_summary_updated_at" TIMESTAMP(3),
    "total_ai_tokens_in" INTEGER NOT NULL DEFAULT 0,
    "total_ai_tokens_out" INTEGER NOT NULL DEFAULT 0,
    "total_ai_cost_usd" DECIMAL(10,6) NOT NULL DEFAULT 0,
    "total_ai_messages" INTEGER NOT NULL DEFAULT 0,
    "first_message_at" TIMESTAMP(3),
    "last_message_at" TIMESTAMP(3),
    "last_message_preview" VARCHAR(200),
    "created_by" UUID NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "conversations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "conversation_participants" (
    "id" UUID NOT NULL,
    "conversation_id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "role" "ParticipantRole" NOT NULL DEFAULT 'PARTICIPANT',
    "status" "ParticipantStatus" NOT NULL DEFAULT 'ACTIVE',
    "last_read_at" TIMESTAMP(3),
    "last_read_message_id" UUID,
    "is_pinned" BOOLEAN NOT NULL DEFAULT false,
    "is_muted" BOOLEAN NOT NULL DEFAULT false,
    "notification_level" "NotificationLevel" NOT NULL DEFAULT 'ALL',
    "joined_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "left_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "conversation_participants_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "messages" (
    "id" UUID NOT NULL,
    "conversation_id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "sender_type" "SenderType" NOT NULL,
    "sender_id" UUID,
    "content_type" "MessageContentType" NOT NULL DEFAULT 'TEXT',
    "content" TEXT,
    "content_blocks" JSONB,
    "parent_message_id" UUID,
    "thread_depth" INTEGER NOT NULL DEFAULT 0,
    "thread_message_count" INTEGER NOT NULL DEFAULT 0,
    "mentions" JSONB,
    "status" "MessageStatus" NOT NULL DEFAULT 'SENT',
    "edited_at" TIMESTAMP(3),
    "edited_by" UUID,
    "original_content" TEXT,
    "deleted_at" TIMESTAMP(3),
    "deleted_by" UUID,
    "is_ai_generated" BOOLEAN NOT NULL DEFAULT false,
    "is_pinned" BOOLEAN NOT NULL DEFAULT false,
    "sequence_number" BIGINT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "messages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "message_ai_metadata" (
    "id" UUID NOT NULL,
    "message_id" UUID NOT NULL,
    "conversation_id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "provider" VARCHAR(50) NOT NULL,
    "model" VARCHAR(100) NOT NULL,
    "model_version" VARCHAR(50),
    "tokens_input" INTEGER NOT NULL DEFAULT 0,
    "tokens_output" INTEGER NOT NULL DEFAULT 0,
    "tokens_cached" INTEGER NOT NULL DEFAULT 0,
    "cost_input_usd" DECIMAL(10,8) NOT NULL DEFAULT 0,
    "cost_output_usd" DECIMAL(10,8) NOT NULL DEFAULT 0,
    "latency_ms" INTEGER NOT NULL DEFAULT 0,
    "time_to_first_token_ms" INTEGER,
    "tokens_per_second" DECIMAL(8,2),
    "system_prompt_hash" VARCHAR(64),
    "system_prompt_tokens" INTEGER,
    "conversation_history_tokens" INTEGER,
    "context_window_usage" DECIMAL(5,2),
    "was_streamed" BOOLEAN NOT NULL DEFAULT false,
    "stream_chunks" INTEGER,
    "stream_interrupted" BOOLEAN NOT NULL DEFAULT false,
    "was_fallback" BOOLEAN NOT NULL DEFAULT false,
    "original_provider" VARCHAR(50),
    "original_model" VARCHAR(100),
    "fallback_reason" VARCHAR(50),
    "cache_hit" BOOLEAN NOT NULL DEFAULT false,
    "cache_key" VARCHAR(255),
    "content_filtered" BOOLEAN NOT NULL DEFAULT false,
    "filter_reason" TEXT,
    "raw_response_id" VARCHAR(255),
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "message_ai_metadata_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "message_sources" (
    "id" UUID NOT NULL,
    "message_id" UUID NOT NULL,
    "conversation_id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "source_type" "SourceType" NOT NULL,
    "reference_id" UUID,
    "reference_url" VARCHAR(2000),
    "reference_title" VARCHAR(500),
    "relevance_score" DECIMAL(5,4),
    "relevance_rank" INTEGER,
    "excerpt" TEXT,
    "was_cited" BOOLEAN NOT NULL DEFAULT false,
    "citation_text" VARCHAR(500),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "message_sources_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "message_feedback" (
    "id" UUID NOT NULL,
    "message_id" UUID NOT NULL,
    "conversation_id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "rating" "FeedbackRating" NOT NULL,
    "comment" TEXT,
    "tags" JSONB,
    "action_taken" VARCHAR(30),
    "corrected_content" TEXT,
    "feedback_context" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "message_feedback_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "message_attachments" (
    "id" UUID NOT NULL,
    "message_id" UUID NOT NULL,
    "conversation_id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "file_name" VARCHAR(255) NOT NULL,
    "file_type" VARCHAR(100) NOT NULL,
    "file_size_bytes" BIGINT NOT NULL,
    "file_path" VARCHAR(500) NOT NULL,
    "thumbnail_path" VARCHAR(500),
    "category" "AttachmentCategory" NOT NULL DEFAULT 'FILE',
    "processing_status" "AttachmentProcessingStatus" NOT NULL DEFAULT 'UPLOADED',
    "processing_result" JSONB,
    "expires_at" TIMESTAMP(3),
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "uploaded_by" UUID NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "message_attachments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "conversation_tags" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "name" VARCHAR(50) NOT NULL,
    "color" VARCHAR(7) NOT NULL DEFAULT '#3f3f46',
    "description" VARCHAR(200),
    "usage_count" INTEGER NOT NULL DEFAULT 0,
    "created_by" UUID NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "conversation_tags_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "conversation_tag_links" (
    "conversation_id" UUID NOT NULL,
    "tag_id" UUID NOT NULL,
    "added_by" UUID NOT NULL,
    "added_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "conversation_tag_links_pkey" PRIMARY KEY ("conversation_id","tag_id")
);

-- CreateTable
CREATE TABLE "UsageCounter" (
    "id" TEXT NOT NULL,
    "userId" UUID NOT NULL,
    "period" TEXT NOT NULL,
    "messages" INTEGER NOT NULL DEFAULT 0,
    "tokensIn" INTEGER NOT NULL DEFAULT 0,
    "tokensOut" INTEGER NOT NULL DEFAULT 0,
    "byokMessages" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "UsageCounter_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "plan_history" (
    "id" TEXT NOT NULL,
    "userId" UUID NOT NULL,
    "from_plan" "PlanTier" NOT NULL,
    "to_plan" "PlanTier" NOT NULL,
    "reason" VARCHAR(50) NOT NULL,
    "amount" DOUBLE PRECISION,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "plan_history_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WebhookEndpoint" (
    "id" TEXT NOT NULL,
    "userId" UUID NOT NULL,
    "url" TEXT NOT NULL,
    "secret" TEXT NOT NULL,
    "events" TEXT[],
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WebhookEndpoint_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WebhookLog" (
    "id" TEXT NOT NULL,
    "endpointId" TEXT NOT NULL,
    "event" TEXT NOT NULL,
    "payload" JSONB NOT NULL,
    "statusCode" INTEGER,
    "responseBody" TEXT,
    "deliveredAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WebhookLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HttpRequestLog" (
    "id" TEXT NOT NULL,
    "method" VARCHAR(10) NOT NULL,
    "path" TEXT NOT NULL,
    "statusCode" INTEGER NOT NULL,
    "latencyMs" INTEGER NOT NULL,
    "ip" TEXT,
    "userAgent" TEXT,
    "userId" UUID,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "HttpRequestLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "KbCategory" (
    "id" TEXT NOT NULL,
    "userId" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "parentId" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "KbCategory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "KbArticle" (
    "id" TEXT NOT NULL,
    "userId" UUID NOT NULL,
    "categoryId" TEXT,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "summary" TEXT,
    "content" TEXT NOT NULL,
    "status" "KbArticleStatus" NOT NULL DEFAULT 'DRAFT',
    "difficulty" "KbDifficulty" NOT NULL DEFAULT 'BASIC',
    "targetAudience" "KbAudience" NOT NULL DEFAULT 'TECHNICIAN',
    "tags" TEXT[],
    "viewCount" INTEGER NOT NULL DEFAULT 0,
    "helpfulCount" INTEGER NOT NULL DEFAULT 0,
    "notHelpfulCount" INTEGER NOT NULL DEFAULT 0,
    "insertionMode" "KbInsertionMode",
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "KbArticle_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "KbArticleAttachment" (
    "id" TEXT NOT NULL,
    "userId" UUID NOT NULL,
    "articleId" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "fileType" TEXT NOT NULL,
    "fileSizeBytes" INTEGER NOT NULL,
    "filePath" TEXT NOT NULL,
    "extractedText" TEXT,
    "extractionMethod" TEXT,
    "extractionStatus" TEXT NOT NULL DEFAULT 'pending',
    "extractionError" TEXT,
    "pageCount" INTEGER,
    "wordCount" INTEGER,
    "isSourceFile" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "KbArticleAttachment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "KbInsertionLog" (
    "id" TEXT NOT NULL,
    "userId" UUID NOT NULL,
    "articleId" TEXT,
    "insertionMode" "KbInsertionMode" NOT NULL,
    "originalInput" JSONB,
    "aiProvider" TEXT,
    "aiModel" TEXT,
    "aiSuggestions" JSONB,
    "aiTokensUsed" INTEGER,
    "aiCostUsd" DOUBLE PRECISION,
    "aiLatencyMs" INTEGER,
    "fieldsAutoFilled" INTEGER NOT NULL DEFAULT 0,
    "fieldsUserEdited" INTEGER NOT NULL DEFAULT 0,
    "userEdits" JSONB,
    "status" TEXT NOT NULL DEFAULT 'completed',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "KbInsertionLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sla_policies" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "is_default" BOOLEAN NOT NULL DEFAULT false,
    "targets" JSONB NOT NULL,
    "business_hours" JSONB NOT NULL DEFAULT '{"timezone":"America/Sao_Paulo","schedule":{"monday":{"start":"08:00","end":"18:00"},"tuesday":{"start":"08:00","end":"18:00"},"wednesday":{"start":"08:00","end":"18:00"},"thursday":{"start":"08:00","end":"18:00"},"friday":{"start":"08:00","end":"18:00"},"saturday":null,"sunday":null},"holidays":[]}',
    "warning_threshold_pct" INTEGER NOT NULL DEFAULT 75,
    "status" VARCHAR(20) NOT NULL DEFAULT 'active',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sla_policies_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ticket_sla" (
    "id" UUID NOT NULL,
    "connector_id" UUID NOT NULL,
    "external_ticket_id" VARCHAR(255) NOT NULL,
    "sla_policy_id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "first_response_target_at" TIMESTAMP(3),
    "first_response_actual_at" TIMESTAMP(3),
    "first_response_breached" BOOLEAN NOT NULL DEFAULT false,
    "first_response_breach_minutes" INTEGER,
    "resolution_target_at" TIMESTAMP(3),
    "resolution_actual_at" TIMESTAMP(3),
    "resolution_breached" BOOLEAN NOT NULL DEFAULT false,
    "resolution_breach_minutes" INTEGER,
    "clock_status" "SlaClockStatus" NOT NULL DEFAULT 'RUNNING',
    "total_paused_minutes" INTEGER NOT NULL DEFAULT 0,
    "last_paused_at" TIMESTAMP(3),
    "last_resumed_at" TIMESTAMP(3),
    "first_response_warning_sent" BOOLEAN NOT NULL DEFAULT false,
    "resolution_warning_sent" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ticket_sla_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notifications" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "recipient_id" UUID NOT NULL,
    "type" VARCHAR(50) NOT NULL,
    "title" VARCHAR(200) NOT NULL,
    "body" TEXT,
    "summary" VARCHAR(500),
    "resource_type" VARCHAR(30),
    "resource_id" UUID,
    "action_url" VARCHAR(500),
    "actor_id" UUID,
    "actor_name" VARCHAR(200),
    "actor_avatar_url" VARCHAR(500),
    "priority" "NotificationPriority" NOT NULL DEFAULT 'NORMAL',
    "group_key" VARCHAR(200),
    "group_count" INTEGER NOT NULL DEFAULT 1,
    "channels" JSONB NOT NULL DEFAULT '{"in_app":{"status":"pending"},"email":{"status":"pending"},"desktop":{"status":"pending"},"websocket":{"status":"pending"}}',
    "is_read" BOOLEAN NOT NULL DEFAULT false,
    "read_at" TIMESTAMP(3),
    "is_archived" BOOLEAN NOT NULL DEFAULT false,
    "archived_at" TIMESTAMP(3),
    "expires_at" TIMESTAMP(3),
    "data" JSONB NOT NULL DEFAULT '{}',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notification_preferences_override" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "notification_type" VARCHAR(50) NOT NULL,
    "in_app_enabled" BOOLEAN,
    "email_enabled" BOOLEAN,
    "desktop_enabled" BOOLEAN,
    "websocket_enabled" BOOLEAN,
    "email_digest" VARCHAR(20),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "notification_preferences_override_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ai_provider_configs" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "provider" VARCHAR(50) NOT NULL,
    "display_name" VARCHAR(100),
    "api_key_encrypted" VARCHAR(1000) NOT NULL,
    "api_key_prefix" VARCHAR(10),
    "api_key_added_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "api_key_last_validated_at" TIMESTAMP(3),
    "api_key_valid" BOOLEAN NOT NULL DEFAULT true,
    "default_model" VARCHAR(100) NOT NULL,
    "available_models" JSONB NOT NULL DEFAULT '[]',
    "settings" JSONB NOT NULL DEFAULT '{}',
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "priority_order" INTEGER NOT NULL DEFAULT 0,
    "is_fallback" BOOLEAN NOT NULL DEFAULT false,
    "monthly_cost_limit_usd" DECIMAL(10,2),
    "daily_request_limit" INTEGER,
    "rate_limit_rpm" INTEGER,
    "current_month_cost_usd" DECIMAL(10,4) NOT NULL DEFAULT 0,
    "current_month_requests" INTEGER NOT NULL DEFAULT 0,
    "current_month_tokens_in" INTEGER NOT NULL DEFAULT 0,
    "current_month_tokens_out" INTEGER NOT NULL DEFAULT 0,
    "current_month_reset_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "configured_by" UUID NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ai_provider_configs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ai_usage_daily" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "provider" VARCHAR(50) NOT NULL,
    "model" VARCHAR(100) NOT NULL,
    "usage_date" DATE NOT NULL,
    "request_count" INTEGER NOT NULL DEFAULT 0,
    "tokens_input" INTEGER NOT NULL DEFAULT 0,
    "tokens_output" INTEGER NOT NULL DEFAULT 0,
    "tokens_cached" INTEGER NOT NULL DEFAULT 0,
    "cost_usd" DECIMAL(10,6) NOT NULL DEFAULT 0,
    "avg_latency_ms" INTEGER,
    "p95_latency_ms" INTEGER,
    "error_count" INTEGER NOT NULL DEFAULT 0,
    "fallback_count" INTEGER NOT NULL DEFAULT 0,
    "timeout_count" INTEGER NOT NULL DEFAULT 0,
    "feedback_positive" INTEGER NOT NULL DEFAULT 0,
    "feedback_negative" INTEGER NOT NULL DEFAULT 0,
    "usage_breakdown" JSONB NOT NULL DEFAULT '{}',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ai_usage_daily_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ai_routing_rules" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "strategy" "RoutingStrategy" NOT NULL DEFAULT 'PRIORITY',
    "fallback_enabled" BOOLEAN NOT NULL DEFAULT true,
    "max_fallback_attempts" INTEGER NOT NULL DEFAULT 2,
    "fallback_on" JSONB NOT NULL DEFAULT '["rate_limit","timeout","error_500"]',
    "monthly_budget_usd" DECIMAL(10,2),
    "budget_alert_threshold_pct" INTEGER NOT NULL DEFAULT 80,
    "budget_hard_stop" BOOLEAN NOT NULL DEFAULT false,
    "type_rules" JSONB NOT NULL DEFAULT '{}',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ai_routing_rules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "response_templates" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "title" VARCHAR(200) NOT NULL,
    "slug" VARCHAR(200),
    "description" TEXT,
    "content" TEXT NOT NULL,
    "content_html" TEXT,
    "variables" JSONB NOT NULL DEFAULT '[]',
    "category" VARCHAR(100),
    "tags" JSONB NOT NULL DEFAULT '[]',
    "scope" "TemplateScope" NOT NULL DEFAULT 'TEAM',
    "applicable_to" JSONB NOT NULL DEFAULT '["conversation","ticket_resolution","internal_note"]',
    "shortcut" VARCHAR(50),
    "status" "TemplateStatus" NOT NULL DEFAULT 'ACTIVE',
    "version" INTEGER NOT NULL DEFAULT 1,
    "usage_count" INTEGER NOT NULL DEFAULT 0,
    "last_used_at" TIMESTAMP(3),
    "last_used_by" UUID,
    "avg_feedback_score" DECIMAL(3,2),
    "ai_generated" BOOLEAN NOT NULL DEFAULT false,
    "ai_improved" BOOLEAN NOT NULL DEFAULT false,
    "created_by" UUID NOT NULL,
    "updated_by" UUID,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "response_templates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "template_usage_log" (
    "id" UUID NOT NULL,
    "template_id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "used_in" VARCHAR(30) NOT NULL,
    "conversation_id" UUID,
    "message_id" UUID,
    "external_ticket_id" VARCHAR(255),
    "was_modified" BOOLEAN NOT NULL DEFAULT false,
    "modification_pct" DECIMAL(5,2),
    "variables_filled" JSONB,
    "variables_manual_count" INTEGER NOT NULL DEFAULT 0,
    "template_version" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "template_usage_log_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "external_connectors" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "platform" "ConnectorPlatform" NOT NULL,
    "display_name" VARCHAR(100),
    "base_url" VARCHAR(500) NOT NULL,
    "auth_type" "ConnectorAuthType" NOT NULL,
    "auth_credentials_encrypted" TEXT NOT NULL,
    "sync_direction" "SyncDirection" NOT NULL DEFAULT 'READ_ONLY',
    "sync_config" JSONB NOT NULL DEFAULT '{}',
    "webhook_secret_encrypted" VARCHAR(500),
    "webhook_url" VARCHAR(500),
    "user_mapping_strategy" VARCHAR(20) NOT NULL DEFAULT 'email',
    "status" "ConnectorStatus" NOT NULL DEFAULT 'CONFIGURING',
    "last_sync_at" TIMESTAMP(3),
    "last_sync_status" VARCHAR(20),
    "last_sync_error" TEXT,
    "last_sync_ticket_count" INTEGER,
    "consecutive_errors" INTEGER NOT NULL DEFAULT 0,
    "error_threshold" INTEGER NOT NULL DEFAULT 5,
    "health_check_at" TIMESTAMP(3),
    "health_status" "HealthStatus" NOT NULL DEFAULT 'UNKNOWN',
    "avg_response_time_ms" INTEGER,
    "platform_version" VARCHAR(50),
    "capabilities" JSONB NOT NULL DEFAULT '[]',
    "configured_by" UUID NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "external_connectors_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "connector_field_mappings" (
    "id" UUID NOT NULL,
    "connector_id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "teki_field" VARCHAR(50) NOT NULL,
    "external_field" VARCHAR(100) NOT NULL,
    "value_mappings" JSONB NOT NULL,
    "reverse_mappings" JSONB,
    "transform_type" VARCHAR(20) NOT NULL DEFAULT 'direct',
    "transform_config" JSONB,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "connector_field_mappings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "connector_user_mappings" (
    "id" UUID NOT NULL,
    "connector_id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "teki_user_id" UUID NOT NULL,
    "external_user_id" VARCHAR(255) NOT NULL,
    "external_user_name" VARCHAR(200),
    "external_user_email" VARCHAR(255),
    "mapping_method" VARCHAR(20) NOT NULL DEFAULT 'email',
    "is_verified" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "connector_user_mappings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ticket_cache" (
    "id" UUID NOT NULL,
    "connector_id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "external_ticket_id" VARCHAR(255) NOT NULL,
    "external_ticket_number" VARCHAR(50),
    "external_url" VARCHAR(500),
    "title" VARCHAR(500),
    "description" TEXT,
    "status" VARCHAR(30),
    "priority" VARCHAR(20),
    "type" VARCHAR(30),
    "category" VARCHAR(100),
    "tags" JSONB NOT NULL DEFAULT '[]',
    "requester_name" VARCHAR(200),
    "requester_email" VARCHAR(255),
    "assigned_to_name" VARCHAR(200),
    "assigned_to_email" VARCHAR(255),
    "group_name" VARCHAR(100),
    "external_created_at" TIMESTAMP(3),
    "external_updated_at" TIMESTAMP(3),
    "external_resolved_at" TIMESTAMP(3),
    "external_closed_at" TIMESTAMP(3),
    "raw_data" JSONB,
    "custom_fields" JSONB NOT NULL DEFAULT '{}',
    "cached_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "cache_source" "CacheSource" NOT NULL DEFAULT 'POLL',
    "is_stale" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "ticket_cache_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ticket_annotations" (
    "id" UUID NOT NULL,
    "connector_id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "external_ticket_id" VARCHAR(255) NOT NULL,
    "ai_suggestions" JSONB NOT NULL DEFAULT '[]',
    "linked_kb_articles" JSONB NOT NULL DEFAULT '[]',
    "quick_notes" JSONB NOT NULL DEFAULT '[]',
    "teki_tags" JSONB NOT NULL DEFAULT '[]',
    "ai_category_suggestion" VARCHAR(100),
    "ai_category_confidence" DECIMAL(5,4),
    "ai_priority_suggestion" VARCHAR(20),
    "ai_priority_confidence" DECIMAL(5,4),
    "ai_auto_classified" BOOLEAN NOT NULL DEFAULT false,
    "conversation_count" INTEGER NOT NULL DEFAULT 0,
    "write_back_log" JSONB NOT NULL DEFAULT '[]',
    "first_ai_suggestion_at" TIMESTAMP(3),
    "total_ai_suggestions" INTEGER NOT NULL DEFAULT 0,
    "total_ai_cost_usd" DECIMAL(10,6) NOT NULL DEFAULT 0,
    "suggestions_accepted" INTEGER NOT NULL DEFAULT 0,
    "suggestions_rejected" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ticket_annotations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "connector_sync_log" (
    "id" UUID NOT NULL,
    "connector_id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "sync_type" "SyncType" NOT NULL,
    "status" "SyncLogStatus" NOT NULL,
    "tickets_fetched" INTEGER NOT NULL DEFAULT 0,
    "tickets_created" INTEGER NOT NULL DEFAULT 0,
    "tickets_updated" INTEGER NOT NULL DEFAULT 0,
    "tickets_stale" INTEGER NOT NULL DEFAULT 0,
    "duration_ms" INTEGER NOT NULL,
    "api_calls_made" INTEGER NOT NULL DEFAULT 0,
    "bytes_transferred" BIGINT NOT NULL DEFAULT 0,
    "error_message" TEXT,
    "error_details" JSONB,
    "write_back_count" INTEGER NOT NULL DEFAULT 0,
    "write_back_errors" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "connector_sync_log_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "nextauth_accounts" (
    "id" TEXT NOT NULL,
    "user_id" UUID NOT NULL,
    "type" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "provider_account_id" TEXT NOT NULL,
    "refresh_token" TEXT,
    "access_token" TEXT,
    "expires_at" INTEGER,
    "token_type" TEXT,
    "scope" TEXT,
    "id_token" TEXT,

    CONSTRAINT "nextauth_accounts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "nextauth_sessions" (
    "id" TEXT NOT NULL,
    "session_token" TEXT NOT NULL,
    "user_id" UUID NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "nextauth_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "verification_tokens" (
    "identifier" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL
);

-- CreateTable
CREATE TABLE "device_codes" (
    "id" TEXT NOT NULL,
    "user_code" TEXT NOT NULL,
    "device_code" TEXT NOT NULL,
    "user_id" UUID,
    "api_key_id" TEXT,
    "status" "DeviceCodeStatus" NOT NULL DEFAULT 'PENDING',
    "user_agent" TEXT,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "device_codes_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "tenants_slug_key" ON "tenants"("slug");

-- CreateIndex
CREATE INDEX "tenants_slug_idx" ON "tenants"("slug");

-- CreateIndex
CREATE INDEX "tenants_plan_status_idx" ON "tenants"("plan", "status");

-- CreateIndex
CREATE INDEX "tenants_status_idx" ON "tenants"("status");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_phone_key" ON "users"("phone");

-- CreateIndex
CREATE INDEX "users_email_idx" ON "users"("email");

-- CreateIndex
CREATE INDEX "users_status_idx" ON "users"("status");

-- CreateIndex
CREATE INDEX "users_created_at_idx" ON "users"("created_at" DESC);

-- CreateIndex
CREATE INDEX "users_last_login_at_idx" ON "users"("last_login_at" DESC);

-- CreateIndex
CREATE UNIQUE INDEX "user_credentials_user_id_key" ON "user_credentials"("user_id");

-- CreateIndex
CREATE INDEX "user_credentials_user_id_idx" ON "user_credentials"("user_id");

-- CreateIndex
CREATE INDEX "user_auth_providers_user_id_idx" ON "user_auth_providers"("user_id");

-- CreateIndex
CREATE INDEX "user_auth_providers_sso_tenant_id_idx" ON "user_auth_providers"("sso_tenant_id");

-- CreateIndex
CREATE UNIQUE INDEX "user_auth_providers_user_id_provider_provider_user_id_key" ON "user_auth_providers"("user_id", "provider", "provider_user_id");

-- CreateIndex
CREATE UNIQUE INDEX "user_auth_providers_provider_provider_user_id_key" ON "user_auth_providers"("provider", "provider_user_id");

-- CreateIndex
CREATE INDEX "tenant_members_tenant_id_status_idx" ON "tenant_members"("tenant_id", "status");

-- CreateIndex
CREATE INDEX "tenant_members_user_id_status_idx" ON "tenant_members"("user_id", "status");

-- CreateIndex
CREATE INDEX "tenant_members_tenant_id_role_idx" ON "tenant_members"("tenant_id", "role");

-- CreateIndex
CREATE INDEX "tenant_members_invite_token_hash_idx" ON "tenant_members"("invite_token_hash");

-- CreateIndex
CREATE INDEX "tenant_members_tenant_id_last_active_at_idx" ON "tenant_members"("tenant_id", "last_active_at" DESC);

-- CreateIndex
CREATE UNIQUE INDEX "tenant_members_tenant_id_user_id_key" ON "tenant_members"("tenant_id", "user_id");

-- CreateIndex
CREATE INDEX "user_preferences_user_id_idx" ON "user_preferences"("user_id");

-- CreateIndex
CREATE INDEX "user_preferences_user_id_tenant_id_idx" ON "user_preferences"("user_id", "tenant_id");

-- CreateIndex
CREATE UNIQUE INDEX "user_preferences_user_id_tenant_id_key" ON "user_preferences"("user_id", "tenant_id");

-- CreateIndex
CREATE INDEX "user_consents_user_id_purpose_created_at_idx" ON "user_consents"("user_id", "purpose", "created_at" DESC);

-- CreateIndex
CREATE INDEX "user_consents_purpose_granted_idx" ON "user_consents"("purpose", "granted");

-- CreateIndex
CREATE INDEX "user_consents_created_at_idx" ON "user_consents"("created_at" DESC);

-- CreateIndex
CREATE INDEX "data_access_log_subject_id_created_at_idx" ON "data_access_log"("subject_id", "created_at" DESC);

-- CreateIndex
CREATE INDEX "data_access_log_accessor_id_created_at_idx" ON "data_access_log"("accessor_id", "created_at" DESC);

-- CreateIndex
CREATE INDEX "data_access_log_action_created_at_idx" ON "data_access_log"("action", "created_at" DESC);

-- CreateIndex
CREATE UNIQUE INDEX "tenant_data_policies_tenant_id_key" ON "tenant_data_policies"("tenant_id");

-- CreateIndex
CREATE UNIQUE INDEX "user_sessions_token_hash_key" ON "user_sessions"("token_hash");

-- CreateIndex
CREATE UNIQUE INDEX "user_sessions_refresh_token_hash_key" ON "user_sessions"("refresh_token_hash");

-- CreateIndex
CREATE INDEX "user_sessions_user_id_is_active_idx" ON "user_sessions"("user_id", "is_active");

-- CreateIndex
CREATE INDEX "user_sessions_tenant_id_is_active_idx" ON "user_sessions"("tenant_id", "is_active");

-- CreateIndex
CREATE INDEX "user_sessions_expires_at_idx" ON "user_sessions"("expires_at");

-- CreateIndex
CREATE UNIQUE INDEX "ApiKey_keyHash_key" ON "ApiKey"("keyHash");

-- CreateIndex
CREATE INDEX "ApiKey_keyHash_idx" ON "ApiKey"("keyHash");

-- CreateIndex
CREATE INDEX "ApiKey_userId_idx" ON "ApiKey"("userId");

-- CreateIndex
CREATE INDEX "api_key_usage_logs_apiKeyId_createdAt_idx" ON "api_key_usage_logs"("apiKeyId", "createdAt" DESC);

-- CreateIndex
CREATE INDEX "api_key_usage_logs_userId_period_idx" ON "api_key_usage_logs"("userId", "period");

-- CreateIndex
CREATE INDEX "api_key_usage_logs_period_createdAt_idx" ON "api_key_usage_logs"("period", "createdAt" DESC);

-- CreateIndex
CREATE INDEX "ProviderKey_userId_idx" ON "ProviderKey"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "ProviderKey_userId_provider_key" ON "ProviderKey"("userId", "provider");

-- CreateIndex
CREATE INDEX "Agent_userId_idx" ON "Agent"("userId");

-- CreateIndex
CREATE INDEX "Document_agentId_idx" ON "Document"("agentId");

-- CreateIndex
CREATE INDEX "Document_userId_idx" ON "Document"("userId");

-- CreateIndex
CREATE INDEX "DocumentChunk_documentId_idx" ON "DocumentChunk"("documentId");

-- CreateIndex
CREATE INDEX "Channel_userId_idx" ON "Channel"("userId");

-- CreateIndex
CREATE INDEX "Channel_platform_status_idx" ON "Channel"("platform", "status");

-- CreateIndex
CREATE UNIQUE INDEX "Channel_userId_platform_displayName_key" ON "Channel"("userId", "platform", "displayName");

-- CreateIndex
CREATE INDEX "ChannelConversation_channelId_lastMessageAt_idx" ON "ChannelConversation"("channelId", "lastMessageAt");

-- CreateIndex
CREATE UNIQUE INDEX "ChannelConversation_channelId_externalUserId_key" ON "ChannelConversation"("channelId", "externalUserId");

-- CreateIndex
CREATE INDEX "ChannelMessage_conversationId_createdAt_idx" ON "ChannelMessage"("conversationId", "createdAt");

-- CreateIndex
CREATE INDEX "conversations_tenant_id_status_last_message_at_idx" ON "conversations"("tenant_id", "status", "last_message_at" DESC);

-- CreateIndex
CREATE INDEX "conversations_tenant_id_type_status_idx" ON "conversations"("tenant_id", "type", "status");

-- CreateIndex
CREATE INDEX "conversations_created_by_status_idx" ON "conversations"("created_by", "status");

-- CreateIndex
CREATE INDEX "conversation_participants_conversation_id_status_idx" ON "conversation_participants"("conversation_id", "status");

-- CreateIndex
CREATE INDEX "conversation_participants_user_id_status_idx" ON "conversation_participants"("user_id", "status");

-- CreateIndex
CREATE INDEX "conversation_participants_user_id_is_pinned_conversation_id_idx" ON "conversation_participants"("user_id", "is_pinned" DESC, "conversation_id");

-- CreateIndex
CREATE UNIQUE INDEX "conversation_participants_conversation_id_user_id_key" ON "conversation_participants"("conversation_id", "user_id");

-- CreateIndex
CREATE INDEX "messages_conversation_id_sequence_number_idx" ON "messages"("conversation_id", "sequence_number");

-- CreateIndex
CREATE INDEX "messages_conversation_id_created_at_idx" ON "messages"("conversation_id", "created_at" DESC);

-- CreateIndex
CREATE INDEX "messages_tenant_id_created_at_idx" ON "messages"("tenant_id", "created_at" DESC);

-- CreateIndex
CREATE INDEX "messages_sender_id_created_at_idx" ON "messages"("sender_id", "created_at" DESC);

-- CreateIndex
CREATE INDEX "messages_parent_message_id_idx" ON "messages"("parent_message_id");

-- CreateIndex
CREATE INDEX "messages_conversation_id_is_ai_generated_idx" ON "messages"("conversation_id", "is_ai_generated");

-- CreateIndex
CREATE INDEX "messages_conversation_id_is_pinned_idx" ON "messages"("conversation_id", "is_pinned");

-- CreateIndex
CREATE UNIQUE INDEX "message_ai_metadata_message_id_key" ON "message_ai_metadata"("message_id");

-- CreateIndex
CREATE INDEX "message_ai_metadata_conversation_id_created_at_idx" ON "message_ai_metadata"("conversation_id", "created_at" DESC);

-- CreateIndex
CREATE INDEX "message_ai_metadata_tenant_id_created_at_idx" ON "message_ai_metadata"("tenant_id", "created_at" DESC);

-- CreateIndex
CREATE INDEX "message_ai_metadata_provider_model_created_at_idx" ON "message_ai_metadata"("provider", "model", "created_at" DESC);

-- CreateIndex
CREATE INDEX "message_ai_metadata_was_fallback_idx" ON "message_ai_metadata"("was_fallback");

-- CreateIndex
CREATE INDEX "message_sources_message_id_idx" ON "message_sources"("message_id");

-- CreateIndex
CREATE INDEX "message_sources_conversation_id_idx" ON "message_sources"("conversation_id");

-- CreateIndex
CREATE INDEX "message_sources_source_type_reference_id_idx" ON "message_sources"("source_type", "reference_id");

-- CreateIndex
CREATE INDEX "message_feedback_message_id_idx" ON "message_feedback"("message_id");

-- CreateIndex
CREATE INDEX "message_feedback_conversation_id_idx" ON "message_feedback"("conversation_id");

-- CreateIndex
CREATE INDEX "message_feedback_tenant_id_created_at_idx" ON "message_feedback"("tenant_id", "created_at" DESC);

-- CreateIndex
CREATE INDEX "message_feedback_tenant_id_rating_created_at_idx" ON "message_feedback"("tenant_id", "rating", "created_at" DESC);

-- CreateIndex
CREATE INDEX "message_feedback_user_id_created_at_idx" ON "message_feedback"("user_id", "created_at" DESC);

-- CreateIndex
CREATE UNIQUE INDEX "message_feedback_message_id_user_id_key" ON "message_feedback"("message_id", "user_id");

-- CreateIndex
CREATE INDEX "message_attachments_message_id_idx" ON "message_attachments"("message_id");

-- CreateIndex
CREATE INDEX "message_attachments_conversation_id_idx" ON "message_attachments"("conversation_id");

-- CreateIndex
CREATE INDEX "message_attachments_tenant_id_created_at_idx" ON "message_attachments"("tenant_id", "created_at" DESC);

-- CreateIndex
CREATE INDEX "message_attachments_category_tenant_id_idx" ON "message_attachments"("category", "tenant_id");

-- CreateIndex
CREATE UNIQUE INDEX "conversation_tags_tenant_id_name_key" ON "conversation_tags"("tenant_id", "name");

-- CreateIndex
CREATE INDEX "conversation_tag_links_conversation_id_idx" ON "conversation_tag_links"("conversation_id");

-- CreateIndex
CREATE INDEX "conversation_tag_links_tag_id_idx" ON "conversation_tag_links"("tag_id");

-- CreateIndex
CREATE INDEX "UsageCounter_userId_period_idx" ON "UsageCounter"("userId", "period");

-- CreateIndex
CREATE UNIQUE INDEX "UsageCounter_userId_period_key" ON "UsageCounter"("userId", "period");

-- CreateIndex
CREATE INDEX "plan_history_userId_created_at_idx" ON "plan_history"("userId", "created_at" DESC);

-- CreateIndex
CREATE INDEX "WebhookEndpoint_userId_idx" ON "WebhookEndpoint"("userId");

-- CreateIndex
CREATE INDEX "WebhookLog_endpointId_createdAt_idx" ON "WebhookLog"("endpointId", "createdAt");

-- CreateIndex
CREATE INDEX "HttpRequestLog_createdAt_idx" ON "HttpRequestLog"("createdAt");

-- CreateIndex
CREATE INDEX "HttpRequestLog_path_createdAt_idx" ON "HttpRequestLog"("path", "createdAt");

-- CreateIndex
CREATE INDEX "KbCategory_userId_idx" ON "KbCategory"("userId");

-- CreateIndex
CREATE INDEX "KbCategory_parentId_idx" ON "KbCategory"("parentId");

-- CreateIndex
CREATE UNIQUE INDEX "KbCategory_userId_slug_key" ON "KbCategory"("userId", "slug");

-- CreateIndex
CREATE INDEX "KbArticle_userId_status_idx" ON "KbArticle"("userId", "status");

-- CreateIndex
CREATE INDEX "KbArticle_userId_categoryId_idx" ON "KbArticle"("userId", "categoryId");

-- CreateIndex
CREATE INDEX "KbArticle_createdAt_idx" ON "KbArticle"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "KbArticle_userId_slug_key" ON "KbArticle"("userId", "slug");

-- CreateIndex
CREATE INDEX "KbArticleAttachment_articleId_idx" ON "KbArticleAttachment"("articleId");

-- CreateIndex
CREATE INDEX "KbArticleAttachment_userId_idx" ON "KbArticleAttachment"("userId");

-- CreateIndex
CREATE INDEX "KbInsertionLog_userId_createdAt_idx" ON "KbInsertionLog"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "KbInsertionLog_insertionMode_createdAt_idx" ON "KbInsertionLog"("insertionMode", "createdAt");

-- CreateIndex
CREATE INDEX "sla_policies_tenant_id_is_default_idx" ON "sla_policies"("tenant_id", "is_default");

-- CreateIndex
CREATE INDEX "ticket_sla_tenant_id_first_response_breached_resolution_bre_idx" ON "ticket_sla"("tenant_id", "first_response_breached", "resolution_breached");

-- CreateIndex
CREATE INDEX "ticket_sla_first_response_target_at_resolution_target_at_idx" ON "ticket_sla"("first_response_target_at", "resolution_target_at");

-- CreateIndex
CREATE UNIQUE INDEX "ticket_sla_connector_id_external_ticket_id_key" ON "ticket_sla"("connector_id", "external_ticket_id");

-- CreateIndex
CREATE INDEX "notifications_recipient_id_is_read_created_at_idx" ON "notifications"("recipient_id", "is_read", "created_at" DESC);

-- CreateIndex
CREATE INDEX "notifications_recipient_id_created_at_idx" ON "notifications"("recipient_id", "created_at" DESC);

-- CreateIndex
CREATE INDEX "notifications_tenant_id_created_at_idx" ON "notifications"("tenant_id", "created_at" DESC);

-- CreateIndex
CREATE INDEX "notifications_recipient_id_type_created_at_idx" ON "notifications"("recipient_id", "type", "created_at" DESC);

-- CreateIndex
CREATE INDEX "notifications_resource_type_resource_id_idx" ON "notifications"("resource_type", "resource_id");

-- CreateIndex
CREATE INDEX "notifications_recipient_id_group_key_created_at_idx" ON "notifications"("recipient_id", "group_key", "created_at" DESC);

-- CreateIndex
CREATE INDEX "notifications_expires_at_idx" ON "notifications"("expires_at");

-- CreateIndex
CREATE INDEX "notification_preferences_override_user_id_tenant_id_idx" ON "notification_preferences_override"("user_id", "tenant_id");

-- CreateIndex
CREATE UNIQUE INDEX "notification_preferences_override_user_id_tenant_id_notific_key" ON "notification_preferences_override"("user_id", "tenant_id", "notification_type");

-- CreateIndex
CREATE INDEX "ai_provider_configs_tenant_id_is_active_priority_order_idx" ON "ai_provider_configs"("tenant_id", "is_active", "priority_order");

-- CreateIndex
CREATE UNIQUE INDEX "ai_provider_configs_tenant_id_provider_key" ON "ai_provider_configs"("tenant_id", "provider");

-- CreateIndex
CREATE UNIQUE INDEX "ai_provider_configs_tenant_id_priority_order_key" ON "ai_provider_configs"("tenant_id", "priority_order");

-- CreateIndex
CREATE INDEX "ai_usage_daily_tenant_id_usage_date_idx" ON "ai_usage_daily"("tenant_id", "usage_date" DESC);

-- CreateIndex
CREATE INDEX "ai_usage_daily_provider_model_usage_date_idx" ON "ai_usage_daily"("provider", "model", "usage_date" DESC);

-- CreateIndex
CREATE UNIQUE INDEX "ai_usage_daily_tenant_id_provider_model_usage_date_key" ON "ai_usage_daily"("tenant_id", "provider", "model", "usage_date");

-- CreateIndex
CREATE UNIQUE INDEX "ai_routing_rules_tenant_id_key" ON "ai_routing_rules"("tenant_id");

-- CreateIndex
CREATE INDEX "response_templates_tenant_id_status_category_idx" ON "response_templates"("tenant_id", "status", "category");

-- CreateIndex
CREATE INDEX "response_templates_tenant_id_scope_status_idx" ON "response_templates"("tenant_id", "scope", "status");

-- CreateIndex
CREATE INDEX "response_templates_tenant_id_shortcut_idx" ON "response_templates"("tenant_id", "shortcut");

-- CreateIndex
CREATE INDEX "response_templates_tenant_id_usage_count_idx" ON "response_templates"("tenant_id", "usage_count" DESC);

-- CreateIndex
CREATE UNIQUE INDEX "response_templates_tenant_id_shortcut_key" ON "response_templates"("tenant_id", "shortcut");

-- CreateIndex
CREATE INDEX "template_usage_log_template_id_created_at_idx" ON "template_usage_log"("template_id", "created_at" DESC);

-- CreateIndex
CREATE INDEX "template_usage_log_user_id_created_at_idx" ON "template_usage_log"("user_id", "created_at" DESC);

-- CreateIndex
CREATE INDEX "template_usage_log_tenant_id_created_at_idx" ON "template_usage_log"("tenant_id", "created_at" DESC);

-- CreateIndex
CREATE INDEX "external_connectors_tenant_id_status_idx" ON "external_connectors"("tenant_id", "status");

-- CreateIndex
CREATE INDEX "external_connectors_platform_status_idx" ON "external_connectors"("platform", "status");

-- CreateIndex
CREATE INDEX "connector_field_mappings_connector_id_idx" ON "connector_field_mappings"("connector_id");

-- CreateIndex
CREATE UNIQUE INDEX "connector_field_mappings_connector_id_teki_field_key" ON "connector_field_mappings"("connector_id", "teki_field");

-- CreateIndex
CREATE INDEX "connector_user_mappings_connector_id_idx" ON "connector_user_mappings"("connector_id");

-- CreateIndex
CREATE INDEX "connector_user_mappings_teki_user_id_idx" ON "connector_user_mappings"("teki_user_id");

-- CreateIndex
CREATE INDEX "connector_user_mappings_connector_id_external_user_id_idx" ON "connector_user_mappings"("connector_id", "external_user_id");

-- CreateIndex
CREATE UNIQUE INDEX "connector_user_mappings_connector_id_teki_user_id_key" ON "connector_user_mappings"("connector_id", "teki_user_id");

-- CreateIndex
CREATE UNIQUE INDEX "connector_user_mappings_connector_id_external_user_id_key" ON "connector_user_mappings"("connector_id", "external_user_id");

-- CreateIndex
CREATE INDEX "ticket_cache_tenant_id_status_priority_idx" ON "ticket_cache"("tenant_id", "status", "priority");

-- CreateIndex
CREATE INDEX "ticket_cache_connector_id_cached_at_idx" ON "ticket_cache"("connector_id", "cached_at" DESC);

-- CreateIndex
CREATE INDEX "ticket_cache_expires_at_idx" ON "ticket_cache"("expires_at");

-- CreateIndex
CREATE INDEX "ticket_cache_connector_id_external_ticket_id_idx" ON "ticket_cache"("connector_id", "external_ticket_id");

-- CreateIndex
CREATE INDEX "ticket_cache_assigned_to_email_status_idx" ON "ticket_cache"("assigned_to_email", "status");

-- CreateIndex
CREATE INDEX "ticket_cache_tenant_id_status_idx" ON "ticket_cache"("tenant_id", "status");

-- CreateIndex
CREATE UNIQUE INDEX "ticket_cache_connector_id_external_ticket_id_key" ON "ticket_cache"("connector_id", "external_ticket_id");

-- CreateIndex
CREATE INDEX "ticket_annotations_tenant_id_created_at_idx" ON "ticket_annotations"("tenant_id", "created_at" DESC);

-- CreateIndex
CREATE INDEX "ticket_annotations_connector_id_external_ticket_id_idx" ON "ticket_annotations"("connector_id", "external_ticket_id");

-- CreateIndex
CREATE INDEX "ticket_annotations_tenant_id_total_ai_suggestions_idx" ON "ticket_annotations"("tenant_id", "total_ai_suggestions" DESC);

-- CreateIndex
CREATE UNIQUE INDEX "ticket_annotations_connector_id_external_ticket_id_key" ON "ticket_annotations"("connector_id", "external_ticket_id");

-- CreateIndex
CREATE INDEX "connector_sync_log_connector_id_created_at_idx" ON "connector_sync_log"("connector_id", "created_at" DESC);

-- CreateIndex
CREATE INDEX "connector_sync_log_connector_id_status_created_at_idx" ON "connector_sync_log"("connector_id", "status", "created_at" DESC);

-- CreateIndex
CREATE INDEX "nextauth_accounts_user_id_idx" ON "nextauth_accounts"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "nextauth_accounts_provider_provider_account_id_key" ON "nextauth_accounts"("provider", "provider_account_id");

-- CreateIndex
CREATE UNIQUE INDEX "nextauth_sessions_session_token_key" ON "nextauth_sessions"("session_token");

-- CreateIndex
CREATE INDEX "nextauth_sessions_user_id_idx" ON "nextauth_sessions"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "verification_tokens_token_key" ON "verification_tokens"("token");

-- CreateIndex
CREATE UNIQUE INDEX "verification_tokens_identifier_token_key" ON "verification_tokens"("identifier", "token");

-- CreateIndex
CREATE UNIQUE INDEX "device_codes_user_code_key" ON "device_codes"("user_code");

-- CreateIndex
CREATE UNIQUE INDEX "device_codes_device_code_key" ON "device_codes"("device_code");

-- CreateIndex
CREATE INDEX "device_codes_device_code_idx" ON "device_codes"("device_code");

-- CreateIndex
CREATE INDEX "device_codes_user_code_idx" ON "device_codes"("user_code");

-- AddForeignKey
ALTER TABLE "user_credentials" ADD CONSTRAINT "user_credentials_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_auth_providers" ADD CONSTRAINT "user_auth_providers_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tenant_members" ADD CONSTRAINT "tenant_members_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tenant_members" ADD CONSTRAINT "tenant_members_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tenant_members" ADD CONSTRAINT "tenant_members_invited_by_fkey" FOREIGN KEY ("invited_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_preferences" ADD CONSTRAINT "user_preferences_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_preferences" ADD CONSTRAINT "user_preferences_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_consents" ADD CONSTRAINT "user_consents_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "data_access_log" ADD CONSTRAINT "data_access_log_subject_id_fkey" FOREIGN KEY ("subject_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tenant_data_policies" ADD CONSTRAINT "tenant_data_policies_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_sessions" ADD CONSTRAINT "user_sessions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_sessions" ADD CONSTRAINT "user_sessions_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ApiKey" ADD CONSTRAINT "ApiKey_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "api_key_usage_logs" ADD CONSTRAINT "api_key_usage_logs_apiKeyId_fkey" FOREIGN KEY ("apiKeyId") REFERENCES "ApiKey"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "api_key_usage_logs" ADD CONSTRAINT "api_key_usage_logs_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProviderKey" ADD CONSTRAINT "ProviderKey_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Agent" ADD CONSTRAINT "Agent_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Document" ADD CONSTRAINT "Document_agentId_fkey" FOREIGN KEY ("agentId") REFERENCES "Agent"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Document" ADD CONSTRAINT "Document_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DocumentChunk" ADD CONSTRAINT "DocumentChunk_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "Document"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Channel" ADD CONSTRAINT "Channel_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Channel" ADD CONSTRAINT "Channel_agentId_fkey" FOREIGN KEY ("agentId") REFERENCES "Agent"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChannelConversation" ADD CONSTRAINT "ChannelConversation_channelId_fkey" FOREIGN KEY ("channelId") REFERENCES "Channel"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChannelMessage" ADD CONSTRAINT "ChannelMessage_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "ChannelConversation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "conversations" ADD CONSTRAINT "conversations_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "conversations" ADD CONSTRAINT "conversations_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "conversation_participants" ADD CONSTRAINT "conversation_participants_conversation_id_fkey" FOREIGN KEY ("conversation_id") REFERENCES "conversations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "conversation_participants" ADD CONSTRAINT "conversation_participants_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "messages" ADD CONSTRAINT "messages_conversation_id_fkey" FOREIGN KEY ("conversation_id") REFERENCES "conversations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "messages" ADD CONSTRAINT "messages_sender_id_fkey" FOREIGN KEY ("sender_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "messages" ADD CONSTRAINT "messages_parent_message_id_fkey" FOREIGN KEY ("parent_message_id") REFERENCES "messages"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "message_ai_metadata" ADD CONSTRAINT "message_ai_metadata_message_id_fkey" FOREIGN KEY ("message_id") REFERENCES "messages"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "message_sources" ADD CONSTRAINT "message_sources_message_id_fkey" FOREIGN KEY ("message_id") REFERENCES "messages"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "message_feedback" ADD CONSTRAINT "message_feedback_message_id_fkey" FOREIGN KEY ("message_id") REFERENCES "messages"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "message_feedback" ADD CONSTRAINT "message_feedback_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "message_attachments" ADD CONSTRAINT "message_attachments_message_id_fkey" FOREIGN KEY ("message_id") REFERENCES "messages"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "message_attachments" ADD CONSTRAINT "message_attachments_uploaded_by_fkey" FOREIGN KEY ("uploaded_by") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "conversation_tags" ADD CONSTRAINT "conversation_tags_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "conversation_tags" ADD CONSTRAINT "conversation_tags_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "conversation_tag_links" ADD CONSTRAINT "conversation_tag_links_conversation_id_fkey" FOREIGN KEY ("conversation_id") REFERENCES "conversations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "conversation_tag_links" ADD CONSTRAINT "conversation_tag_links_tag_id_fkey" FOREIGN KEY ("tag_id") REFERENCES "conversation_tags"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "conversation_tag_links" ADD CONSTRAINT "conversation_tag_links_added_by_fkey" FOREIGN KEY ("added_by") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UsageCounter" ADD CONSTRAINT "UsageCounter_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "plan_history" ADD CONSTRAINT "plan_history_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WebhookEndpoint" ADD CONSTRAINT "WebhookEndpoint_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WebhookLog" ADD CONSTRAINT "WebhookLog_endpointId_fkey" FOREIGN KEY ("endpointId") REFERENCES "WebhookEndpoint"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "KbCategory" ADD CONSTRAINT "KbCategory_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "KbCategory" ADD CONSTRAINT "KbCategory_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "KbCategory"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "KbArticle" ADD CONSTRAINT "KbArticle_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "KbArticle" ADD CONSTRAINT "KbArticle_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "KbCategory"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "KbArticleAttachment" ADD CONSTRAINT "KbArticleAttachment_articleId_fkey" FOREIGN KEY ("articleId") REFERENCES "KbArticle"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "KbInsertionLog" ADD CONSTRAINT "KbInsertionLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "KbInsertionLog" ADD CONSTRAINT "KbInsertionLog_articleId_fkey" FOREIGN KEY ("articleId") REFERENCES "KbArticle"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sla_policies" ADD CONSTRAINT "sla_policies_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ticket_sla" ADD CONSTRAINT "ticket_sla_connector_id_fkey" FOREIGN KEY ("connector_id") REFERENCES "external_connectors"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ticket_sla" ADD CONSTRAINT "ticket_sla_sla_policy_id_fkey" FOREIGN KEY ("sla_policy_id") REFERENCES "sla_policies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_recipient_id_fkey" FOREIGN KEY ("recipient_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_actor_id_fkey" FOREIGN KEY ("actor_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notification_preferences_override" ADD CONSTRAINT "notification_preferences_override_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notification_preferences_override" ADD CONSTRAINT "notification_preferences_override_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ai_provider_configs" ADD CONSTRAINT "ai_provider_configs_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ai_provider_configs" ADD CONSTRAINT "ai_provider_configs_configured_by_fkey" FOREIGN KEY ("configured_by") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ai_usage_daily" ADD CONSTRAINT "ai_usage_daily_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ai_routing_rules" ADD CONSTRAINT "ai_routing_rules_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "response_templates" ADD CONSTRAINT "response_templates_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "response_templates" ADD CONSTRAINT "response_templates_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "response_templates" ADD CONSTRAINT "response_templates_updated_by_fkey" FOREIGN KEY ("updated_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "response_templates" ADD CONSTRAINT "response_templates_last_used_by_fkey" FOREIGN KEY ("last_used_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "template_usage_log" ADD CONSTRAINT "template_usage_log_template_id_fkey" FOREIGN KEY ("template_id") REFERENCES "response_templates"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "template_usage_log" ADD CONSTRAINT "template_usage_log_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "template_usage_log" ADD CONSTRAINT "template_usage_log_conversation_id_fkey" FOREIGN KEY ("conversation_id") REFERENCES "conversations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "template_usage_log" ADD CONSTRAINT "template_usage_log_message_id_fkey" FOREIGN KEY ("message_id") REFERENCES "messages"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "external_connectors" ADD CONSTRAINT "external_connectors_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "external_connectors" ADD CONSTRAINT "external_connectors_configured_by_fkey" FOREIGN KEY ("configured_by") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "connector_field_mappings" ADD CONSTRAINT "connector_field_mappings_connector_id_fkey" FOREIGN KEY ("connector_id") REFERENCES "external_connectors"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "connector_user_mappings" ADD CONSTRAINT "connector_user_mappings_connector_id_fkey" FOREIGN KEY ("connector_id") REFERENCES "external_connectors"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "connector_user_mappings" ADD CONSTRAINT "connector_user_mappings_teki_user_id_fkey" FOREIGN KEY ("teki_user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ticket_cache" ADD CONSTRAINT "ticket_cache_connector_id_fkey" FOREIGN KEY ("connector_id") REFERENCES "external_connectors"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ticket_annotations" ADD CONSTRAINT "ticket_annotations_connector_id_fkey" FOREIGN KEY ("connector_id") REFERENCES "external_connectors"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "connector_sync_log" ADD CONSTRAINT "connector_sync_log_connector_id_fkey" FOREIGN KEY ("connector_id") REFERENCES "external_connectors"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "nextauth_accounts" ADD CONSTRAINT "nextauth_accounts_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "nextauth_sessions" ADD CONSTRAINT "nextauth_sessions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "device_codes" ADD CONSTRAINT "device_codes_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
