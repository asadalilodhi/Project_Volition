import React, { useState } from 'react';
import { Calendar, Clock, CheckCircle, FileText, X, Check, Edit3, List as ListIcon, ChevronDown } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { SecondaryTagsModule } from './SecondaryTagsModule';

function cn(...inputs: ClassValue[]) { return twMerge(clsx(inputs)); }

// ============================================================================
// SHARED REUSABLE BLOCKS
// ============================================================================

const CyberChecklist = ({ items }: { items: string[] }) => {
  const [checked, setChecked] = useState<Record<number, boolean>>({});
  const toggle = (i: number) => setChecked(prev => ({ ...prev, [i]: !prev[i] }));

  return (
    <div className="flex flex-col gap-3 mt-4 mb-2">
      {items.map((item, i) => (
        <div key={i} className="flex items-center gap-3 cursor-pointer group" onClick={() => toggle(i)}>
          <div className={cn(
            "w-3.5 h-3.5 border transition-colors flex items-center justify-center shrink-0",
            checked[i] ? "border-white bg-white" : "border-white/40 group-hover:border-white/80"
          )}>
            {checked[i] && <Check className="w-3 h-3 text-black" />}
          </div>
          <span className={cn(
            "text-xs tracking-widest uppercase transition-all",
            checked[i] ? "text-white/40 line-through" : "text-white/90 group-hover:text-white"
          )}>
            {item}
          </span>
        </div>
      ))}
    </div>
  );
};

const CategoryDropdown = ({ category, onChange, colorClass }: { category: string, onChange: (c: string) => void, colorClass: string }) => (
  <div className="relative flex items-center gap-1 cursor-pointer group">
    <span className="text-[10px] tracking-widest font-bold uppercase">[ </span>
    <select 
      value={category} 
      onChange={(e) => onChange(e.target.value)}
      className={cn("bg-transparent border-none outline-none appearance-none cursor-pointer font-bold uppercase tracking-widest z-10", colorClass)}
    >
      <option value="Thought" className="bg-black text-cyan-400">THOUGHT</option>
      <option value="Task" className="bg-black text-white">TASK</option>
      <option value="Event" className="bg-black text-orange-400">EVENT</option>
      <option value="List" className="bg-black text-blue-400">LIST</option>
      <option value="Document" className="bg-black text-purple-400">DOCUMENT</option>
    </select>
    <ChevronDown className={cn("w-3 h-3 absolute right-[-14px] top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity", colorClass)} />
    <span className="text-[10px] tracking-widest font-bold uppercase ml-3"> ]</span>
  </div>
);

const WarningFooter = ({ text, onConfirm, onReject, confirmColor = "green", disableConfirm = false }: any) => (
  <div className="flex flex-col gap-3 bg-yellow-500/5 border border-yellow-500/20 p-4 mt-4">
    <div className="text-[10px] text-white/70 italic leading-relaxed uppercase tracking-widest">{text}</div>
    <div className="flex items-center gap-3 w-full">
      <button 
        onClick={onConfirm} 
        disabled={disableConfirm}
        className={cn("flex-1 py-2 border transition-colors text-[10px] font-bold tracking-widest flex items-center justify-center gap-2", 
        disableConfirm ? "border-gray-600 text-gray-600 bg-transparent cursor-not-allowed" : 
        confirmColor === 'green' ? "border-green-500/60 bg-green-500/10 hover:bg-green-500 text-green-500 hover:text-black" : "border-white/40 text-white hover:bg-white hover:text-black"
      )}>
        <CheckCircle className="w-3 h-3" /> CONFIRM
      </button>
      <button onClick={onReject} className="flex-1 py-2 border border-red-500/60 bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-black transition-colors text-[10px] font-bold tracking-widest flex items-center justify-center gap-2">
        <X className="w-3 h-3" /> REJECT
      </button>
    </div>
  </div>
);

