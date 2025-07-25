-- CreateEnum
CREATE TYPE "LevelType" AS ENUM ('MATCHING', 'MCQ', 'REARRANGE');

-- CreateEnum
CREATE TYPE "MColumn" AS ENUM ('LEFT', 'RIGHT');

-- CreateTable
CREATE TABLE "course" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "course_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "level" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "leftColId" TEXT,
    "rightColId" TEXT,
    "mcqid" TEXT,
    "rearrangeId" TEXT,
    "type" "LevelType" NOT NULL,
    "courseId" TEXT NOT NULL,

    CONSTRAINT "level_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "mcq" (
    "id" TEXT NOT NULL,
    "question" TEXT NOT NULL,
    "options" TEXT[],
    "answer" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "mcq_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Rearrange" (
    "id" TEXT NOT NULL,
    "prompt" TEXT NOT NULL,
    "items" TEXT[],
    "correctOrder" TEXT[],

    CONSTRAINT "Rearrange_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "match_pairs" (
    "id" TEXT NOT NULL,
    "column" "MColumn" NOT NULL,
    "text" TEXT NOT NULL,
    "matchId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "match_pairs_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "level" ADD CONSTRAINT "level_leftColId_fkey" FOREIGN KEY ("leftColId") REFERENCES "match_pairs"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "level" ADD CONSTRAINT "level_rightColId_fkey" FOREIGN KEY ("rightColId") REFERENCES "match_pairs"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "level" ADD CONSTRAINT "level_mcqid_fkey" FOREIGN KEY ("mcqid") REFERENCES "mcq"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "level" ADD CONSTRAINT "level_rearrangeId_fkey" FOREIGN KEY ("rearrangeId") REFERENCES "Rearrange"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "level" ADD CONSTRAINT "level_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "course"("id") ON DELETE CASCADE ON UPDATE CASCADE;
