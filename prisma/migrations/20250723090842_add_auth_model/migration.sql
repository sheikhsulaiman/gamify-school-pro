/*
  Warnings:

  - You are about to drop the `CurrentLesson` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `GameModule` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Lesson` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `MatchingPairs` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `MultipleChoiceQuestion` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Progress` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `RearrangeChallenge` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `course` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "CurrentLesson" DROP CONSTRAINT "CurrentLesson_courseId_fkey";

-- DropForeignKey
ALTER TABLE "CurrentLesson" DROP CONSTRAINT "CurrentLesson_lessonId_fkey";

-- DropForeignKey
ALTER TABLE "CurrentLesson" DROP CONSTRAINT "CurrentLesson_userId_fkey";

-- DropForeignKey
ALTER TABLE "GameModule" DROP CONSTRAINT "GameModule_lessonId_fkey";

-- DropForeignKey
ALTER TABLE "Lesson" DROP CONSTRAINT "Lesson_courseId_fkey";

-- DropForeignKey
ALTER TABLE "MatchingPairs" DROP CONSTRAINT "MatchingPairs_gameId_fkey";

-- DropForeignKey
ALTER TABLE "MultipleChoiceQuestion" DROP CONSTRAINT "MultipleChoiceQuestion_gameId_fkey";

-- DropForeignKey
ALTER TABLE "Progress" DROP CONSTRAINT "Progress_courseId_fkey";

-- DropForeignKey
ALTER TABLE "Progress" DROP CONSTRAINT "Progress_lessonId_fkey";

-- DropForeignKey
ALTER TABLE "Progress" DROP CONSTRAINT "Progress_userId_fkey";

-- DropForeignKey
ALTER TABLE "RearrangeChallenge" DROP CONSTRAINT "RearrangeChallenge_gameId_fkey";

-- DropTable
DROP TABLE "CurrentLesson";

-- DropTable
DROP TABLE "GameModule";

-- DropTable
DROP TABLE "Lesson";

-- DropTable
DROP TABLE "MatchingPairs";

-- DropTable
DROP TABLE "MultipleChoiceQuestion";

-- DropTable
DROP TABLE "Progress";

-- DropTable
DROP TABLE "RearrangeChallenge";

-- DropTable
DROP TABLE "course";

-- DropEnum
DROP TYPE "GameType";
