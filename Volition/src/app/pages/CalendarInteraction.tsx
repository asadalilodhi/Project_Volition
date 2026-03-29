import { useState } from 'react';
import { ThreeDCanvasViewport } from '../components/ThreeDCanvasViewport';
import { FloatingHUD } from '../components/FloatingHUD';
import { SidePanel } from '../components/SidePanel';

export function CalendarInteraction() {
  const [inputValue, setInputValue] = useState('DEEP_SYNC Sunday 14:00');

  return (
    <div className="relative w-full h-screen overflow-hidden bg-black text-white">
      <ThreeDCanvasViewport />

      <div className="absolute top-24 left-12 z-10 pointer-events-none select-none">
        <h1 className="font-['Syncopate'] font-bold text-5xl leading-[1.1] tracking-tight text-white mb-8">
          TASK <br />
          SEQUENCER
        </h1>
        <div className="w-16 h-1 bg-white mb-8"></div>
      </div>

      <FloatingHUD value={inputValue} onChange={setInputValue} />
      <SidePanel />
    </div>
  );
}