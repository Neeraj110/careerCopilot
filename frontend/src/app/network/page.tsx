"use client";

import { useMemo, useState } from "react";
import { Users2, Building2, MessageSquareText, UserPlus, PhoneCall, ArrowRight, BadgeCheck, Network } from "lucide-react";
import { cn } from "@/lib/utils";

type Contact = {
    name: string;
    role: string;
    company: string;
    status: string;
    source: string;
};

const contacts: Contact[] = [
    { name: "Ava Chen", role: "Engineering Manager", company: "Bitwarden", status: "To Reach Out", source: "Referral" },
    { name: "Noah Patel", role: "Senior Developer", company: "CloudScale AI", status: "Contacted", source: "LinkedIn" },
    { name: "Mia Rodriguez", role: "Recruiter", company: "Nexus Flow", status: "Replied", source: "Career page" },
];

const templates = [
    "Referral request",
    "Follow-up after application",
    "Recruiter intro",
    "Warm company intro",
];

const apiFields = ["company: string", "role?: string", "status?: string", "channel?: string", "lastContactedAt?: string"];

export default function NetworkPage() {
    const [activeTemplate, setActiveTemplate] = useState(templates[0]);
    const [search, setSearch] = useState("");

    const filteredContacts = useMemo(
        () => contacts.filter((contact) => `${contact.name} ${contact.role} ${contact.company} ${contact.status}`.toLowerCase().includes(search.toLowerCase())),
        [search],
    );

    return (
        <div className="space-y-6 lg:space-y-8 animate-fade-in">
            <section className="grid grid-cols-1 xl:grid-cols-12 gap-4 lg:gap-6">
                <div className="xl:col-span-8 bg-surface-container rounded-2xl p-5 lg:p-6 border border-white/5">
                    <div className="flex items-start justify-between gap-4 mb-4">
                        <div>
                            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-tertiary/10 text-tertiary text-[11px] font-bold uppercase tracking-widest mb-3">
                                <Users2 className="w-3 h-3" />
                                Network Hub
                            </div>
                            <h1 className="font-headline text-2xl lg:text-3xl font-extrabold text-on-surface mb-2">Build recruiter and referral momentum</h1>
                            <p className="text-sm text-on-surface-variant max-w-2xl">Track who you know, what you said, and when to follow up so outreach stays organized.</p>
                        </div>
                        <div className="hidden md:flex items-center gap-2 px-3 py-2 rounded-xl bg-surface-container-high text-xs text-on-surface-variant">
                            <Network className="w-3.5 h-3.5 text-tertiary" />
                            3 active contacts
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        {[
                            { label: "Contacts", value: "18", icon: Users2 },
                            { label: "Replies", value: "7", icon: BadgeCheck },
                            { label: "Warm Intros", value: "5", icon: UserPlus },
                        ].map((item) => {
                            const Icon = item.icon;
                            return (
                                <div key={item.label} className="rounded-2xl bg-surface-container-high p-4 border border-white/5">
                                    <div className="flex items-center justify-between mb-2">
                                        <Icon className="w-4 h-4 text-tertiary" />
                                        <span className="text-[11px] text-on-surface-variant">This week</span>
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
                            <MessageSquareText className="w-4 h-4 text-primary" />
                            <h3 className="font-bold text-on-surface text-sm">Outreach Templates</h3>
                        </div>
                        <div className="space-y-2">
                            {templates.map((template) => (
                                <button
                                    key={template}
                                    onClick={() => setActiveTemplate(template)}
                                    className={cn(
                                        "w-full text-left px-3 py-2 rounded-xl text-sm transition-colors",
                                        activeTemplate === template
                                            ? "bg-primary/10 text-primary"
                                            : "bg-surface-container-high text-on-surface-variant hover:text-white",
                                    )}
                                >
                                    {template}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="bg-surface-container rounded-2xl p-5 border border-white/5">
                        <h3 className="font-bold text-on-surface text-sm mb-2">Selected Template</h3>
                        <div className="rounded-xl bg-surface-container-high p-4 text-xs text-on-surface-variant leading-relaxed">
                            {activeTemplate === "Referral request" && "Hi, I admired your work on the product team and wanted to see if you'd be open to a quick chat about opportunities on your team."}
                            {activeTemplate === "Follow-up after application" && "Just following up on my application. I remain very interested in the role and would love to share more about how I could contribute."}
                            {activeTemplate === "Recruiter intro" && "Hello, I'm exploring roles where my frontend and full-stack background can add value. I'd love to connect if you're hiring for related positions."}
                            {activeTemplate === "Warm company intro" && "I’ve been following your team’s work and think my skills line up well. Would love to learn more about open roles and priorities."}
                        </div>
                    </div>
                </div>
            </section>

            <section className="grid grid-cols-1 xl:grid-cols-12 gap-4 lg:gap-6">
                <div className="xl:col-span-8 space-y-4">
                    <div className="flex items-center justify-between">
                        <h2 className="font-headline text-lg font-bold text-on-surface">Contacts Table</h2>
                        <div className="flex items-center gap-2">
                            <input
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Search contacts..."
                                className="px-3 py-2 rounded-xl bg-surface-container text-sm text-on-surface placeholder:text-on-surface-variant outline-none border border-white/5"
                            />
                            <button className="inline-flex items-center gap-1 px-3 py-2 rounded-xl bg-primary/15 text-primary text-sm font-semibold hover:bg-primary/20 transition-colors">
                                Add Contact
                                <ArrowRight className="w-3.5 h-3.5" />
                            </button>
                        </div>
                    </div>

                    <div className="bg-surface-container rounded-2xl overflow-hidden border border-white/5">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="text-on-surface-variant border-b border-white/5 text-[11px] uppercase tracking-widest">
                                        <th className="px-4 py-4">Name</th>
                                        <th className="px-4 py-4 hidden sm:table-cell">Role</th>
                                        <th className="px-4 py-4">Company</th>
                                        <th className="px-4 py-4">Status</th>
                                        <th className="px-4 py-4">Channel</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5">
                                    {filteredContacts.map((contact) => (
                                        <tr key={`${contact.name}-${contact.company}`} className="hover:bg-surface-container-high transition-colors">
                                            <td className="px-4 py-4 text-sm font-semibold text-on-surface">{contact.name}</td>
                                            <td className="px-4 py-4 hidden sm:table-cell text-sm text-on-surface-variant">{contact.role}</td>
                                            <td className="px-4 py-4 text-sm text-on-surface-variant">
                                                <span className="inline-flex items-center gap-1">
                                                    <Building2 className="w-3.5 h-3.5" />
                                                    {contact.company}
                                                </span>
                                            </td>
                                            <td className="px-4 py-4 text-xs font-bold">
                                                <span className="px-3 py-1.5 rounded-full bg-primary/10 text-primary">{contact.status}</span>
                                            </td>
                                            <td className="px-4 py-4 text-sm text-on-surface-variant">{contact.source}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                <div className="xl:col-span-4 space-y-4">
                    <div className="bg-surface-container rounded-2xl p-5 border border-white/5">
                        <div className="flex items-center gap-2 mb-3">
                            <PhoneCall className="w-4 h-4 text-primary" />
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
                        <h3 className="font-bold text-on-surface text-sm mb-3">Networking Workflow</h3>
                        <ul className="space-y-2 text-sm text-on-surface-variant">
                            <li>• Add a contact from a company you are targeting.</li>
                            <li>• Use a template and track follow-up date.</li>
                            <li>• Mark replies to keep momentum visible.</li>
                        </ul>
                    </div>

                    <div className="bg-surface-container rounded-2xl p-5 border border-white/5">
                        <h3 className="font-bold text-on-surface text-sm mb-3">Suggested Next Step</h3>
                        <p className="text-sm text-on-surface-variant leading-relaxed">
                            Reach out to one recruiter and one engineer at your top target company this week.
                        </p>
                    </div>
                </div>
            </section>
        </div>
    );
}
