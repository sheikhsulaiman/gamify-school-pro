// app/api/multiple-choice-questions/route.ts
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// GET /api/multiple-choice-questions
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const gameId = searchParams.get("gameId");

    let questions;

    if (gameId) {
      // Get questions for a specific game
      questions = await prisma.multipleChoiceQuestion.findMany({
        where: {
          gameId: gameId,
        },
        include: {
          module: true, // Include related GameModule if needed
        },
      });
    } else {
      // Get all questions
      questions = await prisma.multipleChoiceQuestion.findMany({
        include: {
          module: true,
        },
      });
    }

    return NextResponse.json({
      success: true,
      data: questions,
    });
  } catch (error) {
    console.error("Error fetching multiple choice questions:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch multiple choice questions",
      },
      { status: 500 }
    );
  }
}

// POST /api/multiple-choice-questions
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate required fields
    const { question, options, correct, gameId } = body;

    if (!question || !options || correct === undefined || !gameId) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing required fields: question, options, correct, gameId",
        },
        { status: 400 }
      );
    }

    // Validate options array
    if (!Array.isArray(options) || options.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: "Options must be a non-empty array",
        },
        { status: 400 }
      );
    }

    // Validate correct index
    if (
      typeof correct !== "number" ||
      correct < 0 ||
      correct >= options.length
    ) {
      return NextResponse.json(
        {
          success: false,
          error: "Correct must be a valid index within the options array",
        },
        { status: 400 }
      );
    }

    // Check if gameId exists
    const gameModule = await prisma.gameModule.findUnique({
      where: { id: gameId },
    });

    if (!gameModule) {
      return NextResponse.json(
        {
          success: false,
          error: "Game module not found",
        },
        { status: 404 }
      );
    }

    // Create the question
    const newQuestion = await prisma.multipleChoiceQuestion.create({
      data: {
        question,
        options,
        correct,
        gameId,
      },
      include: {
        module: true,
      },
    });

    return NextResponse.json(
      {
        success: true,
        data: newQuestion,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating multiple choice question:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Failed to create multiple choice question",
      },
      { status: 500 }
    );
  }
}
