"use client";

import { useState, useEffect } from "react";
import { Map, Clock, Trophy, Play, Circle, Loader2, ArrowRight, Plus, History, BookOpen } from "lucide-react";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { PageHeader } from "@/components/layout/page-header";
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
import { motion, AnimatePresence } from "framer-motion";
import { roadmapApi } from "@/lib/api/roadmap";
import type { RoadmapResult, SavedRoadmap, SkillLevel } from "@/types";
import { cn } from "@/lib/utils";

export default function RoadmapsPage() {
  const [skill, setSkill] = useState("");
  const [goal, setGoal] = useState("");
  const [level, setLevel] = useState<SkillLevel | "">("");
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [roadmapData, setRoadmapData] = useState<RoadmapResult | null>(null);

  const [savedRoadmaps, setSavedRoadmaps] = useState<SavedRoadmap[]>([]);
  const [selectedRoadmapId, setSelectedRoadmapId] = useState<string | null>(null);
  const [isLoadingList, setIsLoadingList] = useState(true);
  const [isLoadingRoadmap, setIsLoadingRoadmap] = useState(false);
  const [isCreatingNew, setIsCreatingNew] = useState(true);

  // Fetch saved roadmaps
  const fetchSavedRoadmaps = async (selectFirst = false) => {
    try {
      setIsLoadingList(true);
      const res = await roadmapApi.list();
      setSavedRoadmaps(res.data);
      
      if (res.data.length > 0) {
        if (selectFirst) {
          const firstRoadmap = res.data[0];
          setSelectedRoadmapId(firstRoadmap.id);
          setIsCreatingNew(false);
          await loadRoadmapDetails(firstRoadmap.id);
        }
      } else {
        setIsCreatingNew(true);
      }
    } catch (err) {
      console.error("Failed to fetch saved roadmaps", err);
    } finally {
      setIsLoadingList(false);
    }
  };

  useEffect(() => {
    fetchSavedRoadmaps(true);
  }, []);

  const loadRoadmapDetails = async (id: string) => {
    setIsLoadingRoadmap(true);
    try {
      const res = await roadmapApi.get(id);
      setRoadmapData(res.data);
    } catch (err) {
      console.error("Failed to load roadmap details", err);
    } finally {
      setIsLoadingRoadmap(false);
    }
  };

  const handleSelectRoadmap = async (id: string) => {
    setSelectedRoadmapId(id);
    setIsCreatingNew(false);
    await loadRoadmapDetails(id);
  };

  const handleGenerate = async () => {
    if (!skill || !goal || !level) return;
    setIsGenerating(true);
    setRoadmapData(null);
    try {
      const res = await roadmapApi.generate({ skill, level: level as SkillLevel, targetGoal: goal });
      const newRoadmap = res.data;
      setRoadmapData(newRoadmap);
      
      // Refresh the list and select the newly generated roadmap
      await fetchSavedRoadmaps(false);
      if (newRoadmap.id) {
        setSelectedRoadmapId(newRoadmap.id);
        setIsCreatingNew(false);
      }
    } catch (err) {
      console.error("Failed to generate roadmap", err);
    } finally {
      setIsGenerating(false);
    }
  };

  const startNewRoadmap = () => {
    setIsCreatingNew(true);
    setSelectedRoadmapId(null);
    setRoadmapData(null);
    setSkill("");
    setGoal("");
    setLevel("");
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Learning Roadmaps"
        description="Generate personalized learning paths to acquire new skills or transition into a new role."
      />

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar history panel */}
        <div className="lg:col-span-1 space-y-4">
          <Button 
            onClick={startNewRoadmap} 
            className="w-full flex items-center justify-center gap-2 shadow-sm border border-primary/20 bg-primary/10 hover:bg-primary/20 text-primary transition-all duration-300"
            variant="ghost"
          >
            <Plus className="h-4 w-4" />
            New Roadmap
          </Button>
          
          <Card className="h-[calc(100vh-270px)] flex flex-col bg-card/40 backdrop-blur-md border border-border/40 shadow-md">
            <CardHeader className="py-4 px-4 border-b border-border/50">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <History className="h-4.5 w-4.5 text-muted-foreground" />
                History
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 overflow-y-auto p-2 space-y-1">
              {isLoadingList ? (
                <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                  <Loader2 className="h-5 w-5 animate-spin mb-2 text-primary" />
                  <span className="text-xs">Loading saved paths...</span>
                </div>
              ) : savedRoadmaps.length === 0 ? (
                <div className="text-center py-12 text-xs text-muted-foreground flex flex-col items-center gap-2">
                  <BookOpen className="h-8 w-8 text-muted-foreground/30" />
                  No roadmaps generated yet.
                </div>
              ) : (
                savedRoadmaps.map((r) => {
                  const isSelected = selectedRoadmapId === r.id && !isCreatingNew;
                  return (
                    <button
                      key={r.id}
                      onClick={() => handleSelectRoadmap(r.id)}
                      className={cn(
                        "w-full text-left p-3 rounded-xl transition-all duration-200 flex flex-col gap-1 border text-xs",
                        isSelected
                          ? "bg-primary/10 border-primary/40 text-primary shadow-sm"
                          : "border-transparent hover:bg-muted/40 text-foreground"
                      )}
                    >
                      <span className="font-semibold text-sm line-clamp-1">{r.title}</span>
                      <span className="text-muted-foreground flex items-center gap-1.5 capitalize mt-0.5">
                        <span className={cn(
                          "h-1.5 w-1.5 rounded-full shrink-0",
                          r.level === "beginner" ? "bg-success" : r.level === "intermediate" ? "bg-warning" : "bg-danger"
                        )} />
                        {r.level} • {new Date(r.createdAt).toLocaleDateString()}
                      </span>
                    </button>
                  );
                })
              )}
            </CardContent>
          </Card>
        </div>

        {/* Main content display */}
        <div className="lg:col-span-3">
          <AnimatePresence mode="wait">
            {isCreatingNew ? (
              <motion.div
                key="generator-form"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.25 }}
              >
                <div className="grid grid-cols-1 gap-6">
                  {/* Form */}
                  <Card className="bg-card/40 backdrop-blur-md border border-border/40 shadow-lg">
                    <CardHeader>
                      <CardTitle>Create Learning Path</CardTitle>
                      <CardDescription>Specify the skill, your current level, and your goal to structure a semana-by-semana guide.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Target Skill / Role</label>
                        <Input 
                          placeholder="e.g., Senior Frontend Developer, Next.js Architect" 
                          value={skill}
                          onChange={(e) => setSkill(e.target.value)}
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Current Level</label>
                        <Select value={level} onValueChange={(val) => setLevel(val as SkillLevel)}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select current level" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="beginner">Beginner</SelectItem>
                            <SelectItem value="intermediate">Intermediate</SelectItem>
                            <SelectItem value="advanced">Advanced</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium">Specific Goal / Context</label>
                        <Textarea 
                          placeholder="e.g., I want to build a full-stack SaaS application from scratch with auth, payment gateways, and real-time database."
                          className="resize-none min-h-[100px]"
                          value={goal}
                          onChange={(e) => setGoal(e.target.value)}
                        />
                      </div>

                      <Button 
                        className="w-full mt-2" 
                        onClick={handleGenerate}
                        disabled={!skill || !goal || !level || isGenerating}
                      >
                        {isGenerating ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                        {isGenerating ? "Analyzing & Generating..." : "Generate Custom Roadmap"}
                      </Button>
                    </CardContent>
                  </Card>

                  {/* Pending state */}
                  {isGenerating && (
                    <Card className="min-h-[300px] flex flex-col items-center justify-center py-16 text-center border border-border/40 bg-card/20">
                      <Loader2 className="mb-4 h-12 w-12 text-primary animate-spin" />
                      <h3 className="text-lg font-medium">Charting your course...</h3>
                      <p className="mt-2 text-sm text-muted-foreground max-w-sm px-4">
                        This runs a multi-agent AI pipeline using live search to fetch and rank resources. It may take up to a minute.
                      </p>
                    </Card>
                  )}
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="roadmap-display"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.25 }}
              >
                <Card className="max-h-[calc(100vh-200px)] overflow-y-auto bg-card/45 backdrop-blur-md border border-border/40 shadow-xl">
                  <CardHeader className="sticky top-0 bg-background/90 backdrop-blur-md border-b border-border/30 z-10 py-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div>
                        <CardTitle className="text-xl">
                          {roadmapData ? `Learning Path: ${roadmapData.title || roadmapData.roadmap.skill}` : "Your Learning Path"}
                        </CardTitle>
                        <CardDescription className="line-clamp-2 mt-1">
                          {roadmapData?.targetGoal || roadmapData?.roadmap.goal || "Custom compiled weekly resources and projects."}
                        </CardDescription>
                      </div>
                      <span className="flex items-center gap-1.5 text-xs font-semibold text-accent-strong bg-accent-soft/20 px-2.5 py-1 rounded-full w-fit capitalize h-fit border border-accent-v2/10">
                        Level: {roadmapData?.level || roadmapData?.roadmap.level}
                      </span>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-6">
                    {isLoadingRoadmap ? (
                      <div className="flex flex-col items-center justify-center py-24 text-center">
                        <Loader2 className="mb-4 h-10 w-10 text-primary animate-spin" />
                        <h3 className="text-md font-medium">Loading details...</h3>
                      </div>
                    ) : roadmapData && (
                      <div className="space-y-8 pl-2 py-2">
                        {(roadmapData.roadmap.weeks || roadmapData.roadmap.milestones || []).map((step, i) => (
                          <motion.div 
                            key={i}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.05 }}
                            className="relative font-sans"
                          >
                            {/* Vertical connecting line */}
                            {i !== (roadmapData.roadmap.weeks || roadmapData.roadmap.milestones || []).length - 1 && (
                              <div className="absolute left-[11px] top-8 bottom-[-2.5rem] w-0.5 bg-border/40" />
                            )}
                            
                            <div className="flex gap-6">
                              <div className="relative mt-1">
                                <div className="flex h-6 w-6 items-center justify-center rounded-full border-2 bg-surface border-accent-v2 text-accent-v2">
                                  <Circle className="h-2 w-2 fill-accent-v2" />
                                </div>
                              </div>
                              
                              <div className="flex-1 space-y-3.5 pb-4">
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                                  <h4 className="font-semibold text-md flex items-center gap-2">
                                    {step.title || step.focus || `Week ${step.week}`}
                                  </h4>
                                  <span className="flex items-center gap-1 text-xs font-medium text-accent-strong bg-accent-soft/20 px-2 py-1 rounded-md w-fit">
                                    <Clock className="h-3.5 w-3.5" /> Week {step.week}
                                  </span>
                                </div>
                                
                                <div className="space-y-4">
                                  {/* Topics */}
                                  <div className="space-y-1.5">
                                    <h5 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Key Topics</h5>
                                    <ul className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                                      {step.topics.map((t, idx) => (
                                        <li key={idx} className="text-sm text-muted-foreground flex items-start gap-2">
                                          <ArrowRight className="h-3.5 w-3.5 mt-0.5 shrink-0 text-accent-v2/60" />
                                          <span>{t}</span>
                                        </li>
                                      ))}
                                    </ul>
                                  </div>

                                  {/* Project */}
                                  {step.project && (
                                    <div className="rounded-xl border border-border/40 bg-surface-2 p-3.5 shadow-sm hover:border-accent-v2/60 transition-all duration-300">
                                      <h5 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">Weekly Project</h5>
                                      <p className="text-sm text-foreground leading-relaxed">{step.project}</p>
                                    </div>
                                  )}

                                  {/* Resources */}
                                  {step.resources && step.resources.length > 0 && (
                                    <div className="space-y-1.5">
                                      <h5 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Resources</h5>
                                      <div className="flex flex-wrap gap-2">
                                        {step.resources.map((res, idx) => (
                                          <a 
                                            key={idx} 
                                            href={res.url} 
                                            target="_blank" 
                                            rel="noopener noreferrer" 
                                            className="inline-flex items-center gap-1.5 text-xs text-accent-v2 bg-accent-soft/15 hover:bg-accent-soft/30 px-3 py-1.5 rounded-lg border border-accent-v2/10 transition-colors duration-200"
                                          >
                                            <Play className="h-3 w-3 fill-accent-v2/30" />
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
                          transition={{ delay: (roadmapData.roadmap.weeks || roadmapData.roadmap.milestones || []).length * 0.05 }}
                          className="flex gap-6 mt-6 pt-4 border-t border-border/30"
                        >
                          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-success/20 text-success border border-success/30 relative mt-1">
                            <Trophy className="h-3.5 w-3.5" />
                          </div>
                          <div>
                            <h4 className="font-semibold text-success text-sm">Goal Achieved!</h4>
                            <p className="text-xs text-muted-foreground mt-0.5">You have acquired the necessary skills for your target role.</p>
                          </div>
                        </motion.div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
