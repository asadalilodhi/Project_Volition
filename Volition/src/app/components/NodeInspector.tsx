import React from 'react';
import { motion } from 'motion/react';
import { X } from 'lucide-react';

interface NodeData {
  id: string;
  title: string;
  type: string;
  tags: string[];
  edges: string[];
  x: number;
  y: number;
}

interface NodeInspectorProps {
  node: NodeData;
  onClose: () => void;
}

export const NodeInspector: React.FC<NodeInspectorProps> = ({ node, onClose }) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[200] flex items-center justify-center p-8 bg-black/60 backdrop-blur-md pointer-events-auto"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-2xl border border-white/30 bg-black/95 backdrop-blur-xl shadow-[0_0_50px_rgba(255,255,255,0.1)] p-8 relative font-['Share_Tech_Mono']"
      >
        {/* Background Grid Pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:20px_20px] pointer-events-none" />
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-6 right-6 w-8 h-8 border border-white/40 hover:border-white hover:bg-white/10 flex items-center justify-center transition-all cursor-pointer z-10 group"
        >
          <X className="w-5 h-5 text-white/60 group-hover:text-white transition-colors" />
        </button>

        {/* Header */}
        <div className="relative z-10 mb-8 border-b border-white/20 pb-4">
          <div className="font-['Syncopate'] text-xl font-bold tracking-[0.2em] text-white mb-2">
            NODE_INSPECTOR
          </div>
          <div className="text-xs text-white/40 tracking-widest font-bold">
            RAW DATA VISUALIZATION
          </div>
        </div>

        {/* Node Data */}
        <div className="relative z-10 flex flex-col gap-6">
          {/* ID & Title */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between gap-4 pb-3 border-b border-white/10">
              <span className="text-xs text-white/50 tracking-widest">NODE_ID:</span>
              <span className="font-mono text-sm text-white font-bold">{node.id}</span>
            </div>
            <div className="flex items-center justify-between gap-4 pb-3 border-b border-white/10">
              <span className="text-xs text-white/50 tracking-widest">TITLE:</span>
              <span className="text-sm text-white/90 font-bold truncate max-w-md">{node.title}</span>
            </div>
            <div className="flex items-center justify-between gap-4 pb-3 border-b border-white/10">
              <span className="text-xs text-white/50 tracking-widest">TYPE:</span>
              <span className="text-sm text-white font-bold border border-white/30 px-3 py-1 bg-white/5">
                {node.type.toUpperCase()}
              </span>
            </div>
          </div>

          {/* Position */}
          <div className="bg-white/5 border border-white/10 p-4">
            <div className="text-xs text-white/40 tracking-widest mb-3 font-bold">COORDINATES</div>
            <div className="flex gap-6">
              <div className="flex items-center gap-2">
                <span className="text-xs text-white/50">X:</span>
                <span className="font-mono text-white">{Math.round(node.x)}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-white/50">Y:</span>
                <span className="font-mono text-white">{Math.round(node.y)}</span>
              </div>
            </div>
          </div>

          {/* Tags */}
          <div>
            <div className="text-xs text-white/40 tracking-widest mb-3 font-bold border-b border-white/10 pb-2">
              TAGS ({node.tags.length})
            </div>
            <div className="flex flex-wrap gap-2">
              {node.tags.map((tag, i) => (
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
              CONNECTED_EDGES ({node.edges.length})
            </div>
            <div className="flex flex-col gap-2 max-h-32 overflow-y-auto custom-scrollbar">
              {node.edges.map((edge, i) => (
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
      </motion.div>
    </motion.div>
  );
};
