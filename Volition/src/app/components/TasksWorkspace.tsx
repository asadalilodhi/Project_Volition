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
  completed: boolean;
  color?: string;
}

const COLOR_PALETTE = [
  '#FF0000', '#FF4444', '#FF8800', '#FFAA00',
  '#FFFF00', '#88FF00', '#00FF00', '#00FF88',
  '#00FFFF', '#0088FF', '#0000FF', '#8800FF',
  '#FF00FF', '#FF0088', '#FFFFFF', '#888888'
];

export const TasksWorkspace: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([
    { id: 't1', title: 'Execute Node 7A-X Override', completed: false },
    { id: 't2', title: 'System Core Defrag', completed: false, color: '#00FFFF' },
    { id: 't3', title: 'Deploy production updates', completed: true },
    { id: 't4', title: 'Flush Proxy Cache (Regional)', completed: false, color: '#FF0088' },
  ]);

  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);

  const toggleTaskComplete = (taskId: string) => {
    setTasks(tasks.map(t => t.id === taskId ? { ...t, completed: !t.completed } : t));
  };

  const setTaskColor = (taskId: string, color: string) => {
    setTasks(tasks.map(t => t.id === taskId ? { ...t, color } : t));
    setOpenMenuId(null);
  };

  const deleteTask = (taskId: string) => {
    setTasks(tasks.filter(t => t.id !== taskId));
    setOpenMenuId(null);
  };

  const handleDragEnd = (taskId: string, event: any, info: any) => {
    setDraggedTaskId(null);
    // Find the task's current index
    const currentIndex = tasks.findIndex(t => t.id === taskId);
    
    // Calculate which position it should move to based on drag offset
    const movedRows = Math.round(info.offset.y / 60); // Approximate height of each task
    const newIndex = Math.max(0, Math.min(tasks.length - 1, currentIndex + movedRows));
    
    if (newIndex !== currentIndex) {
      const reorderedTasks = [...tasks];
      const [movedTask] = reorderedTasks.splice(currentIndex, 1);
      reorderedTasks.splice(newIndex, 0, movedTask);
      setTasks(reorderedTasks);
    }
  };

  return (
    <div className="flex flex-col gap-3">
      {tasks.map((task) => (
        <motion.div
          key={task.id}
          drag="y"
          dragConstraints={{ top: 0, bottom: 0 }}
          dragElastic={0.1}
          onDragStart={() => setDraggedTaskId(task.id)}
          onDragEnd={(event, info) => handleDragEnd(task.id, event, info)}
          className={cn(
            "group relative flex items-center gap-3 p-4 bg-black/60 border transition-all",
            draggedTaskId === task.id && "opacity-50 scale-105 shadow-[0_10px_40px_rgba(255,255,255,0.3)] z-50"
          )}
          style={task.color ? { borderColor: task.color } : { borderColor: 'rgba(255, 255, 255, 0.2)' }}
        >
          {/* Grab Handle */}
          <div className="cursor-move opacity-40 group-hover:opacity-100 transition-opacity">
            <GripVertical className="w-4 h-4 text-white" />
          </div>

          {/* Checkbox */}
          <button
            onClick={() => toggleTaskComplete(task.id)}
            className={cn(
              "w-4 h-4 border flex items-center justify-center shrink-0 transition-colors cursor-pointer",
              task.completed ? "border-white/50 bg-white/20" : "border-white/40 hover:border-white"
            )}
          >
            {task.completed && <div className="w-2 h-2 bg-white" />}
          </button>

          {/* Title */}
          <span className={cn(
            "flex-1 text-sm font-bold tracking-wider truncate",
            task.completed ? "line-through text-white/50" : "text-white/90"
          )}>
            {task.title}
          </span>

          {/* Options Menu */}
          <div className="relative">
            <button
              onClick={() => setOpenMenuId(openMenuId === task.id ? null : task.id)}
              className="opacity-60 hover:opacity-100 transition-opacity cursor-pointer"
            >
              <MoreVertical className="w-4 h-4 text-white" />
            </button>

            {openMenuId === task.id && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="absolute right-0 top-full mt-2 w-48 bg-black/95 backdrop-blur-xl border border-white/30 p-3 z-50 shadow-[0_10px_40px_rgba(0,0,0,0.9)]"
              >
                <button
                  onClick={() => deleteTask(task.id)}
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
                        onClick={() => setTaskColor(task.id, color)}
                        className="w-8 h-8 border border-white/20 hover:border-white transition-colors cursor-pointer"
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        </motion.div>
      ))}
    </div>
  );
};