 import { useRef, useEffect } from "react";
 import { ScrollArea } from "@/components/ui/scroll-area";
 import { ChatMessage, Message } from "./ChatMessage";
 import { VoiceInput } from "./VoiceInput";
 import { JarvisState } from "./JarvisCore";
 
 interface ChatInterfaceProps {
   messages: Message[];
   onSendMessage: (message: string) => void;
   jarvisState: JarvisState;
   isListening: boolean;
   setIsListening: (listening: boolean) => void;
 }
 
 export function ChatInterface({
   messages,
   onSendMessage,
   jarvisState,
   isListening,
   setIsListening,
 }: ChatInterfaceProps) {
   const scrollRef = useRef<HTMLDivElement>(null);
 
   // Auto-scroll to bottom on new messages
   useEffect(() => {
     if (scrollRef.current) {
       scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
     }
   }, [messages]);
 
   return (
     <div className="flex flex-col h-full glass-card overflow-hidden">
       {/* Header */}
       <div className="p-4 border-b border-border/50">
         <h2 className="font-orbitron text-lg tracking-wide text-glow">
           Chat Interface
         </h2>
         <p className="text-xs text-muted-foreground mt-1">
           Communicate with Jarvis via voice or text
         </p>
       </div>
 
       {/* Messages */}
       <ScrollArea className="flex-1" ref={scrollRef}>
         <div className="min-h-full flex flex-col justify-end">
           {messages.length === 0 ? (
             <div className="flex-1 flex items-center justify-center p-8">
               <div className="text-center">
                 <p className="text-muted-foreground text-sm">
                   No messages yet. Say "Hello Jarvis" to begin.
                 </p>
               </div>
             </div>
           ) : (
             <div className="py-4">
               {messages.map((msg) => (
                 <ChatMessage key={msg.id} message={msg} />
               ))}
             </div>
           )}
         </div>
       </ScrollArea>
 
       {/* Input */}
       <VoiceInput
         onMessage={onSendMessage}
         isListening={isListening}
         setIsListening={setIsListening}
         disabled={jarvisState === "thinking" || jarvisState === "speaking"}
       />
     </div>
   );
 }