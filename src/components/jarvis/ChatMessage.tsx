 import { motion } from "framer-motion";
 import { cn } from "@/lib/utils";
 import { Bot, User } from "lucide-react";
 
 export interface Message {
   id: string;
   role: "user" | "assistant";
   content: string;
   timestamp: Date;
 }
 
 interface ChatMessageProps {
   message: Message;
 }
 
 export function ChatMessage({ message }: ChatMessageProps) {
   const isUser = message.role === "user";
 
   return (
     <motion.div
       initial={{ opacity: 0, y: 20 }}
       animate={{ opacity: 1, y: 0 }}
       className={cn(
         "flex gap-3 p-4",
         isUser ? "flex-row-reverse" : "flex-row"
       )}
     >
       {/* Avatar */}
       <div
         className={cn(
           "flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center",
           isUser
             ? "bg-secondary"
             : "bg-gradient-to-br from-primary to-accent jarvis-glow"
         )}
       >
         {isUser ? (
           <User className="w-5 h-5 text-secondary-foreground" />
         ) : (
           <Bot className="w-5 h-5 text-primary-foreground" />
         )}
       </div>
 
       {/* Message content */}
       <div
         className={cn(
           "max-w-[75%] rounded-2xl px-4 py-3",
           isUser
             ? "bg-primary text-primary-foreground rounded-tr-sm"
             : "glass-card rounded-tl-sm"
         )}
       >
         <p className="text-sm leading-relaxed whitespace-pre-wrap">
           {message.content}
         </p>
         <span className="text-xs opacity-50 mt-2 block">
           {message.timestamp.toLocaleTimeString([], {
             hour: "2-digit",
             minute: "2-digit",
           })}
         </span>
       </div>
     </motion.div>
   );
 }