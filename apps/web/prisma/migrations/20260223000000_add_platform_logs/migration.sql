-- CreateEnum
CREATE TYPE "LogCategory" AS ENUM ('AUDIT', 'AI', 'SECURITY', 'SYSTEM');

-- CreateEnum
CREATE TYPE "LogSeverity" AS ENUM ('DEBUG', 'INFO', 'WARN', 'ERROR', 'CRITICAL');

-- CreateTable
CREATE TABLE "PlatformLog" (
    "id" TEXT NOT NULL,
    "category" "LogCategory" NOT NULL,
    "eventType" VARCHAR(100) NOT NULL,
    "severity" "LogSeverity" NOT NULL DEFAULT 'INFO',
    "tenantId" TEXT,
    "userId" TEXT,
    "userEmail" VARCHAR(200),
    "userName" VARCHAR(200),
    "entityType" VARCHAR(50),
    "entityId" VARCHAR(100),
    "action" VARCHAR(50),
    "summary" VARCHAR(500) NOT NULL,
    "details" JSONB,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "device" VARCHAR(100),
    "geoCountry" VARCHAR(5),
    "geoCity" VARCHAR(100),
    "requestMethod" VARCHAR(10),
    "requestPath" VARCHAR(500),
    "requestId" VARCHAR(50),
    "sessionId" VARCHAR(100),
    "durationMs" INTEGER,
    "statusCode" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3),

    CONSTRAINT "PlatformLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex: category + date (main query pattern)
CREATE INDEX "PlatformLog_category_createdAt_idx" ON "PlatformLog"("category", "createdAt" DESC);

-- CreateIndex: tenant
CREATE INDEX "PlatformLog_tenantId_createdAt_idx" ON "PlatformLog"("tenantId", "createdAt" DESC);

-- CreateIndex: user
CREATE INDEX "PlatformLog_userId_createdAt_idx" ON "PlatformLog"("userId", "createdAt" DESC);

-- CreateIndex: event type
CREATE INDEX "PlatformLog_eventType_createdAt_idx" ON "PlatformLog"("eventType", "createdAt" DESC);

-- CreateIndex: severity (for alerts)
CREATE INDEX "PlatformLog_severity_createdAt_idx" ON "PlatformLog"("severity", "createdAt" DESC);

-- CreateIndex: entity
CREATE INDEX "PlatformLog_entityType_entityId_createdAt_idx" ON "PlatformLog"("entityType", "entityId", "createdAt" DESC);

-- CreateIndex: expiration (for cleanup job)
CREATE INDEX "PlatformLog_expiresAt_idx" ON "PlatformLog"("expiresAt");

-- CreateIndex: full-text search on summary
CREATE INDEX "PlatformLog_summary_search_idx" ON "PlatformLog" USING GIN(to_tsvector('portuguese', "summary"));

-- CreateIndex: JSONB details search
CREATE INDEX "PlatformLog_details_idx" ON "PlatformLog" USING GIN("details" jsonb_path_ops);
