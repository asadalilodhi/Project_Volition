import { FileUp } from 'lucide-react';

interface FileIngestCardProps {
  fileName?: string;
  targetNode?: { x: number; y: number };
}

export function FileIngestCard({
  fileName = 'DATA_PAYLOAD.BIN',
  targetNode,
}: FileIngestCardProps) {
  return (
    <>
      {/* File card */}
      <div className="fixed bottom-40 left-1/2 -translate-x-1/2 z-40 bg-white border border-[#444] px-6 py-4 flex items-center gap-4">
        <FileUp className="text-black w-6 h-6" />
        <div>
          <div className="text-[10px] text-[#555] tracking-widest font-['Share_Tech_Mono'] uppercase mb-1">
            INGESTING_FILE
          </div>
          <p className="text-black font-bold font-['Share_Tech_Mono'] tracking-wider">
            {fileName}
          </p>
        </div>
      </div>

      {/* Dashed connection line to a node */}
      {targetNode && (
        <svg
          className="fixed inset-0 w-full h-full pointer-events-none z-35"
          style={{ overflow: 'visible' }}
        >
          <line
            x1={window.innerWidth / 2}
            y1={window.innerHeight - 160}
            x2={targetNode.x}
            y2={targetNode.y}
            stroke="#ffffff"
            strokeWidth="1"
            strokeDasharray="4 4"
            className="animate-pulse"
          />
          <circle 
            cx={targetNode.x}
            cy={targetNode.y}
            r="4"
            fill="#ffffff"
            className="animate-ping"
            style={{ transformOrigin: `${targetNode.x}px ${targetNode.y}px` }}
          />
          <circle 
            cx={targetNode.x}
            cy={targetNode.y}
            r="4"
            fill="#ffffff"
          />
        </svg>
      )}
    </>
  );
}
