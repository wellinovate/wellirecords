import React, { useState, useRef, useEffect } from 'react';
import { Icons } from '../layout/Icons';
import { sendMessageToAI, initializeChat } from '../../services/geminiService';
import { ChatMessage } from '../../types';

export const AIHealthAssistant: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'model',
      text: "Hello! I'm Welli-AI, your WelliCare™ preliminary assistant. I can help assess symptoms, provide health information, or guide you to a specialist. How are you feeling today?",
      timestamp: new Date()
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Initialize chat on mount
  useEffect(() => {
    initializeChat().catch(console.error);
  }, []);

  const handleSend = async () => {
    if (!inputText.trim() || isLoading) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      text: inputText,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    setIsLoading(true);

    try {
      // Create a placeholder for the AI response
      const aiMsgId = (Date.now() + 1).toString();
      setMessages(prev => [
        ...prev,
        {
          id: aiMsgId,
          role: 'model',
          text: '', // Start empty for streaming
          timestamp: new Date()
        }
      ]);

      const stream = await sendMessageToAI(userMsg.text);
      
      let fullText = '';
      
      for await (const chunk of stream) {
        fullText += chunk;
        setMessages(prev => 
          prev.map(msg => 
            msg.id === aiMsgId ? { ...msg, text: fullText } : msg
          )
        );
      }

    } catch (error) {
      setMessages(prev => [
        ...prev,
        {
          id: Date.now().toString(),
          role: 'model',
          text: "I'm having trouble connecting to the WelliCare network right now. Please check your connection.",
          timestamp: new Date(),
          isError: true
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-slate-100 bg-welli-50 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-white p-2 rounded-xl shadow-sm">
            <Icons.Stethoscope className="w-5 h-5 text-welli-600" />
          </div>
          <div>
            <h2 className="font-bold text-slate-900">WelliCare™ AI Triage</h2>
            <p className="text-xs text-slate-500 font-medium">Powered by Gemini 2.5 Flash</p>
          </div>
        </div>
        <div className="flex items-center gap-2 px-3 py-1 bg-white/50 text-welli-800 text-xs font-bold rounded-full border border-welli-100">
          <span className="w-2 h-2 rounded-full bg-welli-500 animate-pulse"></span>
          Welli-AI Active
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50/50">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[85%] p-4 rounded-2xl text-sm leading-relaxed shadow-sm ${
                msg.role === 'user'
                  ? 'bg-welli-600 text-white rounded-br-none'
                  : msg.isError 
                    ? 'bg-red-50 text-red-600 border border-red-100 rounded-bl-none'
                    : 'bg-white border border-slate-200 text-slate-700 rounded-bl-none'
              }`}
            >
              <div className="whitespace-pre-wrap">{msg.text}</div>
              <div className={`text-[10px] mt-2 font-medium ${msg.role === 'user' ? 'text-welli-100' : 'text-slate-400'}`}>
                {msg.role === 'model' && <span className="mr-1">Welli-AI •</span>}
                {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-white border border-slate-200 p-4 rounded-2xl rounded-bl-none shadow-sm">
              <div className="flex gap-1.5">
                <div className="w-2 h-2 bg-welli-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-2 h-2 bg-welli-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-2 h-2 bg-welli-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 bg-white border-t border-slate-100">
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder="Describe your symptoms (e.g., severe headache, fever over 38°C)..."
            className="flex-1 p-4 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-welli-500 focus:border-transparent text-sm placeholder:text-slate-400"
          />
          <button
            onClick={handleSend}
            disabled={isLoading || !inputText.trim()}
            className="p-4 bg-welli-600 text-white rounded-xl hover:bg-welli-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-welli-600/20 active:scale-95"
          >
            <Icons.Send className="w-5 h-5" />
          </button>
        </div>
        <p className="text-[10px] text-center text-slate-400 mt-3 flex items-center justify-center gap-1">
          <Icons.ShieldCheck className="w-3 h-3" />
          Welli-AI provides information, not medical diagnosis. In emergencies, use WelliCare SOS.
        </p>
      </div>
    </div>
  );
};