-- CreateTable
CREATE TABLE "Monitor" (
    "id" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "method" TEXT NOT NULL,
    "intervalSeconds" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'up',
    "uptimePercent" DOUBLE PRECISION NOT NULL DEFAULT 100,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Monitor_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PingLog" (
    "id" TEXT NOT NULL,
    "monitorId" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "latencyMs" INTEGER NOT NULL,
    "statusCode" INTEGER NOT NULL,

    CONSTRAINT "PingLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WebhookEvent" (
    "id" TEXT NOT NULL,
    "monitorSlug" TEXT NOT NULL,
    "method" TEXT NOT NULL,
    "headers" JSONB NOT NULL,
    "body" JSONB NOT NULL,
    "signatureValid" BOOLEAN NOT NULL,
    "receivedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "anomalyFlags" TEXT[],

    CONSTRAINT "WebhookEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AIAnalysis" (
    "id" TEXT NOT NULL,
    "relatedEventId" TEXT,
    "summary" TEXT NOT NULL,
    "probableCause" TEXT NOT NULL,
    "steps" TEXT[],
    "codeFix" TEXT,

    CONSTRAINT "AIAnalysis_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "PingLog" ADD CONSTRAINT "PingLog_monitorId_fkey" FOREIGN KEY ("monitorId") REFERENCES "Monitor"("id") ON DELETE CASCADE ON UPDATE CASCADE;
