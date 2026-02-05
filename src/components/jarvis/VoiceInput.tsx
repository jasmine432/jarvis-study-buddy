 import { useState, useEffect, useCallback } from "react";
 import { motion, AnimatePresence } from "framer-motion";
 import { Mic, MicOff, Send } from "lucide-react";
 import { Button } from "@/components/ui/button";
 import { Input } from "@/components/ui/input";
 import { cn } from "@/lib/utils";
 
 interface VoiceInputProps {
   onMessage: (message: string) => void;
   isListening: boolean;
   setIsListening: (listening: boolean) => void;
   disabled?: boolean;
 }
 
 export function VoiceInput({
   onMessage,
   isListening,
   setIsListening,
   disabled,
 }: VoiceInputProps) {
   const [textInput, setTextInput] = useState("");
   const [speechSupported, setSpeechSupported] = useState(false);
   const [transcript, setTranscript] = useState("");
 
   useEffect(() => {
     // Check if SpeechRecognition is supported
     const SpeechRecognition =
       window.SpeechRecognition || window.webkitSpeechRecognition;
     setSpeechSupported(!!SpeechRecognition);
   }, []);
 
   const startListening = useCallback(() => {
     const SpeechRecognition =
       window.SpeechRecognition || window.webkitSpeechRecognition;
     if (!SpeechRecognition) return;
 
     const recognition = new SpeechRecognition();
     recognition.continuous = false;
     recognition.interimResults = true;
     recognition.lang = "en-US";
 
     recognition.onstart = () => {
       setIsListening(true);
       setTranscript("");
     };
 
     recognition.onresult = (event: SpeechRecognitionEvent) => {
       const current = event.resultIndex;
       const result = event.results[current];
       const text = result[0].transcript;
       setTranscript(text);
 
       if (result.isFinal) {
         onMessage(text);
         setTranscript("");
       }
     };
 
     recognition.onerror = () => {
       setIsListening(false);
       setTranscript("");
     };
 
     recognition.onend = () => {
       setIsListening(false);
     };
 
     recognition.start();
   }, [onMessage, setIsListening]);
 
   const handleSubmit = (e: React.FormEvent) => {
     e.preventDefault();
     if (textInput.trim()) {
       onMessage(textInput.trim());
       setTextInput("");
     }
   };
 
   return (
     <div className="p-4 border-t border-border/50 bg-card/30 backdrop-blur-xl">
       {/* Transcript display */}
       <AnimatePresence>
         {transcript && (
           <motion.div
             initial={{ opacity: 0, height: 0 }}
             animate={{ opacity: 1, height: "auto" }}
             exit={{ opacity: 0, height: 0 }}
             className="mb-3 px-4 py-2 rounded-lg bg-secondary/50 border border-border/30"
           >
             <p className="text-sm text-muted-foreground italic">
               {transcript}...
             </p>
           </motion.div>
         )}
       </AnimatePresence>
 
       <form onSubmit={handleSubmit} className="flex items-center gap-3">
         {/* Voice button */}
         {speechSupported && (
           <Button
             type="button"
             variant="outline"
             size="icon"
             onClick={startListening}
             disabled={disabled || isListening}
             className={cn(
               "relative rounded-full transition-all duration-300",
               isListening &&
                 "bg-jarvis-listening/20 border-jarvis-listening text-jarvis-listening"
             )}
           >
             {isListening ? (
               <MicOff className="w-5 h-5" />
             ) : (
               <Mic className="w-5 h-5" />
             )}
             {isListening && (
               <motion.div
                 className="absolute inset-0 rounded-full border-2 border-jarvis-listening"
                 initial={{ scale: 1, opacity: 1 }}
                 animate={{ scale: 1.5, opacity: 0 }}
                 transition={{ duration: 1, repeat: Infinity }}
               />
             )}
           </Button>
         )}
 
         {/* Text input */}
         <Input
           value={textInput}
           onChange={(e) => setTextInput(e.target.value)}
           placeholder={
             isListening
               ? "Listening..."
               : "Type a message or say 'Hello Jarvis'"
           }
           disabled={disabled || isListening}
           className="flex-1 bg-secondary/50 border-border/50 focus:border-primary/50 rounded-xl"
         />
 
         {/* Send button */}
         <Button
           type="submit"
           disabled={disabled || !textInput.trim()}
           className="rounded-full bg-gradient-to-r from-primary to-accent hover:opacity-90 transition-opacity"
         >
           <Send className="w-5 h-5" />
         </Button>
       </form>
 
       {/* Speech hint */}
       {speechSupported && (
         <p className="text-xs text-muted-foreground text-center mt-2">
           Click the microphone and say "Hello Jarvis" to start
         </p>
       )}
     </div>
   );
 }
 
// TypeScript declarations for SpeechRecognition
interface SpeechRecognitionEvent extends Event {
  resultIndex: number;
  results: SpeechRecognitionResultList;
}

interface SpeechRecognitionResultList {
  length: number;
  item(index: number): SpeechRecognitionResult;
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionResult {
  isFinal: boolean;
  length: number;
  item(index: number): SpeechRecognitionAlternative;
  [index: number]: SpeechRecognitionAlternative;
}

interface SpeechRecognitionAlternative {
  transcript: string;
  confidence: number;
}

interface SpeechRecognitionInterface extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onstart: (() => void) | null;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: ((event: Event) => void) | null;
  onend: (() => void) | null;
  start(): void;
  stop(): void;
  abort(): void;
}

declare global {
  interface Window {
    SpeechRecognition: new () => SpeechRecognitionInterface;
    webkitSpeechRecognition: new () => SpeechRecognitionInterface;
  }
}