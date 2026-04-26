"use client";

import { useState } from "react";
import { BookOpen, FileSearch, Lightbulb, Loader2, Target, ExternalLink } from "lucide-react";
import { generateLearningResources, type LearningResource } from "@/lib/api";

export default function ResourcesPage() {
    const [skillsInput, setSkillsInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [resources, setResources] = useState<LearningResource[]>([]);
    const [error, setError] = useState<string | null>(null);

    const handleGenerate = async () => {
        const skills = skillsInput.split(",").map((s) => s.trim()).filter(Boolean);
        if (skills.length === 0) {
            setError("Please enter at least one skill.");
            return;
        }

        try {
            setIsLoading(true);
            setError(null);
            const data = await generateLearningResources(skills);
            setResources(data.resources);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to generate resources.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleQuickTag = (tag: string) => {
        setSkillsInput((prev) => prev ? `${prev}, ${tag}` : tag);
    };

    return (
        <div className="animate-fade-in pb-12">
            {/* Header Section */}
            <div className="mb-8 lg:mb-10">
                <h1 className="font-headline font-extrabold text-3xl lg:text-4xl tracking-tight text-on-surface mb-2">
                    AI Learning Hub
                </h1>
                <p className="font-body text-on-surface-variant max-w-2xl text-sm lg:text-base">
                    Tell us what you need to learn. Our AI will curate a personalized learning path with the best courses, articles, and interview prep guides to help you close the skill gap.
                </p>
            </div>

            {/* Input Section */}
            <div className="bg-surface-container rounded-xl p-5 lg:p-6 mb-4 flex flex-col sm:flex-row items-center gap-4">
                <div className="flex-1 w-full relative">
                    <Target className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-on-surface-variant" />
                    <input
                        type="text"
                        value={skillsInput}
                        onChange={(e) => setSkillsInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleGenerate()}
                        placeholder="e.g. Next.js, System Design, GraphQL..."
                        className="w-full bg-surface-container-high border-none rounded-xl py-3 pl-12 pr-4 text-sm focus:ring-2 focus:ring-primary/30 transition-all placeholder:text-outline-variant outline-none"
                    />
                </div>
                <button
                    onClick={handleGenerate}
                    disabled={isLoading}
                    className="w-full sm:w-auto px-6 py-3 rounded-xl gradient-primary text-on-primary-container font-bold text-sm shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:pointer-events-none inline-flex items-center justify-center gap-2 whitespace-nowrap"
                >
                    {isLoading ? (
                        <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Curating...
                        </>
                    ) : (
                        "Generate Path"
                    )}
                </button>
            </div>

            {error && <p className="text-error text-sm mb-6 px-2">{error}</p>}

            <div className="flex items-center gap-3 mb-8 lg:mb-10 overflow-x-auto pb-2 scrollbar-hide">
                <span className="text-xs font-bold text-on-surface-variant uppercase tracking-widest whitespace-nowrap">Suggested:</span>
                {["Docker", "React Performance", "AWS Serverless", "GraphQL APIs"].map(tag => (
                    <button
                        key={tag}
                        onClick={() => handleQuickTag(tag)}
                        className="px-3 py-1.5 rounded-xl bg-surface-container hover:bg-surface-container-high text-xs font-medium text-on-surface transition-colors whitespace-nowrap"
                    >
                        + {tag}
                    </button>
                ))}
            </div>

            {/* Content Section */}
            {resources.length > 0 && (
                <div className="space-y-6">
                    <div className="flex items-center justify-between">
                        <h2 className="font-headline text-xl font-bold text-on-surface flex items-center gap-2">
                            <Lightbulb className="w-5 h-5 text-primary" />
                            Your Personalized Learning Path
                        </h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5 lg:gap-6">
                        {resources.map((resource, i) => (
                            <div key={i} className="bg-surface-container rounded-xl p-5 lg:p-6 card-hover flex flex-col h-full group">
                                <div className="flex items-start justify-between mb-4">
                                    <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                                        <FileSearch className="w-5 h-5" />
                                    </div>
                                    <div className="text-[10px] uppercase tracking-widest font-bold text-primary bg-primary/10 px-2.5 py-1 rounded-full">
                                        {resource.type}
                                    </div>
                                </div>
                                <h3 className="font-bold text-on-surface text-lg mb-2 leading-snug group-hover:text-primary transition-colors">{resource.title}</h3>
                                <p className="text-sm text-on-surface-variant leading-relaxed mb-6 flex-grow">{resource.detail}</p>
                                
                                <div className="pt-4 border-t border-white/5 flex items-center justify-between mt-auto">
                                    <span className="text-xs font-bold text-on-surface-variant uppercase tracking-widest">
                                        ⏱ {resource.estimatedTime}
                                    </span>
                                    <a
                                        href={`https://www.google.com/search?q=${encodeURIComponent(resource.searchQuery)}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface-container-high text-on-surface-variant text-xs font-semibold hover:text-white hover:bg-white/10 transition-colors"
                                    >
                                        Find Resource
                                        <ExternalLink className="w-3.5 h-3.5" />
                                    </a>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {resources.length === 0 && !isLoading && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5 lg:gap-6 opacity-60">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="bg-surface-container rounded-xl p-6 border border-white/5 border-dashed flex flex-col items-center justify-center text-center min-h-[250px]">
                            <BookOpen className="w-8 h-8 text-on-surface-variant mb-4" />
                            <p className="text-sm font-medium text-on-surface-variant">Resource slot available</p>
                            <p className="text-xs text-on-surface-variant/60 mt-1">Generate a path to fill</p>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
