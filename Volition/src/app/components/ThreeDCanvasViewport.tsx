import React from 'react';
import { useEffect, useState, useRef, useCallback } from 'react';
import ForceGraph3D from 'react-force-graph-3d';
import { Surreal, Table } from 'surrealdb';
import SpriteText from 'three-spritetext';
import * as THREE from 'three';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';

const db = new Surreal();
const isMobile = typeof window !== 'undefined' && window.innerWidth <= 768;

const sharedGeometries = {
  topic: new THREE.BoxGeometry(4, 4, 4),
  task: new THREE.OctahedronGeometry(2.5),
  document: new THREE.OctahedronGeometry(2).scale(1, 2, 1)
};

const sharedMaterials = {
  topic: new THREE.MeshPhongMaterial({ color: '#888888', specular: 0xffffff, shininess: 100, transparent: true, opacity: 0.9 }),
  document: new THREE.MeshPhongMaterial({ color: '#666666', specular: 0xffffff, shininess: 100, transparent: true, opacity: 0.9 }),
  task: new THREE.MeshPhongMaterial({ color: '#444444', specular: 0xffffff, shininess: 100, transparent: true, opacity: 0.9 }),
  hover: new THREE.MeshPhongMaterial({ color: '#ffffff', specular: 0xffffff, shininess: 100, transparent: true, opacity: 1.0 }),
  dimmed: new THREE.MeshPhongMaterial({ color: '#222222', specular: 0x444444, shininess: 10, transparent: true, opacity: 0.05 })
};

interface ThreeDCanvasViewportProps {
  highlightedLabel?: string | null;
  isZenMode?: boolean;
  filter?: string;
  onNodeClick?: (nodeId: string) => void;
  onNodeInspect?: (node: any) => void;
  onClearSelection?: () => void;
}

