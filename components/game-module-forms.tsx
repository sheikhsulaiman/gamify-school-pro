import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { AlertCircle, Plus, X, Check, Shuffle, Link } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useRouter } from "next/navigation";

// Types matching the backend
interface MCQGameData {
  question: string;
  options: string[];
  correct: number;
}

interface RearrangeGameData {
  prompt: string;
  items: string[];
  correctOrder: string[];
}

interface MatchingGameData {
  prompt: string;
  leftItems: string[];
  rightItems: string[];
  correctPairs: Record<string, string>;
}

// MCQ Form Component
const MCQForm: React.FC<{ lessonId: string; onSuccess?: () => void }> = ({
  lessonId,
  onSuccess,
}) => {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
    xpReward: 10,
    question: "",
    options: ["", ""],
    correct: 0,
  });

  const addOption = () => {
    setFormData((prev) => ({
      ...prev,
      options: [...prev.options, ""],
    }));
  };

  const removeOption = (index: number) => {
    if (formData.options.length <= 2) return;
    setFormData((prev) => ({
      ...prev,
      options: prev.options.filter((_, i) => i !== index),
      correct:
        prev.correct >= index ? Math.max(0, prev.correct - 1) : prev.correct,
    }));
  };

  const updateOption = (index: number, value: string) => {
    setFormData((prev) => ({
      ...prev,
      options: prev.options.map((opt, i) => (i === index ? value : opt)),
    }));
  };

  const handleSubmit = async () => {
    if (!isValid) return;
    setIsLoading(true);
    setError("");

    try {
      const response = await fetch("/api/game-module", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lessonId,
          type: "MCQ",
          title: formData.title,
          xpReward: formData.xpReward,
          gameData: {
            question: formData.question,
            options: formData.options,
            correct: formData.correct,
          },
        }),
      });

      const result = await response.json();

      if (result.success) {
        setSuccess(true);
        setTimeout(() => {
          setIsOpen(false);
          setSuccess(false);
          setFormData({
            title: "",
            xpReward: 10,
            question: "",
            options: ["", ""],
            correct: 0,
          });
          onSuccess?.();
        }, 1500);
      } else {
        setError(result.error || "Failed to create MCQ module");
      }
    } catch (err) {
      setError("Network error occurred");
    } finally {
      setIsLoading(false);
      router.refresh();
    }
  };

  const isValid =
    formData.title.trim() &&
    formData.question.trim() &&
    formData.options.every((opt) => opt.trim()) &&
    formData.options.length >= 2;

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button className="w-full" variant="outline">
          <Check className="mr-2 h-4 w-4" />
          Create MCQ Module
        </Button>
      </SheetTrigger>
      <SheetContent className="w-full px-4 sm:max-w-md overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Create Multiple Choice Question</SheetTitle>
          <SheetDescription>
            Create an interactive quiz question with multiple answer options.
          </SheetDescription>
        </SheetHeader>

        {success && (
          <Alert className="mt-4 border-green-200 bg-green-50">
            <Check className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">
              MCQ module created successfully!
            </AlertDescription>
          </Alert>
        )}

        <div className="space-y-6 mt-6">
          <div className="space-y-2">
            <Label htmlFor="mcq-title">Module Title</Label>
            <Input
              id="mcq-title"
              value={formData.title}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, title: e.target.value }))
              }
              placeholder="e.g., Basic Math Quiz"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="mcq-xp">XP Reward</Label>
            <Input
              id="mcq-xp"
              type="number"
              min="0"
              value={formData.xpReward}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  xpReward: parseInt(e.target.value) || 0,
                }))
              }
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="mcq-question">Question</Label>
            <Textarea
              id="mcq-question"
              value={formData.question}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, question: e.target.value }))
              }
              placeholder="What is 2 + 2?"
            />
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Answer Options</Label>
              <Button
                type="button"
                onClick={addOption}
                size="sm"
                variant="outline"
              >
                <Plus className="h-3 w-3 mr-1" />
                Add Option
              </Button>
            </div>

            {formData.options.map((option, index) => (
              <div key={index} className="flex items-center gap-2">
                <div className="flex items-center space-x-2 flex-1">
                  <input
                    type="radio"
                    name="correct"
                    checked={formData.correct === index}
                    onChange={() =>
                      setFormData((prev) => ({ ...prev, correct: index }))
                    }
                    className="w-4 h-4"
                  />
                  <Input
                    value={option}
                    onChange={(e) => updateOption(index, e.target.value)}
                    placeholder={`Option ${index + 1}`}
                  />
                </div>
                {formData.options.length > 2 && (
                  <Button
                    type="button"
                    onClick={() => removeOption(index)}
                    size="sm"
                    variant="ghost"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                )}
              </div>
            ))}
            <p className="text-xs text-muted-foreground">
              Select the correct answer by clicking the radio button
            </p>
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <Button
            onClick={handleSubmit}
            className="w-full"
            disabled={!isValid || isLoading}
          >
            {isLoading ? "Creating..." : "Create MCQ Module"}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
};

