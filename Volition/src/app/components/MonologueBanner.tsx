import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Terminal, Database, Check, ChevronRight, ChevronLeft, Hexagon, Activity, Clock, Zap, Target, CheckCircle, FileText, Calendar, Search, List } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { TasksWorkspace } from './TasksWorkspace';
import { ListsWorkspace } from './ListsWorkspace';
import { ConfirmationActionBar } from './ConfirmationActionBar';
import { SecondaryTagsModule } from './SecondaryTagsModule';
import { MobileBannerSheet } from './MobileBannerSheet';
import { Link } from 'react-router';
import { SmartProposalCard } from './AIProposalCards';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

type PanelState = 'A' | 'B' | 'C' | 'TASKS' | 'NODE_INSPECTOR';

interface MonologueBannerProps {
  isZenMode: boolean;
  inspectedNode?: any;
  onCloseInspector?: () => void;
  isMobileBannerOpen?: boolean;
  onMobileClose?: () => void;
  searchResults?: any[]; // <-- ADDED THIS to fix your error
  proposals?: any[];     // <-- ADDED THIS for our new AI workflow
  volitionMessage?: string;
  onFinalizeProposal?: (id: string, action: 'confirm' | 'reject') => void;
}

export const MonologueBanner: React.FC<MonologueBannerProps> = ({ isZenMode, inspectedNode, onCloseInspector, isMobileBannerOpen, onMobileClose, proposals = [], volitionMessage, onFinalizeProposal}) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [activeState, setActiveState] = useState<PanelState>('A');
  const [hoveredNode, setHoveredNode] = useState<number | null>(null);
  
  // Confirmation states for each card
  const [thoughtConfirmed, setThoughtConfirmed] = useState<'pending' | 'confirmed' | 'rejected'>('pending');
  const [taskConfirmed, setTaskConfirmed] = useState<'pending' | 'confirmed' | 'rejected'>('pending');
  const [eventTimeConfirmed, setEventTimeConfirmed] = useState<'pending' | 'confirmed' | 'rejected'>('pending');
  const [eventDateConfirmed, setEventDateConfirmed] = useState<'pending' | 'confirmed' | 'rejected'>('pending');
  const [simpleEventConfirmed, setSimpleEventConfirmed] = useState<'pending' | 'confirmed' | 'rejected'>('pending');
  const [documentConfirmed, setDocumentConfirmed] = useState<'pending' | 'confirmed' | 'rejected'>('pending');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Auto-switch to NODE_INSPECTOR when a node is inspected
  React.useEffect(() => {
    if (inspectedNode) {
      setActiveState('NODE_INSPECTOR');
    }
  }, [inspectedNode]);

  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (year: number, month: number) => {
    return new Date(year, month, 1).getDay();
  };

  const currentDate = new Date();
  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();
  const daysInMonth = getDaysInMonth(currentYear, currentMonth);
  const firstDay = getFirstDayOfMonth(currentYear, currentMonth);
  
  const monthNames = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
  const dayNames = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];

  // Helper to render the actual conversation and dynamic AI cards
  const renderDialogueLayer = () => (
    <div className="flex flex-col gap-6 text-sm flex-1 relative">
      
      {/* THE 2-SECOND TOAST WARNING */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute top-0 left-5 right-5 z-50 bg-red-500/90 text-white text-[10px] tracking-widest font-bold py-3 px-4 border border-red-400 shadow-[0_5px_20px_rgba(255,0,0,0.4)] text-center uppercase backdrop-blur-md"
          >
            {toastMessage}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex flex-col gap-2 shrink-0 pt-2">
        <span className="text-white font-bold text-xs tracking-widest mb-1 flex items-center gap-2">
          <Hexagon className="w-3 h-3 text-white/50 shrink-0" /> <span className="truncate">VOLITION</span>
        </span>
        <p className="text-white/70 leading-relaxed pl-5 border-l border-white/20 break-words">
          {volitionMessage || "System initialization complete. Awaiting user input stream to generate neural blueprints..."}
        </p>
      </div>

      {/* THE DYNAMIC LOOP */}
      {proposals && proposals.length > 0 ? (
        proposals.map((proposal: any, index: number) => (
          <SmartProposalCard 
            key={proposal._id} 
            proposal={proposal} 
            status={proposal._status} // Pass the status down!
            onFinalize={(finalData, action) => {
              
              // SEQUENTIAL VALIDATION LOGIC
              const hasPendingBefore = proposals.some((p: any, i: number) => i < index && p._status === 'pending');
              
              if (hasPendingBefore) {
                 setToastMessage("SYS_ERR: RESOLVE PREVIOUS PROMPTS BEFORE PROCEEDING.");
                 setTimeout(() => setToastMessage(null), 2500); // Hide after 2.5s
                 return;
              }

              // If safe, execute!
              if (onFinalizeProposal) onFinalizeProposal(proposal._id, action);
              if (action === 'confirm') console.log("SENDING TO VOID DATABASE:", finalData);
            }}
          />
        ))
      ) : (
        <div className="my-4 mx-5 border border-dashed border-white/20 bg-white/5 p-6 text-center shrink-0">
          <span className="text-[10px] text-white/40 tracking-widest uppercase font-bold animate-pulse">
            NO ACTIVE PROPOSALS IN BUFFER
          </span>
        </div>
      )}

      <div className="flex flex-col gap-2 items-end mt-4 opacity-50 shrink-0 pb-12">
        <span className="text-white/60 font-bold text-xs tracking-widest mb-1 flex items-center gap-2">
          <span className="truncate">SYSTEM</span> <Terminal className="w-3 h-3 text-white/50 shrink-0" />
        </span>
        <p className="text-white/90 leading-relaxed pr-5 border-r border-white/20 text-right bg-white/5 p-3 break-words max-w-full">
          Awaiting confirmation...
        </p>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Version */}
      <motion.div 
        className={cn(
          "fixed right-0 top-0 h-screen bg-[#0a0a0a] border-l border-white/20 shadow-[inset_1px_0_0_rgba(255,255,255,0.1),-10px_0_30px_rgba(0,0,0,0.8)] flex flex-col font-['Share_Tech_Mono'] text-white z-30 transition-opacity duration-700 max-md:hidden",
          isZenMode ? "opacity-0 pointer-events-none" : "opacity-100 pointer-events-auto"
        )}
        initial={{ width: '30vw', x: 0 }}
        animate={{ 
          width: '30vw',
          x: isCollapsed ? '100%' : '0%' 
        }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
      >
        {/* Context Speaker Box */}
        <motion.div 
          className={cn(
            "absolute -left-32 top-16 w-32 h-32 bg-[#0a0a0a] border-y border-l border-white/20 shadow-[inset_1px_1px_0_rgba(255,255,255,0.15)] flex flex-col items-center justify-center p-2 z-40 transition-all duration-700",
            isZenMode ? "opacity-0 scale-95" : "opacity-100 scale-100"
          )}
          animate={{ x: isCollapsed ? 128 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <AnimatePresence mode="wait">
            {activeState === 'C' || activeState === 'NODE_INSPECTOR' ? (
               <motion.div 
                 key="title"
                 initial={{ opacity: 0, scale: 0.9 }}
                 animate={{ opacity: 1, scale: 1 }}
                 exit={{ opacity: 0, scale: 0.9 }}
                 className="w-full h-full flex flex-col items-center justify-center bg-white/5 border border-white/10 group overflow-hidden"
               >
                  {activeState === 'NODE_INSPECTOR' ? (
                    <Search className="w-8 h-8 text-white/40 mb-2 group-hover:text-white/80 transition-colors shrink-0" />
                  ) : (
                    <Target className="w-8 h-8 text-white/40 mb-2 group-hover:text-white/80 transition-colors shrink-0" />
                  )}
                  <span className="font-['Syncopate'] text-[10px] text-center tracking-[0.3em] text-white/80 font-bold w-full truncate px-1">
                    {activeState === 'NODE_INSPECTOR' ? 'NODE\nINSPECT' : 'OVERSEER\nDIRECTIVE'}
                  </span>
               </motion.div>
            ) : (
               <Link to="/volition" className="block">
                 <motion.div 
                   key="portrait"
                   initial={{ opacity: 0, scale: 0.9 }}
                   animate={{ opacity: 1, scale: 1 }}
                   exit={{ opacity: 0, scale: 0.9 }}
                   className="relative w-full h-full border border-white/10 overflow-hidden bg-zinc-900 group flex flex-col grayscale cursor-pointer"
                 >
                    <div 
                      className="absolute inset-0 bg-cover bg-center mix-blend-luminosity opacity-60 group-hover:opacity-100 transition-opacity duration-500 grayscale" 
                      style={{ backgroundImage: `url('https://images.unsplash.com/photo-1729554608003-5ec8be42da1d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjeWJlcnB1bmslMjBhaSUyMGZhY2UlMjBhYnN0cmFjdCUyMGRhcmt8ZW58MXx8fHwxNzc1MDMwMjk4fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral')` }}
                    />
                    {/* Scanline effect overlay */}
                    <div className="absolute inset-0 bg-[linear-gradient(transparent_50%,rgba(0,0,0,0.5)_50%)] bg-[length:100%_4px] pointer-events-none z-10" />
                    
                    <div className="mt-auto relative z-20 w-full bg-black/90 backdrop-blur-sm border-t border-white/20 text-[10px] px-2 py-1 font-bold text-white tracking-wider flex items-center justify-between">
                      <span className="truncate pr-1">VOLITION</span>
                      <Activity className="w-3 h-3 text-white animate-pulse shrink-0" />
                    </div>
                 </motion.div>
               </Link>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Toggle Button */}
        <button 
          className="absolute -left-6 top-1/2 -translate-y-1/2 w-6 h-24 bg-black/80 border-y border-l border-white/30 backdrop-blur-md hover:bg-white/10 flex items-center justify-center z-50 transition-colors group cursor-pointer"
          onClick={() => setIsCollapsed(!isCollapsed)}
        >
          <div className="absolute right-0 top-0 w-[1px] h-full bg-black" /> {/* Hide parent border */}
          {isCollapsed ? (
            <ChevronLeft className="w-4 h-4 text-white/40 group-hover:text-white/90 shrink-0" />
          ) : (
            <ChevronRight className="w-4 h-4 text-white/40 group-hover:text-white/90 shrink-0" />
          )}
        </button>

        {/* Header Tabs */}
        <div className="flex border-b border-white/20 h-14 bg-black/60 shrink-0">
          <button 
            onClick={() => setActiveState('A')}
            className={cn(
              "flex-1 flex items-center justify-center gap-2 border-r border-white/20 text-xs tracking-widest transition-colors font-bold cursor-pointer",
              activeState === 'A' ? "bg-white/10 text-white shadow-[inset_0_-2px_0_#fff]" : "text-white/40 hover:bg-white/5 hover:text-white/80"
            )}
          >
            <Terminal className="w-4 h-4 shrink-0" /> <span className="truncate">DIALOGUE</span>
          </button>
          <button 
            onClick={() => setActiveState('B')}
            className={cn(
              "flex-1 flex items-center justify-center gap-2 border-r border-white/20 text-xs tracking-widest transition-colors font-bold cursor-pointer",
              activeState === 'B' ? "bg-white/10 text-white shadow-[inset_0_-2px_0_#fff]" : "text-white/40 hover:bg-white/5 hover:text-white/80"
            )}
          >
            <Database className="w-4 h-4 shrink-0" /> <span className="truncate">QUERY</span>
          </button>
          <button 
            onClick={() => setActiveState('C')}
            className={cn(
              "flex-1 flex items-center justify-center gap-2 border-r border-white/20 text-xs tracking-widest transition-colors font-bold cursor-pointer",
              activeState === 'C' ? "bg-white/10 text-white shadow-[inset_0_-2px_0_#fff]" : "text-white/40 hover:bg-white/5 hover:text-white/80"
            )}
          >
            <List className="w-4 h-4 shrink-0" /> <span className="truncate">LIST</span>
          </button>
          <button 
            onClick={() => setActiveState('TASKS')}
            className={cn(
              "flex-1 flex items-center justify-center gap-2 text-xs tracking-widest transition-colors font-bold cursor-pointer",
              activeState === 'TASKS' ? "bg-white/10 text-white shadow-[inset_0_-2px_0_#fff]" : "text-white/40 hover:bg-white/5 hover:text-white/80"
            )}
          >
            <Check className="w-4 h-4 shrink-0" /> <span className="truncate">TASKS</span>
          </button>
        </div>
        
        {/* Scrollable Content Area - Crucial for dynamic data */}
        <div className="flex-1 overflow-y-auto overscroll-contain transform-gpu scrollbar-hide p-8 flex flex-col gap-6 relative">
          
          {/* State A: Dialogue & Inline UI Card */}
          {activeState === 'A' && renderDialogueLayer()}

          {/* State B: Memory Retrieval (Terminal List) */}
          {activeState === 'B' && (
            <div className="flex flex-col flex-1">
              <div className="mb-6 flex items-center justify-between border-b border-white/30 pb-4 shrink-0 gap-2">
                <h3 className="font-['Syncopate'] text-sm tracking-[0.2em] font-bold text-white truncate w-full">QUERY RESULTS</h3>
                <span className="text-xs text-white/50 shrink-0">4 MATCHES</span>
              </div>
              
              <div className="flex flex-col gap-3 overflow-y-auto pb-12 pr-1">
                {[
                  { id: 101, name: 'SECTOR_NULL', hash: 'x0A99', active: true },
                  { id: 102, name: 'PROXY_ROUTER', hash: 'x0B12', active: false },
                  { id: 103, name: 'NODE_7A-X', hash: 'x0C44', active: false },
                  { id: 104, name: 'GHOST_PROTOCOL', hash: 'x0D91', active: false },
                ].map((node) => (
                  <div 
                    key={node.id}
                    className={cn(
                      "p-3 border transition-all cursor-pointer relative group flex flex-col gap-2 shrink-0",
                      hoveredNode === node.id 
                        ? "border-white/70 bg-white/10 shadow-[inset_4px_0_0_#fff]" 
                        : "border-white/20 bg-black/60 hover:border-white/40"
                    )}
                    onMouseEnter={() => setHoveredNode(node.id)}
                    onMouseLeave={() => setHoveredNode(null)}
                  >
                    <div className="flex justify-between items-center text-xs gap-4">
                      <span className={cn(
                        "font-bold tracking-widest truncate w-full",
                        hoveredNode === node.id ? "text-white" : "text-white/70"
                      )} title={node.name}>
                        {node.name}
                      </span>
                      <span className="text-white/40 shrink-0 font-mono">{node.hash}</span>
                    </div>
                    {hoveredNode === node.id && (
                      <motion.div 
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="text-[10px] text-white/60 border-t border-white/20 pt-2 mt-1 break-words"
                      >
                        Summoning node to viewport foreground... Layer 0 synced.
                      </motion.div>
                    )}
                    {/* Glowing line indicator for "summoning" state */}
                    {hoveredNode === node.id && (
                      <motion.div 
                        layoutId="glow-line"
                        className="absolute left-0 top-0 bottom-0 w-[4px] bg-white shadow-[0_0_15px_rgba(255,255,255,0.8)]"
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* State C: Lists View */}
          {activeState === 'C' && (
            <div className="flex flex-col flex-1">
              <div className="mb-6 flex items-center justify-between border-b border-white/30 pb-4 shrink-0 gap-2">
                <h3 className="font-['Syncopate'] text-sm tracking-[0.2em] font-bold text-white truncate w-full">CHECKLISTS</h3>
                <span className="text-xs text-white/50 shrink-0">3 LISTS</span>
              </div>
              
              <ListsWorkspace />
            </div>
          )}

          {/* State TASKS: Standalone Tasks */}
          {activeState === 'TASKS' && (
            <div className="flex flex-col flex-1">
              <div className="mb-6 flex items-center justify-between border-b border-white/30 pb-4 shrink-0 gap-2">
                <h3 className="font-['Syncopate'] text-sm tracking-[0.2em] font-bold text-white truncate w-full">TASKS</h3>
                <span className="text-xs text-white/50 shrink-0">4 TASKS</span>
              </div>
              
              <TasksWorkspace />
            </div>
          )}

          {/* State NODE_INSPECTOR: Node Details View */}
          {activeState === 'NODE_INSPECTOR' && inspectedNode && (
            <div className="flex flex-col flex-1">
              <div className="mb-6 flex items-center justify-between border-b border-white/30 pb-4 shrink-0 gap-2">
                <h3 className="font-['Syncopate'] text-sm tracking-[0.2em] font-bold text-white truncate w-full">NODE_INSPECTOR</h3>
                <button
                  onClick={() => {
                    setActiveState('A');
                    if (onCloseInspector) onCloseInspector();
                  }}
                  className="text-xs text-white/50 hover:text-white transition-colors cursor-pointer border border-white/30 px-3 py-1 bg-white/5 hover:bg-white/10"
                >
                  [ CLOSE ]
                </button>
              </div>

              <div className="flex flex-col gap-6 pb-12">
                {/* ID & Title */}
                <div className="flex flex-col gap-3">
                  <div className="flex items-center justify-between gap-4 pb-3 border-b border-white/10">
                    <span className="text-xs text-white/50 tracking-widest">NODE_ID:</span>
                    <span className="font-mono text-sm text-white font-bold">{inspectedNode.id}</span>
                  </div>
                  <div className="flex items-center justify-between gap-4 pb-3 border-b border-white/10">
                    <span className="text-xs text-white/50 tracking-widest">TITLE:</span>
                    <span className="text-sm text-white/90 font-bold truncate max-w-xs">{inspectedNode.title}</span>
                  </div>
                  <div className="flex items-center justify-between gap-4 pb-3 border-b border-white/10">
                    <span className="text-xs text-white/50 tracking-widest">TYPE:</span>
                    <span className="text-sm text-white font-bold border border-white/30 px-3 py-1 bg-white/5">
                      {String(inspectedNode.type || inspectedNode.group || 'NODE').toUpperCase()}
                    </span>
                  </div>
                </div>

                {/* Position */}
                <div className="bg-white/5 border border-white/10 p-4">
                  <div className="text-xs text-white/40 tracking-widest mb-3 font-bold">COORDINATES</div>
                  <div className="flex gap-6">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-white/50">X:</span>
                      <span className="font-mono text-white">{Math.round(inspectedNode.x)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-white/50">Y:</span>
                      <span className="font-mono text-white">{Math.round(inspectedNode.y)}</span>
                    </div>
                  </div>
                </div>

                {/* Data Payload / Body Text */}
                <div>
                  <div className="text-xs text-white/40 tracking-widest mb-3 font-bold border-b border-white/10 pb-2">
                    DATA_PAYLOAD
                  </div>
                  <div className="bg-black/60 border border-white/10 p-4 text-sm text-white/70 leading-relaxed">
                    <p className="mb-3">
                      Core diagnostic module initiated at 14:42:03 UTC. Analyzing node integrity across sector quadrants A-4 through D-9. Preliminary scans indicate elevated coherence levels within the primary network lattice.
                    </p>
                    <p className="mb-3">
                      Proxy relay channels functioning at optimal capacity. No anomalies detected in the temporal buffer cache. System recommends continued monitoring of peripheral edge connections for stability verification.
                    </p>
                    <p className="text-white/50 italic text-xs">
                      Last modified: 2026-04-01 18:23:11 UTC | Author: SYS_ADMIN_01
                    </p>
                  </div>
                </div>

                {/* Tags */}
                <div>
                  <div className="text-xs text-white/40 tracking-widest mb-3 font-bold border-b border-white/10 pb-2">
                    TAGS ({inspectedNode.tags.length})
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {inspectedNode.tags.map((tag: string, i: number) => (
                      <span
                        key={i}
                        className="text-xs px-3 py-1 border border-white/30 bg-black/40 text-white/80 tracking-wider"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Connected Edges */}
                <div>
                  <div className="text-xs text-white/40 tracking-widest mb-3 font-bold border-b border-white/10 pb-2">
                    CONNECTED_EDGES ({inspectedNode.edges.length})
                  </div>
                  <div className="flex flex-col gap-2 max-h-32 overflow-y-auto custom-scrollbar">
                    {inspectedNode.edges.map((edge: string, i: number) => (
                      <div
                        key={i}
                        className="text-xs font-mono text-white/60 bg-white/5 border border-white/10 px-3 py-2 hover:bg-white/10 transition-colors"
                      >
                        {edge}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </motion.div>

      {/* Mobile Bottom Sheet Version */}
      {isMobileBannerOpen && onMobileClose && (
        <div className="md:hidden">
          <MobileBannerSheet isOpen={isMobileBannerOpen} onClose={onMobileClose}>
            {/* Header Tabs - Mobile */}
            <div className="flex border-b border-white/20 bg-black/60 sticky top-0 z-10">
              <button 
                onClick={() => setActiveState('A')}
                className={cn(
                  "flex-1 flex items-center justify-center gap-2 text-xs tracking-widest transition-colors font-bold min-h-[48px]",
                  activeState === 'A' ? "bg-white/10 text-white shadow-[inset_0_-2px_0_#fff]" : "text-white/40 active:bg-white/5 active:text-white/80"
                )}
              >
                <Terminal className="w-4 h-4 shrink-0" /> <span className="truncate">DIALOGUE</span>
              </button>
              <button 
                onClick={() => setActiveState('B')}
                className={cn(
                  "flex-1 flex items-center justify-center gap-2 text-xs tracking-widest transition-colors font-bold min-h-[48px] border-l border-white/20",
                  activeState === 'B' ? "bg-white/10 text-white shadow-[inset_0_-2px_0_#fff]" : "text-white/40 active:bg-white/5 active:text-white/80"
                )}
              >
                <Database className="w-4 h-4 shrink-0" /> <span className="truncate">QUERY</span>
              </button>
              <button 
                onClick={() => setActiveState('C')}
                className={cn(
                  "flex-1 flex items-center justify-center gap-2 text-xs tracking-widest transition-colors font-bold min-h-[48px] border-l border-white/20",
                  activeState === 'C' ? "bg-white/10 text-white shadow-[inset_0_-2px_0_#fff]" : "text-white/40 active:bg-white/5 active:text-white/80"
                )}
              >
                <List className="w-4 h-4 shrink-0" /> <span className="truncate">LIST</span>
              </button>
              <button 
                onClick={() => setActiveState('TASKS')}
                className={cn(
                  "flex-1 flex items-center justify-center gap-2 text-xs tracking-widest transition-colors font-bold min-h-[48px] border-l border-white/20",
                  activeState === 'TASKS' ? "bg-white/10 text-white shadow-[inset_0_-2px_0_#fff]" : "text-white/40 active:bg-white/5 active:text-white/80"
                )}
              >
                <Check className="w-4 h-4 shrink-0" /> <span className="truncate">TASKS</span>
              </button>
            </div>

            {/* Scrollable Content - Same as Desktop */}
            <div className="p-4 flex flex-col gap-6">
              {/* State A: Dialogue & Inline UI Card */}
              {activeState === 'A' && renderDialogueLayer()}

              {/* State B: Memory Retrieval (Terminal List) */}
              {activeState === 'B' && (
                <div className="flex flex-col flex-1">
                  <div className="mb-6 flex items-center justify-between border-b border-white/30 pb-4 shrink-0 gap-2">
                    <h3 className="font-['Syncopate'] text-sm tracking-[0.2em] font-bold text-white truncate w-full">QUERY RESULTS</h3>
                    <span className="text-xs text-white/50 shrink-0">4 MATCHES</span>
                  </div>
                  
                  <div className="flex flex-col gap-3 overflow-y-auto pb-12 pr-1">
                    {[
                      { id: 101, name: 'SECTOR_NULL', hash: 'x0A99', active: true },
                      { id: 102, name: 'PROXY_ROUTER', hash: 'x0B12', active: false },
                      { id: 103, name: 'NODE_7A-X', hash: 'x0C44', active: false },
                      { id: 104, name: 'GHOST_PROTOCOL', hash: 'x0D91', active: false },
                    ].map((node) => (
                      <div 
                        key={node.id}
                        className={cn(
                          "p-4 border transition-all active:bg-white/10 relative group flex flex-col gap-2 shrink-0 min-h-[44px]",
                          hoveredNode === node.id 
                            ? "border-white/70 bg-white/10 shadow-[inset_4px_0_0_#fff]" 
                            : "border-white/20 bg-black/60"
                        )}
                        onClick={() => setHoveredNode(hoveredNode === node.id ? null : node.id)}
                      >
                        <div className="flex justify-between items-center text-xs gap-4">
                          <span className={cn(
                            "font-bold tracking-widest truncate w-full",
                            hoveredNode === node.id ? "text-white" : "text-white/70"
                          )} title={node.name}>
                            {node.name}
                          </span>
                          <span className="text-white/40 shrink-0 font-mono">{node.hash}</span>
                        </div>
                        {hoveredNode === node.id && (
                          <div className="text-[10px] text-white/60 border-t border-white/20 pt-2 mt-1 break-words">
                            Summoning node to viewport foreground... Layer 0 synced.
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* State C: Lists View */}
              {activeState === 'C' && (
                <div className="flex flex-col flex-1">
                  <div className="mb-6 flex items-center justify-between border-b border-white/30 pb-4 shrink-0 gap-2">
                    <h3 className="font-['Syncopate'] text-sm tracking-[0.2em] font-bold text-white truncate w-full">CHECKLISTS</h3>
                    <span className="text-xs text-white/50 shrink-0">3 LISTS</span>
                  </div>
                  
                  <ListsWorkspace />
                </div>
              )}

              {/* State TASKS: Standalone Tasks */}
              {activeState === 'TASKS' && (
                <div className="flex flex-col flex-1">
                  <div className="mb-6 flex items-center justify-between border-b border-white/30 pb-4 shrink-0 gap-2">
                    <h3 className="font-['Syncopate'] text-sm tracking-[0.2em] font-bold text-white truncate w-full">TASKS</h3>
                    <span className="text-xs text-white/50 shrink-0">4 TASKS</span>
                  </div>
                  
                  <TasksWorkspace />
                </div>
              )}
            </div>
          </MobileBannerSheet>
        </div>
      )}
    </>
  );
};