import React, { useEffect, useRef, useState } from 'react';

interface Node {
  x: number;
  y: number;
  z: number;
  type: string;
  speedX: number;
  speedY: number;
  id: string;
  title: string;
}

export const Layer0: React.FC<{ 
  isZenMode?: boolean; 
  filter?: string;
  onNodeClick?: (nodeId: string) => void;
  onNodeInspect?: (node: Node) => void;
}> = ({ isZenMode, filter, onNodeClick, onNodeInspect }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [nodes, setNodes] = useState<Node[]>([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = window.innerWidth;
    let height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;

    // Create regular nodes
    const regularNodes = Array.from({ length: 150 }).map((_, i) => ({
      x: Math.random() * width,
      y: Math.random() * height,
      z: Math.random() * 2,
      type: ['Thought', 'Task', 'Event', 'List', 'Document'][Math.floor(Math.random() * 5)],
      speedX: (Math.random() - 0.5) * 0.2,
      speedY: (Math.random() - 0.5) * 0.2,
      id: `NODE_${i.toString(16).toUpperCase().padStart(4, '0')}`,
      title: ['System Diagnostic', 'Proxy Router', 'Neural Link', 'Cache Fragment', 'Memory Block'][Math.floor(Math.random() * 5)]
    }));

    // Add a special dummy node in the center
    const dummyNode: Node = {
      x: width / 2,
      y: height / 2,
      z: 3,
      type: 'Event',
      speedX: 0,
      speedY: 0,
      id: 'NODE_7A-X',
      title: 'CENTRAL_CORE_DIAGNOSTIC'
    };

    const allNodes = [...regularNodes, dummyNode];
    setNodes(allNodes);

    let animationId: number;

    const render = () => {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
      ctx.fillRect(0, 0, width, height);

      allNodes.forEach((node) => {
        // Only move non-dummy nodes
        if (node.id !== 'NODE_7A-X') {
          node.x += node.speedX;
          node.y += node.speedY;

          if (node.x < 0 || node.x > width) node.speedX *= -1;
          if (node.y < 0 || node.y > height) node.speedY *= -1;
        }

        // Dim if filter doesn't match
        const isMatch = !filter || filter === 'All' || filter === node.type;
        const isDummy = node.id === 'NODE_7A-X';
        const opacity = isMatch ? (isZenMode ? 0.8 : (isDummy ? 0.7 : 0.4)) : 0.1;
        
        // Special styling for dummy node
        if (isDummy) {
          // Pulsing glow effect for center node
          const pulse = Math.sin(Date.now() * 0.003) * 0.2 + 0.8;
          ctx.shadowBlur = 20;
          ctx.shadowColor = `rgba(255, 255, 255, ${pulse * 0.5})`;
        }
        
        ctx.fillStyle = `rgba(255, 255, 255, ${opacity})`;
        ctx.beginPath();
        const size = isMatch ? node.z * 1.5 : node.z * 0.5;
        ctx.arc(node.x, node.y, size, 0, Math.PI * 2);
        ctx.fill();
        
        // Reset shadow
        ctx.shadowBlur = 0;

        // Draw connections if close (simplified 3D network effect)
        allNodes.forEach((other) => {
          const dx = node.x - other.x;
          const dy = node.y - other.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 80 && isMatch && (!filter || filter === 'All' || filter === other.type)) {
            ctx.strokeStyle = `rgba(255, 255, 255, ${opacity * 0.3})`;
            ctx.lineWidth = 0.5;
            ctx.beginPath();
            ctx.moveTo(node.x, node.y);
            ctx.lineTo(other.x, other.y);
            ctx.stroke();
          }
        });
      });

      animationId = requestAnimationFrame(render);
    };

    render();

    const handleResize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;
      
      // Reposition dummy node to center
      const dummy = allNodes.find(n => n.id === 'NODE_7A-X');
      if (dummy) {
        dummy.x = width / 2;
        dummy.y = height / 2;
      }
    };

    const handleClick = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const clickY = e.clientY - rect.top;

      // Find clicked node
      for (const node of allNodes) {
        const dx = clickX - node.x;
        const dy = clickY - node.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const size = node.z * 1.5;
        
        if (dist < size + 5) { // 5px tolerance
          if (onNodeClick) {
            onNodeClick(node.id);
          }
          if (onNodeInspect) {
            onNodeInspect(node);
          }
          break;
        }
      }
    };

    canvas.addEventListener('click', handleClick);
    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
      canvas.removeEventListener('click', handleClick);
      cancelAnimationFrame(animationId);
    };
  }, [isZenMode, filter, onNodeClick, onNodeInspect]);

  return (
    <canvas 
      ref={canvasRef} 
      className="absolute inset-0 z-0 cursor-pointer transition-transform duration-[2s]"
      style={{ transform: isZenMode ? 'scale(1.05)' : 'scale(1)' }}
    />
  );
};