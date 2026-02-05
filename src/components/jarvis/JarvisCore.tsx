 import { motion } from "framer-motion";
 import { cn } from "@/lib/utils";
 
 export type JarvisState = "idle" | "listening" | "thinking" | "speaking";
 
 interface JarvisCoreProps {
   state: JarvisState;
   className?: string;
 }
 
 const stateColors = {
   idle: "from-primary/80 to-accent/60",
   listening: "from-jarvis-listening to-destructive/60",
   thinking: "from-jarvis-thinking to-purple-500/60",
   speaking: "from-jarvis-speaking to-emerald-400/60",
 };
 
 const stateGlows = {
   idle: "shadow-[0_0_60px_hsl(var(--primary)/0.4),0_0_120px_hsl(var(--primary)/0.2)]",
   listening: "shadow-[0_0_60px_hsl(var(--jarvis-listening)/0.5),0_0_120px_hsl(var(--jarvis-listening)/0.3)]",
   thinking: "shadow-[0_0_60px_hsl(var(--jarvis-thinking)/0.5),0_0_120px_hsl(var(--jarvis-thinking)/0.3)]",
   speaking: "shadow-[0_0_60px_hsl(var(--jarvis-speaking)/0.5),0_0_120px_hsl(var(--jarvis-speaking)/0.3)]",
 };
 
 export function JarvisCore({ state, className }: JarvisCoreProps) {
   return (
     <div className={cn("relative flex items-center justify-center", className)}>
       {/* Outer rotating rings */}
       <motion.div
         className="absolute w-48 h-48 rounded-full border border-primary/20"
         animate={{ rotate: 360 }}
         transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
       >
         <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-primary" />
       </motion.div>
 
       <motion.div
         className="absolute w-40 h-40 rounded-full border border-accent/30"
         animate={{ rotate: -360 }}
         transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
       >
         <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 w-1.5 h-1.5 rounded-full bg-accent" />
       </motion.div>
 
       {/* Pulsing rings for listening state */}
       {state === "listening" && (
         <>
           <motion.div
             className="absolute w-32 h-32 rounded-full border-2 border-jarvis-listening/50"
             initial={{ scale: 1, opacity: 1 }}
             animate={{ scale: 1.8, opacity: 0 }}
             transition={{ duration: 1.5, repeat: Infinity, ease: "easeOut" }}
           />
           <motion.div
             className="absolute w-32 h-32 rounded-full border-2 border-jarvis-listening/50"
             initial={{ scale: 1, opacity: 1 }}
             animate={{ scale: 1.8, opacity: 0 }}
             transition={{ duration: 1.5, repeat: Infinity, ease: "easeOut", delay: 0.5 }}
           />
         </>
       )}
 
       {/* Thinking particles */}
       {state === "thinking" && (
         <>
           {[...Array(6)].map((_, i) => (
             <motion.div
               key={i}
               className="absolute w-2 h-2 rounded-full bg-jarvis-thinking"
               initial={{ opacity: 0 }}
               animate={{
                 opacity: [0, 1, 0],
                 x: [0, Math.cos((i * Math.PI) / 3) * 60],
                 y: [0, Math.sin((i * Math.PI) / 3) * 60],
               }}
               transition={{
                 duration: 1.5,
                 repeat: Infinity,
                 delay: i * 0.2,
                 ease: "easeInOut",
               }}
             />
           ))}
         </>
       )}
 
       {/* Speaking waves */}
       {state === "speaking" && (
         <motion.div
           className="absolute w-36 h-36 rounded-full"
           style={{
             background: `radial-gradient(circle, transparent 40%, hsl(var(--jarvis-speaking) / 0.1) 50%, transparent 60%)`,
           }}
           animate={{ scale: [1, 1.3, 1] }}
           transition={{ duration: 0.8, repeat: Infinity, ease: "easeInOut" }}
         />
       )}
 
       {/* Core orb */}
       <motion.div
         className={cn(
           "relative w-28 h-28 rounded-full bg-gradient-to-br",
           stateColors[state],
           stateGlows[state]
         )}
         animate={{
           scale: state === "speaking" ? [1, 1.05, 1] : 1,
         }}
         transition={{
           duration: 0.5,
           repeat: state === "speaking" ? Infinity : 0,
           ease: "easeInOut",
         }}
       >
         {/* Inner glow */}
         <div className="absolute inset-2 rounded-full bg-gradient-to-br from-white/20 to-transparent" />
         
         {/* Center highlight */}
         <motion.div
           className="absolute inset-0 flex items-center justify-center"
           animate={{ opacity: [0.5, 1, 0.5] }}
           transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
         >
           <div className="w-8 h-8 rounded-full bg-white/30 blur-sm" />
         </motion.div>
 
         {/* Hexagon pattern overlay */}
         <div className="absolute inset-0 rounded-full opacity-20">
           <svg viewBox="0 0 100 100" className="w-full h-full">
             <defs>
               <pattern id="hexagons" width="10" height="8.66" patternUnits="userSpaceOnUse">
                 <polygon
                   points="5,0 10,2.89 10,5.77 5,8.66 0,5.77 0,2.89"
                   fill="none"
                   stroke="currentColor"
                   strokeWidth="0.5"
                 />
               </pattern>
             </defs>
             <circle cx="50" cy="50" r="48" fill="url(#hexagons)" />
           </svg>
         </div>
       </motion.div>
 
       {/* State label */}
       <motion.div
         className="absolute -bottom-12 left-1/2 -translate-x-1/2"
         initial={{ opacity: 0, y: 10 }}
         animate={{ opacity: 1, y: 0 }}
         key={state}
       >
         <span className="font-orbitron text-xs tracking-widest uppercase text-muted-foreground">
           {state}
         </span>
       </motion.div>
     </div>
   );
 }