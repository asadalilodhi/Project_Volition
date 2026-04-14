import { useState } from 'react';
import { Link } from 'react-router';
import { Activity } from 'lucide-react';

interface Task {
  id: string;
  title: string;
  subtitle: string;
  status?: string;
  nodeLabel?: string; // Corresponds to the label in the 3D canvas
}

interface Event {
  id: string;
  time: string;
  title: string;
}

interface SidePanelProps {
  tasks?: Task[];
  events?: Event[];
  activeTaskLabel?: string | null;
  onTaskHover?: (label: string | null) => void;
}

const defaultTasks: Task[] = [
  { id: '1', title: 'UI/UX Wireframes', subtitle: 'T-Minus 02:40:00', nodeLabel: 'UI/UX Wireframes' },
  { id: '2', title: 'Database Schema', subtitle: 'PENDING SYNC', nodeLabel: 'Database Schema' },
  { id: '3', title: 'ACOUSTIC RESONANCE', subtitle: 'IN PROGRESS', nodeLabel: 'ACOUSTIC RESONANCE MATRIX' },
  { id: '4', title: 'NEURAL_CLEANUP', subtitle: 'COMPLETED', status: 'done', nodeLabel: 'NEURAL_MAP' },
];

const defaultEvents: Event[] = [
  { id: '1', time: '14:00 - 15:30', title: 'DEEP_SYNC_PROTOCOL' },
  { id: '2', time: '16:00 - 18:00', title: 'SYSTEM_MAINTENANCE' },
];

