import { useState, useRef, useEffect } from 'react';
import { Send } from 'lucide-react';
import { FloatingHUD } from '../components/FloatingHUD';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

interface Message {
  id: string;
  sender: 'user' | 'volition';
  content: string;
  timestamp: Date;
}

// =========================================================================
// ISOLATED 3D VIEWER: Will not crash React if the model fails to load.
// It simply looks for '/Volition.glb' in your public folder.
// =========================================================================
const VolitionHologram = () => {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mountRef.current) return;

    // 1. Setup Scene & Camera
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, mountRef.current.clientWidth / mountRef.current.clientHeight, 0.1, 1000);
    camera.position.z = 5;

    // 2. Setup Renderer (Transparent background!)
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    mountRef.current.appendChild(renderer.domElement);

    // 3. Volition Lighting & Atmosphere (The "Smokey Haze")
    // Deep, desaturated midnight-slate fog for that infinite smokey void
    scene.fog = new THREE.FogExp2(0x050811, 0.18); 

    // Muted, dark slate-blue ambient light (absorbs into the dusty shadows)
    const ambientLight = new THREE.AmbientLight(0x0a111c, 1.5); 
    scene.add(ambientLight);
    
    // Softer white light from above to illuminate the "dusty white" without blinding glare
    const keyLight = new THREE.DirectionalLight(0xddeeff, 2.0); 
    keyLight.position.set(3, 5, 4); 
    scene.add(keyLight);
    
    // Deep, smokey navy blue light (NOT vibrant neon) to fill the back shadows
    const rimLight = new THREE.DirectionalLight(0x162544, 4.0); 
    rimLight.position.set(-5, -2, -3); 
    scene.add(rimLight);

    // 4. Load the Model Safely & Force Materials
    let model: THREE.Group;
    const loader = new GLTFLoader();
    loader.load(
      '/Volition.glb',
      (gltf) => {
        model = gltf.scene;
        
        // OVERRIDE MATERIALS: Dusty White core with smokey blue shadow catching
        model.traverse((child: any) => {
          if (child.isMesh) {
            child.material = new THREE.MeshStandardMaterial({
              color: 0xc8ccce, // Dusty, slightly cool off-white/bone color
              roughness: 0.85, // Very high roughness = dusty, matte, painted surface
              metalness: 0.1,  // Low metalness so it looks like plaster/bone instead of chrome
            });
          }
        });
        
        // Auto-scale and center the model
        const box = new THREE.Box3().setFromObject(model);
        const center = box.getCenter(new THREE.Vector3());
        const size = box.getSize(new THREE.Vector3());
        
        const maxDim = Math.max(size.x, size.y, size.z);
        const scale = 4.3 / maxDim; 
        model.scale.set(scale, scale, scale);
        model.position.sub(center.multiplyScalar(scale)); // Center it
        
        scene.add(model);
      },
      undefined,
      (error) => console.error("Model failed to load, but the app survives:", error)
    );

    // 5. Animation Loop (Slow eerie spin + floating)
    let reqId: number;
    const animate = () => {
      reqId = requestAnimationFrame(animate);
      if (model) {
        model.rotation.y += 0.003; 
        // FIXED POSITION: Added -2.5 to push the model down so the neck is at the bottom
        // model.position.y = (Math.sin(Date.now() * 0.001) * 0.1) - 2.5;
      }
      renderer.render(scene, camera);
    };
    animate();

    // 6. Handle Browser Resize
    const handleResize = () => {
      if (!mountRef.current) return;
      const width = mountRef.current.clientWidth;
      const height = mountRef.current.clientHeight;
      renderer.setSize(width, height);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
    };
    window.addEventListener('resize', handleResize);

    // 7. Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(reqId);
      renderer.dispose();
      if (mountRef.current && renderer.domElement) {
        mountRef.current.removeChild(renderer.domElement);
      }
    };
  }, []);

  return <div ref={mountRef} className="w-full h-full cursor-move" />;
};


