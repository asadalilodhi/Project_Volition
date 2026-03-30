import { useEffect, useState, useRef } from 'react';
import ForceGraph3D from 'react-force-graph-3d';
import { Surreal, Table } from 'surrealdb';
import SpriteText from 'three-spritetext'; // The new 3D text engine!

const db = new Surreal();

interface ThreeDCanvasViewportProps {
  highlightedLabel?: string | null;
}

export function ThreeDCanvasViewport({ highlightedLabel }: ThreeDCanvasViewportProps) {
  if (highlightedLabel) console.log("Hovering over:", highlightedLabel);

  const fgRef = useRef<any>(null); // Grabs control of the 3D camera
  const [graphData, setGraphData] = useState<{ nodes: any[]; links: any[] }>({ nodes: [], links: [] });
  const [hoverNode, setHoverNode] = useState<any | null>(null); // Tracks your mouse

  useEffect(() => {
    async function fetchGraphData() {
      try {
        await db.connect('http://127.0.0.1:8000/rpc');
        await db.signin({ username: 'root', password: 'root' });
        await db.use({ namespace: 'neurograph', database: 'zettelkasten' });

        const topics = (await db.select(new Table('topic'))) as any[];
        const documents = (await db.select(new Table('document'))) as any[];
        const tasks = (await db.select(new Table('task'))) as any[];

        const relatesTo = (await db.select(new Table('relates_to'))) as any[];
        const references = (await db.select(new Table('references'))) as any[];

        const formattedNodes = [
          ...topics.map(t => ({ id: String(t.id), name: t.name, group: 'topic', color: '#888888' })),
          ...documents.map(d => ({ id: String(d.id), name: d.title, group: 'document', color: '#cccccc' })),
          ...tasks.map(t => ({ id: String(t.id), name: t.title, group: 'task', color: '#555555' }))
        ];

        const formattedLinks = [
          ...relatesTo.map(r => ({ source: String(r.in), target: String(r.out) })),
          ...references.map(r => ({ source: String(r.in), target: String(r.out) }))
        ];

        setGraphData({ nodes: formattedNodes, links: formattedLinks });
      } catch (err) {
        console.error("Failed to fetch graph data from SurrealDB:", err);
      }
    }

    fetchGraphData();

    return () => {
      db.close();
    };
  }, []);

  return (
    <div className="fixed inset-0 w-full h-full bg-black z-0 overflow-hidden">
      <ForceGraph3D
        ref={fgRef}
        graphData={graphData}
        backgroundColor="#000000"

        nodeLabel={() => ''}
        
        // --- 1. THE 3D TEXT LABELS & HOVER STATE ---
        nodeThreeObject={(node: any) => {
          const isHovered = node.id === hoverNode?.id;
          const sprite = new SpriteText(`[ ${node.name} ]`);
          sprite.color = isHovered ? '#ffffff' : node.color; // Glows white on hover
          sprite.textHeight = isHovered ? 6.4 : 4; // Gets bigger on hover
          sprite.fontFace = 'monospace';
          sprite.fontWeight = isHovered ? 'bold' : 'normal';
          return sprite;
        }}
        onNodeHover={setHoverNode} // Updates state when your mouse touches a node

        // --- 2. CYBERPUNK DATA CONNECTIONS ---
        linkColor={() => 'rgba(255, 255, 255, 0.15)'}
        linkWidth={1}
        linkDirectionalParticles={2} // Adds moving light packets
        linkDirectionalParticleWidth={1.5}
        linkDirectionalParticleSpeed={0.01}

        // --- 3. FIXING THE CRAZY CAMERA ---
        onEngineStop={() => {
          if (fgRef.current) {
            // Reduces the right-click panning speed by 80%
            fgRef.current.controls().panSpeed = 0.2; 
          }
        }}
        
        showNavInfo={false}
      />

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