import React, { useMemo, useState, useEffect } from 'react';
import { Note, Theme } from '../types';
import { Trash, Folder, ChevronRight, ChevronDown, FileText, FolderPlus, Plus, Upload, Download, X, BrainCircuit } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface NoteListProps {
  notes: Note[];
  activeId: string;
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
  onNewNote: () => void;
  onNewFolder: () => void;
  onImport: () => void;
  onExport: () => void;
  isOpen: boolean;
  onClose: () => void;
  theme: Theme;
}

export const NoteList: React.FC<NoteListProps> = ({
  notes,
  activeId,
  onSelect,
  onDelete,
  onNewNote,
  onNewFolder,
  onImport,
  onExport,
  isOpen,
  onClose,
  theme
}) => {
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({});
  const [libraryTitle, setLibraryTitle] = useState(() => localStorage.getItem('glassnote_library_title') || 'GlassNote AI');

  const groupedNotes = useMemo(() => {
    const groups: Record<string, Note[]> = {};
    notes.forEach(note => {
      const g = note.group || 'GENERAL';
      if (!groups[g]) groups[g] = [];
      groups[g].push(note);
    });
    return groups;
  }, [notes]);

  useEffect(() => {
    if (isOpen && activeId) {
      const activeNote = notes.find(n => n.id === activeId);
      if (activeNote) {
        const group = activeNote.group || 'GENERAL';
        setExpandedGroups(prev => ({ ...prev, [group]: true }));
      }
    }
  }, [isOpen, activeId, notes]);

  const toggleGroup = (group: string) => {
    setExpandedGroups(prev => ({ ...prev, [group]: !prev[group] }));
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLibraryTitle(e.target.value);
    localStorage.setItem('glassnote_library_title', e.target.value);
  };

  const isDark = theme === Theme.DARK;
  
  // Liquid Glass Gradient for Sidebar
  const bgClass = isDark 
    ? 'bg-gradient-to-b from-slate-900/90 via-slate-900/80 to-black/90 border-r-white/5' 
    : 'bg-gradient-to-b from-white/80 via-blue-50/60 to-white/70 border-r-white/40';
  
  const textClass = isDark ? 'text-blue-50' : 'text-slate-800';
  
  // Colors
  const iconBaseClass = isDark ? 'text-blue-300/70' : 'text-blue-600/70';
  const iconHoverClass = isDark ? 'group-hover:text-blue-300' : 'group-hover:text-blue-600';
  const activeItemClass = isDark
    ? 'bg-white/5 border-white/10 shadow-[inset_0_1px_0_rgba(255,255,255,0.1)]'
    : 'bg-white/60 border-white/50 shadow-[inset_0_1px_0_rgba(255,255,255,0.5)]';

  const actionBtnClass = `flex items-center justify-center p-3.5 rounded-[24px] transition-all duration-300 group relative overflow-hidden ${
    isDark 
      ? 'bg-white/5 hover:bg-blue-500/20 active:bg-blue-500/30 border border-white/5' 
      : 'bg-white/40 hover:bg-blue-500/10 active:bg-blue-500/20 border border-white/40 shadow-sm'
  }`;

  return (
    <>
      {/* Backdrop for mobile */}
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-30 md:hidden"
          />
        )}
      </AnimatePresence>

      <div className={`fixed inset-y-0 left-0 w-72 z-40 shadow-[0_0_40px_-10px_rgba(0,0,0,0.2)] transition-transform duration-500 cubic-bezier(0.32, 0.72, 0, 1) ${isOpen ? 'translate-x-0' : '-translate-x-full'} ${bgClass} ${textClass} border-r backdrop-blur-[40px] flex flex-col`}>
        
        {/* Header Area with Editable Title & Logo */}
        <div className="px-6 pt-10 pb-6 flex justify-between items-center z-10">
           <div className="flex items-center gap-3 overflow-hidden">
             {/* Liquid Logo Container */}
             <div className={`shrink-0 p-3 rounded-[18px] bg-gradient-to-br shadow-lg backdrop-blur-md border transition-all duration-500 ${
               isDark 
                ? 'from-blue-500/20 to-purple-500/20 border-white/10 shadow-blue-500/10' 
                : 'from-white/80 to-blue-50/50 border-white/60 shadow-blue-200/20'
             }`}>
               <BrainCircuit size={22} strokeWidth={2} className={isDark ? 'text-blue-300' : 'text-blue-600'} />
             </div>
             <input 
                type="text" 
                value={libraryTitle}
                onChange={handleTitleChange}
                className={`bg-transparent text-lg font-bold outline-none w-full truncate placeholder-current tracking-tight ${
                  isDark ? 'text-white focus:text-blue-200' : 'text-slate-800 focus:text-blue-600'
                }`}
                spellCheck={false}
             />
           </div>
           <button onClick={onClose} className={`shrink-0 p-2 rounded-full transition-colors ${isDark ? 'hover:bg-white/10' : 'hover:bg-black/5'}`}>
             <X size={20} className={iconBaseClass} />
           </button>
        </div>

        {/* Content Area - Accordion List */}
        <div className="flex-1 overflow-y-auto px-4 py-2 scrollbar-hide">
          <div className="flex flex-col gap-3">
            {Object.entries(groupedNotes).sort((a,b) => a[0].localeCompare(b[0])).map(([groupName, rawGroupNotes]) => {
              const groupNotes = rawGroupNotes as Note[];
              const isExpanded = expandedGroups[groupName];
              
              return (
                <div key={groupName} className="flex flex-col group">
                  {/* Group Header */}
                  <button
                    onClick={() => toggleGroup(groupName)}
                    className={`flex items-center gap-3 p-3 rounded-[20px] transition-all duration-300 ${
                      isDark ? 'hover:bg-white/5' : 'hover:bg-white/40'
                    }`}
                  >
                    <span className={`${iconBaseClass} ${iconHoverClass} transition-transform duration-300 ${isExpanded ? 'rotate-90' : ''}`}>
                      <ChevronRight size={14} />
                    </span>
                    <div className={`p-1.5 rounded-lg transition-colors ${isDark ? 'bg-white/5' : 'bg-blue-100/30'}`}>
                      <Folder size={14} className={`${iconBaseClass} ${iconHoverClass}`} />
                    </div>
                    <span className={`font-semibold text-[11px] flex-1 text-left truncate transition-colors uppercase tracking-wider ${
                      isDark ? 'text-gray-400 group-hover:text-blue-200' : 'text-slate-500 group-hover:text-blue-600'
                    }`}>
                      {groupName}
                    </span>
                    <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${
                      isDark ? 'bg-white/5 text-gray-400' : 'bg-white/50 text-slate-500 border border-white/20'
                    }`}>
                      {groupNotes.length}
                    </span>
                  </button>

                  {/* Notes List (Accordion Content) */}
                  <AnimatePresence initial={false}>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.4, ease: [0.04, 0.62, 0.23, 0.98] }}
                        className="overflow-hidden"
                      >
                        <div className={`pl-3 border-l-2 border-dashed ml-5 mt-1 space-y-1 py-1 ${isDark ? 'border-white/10' : 'border-blue-200/40'}`}>
                          {groupNotes.map(note => (
                            <div 
                              key={note.id}
                              onClick={() => onSelect(note.id)}
                              className={`group/item relative p-3 pl-4 rounded-[18px] cursor-pointer border transition-all duration-300 flex items-center gap-3 ${
                                note.id === activeId 
                                  ? activeItemClass
                                  : `bg-transparent border-transparent ${isDark ? 'hover:bg-white/5 hover:text-blue-100' : 'hover:bg-white/30 hover:text-blue-700'}`
                              }`}
                            >
                              <FileText size={14} className={`shrink-0 transition-colors ${
                                note.id === activeId ? (isDark ? 'text-blue-300' : 'text-blue-500') : 'opacity-40'
                              }`}/>
                              
                              <div className="min-w-0 flex-1">
                                <h4 className={`text-[13px] truncate font-medium ${note.id === activeId ? '' : 'opacity-80'}`}>
                                  {note.title || 'Untitled'}
                                </h4>
                                <p className="text-[10px] truncate opacity-40 mt-0.5 font-medium">
                                  {new Date(note.updatedAt).toLocaleDateString()}
                                </p>
                              </div>
                              
                              <button 
                                onClick={(e) => { e.stopPropagation(); onDelete(note.id); }}
                                className={`opacity-0 group-hover/item:opacity-100 p-1.5 rounded-full transition-all ${
                                    isDark ? 'hover:bg-red-500/20 text-red-400' : 'hover:bg-red-50 text-red-500'
                                }`}
                                title="Delete Note"
                                type="button"
                              >
                                <Trash size={12} />
                              </button>
                            </div>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
            
            {Object.keys(groupedNotes).length === 0 && (
              <div className={`text-center py-12 text-sm opacity-40`}>
                <p>Empty Library</p>
              </div>
            )}
          </div>
        </div>

        {/* Bottom Glass Box with Action Buttons - Liquid Style */}
        <div className="p-5 z-10">
          <div className={`grid grid-cols-4 gap-2 p-2 rounded-[32px] border backdrop-blur-2xl shadow-lg transition-colors duration-500 ${
            isDark 
              ? 'bg-white/5 border-white/10 shadow-black/20' 
              : 'bg-white/30 border-white/50 shadow-blue-200/20'
          }`}>
            <button type="button" onClick={onNewNote} className={actionBtnClass} title="New Note">
              <Plus size={20} className={isDark ? 'text-blue-300' : 'text-blue-600'} />
            </button>
            <button type="button" onClick={onNewFolder} className={actionBtnClass} title="New Folder">
              <FolderPlus size={20} className={isDark ? 'text-blue-300' : 'text-blue-600'} />
            </button>
            <button type="button" onClick={onImport} className={actionBtnClass} title="Import">
              <Upload size={20} className={isDark ? 'text-blue-300' : 'text-blue-600'} />
            </button>
            <button type="button" onClick={onExport} className={actionBtnClass} title="Export PDF">
              <Download size={20} className={isDark ? 'text-blue-300' : 'text-blue-600'} />
            </button>
          </div>
        </div>

      </div>
    </>
  );
};