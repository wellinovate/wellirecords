import React, { useState, useRef, useEffect } from 'react';
import { sendChatMessage } from '../services/geminiService';
import { ChatMessage } from '../types';
import { Send, Bot, User, Globe, ExternalLink, Sparkles } from 'lucide-react';

export const HealthChat: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'model',
      text: "Hello! I'm your WelliRecord AI assistant. I can help you understand medical terms, research health topics using Google Search, or organize your health goals. How can I help today?"
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      text: input
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const response = await sendChatMessage(messages, userMsg.text);
      setMessages(prev => [...prev, response]);
    } catch (error) {
      console.error(error);
      setMessages(prev => [...prev, {
          id: Date.now().toString(),
          role: 'model',
          text: "Sorry, I encountered an error while processing your request."
      }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] bg-slate-900 rounded-xl border border-slate-800 shadow-sm overflow-hidden">
      <div className="bg-blue-700 p-4 text-white flex items-center justify-between shadow-md z-10">
          <div className="flex items-center gap-2">
            <Sparkles size={20} className="text-yellow-300" />
            <h3 className="font-semibold">Welli AI Chat</h3>
          </div>
          <span className="text-xs bg-blue-800/50 px-2 py-1 rounded border border-blue-600">Powered by Gemini 3</span>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-950">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex items-start gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
          >
            <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
              msg.role === 'user' ? 'bg-blue-600 text-white' : 'bg-slate-700 text-slate-300'
            }`}>
              {msg.role === 'user' ? <User size={16} /> : <Bot size={16} />}
            </div>
            
            <div className={`flex flex-col max-w-[80%] ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                <div className={`p-4 rounded-2xl shadow-sm text-sm leading-relaxed ${
                  msg.role === 'user' 
                    ? 'bg-blue-600 text-white rounded-tr-none' 
                    : 'bg-slate-800 text-slate-200 border border-slate-700 rounded-tl-none'
                }`}>
                  {msg.text}
                </div>
                
                {/* Search Grounding Sources */}
                {msg.groundingSources && msg.groundingSources.length > 0 && (
                    <div className="mt-2 bg-slate-900 border border-slate-700 rounded-lg p-2 max-w-full text-xs">
                        <div className="flex items-center gap-1 text-slate-400 mb-1 font-medium">
                            <Globe size={12} />
                            Sources
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {msg.groundingSources.map((source, idx) => (
                                <a 
                                    key={idx} 
                                    href={source.uri} 
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-1 text-blue-400 hover:underline bg-blue-900/20 border border-blue-900/30 px-2 py-1 rounded"
                                >
                                    <span className="truncate max-w-[150px]">{source.title}</span>
                                    <ExternalLink size={10} />
                                </a>
                            ))}
                        </div>
                    </div>
                )}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex items-center gap-2 text-slate-500 text-sm ml-12">
            <div className="w-2 h-2 bg-slate-600 rounded-full animate-bounce"></div>
            <div className="w-2 h-2 bg-slate-600 rounded-full animate-bounce delay-100"></div>
            <div className="w-2 h-2 bg-slate-600 rounded-full animate-bounce delay-200"></div>
            Thinking...
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 bg-slate-900 border-t border-slate-800">
        <form onSubmit={handleSend} className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about symptoms, drugs, or recent health news..."
            className="flex-1 px-4 py-3 rounded-lg border border-slate-700 bg-slate-950 text-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none text-sm placeholder:text-slate-600"
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="bg-blue-600 hover:bg-blue-500 text-white p-3 rounded-lg transition-colors disabled:opacity-50"
          >
            <Send size={20} />
          </button>
        </form>
      </div>
    </div>
  );
};