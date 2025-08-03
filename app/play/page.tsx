"use client";

import GameEngine from "@/components/game-engine";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

type GameType = "REARRANGE" | "MCQ" | "MATCHING";

interface GameModule {
  id: string;
  type: GameType;
  lessonId: string;
  rearrangeChallenge?: {
    id: string;
    prompt: string;
    items: string[];
    correctOrder: string[];
  };
  mcq?: {
    id: string;
    question: string;
    options: string[];
    correct: number;
  };
  matching?: {
    id: string;
    prompt: string;
    leftItems: string[];
    rightItems: string[];
    correctPairs: Record<string, string>;
  };
}

const MyLearningPage = () => {
  const [gameModules, setGameModules] = useState<GameModule[]>([]);

  const searchParams = useSearchParams();
  const id = searchParams.get("id");

  useEffect(() => {
    const fetchLesson = async () => {
      if (!id) return;
      const res = await fetch(`/api/game-module?lessonId=${id}`, {
        credentials: "include",
      });
      const data: GameModule[] = await res.json();
      setGameModules(data);
    };

    fetchLesson();
  }, [id]);

  const handleGameComplete = () => {
    // Send results to your API
    fetch(`/api/complete-lesson`, {
      method: "PATCH",
      credentials: "include",
      body: JSON.stringify({
        lessonId: id,
      }),
    });
  };

  const handleProgress = (current: any, total: any) => {};

  return (
    <div className="max-w-3xl mx-auto min-h-screen place-content-center">
      <GameEngine
        modules={gameModules}
        onComplete={handleGameComplete}
        onProgress={handleProgress}
      />
    </div>
  );
};

export default MyLearningPage;
