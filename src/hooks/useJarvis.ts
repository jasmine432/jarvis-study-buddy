import { useState, useCallback, useRef } from "react";
import { JarvisState } from "@/components/jarvis/JarvisCore";
import { Message } from "@/components/jarvis/ChatMessage";
import { Todo } from "@/components/jarvis/TodoList";
import { Topic } from "@/components/jarvis/StudyAssistant";
import { ResumeData } from "@/components/jarvis/ResumeBuilder";
import { ProjectIdea } from "@/components/jarvis/ProjectIdeas";
import { streamChat } from "@/lib/ai";
import { toast } from "sonner";
 
 // Text-to-speech function
 const speak = (text: string): Promise<void> => {
   return new Promise((resolve) => {
     if (!("speechSynthesis" in window)) {
       resolve();
       return;
     }
 
     const utterance = new SpeechSynthesisUtterance(text);
     utterance.rate = 1;
     utterance.pitch = 1;
     utterance.voice = speechSynthesis.getVoices().find((v) => v.lang.startsWith("en")) || null;
 
     utterance.onend = () => resolve();
     utterance.onerror = () => resolve();
 
     speechSynthesis.speak(utterance);
   });
 };
 
 // LocalStorage keys
 const STORAGE_KEYS = {
   TODOS: "jarvis_todos",
   TOPICS: "jarvis_topics",
   RESUME: "jarvis_resume",
   PROJECTS: "jarvis_projects",
   MESSAGES: "jarvis_messages",
 };
 
 // Load from localStorage
 const loadFromStorage = <T>(key: string, defaultValue: T): T => {
   try {
     const stored = localStorage.getItem(key);
    if (stored) {
      const parsed = JSON.parse(stored);
      // Convert date strings back to Date objects for messages
      if (key === STORAGE_KEYS.MESSAGES && Array.isArray(parsed)) {
        return parsed.map((msg: Message) => ({
          ...msg,
          timestamp: new Date(msg.timestamp),
        })) as T;
      }
      // Convert date strings for todos
      if (key === STORAGE_KEYS.TODOS && Array.isArray(parsed)) {
        return parsed.map((todo: Todo) => ({
          ...todo,
          createdAt: new Date(todo.createdAt),
          deadline: todo.deadline ? new Date(todo.deadline) : undefined,
        })) as T;
      }
      return parsed;
    }
   } catch (e) {
     console.error("Error loading from storage:", e);
   }
   return defaultValue;
 };
 
 // Save to localStorage
 const saveToStorage = <T>(key: string, value: T): void => {
   try {
     localStorage.setItem(key, JSON.stringify(value));
   } catch (e) {
     console.error("Error saving to storage:", e);
   }
 };
 
 // Default topics
 const defaultTopics: Topic[] = [
   { id: "1", name: "Linear Algebra", subject: "math", status: "not_started", progress: 0 },
   { id: "2", name: "Calculus", subject: "math", status: "in_progress", progress: 45 },
   { id: "3", name: "Probability", subject: "math", status: "completed", progress: 100 },
   { id: "4", name: "Mechanics", subject: "physics", status: "not_started", progress: 0 },
   { id: "5", name: "Thermodynamics", subject: "physics", status: "in_progress", progress: 30 },
   { id: "6", name: "Data Structures", subject: "cs", status: "completed", progress: 100 },
   { id: "7", name: "Algorithms", subject: "cs", status: "in_progress", progress: 60 },
   { id: "8", name: "Operating Systems", subject: "cs", status: "not_started", progress: 0 },
 ];
 
 // Default resume
 const defaultResume: ResumeData = {
   name: "",
   email: "",
   phone: "",
   summary: "",
   education: [],
   experience: [],
   skills: [],
 };
 
 // Default project ideas
 const defaultProjectIdeas: ProjectIdea[] = [
   {
     id: "1",
     title: "Personal Portfolio Website",
     description: "Create a responsive portfolio to showcase your projects and skills. Perfect for beginners learning HTML, CSS, and JavaScript.",
     difficulty: "beginner",
     tags: ["HTML", "CSS", "JavaScript", "Portfolio"],
     codeSnippet: `<!DOCTYPE html>
 <html lang="en">
 <head>
   <meta charset="UTF-8">
   <title>My Portfolio</title>
 </head>
 <body>
   <header>
     <h1>Your Name</h1>
     <nav>
       <a href="#projects">Projects</a>
       <a href="#contact">Contact</a>
     </nav>
   </header>
 </body>
 </html>`,
   },
   {
     id: "2",
     title: "Task Management API",
     description: "Build a RESTful API for managing tasks with authentication, CRUD operations, and database integration.",
     difficulty: "intermediate",
     tags: ["Node.js", "Express", "MongoDB", "REST API"],
     codeSnippet: `const express = require('express');
 const app = express();
 
 app.use(express.json());
 
 let tasks = [];
 
 app.get('/api/tasks', (req, res) => {
   res.json(tasks);
 });
 
 app.post('/api/tasks', (req, res) => {
   const task = { id: Date.now(), ...req.body };
   tasks.push(task);
   res.status(201).json(task);
 });
 
 app.listen(3000);`,
   },
 ];
 
 export function useJarvis() {
   const [jarvisState, setJarvisState] = useState<JarvisState>("idle");
   const [isListening, setIsListening] = useState(false);
   const [messages, setMessages] = useState<Message[]>(() =>
     loadFromStorage(STORAGE_KEYS.MESSAGES, [])
   );
   const [todos, setTodos] = useState<Todo[]>(() =>
     loadFromStorage(STORAGE_KEYS.TODOS, [])
   );
   const [topics, setTopics] = useState<Topic[]>(() =>
     loadFromStorage(STORAGE_KEYS.TOPICS, defaultTopics)
   );
   const [resume, setResume] = useState<ResumeData>(() =>
     loadFromStorage(STORAGE_KEYS.RESUME, defaultResume)
   );
   const [projectIdeas, setProjectIdeas] = useState<ProjectIdea[]>(() =>
     loadFromStorage(STORAGE_KEYS.PROJECTS, defaultProjectIdeas)
   );
   const [isGeneratingIdeas, setIsGeneratingIdeas] = useState(false);
 
  // Ref to track current assistant message for streaming
  const assistantMessageRef = useRef<string>("");

  // Handle sending a message
  const handleSendMessage = useCallback(async (text: string) => {
    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: text,
      timestamp: new Date(),
    };

    setMessages((prev) => {
      const updated = [...prev, userMessage];
      saveToStorage(STORAGE_KEYS.MESSAGES, updated);
      return updated;
    });

    // Update state to thinking
    setJarvisState("thinking");
    setIsListening(false);

    // Reset the assistant message accumulator
    assistantMessageRef.current = "";
    const assistantMessageId = (Date.now() + 1).toString();

    // Build message history for context (last 10 messages)
    const messageHistory = messages.slice(-10).map((msg) => ({
      role: msg.role as "user" | "assistant",
      content: msg.content,
    }));
    messageHistory.push({ role: "user", content: text });

    try {
      await streamChat({
        messages: messageHistory,
        onDelta: (chunk) => {
          assistantMessageRef.current += chunk;
          
          setMessages((prev) => {
            const lastMsg = prev[prev.length - 1];
            
            // If last message is already the assistant streaming message, update it
            if (lastMsg?.id === assistantMessageId && lastMsg?.role === "assistant") {
              return prev.map((m) =>
                m.id === assistantMessageId
                  ? { ...m, content: assistantMessageRef.current }
                  : m
              );
            }
            
            // First chunk: create the assistant message
            return [
              ...prev,
              {
                id: assistantMessageId,
                role: "assistant" as const,
                content: assistantMessageRef.current,
                timestamp: new Date(),
              },
            ];
          });
        },
        onDone: () => {
          // Save final messages to storage
          setMessages((prev) => {
            saveToStorage(STORAGE_KEYS.MESSAGES, prev);
            return prev;
          });
          
          // Speak the response (optional - only first 500 chars to keep it short)
          const responseToSpeak = assistantMessageRef.current.slice(0, 500);
          setJarvisState("speaking");
          speak(responseToSpeak).finally(() => {
            setJarvisState("idle");
          });
        },
        onError: (error) => {
          console.error("AI Error:", error);
          toast.error(error.message || "Failed to get AI response");
          setJarvisState("idle");
        },
      });
    } catch (error) {
      console.error("Error processing message:", error);
      toast.error("Failed to connect to AI");
      setJarvisState("idle");
    }
  }, [messages]);
 
   // Todo handlers
   const handleAddTodo = useCallback((text: string, priority: "low" | "medium" | "high" = "medium") => {
     const newTodo: Todo = {
       id: Date.now().toString(),
       text,
       completed: false,
       priority,
       createdAt: new Date(),
     };
     setTodos((prev) => {
       const updated = [newTodo, ...prev];
       saveToStorage(STORAGE_KEYS.TODOS, updated);
       return updated;
     });
   }, []);
 
   const handleToggleTodo = useCallback((id: string) => {
     setTodos((prev) => {
       const updated = prev.map((t) =>
         t.id === id ? { ...t, completed: !t.completed } : t
       );
       saveToStorage(STORAGE_KEYS.TODOS, updated);
       return updated;
     });
   }, []);
 
   const handleDeleteTodo = useCallback((id: string) => {
     setTodos((prev) => {
       const updated = prev.filter((t) => t.id !== id);
       saveToStorage(STORAGE_KEYS.TODOS, updated);
       return updated;
     });
   }, []);
 
   // Topic handlers
   const handleSelectTopic = useCallback((topic: Topic) => {
     // Update topic status to in_progress if not started
     if (topic.status === "not_started") {
       setTopics((prev) => {
         const updated = prev.map((t) =>
           t.id === topic.id ? { ...t, status: "in_progress" as const, progress: 10 } : t
         );
         saveToStorage(STORAGE_KEYS.TOPICS, updated);
         return updated;
       });
     }
     
     // Send a message about the topic
     handleSendMessage(`I want to study ${topic.name}`);
   }, [handleSendMessage]);
 
 
   // Resume handlers
   const handleUpdateResume = useCallback((data: ResumeData) => {
     setResume(data);
     saveToStorage(STORAGE_KEYS.RESUME, data);
   }, []);
 
   const handleGenerateResumeContent = useCallback((section: string) => {
     handleSendMessage(`Generate content for my resume ${section} section`);
   }, [handleSendMessage]);
 
  // Project ideas handlers
  const handleGenerateIdeas = useCallback(async (
    skills: string[],
    difficulty: "beginner" | "intermediate" | "advanced"
  ) => {
    if (skills.length === 0) {
      toast.error("Please select at least one skill");
      return;
    }

    setIsGeneratingIdeas(true);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-project-ideas`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({
            skills,
            difficulty,
            count: 3,
          }),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        if (response.status === 429) {
          toast.error("Rate limit exceeded. Please try again in a moment.");
          return;
        }
        if (response.status === 402) {
          toast.error("AI credits depleted. Please add funds to continue.");
          return;
        }
        throw new Error(error.error || "Failed to generate ideas");
      }

      const data = await response.json();

      if (!data.ideas || data.ideas.length === 0) {
        throw new Error("No ideas received");
      }

      setProjectIdeas((prev) => {
        const updated = [...data.ideas, ...prev];
        saveToStorage(STORAGE_KEYS.PROJECTS, updated);
        return updated;
      });

      toast.success(`Generated ${data.ideas.length} new project ideas!`);
    } catch (error) {
      console.error("Error generating project ideas:", error);
      toast.error(error instanceof Error ? error.message : "Failed to generate ideas");
    } finally {
      setIsGeneratingIdeas(false);
    }
  }, []);
 
   // Update listening state
   const handleSetIsListening = useCallback((listening: boolean) => {
     setIsListening(listening);
     if (listening) {
       setJarvisState("listening");
     } else if (jarvisState === "listening") {
       setJarvisState("idle");
     }
   }, [jarvisState]);
 
   return {
     // State
     jarvisState,
     isListening,
     messages,
     todos,
     topics,
     resume,
     projectIdeas,
     isGeneratingIdeas,
     
     // Handlers
     handleSendMessage,
     handleAddTodo,
     handleToggleTodo,
     handleDeleteTodo,
    handleSelectTopic,
     handleUpdateResume,
     handleGenerateResumeContent,
     handleGenerateIdeas,
     setIsListening: handleSetIsListening,
   };
 }