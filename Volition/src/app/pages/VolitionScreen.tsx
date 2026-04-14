import { useState, useRef, useEffect } from 'react';
import { Send } from 'lucide-react';
import { FloatingHUD } from '../components/FloatingHUD';

interface Message {
  id: string;
  sender: 'user' | 'volition';
  content: string;
  timestamp: Date;
}

export function VolitionScreen() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      sender: 'volition',
      content: 'VOLITION ONLINE. I exist to reflect on your choices, your resolve, and the weight of consequence. What burdens your conscience?',
      timestamp: new Date(Date.now() - 300000)
    },
    {
      id: '2',
      sender: 'user',
      content: 'I need to make a decision about the upcoming project deadline.',
      timestamp: new Date(Date.now() - 240000)
    },
    {
      id: '3',
      sender: 'volition',
      content: 'Deadlines are constructs. But they reveal truth—your priorities, your fears, your discipline. Tell me: what prevents you from acting?',
      timestamp: new Date(Date.now() - 180000)
    },
  ]);

  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = () => {
    if (inputValue.trim() === '') return;

    const newUserMessage: Message = {
      id: Date.now().toString(),
      sender: 'user',
      content: inputValue.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, newUserMessage]);
    setInputValue('');
    setIsTyping(true);

    // Simulate AI response
    setTimeout(() => {
      const responses = [
        'I see the weight of that choice. What does your instinct tell you?',
        'Reflect deeper. What are you truly avoiding?',
        'That\'s the voice of duty speaking. But is it aligned with your values?',
        'Consider the long-term consequence. Not just the immediate relief.',
        'You already know the answer. You\'re seeking permission to act on it.',
      ];

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        sender: 'volition',
        content: responses[Math.floor(Math.random() * responses.length)],
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, aiMessage]);
      setIsTyping(false);
    }, 2000);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="relative w-full h-screen overflow-hidden bg-black text-white pt-14">
      {/* Left Area: Empty Transparent Container (70%) */}
      <div className="absolute left-0 top-14 h-[calc(100vh-56px)] w-[calc(100%-320px)] flex items-center justify-center">
        <div 
          className="w-[90%] h-[80%] border-2 border-dashed border-white/10 flex items-center justify-center"
        >
          <div className="text-center">
            <div className="font-['Syncopate'] text-sm tracking-[0.3em] text-white/20 mb-2">
              RESERVED_SPACE
            </div>
            <div className="font-['Share_Tech_Mono'] text-xs text-white/10 tracking-widest">
              [VISUALIZATION CANVAS - FUTURE IMPLEMENTATION]
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel: Volition Chat Interface (30%) */}
      <div 
        className="fixed right-0 top-14 h-[calc(100vh-56px)] w-[320px] z-20 bg-black/80 backdrop-blur-xl border-l border-white/10 flex flex-col"
        style={{
          boxShadow: '-4px 0 32px 0 rgba(0, 0, 0, 0.5), inset 1px 0 0 0 rgba(255, 255, 255, 0.05)',
        }}
      >
        {/* Header */}
        <div className="p-6 pb-4 border-b border-white/10 shrink-0">
          <h2 className="text-white font-['Syncopate'] text-xs font-bold tracking-[0.3em] mb-2">
            VOLITION
          </h2>
          <div className="text-white/40 text-[10px] tracking-widest font-['Share_Tech_Mono'] uppercase">
            CONSCIENCE_INTERFACE // ACTIVE
          </div>
        </div>

        {/* Message History - Scrollable */}
        <div 
          ref={chatContainerRef}
          className="flex-1 overflow-y-auto px-6 py-4 space-y-4 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent"
        >
          {messages.map((message) => (
            <div key={message.id} className={`flex flex-col gap-1 ${message.sender === 'user' ? 'items-end' : 'items-start'}`}>
              {/* Sender Label */}
              <div className="font-['Share_Tech_Mono'] text-[9px] tracking-widest text-white/30 uppercase">
                {message.sender === 'user' ? 'USER' : 'VOLITION'}
              </div>
              
              {/* Message Bubble */}
              <div 
                className={`max-w-[85%] p-3 border ${
                  message.sender === 'user' 
                    ? 'bg-white/5 border-white/20 text-white/90' 
                    : 'bg-black/60 border-white/10 text-white/70'
                }`}
              >
                <p className="text-xs leading-relaxed">
                  {message.content}
                </p>
              </div>

              {/* Timestamp */}
              <div className="font-['Share_Tech_Mono'] text-[8px] text-white/20 tracking-wider">
                {message.timestamp.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
          ))}

          {/* Typing Indicator */}
          {isTyping && (
            <div className="flex flex-col gap-1 items-start">
              <div className="font-['Share_Tech_Mono'] text-[9px] tracking-widest text-white/30 uppercase">
                VOLITION
              </div>
              <div className="bg-black/60 border border-white/10 p-3">
                <div className="flex gap-1">
                  <div className="w-1.5 h-1.5 bg-white/40 rounded-full animate-pulse" style={{ animationDelay: '0ms' }} />
                  <div className="w-1.5 h-1.5 bg-white/40 rounded-full animate-pulse" style={{ animationDelay: '150ms' }} />
                  <div className="w-1.5 h-1.5 bg-white/40 rounded-full animate-pulse" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-6 pt-4 border-t border-white/10 shrink-0">
          <div className="flex gap-2">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="SPEAK YOUR MIND..."
              className="flex-1 bg-white/5 border border-white/20 px-3 py-2.5 text-xs text-white placeholder:text-white/30 outline-none focus:border-white/40 focus:bg-white/10 transition-colors font-['Share_Tech_Mono'] tracking-wider"
            />
            <button
              onClick={handleSendMessage}
              disabled={inputValue.trim() === ''}
              className="px-4 py-2.5 bg-white/10 border border-white/20 hover:bg-white/20 hover:border-white/40 disabled:opacity-30 disabled:cursor-not-allowed transition-all flex items-center justify-center"
            >
              <Send className="w-4 h-4 text-white" />
            </button>
          </div>
          
          <div className="mt-2 text-[8px] text-white/20 tracking-widest font-['Share_Tech_Mono'] text-center">
            PRESS ENTER TO SEND
          </div>
        </div>
      </div>

      {/* Bottom HUD - Preserved */}
      <FloatingHUD value={inputValue} onChange={setInputValue} />

      {/* Scanline Overlay */}
      <div className="absolute inset-0 pointer-events-none z-[100] mix-blend-overlay opacity-10 bg-[linear-gradient(rgba(0,0,0,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,255,255,0.02),rgba(255,255,255,0.01),rgba(255,255,255,0.02))] bg-[length:100%_4px,3px_100%]" />
    </div>
  );
}