// Rearrange Form Component
const RearrangeForm: React.FC<{ lessonId: string; onSuccess?: () => void }> = ({
  lessonId,
  onSuccess,
}) => {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
    xpReward: 15,
    prompt: "",
    items: [""],
    correctOrder: [""],
  });

  const addItem = () => {
    setFormData((prev) => ({
      ...prev,
      items: [...prev.items, ""],
      correctOrder: [...prev.correctOrder, ""],
    }));
  };

  const removeItem = (index: number) => {
    if (formData.items.length <= 1) return;
    setFormData((prev) => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index),
      correctOrder: prev.correctOrder.filter((_, i) => i !== index),
    }));
  };

  const updateItem = (index: number, value: string) => {
    setFormData((prev) => ({
      ...prev,
      items: prev.items.map((item, i) => (i === index ? value : item)),
      correctOrder: prev.correctOrder.map((item, i) =>
        i === index ? value : item
      ),
    }));
  };

  const moveItem = (index: number, direction: "up" | "down") => {
    const newIndex = direction === "up" ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= formData.correctOrder.length) return;

    setFormData((prev) => {
      const newOrder = [...prev.correctOrder];
      [newOrder[index], newOrder[newIndex]] = [
        newOrder[newIndex],
        newOrder[index],
      ];
      return { ...prev, correctOrder: newOrder };
    });
  };

  const handleSubmit = async () => {
    if (!isValid) return;
    setIsLoading(true);
    setError("");

    try {
      const response = await fetch("/api/game-module", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lessonId,
          type: "REARRANGE",
          title: formData.title,
          xpReward: formData.xpReward,
          gameData: {
            prompt: formData.prompt,
            items: formData.items,
            correctOrder: formData.correctOrder,
          },
        }),
      });

      const result = await response.json();

      if (result.success) {
        setSuccess(true);
        setTimeout(() => {
          setIsOpen(false);
          setSuccess(false);
          setFormData({
            title: "",
            xpReward: 15,
            prompt: "",
            items: [""],
            correctOrder: [""],
          });
          onSuccess?.();
        }, 1500);
      } else {
        setError(result.error || "Failed to create rearrange module");
      }
    } catch (err) {
      setError("Network error occurred");
    } finally {
      setIsLoading(false);
      router.refresh();
    }
  };

  const isValid =
    formData.title.trim() &&
    formData.prompt.trim() &&
    formData.items.every((item) => item.trim()) &&
    formData.items.length >= 2;

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button className="w-full" variant="outline">
          <Shuffle className="mr-2 h-4 w-4" />
          Create Rearrange Module
        </Button>
      </SheetTrigger>
      <SheetContent className="w-full px-4 sm:max-w-md overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Create Rearrange Challenge</SheetTitle>
          <SheetDescription>
            Create a challenge where users arrange items in the correct order.
          </SheetDescription>
        </SheetHeader>

        {success && (
          <Alert className="mt-4 border-green-200 bg-green-50">
            <Check className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">
              Rearrange module created successfully!
            </AlertDescription>
          </Alert>
        )}

        <div className="space-y-6 mt-6">
          <div className="space-y-2">
            <Label htmlFor="rearrange-title">Module Title</Label>
            <Input
              id="rearrange-title"
              value={formData.title}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, title: e.target.value }))
              }
              placeholder="e.g., Order the Steps"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="rearrange-xp">XP Reward</Label>
            <Input
              id="rearrange-xp"
              type="number"
              min="0"
              value={formData.xpReward}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  xpReward: parseInt(e.target.value) || 0,
                }))
              }
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="rearrange-prompt">Prompt</Label>
            <Textarea
              id="rearrange-prompt"
              value={formData.prompt}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, prompt: e.target.value }))
              }
              placeholder="Arrange the steps to make coffee"
            />
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Items (in correct order)</Label>
              <Button
                type="button"
                onClick={addItem}
                size="sm"
                variant="outline"
              >
                <Plus className="h-3 w-3 mr-1" />
                Add Item
              </Button>
            </div>

            {formData.items.map((item, index) => (
              <div key={index} className="flex items-center gap-2">
                <Badge variant="outline" className="min-w-8 h-6 text-xs">
                  {index + 1}
                </Badge>
                <Input
                  value={item}
                  onChange={(e) => updateItem(index, e.target.value)}
                  placeholder={`Step ${index + 1}`}
                />
                <div className="flex gap-1">
                  <Button
                    type="button"
                    onClick={() => moveItem(index, "up")}
                    size="sm"
                    variant="ghost"
                    disabled={index === 0}
                  >
                    ↑
                  </Button>
                  <Button
                    type="button"
                    onClick={() => moveItem(index, "down")}
                    size="sm"
                    variant="ghost"
                    disabled={index === formData.items.length - 1}
                  >
                    ↓
                  </Button>
                </div>
                {formData.items.length > 1 && (
                  <Button
                    type="button"
                    onClick={() => removeItem(index)}
                    size="sm"
                    variant="ghost"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                )}
              </div>
            ))}
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <Button
            onClick={handleSubmit}
            className="w-full"
            disabled={!isValid || isLoading}
          >
            {isLoading ? "Creating..." : "Create Rearrange Module"}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
};

