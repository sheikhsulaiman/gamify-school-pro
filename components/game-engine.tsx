"use client";
import React, { useState, useEffect, useCallback } from "react";
import { DndProvider, useDrag, useDrop } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, XCircle, RotateCcw, ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";

// Types
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

interface GameEngineProps {
  modules: GameModule[];
  onComplete?: (
    results: { moduleId: string; correct: boolean; score: number }[]
  ) => void;
  onProgress?: (current: number, total: number) => void;
}

// Drag and Drop Types
const ItemTypes = {
  CARD: "card",
  MATCH_ITEM: "match_item",
};

// Draggable Card Component for Rearrange Game
const DraggableCard: React.FC<{
  item: string;
  index: number;
  moveCard: (dragIndex: number, hoverIndex: number) => void;
}> = ({ item, index, moveCard }) => {
  const [{ isDragging }, drag] = useDrag({
    type: ItemTypes.CARD,
    item: { index },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  const [, drop] = useDrop({
    accept: ItemTypes.CARD,
    hover: (draggedItem: { index: number }) => {
      if (draggedItem.index !== index) {
        moveCard(draggedItem.index, index);
        draggedItem.index = index;
      }
    },
  });

  const ref = React.useRef<HTMLDivElement>(null);
  drag(drop(ref));

  return (
    <div
      ref={ref}
      className={`p-3 bg-white border-2 border-dashed border-gray-300 rounded-lg cursor-move transition-all ${
        isDragging ? "opacity-50" : "opacity-100"
      } hover:border-blue-400`}
    >
      <div className="flex items-center justify-between">
        <span className="font-medium">{item}</span>
        <Badge variant="secondary">{index + 1}</Badge>
      </div>
    </div>
  );
};

// Individual Game Components
const RearrangeGame: React.FC<{
  challenge: GameModule["rearrangeChallenge"];
  onAnswer: (correct: boolean) => void;
}> = ({ challenge, onAnswer }) => {
  const [items, setItems] = useState<string[]>([]);
  const [submitted, setSubmitted] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);

  useEffect(() => {
    if (challenge) {
      setItems([...challenge.items]);
    }
  }, [challenge]);

  const moveCard = useCallback((dragIndex: number, hoverIndex: number) => {
    setItems((prevItems) => {
      const newItems = [...prevItems];
      const draggedItem = newItems[dragIndex];
      newItems.splice(dragIndex, 1);
      newItems.splice(hoverIndex, 0, draggedItem);
      return newItems;
    });
  }, []);

  const handleSubmit = () => {
    if (!challenge) return;

    const correct =
      JSON.stringify(items) === JSON.stringify(challenge.correctOrder);
    setIsCorrect(correct);
    setSubmitted(true);
    onAnswer(correct);
  };

  const handleReset = () => {
    if (challenge) {
      setItems([...challenge.items]);
      setSubmitted(false);
      setIsCorrect(false);
    }
  };

  if (!challenge) return null;

  return (
    <div className="space-y-4">
      <div className="text-lg font-medium mb-4">{challenge.prompt}</div>
      <div className="space-y-2">
        {items.map((item, index) => (
          <DraggableCard
            key={`${item}-${index}`}
            item={item}
            index={index}
            moveCard={moveCard}
          />
        ))}
      </div>
      {submitted && (
        <div
          className={`flex items-center space-x-2 ${
            isCorrect ? "text-green-600" : "text-red-600"
          }`}
        >
          {isCorrect ? <CheckCircle size={20} /> : <XCircle size={20} />}
          <span>{isCorrect ? "Correct!" : "Try again!"}</span>
        </div>
      )}
      <div className="flex space-x-2">
        <Button onClick={handleSubmit} disabled={submitted}>
          Submit Answer
        </Button>
        <Button variant="outline" onClick={handleReset}>
          <RotateCcw size={16} className="mr-2" />
          Reset
        </Button>
      </div>
    </div>
  );
};

const MCQGame: React.FC<{
  mcq: GameModule["mcq"];
  onAnswer: (correct: boolean) => void;
}> = ({ mcq, onAnswer }) => {
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);

  const handleSubmit = () => {
    if (!mcq || selectedOption === null) return;

    const correct = selectedOption === mcq.correct;
    setIsCorrect(correct);
    setSubmitted(true);
    onAnswer(correct);
  };

  const handleReset = () => {
    setSelectedOption(null);
    setSubmitted(false);
    setIsCorrect(false);
  };

  if (!mcq) return null;

  return (
    <div className="space-y-4">
      <div className="text-lg font-medium mb-4">{mcq.question}</div>
      <div className="space-y-2">
        {mcq.options.map((option, index) => (
          <div
            key={index}
            className={`p-3 border rounded-lg cursor-pointer transition-all ${
              selectedOption === index
                ? "border-blue-500 bg-blue-50"
                : "border-gray-300 hover:border-gray-400"
            } ${
              submitted && index === mcq.correct
                ? "border-green-500 bg-green-50"
                : submitted && selectedOption === index && index !== mcq.correct
                ? "border-red-500 bg-red-50"
                : ""
            }`}
            onClick={() => !submitted && setSelectedOption(index)}
          >
            <div className="flex items-center space-x-2">
              <div
                className={`w-4 h-4 rounded-full border-2 ${
                  selectedOption === index
                    ? "border-blue-500 bg-blue-500"
                    : "border-gray-300"
                }`}
              />
              <span>{option}</span>
            </div>
          </div>
        ))}
      </div>
      {submitted && (
        <div
          className={`flex items-center space-x-2 ${
            isCorrect ? "text-green-600" : "text-red-600"
          }`}
        >
          {isCorrect ? <CheckCircle size={20} /> : <XCircle size={20} />}
          <span>{isCorrect ? "Correct!" : "Try again!"}</span>
        </div>
      )}
      <div className="flex space-x-2">
        <Button
          onClick={handleSubmit}
          disabled={submitted || selectedOption === null}
        >
          Submit Answer
        </Button>
        <Button variant="outline" onClick={handleReset}>
          <RotateCcw size={16} className="mr-2" />
          Reset
        </Button>
      </div>
    </div>
  );
};

