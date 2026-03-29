import { useEffect, useRef } from 'react';

interface Node {
  id: number;
  x: number;
  y: number;
  size: number;
  label?: string;
  sublabels?: string[];
  isMain?: boolean;
}

interface Edge {
  from: Node;
  to: Node;
}

const LABELS = [
  "PHILOSOPHY",
  "ROOT_VOID",
  "WORK_STREAMS",
  "SYSTEM_METRICS",
  "NEURAL_MAP",
  "APP DEVELOPMENT",
  "UI/UX Wireframes",
  "Database Schema",
  "ACOUSTIC RESONANCE MATRIX",
  "THE SUBJECTIVITY OF SOUND"
];

interface ThreeDCanvasViewportProps {
  highlightedLabel?: string | null;
}

export function ThreeDCanvasViewport({ highlightedLabel }: ThreeDCanvasViewportProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const nodesRef = useRef<Node[]>([]);
  const edgesRef = useRef<Edge[]>([]);

  useEffect(() => {
    const generateNodes = (count: number): Node[] => {
      const nodes: Node[] = [];
      const usedLabels = new Set<string>();

      for (let i = 0; i < count; i++) {
        const isMain = Math.random() > 0.85;
        const hasLabel = isMain || Math.random() > 0.7;
        let labelStr;

        if (hasLabel) {
          // Try to get a unique label
          const availableLabels = LABELS.filter(l => !usedLabels.has(l));
          if (availableLabels.length > 0) {
            labelStr = availableLabels[Math.floor(Math.random() * availableLabels.length)];
            usedLabels.add(labelStr);
          } else {
            labelStr = LABELS[Math.floor(Math.random() * LABELS.length)];
          }
        }
        
        let sublabels;
        if (labelStr === "APP DEVELOPMENT") {
          sublabels = ["[UI/UX Wireframes]", "[Database Schema]"];
        }

        nodes.push({
          id: i,
          x: Math.random() * window.innerWidth,
          y: Math.random() * window.innerHeight,
          size: isMain ? 12 : (Math.random() > 0.5 ? 6 : 3),
          label: labelStr,
          sublabels,
          isMain
        });
      }
      return nodes;
    };

    const generateEdges = (nodes: Node[]): Edge[] => {
      const edges: Edge[] = [];
      const maxDistance = 350;

      for (let i = 0; i < nodes.length; i++) {
        let connections = 0;
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[i].x - nodes[j].x;
          const dy = nodes[i].y - nodes[j].y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < maxDistance && connections < 3 && Math.random() > 0.6) {
            edges.push({
              from: nodes[i],
              to: nodes[j],
            });
            connections++;
          }
        }
      }
      return edges;
    };

    nodesRef.current = generateNodes(45);
    edgesRef.current = generateEdges(nodesRef.current);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let time = 0;

    const resizeCanvas = () => {
      const dpr = window.devicePixelRatio || 1;
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
      ctx.scale(dpr, dpr);
    };

    const drawGrid = () => {
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.02)';
      ctx.lineWidth = 1;
      const gridSize = 40;
      
      for (let x = 0; x < window.innerWidth; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, window.innerHeight);
        ctx.stroke();
      }
      
      for (let y = 0; y < window.innerHeight; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(window.innerWidth, y);
        ctx.stroke();
      }
    };

    const drawNetwork = () => {
      ctx.fillStyle = '#000000';
      ctx.fillRect(0, 0, window.innerWidth, window.innerHeight);
      
      drawGrid();

      const nodes = nodesRef.current;
      const edges = edgesRef.current;

      // Identify highlighted node and edges
      let highlightedNodeObj: Node | null = null;
      if (highlightedLabel) {
        highlightedNodeObj = nodes.find(n => n.label === highlightedLabel) || null;
      }

      // Draw edges
      edges.forEach((edge) => {
        const isHighlighted = highlightedNodeObj && 
                             (edge.from.id === highlightedNodeObj.id || edge.to.id === highlightedNodeObj.id);

        if (isHighlighted) {
          ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
          ctx.lineWidth = 2;
          ctx.setLineDash([]);
        } else {
          ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
          ctx.lineWidth = edge.from.isMain || edge.to.isMain ? 1 : 0.5;
          
          if (Math.random() > 0.8) {
            ctx.setLineDash([2, 4]);
          } else {
            ctx.setLineDash([]);
          }
        }

        ctx.beginPath();
        ctx.moveTo(edge.from.x + Math.sin(time * 0.001 + edge.from.id) * 0.5, edge.from.y + Math.cos(time * 0.001 + edge.from.id) * 0.5);
        ctx.lineTo(edge.to.x + Math.sin(time * 0.001 + edge.to.id) * 0.5, edge.to.y + Math.cos(time * 0.001 + edge.to.id) * 0.5);
        ctx.stroke();
      });

      ctx.setLineDash([]);

      // Draw nodes
      nodes.forEach((node) => {
        // Subtle drift animation
        const driftX = Math.sin(time * 0.001 + node.id) * 0.5;
        const driftY = Math.cos(time * 0.001 + node.id) * 0.5;
        const nx = node.x + driftX;
        const ny = node.y + driftY;

        const isHighlightedNode = highlightedNodeObj?.id === node.id;
        const isConnectedNode = highlightedNodeObj && edges.some(e => 
          (e.from.id === highlightedNodeObj!.id && e.to.id === node.id) || 
          (e.to.id === highlightedNodeObj!.id && e.from.id === node.id)
        );

        // Glowing effect
        if (isHighlightedNode) {
          ctx.shadowBlur = 40;
          ctx.shadowColor = 'rgba(255, 255, 255, 1)';
          ctx.fillStyle = '#ffffff';
        } else if (isConnectedNode) {
          ctx.shadowBlur = 20;
          ctx.shadowColor = 'rgba(255, 255, 255, 0.6)';
          ctx.fillStyle = '#eeeeee';
        } else if (node.isMain) {
          ctx.shadowBlur = 20;
          ctx.shadowColor = 'rgba(255, 255, 255, 0.8)';
          ctx.fillStyle = '#ffffff';
        } else {
          ctx.shadowBlur = 10;
          ctx.shadowColor = 'rgba(255, 255, 255, 0.4)';
          ctx.fillStyle = '#aaaaaa';
        }

        // Draw square
        const sizeMultiplier = isHighlightedNode ? 2 : (isConnectedNode ? 1.5 : 1);
        const currentSize = node.size * sizeMultiplier;
        const halfSize = currentSize / 2;
        ctx.fillRect(nx - halfSize, ny - halfSize, currentSize, currentSize);
        
        // Reset shadow for text
        ctx.shadowBlur = 0;

        // Draw label
        if (node.label) {
          if (isHighlightedNode) {
            ctx.fillStyle = '#ffffff';
            ctx.font = 'bold 16px "Syncopate", sans-serif';
          } else if (isConnectedNode) {
             ctx.fillStyle = '#dddddd';
             ctx.font = node.isMain ? 'bold 14px "Syncopate", sans-serif' : '10px "Share Tech Mono", monospace';
          } else {
            ctx.fillStyle = node.isMain ? '#ffffff' : '#888888';
            ctx.font = node.isMain ? 'bold 14px "Syncopate", sans-serif' : '10px "Share Tech Mono", monospace';
          }
          
          ctx.textAlign = 'center';
          ctx.textBaseline = 'top';
          ctx.letterSpacing = '2px';
          ctx.fillText(`[${node.label}]`, nx, ny + currentSize + 8);

          if (node.sublabels) {
            ctx.fillStyle = isHighlightedNode ? '#aaaaaa' : '#666666';
            ctx.font = '8px "Share Tech Mono", monospace';
            node.sublabels.forEach((sub, i) => {
              ctx.fillText(sub, nx, ny + currentSize + 24 + (i * 12));
            });
          }
        }
      });
    };

    const animate = () => {
      time++;
      drawNetwork();
      animationFrameId = requestAnimationFrame(animate);
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    animate();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      cancelAnimationFrame(animationFrameId);
    };
  }, [highlightedLabel]);

  return (
    <div className="fixed inset-0 w-full h-full bg-black z-0">
      <canvas
        ref={canvasRef}
        className="w-full h-full block"
        id="3D_CANVAS_VIEWPORT"
      />
      {/* Scanlines overlay */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-5"
        style={{
          backgroundImage: 'linear-gradient(transparent 50%, rgba(255,255,255,1) 50%)',
          backgroundSize: '100% 4px',
        }}
      />
    </div>
  );
}