
import React, { useState, useRef, useEffect } from 'react';
import { generateCoachingAdvice } from '../services/geminiService';
import { storage } from '../services/storageService';
import { ChatMessage, ThinkingLevel } from '../types';
import { Send, Bot, Loader2, BrainCircuit, ChevronDown, ChevronRight, Trash2, History } from 'lucide-react';
import { useAppContext } from '../contexts/AppContext';

const AICoach: React.FC = () => {
  const { t, profile, logs } = useAppContext(); // Get logs to pass to service
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [thinkingLevel, setThinkingLevel] = useState<ThinkingLevel>('low');
  const [expandedThoughts, setExpandedThoughts] = useState<Set<number>>(new Set());
  
  const scrollRef = useRef<HTMLDivElement>(null);

  // 1. Load History on Mount
  useEffect(() => {
    const saved = storage.getChatHistory();
    if (saved && saved.length > 0) {
      setMessages(saved);
    } else {
      setMessages([{ 
        role: 'model', 
        text: t('coach', 'welcome'), 
        timestamp: Date.now() 
      }]);
    }
  }, []);

  // 2. Auto-save when messages change
  useEffect(() => {
    if (messages.length > 0) {
      storage.saveChatHistory(messages);
    }
    
    // Auto Scroll
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const toggleThought = (idx: number) => {
    const newSet = new Set(expandedThoughts);
    if (newSet.has(idx)) newSet.delete(idx);
    else newSet.add(idx);
    setExpandedThoughts(newSet);
  };

  const handleClearHistory = () => {
    if (window.confirm("Clear all chat history?")) {
      storage.clearChatHistory();
      setMessages([{ 
        role: 'model', 
        text: t('coach', 'welcome'), 
        timestamp: Date.now() 
      }]);
    }
  };

  const handleSend = async () => {
    if (!input.trim()) return;

    // 1. Add User Message
    const userMsg: ChatMessage = { role: 'user', text: input, timestamp: Date.now() };
    const newHistory = [...messages, userMsg];
    setMessages(newHistory);
    setInput('');
    setIsLoading(true);

    // 2. Call AI (Pass history excluding the welcome msg if needed, usually sending full is fine)
    // We send 'messages' (current state before this update) as history
    const response = await generateCoachingAdvice(userMsg.text, logs, profile, thinkingLevel, messages);
    
    // 3. Add AI Response
    setMessages(prev => [...prev, { 
      role: 'model', 
      text: response.text, 
      thought: response.thought, 
      timestamp: Date.now() 
    }]);
    setIsLoading(false);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-80px)] bg-background">
      {/* Header */}
      <div className="p-4 border-b border-border bg-surface/50 backdrop-blur-sm sticky top-0 z-10 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-primary to-emerald-300 flex items-center justify-center text-background shadow-[0_0_15px_rgba(204,255,0,0.3)]">
            <Bot size={24} />
          </div>
          <div>
            <h1 className="text-lg font-bold text-white">{t('coach', 'title')}</h1>
            <p className="text-xs text-primary flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></span>
              {t('coach', 'online')}
            </p>
          </div>
        </div>

        <div className="flex gap-2">
           {/* Thinking Mode */}
           <div className="bg-black/40 p-1 rounded-lg flex items-center border border-white/10">
              <button 
                onClick={() => setThinkingLevel('low')}
                className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all ${thinkingLevel === 'low' ? 'bg-zinc-700 text-white shadow-sm' : 'text-zinc-500 hover:text-zinc-300'}`}
              >
                {t('coach', 'modeLow')}
              </button>
              <button 
                onClick={() => setThinkingLevel('high')}
                className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all flex items-center gap-1 ${thinkingLevel === 'high' ? 'bg-secondary text-white shadow-sm' : 'text-zinc-500 hover:text-zinc-300'}`}
              >
                <BrainCircuit size={12} /> {t('coach', 'modeHigh')}
              </button>
           </div>
           
           {/* Clear Button */}
           <button 
             onClick={handleClearHistory}
             className="p-2 bg-black/40 border border-white/10 rounded-lg text-zinc-500 hover:text-red-400 hover:border-red-400/30 transition-all"
             title="Clear History"
           >
             <Trash2 size={16} />
           </button>
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4" ref={scrollRef}>
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'} animate-in fade-in slide-in-from-bottom-2 duration-300`}>
            
            {/* Thinking Block (Model only) */}
            {msg.role === 'model' && msg.thought && (
              <div className="max-w-[85%] mb-2">
                 <button 
                   onClick={() => toggleThought(idx)}
                   className="flex items-center gap-2 text-[10px] text-zinc-500 hover:text-primary transition-colors mb-1 bg-black/20 px-3 py-1 rounded-full border border-white/5 uppercase tracking-wider font-mono"
                 >
                   <BrainCircuit size={10} />
                   {t('coach', 'thinkingProcess')}
                   {expandedThoughts.has(idx) ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
                 </button>
                 
                 {expandedThoughts.has(idx) && (
                   <div className="p-3 bg-zinc-900/80 border-l-2 border-secondary rounded-r-lg text-xs font-mono text-zinc-400 italic leading-relaxed animate-in fade-in slide-in-from-top-1">
                     {msg.thought}
                   </div>
                 )}
              </div>
            )}

            {/* Message Bubble */}
            <div 
              className={`max-w-[85%] p-3.5 rounded-2xl text-sm leading-relaxed shadow-lg ${
                msg.role === 'user' 
                ? 'bg-primary text-background font-bold rounded-tr-sm' 
                : 'bg-surface border border-border text-gray-200 rounded-tl-sm'
              }`}
            >
              {msg.text.split('\n').map((line, i) => (
                <p key={i} className={i > 0 ? 'mt-2' : ''}>{line}</p>
              ))}
            </div>
            
            {/* Timestamp */}
            <div className="text-[10px] text-zinc-600 mt-1 px-1">
               {new Date(msg.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
            </div>
          </div>
        ))}
        
        {isLoading && (
          <div className="flex justify-start animate-pulse">
            <div className="bg-surface border border-border p-4 rounded-2xl rounded-tl-sm flex items-center gap-2">
              <Loader2 className="animate-spin text-primary" size={16} />
              <span className="text-xs text-muted font-mono">
                {thinkingLevel === 'high' ? "ANALYZING_CONTEXT..." : "TYPING..."}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="p-3 border-t border-border bg-surface relative z-20">
        <div className="relative flex items-center gap-2">
          <input 
            type="text" 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder={t('coach', 'placeholder')}
            className="flex-1 bg-black/50 border border-white/10 text-white rounded-full py-3 px-5 focus:outline-none focus:border-primary text-sm backdrop-blur-md"
          />
          <button 
            onClick={handleSend}
            disabled={isLoading || !input.trim()}
            className="p-3 bg-primary text-background rounded-full hover:bg-opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-[0_0_15px_rgba(204,255,0,0.4)]"
          >
            <Send size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default AICoach;
