 import { useState } from "react";
 import { motion } from "framer-motion";
 import { FileText, Plus, Trash2, Download, Sparkles } from "lucide-react";
 import { Button } from "@/components/ui/button";
 import { Input } from "@/components/ui/input";
 import { Textarea } from "@/components/ui/textarea";
 import { Label } from "@/components/ui/label";
 
 export interface ResumeData {
   name: string;
   email: string;
   phone: string;
   summary: string;
   education: Array<{ school: string; degree: string; year: string }>;
   experience: Array<{ company: string; role: string; duration: string; description: string }>;
   skills: string[];
 }
 
 interface ResumeBuilderProps {
   resume: ResumeData;
   onUpdateResume: (data: ResumeData) => void;
   onGenerateContent: (section: string) => void;
 }
 
 export function ResumeBuilder({ resume, onUpdateResume, onGenerateContent }: ResumeBuilderProps) {
   const [activeSection, setActiveSection] = useState<"personal" | "education" | "experience" | "skills">("personal");
 
   const addEducation = () => {
     onUpdateResume({
       ...resume,
       education: [...resume.education, { school: "", degree: "", year: "" }],
     });
   };
 
   const addExperience = () => {
     onUpdateResume({
       ...resume,
       experience: [...resume.experience, { company: "", role: "", duration: "", description: "" }],
     });
   };
 
   const addSkill = () => {
     onUpdateResume({
       ...resume,
       skills: [...resume.skills, ""],
     });
   };
 
   return (
     <div className="glass-card p-6 h-full flex flex-col">
       {/* Header */}
       <div className="flex items-center justify-between mb-6">
         <div>
           <h2 className="font-orbitron text-lg tracking-wide text-glow flex items-center gap-2">
             <FileText className="w-5 h-5" />
             Resume Builder
           </h2>
           <p className="text-xs text-muted-foreground mt-1">
             Build your professional resume with AI assistance
           </p>
         </div>
         <Button variant="outline" size="sm">
           <Download className="w-4 h-4 mr-2" />
           Export
         </Button>
       </div>
 
       {/* Section Tabs */}
       <div className="flex gap-2 mb-6 flex-wrap">
         {(["personal", "education", "experience", "skills"] as const).map((section) => (
           <Button
             key={section}
             variant={activeSection === section ? "default" : "outline"}
             size="sm"
             onClick={() => setActiveSection(section)}
             className="capitalize rounded-full"
           >
             {section}
           </Button>
         ))}
       </div>
 
       {/* Section Content */}
       <div className="flex-1 overflow-y-auto space-y-4">
         {activeSection === "personal" && (
           <motion.div
             initial={{ opacity: 0 }}
             animate={{ opacity: 1 }}
             className="space-y-4"
           >
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               <div className="space-y-2">
                 <Label>Full Name</Label>
                 <Input
                   value={resume.name}
                   onChange={(e) => onUpdateResume({ ...resume, name: e.target.value })}
                   placeholder="John Doe"
                   className="bg-secondary/50"
                 />
               </div>
               <div className="space-y-2">
                 <Label>Email</Label>
                 <Input
                   value={resume.email}
                   onChange={(e) => onUpdateResume({ ...resume, email: e.target.value })}
                   placeholder="john@example.com"
                   className="bg-secondary/50"
                 />
               </div>
             </div>
             <div className="space-y-2">
               <Label>Phone</Label>
               <Input
                 value={resume.phone}
                 onChange={(e) => onUpdateResume({ ...resume, phone: e.target.value })}
                 placeholder="+1 234 567 8900"
                 className="bg-secondary/50"
               />
             </div>
             <div className="space-y-2">
               <div className="flex items-center justify-between">
                 <Label>Professional Summary</Label>
                 <Button
                   variant="ghost"
                   size="sm"
                   onClick={() => onGenerateContent("summary")}
                   className="text-primary hover:text-primary"
                 >
                   <Sparkles className="w-4 h-4 mr-1" />
                   Generate
                 </Button>
               </div>
               <Textarea
                 value={resume.summary}
                 onChange={(e) => onUpdateResume({ ...resume, summary: e.target.value })}
                 placeholder="A brief professional summary..."
                 className="bg-secondary/50 min-h-[100px]"
               />
             </div>
           </motion.div>
         )}
 
         {activeSection === "education" && (
           <motion.div
             initial={{ opacity: 0 }}
             animate={{ opacity: 1 }}
             className="space-y-4"
           >
             {resume.education.map((edu, index) => (
               <div key={index} className="p-4 rounded-xl border border-border/30 space-y-3">
                 <div className="flex items-center justify-between">
                   <span className="text-sm font-medium">Education {index + 1}</span>
                   <Button
                     variant="ghost"
                     size="sm"
                     onClick={() => {
                       const newEdu = resume.education.filter((_, i) => i !== index);
                       onUpdateResume({ ...resume, education: newEdu });
                     }}
                   >
                     <Trash2 className="w-4 h-4" />
                   </Button>
                 </div>
                 <Input
                   value={edu.school}
                   onChange={(e) => {
                     const newEdu = [...resume.education];
                     newEdu[index].school = e.target.value;
                     onUpdateResume({ ...resume, education: newEdu });
                   }}
                   placeholder="University Name"
                   className="bg-secondary/50"
                 />
                 <div className="grid grid-cols-2 gap-2">
                   <Input
                     value={edu.degree}
                     onChange={(e) => {
                       const newEdu = [...resume.education];
                       newEdu[index].degree = e.target.value;
                       onUpdateResume({ ...resume, education: newEdu });
                     }}
                     placeholder="Degree"
                     className="bg-secondary/50"
                   />
                   <Input
                     value={edu.year}
                     onChange={(e) => {
                       const newEdu = [...resume.education];
                       newEdu[index].year = e.target.value;
                       onUpdateResume({ ...resume, education: newEdu });
                     }}
                     placeholder="Year"
                     className="bg-secondary/50"
                   />
                 </div>
               </div>
             ))}
             <Button variant="outline" onClick={addEducation} className="w-full">
               <Plus className="w-4 h-4 mr-2" />
               Add Education
             </Button>
           </motion.div>
         )}
 
         {activeSection === "experience" && (
           <motion.div
             initial={{ opacity: 0 }}
             animate={{ opacity: 1 }}
             className="space-y-4"
           >
             {resume.experience.map((exp, index) => (
               <div key={index} className="p-4 rounded-xl border border-border/30 space-y-3">
                 <div className="flex items-center justify-between">
                   <span className="text-sm font-medium">Experience {index + 1}</span>
                   <Button
                     variant="ghost"
                     size="sm"
                     onClick={() => {
                       const newExp = resume.experience.filter((_, i) => i !== index);
                       onUpdateResume({ ...resume, experience: newExp });
                     }}
                   >
                     <Trash2 className="w-4 h-4" />
                   </Button>
                 </div>
                 <div className="grid grid-cols-2 gap-2">
                   <Input
                     value={exp.company}
                     onChange={(e) => {
                       const newExp = [...resume.experience];
                       newExp[index].company = e.target.value;
                       onUpdateResume({ ...resume, experience: newExp });
                     }}
                     placeholder="Company"
                     className="bg-secondary/50"
                   />
                   <Input
                     value={exp.role}
                     onChange={(e) => {
                       const newExp = [...resume.experience];
                       newExp[index].role = e.target.value;
                       onUpdateResume({ ...resume, experience: newExp });
                     }}
                     placeholder="Role"
                     className="bg-secondary/50"
                   />
                 </div>
                 <Input
                   value={exp.duration}
                   onChange={(e) => {
                     const newExp = [...resume.experience];
                     newExp[index].duration = e.target.value;
                     onUpdateResume({ ...resume, experience: newExp });
                   }}
                   placeholder="Duration (e.g., Jan 2022 - Present)"
                   className="bg-secondary/50"
                 />
                 <Textarea
                   value={exp.description}
                   onChange={(e) => {
                     const newExp = [...resume.experience];
                     newExp[index].description = e.target.value;
                     onUpdateResume({ ...resume, experience: newExp });
                   }}
                   placeholder="Describe your responsibilities..."
                   className="bg-secondary/50"
                 />
               </div>
             ))}
             <Button variant="outline" onClick={addExperience} className="w-full">
               <Plus className="w-4 h-4 mr-2" />
               Add Experience
             </Button>
           </motion.div>
         )}
 
         {activeSection === "skills" && (
           <motion.div
             initial={{ opacity: 0 }}
             animate={{ opacity: 1 }}
             className="space-y-4"
           >
             <div className="flex flex-wrap gap-2">
               {resume.skills.map((skill, index) => (
                 <div
                   key={index}
                   className="flex items-center gap-2 px-3 py-1 rounded-full bg-secondary/50 border border-border/30"
                 >
                   <Input
                     value={skill}
                     onChange={(e) => {
                       const newSkills = [...resume.skills];
                       newSkills[index] = e.target.value;
                       onUpdateResume({ ...resume, skills: newSkills });
                     }}
                     placeholder="Skill"
                     className="bg-transparent border-none p-0 h-auto w-24 focus-visible:ring-0"
                   />
                   <button
                     onClick={() => {
                       const newSkills = resume.skills.filter((_, i) => i !== index);
                       onUpdateResume({ ...resume, skills: newSkills });
                     }}
                     className="text-muted-foreground hover:text-destructive"
                   >
                     <Trash2 className="w-3 h-3" />
                   </button>
                 </div>
               ))}
             </div>
             <Button variant="outline" onClick={addSkill} size="sm">
               <Plus className="w-4 h-4 mr-2" />
               Add Skill
             </Button>
           </motion.div>
         )}
       </div>
     </div>
   );
 }