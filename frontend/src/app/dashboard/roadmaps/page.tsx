"use client";

import { useState } from "react";
import { Map, Clock, Trophy, Play, CheckCircle2, Circle, Loader2, ArrowRight } from "lucide-react";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { motion } from "framer-motion";
import { roadmapApi } from "@/lib/api/roadmap";
import type { RoadmapResult, SkillLevel } from "@/types";

export default function RoadmapsPage() {
  const [skill, setSkill] = useState("");
  const [goal, setGoal] = useState("");
  const [level, setLevel] = useState<SkillLevel | "">("");
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [roadmapData, setRoadmapData] = useState<RoadmapResult | null>(null);

  const handleGenerate = async () => {
    if (!skill || !goal || !level) return;
    setIsGenerating(true);
    setRoadmapData(null);
    try {
      const res = await roadmapApi.generate({ skill, level: level as SkillLevel, targetGoal: goal });
      setRoadmapData(res.data);
    } catch (err) {
      console.error("Failed to generate roadmap", err);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="flex flex-col gap-6"
    >
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-heading font-bold tracking-tight">Learning Roadmaps</h1>
        <p className="text-muted-foreground">
          Generate personalized learning paths to acquire new skills or transition into a new role.
        </p>
      </div>

      <div className="flex flex-col gap-5">
        {/* Input Form */}
        <Card className="lg:col-span-1 border-border/40 bg-card/30 backdrop-blur-xl h-fit shadow-xl shadow-black/20 hover:border-primary/30 transition-all duration-300">
          <CardHeader>
            <CardTitle>Create Roadmap</CardTitle>
            <CardDescription>Tell us what you want to learn.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Target Skill / Role</label>
              <Input 
                placeholder="e.g., Senior Frontend Developer" 
                value={skill}
                onChange={(e) => setSkill(e.target.value)}
                className="bg-card/50 border-border/40 focus:border-primary"
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Current Level</label>
              <Select value={level} onValueChange={(val) => setLevel(val as SkillLevel)}>
                <SelectTrigger className="bg-card/50 border-border/40 focus:ring-1 focus:ring-primary">
                  <SelectValue placeholder="Select current level" />
                </SelectTrigger>
                <SelectContent className="bg-card/80 backdrop-blur-xl border-border/40">
                  <SelectItem value="beginner">Beginner</SelectItem>
                  <SelectItem value="intermediate">Intermediate</SelectItem>
                  <SelectItem value="advanced">Advanced</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Specific Goal / Context</label>
              <Textarea 
                placeholder="e.g., I want to be able to build a full-stack SaaS application from scratch."
                className="resize-none bg-card/50 border-border/40 focus:border-primary"
                value={goal}
                onChange={(e) => setGoal(e.target.value)}
              />
            </div>

            <Button 
              className="w-full mt-2 shadow-lg shadow-primary/20" 
              onClick={handleGenerate}
              disabled={!skill || !goal || !level || isGenerating}
            >
              {isGenerating ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              {isGenerating ? "Generating Path..." : "Generate Roadmap"}
            </Button>
          </CardContent>
        </Card>

        {/* Roadmap Display */}
        <Card className="lg:col-span-2 border-border/40 bg-card/30 backdrop-blur-xl max-h-[calc(100vh-200px)] overflow-y-auto shadow-xl shadow-black/20 hover:border-primary/30 transition-all duration-300">
          <CardHeader>
            <CardTitle>Your Learning Path</CardTitle>
            <CardDescription>
              {roadmapData ? `Custom roadmap for ${roadmapData.roadmap.skill}` : "Your roadmap will appear here once generated."}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!roadmapData && !isGenerating ? (
               <div className="flex flex-col items-center justify-center py-16 text-center h-full min-h-[400px]">
                 <Map className="mb-4 h-12 w-12 text-muted-foreground/30" />
                 <h3 className="text-lg font-medium text-muted-foreground">Ready to start?</h3>
                 <p className="mt-2 text-sm text-muted-foreground max-w-sm">
                   Fill out the form on the left to generate a step-by-step learning guide tailored to your career goals.
                 </p>
               </div>
            ) : isGenerating ? (
               <div className="flex flex-col items-center justify-center py-16 text-center h-full min-h-[400px]">
                 <Loader2 className="mb-4 h-12 w-12 text-primary animate-spin" />
                 <h3 className="text-lg font-medium">Charting your course...</h3>
                 <p className="mt-2 text-sm text-muted-foreground max-w-sm">
                   Analyzing optimal learning pathways for {skill || 'your goal'}.
                 </p>
               </div>
            ) : roadmapData && (
              <div className="space-y-8 pl-4 py-4">
                {(roadmapData.roadmap.weeks || roadmapData.roadmap.milestones || []).map((step, i) => (
                  <motion.div 
                    key={i}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="relative"
                  >
                    {/* Vertical Line connecting steps */}
                    {i !== (roadmapData.roadmap.weeks || roadmapData.roadmap.milestones || []).length - 1 && (
                      <div className="absolute left-[11px] top-8 bottom-[-2.5rem] w-0.5 bg-border" />
                    )}
                    
                    <div className="flex gap-6">
                      <div className="relative mt-1">
                        <div className="flex h-6 w-6 items-center justify-center rounded-full border-2 bg-background border-primary text-primary">
                          <Circle className="h-2 w-2 fill-primary" />
                        </div>
                      </div>
                      
                      <div className="flex-1 space-y-3 pb-2">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                          <h4 className="font-semibold text-lg flex items-center gap-2">
                            {step.title || step.focus || `Week ${step.week}`}
                          </h4>
                          <span className="flex items-center gap-1 text-xs font-medium text-primary bg-primary/10 px-2 py-1 rounded-md w-fit">
                            <Clock className="h-3 w-3" /> Week {step.week}
                          </span>
                        </div>
                        
                        <div className="space-y-4">
                          {/* Topics */}
                          <div className="space-y-1">
                            <h5 className="text-sm font-medium">Key Topics</h5>
                            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-1">
                              {step.topics.map((t, idx) => (
                                <li key={idx} className="text-sm text-muted-foreground flex items-start gap-1.5">
                                  <ArrowRight className="h-3.5 w-3.5 mt-0.5 shrink-0 text-primary/50" />
                                  <span>{t}</span>
                                </li>
                              ))}
                            </ul>
                          </div>

                          {/* Project */}
                          {step.project && (
                            <div className="rounded-md border border-border/40 bg-muted/10 backdrop-blur-sm p-3 shadow-sm hover:border-primary/20 transition-all duration-300">
                              <h5 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">Weekly Project</h5>
                              <p className="text-sm">{step.project}</p>
                            </div>
                          )}

                          {/* Resources */}
                          {step.resources && step.resources.length > 0 && (
                            <div className="space-y-1">
                              <h5 className="text-sm font-medium">Resources</h5>
                              <div className="flex flex-wrap gap-2">
                                {step.resources.map((res, idx) => (
                                  <a key={idx} href={res.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-xs text-primary bg-primary/5 hover:bg-primary/10 px-2 py-1 rounded border border-primary/10 transition-colors">
                                    <Play className="h-3 w-3" />
                                    <span>{res.title}</span>
                                  </a>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}

                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: (roadmapData.roadmap.weeks || roadmapData.roadmap.milestones || []).length * 0.1 }}
                  className="flex gap-6 mt-8"
                >
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-success/20 text-success border border-success/30 relative mt-1">
                    <Trophy className="h-3 w-3" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-success">Goal Achieved!</h4>
                    <p className="text-sm text-muted-foreground">You are now ready for the role.</p>
                  </div>
                </motion.div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </motion.div>
  );
}
