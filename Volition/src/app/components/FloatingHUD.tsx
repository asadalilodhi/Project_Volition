import { motion, AnimatePresence } from 'motion/react';
import { useState, useEffect } from 'react';

interface FloatingHUDProps {
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  showOfflineIndicator?: boolean;
}

export function FloatingHUD({
  value = '',
  onChange,
  placeholder = 'QUERY_THE_VOID...',
  showOfflineIndicator = true,
}: FloatingHUDProps) {
  const [showCalendarConfirm, setShowCalendarConfirm] = useState(false);

  // Auto-detect time/date patterns in the input
  useEffect(() => {
    const timeRegex = /(sunday|monday|tuesday|wednesday|thursday|friday|saturday|\d{1,2}\s?(am|pm|:\d{2}))/i;
    if (value.length > 3 && timeRegex.test(value)) {
      setShowCalendarConfirm(true);
    } else {
      setShowCalendarConfirm(false);
    }
  }, [value]);

  const handleConfirm = () => {
    setShowCalendarConfirm(false);
    onChange?.('');
  };

  const handleCancel = () => {
    setShowCalendarConfirm(false);
    onChange?.('');
  };

  return (
    <div className="fixed bottom-12 left-1/2 -translate-x-1/2 z-30 flex flex-col items-center w-[600px]">
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
                  CONFIRM EVENT SCHEDULING: <br/>
                  <span className="text-[#aaa]">{value}</span>
                </p>
                <div className="flex gap-4">
                  <button
                    onClick={handleConfirm}
                    className="flex-1 px-6 py-3 border border-[#444] bg-white text-black font-['Syncopate'] text-xs font-bold tracking-widest hover:bg-[#ccc] transition-colors"
                  >
                    YES // CONFIRM
                  </button>
                  <button
                    onClick={handleCancel}
                    className="flex-1 px-6 py-3 border border-[#444] text-white font-['Syncopate'] text-xs font-bold tracking-widest hover:bg-[#222] transition-colors"
                  >
                    NO // ABORT
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
            placeholder={placeholder}
            className="flex-1 bg-transparent px-4 text-sm text-white placeholder:text-[#555] outline-none font-['Share_Tech_Mono'] tracking-widest uppercase"
          />
          
          <button className="h-full px-6 bg-white text-black font-['Syncopate'] text-xs font-bold tracking-widest hover:bg-[#ccc] transition-colors border-l border-[#333]">
            EXECUTE
          </button>
        </div>
      </div>

      {/* Decorative dashed line below */}
      <div className="mt-4 flex items-center gap-4 text-[#444] text-[10px] tracking-widest font-['Share_Tech_Mono']">
        <div className="border border-dashed border-[#0066ff] px-2 py-0.5 text-[#0066ff]">
          COMMAND_HUD
        </div>
        <span>||</span>
        <span>NEURAL_MAP</span>
      </div>
    </div>
  );
}