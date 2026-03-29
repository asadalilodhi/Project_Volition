import { useState } from 'react';
import { ThreeDCanvasViewport } from '../components/ThreeDCanvasViewport';
import { FloatingHUD } from '../components/FloatingHUD';
import { SidePanel } from '../components/SidePanel';

export function MainWorkspace() {
  const [inputValue, setInputValue] = useState('');
  const [activeTaskLabel, setActiveTaskLabel] = useState<string | null>(null);

  return (
    <div className="relative w-full h-screen overflow-hidden bg-black text-white">
      {/* Layer 0: 3D Canvas Viewport */}
      <ThreeDCanvasViewport highlightedLabel={activeTaskLabel} />

      {/* Decorative Background Text (Layer 1) */}
      <div className="absolute top-24 left-12 z-10 pointer-events-none select-none">
        <h1 className="font-['Syncopate'] font-bold text-5xl leading-[1.1] tracking-tight text-white mb-8">
          THE <br />
          KNOWLEDGE <br />
          VOID
        </h1>
        
        <div className="w-16 h-1 bg-white mb-8"></div>
        
        {/* Decorative Metrics Panel */}
        <div className="inline-block border border-[#333] bg-gradient-to-b from-[#111]/80 to-transparent backdrop-blur-sm p-6 pr-12 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-white to-transparent"></div>
          <div className="text-[9px] text-[#888] tracking-[0.3em] font-['Share_Tech_Mono'] mb-4 uppercase">
            System_Metrics
          </div>
          <div className="flex gap-8">
            <div>
              <div className="text-xl font-bold font-['Syncopate'] tracking-wider mb-1">4,812</div>
              <div className="text-[8px] text-[#555] tracking-widest font-['Share_Tech_Mono'] uppercase">Nodes_Index</div>
            </div>
            <div>
              <div className="text-xl font-bold font-['Syncopate'] tracking-wider mb-1 text-white">99.8%</div>
              <div className="text-[8px] text-[#555] tracking-widest font-['Share_Tech_Mono'] uppercase">Coherence</div>
            </div>
          </div>
        </div>
      </div>

      {/* Floating UI Elements (Layer 2) */}
      <FloatingHUD value={inputValue} onChange={setInputValue} />
      <SidePanel 
        activeTaskLabel={activeTaskLabel} 
        onTaskHover={setActiveTaskLabel} 
      />
    </div>
  );
}