import React, { useMemo, useState, useEffect } from 'react';
import { Note, Theme } from '../types';
import { Trash, Folder, ChevronRight, ChevronDown, SquarePen, FolderPlus, Plus, Upload, Download, X, Bot } from 'lucide-react';
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
  pinned?: boolean;
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
  theme,
  pinned = false
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
  
  // Liquid Glass Gradient for Sidebar (boosted contrast to stay visible when pinned)
  const bgClass = isDark 
    ? 'bg-[linear-gradient(180deg,_#0f1118_0%,_#0a0c12_100%)] border-r-white/5 ring-1 ring-white/5'
    : 'bg-[linear-gradient(180deg,_#f8f9fd_0%,_#eef1f7_100%)] border-r-slate-200 ring-1 ring-white/50';
  
  const textClass = isDark ? 'text-blue-50' : 'text-slate-800';
  
  // Colors
  const iconBaseClass = isDark ? 'text-blue-300/80 drop-shadow-[0_2px_6px_rgba(59,130,246,0.45)]' : 'text-blue-600/80 drop-shadow-[0_2px_8px_rgba(59,130,246,0.35)]';
  const iconHoverClass = isDark ? 'group-hover:text-blue-300' : 'group-hover:text-blue-600';
  const activeItemClass = isDark
    ? 'bg-white/8 ring-1 ring-white/12 shadow-[0_12px_30px_-16px_rgba(0,0,0,0.7)] rounded-[12px]'
    : 'bg-white/85 ring-1 ring-blue-100 shadow-[0_12px_30px_-14px_rgba(59,130,246,0.35)] rounded-[12px]';

  const actionBtnClass = `flex items-center justify-center p-2.5 rounded-full transition-all duration-300 group relative overflow-hidden hover:-translate-y-0.5 active:scale-95 ${
    isDark 
      ? 'bg-gradient-to-br from-white/15 via-blue-400/10 to-white/5 text-blue-100 shadow-[0_12px_32px_-16px_rgba(0,0,0,0.65)]'
      : 'bg-gradient-to-br from-white via-blue-50/70 to-white text-blue-700 shadow-[0_12px_32px_-16px_rgba(59,130,246,0.35)]'
  }`;

  return (
    <>
      {/* Backdrop for mobile */}
      <AnimatePresence>
        {isOpen && !pinned && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-30 md:hidden"
          />
        )}
      </AnimatePresence>

      <div className={`${pinned ? 'relative h-[calc(100vh-96px)] w-72 rounded-2xl overflow-hidden' : 'fixed inset-y-0 left-0 w-72'} z-40 shadow-[0_0_40px_-14px_rgba(0,0,0,0.45)] transition-transform duration-500 cubic-bezier(0.32, 0.72, 0, 1) ${
        pinned ? 'translate-x-0' : (isOpen ? 'translate-x-0' : '-translate-x-full')
      } ${bgClass} ${textClass} border-r backdrop-blur-[28px] flex flex-col relative overflow-hidden`}>
        <div className="pointer-events-none absolute inset-x-4 top-0 h-40 rounded-3xl blur-3xl opacity-60 bg-gradient-to-b from-blue-500/30 via-transparent to-transparent" />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/10 via-transparent to-transparent" />
        
        {/* Header Area with Editable Title & Logo */}
        <div className="px-3 pt-4 pb-3 z-10">
          <div className={`flex items-center justify-between gap-3 px-3 py-2 rounded-full backdrop-blur-2xl ${
            isDark ? 'bg-white/5 shadow-[0_10px_30px_-16px_rgba(0,0,0,0.7)]' : 'bg-white/85 shadow-[0_10px_30px_-16px_rgba(59,130,246,0.2)]'
          }`}>
            <div className="flex items-center gap-2 overflow-hidden">
              <div className={`shrink-0 p-2.5 rounded-full bg-gradient-to-br shadow-md backdrop-blur-md ${
                isDark 
                  ? 'from-[#36415d] via-[#253149] to-[#131a27] shadow-black/40' 
                  : 'from-white via-blue-50 to-blue-100 shadow-blue-200/30'
              }`}>
                <Bot size={18} strokeWidth={2.4} className={`${isDark ? 'text-cyan-200' : 'text-blue-700'} drop-shadow-[0_2px_10px_rgba(59,130,246,0.55)]`} />
              </div>
              <div className="flex flex-col">
                <span className={`text-[10px] uppercase tracking-[0.2em] ${isDark ? 'text-slate-300/70' : 'text-slate-600/80'}`}>Library</span>
                <input 
                  type="text" 
                  value={libraryTitle}
                  onChange={handleTitleChange}
                  className={`bg-transparent text-base font-semibold outline-none w-full truncate placeholder-current tracking-tight ${
                    isDark ? 'text-white focus:text-slate-100' : 'text-slate-800 focus:text-blue-700'
                  }`}
                  spellCheck={false}
                />
              </div>
            </div>
            {!pinned && (
              <button onClick={onClose} className={`shrink-0 p-2 rounded-full transition-colors border ${isDark ? 'border-white/10 hover:bg-white/10' : 'border-white/60 hover:bg-black/5'}`}>
                <X size={18} className={iconBaseClass} />
              </button>
            )}
          </div>
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
                    className={`flex items-center gap-2 px-2.5 py-2 rounded-[10px] transition-all duration-300 ${
                      isDark ? 'hover:bg-white/5' : 'hover:bg-blue-50'
                    }`}
                  >
                    <span className={`${iconBaseClass} ${iconHoverClass} transition-transform duration-300 ${isExpanded ? 'rotate-90' : ''}`}>
                      <ChevronRight size={11} />
                    </span>
                    <Folder size={12} className={`${iconBaseClass} ${iconHoverClass}`} />
                    <span className={`font-semibold text-[10px] flex-1 text-left truncate transition-colors uppercase tracking-[0.16em] ${
                      isDark ? 'text-gray-300 group-hover:text-white' : 'text-slate-600 group-hover:text-blue-700'
                    }`}>
                      {groupName}
                    </span>
                    <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${
                      isDark ? 'bg-white/5 text-gray-200 border border-white/10' : 'bg-white/80 text-slate-600 border border-white/60 shadow-sm'
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
                        <div className="pl-3 ml-4 mt-0.5 py-0.5 space-y-0 divide-y divide-white/5">
                          {groupNotes.map(note => (
                            <div 
                              key={note.id}
                              onClick={() => onSelect(note.id)}
                              className={`group/item relative py-1 pl-3 pr-2 cursor-pointer transition-all duration-150 flex items-center gap-2 rounded-[12px] ${
                                note.id === activeId 
                                  ? activeItemClass
                                  : `${isDark ? 'hover:bg-white/5 hover:text-blue-100' : 'hover:bg-white/70 hover:text-blue-700'}`
                              }`}
                            >
                              <SquarePen size={12} className={`shrink-0 transition-colors drop-shadow-[0_2px_8px_rgba(59,130,246,0.45)] ${
                                note.id === activeId ? (isDark ? 'text-blue-300' : 'text-blue-500') : 'opacity-60'
                              }`}/>
                              
                              <div className="min-w-0 flex-1">
                                <h4 className={`text-[12px] truncate font-semibold ${note.id === activeId ? '' : 'opacity-80'}`}>
                                  {note.title || 'Untitled'}
                                </h4>
                                <p className="text-[10px] truncate opacity-50 mt-0.5 font-medium">
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
          <div className={`grid grid-cols-4 gap-2 p-2 rounded-full border backdrop-blur-xl shadow-lg transition-colors duration-500 ${
            isDark 
              ? 'bg-[#1a1d28]/80 border-white/10 shadow-black/30' 
              : 'bg-white/85 border-slate-200 shadow-blue-100/50'
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
