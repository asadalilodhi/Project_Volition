import React from 'react';
import { useState } from 'react';
import { Link } from 'react-router';
import { Activity } from 'lucide-react';

// 1. IMPORT YOUR REAL 3D ENGINE (Instead of Figma's fake Layer0)
import { ThreeDCanvasViewport } from '../components/ThreeDCanvasViewport';

// 2. IMPORT FIGMA'S UI COMPONENTS
import { BottomHUD } from '../components/BottomHUD';
import { MonologueBanner } from '../components/MonologueBanner';
import { Target, Bell, ChevronDown, Menu } from 'lucide-react';

export function Dashboard() {
  const [viewMode, setViewMode] = useState<'COMMAND_HUD' | 'NEURAL_MAP'>('COMMAND_HUD');
  const [isArchiveOpen, setIsArchiveOpen] = useState(false);
  const [metricsFilter, setMetricsFilter] = useState('All');
  const [searchNodeId, setSearchNodeId] = useState('');
  const [inspectedNode, setInspectedNode] = useState<any>(null);
  const [isMobileBannerOpen, setIsMobileBannerOpen] = useState(false);
  const [isMobileHeaderExpanded, setIsMobileHeaderExpanded] = useState(false);
  const [proposedNodes, setProposedNodes] = useState<any[]>([]);
  const [isProposing, setIsProposing] = useState(false);
  const [needsTimeClarification, setNeedsTimeClarification] = useState(false);
  const [volitionMessage, setVolitionMessage] = useState("System initialization complete. Awaiting user input stream to generate neural blueprints...");
 

  const isZenMode = viewMode === 'NEURAL_MAP';

  // NEW: The function that triggers Phase 1 of the Handshake
  const handleCommandExecute = async (commandText: string) => {
    if (!commandText.trim()) return;
    
    setIsProposing(true);
    console.log("Transmitting to Fast Brain...");

    try {
      const response = await fetch('http://localhost:5005/api/propose', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ command: commandText }),
      });

      const data = await response.json();
      
      if (data.success) {
        console.log("🧠 Fast Brain Payload:", data);
        
        // FIX: Append new proposals with a unique ID and 'pending' status!
        const newProposals = data.proposals.map((p: any) => ({
           ...p, 
           _id: Math.random().toString(36).substr(2, 9), 
           _status: 'pending' 
        }));
        
        setProposedNodes(prev => [...prev, ...newProposals]);
        
        if (data.message) setVolitionMessage(data.message); 
        setIsMobileBannerOpen(true); 
      } else {
        console.error("System Error:", data.error);
      }
    } catch (error) {
      console.error("Network Error: Is the Brain Stem running?", error);
    } finally {
      setIsProposing(false);
    }
  };

  // This updates the status of a card when confirmed/rejected
  const handleFinalizeProposal = (id: string, action: 'confirm' | 'reject') => {
    setProposedNodes(prev => prev.map(node => 
      node._id === id ? { ...node, _status: action === 'confirm' ? 'confirmed' : 'rejected' } : node
    ));
  };

  const handleNodeClick = (nodeId: string) => {
    setSearchNodeId(nodeId);
  };

  const handleNodeInspect = (node: any) => {
    setInspectedNode({
      ...node,
      title: node.name || node.title || "UNKNOWN_NODE",
      tags: ['CRITICAL', 'SECTOR_ALPHA', 'DIAGNOSTIC'],
      edges: ['NODE_0042', 'NODE_0097', 'NODE_7B-Y', 'NODE_00F3', 'NODE_0156']
    });
   
    if (window.innerWidth <= 768) {
      setIsMobileBannerOpen(true);
    }
  };

  const handleCloseInspector = () => {
    setInspectedNode(null);
    setSearchNodeId('');
    setIsMobileBannerOpen(false);
  };

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);

  const executeSearch = async () => {
    if (!searchQuery) return;
    try {
      const res = await fetch(`http://localhost:5005/api/search?q=${searchQuery}`);
      const data = await res.json();
      setSearchResults(data);
      setIsMobileBannerOpen(true);
    } catch (err) {
      console.error("Search failed:", err);
    }
  };

  return (
    <div className="relative w-full h-screen overflow-hidden bg-black font-['Share_Tech_Mono'] text-white selection:bg-white/30 selection:text-white">
     
      {/* ========================================== */}
      {/* LAYER 0: YOUR ACTUAL 3D SURREALDB CANVAS   */}
      {/* ========================================== */}
      <div className={`absolute inset-0 transition-opacity duration-700 z-0 ${isMobileBannerOpen ? 'max-md:pointer-events-none' : ''}`}>
        <ThreeDCanvasViewport
          highlightedLabel={searchNodeId}
          filter={metricsFilter}
          isZenMode={isZenMode}
          onNodeClick={handleNodeClick}
          onNodeInspect={handleNodeInspect}
          onClearSelection={handleCloseInspector}
        />
      </div>

      {/* ========================================== */}
      {/* LAYER 1: THE KNOWLEDGE VOID UI OVERLAY     */}
      {/* ========================================== */}
      <div className={`absolute inset-0 pointer-events-none z-20 transition-all duration-700 ${isZenMode ? 'opacity-0 [&_*]:!pointer-events-none' : 'opacity-100'}`}>
       
        {/* Top Navigation */}
        <header className="w-full p-8 flex justify-between items-start max-md:p-4 max-md:h-16 max-md:items-center">
          <div className="flex items-center justify-between gap-4 w-full relative pointer-events-auto">
           
            {/* Title with Mobile Dropdown Trigger */}
            <div
              className="font-['Syncopate'] font-bold tracking-widest text-xl text-white/90 max-md:text-sm flex items-center gap-2 max-md:cursor-pointer max-md:active:text-white"
              onClick={() => setIsMobileHeaderExpanded(!isMobileHeaderExpanded)}
            >
              KNOWLEDGE_VOID
              <ChevronDown className={`w-4 h-4 hidden max-md:block transition-transform duration-300 ${isMobileHeaderExpanded ? 'rotate-180' : ''}`} />
            </div>
           
            {/* Desktop Navigation */}
            <nav className="flex gap-8 text-sm tracking-widest text-white/60 font-bold mt-1 max-md:hidden">
              <a href="#" className="hover:text-white transition-colors cursor-pointer">VOID</a>
              <span className="text-white/20">|</span>
              <button
                onClick={() => setIsArchiveOpen(true)}
                className="hover:text-white transition-colors cursor-pointer"
              >
                ARCHIVE
              </button>
            </nav>
           
            {/* Desktop Search & Bell */}
            <div className="flex items-center gap-6 mt-1 max-md:hidden">
              <div className="flex items-center border-b border-white/30 pb-1 group focus-within:border-white/80 transition-colors relative cursor-text">
                <Target className="w-4 h-4 text-white/40 mr-2 group-focus-within:text-white/80 transition-colors" />
                <input
                  type="text"
                  placeholder="EXACT_NODE_ID..."
                  value={searchNodeId}
                  onChange={(e) => setSearchNodeId(e.target.value)}
                  className="bg-transparent outline-none text-xs w-40 focus:w-56 transition-all placeholder:text-white/30 tracking-widest font-mono uppercase text-white"
                />
                <div className="w-1.5 h-3 bg-white/80 absolute right-0 top-1/2 -translate-y-1/2 animate-pulse pointer-events-none opacity-0 group-focus-within:opacity-100" />
              </div>
              <button className="text-white/60 hover:text-white transition-colors cursor-pointer">
                <Bell className="w-5 h-5" />
              </button>
            </div>
           
            {/* Mobile: Filter & Sidebar Hamburger */}
            <div className="hidden max-md:flex items-center gap-3">
              <div className="relative group">
                <select
                  value={metricsFilter}
                  onChange={(e) => setMetricsFilter(e.target.value)}
                  className="bg-white/5 border border-white/20 text-white font-bold text-[10px] px-2 py-2 appearance-none outline-none focus:border-white/80 focus:bg-white/10 transition-colors cursor-pointer uppercase tracking-widest pr-6 min-h-[44px]"
                >
                  <option value="All" className="bg-black text-white">ALL</option>
                  <option value="Thought" className="bg-black text-white">THOUGHT</option>
                  <option value="Task" className="bg-black text-white">TASK</option>
                  <option value="Event" className="bg-black text-white">EVENT</option>
                  <option value="List" className="bg-black text-white">LIST</option>
                  <option value="Document" className="bg-black text-white">DOCUMENT</option>
                </select>
                <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-white/40 pointer-events-none" />
              </div>
              <button
                onClick={() => setIsMobileBannerOpen(!isMobileBannerOpen)}
                className="text-white/80 hover:text-white transition-colors cursor-pointer border border-white/30 p-2 bg-white/5 active:bg-white/10 min-h-[44px] min-w-[44px] flex items-center justify-center"
              >
                <Menu className="w-5 h-5" />
              </button>
            </div>

            {/* Mobile Expanded Dropdown */}
            {isMobileHeaderExpanded && (
              <div className="absolute top-full left-0 mt-4 w-full bg-black/95 border border-white/20 backdrop-blur-xl p-5 flex flex-col gap-6 z-50 md:hidden shadow-[0_10px_40px_rgba(0,0,0,0.8)] pointer-events-auto">
                <div className="flex items-center border-b border-white/30 pb-2 relative cursor-text focus-within:border-white/80 transition-colors">
                  <Target className="w-4 h-4 text-white/40 mr-2" />
                  <input
                    type="text"
                    placeholder="EXACT_NODE_ID..."
                    value={searchNodeId}
                    onChange={(e) => setSearchNodeId(e.target.value)}
                    className="bg-transparent outline-none text-xs w-full placeholder:text-white/30 tracking-widest font-mono uppercase text-white"
                  />
                </div>
                <button
                  onClick={() => {
                    setIsArchiveOpen(true);
                    setIsMobileHeaderExpanded(false);
                  }}
                  className="text-left text-xs tracking-widest font-bold text-white/80 active:text-white border border-white/10 p-3 bg-white/5 active:bg-white/10 flex justify-between items-center"
                >
                  [ OPEN ARCHIVE ] <ChevronDown className="w-4 h-4 -rotate-90" />
                </button>
              </div>
            )}
          </div>
        </header>

        {/* Left Side Typography & Metrics */}
        <div className="absolute top-40 left-8 flex flex-col gap-12 max-md:hidden pointer-events-none">
          <h1 className="font-['Syncopate'] text-7xl font-bold tracking-tighter text-white/90 leading-[0.85] pointer-events-auto">
            THE<br/>KNOWLEDGE<br/>VOID
          </h1>

          <div className="border border-white/20 p-5 bg-black/60 backdrop-blur-md w-80 pointer-events-auto shadow-[inset_0_0_20px_rgba(255,255,255,0.02)]">
            <div className="font-['Syncopate'] text-xs tracking-[0.2em] border-b border-white/30 pb-3 mb-4 text-white/70 font-bold">
              SYSTEM_METRICS
            </div>
            <div className="flex flex-col gap-3 text-sm tracking-wider">
              <div className="flex justify-between items-center">
                <span className="text-white/50">Nodes_Index</span>
                <span className="text-white font-bold">4,096</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-white/50">Coherence</span>
                <span className="text-white font-bold">98.4%</span>
              </div>
              <div className="flex justify-between items-center mt-2 pt-3 border-t border-white/20">
                <span className="text-white/50">Status</span>
                <span className="text-white font-bold animate-pulse tracking-widest">OPTIMAL</span>
              </div>
            </div>

            <div className="mt-5 pt-4 border-t border-white/20">
              <div className="font-['Syncopate'] text-[10px] tracking-widest text-white/40 mb-2">LAYER 0 FILTER</div>
              <div className="relative group">
                <select
                  value={metricsFilter}
                  onChange={(e) => setMetricsFilter(e.target.value)}
                  className="w-full bg-white/5 border border-white/20 text-white font-bold text-xs p-2.5 appearance-none outline-none focus:border-white/80 focus:bg-white/10 transition-colors cursor-pointer shadow-[inset_0_0_10px_rgba(255,255,255,0.05)] uppercase tracking-widest"
                >
                  <option value="All" className="bg-black text-white">ALL_NODES</option>
                  <option value="Thought" className="bg-black text-white">THOUGHT</option>
                  <option value="Task" className="bg-black text-white">TASK</option>
                  <option value="Event" className="bg-black text-white">EVENT</option>
                  <option value="List" className="bg-black text-white">LIST</option>
                  <option value="Document" className="bg-black text-white">DOCUMENT</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40 pointer-events-none group-focus-within:text-white transition-colors" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================== */}
      {/* VOLITION PORTRAIT - HANGING OUTSIDE        */}
      {/* ========================================== */}
      <div className="fixed right-[320px] top-[50vh] -translate-y-1/2 z-30 flex flex-col gap-2 max-md:hidden">
        <Link
          to="/volition"
          className="group"
        >
          <div className="relative w-32 h-32 border border-white/10 overflow-hidden bg-zinc-900 flex flex-col grayscale cursor-pointer hover:grayscale-0 transition-all duration-500">
            <div 
              className="absolute inset-0 bg-cover bg-center mix-blend-luminosity opacity-60 group-hover:opacity-100 transition-opacity duration-500" 
              style={{ backgroundImage: `url('https://images.unsplash.com/photo-1729554608003-5ec8be42da1d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjeWJlcnB1bmslMjBhaSUyMGZhY2UlMjBhYnN0cmFjdCUyMGRhcmt8ZW58MXx8fHwxNzc1MDMwMjk4fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral')` }}
            />
            {/* Scanline effect overlay */}
            <div className="absolute inset-0 bg-[linear-gradient(transparent_50%,rgba(0,0,0,0.5)_50%)] bg-[length:100%_4px] pointer-events-none z-10" />
            
            <div className="mt-auto relative z-20 w-full bg-black/90 backdrop-blur-sm border-t border-white/20 text-[10px] px-2 py-1 font-bold text-white tracking-wider flex items-center justify-between">
              <span className="truncate pr-1">VOLITION</span>
              <Activity className="w-3 h-3 text-white animate-pulse shrink-0" />
            </div>
          </div>
        </Link>

        {/* Sleek button to navigate to Volition page */}
        <Link
          to="/volition"
          className="w-32 bg-black/90 backdrop-blur-md border border-white/20 hover:border-white/60 hover:bg-white/5 transition-all duration-300 py-2 px-3 cursor-pointer group"
        >
          <div className="font-['Syncopate'] text-[8px] tracking-[0.3em] text-white/80 group-hover:text-white font-bold text-center">
            ENTER
          </div>
        </Link>
      </div>

      {/* ========================================== */}
      {/* LAYER 2: BOTTOM HUD & BANNER               */}
      {/* ========================================== */}
      <div className="absolute inset-0 z-30 pointer-events-none">
        
        {/* We use BottomHUD to handle standard input and view toggling */}
        <BottomHUD
          viewMode={viewMode}
          setViewMode={setViewMode}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          onExecute={(val) => {
            if (viewMode === 'COMMAND_HUD') {
              handleCommandExecute(val); 
            } else {
              executeSearch(); 
            }
          }}
        />

        {/* We pass the AI's data directly to the banner to render our custom cards */}
        <MonologueBanner
          isZenMode={isZenMode}
          inspectedNode={inspectedNode}
          onCloseInspector={handleCloseInspector}
          isMobileBannerOpen={isMobileBannerOpen}
          onMobileClose={() => setIsMobileBannerOpen(false)}
          searchResults={searchResults}
          
          proposals={proposedNodes}
          volitionMessage={volitionMessage}
          onFinalizeProposal={handleFinalizeProposal}  
        />
      </div>

      {/* ========================================== */}
      {/* LAYER 3: ARCHIVE MODAL                     */}
      {/* ========================================== */}
      {isArchiveOpen && (
        <div className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-3xl flex items-center justify-center p-8 pointer-events-auto transition-opacity duration-300">
          <div className="w-full max-w-4xl h-[80vh] border border-white/10 flex flex-col relative shadow-[0_0_50px_rgba(255,255,255,0.05),inset_0_0_50px_rgba(0,0,0,1)] bg-black/80">
            <button onClick={() => setIsArchiveOpen(false)} className="absolute top-6 right-6 text-white/40 hover:text-white transition-colors cursor-pointer text-sm tracking-widest font-bold z-20 flex items-center gap-2">
              [ CLOSE ]
            </button>
            <div className="p-8 border-b border-white/10 relative z-10 flex flex-col gap-2 bg-black/40">
              <h2 className="font-['Syncopate'] text-2xl font-bold tracking-[0.2em] text-white/50">COLD_STORAGE</h2>
            </div>
            <div className="flex-1 overflow-y-auto p-8 flex flex-col gap-3 relative z-10 scrollbar-hide">
              {[...Array(12)].map((_, i) => (
                 <div key={i} className="flex items-center justify-between p-4 border border-white/5 bg-white/[0.01] text-xs transition-colors hover:bg-white/[0.03] group">
                   <div className="flex items-center gap-4 w-1/2">
                     <span className="font-mono text-white/20">{(1000 + i).toString(16).toUpperCase()}</span>
                     <span className="truncate text-white/40 font-bold group-hover:text-white/60 transition-colors">
                       {['Initial Core Diagnostics', 'Purge Temporal Cache', 'Establish Relay Node 4A', 'Deconstruct Obsolete Network Map'][i % 4]}
                     </span>
                   </div>
                   <div className="flex items-center gap-12 shrink-0">
                     <span className="text-white/20 tracking-widest border border-white/10 px-2 py-1 bg-black/40">COMPLETED</span>
                     <span className="font-mono text-white/30 w-24 text-right">2026-04-01</span>
                   </div>
                 </div>
              ))}
            </div>
          </div>
        </div>
      )}
     
      {/* ========================================== */}
      {/* LAYER 4: CRT OVERLAY                       */}
      {/* ========================================== */}
      <div className="absolute inset-0 pointer-events-none z-[100] mix-blend-overlay opacity-10 bg-[linear-gradient(rgba(0,0,0,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,255,255,0.02),rgba(255,255,255,0.01),rgba(255,255,255,0.02))] bg-[length:100%_4px,3px_100%]" />
     
      <style>{`
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
}
