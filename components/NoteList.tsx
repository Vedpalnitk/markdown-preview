import React, { useMemo, useState } from 'react';
import { Note, Theme } from '../types';
import { Trash2, Folder, FolderOpen, ChevronDown, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface NoteListProps {
  notes: Note[];
  activeId: string;
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
  isOpen: boolean;
  onClose: () => void;
  theme: Theme;
}

export const NoteList: React.FC<NoteListProps> = ({
  notes,
  activeId,
  onSelect,
  onDelete,
  isOpen,
  onClose,
  theme
}) => {
  // State to track expanded groups
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({ 'General': true });

  // Group notes by their 'group' property
  const groupedNotes = useMemo(() => {
    const groups: Record<string, Note[]> = {};
    notes.forEach(note => {
      const g = note.group || 'General';
      if (!groups[g]) groups[g] = [];
      groups[g].push(note);
    });
    return groups;
  }, [notes]);

  const toggleGroup = (group: string) => {
    setExpandedGroups(prev => ({ ...prev, [group]: !prev[group] }));
  };

  if (!isOpen) return null;

  const bgClass = theme === Theme.DARK ? 'bg-black/80 border-r-white/10' : 'bg-white/80 border-r-white/40';
  const textClass = theme === Theme.DARK ? 'text-white' : 'text-slate-900';
  const itemActive = theme === Theme.DARK ? 'bg-white/10' : 'bg-black/5';
  const headerClass = theme === Theme.DARK ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-gray-800';

  return (
    <div className={`fixed inset-y-0 left-0 w-80 z-40 backdrop-blur-xl border-r shadow-2xl transition-transform duration-300 ease-out ${isOpen ? 'translate-x-0' : '-translate-x-full'} ${bgClass} ${textClass}`}>
      <div className="p-6 pt-12 flex flex-col h-full">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold tracking-tight">My Notes</h2>
          <button onClick={onClose} className="text-sm opacity-60 hover:opacity-100">Close</button>
        </div>

        <div className="flex-1 overflow-y-auto space-y-4 pr-2">
          {notes.length === 0 && (
            <p className="opacity-50 text-center mt-10">No notes yet.</p>
          )}

          {(Object.entries(groupedNotes) as [string, Note[]][]).map(([groupName, groupNotes]) => (
            <div key={groupName} className="mb-4">
              <button 
                onClick={() => toggleGroup(groupName)}
                className={`flex items-center w-full text-xs font-bold uppercase tracking-wider mb-2 ${headerClass} transition-colors`}
              >
                <span className="mr-1">
                  {expandedGroups[groupName] ? <ChevronDown size={12}/> : <ChevronRight size={12}/>}
                </span>
                {groupName}
                <span className="ml-auto opacity-50 text-[10px]">{groupNotes.length}</span>
              </button>

              <AnimatePresence>
                {expandedGroups[groupName] && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="space-y-1 overflow-hidden"
                  >
                    {groupNotes.map(note => (
                      <div 
                        key={note.id}
                        onClick={() => onSelect(note.id)}
                        className={`group p-3 rounded-xl cursor-pointer transition-all duration-200 hover:scale-[1.02] flex justify-between items-start ${note.id === activeId ? itemActive : 'hover:bg-white/5'}`}
                      >
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold truncate text-sm">{note.title || 'Untitled'}</h3>
                          <p className="text-[10px] opacity-50 mt-0.5 truncate">
                            {new Date(note.updatedAt).toLocaleDateString()}
                          </p>
                        </div>
                        <button 
                          onClick={(e) => { e.stopPropagation(); onDelete(note.id); }}
                          className="opacity-0 group-hover:opacity-100 p-1.5 hover:bg-red-500/20 text-red-500 rounded-full transition-opacity"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};