"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import {
  Send,
  Bot,
  User,
  Sparkles,
  Briefcase,
  X,
  ChevronDown,
  MessageSquare,
  History,
  Target,
  Lightbulb,
} from "lucide-react";
import { sendChatMessage, type ChatMessage } from "@/lib/api";
import { cn } from "@/lib/utils";
import { useUiStore } from "@/lib/store/ui";

const SUGGESTED_QUESTIONS = [
  "Am I a good fit for this job?",
  "What skills should I focus on learning?",
  "How can I improve my resume for this role?",
  "What salary should I expect for my experience?",
];

function TypingIndicator({ isLight }: { isLight: boolean }) {
  return (
    <div className="flex items-end gap-2">
      <div className={cn(
        "w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0",
        isLight ? "bg-emerald-100" : "bg-primary/15",
      )}>
        <Bot className={cn("w-3.5 h-3.5", isLight ? "text-emerald-700" : "text-primary")} />
      </div>
      <div className={cn(
        "rounded-xl rounded-bl-sm px-3 py-2",
        isLight ? "bg-slate-200" : "bg-surface-container",
      )}>
        <div className="flex items-center gap-1.5">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="w-1.5 h-1.5 bg-primary/60 rounded-full animate-bounce"
              style={{ animationDelay: `${i * 0.15}s` }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function MessageBubble({ msg, isLight }: { msg: ChatMessage; isLight: boolean }) {
  const isUser = msg.role === "user";
  return (
    <div
      className={cn("flex items-end gap-2", isUser ? "flex-row-reverse" : "flex-row")}
    >
      <div
        className={cn(
          "w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0",
          isUser
            ? isLight
              ? "bg-blue-100"
              : "bg-secondary/15"
            : isLight
              ? "bg-emerald-100"
              : "bg-primary/15",
        )}
      >
        {isUser ? (
          <User className={cn("w-3.5 h-3.5", isLight ? "text-blue-700" : "text-secondary")} />
        ) : (
          <Bot className={cn("w-3.5 h-3.5", isLight ? "text-emerald-700" : "text-primary")} />
        )}
      </div>
      <div
        className={cn(
          "max-w-[82%] px-3 py-2 rounded-xl text-[13px] leading-relaxed whitespace-pre-wrap",
          isUser
            ? isLight
              ? "bg-emerald-600/15 text-slate-800 rounded-br-sm"
              : "bg-primary/15 text-white rounded-br-sm"
            : isLight
              ? "bg-slate-200 text-slate-700 rounded-bl-sm"
              : "bg-surface-container text-on-surface-variant rounded-bl-sm",
        )}
      >
        {msg.content}
      </div>
    </div>
  );
}

export default function ChatPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: "assistant",
      content:
        "Hi! I'm CareerCopilot, your AI career coach. I have access to your resume and can answer questions about specific jobs.\n\nTry asking me something like \"What skills should I focus on?\" or paste a job ID to get tailored advice.",
    },
  ]);
  const [input, setInput] = useState("");
  const [jobId, setJobId] = useState("");
  const [showJobInput, setShowJobInput] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const isLight = useUiStore((state) => state.theme === "light");
  const toggleDensity = useUiStore((state) => state.toggleDensity);
  const density = useUiStore((state) => state.density);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const handleSend = useCallback(
    async (messageText?: string) => {
      const text = (messageText ?? input).trim();
      if (!text || isTyping) return;

      const userMsg: ChatMessage = { role: "user", content: text };
      const newMessages = [...messages, userMsg];
      setMessages(newMessages);
      setInput("");
      setIsTyping(true);

      try {
        const result = await sendChatMessage(
          text,
          jobId.trim() || undefined,
          messages, // send previous history
        );
        setMessages([...newMessages, { role: "assistant", content: result.message }]);
      } catch {
        setMessages([
          ...newMessages,
          {
            role: "assistant",
            content: "Sorry, I ran into an error. Please try again in a moment.",
          },
        ]);
      } finally {
        setIsTyping(false);
      }
    },
    [input, isTyping, jobId, messages],
  );

  const onKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const clearChat = () => {
    setMessages([
      {
        role: "assistant",
        content:
          "Hi again! How can I help you with your career today?",
      },
    ]);
  };

  const recentQuestions = messages
    .filter((item) => item.role === "user")
    .map((item) => item.content)
    .slice(-5)
    .reverse();

  return (
    <div className={cn(
      "grid grid-cols-1 lg:grid-cols-12 gap-3 lg:gap-4 h-[calc(100vh-7rem)] rounded-2xl p-2 transition-colors",
      isLight ? "bg-slate-100" : "bg-transparent",
    )}>
      <aside className={cn(
        "hidden lg:flex lg:col-span-4 xl:col-span-3 rounded-xl border p-3 flex-col transition-colors",
        isLight ? "bg-white border-slate-200" : "bg-surface-container border-white/5",
      )}>
        <div className="flex items-center gap-2 mb-4">
          <div className={cn(
            "w-7 h-7 rounded-lg flex items-center justify-center",
            isLight ? "bg-emerald-100" : "bg-primary/15",
          )}>
            <History className={cn("w-3.5 h-3.5", isLight ? "text-emerald-700" : "text-primary")} />
          </div>
          <div>
            <h2 className={cn("text-xs font-bold", isLight ? "text-slate-900" : "text-white")}>Conversation Sidebar</h2>
            <p className={cn("text-[10px]", isLight ? "text-slate-500" : "text-on-surface-variant")}>Your recent prompts</p>
          </div>
        </div>

        <div className="space-y-2 flex-1 overflow-y-auto pr-1">
          {recentQuestions.length === 0 && (
            <div className={cn(
              "rounded-lg p-2.5 text-[11px] leading-relaxed",
              isLight ? "bg-slate-100 text-slate-500" : "bg-surface-container-high text-on-surface-variant",
            )}>
              Start a conversation and your recent prompts will appear here.
            </div>
          )}
          {recentQuestions.map((question, idx) => (
            <button
              key={`${question}-${idx}`}
              onClick={() => handleSend(question)}
              className={cn(
                "w-full text-left rounded-lg px-2.5 py-2 text-[11px] transition-colors",
                isLight
                  ? "bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900"
                  : "bg-surface-container-high text-on-surface-variant hover:text-white hover:bg-surface-container-highest",
              )}
            >
              <span className="line-clamp-2">{question}</span>
            </button>
          ))}
        </div>

        <div className={cn("mt-4 pt-3 border-t space-y-1.5", isLight ? "border-slate-200" : "border-white/5")}>
          <div className={cn("flex items-center gap-2 text-[11px]", isLight ? "text-slate-600" : "text-on-surface-variant")}>
            <Target className={cn("w-3.5 h-3.5", isLight ? "text-emerald-700" : "text-primary")} />
            Focused on role-fit answers
          </div>
          <div className={cn("flex items-center gap-2 text-[11px]", isLight ? "text-slate-600" : "text-on-surface-variant")}>
            <Lightbulb className={cn("w-3.5 h-3.5", isLight ? "text-blue-700" : "text-secondary")} />
            Ask for resume bullet rewrites
          </div>
        </div>
      </aside>

      <section className={cn(
        "lg:col-span-8 xl:col-span-9 flex flex-col min-h-0 rounded-xl p-2 transition-colors",
        isLight ? "bg-white border border-slate-200" : "bg-transparent",
      )}>
        {/* Header */}
        <div className={cn("flex items-center justify-between pb-3 mb-3 border-b", isLight ? "border-slate-200" : "border-white/5")}>
          <div className="flex items-center gap-3">
            <div className={cn(
              "w-8 h-8 rounded-lg flex items-center justify-center",
              isLight ? "bg-emerald-100" : "bg-primary/15",
            )}>
              <Sparkles className={cn("w-4 h-4", isLight ? "text-emerald-700" : "text-primary")} />
            </div>
            <div>
              <h1 className={cn("font-headline font-bold text-base", isLight ? "text-slate-900" : "text-white")}>CareerCopilot Chat</h1>
              <p className={cn("text-[11px]", isLight ? "text-slate-500" : "text-on-surface-variant")}>
                RAG-powered career coach · Uses your resume as context
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={toggleDensity}
              className={cn(
                "p-1.5 rounded-lg transition-colors text-[10px] font-semibold",
                isLight
                  ? "bg-slate-100 text-slate-600 hover:text-slate-900"
                  : "bg-surface-container text-on-surface-variant hover:text-white",
              )}
              title={density === "compact" ? "Switch to comfortable density" : "Switch to compact density"}
            >
              {density === "compact" ? "Compact" : "Comfort"}
            </button>
            <button
              onClick={() => setShowJobInput((v) => !v)}
              className={cn(
                "flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-medium transition-colors",
                showJobInput || jobId
                  ? isLight
                    ? "bg-emerald-100 text-emerald-700 border border-emerald-200"
                    : "bg-primary/15 text-primary border border-primary/20"
                  : isLight
                    ? "bg-slate-100 text-slate-600 hover:text-slate-900"
                    : "bg-surface-container text-on-surface-variant hover:text-white",
              )}
            >
              <Briefcase className="w-3 h-3" />
              {jobId ? "Job set" : "Set Job ID"}
              {showJobInput ? <ChevronDown className="w-2.5 h-2.5 rotate-180" /> : <ChevronDown className="w-2.5 h-2.5" />}
            </button>
            <button
              onClick={clearChat}
              className={cn(
                "p-1.5 rounded-lg transition-colors",
                isLight
                  ? "text-slate-500 hover:text-slate-900 hover:bg-slate-100"
                  : "text-on-surface-variant hover:text-white hover:bg-white/5",
              )}
              title="Clear chat"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Job ID input (collapsible) */}
        {showJobInput && (
          <div className={cn(
            "flex items-center gap-2 mb-3 p-2.5 rounded-lg animate-fade-in",
            isLight ? "bg-slate-100" : "bg-surface-container",
          )}>
            <Briefcase className={cn("w-3.5 h-3.5 flex-shrink-0", isLight ? "text-emerald-700" : "text-primary")} />
            <input
              type="text"
              value={jobId}
              onChange={(e) => setJobId(e.target.value)}
              placeholder="Paste a Job ID to get role-specific advice…"
              className={cn(
                "flex-1 bg-transparent text-xs outline-none",
                isLight ? "text-slate-900 placeholder:text-slate-500" : "text-white placeholder:text-outline",
              )}
            />
            {jobId && (
              <button
                onClick={() => setJobId("")}
                className={cn(
                  "p-1 rounded-lg transition-colors",
                  isLight ? "text-slate-500 hover:text-slate-900" : "text-on-surface-variant hover:text-white",
                )}
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        )}

        {/* Messages */}
        <div className="flex-1 overflow-y-auto space-y-3 pr-1 hide-scrollbar min-h-0">
          {messages.map((msg, i) => (
            <MessageBubble key={i} msg={msg} isLight={isLight} />
          ))}
          {isTyping && <TypingIndicator isLight={isLight} />}
          <div ref={bottomRef} />
        </div>

        {/* Suggested Questions (show when only 1 message) */}
        {messages.length === 1 && !isTyping && (
          <div className="py-3 space-y-2">
            <p className={cn("text-[11px] font-medium px-1", isLight ? "text-slate-500" : "text-on-surface-variant")}>Try asking:</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {SUGGESTED_QUESTIONS.map((q) => (
                <button
                  key={q}
                  onClick={() => handleSend(q)}
                  className={cn(
                    "flex items-center gap-2 p-2.5 rounded-lg text-left text-[11px] transition-colors group",
                    isLight
                      ? "bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900"
                      : "bg-surface-container text-on-surface-variant hover:text-white hover:bg-surface-container-high",
                  )}
                >
                  <MessageSquare className={cn("w-3 h-3 group-hover:scale-110 transition-transform flex-shrink-0", isLight ? "text-emerald-700" : "text-primary")} />
                  <span className="line-clamp-1">{q}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Input */}
        <div className={cn("pt-3 border-t", isLight ? "border-slate-200" : "border-white/5")}>
          <div className={cn(
            "flex items-end gap-2 rounded-xl px-3 py-2.5 focus-within:ring-2 transition-all",
            isLight
              ? "bg-slate-100 focus-within:ring-emerald-300"
              : "bg-surface-container focus-within:ring-primary/30",
          )}>
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={onKeyDown}
              placeholder="Ask anything about your career… (Enter to send)"
              rows={1}
              disabled={isTyping}
              className={cn(
                "flex-1 bg-transparent text-xs outline-none resize-none max-h-32 leading-relaxed",
                isLight ? "text-slate-900 placeholder:text-slate-500" : "text-white placeholder:text-outline",
              )}
              style={{ fieldSizing: "content" } as React.CSSProperties}
            />
            <button
              onClick={() => handleSend()}
              disabled={!input.trim() || isTyping}
              className={cn(
                "w-7 h-7 rounded-lg flex items-center justify-center transition-all flex-shrink-0",
                input.trim() && !isTyping
                  ? isLight
                    ? "bg-emerald-600 text-white hover:scale-105 active:scale-95"
                    : "gradient-primary text-on-primary-container hover:scale-105 active:scale-95"
                  : isLight
                    ? "bg-slate-200 text-slate-400 cursor-not-allowed"
                    : "bg-white/5 text-outline cursor-not-allowed",
              )}
            >
              <Send className="w-3 h-3" />
            </button>
          </div>
          <p className={cn("text-center text-[10px] mt-2", isLight ? "text-slate-500" : "text-outline")}>
            AI may make mistakes. Always verify important career decisions.
          </p>
        </div>
      </section>
    </div>
  );
}