export function ThreeDCanvasViewport({ highlightedLabel, filter, onNodeClick, onNodeInspect, onClearSelection }: ThreeDCanvasViewportProps) {
  const fgRef = useRef<any>(null);
  const [graphData, setGraphData] = useState<{ nodes: any[]; links: any[] }>({ nodes: [], links: [] });
  const graphDataRef = useRef<{ nodes: any[]; links: any[] }>({ nodes: [], links: [] });
  
  // OPTIMIZATION: We no longer trigger full React re-renders for node hovers!
  const [highlightLinks, setHighlightLinks] = useState(new Set());

  // FORCE FULL SCREEN SIZING
  const [dimensions, setDimensions] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 1200,
    height: typeof window !== 'undefined' ? window.innerHeight : 800
  });

  useEffect(() => {
    const handleResize = () => {
      setDimensions({ width: window.innerWidth, height: window.innerHeight });
    };
    window.addEventListener('resize', handleResize);
    // Force a read on mount just in case
    handleResize();
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    async function fetchGraphData() {
      try {
        await db.connect(`http://${window.location.hostname}:8000/rpc`);
        await db.signin({ username: 'root', password: 'root' });
        await db.use({ namespace: 'neurograph', database: 'zettelkasten' });

        const topics = (await db.select(new Table('topic'))) as any[];
        const documents = (await db.select(new Table('document'))) as any[];
        const tasks = (await db.select(new Table('task'))) as any[];
        const relatesTo = (await db.select(new Table('relates_to'))) as any[];
        const references = (await db.select(new Table('references'))) as any[];

        const createNodeData = (node: any, groupName: string, colorHex: string) => ({
          id: String(node.id),
          name: node.name || node.title,
          group: groupName,
          color: colorHex,
          neighbors: [],
          links: [],
          connectionCount: 1,
          rotX: Math.random() * Math.PI,
          rotY: Math.random() * Math.PI,
          rotZ: Math.random() * Math.PI,
          rotSpeedX: (Math.random() - 0.5) * 0.01,
          rotSpeedY: (Math.random() - 0.5) * 0.01,
          rotSpeedZ: (Math.random() - 0.5) * 0.01
        });

        const formattedNodes: any[] = [
          ...topics.map(t => createNodeData(t, 'topic', '#888888')),
          ...documents.map(d => createNodeData(d, 'document', '#666666')),
          ...tasks.map(t => createNodeData(t, 'task', '#444444'))
        ];

        const formattedLinks = [
          ...relatesTo.map(r => ({ source: String(r.in), target: String(r.out) })),
          ...references.map(r => ({ source: String(r.in), target: String(r.out) }))
        ];

        formattedLinks.forEach((link: any) => {
          const a = formattedNodes.find(n => n.id === link.source);
          const b = formattedNodes.find(n => n.id === link.target);
          if (a && b) {
            a.neighbors.push(b.id);
            b.neighbors.push(a.id);
            a.links.push(link);
            b.links.push(link);
            a.connectionCount++;
            b.connectionCount++;
          }
        });

        setGraphData({ nodes: formattedNodes, links: formattedLinks });
        graphDataRef.current = { nodes: formattedNodes, links: formattedLinks };
      } catch (err) {
        console.error("Failed to fetch graph data:", err);
      }
    }
    fetchGraphData();
    return () => { db.close(); };
  }, []);

  // --- CONTINUOUS ANIMATION ENGINE ---
  useEffect(() => {
    let animationFrameId: number;
    const animate = () => {
      const nodes = graphDataRef.current.nodes;
      nodes.forEach((node: any) => {
        // OPTIMIZATION: Instant GPU rotation without traversing the scene graph
        if (node.__customMesh) {
          node.rotX += node.rotSpeedX;
          node.rotY += node.rotSpeedY;
          node.rotZ += node.rotSpeedZ;
          node.__customMesh.rotation.set(node.rotX, node.rotY, node.rotZ);
        }
      });
      animationFrameId = requestAnimationFrame(animate);
    };
    animate();
    return () => cancelAnimationFrame(animationFrameId);
  }, []);

  // --- AUTO-LOCK CAMERA ---
  useEffect(() => {
    if (fgRef.current) {
      const controls = fgRef.current.controls();
      const isLocked = !!highlightedLabel;
      if ('enableRotate' in controls) {
        controls.enableRotate = !isLocked;
        controls.enableZoom = !isLocked;
        controls.enablePan = !isLocked;
      }
    }
  }, [highlightedLabel]);

  // --- OPTIMIZATION: MEMOIZED NODE BUILDER ---
  // Only rebuilds nodes if the Search Bar or Layer Filter changes. 
  // It completely ignores hovers, saving massive CPU power.
  const customNodeThreeObject = useCallback((node: any) => {
    const isSearched = highlightedLabel === String(node.id); 
    const isFiltering = filter && filter !== 'All' && filter !== 'ALL_NODES';
    let matchesFilter = false;
    
    if (isFiltering) {
      const f = filter.toUpperCase();
      const g = node.group.toLowerCase();
      if (f === 'THOUGHT' && g === 'topic') matchesFilter = true;
      if (f === 'TASK' && g === 'task') matchesFilter = true;
      if (f === 'DOCUMENT' && g === 'document') matchesFilter = true;
    }

    const isDimmed = (isFiltering && !matchesFilter) || (!isSearched && highlightedLabel);
    
    let material;
    if (isSearched) {
      material = sharedMaterials.hover;
    } else if (isFiltering) {
      material = matchesFilter ? sharedMaterials.hover : sharedMaterials.dimmed;
    } else if (isDimmed) {
      material = sharedMaterials.dimmed;
    } else {
      material = sharedMaterials[node.group as keyof typeof sharedMaterials] || sharedMaterials.topic;
    }
    
    const group = new THREE.Group();
    const geometry = sharedGeometries[node.group as keyof typeof sharedGeometries] || sharedGeometries.topic;
    const mesh = new THREE.Mesh(geometry, material);
    
    const scaleMultiplier = (isSearched || (isFiltering && matchesFilter)) ? 1.5 : 1; 
    const scale = (1 + ((node.connectionCount - 1) * 0.15)) * scaleMultiplier; 
    mesh.scale.set(scale, scale, scale);
    mesh.rotation.set(node.rotX, node.rotY, node.rotZ);
    group.add(mesh);

    const showText = isMobile ? isSearched : (!isDimmed || isSearched || (isFiltering && matchesFilter));
    
    const sprite = new SpriteText(`[ ${node.name} ]`);
    sprite.color = (isSearched || (isFiltering && matchesFilter)) ? '#ffffff' : '#aaaaaa';
    sprite.textHeight = isSearched ? 5 : 2.5;
    sprite.fontFace = 'monospace';
    sprite.fontWeight = isSearched ? 'bold' : 'normal';
    (sprite as any).position.y = -6; 
    (sprite as any).visible = !!showText; // Always created, but hidden when not needed!
    group.add(sprite);

    // CACHE DIRECT GPU REFERENCES FOR INSTANT MUTATION
    node.__customMesh = mesh;
    node.__customSprite = sprite;
    node.__baseMaterial = material;
    node.__baseSpriteColor = sprite.color;
    node.__baseSpriteSize = sprite.textHeight;
    node.__baseSpriteWeight = sprite.fontWeight;
    node.__baseSpriteVisible = sprite.visible;

    return group;
  }, [filter, highlightedLabel]);

  // --- OPTIMIZATION: DIRECT GPU MUTATION FOR HOVERS ---
  // Changes colors instantly via WebGL, zero React lag.
  const handleNodeHover = useCallback((node: any) => {
    const highlightNodeIds = new Set(node ? [node.id, ...node.neighbors] : []);
    
    graphDataRef.current.nodes.forEach((n: any) => {
        const isHighlighted = highlightNodeIds.has(n.id);
        const isHovered = node && n.id === node.id;
        const shouldDim = node ? !isHighlighted : false;

        // 1. Mutate the Shape
        if (n.__customMesh) {
            if (isHovered || isHighlighted) {
                n.__customMesh.material = sharedMaterials.hover;
            } else if (shouldDim) {
                n.__customMesh.material = sharedMaterials.dimmed;
            } else {
                n.__customMesh.material = n.__baseMaterial;
            }
        }

        // 2. Mutate the Text
        if (n.__customSprite) {
            if (isHovered) {
                n.__customSprite.color = '#ffffff';
                n.__customSprite.textHeight = 5;
                n.__customSprite.fontWeight = 'bold';
                n.__customSprite.visible = true; 
            } else if (isHighlighted) {
                n.__customSprite.color = '#ffffff';
                n.__customSprite.textHeight = 4;
                n.__customSprite.fontWeight = 'bold';
                n.__customSprite.visible = true; 
            } else if (shouldDim) {
                n.__customSprite.color = '#333333'; 
                n.__customSprite.textHeight = n.__baseSpriteSize;
                n.__customSprite.fontWeight = n.__baseSpriteWeight;
                n.__customSprite.visible = n.__baseSpriteVisible; 
            } else {
                n.__customSprite.color = n.__baseSpriteColor;
                n.__customSprite.textHeight = n.__baseSpriteSize;
                n.__customSprite.fontWeight = n.__baseSpriteWeight;
                n.__customSprite.visible = n.__baseSpriteVisible;
            }
        }
    });

    // Update Links (Cheap to do via React state)
    setHighlightLinks(new Set(node ? node.links : []));
  }, []);


  return (
    <div className="fixed inset-0 w-full h-full bg-black z-0 overflow-hidden">
      <ForceGraph3D
        ref={fgRef}
        width={dimensions.width}
        height={dimensions.height}
        graphData={graphData}
        
        backgroundColor="#000000"
        nodeLabel={() => ''} 
        cooldownTicks={150} 
        
        // Pass the hyper-optimized builder
        nodeThreeObject={customNodeThreeObject}

        linkColor={(link: any) => highlightLinks.has(link) ? '#ffffff' : '#666666'}
        linkOpacity={0.15}
        linkWidth={(link: any) => highlightLinks.has(link) ? 2 : 1}
        warmupTicks={50} 
        linkDirectionalParticles={(link: any) => highlightLinks.has(link) ? 4 : 1}
        
        onEngineStop={() => {
          if (fgRef.current) {
            fgRef.current.d3Force('charge').strength(-400);
            fgRef.current.d3Force('link').distance(80);
            fgRef.current.controls().panSpeed = 0.2; 
            const scene = fgRef.current.scene();
            if (!scene.getObjectByName('cyberpunkKeyLight')) {
              const keyLight = new THREE.DirectionalLight(0xaaaaaa, 0.5);
              keyLight.name = 'cyberpunkKeyLight';
              keyLight.position.set(200, 300, 100);
              scene.add(keyLight);
              const fillLight = new THREE.AmbientLight(0x222244, 1.5);
              fillLight.name = 'cyberpunkFillLight';
              scene.add(fillLight);
            }
            if (!isMobile && fgRef.current && !fgRef.current.bloomAdded) {
              const bloomPass = new UnrealBloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight), 0.3, 0.1, 0.9);
              fgRef.current.postProcessingComposer().addPass(bloomPass);
              fgRef.current.bloomAdded = true;
            }
          }
        }}
        showNavInfo={false}

        // Fire the Direct GPU mutator on hover
        onNodeHover={handleNodeHover}

        onNodeClick={(node: any) => {
          if (onNodeClick) onNodeClick(String(node.id));
          if (onNodeInspect) onNodeInspect(node);
          if (fgRef.current) {
            const camPos = fgRef.current.camera().position;
            const dx = camPos.x - node.x;
            const dy = camPos.y - node.y;
            const dz = camPos.z - node.z;
            const currentDist = Math.hypot(dx, dy, dz) || 1;
            const targetDist = 60; 
            const newPos = {
              x: node.x + (dx / currentDist) * targetDist,
              y: node.y + (dy / currentDist) * targetDist,
              z: node.z + (dz / currentDist) * targetDist
            };
            const currentLookAt = fgRef.current.controls().target;
            fgRef.current.cameraPosition(newPos, currentLookAt, 1000);
          }
        }}
        
        onBackgroundClick={() => {
          if (onClearSelection) onClearSelection();
          if (fgRef.current) {
            const camPos = fgRef.current.camera().position;
            const currentDist = Math.hypot(camPos.x, camPos.y, camPos.z) || 1;
            const targetDist = 250; 
            const newPos = {
              x: (camPos.x / currentDist) * targetDist,
              y: (camPos.y / currentDist) * targetDist,
              z: (camPos.z / currentDist) * targetDist
            };
            const currentLookAt = fgRef.current.controls().target;
            fgRef.current.cameraPosition(newPos, currentLookAt, 1000);
            
            // Clear hover highlight instantly
            handleNodeHover(null);
          }
        }}
      />
    </div>
  );
}