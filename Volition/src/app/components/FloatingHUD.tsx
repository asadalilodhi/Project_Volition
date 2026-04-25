import { motion, AnimatePresence } from 'motion/react';

interface FloatingHUDProps {
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  showOfflineIndicator?: boolean;
  onExecute?: (value: string) => void; 
  isProposing?: boolean;               
  needsTime?: boolean;           // <-- Added this
  onCancelTime?: () => void;     // <-- Added this
  viewMode?: 'COMMAND_HUD' | 'NEURAL_MAP';                     // <-- Brought over from BottomHUD
  setViewMode?: (mode: 'COMMAND_HUD' | 'NEURAL_MAP') => void;  // <-- Brought over from BottomHUD
}

export function FloatingHUD({
  value = '',
  onChange,
  placeholder = 'QUERY_THE_VOID...',
  showOfflineIndicator = true,
  onExecute,                           
  isProposing,                          
  needsTime = false,             // <-- Added this
  onCancelTime,                  // <-- Added this
  viewMode = 'COMMAND_HUD',      // <-- Default from BottomHUD
  setViewMode                    // <-- From BottomHUD
}: FloatingHUDProps) {
  
  // Look! No more regex. The UI is 100% controlled by Gemini now.
  const showCalendarConfirm = needsTime;

  const handleConfirm = () => {
    // TODO: We will wire this to send the confirmed time later
    onCancelTime?.();
  };

  const handleCancel = () => {
    onCancelTime?.();
  };

  return (
    <div className="fixed bottom-12 left-1/2 -translate-x-1/2 z-30 flex flex-col items-center w-[600px] pointer-events-auto">
      
      {/* Offline Indicator & Status */}
      {showOfflineIndicator && (
        <div className="flex items-center gap-2 mb-3 text-[10px] text-[#666] tracking-widest uppercase font-['Share_Tech_Mono'] mr-auto w-full">
          <motion.div 
            className="w-2 h-2 rounded-full bg-[#888]"
            animate={{ opacity: [1, 0.3, 1] }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          />
          <span>SYSTEM OFFLINE // LOCAL BUFFER ACTIVE</span>
        </div>
      )}

      {/* Main input bar & Expanding Box Container */}
      <div className="relative w-full flex flex-col items-center">
        
        {/* The Expanding Calendar Confirmation */}
        <AnimatePresence>
          {showCalendarConfirm && (
            <motion.div
              initial={{ opacity: 0, height: 0, y: 10 }}
              animate={{ opacity: 1, height: 'auto', y: 0 }}
              exit={{ opacity: 0, height: 0, y: 10 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="w-full bg-[#111]/90 backdrop-blur-xl border border-[#333] border-b-0 overflow-hidden"
              style={{
                boxShadow: '0 -8px 32px 0 rgba(0, 0, 0, 0.8), inset 0 1px 0 0 rgba(255, 255, 255, 0.1)',
              }}
            >
              <div className="border-b border-[#333] px-4 py-2 bg-[#000]">
                <span className="text-[10px] text-[#0066ff] tracking-widest font-['Share_Tech_Mono'] uppercase">
                  SYSTEM_PROMPT // SCHEDULING_DETECTED
                </span>
              </div>
              <div className="p-6">
                <p className="text-white text-sm font-['Share_Tech_Mono'] mb-6 tracking-wider uppercase">
                  MISSING EXACT TIME PARAMETERS. <br/>
                  <span className="text-[#aaa]">Please confirm exact Date/Time for: "{value}"</span>
                </p>
                {/* We will eventually put a real datetime picker here! */}
                <div className="flex gap-4">
                  <button
                    onClick={handleConfirm}
                    className="flex-1 px-6 py-3 border border-[#444] bg-white text-black font-['Syncopate'] text-xs font-bold tracking-widest hover:bg-[#ccc] transition-colors"
                  >
                    CONFIRM TIME
                  </button>
                  <button
                    onClick={handleCancel}
                    className="flex-1 px-6 py-3 border border-[#444] text-white font-['Syncopate'] text-xs font-bold tracking-widest hover:bg-[#222] transition-colors"
                  >
                    ABORT
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* HUD Bar */}
        <div 
          className="flex items-center w-full h-14 bg-gradient-to-r from-[#111]/90 via-[#000]/90 to-[#111]/90 border border-[#333] backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.8)] relative z-10"
          style={{
            boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.8), inset 0 1px 0 0 rgba(255, 255, 255, 0.1)',
          }}
        >
          <div className="flex items-center justify-center w-12 h-full text-[#666] border-r border-[#333]">
            <span className="text-sm font-['Share_Tech_Mono']">{'>_'}</span>
          </div>
          
          <input
            type="text"
            value={value}
            onChange={(e) => onChange?.(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                onExecute?.(value);
                // We DON'T clear the input immediately if it's an Event needing time, 
                // so the user still sees their text while picking the date!
                if (!needsTime) onChange?.(''); 
              }
            }}
            placeholder={
              isProposing ? "AWAITING FAST BRAIN..." : 
              viewMode === 'NEURAL_MAP' ? "SEARCH_NODE_HASH..." : placeholder
            }
            disabled={isProposing}
            className="flex-1 bg-transparent px-4 text-sm text-white placeholder:text-[#555] outline-none font-['Share_Tech_Mono'] tracking-widest uppercase disabled:opacity-50"
          />
          
          <button 
            onClick={() => {
              onExecute?.(value);
              if (!needsTime) onChange?.('');
            }}
            disabled={isProposing}
            className="h-full px-6 bg-white text-black font-['Syncopate'] text-xs font-bold tracking-widest hover:bg-[#ccc] transition-colors border-l border-[#333] disabled:opacity-50 cursor-pointer"
          >
            EXECUTE
          </button>
        </div>
      </div>

      {/* Interactive Mode Toggles (Ported from BottomHUD!) */}
      <div className="mt-4 flex items-center gap-6 text-xs font-bold tracking-[0.2em] text-white/40 bg-black/40 px-6 py-2 border border-white/10 backdrop-blur-md">
        <button 
          className={`transition-colors cursor-pointer ${viewMode === 'COMMAND_HUD' ? "text-white drop-shadow-[0_0_5px_rgba(255,255,255,0.8)]" : "hover:text-white"}`}
          onClick={() => setViewMode?.('COMMAND_HUD')}
        >
          [ COMMAND_HUD ]
        </button>
        <span className="text-white/20">||</span>
        <button 
          className={`transition-colors cursor-pointer ${viewMode === 'NEURAL_MAP' ? "text-white drop-shadow-[0_0_5px_rgba(255,255,255,0.8)]" : "hover:text-white"}`}
          onClick={() => setViewMode?.('NEURAL_MAP')}
        >
          [ NEURAL_MAP ]
        </button>
      </div>
    </div>
  );
}