// Matching Game Components
const MatchingItem: React.FC<{
  item: string;
  side: "left" | "right";
  isMatched: boolean;
  isSelected: boolean;
  isIncorrect: boolean;
  onClick: () => void;
}> = ({ item, side, isMatched, isSelected, isIncorrect, onClick }) => {
  let baseStyle =
    "p-4 m-2 rounded-lg border-2 cursor-pointer transition-all duration-200 text-center ";

  if (isMatched) {
    baseStyle +=
      "bg-green-100 border-green-500 text-green-800 cursor-not-allowed opacity-75";
  } else if (isIncorrect) {
    baseStyle += "bg-red-100 border-red-500 text-red-800 animate-pulse";
  } else if (isSelected) {
    baseStyle +=
      "bg-blue-100 border-blue-500 text-blue-800 transform scale-105";
  } else {
    baseStyle +=
      "bg-white border-gray-300 hover:bg-gray-50 hover:border-gray-400 hover:transform hover:scale-105";
  }

  return (
    <div onClick={onClick} className={baseStyle}>
      <div className="flex items-center justify-center">
        <span>{item}</span>
        {isMatched && <CheckCircle size={16} className="text-green-600 ml-2" />}
        {isSelected && !isMatched && (
          <div className="w-4 h-4 bg-blue-500 rounded-full ml-2" />
        )}
      </div>
    </div>
  );
};

