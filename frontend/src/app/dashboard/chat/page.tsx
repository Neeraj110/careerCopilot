"use client";

import { useState, useEffect, useRef } from "react";
import { Send, Bot, User, FileText, ChevronDown, Plus, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { motion } from "framer-motion";
import { chatApi } from "@/lib/api/chat";
import { documentsApi } from "@/lib/api/documents";
import type { Chat, Message, Document } from "@/types";

export default function ChatPage() {
  const [chats, setChats] = useState<Chat[]>([]);
  const [documents, setDocuments] = useState<Document[]>([]);
  
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [activeDocumentId, setActiveDocumentId] = useState<string | null>(null);
  
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isLoadingChats, setIsLoadingChats] = useState(true);

  const scrollRef = useRef<HTMLDivElement>(null);

  // Fetch initial data
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const [chatsRes, docsRes] = await Promise.all([
          chatApi.getAll(),
          documentsApi.getAll()
        ]);
        setChats(chatsRes.data || []);
        setDocuments(docsRes.data || []);
        
        if (chatsRes.data && chatsRes.data.length > 0) {
          setActiveChatId(chatsRes.data[0].id);
        }
      } catch (error) {
        console.error("Failed to fetch chats or documents:", error);
      } finally {
        setIsLoadingChats(false);
      }
    };
    fetchInitialData();
  }, []);

  // Fetch active chat messages
  useEffect(() => {
    if (!activeChatId) return;
    
    const fetchChatDetails = async () => {
      try {
        const res = await chatApi.getById(activeChatId);
        setMessages(res.data.messages || []);
        setActiveDocumentId(res.data.documentId || null);
      } catch (error) {
        console.error("Failed to fetch chat details:", error);
      }
    };
    
    fetchChatDetails();
  }, [activeChatId]);

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isTyping]);

  const handleCreateChat = async () => {
    try {
      const res = await chatApi.create({ title: "New Chat" });
      setChats([res.data, ...chats]);
      setActiveChatId(res.data.id);
      setMessages([]);
      setActiveDocumentId(null);
    } catch (error) {
      console.error("Failed to create chat:", error);
    }
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    // If no active chat, create one first
    let currentChatId = activeChatId;
    if (!currentChatId) {
      try {
        const res = await chatApi.create({ 
          title: input.slice(0, 30) + "...",
          documentId: activeDocumentId || undefined
        });
        setChats([res.data, ...chats]);
        currentChatId = res.data.id;
        setActiveChatId(currentChatId);
      } catch (error) {
        console.error("Failed to create chat:", error);
        return;
      }
    }

    const messageText = input;
    setInput("");
    
    // Optimistically add user message
    const tempUserId = Date.now().toString();
    setMessages((prev) => [
      ...prev,
      {
        id: tempUserId,
        chatId: currentChatId!,
        role: "USER",
        content: messageText,
        sources: null,
        createdAt: new Date().toISOString()
      }
    ]);
    
    setIsTyping(true);

    let currentAiMessageId = "";
    
    try {
      await chatApi.sendMessage(currentChatId, messageText, {
        onToken: (chunk) => {
          setIsTyping(false);
          setMessages((prev) => {
            const lastMsg = prev[prev.length - 1];
            if (lastMsg && lastMsg.role === "AI" && lastMsg.id === currentAiMessageId) {
              // Append to existing AI message
              return [
                ...prev.slice(0, -1),
                { ...lastMsg, content: lastMsg.content + chunk }
              ];
            } else {
              // Create new AI message
              currentAiMessageId = Date.now().toString();
              return [
                ...prev,
                {
                  id: currentAiMessageId,
                  chatId: currentChatId!,
                  role: "AI",
                  content: chunk,
                  sources: null,
                  createdAt: new Date().toISOString()
                }
              ];
            }
          });
        },
        onError: (err) => {
          console.error("SSE Error:", err);
          setIsTyping(false);
        },
        onDone: () => {
          setIsTyping(false);
        }
      });
    } catch (error) {
      console.error("Failed to send message:", error);
      setIsTyping(false);
    }
  };

  const activeDoc = documents.find(d => d.id === activeDocumentId);
  const activeChat = chats.find(c => c.id === activeChatId);

  return (
    <div className="flex h-[calc(100vh-8rem)] gap-6">
      {/* Chat History Sidebar */}
      <div className="hidden w-64 flex-col rounded-lg border border-border/50 bg-card/50 backdrop-blur-sm lg:flex">
        <div className="p-4 border-b border-border/50">
          <Button onClick={handleCreateChat} className="w-full flex items-center gap-2" variant="outline">
            <Plus className="h-4 w-4" /> New Chat
          </Button>
        </div>
        <ScrollArea className="flex-1 p-3">
          {isLoadingChats ? (
            <div className="flex justify-center p-4">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : chats.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center p-4">No chats yet.</p>
          ) : (
            <div className="space-y-2 text-sm">
              {chats.map((chat) => (
                <div 
                  key={chat.id}
                  onClick={() => setActiveChatId(chat.id)}
                  className={`rounded-md px-3 py-2 cursor-pointer transition-colors ${
                    activeChatId === chat.id 
                      ? "bg-muted font-medium text-foreground" 
                      : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                  }`}
                >
                  {chat.title || "New Chat"}
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </div>

      {/* Main Chat Area */}
      <div className="flex flex-1 flex-col overflow-hidden rounded-lg border border-border/50 bg-card/50 backdrop-blur-sm">
        {/* Chat Header */}
        <div className="flex items-center justify-between border-b border-border/50 p-4">
          <h2 className="font-semibold">{activeChat?.title || "New Chat"}</h2>
          <DropdownMenu>
            <DropdownMenuTrigger className="inline-flex h-9 items-center justify-center gap-2 whitespace-nowrap rounded-md border border-input bg-transparent px-3 text-sm font-medium shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 max-w-[250px]">
              <FileText className="h-4 w-4 shrink-0" />
              <span className="truncate">{activeDoc ? activeDoc.title : "No Document Selected"}</span>
              <ChevronDown className="h-4 w-4 shrink-0" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[250px]">
              <DropdownMenuItem onClick={() => setActiveDocumentId(null)}>
                None
              </DropdownMenuItem>
              {documents.map(doc => (
                <DropdownMenuItem key={doc.id} onClick={() => setActiveDocumentId(doc.id)}>
                  <span className="truncate">{doc.title}</span>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Chat Messages */}
        <ScrollArea className="flex-1 p-4">
          <div className="space-y-6">
            {messages.length === 0 && !isTyping ? (
              <div className="flex h-full flex-col items-center justify-center text-center p-8 mt-12">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary mb-4">
                  <Bot className="h-6 w-6" />
                </div>
                <h3 className="font-medium text-lg">How can I help you?</h3>
                <p className="text-muted-foreground mt-2 max-w-sm">
                  Ask me anything about your resume, interview prep, or career advice.
                </p>
              </div>
            ) : (
              messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex gap-4 ${
                    message.role === "USER" ? "justify-end" : "justify-start"
                  }`}
                >
                  {message.role !== "USER" && (
                    <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-primary/20 text-primary">
                      <Bot className="h-5 w-5" />
                    </div>
                  )}
                  <div
                    className={`rounded-xl px-4 py-3 max-w-[80%] ${
                      message.role === "USER"
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted/50 text-foreground border border-border/50"
                    }`}
                  >
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
                  </div>
                  {message.role === "USER" && (
                    <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-muted border border-border">
                      <User className="h-5 w-5 text-muted-foreground" />
                    </div>
                  )}
                </div>
              ))
            )}
            
            {isTyping && (
              <div className="flex gap-4 justify-start">
                <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-primary/20 text-primary">
                  <Bot className="h-5 w-5" />
                </div>
                <div className="rounded-xl px-4 py-4 bg-muted/50 border border-border/50 flex items-center gap-1">
                  <motion.div animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0 }} className="h-1.5 w-1.5 rounded-full bg-muted-foreground/50" />
                  <motion.div animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.2 }} className="h-1.5 w-1.5 rounded-full bg-muted-foreground/50" />
                  <motion.div animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.4 }} className="h-1.5 w-1.5 rounded-full bg-muted-foreground/50" />
                </div>
              </div>
            )}
            <div ref={scrollRef} />
          </div>
        </ScrollArea>

        {/* Chat Input */}
        <div className="border-t border-border/50 p-4">
          <form
            onSubmit={handleSend}
            className="flex items-center gap-2 rounded-lg border border-border bg-background p-1 pr-2 shadow-sm focus-within:ring-1 focus-within:ring-primary focus-within:border-primary transition-all"
          >
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask anything about your career or documents..."
              className="flex-1 border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 shadow-none"
            />
            <Button type="submit" size="icon" disabled={!input.trim() || isTyping} className="h-8 w-8 rounded-md shrink-0">
              <Send className="h-4 w-4" />
              <span className="sr-only">Send message</span>
            </Button>
          </form>
          <p className="mt-2 text-center text-xs text-muted-foreground">
            AI can make mistakes. Verify important information.
          </p>
        </div>
      </div>
    </div>
  );
}
