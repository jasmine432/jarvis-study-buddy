 import { motion } from "framer-motion";
 import { 
   MessageSquare, 
   BookOpen, 
   ListTodo, 
   FileText, 
   Lightbulb,
   Settings,
   Menu,
   X
 } from "lucide-react";
 import { Button } from "@/components/ui/button";
 import { cn } from "@/lib/utils";
 
 export type View = "chat" | "study" | "tasks" | "resume" | "projects";
 
 interface SidebarProps {
   currentView: View;
   onViewChange: (view: View) => void;
   isOpen: boolean;
   onToggle: () => void;
 }
 
 const navItems = [
   { id: "chat" as View, label: "Chat", icon: MessageSquare },
   { id: "study" as View, label: "Study", icon: BookOpen },
   { id: "tasks" as View, label: "Tasks", icon: ListTodo },
   { id: "resume" as View, label: "Resume", icon: FileText },
   { id: "projects" as View, label: "Projects", icon: Lightbulb },
 ];
 
 export function Sidebar({ currentView, onViewChange, isOpen, onToggle }: SidebarProps) {
   return (
     <>
       {/* Mobile Toggle */}
       <Button
         variant="ghost"
         size="icon"
         onClick={onToggle}
         className="fixed top-4 left-4 z-50 md:hidden"
       >
         {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
       </Button>
 
       {/* Backdrop */}
       {isOpen && (
         <motion.div
           initial={{ opacity: 0 }}
           animate={{ opacity: 1 }}
           exit={{ opacity: 0 }}
           onClick={onToggle}
           className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 md:hidden"
         />
       )}
 
       {/* Sidebar */}
       <motion.aside
         initial={false}
         animate={{ x: isOpen ? 0 : "-100%" }}
         className={cn(
           "fixed left-0 top-0 h-full w-64 z-50 md:relative md:translate-x-0",
           "bg-sidebar border-r border-sidebar-border",
           "flex flex-col"
         )}
       >
         {/* Logo */}
         <div className="p-6 border-b border-sidebar-border">
           <h1 className="font-orbitron text-2xl font-bold tracking-wider text-glow text-primary">
             JARVIS
           </h1>
           <p className="text-xs text-muted-foreground mt-1">
             Personal AI Assistant
           </p>
         </div>
 
         {/* Navigation */}
         <nav className="flex-1 p-4 space-y-1">
           {navItems.map((item) => (
             <Button
               key={item.id}
               variant="ghost"
               onClick={() => {
                 onViewChange(item.id);
                 if (window.innerWidth < 768) onToggle();
               }}
               className={cn(
                 "w-full justify-start gap-3 rounded-xl transition-all",
                 currentView === item.id
                   ? "bg-sidebar-accent text-sidebar-accent-foreground glow-border"
                   : "text-sidebar-foreground hover:bg-sidebar-accent/50"
               )}
             >
               <item.icon className="w-5 h-5" />
               {item.label}
             </Button>
           ))}
         </nav>
 
         {/* Footer */}
         <div className="p-4 border-t border-sidebar-border">
           <Button
             variant="ghost"
             className="w-full justify-start gap-3 text-sidebar-foreground hover:bg-sidebar-accent/50 rounded-xl"
           >
             <Settings className="w-5 h-5" />
             Settings
           </Button>
         </div>
       </motion.aside>
     </>
   );
 }