// Matching Form Component
const MatchingForm: React.FC<{ lessonId: string; onSuccess?: () => void }> = ({
  lessonId,
  onSuccess,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
    xpReward: 20,
    prompt: "",
    pairs: [{ left: "", right: "" }],
  });

  const addPair = () => {
    setFormData((prev) => ({
      ...prev,
      pairs: [...prev.pairs, { left: "", right: "" }],
    }));
  };

  const removePair = (index: number) => {
    if (formData.pairs.length <= 1) return;
    setFormData((prev) => ({
      ...prev,
      pairs: prev.pairs.filter((_, i) => i !== index),
    }));
  };

  const updatePair = (index: number, side: "left" | "right", value: string) => {
    setFormData((prev) => ({
      ...prev,
      pairs: prev.pairs.map((pair, i) =>
        i === index ? { ...pair, [side]: value } : pair
      ),
    }));
  };

  const handleSubmit = async () => {
    if (!isValid) return;
    setIsLoading(true);
    setError("");

    try {
      const leftItems = formData.pairs.map((pair) => pair.left);
      const rightItems = formData.pairs.map((pair) => pair.right);
      const correctPairs = Object.fromEntries(
        formData.pairs.map((pair) => [pair.left, pair.right])
      );

      const response = await fetch("/api/game-module", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lessonId,
          type: "MATCHING",
          title: formData.title,
          xpReward: formData.xpReward,
          gameData: {
            prompt: formData.prompt,
            leftItems,
            rightItems,
            correctPairs,
          },
        }),
      });

      const result = await response.json();

      if (result.success) {
        setSuccess(true);
        setTimeout(() => {
          setIsOpen(false);
          setSuccess(false);
          setFormData({
            title: "",
            xpReward: 20,
            prompt: "",
            pairs: [{ left: "", right: "" }],
          });
          onSuccess?.();
        }, 1500);
      } else {
        setError(result.error || "Failed to create matching module");
      }
    } catch (err) {
      setError("Network error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const isValid =
    formData.title.trim() &&
    formData.prompt.trim() &&
    formData.pairs.every((pair) => pair.left.trim() && pair.right.trim()) &&
    formData.pairs.length >= 2;

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button className="w-full" variant="outline">
          <Link className="mr-2 h-4 w-4" />
          Create Matching Module
        </Button>
      </SheetTrigger>
      <SheetContent className="w-full px-4 sm:max-w-md overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Create Matching Challenge</SheetTitle>
          <SheetDescription>
            Create a challenge where users match items from two lists.
          </SheetDescription>
        </SheetHeader>

        {success && (
          <Alert className="mt-4 border-green-200 bg-green-50">
            <Check className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">
              Matching module created successfully!
            </AlertDescription>
          </Alert>
        )}

        <div className="space-y-6 mt-6">
          <div className="space-y-2">
            <Label htmlFor="matching-title">Module Title</Label>
            <Input
              id="matching-title"
              value={formData.title}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, title: e.target.value }))
              }
              placeholder="e.g., Animal Translation"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="matching-xp">XP Reward</Label>
            <Input
              id="matching-xp"
              type="number"
              min="0"
              value={formData.xpReward}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  xpReward: parseInt(e.target.value) || 0,
                }))
              }
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="matching-prompt">Prompt</Label>
            <Textarea
              id="matching-prompt"
              value={formData.prompt}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, prompt: e.target.value }))
              }
              placeholder="Match the animals with their English translations"
            />
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Matching Pairs</Label>
              <Button
                type="button"
                onClick={addPair}
                size="sm"
                variant="outline"
              >
                <Plus className="h-3 w-3 mr-1" />
                Add Pair
              </Button>
            </div>

            {formData.pairs.map((pair, index) => (
              <div key={index} className="space-y-2 p-3 border rounded-lg">
                <div className="flex items-center justify-between">
                  <Badge variant="outline">Pair {index + 1}</Badge>
                  {formData.pairs.length > 1 && (
                    <Button
                      type="button"
                      onClick={() => removePair(index)}
                      size="sm"
                      variant="ghost"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label className="text-xs">Left Item</Label>
                    <Input
                      value={pair.left}
                      onChange={(e) =>
                        updatePair(index, "left", e.target.value)
                      }
                      placeholder="猫"
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Right Item</Label>
                    <Input
                      value={pair.right}
                      onChange={(e) =>
                        updatePair(index, "right", e.target.value)
                      }
                      placeholder="cat"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <Button
            onClick={handleSubmit}
            className="w-full"
            disabled={!isValid || isLoading}
          >
            {isLoading ? "Creating..." : "Create Matching Module"}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
};

// Main Demo Component
const GameModuleForms: React.FC<{ lessonId: string | undefined }> = ({
  lessonId,
}) => {
  const [successMessage, setSuccessMessage] = useState("");
  // This would come from props or context in real app

  const handleSuccess = (moduleType: string) => {
    setSuccessMessage(`${moduleType} module created successfully!`);
    setTimeout(() => setSuccessMessage(""), 3000);
  };

  if (!lessonId) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <Alert variant="destructive">
          <AlertDescription>
            Lesson ID is required to create game modules.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">Game Module Creation</h1>
        <p className="text-muted-foreground">
          Create interactive learning modules for your lessons
        </p>
      </div>

      {successMessage && (
        <Alert className="border-green-200 bg-green-50">
          <Check className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">
            {successMessage}
          </AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Check className="h-5 w-5" />
              Multiple Choice
            </CardTitle>
            <CardDescription>
              Create quiz questions with multiple answer options
            </CardDescription>
          </CardHeader>
          <CardContent>
            <MCQForm
              lessonId={lessonId}
              onSuccess={() => handleSuccess("MCQ")}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shuffle className="h-5 w-5" />
              Rearrange
            </CardTitle>
            <CardDescription>
              Create challenges where users arrange items in order
            </CardDescription>
          </CardHeader>
          <CardContent>
            <RearrangeForm
              lessonId={lessonId}
              onSuccess={() => handleSuccess("Rearrange")}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Link className="h-5 w-5" />
              Matching
            </CardTitle>
            <CardDescription>
              Create challenges where users match items from two lists
            </CardDescription>
          </CardHeader>
          <CardContent>
            <MatchingForm
              lessonId={lessonId}
              onSuccess={() => handleSuccess("Matching")}
            />
          </CardContent>
        </Card>
      </div>

      <div className="text-center text-sm text-muted-foreground">
        <p>
          Current lesson ID:{" "}
          <code className="bg-muted px-2 py-1 rounded">{lessonId}</code>
        </p>
      </div>
    </div>
  );
};

export default GameModuleForms;
