"use client";

// import { useSearchParams } from "next/navigation";
// import { useEffect, useState } from "react";
// import { Progress } from "@/components/ui/progress";
// import {
//   Card,
//   CardHeader,
//   CardContent,
//   CardFooter,
// } from "@/components/ui/card";
// import { Button } from "@/components/ui/button";
// import { GameEngine } from "@/components/game-engine";

// type GameModule = {
//   id: string;
//   type: "MCQ" | "REARRANGE" | "MATCHING";
// };

// type Lesson = {
//   id: string;
//   title: string;
//   content: string;
//   gameModules: GameModule[];
// };

// export default function PlayPage() {
//   const searchParams = useSearchParams();
//   const lessonId = searchParams.get("id");

//   const [lesson, setLesson] = useState<Lesson | null>(null);
//   const [loading, setLoading] = useState(true);
//   const [currentStep, setCurrentStep] = useState(0);
//   const [startTime, setStartTime] = useState<number>(Date.now());
//   const [finishTime, setFinishTime] = useState<number | null>(null);

//   useEffect(() => {
//     const fetchLesson = async () => {
//       if (!lessonId) return;
//       const res = await fetch(`/api/lesson?lessonId=${lessonId}`, {
//         credentials: "include",
//       });
//       const data: Lesson = await res.json();
//       console.log("Fetched lesson data:", data);
//       setLesson(data);
//       setStartTime(Date.now());
//       setLoading(false);
//     };

//     fetchLesson();
//   }, [lessonId]);

//   const handleNext = () => {
//     if (currentStep < (lesson?.gameModules.length || 0)) {
//       setCurrentStep(currentStep + 1);
//     } else {
//       setFinishTime(Date.now());
//     }
//   };

//   if (loading || !lesson) return <div>🌀 Loading lesson…</div>;

//   const isComplete = finishTime !== null;
//   const timeTaken =
//     finishTime && startTime ? Math.round((finishTime - startTime) / 1000) : 0;

//   const progressPercent =
//     ((currentStep + (isComplete ? 1 : 0)) / (lesson.gameModules.length + 1)) *
//     100;

//   return (
//     <main className="max-w-3xl mx-auto py-10 px-4">
//       <h1 className="text-3xl font-bold mb-6">{lesson.title}</h1>
//       <Progress value={progressPercent} className="mb-6" />

//       {!isComplete ? (
//         <Card>
//           <CardHeader>
//             <h2 className="text-xl font-semibold">
//               {currentStep === 0
//                 ? "📖 Lesson Content"
//                 : `🎮 Game Module #${currentStep}`}
//             </h2>
//           </CardHeader>
//           <CardContent>
//             {currentStep === 0 ? (
//               <div dangerouslySetInnerHTML={{ __html: lesson.content }} />
//             ) : (
//               <p className="text-muted-foreground">
//                 {lesson.gameModules[currentStep - 1]?.type} (Coming soon)
//               </p>
//             )}
//           </CardContent>
//           <CardFooter className="flex justify-end">
//             <Button onClick={handleNext}>
//               {currentStep < lesson.gameModules.length ? "Next" : "Finish"}
//             </Button>
//           </CardFooter>
//         </Card>
//       ) : (
//         <Card className="text-center">
//           <CardHeader>
//             <h2 className="text-2xl font-bold">🎉 Lesson Complete!</h2>
//           </CardHeader>
//           <CardContent>
//             <p className="text-muted-foreground mb-2">
//               Time Taken: <strong>{timeTaken}</strong> seconds
//             </p>
//             <p>
//               XP Claimed:{" "}
//               <span className="text-green-600 font-bold">10 XP</span>
//             </p>
//           </CardContent>
//           <CardFooter>
//             <Button
//               variant="outline"
//               onClick={() => (window.location.href = "/dashboard/overview")}
//             >
//               Back to Dashboard
//             </Button>
//           </CardFooter>
//         </Card>
//       )}

//       {/* <GameEngine id={lessonId} /> */}
//     </main>
//   );
// }

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
      console.log("Game Modules", data);
    };

    fetchLesson();
  }, [id]);

  const handleGameComplete = (results: any) => {
    console.log("Game completed with results:", results);
    // Send results to your API
  };

  const handleProgress = (current: any, total: any) => {
    console.log(`Progress: ${current}/${total}`);
  };

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
