import React, { useState } from 'react';
import { motion } from 'motion/react';
import { GripVertical, MoreVertical, Trash2 } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface Task {
  id: string;
  title: string;
  tasks: { id: string; title: string; completed: boolean }[];
  color?: string;
}

const COLOR_PALETTE = [
  '#FF0000', '#FF4444', '#FF8800', '#FFAA00',
  '#FFFF00', '#88FF00', '#00FF00', '#00FF88',
  '#00FFFF', '#0088FF', '#0000FF', '#8800FF',
  '#FF00FF', '#FF0088', '#FFFFFF', '#888888'
];

export const ListsWorkspace: React.FC = () => {
  const [lists, setLists] = useState<Task[]>([
    {
      id: 'l1',
      title: 'SECTOR_ALPHA_DIAGNOSTICS',
      color: '#FF0088',
      tasks: [
        { id: 'l1t1', title: 'Scan nodes in quadrant A-4', completed: true },
        { id: 'l1t2', title: 'Verify proxy routing', completed: false },
        { id: 'l1t3', title: 'Execute containment protocol', completed: false },
      ]
    },
    {
      id: 'l2',
      title: 'MAINTENANCE_SEQUENCE',
      tasks: [
        { id: 'l2t1', title: 'Flush cache layer 0', completed: false },
        { id: 'l2t2', title: 'Update system registry', completed: false },
      ]
    },
    {
      id: 'l3',
      title: 'PROXY_RELAY_CHECKLIST',
      color: '#00FFFF',
      tasks: [
        { id: 'l3t1', title: 'Verify uplink signal strength', completed: true },
        { id: 'l3t2', title: 'Route through backup nodes', completed: false },
        { id: 'l3t3', title: 'Log transmission packets', completed: false },
        { id: 'l3t4', title: 'Clear error buffer', completed: false },
      ]
    }
  ]);

  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [draggedListId, setDraggedListId] = useState<string | null>(null);

  const toggleListTaskComplete = (listId: string, taskId: string) => {
    setLists(lists.map(l => 
      l.id === listId 
        ? { ...l, tasks: l.tasks.map(t => t.id === taskId ? { ...t, completed: !t.completed } : t) }
        : l
    ));
  };

  const setListColor = (listId: string, color: string) => {
    setLists(lists.map(l => l.id === listId ? { ...l, color } : l));
    setOpenMenuId(null);
  };

  const deleteList = (listId: string) => {
    setLists(lists.filter(l => l.id !== listId));
    setOpenMenuId(null);
  };

  const handleDragEnd = (listId: string, event: any, info: any) => {
    setDraggedListId(null);
    // Find the list's current index
    const currentIndex = lists.findIndex(l => l.id === listId);
    
    // Calculate which position it should move to based on drag offset
    const movedRows = Math.round(info.offset.y / 120); // Approximate height of each list
    const newIndex = Math.max(0, Math.min(lists.length - 1, currentIndex + movedRows));
    
    if (newIndex !== currentIndex) {
      const reorderedLists = [...lists];
      const [movedList] = reorderedLists.splice(currentIndex, 1);
      reorderedLists.splice(newIndex, 0, movedList);
      setLists(reorderedLists);
    }
  };

  return (
    <div className="flex flex-col gap-3">
      {lists.map((list) => (
        <motion.div
          key={list.id}
          drag="y"
          dragConstraints={{ top: 0, bottom: 0 }}
          dragElastic={0.1}
          onDragStart={() => setDraggedListId(list.id)}
          onDragEnd={(event, info) => handleDragEnd(list.id, event, info)}
          className={cn(
            "group relative flex flex-col bg-black/60 border",
            list.color ? "" : "border-white/20",
            draggedListId === list.id && "opacity-50 scale-105 shadow-[0_10px_40px_rgba(255,255,255,0.3)] z-50"
          )}
          style={list.color ? { borderColor: list.color } : {}}
        >
          {/* List Header */}
          <div className="flex items-center gap-3 p-4 border-b border-white/10">
            <div className="cursor-move opacity-40 group-hover:opacity-100 transition-opacity">
              <GripVertical className="w-4 h-4 text-white" />
            </div>
            
            <span className="flex-1 font-['Syncopate'] text-xs font-bold tracking-widest text-white truncate">
              {list.title}
            </span>

            <div className="relative">
              <button
                onClick={() => setOpenMenuId(openMenuId === list.id ? null : list.id)}
                className="opacity-60 hover:opacity-100 transition-opacity cursor-pointer"
              >
                <MoreVertical className="w-4 h-4 text-white" />
              </button>

              {openMenuId === list.id && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="absolute right-0 top-full mt-2 w-48 bg-black/95 backdrop-blur-xl border border-white/30 p-3 z-50 shadow-[0_10px_40px_rgba(0,0,0,0.9)]"
                >
                  <button
                    onClick={() => deleteList(list.id)}
                    className="w-full text-left px-2 py-2 text-xs text-red-500 hover:bg-white/10 transition-colors font-bold tracking-widest cursor-pointer flex items-center gap-2"
                  >
                    <Trash2 className="w-3 h-3" /> DELETE
                  </button>
                  
                  <div className="border-t border-white/20 mt-2 pt-2">
                    <div className="text-[10px] text-white/40 mb-2 tracking-widest">COLOR</div>
                    <div className="grid grid-cols-4 gap-2">
                      {COLOR_PALETTE.map((color) => (
                        <button
                          key={color}
                          onClick={() => setListColor(list.id, color)}
                          className="w-8 h-8 border border-white/20 hover:border-white transition-colors cursor-pointer"
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}
            </div>
          </div>

          {/* List Tasks */}
          <div className="p-4 flex flex-col gap-2">
            {list.tasks.map((task) => (
              <div key={task.id} className="flex items-center gap-3">
                <button
                  onClick={() => toggleListTaskComplete(list.id, task.id)}
                  className={cn(
                    "w-3 h-3 border flex items-center justify-center shrink-0 transition-colors cursor-pointer",
                    task.completed ? "border-white/50 bg-white/20" : "border-white/40 hover:border-white"
                  )}
                >
                  {task.completed && <div className="w-1.5 h-1.5 bg-white" />}
                </button>
                
                <span className={cn(
                  "flex-1 text-xs tracking-wider truncate",
                  task.completed ? "line-through text-white/50" : "text-white/80"
                )}>
                  {task.title}
                </span>
              </div>
            ))}
          </div>
        </motion.div>
      ))}
    </div>
  );
};