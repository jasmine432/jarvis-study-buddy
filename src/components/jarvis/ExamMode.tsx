import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ArrowLeft, 
  CheckCircle, 
  XCircle, 
  Trophy, 
  RotateCcw, 
  Loader2,
  Clock,
  Target,
  Zap
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { Topic } from "./StudyAssistant";
import { toast } from "sonner";

interface Question {
  id: number;
  question: string;
  options: {
    A: string;
    B: string;
    C: string;
    D: string;
  };
  correctAnswer: "A" | "B" | "C" | "D";
  explanation: string;
}

interface ExamModeProps {
  topics: Topic[];
  onClose: () => void;
  onComplete: (score: number, total: number) => void;
}

const difficultyConfig = {
  easy: { label: "Easy", color: "text-green-400", questions: 5 },
  medium: { label: "Medium", color: "text-yellow-400", questions: 7 },
  hard: { label: "Hard", color: "text-red-400", questions: 10 },
};

export function ExamMode({ topics, onClose, onComplete }: ExamModeProps) {
  const [stage, setStage] = useState<"setup" | "loading" | "quiz" | "results">("setup");
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);
  const [difficulty, setDifficulty] = useState<"easy" | "medium" | "hard">("medium");
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [score, setScore] = useState(0);
  const [answers, setAnswers] = useState<{ questionId: number; answer: string; correct: boolean }[]>([]);
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [endTime, setEndTime] = useState<Date | null>(null);

  const inProgressTopics = topics.filter(t => t.status === "in_progress" || t.status === "completed");

  const toggleTopic = (topicId: string) => {
    setSelectedTopics(prev => 
      prev.includes(topicId) 
        ? prev.filter(id => id !== topicId)
        : [...prev, topicId]
    );
  };

  const startExam = async () => {
    if (selectedTopics.length === 0) {
      toast.error("Please select at least one topic");
      return;
    }

    setStage("loading");
    setStartTime(new Date());

    try {
      // Get selected topic names
      const topicNames = selectedTopics.map(id => {
        const topic = topics.find(t => t.id === id);
        return topic ? `${topic.name} (${topic.subject})` : "";
      }).join(", ");

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-quiz`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({
            topic: topicNames,
            subject: "Engineering",
            difficulty,
            questionCount: difficultyConfig[difficulty].questions,
          }),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to generate questions");
      }

      const data = await response.json();
      
      if (!data.questions || data.questions.length === 0) {
        throw new Error("No questions received");
      }

      setQuestions(data.questions);
      setStage("quiz");
    } catch (error) {
      console.error("Error generating quiz:", error);
      toast.error(error instanceof Error ? error.message : "Failed to generate quiz");
      setStage("setup");
    }
  };

  const handleAnswer = (answer: string) => {
    if (selectedAnswer) return; // Already answered
    
    setSelectedAnswer(answer);
    const isCorrect = answer === questions[currentQuestion].correctAnswer;
    
    if (isCorrect) {
      setScore(prev => prev + 1);
    }
    
    setAnswers(prev => [...prev, {
      questionId: questions[currentQuestion].id,
      answer,
      correct: isCorrect,
    }]);
    
    setShowExplanation(true);
  };

  const nextQuestion = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
      setSelectedAnswer(null);
      setShowExplanation(false);
    } else {
      setEndTime(new Date());
      setStage("results");
      onComplete(score, questions.length);
    }
  };

  const restartExam = () => {
    setStage("setup");
    setSelectedTopics([]);
    setQuestions([]);
    setCurrentQuestion(0);
    setSelectedAnswer(null);
    setShowExplanation(false);
    setScore(0);
    setAnswers([]);
    setStartTime(null);
    setEndTime(null);
  };

  const formatTime = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  // Setup Stage
  if (stage === "setup") {
    return (
      <div className="glass-card p-6 h-full flex flex-col">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" size="icon" onClick={onClose}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h2 className="font-orbitron text-lg tracking-wide text-glow flex items-center gap-2">
              <Target className="w-5 h-5" />
              Exam Mode
            </h2>
            <p className="text-xs text-muted-foreground mt-1">
              Test your knowledge with AI-generated questions
            </p>
          </div>
        </div>

        {/* Topic Selection */}
        <div className="mb-6">
          <h3 className="text-sm font-medium mb-3">Select Topics to Quiz</h3>
          {inProgressTopics.length === 0 ? (
            <p className="text-sm text-muted-foreground p-4 bg-secondary/30 rounded-lg">
              Start studying some topics first! Only topics you've started or completed can be quizzed.
            </p>
          ) : (
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {inProgressTopics.map(topic => (
                <motion.div
                  key={topic.id}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => toggleTopic(topic.id)}
                  className={cn(
                    "p-3 rounded-lg border cursor-pointer transition-all",
                    selectedTopics.includes(topic.id)
                      ? "border-primary bg-primary/10"
                      : "border-border/30 hover:border-border"
                  )}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{topic.name}</span>
                    <span className="text-xs text-muted-foreground capitalize">
                      {topic.subject}
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {/* Difficulty Selection */}
        <div className="mb-6">
          <h3 className="text-sm font-medium mb-3">Select Difficulty</h3>
          <div className="flex gap-2">
            {(Object.keys(difficultyConfig) as Array<keyof typeof difficultyConfig>).map(level => (
              <Button
                key={level}
                variant={difficulty === level ? "default" : "outline"}
                onClick={() => setDifficulty(level)}
                className="flex-1"
              >
                <span className={cn(difficultyConfig[level].color)}>
                  {difficultyConfig[level].label}
                </span>
                <span className="ml-2 text-xs text-muted-foreground">
                  ({difficultyConfig[level].questions} Q)
                </span>
              </Button>
            ))}
          </div>
        </div>

        {/* Start Button */}
        <div className="mt-auto">
          <Button
            onClick={startExam}
            disabled={selectedTopics.length === 0}
            className="w-full bg-gradient-to-r from-jarvis-core to-jarvis-thinking hover:opacity-90"
            size="lg"
          >
            <Zap className="w-5 h-5 mr-2" />
            Start Exam ({difficultyConfig[difficulty].questions} Questions)
          </Button>
        </div>
      </div>
    );
  }

  // Loading Stage
  if (stage === "loading") {
    return (
      <div className="glass-card p-6 h-full flex flex-col items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        >
          <Loader2 className="w-12 h-12 text-jarvis-core" />
        </motion.div>
        <p className="mt-4 text-muted-foreground font-orbitron">
          Generating questions...
        </p>
        <p className="text-xs text-muted-foreground mt-2">
          AI is crafting personalized questions for you
        </p>
      </div>
    );
  }

  // Quiz Stage
  if (stage === "quiz" && questions.length > 0) {
    const question = questions[currentQuestion];
    const progress = ((currentQuestion + 1) / questions.length) * 100;

    return (
      <div className="glass-card p-6 h-full flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <Button variant="ghost" size="icon" onClick={onClose}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">
              Question {currentQuestion + 1} of {questions.length}
            </span>
            <span className="font-orbitron text-jarvis-speaking">
              Score: {score}
            </span>
          </div>
        </div>

        {/* Progress */}
        <Progress value={progress} className="h-2 mb-6" />

        {/* Question */}
        <motion.div
          key={currentQuestion}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex-1 flex flex-col"
        >
          <h3 className="text-lg font-medium mb-6">{question.question}</h3>

          {/* Options */}
          <div className="space-y-3 mb-6">
            {(["A", "B", "C", "D"] as const).map(option => {
              const isSelected = selectedAnswer === option;
              const isCorrect = question.correctAnswer === option;
              const showResult = showExplanation;

              return (
                <motion.button
                  key={option}
                  whileTap={{ scale: selectedAnswer ? 1 : 0.98 }}
                  onClick={() => handleAnswer(option)}
                  disabled={!!selectedAnswer}
                  className={cn(
                    "w-full p-4 rounded-xl border text-left transition-all",
                    !showResult && !isSelected && "border-border/30 hover:border-primary/50",
                    !showResult && isSelected && "border-primary bg-primary/10",
                    showResult && isCorrect && "border-green-500 bg-green-500/10",
                    showResult && isSelected && !isCorrect && "border-red-500 bg-red-500/10"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <span className={cn(
                      "w-8 h-8 rounded-full flex items-center justify-center font-medium text-sm",
                      !showResult && "bg-secondary",
                      showResult && isCorrect && "bg-green-500 text-white",
                      showResult && isSelected && !isCorrect && "bg-red-500 text-white"
                    )}>
                      {showResult && isCorrect ? (
                        <CheckCircle className="w-5 h-5" />
                      ) : showResult && isSelected && !isCorrect ? (
                        <XCircle className="w-5 h-5" />
                      ) : (
                        option
                      )}
                    </span>
                    <span className="flex-1">{question.options[option]}</span>
                  </div>
                </motion.button>
              );
            })}
          </div>

          {/* Explanation */}
          <AnimatePresence>
            {showExplanation && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="p-4 rounded-xl bg-secondary/50 border border-border/30 mb-4"
              >
                <h4 className="font-medium text-sm mb-2 flex items-center gap-2">
                  {selectedAnswer === question.correctAnswer ? (
                    <>
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span className="text-green-500">Correct!</span>
                    </>
                  ) : (
                    <>
                      <XCircle className="w-4 h-4 text-red-500" />
                      <span className="text-red-500">Incorrect</span>
                    </>
                  )}
                </h4>
                <p className="text-sm text-muted-foreground">{question.explanation}</p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Next Button */}
          {showExplanation && (
            <Button
              onClick={nextQuestion}
              className="w-full bg-gradient-to-r from-jarvis-core to-jarvis-thinking"
              size="lg"
            >
              {currentQuestion < questions.length - 1 ? "Next Question" : "View Results"}
            </Button>
          )}
        </motion.div>
      </div>
    );
  }

  // Results Stage
  if (stage === "results") {
    const percentage = Math.round((score / questions.length) * 100);
    const timeTaken = startTime && endTime ? endTime.getTime() - startTime.getTime() : 0;

    return (
      <div className="glass-card p-6 h-full flex flex-col items-center justify-center">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", delay: 0.2 }}
        >
          <Trophy className={cn(
            "w-20 h-20",
            percentage >= 80 ? "text-yellow-400" :
            percentage >= 60 ? "text-gray-400" :
            "text-orange-400"
          )} />
        </motion.div>

        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="font-orbitron text-2xl mt-6 text-glow"
        >
          {percentage >= 80 ? "Excellent!" :
           percentage >= 60 ? "Good Job!" :
           "Keep Practicing!"}
        </motion.h2>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mt-6 grid grid-cols-2 gap-4 w-full max-w-xs"
        >
          <div className="text-center p-4 rounded-xl bg-secondary/30 border border-border/30">
            <div className="text-3xl font-orbitron text-jarvis-core">{score}</div>
            <div className="text-xs text-muted-foreground">Correct</div>
          </div>
          <div className="text-center p-4 rounded-xl bg-secondary/30 border border-border/30">
            <div className="text-3xl font-orbitron text-jarvis-speaking">{percentage}%</div>
            <div className="text-xs text-muted-foreground">Score</div>
          </div>
          <div className="col-span-2 text-center p-4 rounded-xl bg-secondary/30 border border-border/30">
            <div className="flex items-center justify-center gap-2">
              <Clock className="w-5 h-5 text-muted-foreground" />
              <span className="text-xl font-orbitron">{formatTime(timeTaken)}</span>
            </div>
            <div className="text-xs text-muted-foreground">Time Taken</div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="flex gap-4 mt-8"
        >
          <Button variant="outline" onClick={onClose}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Study
          </Button>
          <Button onClick={restartExam} className="bg-gradient-to-r from-jarvis-core to-jarvis-thinking">
            <RotateCcw className="w-4 h-4 mr-2" />
            Try Again
          </Button>
        </motion.div>
      </div>
    );
  }

  return null;
}
