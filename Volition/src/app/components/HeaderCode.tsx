import React, { useState } from 'react';
import { Target, Bell, ChevronDown, Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface HeaderProps {
  isZenMode: boolean;
  isArchiveOpen: boolean;
  setIsArchiveOpen: (open: boolean) => void;
  metricsFilter: string;
  setMetricsFilter: (filter: string) => void;
  searchNodeId: string;
  setSearchNodeId: (id: string) => void;
  isMobileBannerOpen: boolean;
  setIsMobileBannerOpen: (open: boolean) => void;
}

export const Header: React.FC<HeaderProps> = ({
  isZenMode,
  isArchiveOpen,
  setIsArchiveOpen,
  metricsFilter,
  setMetricsFilter,
  searchNodeId,
  setSearchNodeId,
  isMobileBannerOpen,
  setIsMobileBannerOpen
}) => {
  const [isMobileTitleDropdownOpen, setIsMobileTitleDropdownOpen] = useState(false);

  return (
    <header 
      className={`absolute top-0 left-0 right-[30vw] p-8 flex justify-between items-start z-20 pointer-events-none transition-all duration-700 ${isZenMode ? 'opacity-0 [&_*]:!pointer-events-none' : 'opacity-100'}
        max-md:right-0 max-md:p-4 max-md:bg-transparent max-md:h-16 max-md:items-center`}
    >
      {/* Mobile: Compact header with hamburger */}
      <div className="flex items-center gap-4 w-full max-md:justify-between relative">
        {/* Logo with Mobile Dropdown Trigger */}
        <div className="relative">
          <button
            onClick={() => setIsMobileTitleDropdownOpen(!isMobileTitleDropdownOpen)}
            className="font-['Syncopate'] font-bold tracking-widest text-xl pointer-events-auto text-white/90 max-md:text-sm flex items-center gap-2 transition-colors hover:text-white max-md:hover:text-white/90"
          >
            KNOWLEDGE_VOID
            <ChevronDown className="w-4 h-4 text-white/60 hidden max-md:block transition-transform" style={{ transform: isMobileTitleDropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)' }} />
          </button>

          {/* Mobile Title Dropdown */}
          <AnimatePresence>
            {isMobileTitleDropdownOpen && (
              <motion.div
                initial={{ opacity: 0, y: -10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                className="hidden max-md:block absolute top-full left-0 mt-4 w-[calc(100vw-2rem)] bg-black/95 backdrop-blur-3xl border border-white/20 shadow-[0_10px_40px_rgba(0,0,0,0.9),inset_0_1px_0_rgba(255,255,255,0.1)] p-4 z-50"
              >
                {/* Close Button */}
                <button
                  onClick={() => setIsMobileTitleDropdownOpen(false)}
                  className="absolute top-3 right-3 text-white/40 hover:text-white transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>

                {/* ARCHIVE Button */}
                <button
                  onClick={() => {
                    setIsArchiveOpen(true);
                    setIsMobileTitleDropdownOpen(false);
                  }}
                  className="w-full text-left px-4 py-3 text-sm font-bold tracking-widest text-white/70 hover:text-white hover:bg-white/10 transition-all border border-white/20 mb-3 bg-black/40 min-h-[44px] flex items-center"
                >
                  ARCHIVE
                </button>

                {/* Exact Node ID Search */}
                <div className="flex items-center border border-white/30 p-3 bg-black/60 group focus-within:border-white/80 transition-colors relative">
                  <Target className="w-4 h-4 text-white/40 mr-2 group-focus-within:text-white/80 transition-colors shrink-0" />
                  <input 
                    type="text" 
                    placeholder="EXACT_NODE_ID..." 
                    value={searchNodeId}
                    onChange={(e) => setSearchNodeId(e.target.value)}
                    className="bg-transparent outline-none text-xs w-full placeholder:text-white/30 tracking-widest font-mono uppercase text-white min-h-[32px]" 
                  />
                </div>

                {/* Subtle hint text */}
                <div className="text-[10px] text-white/30 tracking-widest mt-3 text-center">
                  TAP TO CLOSE
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        
        {/* Desktop Navigation */}
        <nav className="flex gap-8 text-sm tracking-widest text-white/60 pointer-events-auto font-bold mt-1 max-md:hidden">
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
        <div className="flex items-center gap-6 pointer-events-auto mt-1 max-md:hidden">
          {/* Exact Node ID Search */}
          <div className="flex items-center border-b border-white/30 pb-1 group focus-within:border-white/80 transition-colors relative cursor-text">
            <Target className="w-4 h-4 text-white/40 mr-2 group-focus-within:text-white/80 transition-colors" />
            <input 
              type="text" 
              placeholder="EXACT_NODE_ID..." 
              value={searchNodeId}
              onChange={(e) => setSearchNodeId(e.target.value)}
              className="bg-transparent outline-none text-xs w-40 focus:w-56 transition-all placeholder:text-white/30 tracking-widest font-mono uppercase text-white" 
            />
            {/* Blinking Cursor Indicator */}
            <div className="w-1.5 h-3 bg-white/80 absolute right-0 top-1/2 -translate-y-1/2 animate-pulse pointer-events-none opacity-0 group-focus-within:opacity-100" />
          </div>
          <button className="text-white/60 hover:text-white transition-colors cursor-pointer">
            <Bell className="w-5 h-5" />
          </button>
        </div>
        
        {/* Mobile: Menu button to open banner + Filter dropdown */}
        <div className="hidden max-md:flex items-center gap-3 pointer-events-auto">
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
            className="text-white/80 hover:text-white transition-colors cursor-pointer border border-white/30 p-2 bg-white/5 hover:bg-white/10 min-h-[44px] min-w-[44px] flex items-center justify-center"
          >
            <Menu className="w-5 h-5" />
          </button>
        </div>
      </div>
    </header>
  );
};
