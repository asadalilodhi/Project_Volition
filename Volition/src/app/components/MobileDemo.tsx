import React, { useState } from 'react';
import { SecondaryTagsModule } from './SecondaryTagsModule';
import { ConfirmationActionBar } from './ConfirmationActionBar';
import { MobileBannerSheet } from './MobileBannerSheet';
import { Terminal, Hexagon, Clock, FileText } from 'lucide-react';

export const MobileDemo: React.FC = () => {
  const [isOpen, setIsOpen] = useState(true);
  const [thoughtConfirmed, setThoughtConfirmed] = useState<'pending' | 'confirmed' | 'rejected'>('pending');
  const [taskConfirmed, setTaskConfirmed] = useState<'pending' | 'confirmed' | 'rejected'>('pending');
  const [documentConfirmed, setDocumentConfirmed] = useState<'pending' | 'confirmed' | 'rejected'>('pending');

  const cn = (...classes: string[]) => classes.filter(Boolean).join(' ');

  return (
    <MobileBannerSheet isOpen={isOpen} onClose={() => setIsOpen(false)}>
      {/* Tab Headers - Mobile Optimized */}
      <div className="flex border-b border-white/20 bg-black/60 sticky top-0 z-10">
        <button className="flex-1 flex items-center justify-center gap-2 text-xs tracking-widest transition-colors font-bold bg-white/10 text-white shadow-[inset_0_-2px_0_#fff] min-h-[48px]">
          <Terminal className="w-4 h-4" /> DIALOGUE
        </button>
      </div>

      {/* Scrollable Content */}
      <div className="p-4 flex flex-col gap-6">
        {/* AI Message */}
        <div className="flex flex-col gap-2">
          <span className="text-white font-bold text-xs tracking-widest mb-1 flex items-center gap-2">
            <Hexagon className="w-3 h-3 text-white/50" /> VOLITION
          </span>
          <p className="text-white/70 leading-relaxed pl-5 border-l border-white/20 text-sm">
            System initialization complete. Detecting intent patterns from user input stream...
          </p>
        </div>

        {/* [THOUGHT] Card - Mobile */}
        <div 
          className={cn(
            "border-l-4 bg-black/80 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.1),0_0_20px_rgba(0,200,255,0.15)] transition-all duration-300",
            thoughtConfirmed === 'confirmed' ? "border-green-500 shadow-[0_0_20px_rgba(0,255,100,0.4)]" : 
            thoughtConfirmed === 'rejected' ? "border-red-500 shadow-[0_0_20px_rgba(255,0,0,0.4)]" :
            "border-cyan-400"
          )}
        >
          <div className="text-[10px] text-white/40 tracking-widest mb-2 font-bold">[ THOUGHT ]</div>
          <p className="text-white/70 text-sm leading-relaxed italic mb-3">
            The neural pattern suggests a hierarchical task structure. User may benefit from nested checklist architecture.
          </p>
          
          {thoughtConfirmed === 'pending' && (
            <>
              <SecondaryTagsModule 
                initialTags={['ARCHITECTURE', 'NEURAL_PATTERN', 'HIERARCHY']}
              />
              <ConfirmationActionBar 
                aiReasoning="Intent detected: User prefers structured task organization"
                onConfirm={() => setThoughtConfirmed('confirmed')}
                onReject={() => setThoughtConfirmed('rejected')}
              />
            </>
          )}
        </div>

        {/* User Message */}
        <div className="flex flex-col gap-2 items-end">
          <span className="text-white/60 font-bold text-xs tracking-widest mb-1 flex items-center gap-2">
            USER_01 <Terminal className="w-3 h-3 text-white/50" />
          </span>
          <p className="text-white/90 leading-relaxed pr-5 border-r border-white/20 text-right bg-white/5 p-3 text-sm">
            Create a task for deployment and document the architecture.
          </p>
        </div>

        {/* [TASK] Card - Mobile */}
        <div 
          className={cn(
            "border bg-black/80 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.1)] transition-all duration-300",
            taskConfirmed === 'confirmed' ? "border-green-500 shadow-[0_0_20px_rgba(0,255,100,0.4)]" : 
            taskConfirmed === 'rejected' ? "border-red-500 shadow-[0_0_20px_rgba(255,0,0,0.4)]" :
            "border-white/30"
          )}
        >
          <div className="text-[10px] text-white/40 tracking-widest mb-3 font-bold">[ TASK ]</div>
          <div className="flex items-start gap-3 mb-2">
            <div className="w-5 h-5 border border-white/40 mt-0.5 shrink-0" />
            <span className="text-sm text-white/90 font-bold">Deploy system updates to production environment</span>
          </div>
          
          {taskConfirmed === 'pending' && (
            <>
              <SecondaryTagsModule 
                initialTags={['DEPLOYMENT', 'PRODUCTION', 'SYSTEM_UPDATE']}
              />
              <ConfirmationActionBar 
                aiReasoning="Task detected: Deployment workflow identified"
                onConfirm={() => setTaskConfirmed('confirmed')}
                onReject={() => setTaskConfirmed('rejected')}
              />
            </>
          )}
        </div>

        {/* [DOCUMENT] Card - Mobile */}
        <div 
          className={cn(
            "border bg-black/80 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.1),0_0_20px_rgba(200,0,255,0.1)] transition-all duration-300",
            documentConfirmed === 'confirmed' ? "border-green-500 shadow-[0_0_20px_rgba(0,255,100,0.4)]" : 
            documentConfirmed === 'rejected' ? "border-red-500 shadow-[0_0_20px_rgba(255,0,0,0.4)]" :
            "border-purple-500/50"
          )}
        >
          <div className="flex items-center justify-between mb-3">
            <div className="text-[10px] text-purple-400 tracking-widest font-bold">[ DOCUMENT ]</div>
            <FileText className="w-4 h-4 text-purple-400" />
          </div>
          <div className="mb-3">
            <div className="text-sm text-white/90 font-bold mb-1">System Architecture Overview</div>
            <div className="text-[10px] text-white/50">Long-form text content detected</div>
          </div>
          <div className="flex items-center justify-between text-[10px] text-white/40 border-t border-white/10 pt-2 mb-2">
            <span>SIZE: 4.2KB</span>
            <span>LIMIT: 100KB</span>
          </div>

          {documentConfirmed === 'pending' && (
            <>
              <SecondaryTagsModule 
                initialTags={['ARCHITECTURE', 'DOCUMENTATION', 'TECHNICAL']}
              />
              <ConfirmationActionBar 
                aiReasoning="Document detected: System architecture overview"
                onConfirm={() => setDocumentConfirmed('confirmed')}
                onReject={() => setDocumentConfirmed('rejected')}
              />
            </>
          )}
        </div>

        {/* Bottom padding for scroll */}
        <div className="h-20" />
      </div>
    </MobileBannerSheet>
  );
};