const MatchingGame: React.FC<{
  matching: {
    prompt: string;
    leftItems: string[];
    rightItems: string[];
    correctPairs: Record<string, string>;
  };
  onAnswer: (correct: boolean) => void;
}> = ({ matching, onAnswer }) => {
  const [matches, setMatches] = useState<Record<string, string>>({});
  const [selectedLeft, setSelectedLeft] = useState<string | null>(null);
  const [selectedRight, setSelectedRight] = useState<string | null>(null);
  const [incorrectPairs, setIncorrectPairs] = useState<Set<string>>(new Set());
  const [score, setScore] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const [gameComplete, setGameComplete] = useState(false);

  const handleLeftClick = (item: string) => {
    if (matches[item] || gameComplete) return;
    setSelectedLeft(item);
    setIncorrectPairs(new Set());
  };

  const handleRightClick = (item: string) => {
    if (Object.values(matches).includes(item) || gameComplete) return;
    setSelectedRight(item);
    setIncorrectPairs(new Set());
  };

  useEffect(() => {
    if (selectedLeft && selectedRight) {
      setAttempts((prev) => prev + 1);

      if (matching.correctPairs[selectedLeft] === selectedRight) {
        // Correct match
        setMatches((prev) => ({
          ...prev,
          [selectedLeft]: selectedRight,
        }));
        setScore((prev) => prev + 10);
        setSelectedLeft(null);
        setSelectedRight(null);
      } else {
        // Incorrect match
        setIncorrectPairs(new Set([selectedLeft, selectedRight]));
        setTimeout(() => {
          setSelectedLeft(null);
          setSelectedRight(null);
          setIncorrectPairs(new Set());
        }, 1000);
      }
    }
  }, [selectedLeft, selectedRight, matching.correctPairs]);

  useEffect(() => {
    if (
      Object.keys(matches).length === matching.leftItems.length &&
      !gameComplete
    ) {
      setGameComplete(true);
      onAnswer(true);
    }
  }, [matches, matching.leftItems.length, gameComplete, onAnswer]);

  const handleReset = () => {
    setMatches({});
    setSelectedLeft(null);
    setSelectedRight(null);
    setIncorrectPairs(new Set());
    setScore(0);
    setAttempts(0);
    setGameComplete(false);
  };

  if (!matching) return null;

  const isLeftMatched = (item: string) => !!matches[item];
  const isRightMatched = (item: string) =>
    Object.values(matches).includes(item);

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-4">Matching Game</h1>
        <div className="flex justify-center gap-8 mb-4">
          <div className="bg-white rounded-lg px-4 py-2 shadow">
            <span className="text-lg font-semibold text-blue-600">
              Score: {score}
            </span>
          </div>
          <div className="bg-white rounded-lg px-4 py-2 shadow">
            <span className="text-lg font-semibold text-purple-600">
              Attempts: {attempts}
            </span>
          </div>
        </div>
        <div className="text-lg font-medium mb-4 bg-white rounded-lg p-4 shadow">
          {matching.prompt}
        </div>
        <p className="text-gray-600 mb-4">
          Click one item from each column to match them!
        </p>
        {gameComplete && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
            🎉 Congratulations! You completed the game in {attempts} attempts!
          </div>
        )}
      </div> */}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Left Column */}
        <div className="p-2">
          <h2 className="text-xl font-semibold text-center mb-4 text-gray-700">
            Left Items
          </h2>
          <div className="space-y-2">
            {matching.leftItems.map((item) => (
              <MatchingItem
                key={item}
                item={item}
                side="left"
                isMatched={isLeftMatched(item)}
                isSelected={selectedLeft === item}
                isIncorrect={incorrectPairs.has(item)}
                onClick={() => handleLeftClick(item)}
              />
            ))}
          </div>
        </div>

        {/* Right Column */}
        <div className="p-2">
          <h2 className="text-xl font-semibold text-center mb-4 text-gray-700">
            Right Items
          </h2>
          <div className="space-y-2">
            {matching.rightItems.map((item) => (
              <MatchingItem
                key={item}
                item={item}
                side="right"
                isMatched={isRightMatched(item)}
                isSelected={selectedRight === item}
                isIncorrect={incorrectPairs.has(item)}
                onClick={() => handleRightClick(item)}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Show current matches */}
      {/* {Object.keys(matches).length > 0 && (
        <div className="mt-8 bg-white rounded-lg p-4 shadow">
          <h4 className="font-semibold text-gray-700 mb-2">Current Matches:</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {Object.entries(matches).map(([left, right]) => (
              <div
                key={left}
                className="flex items-center justify-between text-sm bg-green-50 p-2 rounded border border-green-200"
              >
                <span className="text-green-800">{left}</span>
                <span className="text-green-600">↔</span>
                <span className="text-green-800">{right}</span>
              </div>
            ))}
          </div>
        </div>
      )} */}

      <div className="text-center mt-8">
        <Button
          onClick={handleReset}
          className="font-bold py-3 px-6 rounded-lg transition-colors duration-200 shadow-lg hover:shadow-xl flex items-center mx-auto hover:cursor-pointer"
        >
          <RotateCcw size={16} className="mr-2" />
          Reset Game
        </Button>
      </div>

      {/* Instructions */}
      {/* <div className="mt-8 bg-white rounded-lg p-4 shadow">
        <h3 className="font-semibold text-gray-700 mb-2">How to Play:</h3>
        <ul className="text-gray-600 text-sm space-y-1">
          <li>
            • Click one item from the left column and one from the right column
          </li>
          <li>• If they match, they'll turn green and stay matched</li>
          <li>• If they don't match, they'll turn red briefly and deselect</li>
          <li>• Try to match all pairs with the fewest attempts possible!</li>
        </ul>
      </div> */}
    </div>
  );
};