export function SidePanel({ 
  tasks = defaultTasks, 
  events = defaultEvents,
  activeTaskLabel,
  onTaskHover 
}: SidePanelProps) {
  const [clickedTaskId, setClickedTaskId] = useState<string | null>(null);

  const handleTaskClick = (task: Task) => {
    if (clickedTaskId === task.id) {
      setClickedTaskId(null);
      onTaskHover?.(null);
    } else {
      setClickedTaskId(task.id);
      onTaskHover?.(task.nodeLabel || null);
    }
  };

  const handleTaskMouseEnter = (task: Task) => {
    if (!clickedTaskId) {
      onTaskHover?.(task.nodeLabel || null);
    }
  };

  const handleTaskMouseLeave = () => {
    if (!clickedTaskId) {
      onTaskHover?.(null);
    }
  };

  return (
    <>
      {/* Volition Portrait - HANGING OUTSIDE to the left of the black panel */}
      <div className="fixed right-[320px] top-[50vh] -translate-y-1/2 z-30 flex flex-col gap-2">
        <Link
          to="/volition"
          className="group"
        >
          <div className="relative w-32 h-32 border border-white/10 overflow-hidden bg-zinc-900 flex flex-col grayscale cursor-pointer hover:grayscale-0 transition-all duration-500">
            <div 
              className="absolute inset-0 bg-cover bg-center mix-blend-luminosity opacity-60 group-hover:opacity-100 transition-opacity duration-500" 
              style={{ backgroundImage: `url('https://images.unsplash.com/photo-1729554608003-5ec8be42da1d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjeWJlcnB1bmslMjBhaSUyMGZhY2UlMjBhYnN0cmFjdCUyMGRhcmt8ZW58MXx8fHwxNzc1MDMwMjk4fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral')` }}
            />
            {/* Scanline effect overlay */}
            <div className="absolute inset-0 bg-[linear-gradient(transparent_50%,rgba(0,0,0,0.5)_50%)] bg-[length:100%_4px] pointer-events-none z-10" />
            
            <div className="mt-auto relative z-20 w-full bg-black/90 backdrop-blur-sm border-t border-white/20 text-[10px] px-2 py-1 font-bold text-white tracking-wider flex items-center justify-between">
              <span className="truncate pr-1">VOLITION</span>
              <Activity className="w-3 h-3 text-white animate-pulse shrink-0" />
            </div>
          </div>
        </Link>

        {/* Sleek button to navigate to Volition page */}
        <Link
          to="/volition"
          className="w-32 bg-black/90 backdrop-blur-md border border-white/20 hover:border-white/60 hover:bg-white/5 transition-all duration-300 py-2 px-3 cursor-pointer group"
        >
          <div className="font-['Syncopate'] text-[8px] tracking-[0.3em] text-white/80 group-hover:text-white font-bold text-center">
            ENTER
          </div>
        </Link>
      </div>

      <div 
        className="fixed right-0 top-[56px] h-[calc(100vh-56px)] w-[320px] z-20 bg-[#0a0a0a]/80 backdrop-blur-xl border-l border-[#222] flex flex-col font-['Share_Tech_Mono']"
        style={{
          boxShadow: '-4px 0 32px 0 rgba(0, 0, 0, 0.5), inset 1px 0 0 0 rgba(255, 255, 255, 0.05)',
        }}
      >
        
        {/* Header */}
        <div className="p-6 pb-8 border-b border-[#222]">
          <h2 className="text-white font-['Syncopate'] text-[10px] font-bold tracking-[0.2em] mb-1">
            STRUCTURED_DASHBOARD
          </h2>
          <div className="text-[#666] text-[9px] tracking-widest uppercase">
            SYSTEM_ACTIVE
          </div>
        </div>

        {/* Nav List */}
        <div className="flex flex-col py-4">
          <div className="flex items-center gap-4 px-6 py-3 bg-white text-black cursor-pointer">
            <div className="w-2 h-2 bg-black" />
            <span className="text-xs font-bold tracking-widest">DASHBOARD</span>
          </div>
          <div className="flex items-center gap-4 px-6 py-3 text-[#888] hover:text-white cursor-pointer transition-colors">
            <div className="w-2 h-2 border border-[#888]" />
            <span className="text-xs tracking-widest">PENDING</span>
          </div>
          <div className="flex items-center gap-4 px-6 py-3 text-[#888] hover:text-white cursor-pointer transition-colors">
            <div className="w-2 h-2 border border-[#888]" />
            <span className="text-xs tracking-widest">SCHEDULED</span>
          </div>
          <div className="flex items-center gap-4 px-6 py-3 text-[#888] hover:text-white cursor-pointer transition-colors">
            <div className="w-2 h-2 border border-[#888]" />
            <span className="text-xs tracking-widest">HISTORY</span>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {/* Tasks Section */}
          <div className="px-6 py-4">
            <div className="text-[#555] text-[9px] tracking-[0.2em] mb-4 border-b border-[#222] pb-2">
              UPCOMING TASKS
            </div>
            <div className="flex flex-col gap-1">
              {tasks.map((task) => {
                const isHovered = activeTaskLabel === task.nodeLabel && task.nodeLabel !== undefined;
                const isClicked = clickedTaskId === task.id;
                
                return (
                  <div 
                    key={task.id} 
                    onClick={() => handleTaskClick(task)}
                    onMouseEnter={() => handleTaskMouseEnter(task)}
                    onMouseLeave={handleTaskMouseLeave}
                    className={`p-3 border transition-colors cursor-pointer relative overflow-hidden ${
                      isClicked 
                        ? 'bg-[#1a1a1a] border-white' 
                        : isHovered 
                          ? 'bg-[#111] border-[#888]' 
                          : 'bg-[#111] border-[#222] hover:border-[#444]'
                    }`}
                  >
                    {/* Left accent bar for highlighted tasks */}
                    {(isClicked || isHovered) && (
                      <div className="absolute left-0 top-0 w-1 h-full bg-white" />
                    )}
                    
                    <div className={`text-xs mb-1 tracking-widest ${task.status === 'done' && !isClicked && !isHovered ? 'text-[#666]' : 'text-[#eee]'}`}>
                      {task.title}
                    </div>
                    <div className={`text-[9px] tracking-wider uppercase ${isClicked ? 'text-[#aaa]' : 'text-[#555]'}`}>
                      {task.subtitle}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Events Section */}
          <div className="px-6 py-4">
            <div className="text-[#555] text-[9px] tracking-[0.2em] mb-4 border-b border-[#222] pb-2">
              SCHEDULED EVENTS
            </div>
            <div className="flex flex-col gap-1">
              {events.map((event) => (
                <div key={event.id} className="p-3 bg-[#111] border border-[#222] hover:border-[#444] transition-colors cursor-pointer">
                  <div className="text-[9px] text-[#666] tracking-wider mb-1">
                    {event.time}
                  </div>
                  <div className="text-xs text-white tracking-widest uppercase">
                    {event.title}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </>
  );
}