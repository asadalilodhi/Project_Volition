import React, { useState } from 'react';
import { Edit3 } from 'lucide-react';

interface SecondaryTagsModuleProps {
  initialTags: string[];
  onTagsChange?: (tags: string[]) => void;
}

export const SecondaryTagsModule: React.FC<SecondaryTagsModuleProps> = ({ 
  initialTags, 
  onTagsChange 
}) => {
  const [tags, setTags] = useState<string[]>(initialTags);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editValue, setEditValue] = useState('');

  const handleTagClick = (index: number) => {
    setEditingIndex(index);
    setEditValue(tags[index]);
  };

  const handleTagBlur = () => {
    if (editingIndex !== null && editValue.trim()) {
      const newTags = [...tags];
      newTags[editingIndex] = editValue.trim().toUpperCase();
      setTags(newTags);
      if (onTagsChange) onTagsChange(newTags);
    }
    setEditingIndex(null);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleTagBlur();
    } else if (e.key === 'Escape') {
      setEditingIndex(null);
      setEditValue('');
    }
  };

  return (
    <div className="bg-white/5 backdrop-blur-sm border border-white/20 p-3 mt-3 max-md:p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="text-[9px] text-white/50 tracking-widest font-bold max-md:text-[10px]">
          AI-SUGGESTED TAGS // CLICK TO EDIT
        </div>
        <Edit3 className="w-3 h-3 text-white/30 max-md:w-4 max-md:h-4" />
      </div>
      
      <div className="flex flex-col gap-2">
        {tags.map((tag, index) => (
          <div key={index} className="relative group">
            {editingIndex === index ? (
              <input
                type="text"
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                onBlur={handleTagBlur}
                onKeyDown={handleKeyDown}
                autoFocus
                className="w-full px-3 py-1.5 text-xs font-mono tracking-wider bg-black/60 border border-white text-white outline-none placeholder:text-white/30 max-md:py-3 max-md:min-h-[44px] max-md:text-sm"
                placeholder="ENTER TAG..."
              />
            ) : (
              <button
                onClick={() => handleTagClick(index)}
                className="w-full px-3 py-1.5 text-xs font-mono tracking-wider bg-black/40 border border-white/30 text-white/90 hover:border-white hover:bg-white/10 transition-all text-left cursor-text group max-md:py-3 max-md:min-h-[44px] max-md:text-sm"
              >
                <span className="flex items-center justify-between">
                  <span>{tag}</span>
                  <Edit3 className="w-2.5 h-2.5 text-white/20 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity max-md:w-4 max-md:h-4" />
                </span>
              </button>
            )}
          </div>
        ))}
      </div>
      
      <div className="mt-2 text-[8px] text-white/30 italic max-md:text-[10px]">
        Tags enhance node searchability and context retrieval
      </div>
    </div>
  );
};