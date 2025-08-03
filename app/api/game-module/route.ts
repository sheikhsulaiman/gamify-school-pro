import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/server";
import { GameType } from "@/lib/generated/prisma";

export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session?.user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const lessonId = searchParams.get("lessonId");
  if (!lessonId)
    return NextResponse.json({ error: "Missing lessonId" }, { status: 400 });

  const modules = await prisma.gameModule.findMany({
    where: { lessonId },
    include: {
      rearrangeChallenge: true,
      mcq: true,
      matching: true,
    },
  });

  return NextResponse.json(modules);
}

// Types for request payloads
interface BaseGameModuleRequest {
  lessonId: string;
  type: GameType;
  title: string;
  order?: number;
  xpReward?: number;
}

interface MCQGameModuleRequest extends BaseGameModuleRequest {
  type: "MCQ";
  gameData: {
    question: string;
    options: string[];
    correct: number;
  };
}

interface RearrangeGameModuleRequest extends BaseGameModuleRequest {
  type: "REARRANGE";
  gameData: {
    prompt: string;
    items: string[];
    correctOrder: string[];
  };
}

interface MatchingGameModuleRequest extends BaseGameModuleRequest {
  type: "MATCHING";
  gameData: {
    prompt: string;
    leftItems: string[];
    rightItems: string[];
    correctPairs: Record<string, string>;
  };
}

type CreateGameModuleRequest =
  | MCQGameModuleRequest
  | RearrangeGameModuleRequest
  | MatchingGameModuleRequest;

// POST /api/game-modules
export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session?.user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body: CreateGameModuleRequest = await request.json();

    // Validate required fields
    const { lessonId, type, title, gameData } = body;

    if (!lessonId || !type || !title || !gameData) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing required fields: lessonId, type, title, gameData",
        },
        { status: 400 }
      );
    }

    // Validate GameType
    if (!Object.values(GameType).includes(type)) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid game type. Must be MCQ, REARRANGE, or MATCHING",
        },
        { status: 400 }
      );
    }

    // Check if lesson exists
    const lesson = await prisma.lesson.findUnique({
      where: { id: lessonId },
    });

    if (!lesson) {
      return NextResponse.json(
        {
          success: false,
          error: "Lesson not found",
        },
        { status: 404 }
      );
    }

    // Get the next order number for this lesson
    const lastModule = await prisma.gameModule.findFirst({
      where: { lessonId },
      orderBy: { order: "desc" },
    });

    const order = body.order ?? (lastModule ? lastModule.order + 1 : 1);

    // Validate game-specific data
    const validationResult = validateGameData(type, gameData);
    if (!validationResult.isValid) {
      return NextResponse.json(
        {
          success: false,
          error: validationResult.error,
        },
        { status: 400 }
      );
    }

    // Create the game module with specific game type data
    const result = await prisma.$transaction(async (tx) => {
      // Create the game module first
      const gameModule = await tx.gameModule.create({
        data: {
          type,
          title,
          lessonId,
          order,
          xpReward: body.xpReward || 0,
        },
      });

      // Create the specific game type record
      switch (type) {
        case "MCQ":
          const mcqData = gameData as MCQGameModuleRequest["gameData"];
          await tx.multipleChoiceQuestion.create({
            data: {
              question: mcqData.question,
              options: mcqData.options,
              correct: mcqData.correct,
              gameId: gameModule.id,
            },
          });
          break;

        case "REARRANGE":
          const rearrangeData =
            gameData as RearrangeGameModuleRequest["gameData"];
          await tx.rearrangeChallenge.create({
            data: {
              prompt: rearrangeData.prompt,
              items: rearrangeData.items,
              correctOrder: rearrangeData.correctOrder,
              gameId: gameModule.id,
            },
          });
          break;

        case "MATCHING":
          const matchingData =
            gameData as MatchingGameModuleRequest["gameData"];
          await tx.matchingPairs.create({
            data: {
              prompt: matchingData.prompt,
              leftItems: matchingData.leftItems,
              rightItems: matchingData.rightItems,
              correctPairs: matchingData.correctPairs,
              gameId: gameModule.id,
            },
          });
          break;
      }

      // Return the complete game module with related data
      return await tx.gameModule.findUnique({
        where: { id: gameModule.id },
        include: {
          lesson: true,
          rearrangeChallenge: true,
          mcq: true,
          matching: true,
        },
      });
    });

    return NextResponse.json(
      {
        success: true,
        data: result,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating game module:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to create game module",
      },
      { status: 500 }
    );
  }
}

// Validation helper function
function validateGameData(
  type: GameType,
  gameData: any
): { isValid: boolean; error?: string } {
  switch (type) {
    case "MCQ":
      const { question, options, correct } = gameData;
      if (!question || !options || correct === undefined) {
        return {
          isValid: false,
          error: "MCQ requires: question, options, correct",
        };
      }
      if (!Array.isArray(options) || options.length < 2) {
        return {
          isValid: false,
          error: "MCQ options must be an array with at least 2 items",
        };
      }
      if (
        typeof correct !== "number" ||
        correct < 0 ||
        correct >= options.length
      ) {
        return {
          isValid: false,
          error: "MCQ correct must be a valid index within options",
        };
      }
      break;

    case "REARRANGE":
      const { prompt, items, correctOrder } = gameData;
      if (!prompt || !items || !correctOrder) {
        return {
          isValid: false,
          error: "Rearrange requires: prompt, items, correctOrder",
        };
      }
      if (!Array.isArray(items) || !Array.isArray(correctOrder)) {
        return {
          isValid: false,
          error: "Rearrange items and correctOrder must be arrays",
        };
      }
      if (items.length !== correctOrder.length) {
        return {
          isValid: false,
          error: "Rearrange items and correctOrder must have same length",
        };
      }
      break;

    case "MATCHING":
      const {
        prompt: matchPrompt,
        leftItems,
        rightItems,
        correctPairs,
      } = gameData;
      if (!matchPrompt || !leftItems || !rightItems || !correctPairs) {
        return {
          isValid: false,
          error:
            "Matching requires: prompt, leftItems, rightItems, correctPairs",
        };
      }
      if (!Array.isArray(leftItems) || !Array.isArray(rightItems)) {
        return {
          isValid: false,
          error: "Matching leftItems and rightItems must be arrays",
        };
      }
      if (typeof correctPairs !== "object") {
        return {
          isValid: false,
          error: "Matching correctPairs must be an object",
        };
      }
      break;

    default:
      return { isValid: false, error: "Invalid game type" };
  }

  return { isValid: true };
}

// Export types for frontend use
export type {
  CreateGameModuleRequest,
  MCQGameModuleRequest,
  RearrangeGameModuleRequest,
  MatchingGameModuleRequest,
};
