import React, { useRef, useEffect } from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cx(...inputs: ClassValue[]) { return twMerge(clsx(inputs)); }

interface BottomHUDProps {
  viewMode: 'COMMAND_HUD' | 'NEURAL_MAP';
  setViewMode: (mode: 'COMMAND_HUD' | 'NEURAL_MAP') => void;
  searchQuery?: string;                        
  setSearchQuery?: (value: string) => void;    
  onExecute?: (value: string) => void;         
}

export const BottomHUD: React.FC<BottomHUDProps> = ({ viewMode, setViewMode, searchQuery = '', setSearchQuery, onExecute }) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize magic!
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'; // Reset height
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 150)}px`; // Grow up to 150px
    }
  }, [searchQuery]);

  return (
    <div className="absolute bottom-8 left-[35vw] -translate-x-1/2 z-20 font-['Share_Tech_Mono'] flex flex-col items-center gap-4 pointer-events-auto max-md:left-1/2 max-md:bottom-4 max-md:w-[calc(100%-2rem)] max-md:px-4">
      <div className="flex w-[600px] shadow-[0_0_30px_rgba(255,255,255,0.05)] border border-white/20 group transition-all duration-500 max-md:w-full items-end bg-black/80 backdrop-blur-md">
        
        <div className="flex-1 flex items-start px-4 transition-colors group-hover:bg-black/90 max-md:px-3 py-3">
          <span className="text-white/50 mr-3 font-bold max-md:mr-2 mt-0.5">{'>_'}</span>
          
          {/* UPGRADED TO TEXTAREA */}
          <textarea 
            ref={textareaRef}
            value={searchQuery}
            onChange={(e) => setSearchQuery?.(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault(); // Prevent new line on pure enter
                onExecute?.(searchQuery);
                setSearchQuery?.('');
              }
            }}
            placeholder={viewMode === 'NEURAL_MAP' ? "SEARCH_NODE_HASH..." : "QUERY_THE_VOID..."} 
            rows={1}
            className="bg-transparent border-none outline-none text-white w-full tracking-widest placeholder:text-white/30 text-sm font-mono max-md:text-xs resize-none overflow-y-auto custom-scrollbar"
          />
        </div>
        
        <button 
          onClick={() => {
            onExecute?.(searchQuery);
            setSearchQuery?.(''); 
          }}
          className="bg-white text-black px-8 py-3 font-bold tracking-widest hover:bg-gray-200 transition-colors border-l border-white/20 text-sm flex items-center justify-center cursor-pointer max-md:px-6 max-md:text-xs h-full min-h-[44px]"
        >
          EXECUTE
        </button>
      </div>

      <div className="flex items-center gap-6 text-xs font-bold tracking-[0.2em] text-white/40 bg-black/40 px-6 py-2 border border-white/10 backdrop-blur-md max-md:gap-3 max-md:px-4 max-md:text-[10px] max-md:min-h-[44px]">
        <button 
          className={cx("transition-colors cursor-pointer", viewMode === 'COMMAND_HUD' ? "text-white drop-shadow-[0_0_5px_rgba(255,255,255,0.8)]" : "hover:text-white")}
          onClick={() => setViewMode('COMMAND_HUD')}
        >
          [ COMMAND_HUD ]
        </button>
        <span className="text-white/20">||</span>
        <button 
          className={cx("transition-colors cursor-pointer", viewMode === 'NEURAL_MAP' ? "text-white drop-shadow-[0_0_5px_rgba(255,255,255,0.8)]" : "hover:text-white")}
          onClick={() => setViewMode('NEURAL_MAP')}
        >
          [ NEURAL_MAP ]
        </button>
      </div>
    </div>
  );
};