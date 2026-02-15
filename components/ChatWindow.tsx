'use client';

import { useState, useRef, useEffect } from 'react';
import { MessageBubble, Message } from './MessageBubble';

interface ChatWindowProps {
  householdId: string;
  userId: string;
}

export default function ChatWindow({ householdId, userId }: ChatWindowProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = input.trim();
    if (!trimmed || isLoading) return;

    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: 'user',
      content: trimmed,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: trimmed,
          sessionId,
          householdId,
          userId,
        }),
      });

      const data = await res.json();

      if (data.sessionId && !sessionId) {
        setSessionId(data.sessionId);
      }

      const assistantMessage: Message = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: data.message || 'Sorry, I could not process that request.',
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          role: 'assistant',
          content: 'Something went wrong. Please try again.',
          timestamp: new Date(),
        },
      ]);
    } finally {
      setIsLoading(false);
      inputRef.current?.focus();
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  }

  return (
    <div className="flex flex-col h-full">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-4">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <h2 className="font-display text-3xl font-bold mb-2">
              <span className="bg-gradient-to-r from-pink via-coral to-gold bg-clip-text text-transparent">
                MyVansh.AI
              </span>
            </h2>
            <p className="text-text-500 max-w-md">
              Ask me about your family history, add new members, or share
              stories. Try: &quot;Who are the oldest members of our family?&quot;
            </p>
          </div>
        )}

        {messages.map((msg) => (
          <MessageBubble key={msg.id} message={msg} />
        ))}

        {isLoading && (
          <div className="flex items-center gap-2 text-text-400 px-4 py-2">
            <div className="flex gap-1">
              <span className="w-2 h-2 bg-coral rounded-full animate-bounce" />
              <span className="w-2 h-2 bg-coral rounded-full animate-bounce [animation-delay:0.1s]" />
              <span className="w-2 h-2 bg-coral rounded-full animate-bounce [animation-delay:0.2s]" />
            </div>
            <span className="text-sm">Searching family records...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form
        onSubmit={handleSubmit}
        className="border-t border-text-300/20 bg-white px-4 py-3"
      >
        <div className="flex items-end gap-3 max-w-3xl mx-auto">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask about your family history..."
            rows={1}
            className="flex-1 resize-none rounded-xl border border-text-300/30 bg-bg px-4 py-3 text-text-800 placeholder:text-text-400 focus:outline-none focus:ring-2 focus:ring-coral/40 font-body"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="px-5 py-3 rounded-xl bg-gradient-to-r from-pink via-coral to-gold text-white font-body font-semibold shadow-sm hover:shadow-md transition-shadow disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Send
          </button>
        </div>
      </form>
    </div>
  );
}