export function VolitionScreen() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      sender: 'volition',
      content: 'VOLITION ONLINE. I exist to reflect on your choices, your resolve, and the weight of consequence. What burdens your conscience?',
      timestamp: new Date(Date.now() - 300000)
    },
    {
      id: '2',
      sender: 'user',
      content: 'I need to make a decision about the upcoming project deadline.',
      timestamp: new Date(Date.now() - 240000)
    },
    {
      id: '3',
      sender: 'volition',
      content: 'Deadlines are constructs. But they reveal truth—your priorities, your fears, your discipline. Tell me: what prevents you from acting?',
      timestamp: new Date(Date.now() - 180000)
    },
  ]);

  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = () => {
    if (inputValue.trim() === '') return;

    const newUserMessage: Message = {
      id: Date.now().toString(),
      sender: 'user',
      content: inputValue.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, newUserMessage]);
    setInputValue('');
    setIsTyping(true);

    // Simulate AI response
    setTimeout(() => {
      const responses = [
        'I see the weight of that choice. What does your instinct tell you?',
        'Reflect deeper. What are you truly avoiding?',
        'That\'s the voice of duty speaking. But is it aligned with your values?',
        'Consider the long-term consequence. Not just the immediate relief.',
        'You already know the answer. You\'re seeking permission to act on it.',
      ];

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        sender: 'volition',
        content: responses[Math.floor(Math.random() * responses.length)],
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, aiMessage]);
      setIsTyping(false);
    }, 2000);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="relative w-full h-screen overflow-hidden bg-black text-white pt-14">
      {/* Left Area: Hologram Container (70%) */}
      <div className="absolute left-0 top-14 h-[calc(100vh-56px)] w-[calc(100%-320px)] flex items-center justify-center">
        <div className="w-[90%] h-[95%] flex items-center justify-center relative">
          {/* Subtle glowing backdrop for the model */}
          <div className="absolute w-[60%] h-[60%] bg-blue-500/5 blur-[120px] rounded-full pointer-events-none" />
          
          {/* 3D Model Injector */}
          <VolitionHologram />
        </div>
      </div>

      {/* Right Panel: Volition Chat Interface (30%) */}
      <div 
        className="fixed right-0 top-14 h-[calc(100vh-56px)] w-[320px] z-20 bg-black/80 backdrop-blur-xl border-l border-white/10 flex flex-col"
        style={{
          boxShadow: '-4px 0 32px 0 rgba(0, 0, 0, 0.5), inset 1px 0 0 0 rgba(255, 255, 255, 0.05)',
        }}
      >
        {/* Header */}
        <div className="p-6 pb-4 border-b border-white/10 shrink-0">
          <h2 className="text-white font-['Syncopate'] text-xs font-bold tracking-[0.3em] mb-2">
            VOLITION
          </h2>
          <div className="text-white/40 text-[10px] tracking-widest font-['Share_Tech_Mono'] uppercase">
            CONSCIENCE_INTERFACE // ACTIVE
          </div>
        </div>

        {/* Message History - Scrollable */}
        <div 
          ref={chatContainerRef}
          className="flex-1 overflow-y-auto px-6 py-4 space-y-4 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent"
        >
          {messages.map((message) => (
            <div key={message.id} className={`flex flex-col gap-1 ${message.sender === 'user' ? 'items-end' : 'items-start'}`}>
              {/* Sender Label */}
              <div className="font-['Share_Tech_Mono'] text-[9px] tracking-widest text-white/30 uppercase">
                {message.sender === 'user' ? 'USER' : 'VOLITION'}
              </div>
              
              {/* Message Bubble */}
              <div 
                className={`max-w-[85%] p-3 border ${
                  message.sender === 'user' 
                    ? 'bg-white/5 border-white/20 text-white/90' 
                    : 'bg-black/60 border-white/10 text-white/70'
                }`}
              >
                <p className="text-xs leading-relaxed">
                  {message.content}
                </p>
              </div>

              {/* Timestamp */}
              <div className="font-['Share_Tech_Mono'] text-[8px] text-white/20 tracking-wider">
                {message.timestamp.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
          ))}

          {/* Typing Indicator */}
          {isTyping && (
            <div className="flex flex-col gap-1 items-start">
              <div className="font-['Share_Tech_Mono'] text-[9px] tracking-widest text-white/30 uppercase">
                VOLITION
              </div>
              <div className="bg-black/60 border border-white/10 p-3">
                <div className="flex gap-1">
                  <div className="w-1.5 h-1.5 bg-white/40 rounded-full animate-pulse" style={{ animationDelay: '0ms' }} />
                  <div className="w-1.5 h-1.5 bg-white/40 rounded-full animate-pulse" style={{ animationDelay: '150ms' }} />
                  <div className="w-1.5 h-1.5 bg-white/40 rounded-full animate-pulse" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-6 pt-4 border-t border-white/10 shrink-0">
          <div className="flex gap-2">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="SPEAK YOUR MIND..."
              className="flex-1 bg-white/5 border border-white/20 px-3 py-2.5 text-xs text-white placeholder:text-white/30 outline-none focus:border-white/40 focus:bg-white/10 transition-colors font-['Share_Tech_Mono'] tracking-wider"
            />
            <button
              onClick={handleSendMessage}
              disabled={inputValue.trim() === ''}
              className="px-4 py-2.5 bg-white/10 border border-white/20 hover:bg-white/20 hover:border-white/40 disabled:opacity-30 disabled:cursor-not-allowed transition-all flex items-center justify-center"
            >
              <Send className="w-4 h-4 text-white" />
            </button>
          </div>
          
          <div className="mt-2 text-[8px] text-white/20 tracking-widest font-['Share_Tech_Mono'] text-center">
            PRESS ENTER TO SEND
          </div>
        </div>
      </div>

      {/* Bottom HUD - Preserved */}
      <FloatingHUD value={inputValue} onChange={setInputValue} />

      {/* Scanline Overlay */}
      <div className="absolute inset-0 pointer-events-none z-[100] mix-blend-overlay opacity-10 bg-[linear-gradient(rgba(0,0,0,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,255,255,0.02),rgba(255,255,255,0.01),rgba(255,255,255,0.02))] bg-[length:100%_4px,3px_100%]" />
    </div>
  );
}