// ============================================================================
// THE MASTER INTERACTIVE CARD WRAPPER (Fully Restored)
// ============================================================================
export const SmartProposalCard = ({ proposal, status = 'pending', onFinalize }: { proposal: any, status?: 'pending' | 'confirmed' | 'rejected', onFinalize: (data: any, action: 'confirm'|'reject') => void }) => {
  
  // 1. Core State
  const [localCategory, setLocalCategory] = useState(proposal.category || 'Thought');
  const [localTags, setLocalTags] = useState<string[]>(proposal.tags || []);
  
  // 2. Event State (With defaults for current day)
  const today = new Date().toISOString().split('T')[0];
  const initialDate = proposal.event_data?.extracted_date;
  const initialTime = proposal.event_data?.extracted_time;
  const initialMissingTime = proposal.event_data?.missing_time_parameters;

  const initialMissingDate = localCategory === 'Event' && !initialDate && initialMissingTime; 

  const [selectedDate, setSelectedDate] = useState<string>(initialDate || today);
  const [selectedTime, setSelectedTime] = useState<string | null>(initialTime || null);
  
  // 3. List State
  const hasList = proposal.list_data?.has_list || false;
  const listItems = proposal.list_data?.list_items || [];

  const isMissingTimeView = localCategory === 'Event' && !selectedTime && !initialMissingDate;
  const isMissingDateView = localCategory === 'Event' && initialMissingDate && !selectedDate;

  const handleConfirm = () => {
    onFinalize({ ...proposal, category: localCategory, tags: localTags, time: selectedTime, date: selectedDate }, 'confirm');
  };

  const handleReject = () => onFinalize(proposal, 'reject');


  // --- RENDER LOGIC BASED ON CATEGORY ---

  // 1. EVENT - DATE MISSING (The Calendar Grid)
  if (isMissingDateView) {
    const days = Array.from({ length: 30 }, (_, i) => i + 1);
    const startOffset = Array(3).fill(null); // Pushing start to Wednesday
    return (
      <div className={cn(
        "bg-black/80 p-5 font-['Share_Tech_Mono'] transition-all duration-300",
        status === 'pending' ? "border border-orange-500/50 shadow-[0_0_20px_rgba(255,150,0,0.05)]" : "",
        status === 'confirmed' ? "border border-green-500 shadow-[0_0_20px_rgba(0,255,100,0.15)]" : "",
        status === 'rejected' ? "border border-red-500 shadow-[0_0_20px_rgba(255,0,0,0.15)] opacity-50 grayscale" : ""
      )}>
        <div className="flex items-center justify-between mb-4 text-orange-400">
          <CategoryDropdown category={localCategory} onChange={setLocalCategory} colorClass="text-orange-400" />
          <Calendar className="w-4 h-4" />
        </div>
        <div className="text-sm text-white font-bold tracking-widest mb-1 uppercase">{proposal.title}</div>
        <div className="text-[10px] text-white/40 tracking-widest uppercase mb-4">
          DATE: <span className="text-orange-400">{selectedDate || 'PENDING'}</span> | TIME: {selectedTime || 'PENDING'}
        </div>
        <div className="bg-white/5 border border-white/10 p-4 mb-4">
          <div className="text-[9px] text-white/40 tracking-[0.2em] mb-3">APR 2026</div>
          <div className="grid grid-cols-7 gap-1 text-center text-[8px] text-white/30 tracking-widest mb-2">
            <span>SUN</span><span>MON</span><span>TUE</span><span>WED</span><span>THU</span><span>FRI</span><span>SAT</span>
          </div>
          <div className="grid grid-cols-7 gap-1">
            {startOffset.map((_, i) => <div key={`empty-${i}`} />)}
            {days.map(day => {
              const dateString = `2026-04-${day.toString().padStart(2, '0')}`;
              return (
                <button 
                  key={day} 
                  onClick={() => status === 'pending' && setSelectedDate(dateString)} 
                  className={cn(
                    "h-8 text-xs font-mono flex items-center justify-center border transition-colors hover:bg-white/10", 
                    day === 19 ? "border-orange-500/50 text-orange-400" : "border-white/5 text-white/60", 
                    selectedDate === dateString ? "border-white bg-white/20 text-white" : "",
                    status !== 'pending' && "cursor-not-allowed"
                  )}
                >
                  {day}
                </button>
              );
            })}
          </div>
        </div>
        {status === 'pending' && (
          <WarningFooter text="EVENT DETECTED. DATE MISSING." onConfirm={handleConfirm} onReject={handleReject} disableConfirm={!selectedDate} />
        )}
      </div>
    );
  }

  // 2. EVENT - TIME MISSING (The 6-Button Grid)
  if (isMissingTimeView) {
    const times = ['10:00', '12:00', '14:00', '15:00', '16:00', '18:00'];
    return (
      <div className={cn(
        "bg-black/80 p-5 font-['Share_Tech_Mono'] transition-all duration-300",
        status === 'pending' ? "border border-orange-500/50 shadow-[0_0_20px_rgba(255,150,0,0.05)]" : "",
        status === 'confirmed' ? "border border-green-500 shadow-[0_0_20px_rgba(0,255,100,0.15)]" : "",
        status === 'rejected' ? "border border-red-500 shadow-[0_0_20px_rgba(255,0,0,0.15)] opacity-50 grayscale" : ""
      )}>
        <div className="flex items-center justify-between mb-4 text-orange-400">
          <CategoryDropdown category={localCategory} onChange={setLocalCategory} colorClass="text-orange-400" />
          <Calendar className="w-4 h-4" />
        </div>
        <div className="text-sm text-white font-bold tracking-widest mb-1 uppercase">{proposal.title}</div>
        <div className="text-[10px] text-white/40 tracking-widest uppercase mb-4">
          DATE: 2026-04-02 | HOUR: <span className="text-orange-400">{selectedTime || 'PENDING'}</span>
        </div>
        <div className="bg-white/5 border border-white/10 p-4 mb-4">
          <div className="text-[9px] text-white/40 tracking-[0.2em] mb-3">SELECT EXACT TIME</div>
          <div className="grid grid-cols-3 gap-2">
            {times.map(t => (
              <button 
                key={t} 
                onClick={() => status === 'pending' && setSelectedTime(t)} 
                className={cn("py-2 text-xs font-mono tracking-widest border transition-all hover:bg-white/10", 
                  selectedTime === t ? "border-white bg-white/20 text-white shadow-[0_0_10px_rgba(255,255,255,0.2)]" : "border-white/20 text-white/60",
                  status !== 'pending' && "cursor-not-allowed"
                )}
              >
                {t}
              </button>
            ))}
          </div>
        </div>
        {status === 'pending' && (
          <WarningFooter text="EVENT DETECTED. TIME MISSING." onConfirm={handleConfirm} onReject={handleReject} disableConfirm={!selectedTime} />
        )}
      </div>
    );
  }

  // 3. EVENT - TIMED (All data present, fully editable!)
  if (localCategory === 'Event' && !isMissingTimeView && !isMissingDateView) {
    return (
      <div className={cn(
        "bg-black/80 p-5 font-['Share_Tech_Mono'] transition-all duration-300",
        status === 'pending' ? "border border-blue-500/60 shadow-[0_0_20px_rgba(0,150,255,0.05)]" : "",
        status === 'confirmed' ? "border border-green-500 shadow-[0_0_20px_rgba(0,255,100,0.15)]" : "",
        status === 'rejected' ? "border border-red-500 shadow-[0_0_20px_rgba(255,0,0,0.15)] opacity-50 grayscale" : ""
      )}>
        <div className="flex items-center justify-between mb-4 text-blue-400">
          <CategoryDropdown category={localCategory} onChange={setLocalCategory} colorClass="text-blue-400" />
          <Clock className="w-4 h-4" />
        </div>
        
        <input 
          value={proposal.title} 
          readOnly={status !== 'pending'}
          className="w-full bg-transparent text-sm text-white font-bold tracking-widest mb-3 uppercase outline-none" 
        />
        
        <div className="flex items-center gap-3 bg-white/5 border border-white/10 p-3 mb-4 focus-within:border-white/40 transition-colors">
          <Clock className="w-3.5 h-3.5 text-white/50" />
          <input 
            type="date" 
            value={selectedDate} 
            onChange={(e) => status === 'pending' && setSelectedDate(e.target.value)}
            readOnly={status !== 'pending'}
            className={cn("bg-transparent border-none outline-none text-xs font-mono text-white/80 uppercase tracking-widest [color-scheme:dark]", status === 'pending' ? "cursor-pointer" : "cursor-default")}
          />
          <span className="text-white/50">@</span>
          <input 
            type="time" 
            value={selectedTime || ''} 
            onChange={(e) => status === 'pending' && setSelectedTime(e.target.value)}
            readOnly={status !== 'pending'}
            className={cn("bg-transparent border-none outline-none text-xs font-mono text-white/80 uppercase tracking-widest [color-scheme:dark]", status === 'pending' ? "cursor-pointer" : "cursor-default")}
          />
        </div>
        
        {hasList && (
           <>
             <div className="text-[10px] text-white/40 tracking-[0.2em] mb-2 border-t border-white/10 pt-4">CHECKLIST</div>
             <CyberChecklist items={listItems.length > 0 ? listItems : ['REVIEW AGENDA', 'PREPARE SLIDES']} />
           </>
        )}
        <SecondaryTagsModule initialTags={localTags} onTagsChange={setLocalTags} />
        {status === 'pending' && (
          <WarningFooter text="SCHEDULED EVENT DETECTED // PARAMETERS EDITABLE" onConfirm={handleConfirm} onReject={handleReject} />
        )}
      </div>
    );
  }

  // 4. LIST CARD
  if (localCategory === 'List') {
    return (
      <div className={cn(
        "bg-black/80 p-5 font-['Share_Tech_Mono'] transition-all duration-300",
        status === 'pending' ? "border border-white/20 shadow-[inset_0_1px_0_rgba(255,255,255,0.1)]" : "",
        status === 'confirmed' ? "border border-green-500 shadow-[0_0_20px_rgba(0,255,100,0.15)]" : "",
        status === 'rejected' ? "border border-red-500 shadow-[0_0_20px_rgba(255,0,0,0.15)] opacity-50 grayscale" : ""
      )}>
        <div className="flex items-center justify-between mb-4 text-white/60 border-b border-white/10 pb-3">
          <CategoryDropdown category={localCategory} onChange={setLocalCategory} colorClass="text-white/60" />
          <span className="text-[10px] tracking-widest uppercase">{listItems.length || 3} ITEMS</span>
        </div>
        <div className="text-sm text-white font-bold tracking-widest mb-2 uppercase font-['Syncopate']">{proposal.title}</div>
        <CyberChecklist items={listItems.length > 0 ? listItems : ['SYSTEM BACKUP', 'CLEAR CACHE', 'SYNC NODE']} />
        <SecondaryTagsModule initialTags={localTags} onTagsChange={setLocalTags} />
        {status === 'pending' && (
          <WarningFooter text="COLLECTION OF ITEMS DETECTED" onConfirm={handleConfirm} onReject={handleReject} />
        )}
      </div>
    );
  }

  // 5. DOCUMENT CARD
  if (localCategory === 'Document') {
    return (
      <div className={cn(
        "bg-black/80 p-5 font-['Share_Tech_Mono'] transition-all duration-300",
        status === 'pending' ? "border border-purple-500/50 shadow-[0_0_20px_rgba(150,0,255,0.05)]" : "",
        status === 'confirmed' ? "border border-green-500 shadow-[0_0_20px_rgba(0,255,100,0.15)]" : "",
        status === 'rejected' ? "border border-red-500 shadow-[0_0_20px_rgba(255,0,0,0.15)] opacity-50 grayscale" : ""
      )}>
        <div className="flex items-center justify-between mb-4 text-purple-400">
          <CategoryDropdown category={localCategory} onChange={setLocalCategory} colorClass="text-purple-400" />
          <FileText className="w-4 h-4" />
        </div>
        <div className="text-sm text-white font-bold tracking-widest mb-1 uppercase">{proposal.title}</div>
        <div className="text-[9px] text-white/50 tracking-widest uppercase mb-4 border-b border-white/10 pb-3">LONG-FORM TEXT CONTENT DETECTED</div>
        <div className="flex justify-between items-center text-[9px] text-white/40 tracking-widest mb-4">
          <span>SIZE: TBD</span>
          <span>LIMIT: 100KB</span>
        </div>
        <SecondaryTagsModule initialTags={localTags} onTagsChange={setLocalTags} />
        {status === 'pending' && (
          <WarningFooter text="DOCUMENT DETECTED" onConfirm={handleConfirm} onReject={handleReject} />
        )}
      </div>
    );
  }

  // 6. TASK CARD
  if (localCategory === 'Task') {
    return (
      <div className={cn(
        "bg-black/80 p-5 font-['Share_Tech_Mono'] transition-all duration-300",
        status === 'pending' ? "border border-white/30 shadow-[inset_0_1px_0_rgba(255,255,255,0.1)]" : "",
        status === 'confirmed' ? "border border-green-500 shadow-[0_0_20px_rgba(0,255,100,0.15)]" : "",
        status === 'rejected' ? "border border-red-500 shadow-[0_0_20px_rgba(255,0,0,0.15)] opacity-50 grayscale" : ""
      )}>
        <div className="flex items-center justify-between mb-4 text-white/40">
          <CategoryDropdown category={localCategory} onChange={setLocalCategory} colorClass="text-white/60" />
          <CheckCircle className="w-4 h-4" />
        </div>
        <div className="flex items-start gap-3 mb-4">
          <div className="w-5 h-5 border border-white/40 mt-0.5 shrink-0" />
          <span className="text-sm text-white/90 font-bold uppercase">{proposal.title}</span>
        </div>
        <SecondaryTagsModule initialTags={localTags} onTagsChange={setLocalTags} />
        {status === 'pending' && (
          <WarningFooter text="ACTIONABLE TASK DETECTED" onConfirm={handleConfirm} onReject={handleReject} />
        )}
      </div>
    );
  }

  // 7. THOUGHT CARD
  if (localCategory === 'Thought') {
    return (
      <div className={cn(
        "bg-black/80 p-5 font-['Share_Tech_Mono'] transition-all duration-300",
        status === 'pending' ? "border-l-4 border-cyan-400 shadow-[inset_0_1px_0_rgba(255,255,255,0.1),0_0_20px_rgba(0,200,255,0.15)]" : "",
        status === 'confirmed' ? "border border-green-500 shadow-[0_0_20px_rgba(0,255,100,0.15)]" : "",
        status === 'rejected' ? "border border-red-500 shadow-[0_0_20px_rgba(255,0,0,0.15)] opacity-50 grayscale" : ""
      )}>
        <div className="flex items-center justify-between mb-4 text-cyan-400">
          <CategoryDropdown category={localCategory} onChange={setLocalCategory} colorClass="text-cyan-400" />
        </div>
        <p className="text-white/70 text-sm leading-relaxed italic mb-4 uppercase">{proposal.title}</p>
        <SecondaryTagsModule initialTags={localTags} onTagsChange={setLocalTags} />
        {status === 'pending' && (
          <WarningFooter text="ABSTRACT CONCEPT DETECTED" onConfirm={handleConfirm} onReject={handleReject} />
        )}
      </div>
    );
  }

  return null;
};