-- AlterTable
ALTER TABLE "public"."IndustryInsight" ALTER COLUMN "demandLevel" SET DEFAULT 'MEDIUM',
ALTER COLUMN "marketOutlook" SET DEFAULT 'NEUTRAL';

-- CreateTable
CREATE TABLE "public"."VoiceInterview" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "jobPosition" TEXT NOT NULL,
    "jobDescription" TEXT NOT NULL,
    "duration" INTEGER NOT NULL,
    "questionsList" JSONB[],
    "userAnswers" JSONB,
    "feedback" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "VoiceInterview_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "VoiceInterview_userId_idx" ON "public"."VoiceInterview"("userId");

-- AddForeignKey
ALTER TABLE "public"."VoiceInterview" ADD CONSTRAINT "VoiceInterview_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
