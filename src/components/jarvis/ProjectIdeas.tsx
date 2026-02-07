import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Lightbulb, Code, ChevronDown, ChevronUp, Copy, Check, Sparkles, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export interface ProjectIdea {
  id: string;
  title: string;
  description: string;
  difficulty: "beginner" | "intermediate" | "advanced";
  tags: string[];
  codeSnippet?: string;
}

interface ProjectIdeasProps {
  ideas: ProjectIdea[];
  onGenerateIdeas: (skills: string[], difficulty: "beginner" | "intermediate" | "advanced") => void;
  isGenerating: boolean;
}

const difficultyColors = {
  beginner: "bg-jarvis-speaking/20 text-jarvis-speaking border-jarvis-speaking/30",
  intermediate: "bg-jarvis-listening/20 text-jarvis-listening border-jarvis-listening/30",
  advanced: "bg-jarvis-thinking/20 text-jarvis-thinking border-jarvis-thinking/30",
};

const availableSkills = [
  "React", "TypeScript", "JavaScript", "Node.js", "Python",
  "HTML/CSS", "Tailwind", "PostgreSQL", "MongoDB", "REST API",
  "GraphQL", "Docker", "AWS", "Firebase", "WebSocket",
  "Machine Learning", "Data Analysis", "Mobile Dev", "DevOps", "Testing"
];

export function ProjectIdeas({ ideas, onGenerateIdeas, isGenerating }: ProjectIdeasProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [selectedDifficulty, setSelectedDifficulty] = useState<"beginner" | "intermediate" | "advanced">("intermediate");

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const toggleSkill = (skill: string) => {
    setSelectedSkills(prev =>
      prev.includes(skill)
        ? prev.filter(s => s !== skill)
        : [...prev, skill]
    );
  };

  const handleGenerate = () => {
    onGenerateIdeas(selectedSkills, selectedDifficulty);
  };

  return (
    <div className="glass-card p-6 h-full flex flex-col">
      {/* Header */}
      <div className="mb-6">
        <h2 className="font-orbitron text-lg tracking-wide text-glow flex items-center gap-2 mb-1">
          <Lightbulb className="w-5 h-5" />
          Project Ideas
        </h2>
        <p className="text-xs text-muted-foreground">
          Get AI-generated project ideas with starter code
        </p>
      </div>

      {/* Skills Selection */}
      <div className="mb-4">
        <h3 className="text-sm font-medium mb-2 flex items-center gap-2">
          Select Your Skills
          {selectedSkills.length > 0 && (
            <Badge variant="secondary" className="text-xs">
              {selectedSkills.length} selected
            </Badge>
          )}
        </h3>
        <div className="flex flex-wrap gap-2 max-h-24 overflow-y-auto p-1">
          {availableSkills.map(skill => (
            <Badge
              key={skill}
              variant={selectedSkills.includes(skill) ? "default" : "outline"}
              className={cn(
                "cursor-pointer transition-all hover:scale-105",
                selectedSkills.includes(skill)
                  ? "bg-primary text-primary-foreground"
                  : "hover:border-primary/50"
              )}
              onClick={() => toggleSkill(skill)}
            >
              {skill}
              {selectedSkills.includes(skill) && (
                <X className="w-3 h-3 ml-1" />
              )}
            </Badge>
          ))}
        </div>
      </div>

      {/* Difficulty Selection */}
      <div className="mb-4">
        <h3 className="text-sm font-medium mb-2">Select Difficulty</h3>
        <div className="flex gap-2">
          {(["beginner", "intermediate", "advanced"] as const).map(level => (
            <Button
              key={level}
              variant={selectedDifficulty === level ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedDifficulty(level)}
              className={cn(
                "flex-1 capitalize",
                selectedDifficulty === level && difficultyColors[level]
              )}
            >
              {level}
            </Button>
          ))}
        </div>
      </div>

      {/* Generate Button */}
      <Button
        onClick={handleGenerate}
        disabled={isGenerating || selectedSkills.length === 0}
        className="w-full mb-6 bg-gradient-to-r from-primary to-accent hover:opacity-90"
      >
        <Sparkles className="w-4 h-4 mr-2" />
        {isGenerating ? "Generating..." : selectedSkills.length === 0 ? "Select skills first" : `Generate Ideas (${selectedSkills.length} skills)`}
      </Button>

      {/* Ideas List */}
      <div className="flex-1 overflow-y-auto space-y-3">
        <AnimatePresence>
          {ideas.map((idea, index) => (
            <motion.div
              key={idea.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="rounded-xl border border-border/30 overflow-hidden"
            >
              {/* Header */}
              <button
                onClick={() => setExpandedId(expandedId === idea.id ? null : idea.id)}
                className="w-full p-4 text-left hover:bg-secondary/30 transition-colors"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <h3 className="font-medium mb-2">{idea.title}</h3>
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant="outline" className={difficultyColors[idea.difficulty]}>
                        {idea.difficulty}
                      </Badge>
                      {idea.tags.slice(0, 3).map((tag) => (
                        <Badge key={tag} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  {expandedId === idea.id ? (
                    <ChevronUp className="w-5 h-5 text-muted-foreground" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-muted-foreground" />
                  )}
                </div>
              </button>

              {/* Expanded Content */}
              <AnimatePresence>
                {expandedId === idea.id && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="border-t border-border/30"
                  >
                    <div className="p-4 space-y-4">
                      <p className="text-sm text-muted-foreground">
                        {idea.description}
                      </p>

                      {idea.codeSnippet && (
                        <div className="relative">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-xs text-muted-foreground flex items-center gap-1">
                              <Code className="w-3 h-3" />
                              Starter Code
                            </span>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => copyToClipboard(idea.codeSnippet!, idea.id)}
                              className="h-7"
                            >
                              {copiedId === idea.id ? (
                                <>
                                  <Check className="w-3 h-3 mr-1" />
                                  Copied
                                </>
                              ) : (
                                <>
                                  <Copy className="w-3 h-3 mr-1" />
                                  Copy
                                </>
                              )}
                            </Button>
                          </div>
                          <pre className="p-4 rounded-lg bg-background/50 border border-border/30 overflow-x-auto text-xs">
                            <code>{idea.codeSnippet}</code>
                          </pre>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </AnimatePresence>

        {ideas.length === 0 && (
          <div className="flex-1 flex flex-col items-center justify-center text-center py-12">
            <Lightbulb className="w-12 h-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">
              Select your skills and click "Generate Ideas" to get started!
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