// Main GameEngine Component
const GameEngine: React.FC<GameEngineProps> = ({
  modules,
  onComplete,
  onProgress,
}) => {
  const router = useRouter();
  const [currentModuleIndex, setCurrentModuleIndex] = useState(0);
  const [results, setResults] = useState<
    { moduleId: string; correct: boolean; score: number }[]
  >([]);
  const [isCompleted, setIsCompleted] = useState(false);

  const currentModule = modules[currentModuleIndex];
  const progress =
    modules.length > 0 ? (currentModuleIndex / modules.length) * 100 : 0;

  useEffect(() => {
    if (onProgress) {
      onProgress(currentModuleIndex + 1, modules.length);
    }
  }, [currentModuleIndex, modules.length, onProgress]);

  const handleAnswer = (correct: boolean) => {
    if (!currentModule) return;

    const newResult = {
      moduleId: currentModule.id,
      correct,
      score: correct ? 100 : 0,
    };

    setResults((prev) => [...prev, newResult]);
  };

  const handleNext = () => {
    if (currentModuleIndex < modules.length - 1) {
      setCurrentModuleIndex((prev) => prev + 1);
    } else {
      setIsCompleted(true);
      if (onComplete) {
        onComplete(results);
      }
    }
  };

  const handleRestart = () => {
    setCurrentModuleIndex(0);
    setResults([]);
    setIsCompleted(false);
  };

  if (modules.length === 0) {
    return (
      <Card className="w-full max-w-4xl mx-auto">
        <CardContent className="p-8 text-center">
          <p className="text-gray-600">No game modules available.</p>
        </CardContent>
      </Card>
    );
  }

  if (isCompleted) {
    const totalScore = results.reduce((sum, result) => sum + result.score, 0);
    const averageScore = totalScore / results.length;
    const correctAnswers = results.filter((r) => r.correct).length;

    return (
      <Card className="w-full max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <CheckCircle className="text-green-500" />
            <span>Game Completed!</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center">
            <div className="text-3xl font-bold text-green-600 mb-2">
              {correctAnswers}/{results.length}
            </div>
            <div className="text-gray-600">Correct Answers</div>
            <div className="text-2xl font-semibold mt-4">
              Score: {averageScore.toFixed(0)}%
            </div>
          </div>
          <Button
            variant="secondary"
            onClick={handleRestart}
            className="w-full"
          >
            Play Again
          </Button>
          <Button className="w-full" onClick={() => router.back()}>
            Continue
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <DndProvider backend={HTML5Backend}>
      <Card className="w-full max-w-4xl mx-auto">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>
              Game {currentModuleIndex + 1} of {modules.length}
            </CardTitle>
            <Badge variant="outline">{currentModule?.type}</Badge>
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm text-gray-600">
              <span>Progress</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="w-full" />
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {currentModule?.type === "REARRANGE" && (
            <RearrangeGame
              challenge={currentModule.rearrangeChallenge}
              onAnswer={handleAnswer}
            />
          )}
          {currentModule?.type === "MCQ" && (
            <MCQGame mcq={currentModule.mcq} onAnswer={handleAnswer} />
          )}
          {currentModule?.type === "MATCHING" && currentModule.matching && (
            <MatchingGame
              matching={currentModule.matching}
              onAnswer={handleAnswer}
            />
          )}

          <div className="flex justify-between items-center pt-4 border-t">
            <div className="text-sm text-gray-600">
              Question {currentModuleIndex + 1} of {modules.length}
            </div>
            <Button
              onClick={handleNext}
              disabled={results.length <= currentModuleIndex}
            >
              {currentModuleIndex === modules.length - 1 ? "Finish" : "Next"}
              <ArrowRight size={16} className="ml-2" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </DndProvider>
  );
};

export default GameEngine;
