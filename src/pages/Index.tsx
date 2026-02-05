import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Sidebar, View } from "@/components/jarvis/Sidebar";
import { JarvisCore } from "@/components/jarvis/JarvisCore";
import { ChatInterface } from "@/components/jarvis/ChatInterface";
import { StudyAssistant } from "@/components/jarvis/StudyAssistant";
import { TodoList } from "@/components/jarvis/TodoList";
import { ResumeBuilder } from "@/components/jarvis/ResumeBuilder";
import { ProjectIdeas } from "@/components/jarvis/ProjectIdeas";
import { useJarvis } from "@/hooks/useJarvis";

const Index = () => {
  const [currentView, setCurrentView] = useState<View>("chat");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const {
    jarvisState,
    isListening,
    messages,
    todos,
    topics,
    resume,
    projectIdeas,
    isGeneratingIdeas,
    handleSendMessage,
    handleAddTodo,
    handleToggleTodo,
    handleDeleteTodo,
    handleSelectTopic,
    handleStartExam,
    handleUpdateResume,
    handleGenerateResumeContent,
    handleGenerateIdeas,
    setIsListening,
  } = useJarvis();

  const renderView = () => {
    switch (currentView) {
      case "chat":
        return (
          <div className="flex flex-col lg:flex-row gap-6 h-full">
            {/* Jarvis Core - Hidden on mobile when in chat */}
            <div className="hidden lg:flex flex-col items-center justify-center w-80 shrink-0">
              <JarvisCore state={jarvisState} />
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="mt-16 text-center text-sm text-muted-foreground max-w-xs"
              >
                {jarvisState === "idle" && "Ready to assist you"}
                {jarvisState === "listening" && "Listening..."}
                {jarvisState === "thinking" && "Processing your request..."}
                {jarvisState === "speaking" && "Speaking..."}
              </motion.p>
            </div>

            {/* Chat Interface */}
            <div className="flex-1 min-h-0">
              <ChatInterface
                messages={messages}
                onSendMessage={handleSendMessage}
                jarvisState={jarvisState}
                isListening={isListening}
                setIsListening={setIsListening}
              />
            </div>
          </div>
        );

      case "study":
        return (
          <StudyAssistant
            topics={topics}
            onSelectTopic={handleSelectTopic}
            onStartExam={handleStartExam}
          />
        );

      case "tasks":
        return (
          <TodoList
            todos={todos}
            onAddTodo={handleAddTodo}
            onToggleTodo={handleToggleTodo}
            onDeleteTodo={handleDeleteTodo}
          />
        );

      case "resume":
        return (
          <ResumeBuilder
            resume={resume}
            onUpdateResume={handleUpdateResume}
            onGenerateContent={handleGenerateResumeContent}
          />
        );

      case "projects":
        return (
          <ProjectIdeas
            ideas={projectIdeas}
            onGenerateIdeas={handleGenerateIdeas}
            isGenerating={isGeneratingIdeas}
          />
        );

      default:
        return null;
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Background effects */}
      <div className="fixed inset-0 pointer-events-none">
        {/* Grid pattern */}
        <div className="absolute inset-0 grid-pattern opacity-30" />
        
        {/* Radial glow */}
        <div
          className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[800px] rounded-full opacity-20"
          style={{
            background: "radial-gradient(circle, hsl(var(--primary) / 0.3) 0%, transparent 70%)",
          }}
        />
        
        {/* Scanlines */}
        <div className="absolute inset-0 scanlines opacity-50" />
      </div>

      {/* Sidebar */}
      <Sidebar
        currentView={currentView}
        onViewChange={setCurrentView}
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
      />

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-h-0 relative z-10">
        {/* Mobile Header with Jarvis Core */}
        <div className="lg:hidden flex items-center justify-center py-6 px-4">
          <div className="scale-50">
            <JarvisCore state={jarvisState} />
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 p-4 md:p-6 min-h-0 overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentView}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2 }}
              className="h-full"
            >
              {renderView()}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
};

export default Index;
