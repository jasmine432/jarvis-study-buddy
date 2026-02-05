 import { useState } from "react";
 import { motion, AnimatePresence } from "framer-motion";
 import { Plus, CheckCircle, Circle, Trash2, Calendar, ListTodo } from "lucide-react";
 import { Button } from "@/components/ui/button";
 import { Input } from "@/components/ui/input";
 import { Badge } from "@/components/ui/badge";
 import { cn } from "@/lib/utils";
 
 export interface Todo {
   id: string;
   text: string;
   completed: boolean;
   deadline?: Date;
   priority: "low" | "medium" | "high";
   createdAt: Date;
 }
 
 interface TodoListProps {
   todos: Todo[];
   onAddTodo: (text: string, priority?: "low" | "medium" | "high") => void;
   onToggleTodo: (id: string) => void;
   onDeleteTodo: (id: string) => void;
 }
 
 const priorityColors = {
   low: "bg-muted text-muted-foreground",
   medium: "bg-jarvis-listening/20 text-jarvis-listening border-jarvis-listening/30",
   high: "bg-destructive/20 text-destructive border-destructive/30",
 };
 
 export function TodoList({ todos, onAddTodo, onToggleTodo, onDeleteTodo }: TodoListProps) {
   const [newTodo, setNewTodo] = useState("");
   const [showCompleted, setShowCompleted] = useState(true);
 
   const handleSubmit = (e: React.FormEvent) => {
     e.preventDefault();
     if (newTodo.trim()) {
       onAddTodo(newTodo.trim(), "medium");
       setNewTodo("");
     }
   };
 
   const activeTodos = todos.filter((t) => !t.completed);
   const completedTodos = todos.filter((t) => t.completed);
 
   return (
     <div className="glass-card p-6 h-full flex flex-col">
       {/* Header */}
       <div className="flex items-center justify-between mb-6">
         <div>
           <h2 className="font-orbitron text-lg tracking-wide text-glow flex items-center gap-2">
             <ListTodo className="w-5 h-5" />
             Tasks
           </h2>
           <p className="text-xs text-muted-foreground mt-1">
             {activeTodos.length} active, {completedTodos.length} completed
           </p>
         </div>
       </div>
 
       {/* Add Todo Form */}
       <form onSubmit={handleSubmit} className="flex gap-2 mb-4">
         <Input
           value={newTodo}
           onChange={(e) => setNewTodo(e.target.value)}
           placeholder="Add a new task..."
           className="flex-1 bg-secondary/50 border-border/50"
         />
         <Button type="submit" size="icon" disabled={!newTodo.trim()}>
           <Plus className="w-5 h-5" />
         </Button>
       </form>
 
       {/* Todo Items */}
       <div className="flex-1 overflow-y-auto space-y-2">
         <AnimatePresence>
           {activeTodos.map((todo) => (
             <motion.div
               key={todo.id}
               initial={{ opacity: 0, y: -10 }}
               animate={{ opacity: 1, y: 0 }}
               exit={{ opacity: 0, x: -100 }}
               className={cn(
                 "flex items-center gap-3 p-3 rounded-xl border border-border/30",
                 "bg-secondary/20 hover:bg-secondary/30 transition-colors group"
               )}
             >
               <button
                 onClick={() => onToggleTodo(todo.id)}
                 className="flex-shrink-0 text-muted-foreground hover:text-primary transition-colors"
               >
                 <Circle className="w-5 h-5" />
               </button>
               <div className="flex-1 min-w-0">
                 <p className="text-sm truncate">{todo.text}</p>
                 <div className="flex items-center gap-2 mt-1">
                   <Badge variant="outline" className={cn("text-xs", priorityColors[todo.priority])}>
                     {todo.priority}
                   </Badge>
                   {todo.deadline && (
                     <span className="text-xs text-muted-foreground flex items-center gap-1">
                       <Calendar className="w-3 h-3" />
                       {todo.deadline.toLocaleDateString()}
                     </span>
                   )}
                 </div>
               </div>
               <button
                 onClick={() => onDeleteTodo(todo.id)}
                 className="flex-shrink-0 opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive transition-all"
               >
                 <Trash2 className="w-4 h-4" />
               </button>
             </motion.div>
           ))}
         </AnimatePresence>
 
         {/* Completed Section */}
         {completedTodos.length > 0 && (
           <div className="pt-4">
             <button
               onClick={() => setShowCompleted(!showCompleted)}
               className="text-xs text-muted-foreground hover:text-foreground transition-colors mb-2 flex items-center gap-1"
             >
               <CheckCircle className="w-3 h-3" />
               {showCompleted ? "Hide" : "Show"} completed ({completedTodos.length})
             </button>
 
             <AnimatePresence>
               {showCompleted &&
                 completedTodos.map((todo) => (
                   <motion.div
                     key={todo.id}
                     initial={{ opacity: 0, height: 0 }}
                     animate={{ opacity: 1, height: "auto" }}
                     exit={{ opacity: 0, height: 0 }}
                     className="flex items-center gap-3 p-3 rounded-xl opacity-50"
                   >
                     <button
                       onClick={() => onToggleTodo(todo.id)}
                       className="flex-shrink-0 text-jarvis-speaking"
                     >
                       <CheckCircle className="w-5 h-5" />
                     </button>
                     <p className="text-sm line-through text-muted-foreground flex-1">
                       {todo.text}
                     </p>
                     <button
                       onClick={() => onDeleteTodo(todo.id)}
                       className="flex-shrink-0 text-muted-foreground hover:text-destructive transition-colors"
                     >
                       <Trash2 className="w-4 h-4" />
                     </button>
                   </motion.div>
                 ))}
             </AnimatePresence>
           </div>
         )}
 
         {todos.length === 0 && (
           <div className="flex-1 flex items-center justify-center text-muted-foreground text-sm">
             No tasks yet. Add one above or ask Jarvis!
           </div>
         )}
       </div>
     </div>
   );
 }