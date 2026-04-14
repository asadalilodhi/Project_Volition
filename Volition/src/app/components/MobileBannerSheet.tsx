import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Activity } from 'lucide-react';
import { cn } from '../../lib/utils';

interface MobileBannerSheetProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

export const MobileBannerSheet: React.FC<MobileBannerSheetProps> = ({ isOpen, onClose, children }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden"
          />
          
          {/* Bottom Sheet */}
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed bottom-0 left-0 right-0 h-[85vh] bg-black/95 backdrop-blur-3xl border-t border-white/20 shadow-[0_-10px_40px_rgba(0,0,0,0.9)] flex flex-col font-['Share_Tech_Mono'] text-white z-50 md:hidden"
          >
            {/* Mobile Header with Close Button & Context Box */}
            <div className="flex items-center justify-between p-4 border-b border-white/20 bg-black/80 shrink-0">
              {/* Context Speaker Box - Inline on Mobile */}
              <div className="w-16 h-16 bg-black/90 backdrop-blur-xl border border-white/20 shadow-[inset_1px_1px_0_rgba(255,255,255,0.15)] flex flex-col items-center justify-center p-1 shrink-0">
                <div 
                  className="absolute inset-1 bg-cover bg-center mix-blend-luminosity opacity-60 grayscale" 
                  style={{ backgroundImage: `url('https://images.unsplash.com/photo-1729554608003-5ec8be42da1d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjeWJlcnB1bmslMjBhaSUyMGZhY2UlMjBhYnN0cmFjdCUyMGRhcmt8ZW58MXx8fHwxNzc1MDMwMjk4fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral')` }}
                />
                <div className="absolute inset-0 bg-[linear-gradient(transparent_50%,rgba(0,0,0,0.5)_50%)] bg-[length:100%_4px] pointer-events-none" />
                <div className="mt-auto relative z-20 w-full bg-black/90 backdrop-blur-sm border-t border-white/20 text-[8px] px-1 py-0.5 font-bold text-white tracking-wider flex items-center justify-between">
                  <span className="truncate pr-0.5">VOL</span>
                  <Activity className="w-2 h-2 text-white animate-pulse shrink-0" />
                </div>
              </div>
              
              <div className="flex-1 px-3">
                <div className="font-['Syncopate'] text-xs tracking-[0.2em] text-white/70 font-bold">
                  INTERNAL MONOLOGUE
                </div>
              </div>
              
              {/* Large Touch-Friendly Close Button */}
              <button
                onClick={onClose}
                className="min-w-[44px] min-h-[44px] flex items-center justify-center border border-white/30 bg-white/5 hover:bg-white/10 active:bg-white/20 transition-colors shrink-0"
              >
                <X className="w-6 h-6 text-white" />
              </button>
            </div>
            
            {/* Content Area - Scrollable */}
            <div className="flex-1 overflow-y-auto">
              {children}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
