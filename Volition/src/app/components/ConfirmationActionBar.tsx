import React from 'react';
import { CheckCircle, X } from 'lucide-react';

interface ConfirmationActionBarProps {
  aiReasoning: string;
  onConfirm: () => void;
  onReject: () => void;
}

export const ConfirmationActionBar: React.FC<ConfirmationActionBarProps> = ({ 
  aiReasoning, 
  onConfirm, 
  onReject 
}) => {
  return (
    <div className="flex flex-col gap-3 bg-yellow-500/10 border border-yellow-500/40 p-3 mt-3 max-md:p-4">
      <div className="flex-1 text-[10px] text-white/70 italic leading-relaxed max-md:text-xs max-md:mb-2">
        {aiReasoning}
      </div>
      <div className="flex items-center gap-2 shrink-0 max-md:gap-3 max-md:flex-col md:flex-row w-full">
        <button
          onClick={onConfirm}
          className="px-3 py-1.5 border border-green-500/60 bg-green-500/10 hover:bg-green-500 active:bg-green-500 text-green-500 hover:text-black transition-colors text-[10px] font-bold tracking-widest flex items-center gap-1.5 cursor-pointer max-md:w-full max-md:justify-center max-md:min-h-[44px] max-md:text-xs max-md:gap-2"
        >
          <CheckCircle className="w-3 h-3 max-md:w-4 max-md:h-4" /> CONFIRM
        </button>
        <button
          onClick={onReject}
          className="px-3 py-1.5 border border-red-500/60 bg-red-500/10 hover:bg-red-500 active:bg-red-500 text-red-500 hover:text-black transition-colors text-[10px] font-bold tracking-widest flex items-center gap-1.5 cursor-pointer max-md:w-full max-md:justify-center max-md:min-h-[44px] max-md:text-xs max-md:gap-2"
        >
          <X className="w-3 h-3 max-md:w-4 max-md:h-4" /> REJECT
        </button>
      </div>
    </div>
  );
};