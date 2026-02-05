 import { useState } from "react";
 import { motion } from "framer-motion";
 import { Book, Brain, GraduationCap, ChevronRight, Play, CheckCircle } from "lucide-react";
 import { Button } from "@/components/ui/button";
 import { Badge } from "@/components/ui/badge";
 import { Progress } from "@/components/ui/progress";
 import { cn } from "@/lib/utils";
 
 export type TopicStatus = "not_started" | "in_progress" | "completed";
 
 export interface Topic {
   id: string;
   name: string;
   subject: string;
   status: TopicStatus;
   progress: number;
 }
 
 interface StudyAssistantProps {
   topics: Topic[];
   onSelectTopic: (topic: Topic) => void;
   onStartExam: () => void;
 }
 
 const subjects = [
   { id: "math", name: "Mathematics", icon: Brain, color: "from-blue-500 to-cyan-400" },
   { id: "physics", name: "Physics", icon: GraduationCap, color: "from-purple-500 to-pink-400" },
   { id: "cs", name: "Computer Science", icon: Book, color: "from-green-500 to-emerald-400" },
 ];
 
 const statusColors: Record<TopicStatus, string> = {
   not_started: "bg-muted text-muted-foreground",
   in_progress: "bg-jarvis-listening/20 text-jarvis-listening border-jarvis-listening/30",
   completed: "bg-jarvis-speaking/20 text-jarvis-speaking border-jarvis-speaking/30",
 };
 
 const statusLabels: Record<TopicStatus, string> = {
   not_started: "Not Started",
   in_progress: "In Progress",
   completed: "Completed",
 };
 
 export function StudyAssistant({ topics, onSelectTopic, onStartExam }: StudyAssistantProps) {
   const [selectedSubject, setSelectedSubject] = useState<string | null>(null);
 
   const filteredTopics = selectedSubject
     ? topics.filter((t) => t.subject === selectedSubject)
     : topics;
 
   const completedCount = topics.filter((t) => t.status === "completed").length;
   const overallProgress = topics.length > 0 ? (completedCount / topics.length) * 100 : 0;
 
   return (
     <div className="glass-card p-6 h-full flex flex-col">
       {/* Header */}
       <div className="flex items-center justify-between mb-6">
         <div>
           <h2 className="font-orbitron text-lg tracking-wide text-glow flex items-center gap-2">
             <Book className="w-5 h-5" />
             Study Assistant
           </h2>
           <p className="text-xs text-muted-foreground mt-1">
             Master your subjects with AI guidance
           </p>
         </div>
         <Button
           onClick={onStartExam}
           className="bg-gradient-to-r from-jarvis-thinking to-purple-500 hover:opacity-90"
         >
           <Play className="w-4 h-4 mr-2" />
           Exam Mode
         </Button>
       </div>
 
       {/* Overall Progress */}
       <div className="mb-6 p-4 rounded-xl bg-secondary/30 border border-border/30">
         <div className="flex items-center justify-between mb-2">
           <span className="text-sm text-muted-foreground">Overall Progress</span>
           <span className="font-orbitron text-sm text-primary">
             {completedCount}/{topics.length} Topics
           </span>
         </div>
         <Progress value={overallProgress} className="h-2" />
       </div>
 
       {/* Subject Filters */}
       <div className="flex flex-wrap gap-2 mb-4">
         <Button
           variant={selectedSubject === null ? "default" : "outline"}
           size="sm"
           onClick={() => setSelectedSubject(null)}
           className="rounded-full"
         >
           All
         </Button>
         {subjects.map((subject) => (
           <Button
             key={subject.id}
             variant={selectedSubject === subject.id ? "default" : "outline"}
             size="sm"
             onClick={() => setSelectedSubject(subject.id)}
             className="rounded-full"
           >
             <subject.icon className="w-4 h-4 mr-1" />
             {subject.name}
           </Button>
         ))}
       </div>
 
       {/* Topics List */}
       <div className="flex-1 overflow-y-auto space-y-2">
         {filteredTopics.map((topic, index) => (
           <motion.div
             key={topic.id}
             initial={{ opacity: 0, x: -20 }}
             animate={{ opacity: 1, x: 0 }}
             transition={{ delay: index * 0.05 }}
             onClick={() => onSelectTopic(topic)}
             className={cn(
               "p-4 rounded-xl border border-border/30 cursor-pointer transition-all",
               "hover:border-primary/50 hover:bg-secondary/30 group"
             )}
           >
             <div className="flex items-center justify-between">
               <div className="flex-1">
                 <div className="flex items-center gap-2 mb-1">
                   <span className="font-medium">{topic.name}</span>
                   {topic.status === "completed" && (
                     <CheckCircle className="w-4 h-4 text-jarvis-speaking" />
                   )}
                 </div>
                 <div className="flex items-center gap-2">
                   <Badge variant="outline" className={statusColors[topic.status]}>
                     {statusLabels[topic.status]}
                   </Badge>
                   {topic.status === "in_progress" && (
                     <span className="text-xs text-muted-foreground">
                       {topic.progress}% complete
                     </span>
                   )}
                 </div>
               </div>
               <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
             </div>
             {topic.status === "in_progress" && (
               <Progress value={topic.progress} className="h-1 mt-3" />
             )}
           </motion.div>
         ))}
       </div>
     </div>
   );
 }