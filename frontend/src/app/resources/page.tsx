"use client";

import { BookOpen, FileSearch, GraduationCap, FileBadge2, ClipboardCheck, ArrowRight, Sparkles, Lightbulb } from "lucide-react";

type ResourceItem = {
    title: string;
    detail: string;
    type: string;
    cta: string;
};

const resources: ResourceItem[] = [
    { title: "ATS Checklist", detail: "Scan your resume for keyword density, action verbs, and section clarity.", type: "Resume", cta: "Open checklist" },
    { title: "Frontend Learning Path", detail: "Focus on React, Next.js, accessibility, and component design systems.", type: "Learning", cta: "View path" },
    { title: "Interview STAR Prompts", detail: "Practice situation, task, action, and result answers for behavioral rounds.", type: "Interview", cta: "Start practice" },
];

const apiFields = ["skillGap?: string[]", "role?: string", "industry?: string", "level?: string", "format?: 'guide' | 'checklist'"];

const checklist = [
    ["Resume summary aligned to target role", "Done"],
    ["Keywords matched to job description", "In progress"],
    ["Achievement bullets use metrics", "Done"],
    ["Interview stories prepared", "Not started"],
];

export default function ResourcesPage() {
    return (
        <div className="space-y-6 lg:space-y-8 animate-fade-in pb-12">
            {/* Header Section */}
            <section className="grid grid-cols-1 xl:grid-cols-12 gap-4 lg:gap-6">
                <div className="xl:col-span-8 bg-surface-container rounded-2xl p-5 lg:p-6 border border-white/5">
                    <div className="flex items-start justify-between gap-4 mb-4">
                        <div>
                            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-secondary/10 text-secondary text-[11px] font-bold uppercase tracking-widest mb-3">
                                <BookOpen className="w-3 h-3" />
                                Resources Hub
                            </div>
                            <h1 className="font-headline text-2xl lg:text-3xl font-extrabold text-on-surface mb-2">Resources that improve match score and interview readiness</h1>
                            <p className="text-sm text-on-surface-variant max-w-2xl">A compact toolkit for learning, resume review, and interview preparation.</p>
                        </div>
                        <div className="hidden md:flex items-center gap-2 px-3 py-2 rounded-xl bg-surface-container-high text-xs text-on-surface-variant">
                            <Sparkles className="w-3.5 h-3.5 text-secondary" />
                            3 starter packs
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        {[
                            { label: "Saved Resources", value: "14", icon: FileBadge2 },
                            { label: "Learning Goals", value: "6", icon: GraduationCap },
                            { label: "Interview Tasks", value: "9", icon: ClipboardCheck },
                        ].map((item) => {
                            const Icon = item.icon;
                            return (
                                <div key={item.label} className="rounded-2xl bg-surface-container-high p-4 border border-white/5">
                                    <div className="flex items-center justify-between mb-2">
                                        <Icon className="w-4 h-4 text-secondary" />
                                        <span className="text-[11px] text-on-surface-variant">Library</span>
                                    </div>
                                    <p className="text-2xl font-headline font-extrabold text-on-surface">{item.value}</p>
                                    <p className="text-xs text-on-surface-variant mt-1">{item.label}</p>
                                </div>
                            );
                        })}
                    </div>
                </div>

                <div className="xl:col-span-4 space-y-4">
                    <div className="bg-surface-container rounded-2xl p-5 border border-white/5">
                        <div className="flex items-center gap-2 mb-3">
                            <Lightbulb className="w-4 h-4 text-primary" />
                            <h3 className="font-bold text-on-surface text-sm">API Fields</h3>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {apiFields.map((field) => (
                                <span key={field} className="px-2.5 py-1 rounded-lg bg-surface-container-high text-on-surface-variant text-[11px] font-mono">
                                    {field}
                                </span>
                            ))}
                        </div>
                    </div>

                    <div className="bg-surface-container rounded-2xl p-5 border border-white/5">
                        <h3 className="font-bold text-on-surface text-sm mb-3">Suggested Bundle</h3>
                        <div className="rounded-xl bg-surface-container-high p-4 text-xs text-on-surface-variant leading-relaxed">
                            ATS checklist + learning path + interview questions for the exact role you are targeting.
                        </div>
                    </div>
                </div>
            </section>

            <section className="grid grid-cols-1 xl:grid-cols-12 gap-4 lg:gap-6">
                <div className="xl:col-span-8 space-y-4">
                    <div className="flex items-center justify-between">
                        <h2 className="font-headline text-lg font-bold text-on-surface">Resource Cards</h2>
                        <button className="inline-flex items-center gap-1 px-3 py-2 rounded-xl bg-primary/15 text-primary text-sm font-semibold hover:bg-primary/20 transition-colors">
                            Open Library
                            <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {resources.map((resource) => (
                            <div key={resource.title} className="bg-surface-container rounded-2xl p-5 border border-white/5 card-hover">
                                <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-4">
                                    <FileSearch className="w-5 h-5" />
                                </div>
                                <div className="text-[11px] uppercase tracking-widest font-bold text-on-surface-variant mb-2">{resource.type}</div>
                                <h3 className="font-bold text-on-surface text-base mb-2">{resource.title}</h3>
                                <p className="text-sm text-on-surface-variant leading-relaxed mb-4">{resource.detail}</p>
                                <button className="inline-flex items-center gap-1 px-3 py-2 rounded-xl bg-surface-container-high text-on-surface-variant text-sm font-semibold hover:text-white transition-colors">
                                    {resource.cta}
                                </button>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="xl:col-span-4 space-y-4">
                    <div className="bg-surface-container rounded-2xl p-5 border border-white/5">
                        <h3 className="font-bold text-on-surface text-sm mb-3">Readiness Checklist</h3>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="text-[11px] uppercase tracking-widest text-on-surface-variant border-b border-white/5">
                                        <th className="py-2">Item</th>
                                        <th className="py-2">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5">
                                    {checklist.map(([item, status]) => (
                                        <tr key={item}>
                                            <td className="py-3 pr-3 text-sm text-on-surface">{item}</td>
                                            <td className="py-3 text-xs font-bold text-on-surface-variant">{status}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <div className="bg-surface-container rounded-2xl p-5 border border-white/5">
                        <h3 className="font-bold text-on-surface text-sm mb-3">Learning Tips</h3>
                        <ul className="space-y-2 text-sm text-on-surface-variant">
                            <li>• Focus on the missing skills from your current job match.</li>
                            <li>• Save one resource per week and revisit it in the chat coach.</li>
                            <li>• Use the checklist before every application.</li>
                        </ul>
                    </div>
                </div>
            </section>
        </div>
    );
}
