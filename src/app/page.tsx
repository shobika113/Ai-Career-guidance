"use client";

import { useState, useRef, useEffect } from "react";
import { toast } from "sonner";
import { ChatHeader } from "@/components/global/header";
import { ChatMessages } from "@/components/global/chatMessages";
import { ChatInput } from "@/components/global/chatInput";

type Message = { role: "user" | "assistant"; content: string };

const WELCOME_MESSAGE: Message = {
  role: "assistant",
  content:
    "Hi! I'm Career Sense, your career guidance counselor. How can I help you today?",
};

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([WELCOME_MESSAGE]);
  const [loading, setLoading] = useState(false);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const res = await fetch("/api/history");
        const data = await res.json();
        if (data.success && data.messages.length > 0) {
          setMessages(data.messages);
        }
      } catch {
        toast("Failed to load chat history.");
      }
    };

    fetchMessages();
  }, []);

  const sendMessage = async (content: string) => {
    if (!content.trim()) return;

    const userMessage: Message = { role: "user", content };
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        body: JSON.stringify({ messages: updatedMessages }),
      });

      const data = await res.json();
      if (!data.success) {
        toast(data.error);
        return;
      }

      const assistantMessage = data.data;
      setMessages((prev) => [...prev, assistantMessage]);
    } catch {
      toast("Failed to connect. Please try again.");
    } finally {
      setLoading(false);
      setTimeout(() => {
        chatContainerRef.current?.scrollTo({
          top: chatContainerRef.current.scrollHeight,
          behavior: "smooth",
        });
      }, 100);
    }
  };

  return (
    <div className="flex flex-col h-screen justify-center">
      <ChatHeader />
      <div
        ref={chatContainerRef}
        className="flex-1 overflow-y-auto p-4 space-y-4 no-scrollbar max-w-4xl mx-auto w-full"
      >
        <ChatMessages messages={messages} />
      </div>
      <ChatInput onSend={sendMessage} disabled={loading} />
    </div>
  );
}
