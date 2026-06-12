-- CreateEnum
CREATE TYPE "SttPolicyType" AS ENUM ('LOCAL_ONLY', 'HYBRID');

-- CreateEnum
CREATE TYPE "VoiceSessionStatus" AS ENUM ('ACTIVE', 'ENDED');

-- CreateEnum
CREATE TYPE "SttOriginType" AS ENUM ('LOCAL', 'CLOUD');

-- CreateTable
CREATE TABLE "audit_log" (
    "id" UUID NOT NULL,
    "tenant_id" UUID,
    "user_id" UUID,
    "action" VARCHAR(100) NOT NULL,
    "resource" VARCHAR(200),
    "details" JSONB,
    "ip_address" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_log_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tenant_voice_configs" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "stt_policy" "SttPolicyType" NOT NULL DEFAULT 'LOCAL_ONLY',
    "cloud_opt_in" BOOLEAN NOT NULL DEFAULT false,
    "persist_transcripts" BOOLEAN NOT NULL DEFAULT false,
    "transcript_retention_hours" INTEGER NOT NULL DEFAULT 24,
    "trigger_threshold" DOUBLE PRECISION,
    "context_window_sec" INTEGER,
    "cooldown_sec" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tenant_voice_configs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "voice_sessions" (
    "id" UUID NOT NULL,
    "tenant_id" UUID,
    "user_id" UUID NOT NULL,
    "agent_id" TEXT,
    "status" "VoiceSessionStatus" NOT NULL DEFAULT 'ACTIVE',
    "period" VARCHAR(7) NOT NULL,
    "started_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ended_at" TIMESTAMP(3),
    "duration_seconds" INTEGER NOT NULL DEFAULT 0,
    "utterance_count" INTEGER NOT NULL DEFAULT 0,
    "cloud_fallback_count" INTEGER NOT NULL DEFAULT 0,
    "suggestions_surfaced" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "voice_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "voice_transcript_segments" (
    "id" UUID NOT NULL,
    "session_id" UUID NOT NULL,
    "text" TEXT NOT NULL,
    "origin" "SttOriginType" NOT NULL,
    "provider_id" VARCHAR(50) NOT NULL,
    "confidence" DOUBLE PRECISION,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expires_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "voice_transcript_segments_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "audit_log_tenant_id_action_created_at_idx" ON "audit_log"("tenant_id", "action", "created_at" DESC);

-- CreateIndex
CREATE INDEX "audit_log_user_id_created_at_idx" ON "audit_log"("user_id", "created_at" DESC);

-- CreateIndex
CREATE INDEX "audit_log_action_created_at_idx" ON "audit_log"("action", "created_at" DESC);

-- CreateIndex
CREATE UNIQUE INDEX "tenant_voice_configs_tenant_id_key" ON "tenant_voice_configs"("tenant_id");

-- CreateIndex
CREATE INDEX "voice_sessions_user_id_period_idx" ON "voice_sessions"("user_id", "period");

-- CreateIndex
CREATE INDEX "voice_sessions_tenant_id_started_at_idx" ON "voice_sessions"("tenant_id", "started_at" DESC);

-- CreateIndex
CREATE INDEX "voice_sessions_status_idx" ON "voice_sessions"("status");

-- CreateIndex
CREATE INDEX "voice_transcript_segments_session_id_created_at_idx" ON "voice_transcript_segments"("session_id", "created_at");

-- CreateIndex
CREATE INDEX "voice_transcript_segments_expires_at_idx" ON "voice_transcript_segments"("expires_at");

-- AddForeignKey
ALTER TABLE "tenant_voice_configs" ADD CONSTRAINT "tenant_voice_configs_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "voice_transcript_segments" ADD CONSTRAINT "voice_transcript_segments_session_id_fkey" FOREIGN KEY ("session_id") REFERENCES "voice_sessions"("id") ON DELETE CASCADE ON UPDATE CASCADE;
