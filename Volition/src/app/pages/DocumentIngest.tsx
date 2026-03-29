import { useState, useEffect } from 'react';
import { ThreeDCanvasViewport } from '../components/ThreeDCanvasViewport';
import { FloatingHUD } from '../components/FloatingHUD';
import { SidePanel } from '../components/SidePanel';
import { FileIngestCard } from '../components/FileIngestCard';

export function DocumentIngest() {
  const [inputValue, setInputValue] = useState('');
  const [targetNode, setTargetNode] = useState<{x: number, y: number} | null>(null);

  useEffect(() => {
    // Generate a target node roughly in the middle right
    setTargetNode({
      x: window.innerWidth * 0.65,
      y: window.innerHeight * 0.45,
    });
    
    const handleResize = () => {
      setTargetNode({
        x: window.innerWidth * 0.65,
        y: window.innerHeight * 0.45,
      });
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className="relative w-full h-screen overflow-hidden bg-black text-white">
      <ThreeDCanvasViewport />

      <div className="absolute top-24 left-12 z-10 pointer-events-none select-none">
        <h1 className="font-['Syncopate'] font-bold text-5xl leading-[1.1] tracking-tight text-white mb-8">
          DATA <br />
          ASSIMILATION
        </h1>
        <div className="w-16 h-1 bg-white mb-8"></div>
        <div className="inline-block border border-[#333] bg-gradient-to-b from-[#111]/80 to-transparent backdrop-blur-sm p-6 pr-12 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-white to-transparent"></div>
          <div className="text-[9px] text-[#888] tracking-[0.3em] font-['Share_Tech_Mono'] mb-4 uppercase">
            Ingest_Status
          </div>
          <div className="text-xl font-bold font-['Syncopate'] tracking-wider mb-1 text-white">RECEIVING</div>
          <div className="text-[8px] text-[#555] tracking-widest font-['Share_Tech_Mono'] uppercase">Buffer: 42%</div>
        </div>
      </div>

      <FloatingHUD value={inputValue} onChange={setInputValue} />
      {targetNode && <FileIngestCard fileName="ENCRYPTED_PAYLOAD.BIN" targetNode={targetNode} />}
      <SidePanel />
    </div>
  );
}
