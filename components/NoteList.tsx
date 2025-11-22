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
  onOpenTrash: () => void;
  isOpen: boolean;
  onClose: () => void;
  theme: Theme;
  pinned?: boolean;
  searchQuery?: string;
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
  onOpenTrash,
  isOpen,
  onClose,
  theme,
  pinned = false,
  searchQuery = ''
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
  const liquidButtonTone = isDark ? 'liquid-btn liquid-btn-dark text-white' : 'liquid-btn liquid-btn-light text-[#0B1B40]';
  
  // Liquid Glass Gradient for Sidebar (boosted contrast to stay visible when pinned)
  const bgClass = isDark 
    ? 'bg-[linear-gradient(180deg,_rgba(0,18,38,0.95)_0%,_rgba(0,26,51,0.97)_100%)] border-r-white/10 ring-1 ring-white/10'
    : 'bg-[linear-gradient(180deg,_rgba(255,255,255,0.92)_0%,_rgba(255,255,255,0.72)_100%)] border-r-white/60 ring-1 ring-white/70';
  
  const textClass = isDark ? 'text-blue-50' : 'text-[#001226]';
  
  // Colors
  const iconBaseClass = isDark ? 'text-[#00E8FF] drop-shadow-[0_2px_8px_rgba(0,232,255,0.35)]' : 'text-[#0052CC] drop-shadow-[0_2px_10px_rgba(0,82,204,0.28)]';
  const iconHoverClass = isDark ? 'group-hover:text-[#00FFFF]' : 'group-hover:text-[#1A8CFF]';
  const activeItemClass = isDark
    ? 'text-white font-semibold bg-white/10 shadow-[0_10px_26px_-16px_rgba(0,0,0,0.7)]'
    : 'text-[#0052CC] font-semibold bg-white shadow-[0_10px_26px_-16px_rgba(0,82,204,0.3)]';

  const listDividerClass = isDark ? 'divide-white/10' : 'divide-[#C4D9FF]/60';
  const hoverItemClass = isDark
    ? 'hover:bg-white/8 hover:border-white/12 hover:shadow-[0_12px_30px_-18px_rgba(0,0,0,0.65)]'
    : 'hover:bg-white/95 hover:border-[#C4D9FF] hover:shadow-[0_12px_28px_-18px_rgba(0,82,204,0.25)]';

  const actionBtnClass = `${liquidButtonTone} liquid-btn-icon h-12 w-12 text-base`;

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

      <div className={`${pinned ? 'relative h-[calc(100vh-128px)] w-72 rounded-[26px]' : 'fixed inset-y-0 left-0 w-[85%] max-w-sm rounded-[26px]'} z-40 shadow-[0_0_48px_-16px_rgba(0,0,0,0.55)] transition-transform duration-500 cubic-bezier(0.32, 0.72, 0, 1) ${
        pinned ? 'translate-x-0' : (isOpen ? 'translate-x-0' : '-translate-x-full')
      } ${bgClass} ${textClass} backdrop-blur-[32px] flex flex-col relative overflow-hidden`}>
        <div className={`pointer-events-none absolute inset-x-4 top-0 h-40 rounded-3xl blur-3xl opacity-70 ${
          isDark ? 'bg-[radial-gradient(circle_at_30%_10%,rgba(0,240,200,0.18),transparent)]' : 'bg-[radial-gradient(circle_at_30%_10%,rgba(0,212,255,0.18),transparent)]'
        }`} />
        <div className={`pointer-events-none absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t ${
          isDark ? 'from-black/25 via-transparent to-transparent' : 'from-[#C4D9FF]/40 via-transparent to-transparent'
        }`} />
        
        {/* Header Area with Editable Title & Logo */}
        <div className="px-3 pt-4 pb-3 z-10">
          <div className={`flex items-center justify-between gap-3 px-3 py-2 rounded-full backdrop-blur-[18px] ${
            isDark ? 'bg-[linear-gradient(140deg,_rgba(0,18,38,0.9),_rgba(0,0,0,0.6))] shadow-[0_12px_30px_-16px_rgba(0,0,0,0.75)]' : 'bg-[linear-gradient(140deg,_rgba(255,255,255,0.9),_rgba(255,255,255,0.65))] shadow-[0_12px_30px_-16px_rgba(0,82,204,0.2)]'
          }`}>
            <div className="flex items-center gap-2 overflow-hidden">
              <div className={`shrink-0 p-2.5 rounded-full shadow-md backdrop-blur-md ${
                isDark 
                  ? 'bg-[linear-gradient(160deg,_#0A0F1A,_#002244,_#0052CC)] shadow-black/40' 
                  : 'bg-[linear-gradient(145deg,_#F9FDFF,_#C4D9FF,_rgba(255,255,255,0.8))] shadow-blue-200/30'
              }`}>
                <Bot size={18} strokeWidth={2.4} className={`${isDark ? 'text-[#00E8FF]' : 'text-[#0052CC]'} drop-shadow-[0_2px_10px_rgba(0,212,255,0.55)]`} />
              </div>
              <div className="flex flex-col">
                <span className={`text-[10px] uppercase tracking-[0.2em] ${isDark ? 'text-slate-300/70' : 'text-slate-600/90'}`}>Library</span>
                <input 
                  type="text" 
                  value={libraryTitle}
                  onChange={handleTitleChange}
                  className={`bg-transparent text-base font-semibold outline-none w-full truncate placeholder-current tracking-tight ${
                    isDark ? 'text-white focus:text-slate-100' : 'text-[#001226] focus:text-[#0052CC]'
                  }`}
                  spellCheck={false}
                />
              </div>
            </div>
            {!pinned && (
              <button onClick={onClose} className={`${liquidButtonTone} liquid-btn-icon shrink-0 h-10 w-10`}>
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
                    className={`${liquidButtonTone} liquid-btn-pill flex items-center gap-2 px-3 py-2 rounded-[14px] transition-all duration-300`}
                  >
                    <span className={`${iconBaseClass} ${iconHoverClass} transition-transform duration-300 ${isExpanded ? 'rotate-90' : ''}`}>
                      <ChevronRight size={11} />
                    </span>
                    <Folder size={12} className={`${iconBaseClass} ${iconHoverClass}`} />
                    <span className={`font-semibold text-[10px] flex-1 text-left truncate transition-colors uppercase tracking-[0.16em] ${
                      isDark ? 'text-gray-300 group-hover:text-white' : 'text-slate-600 group-hover:text-[#0052CC]'
                    }`}>
                      {groupName}
                    </span>
                    <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${
                      isDark ? 'bg-white/8 text-[#00E8FF] border border-white/12' : 'bg-white/85 text-[#0052CC] border border-white/60 shadow-sm'
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
                        <div className={`pl-3 ml-4 mt-0.5 py-0.5 space-y-2 divide-y ${listDividerClass}`}>
                          {groupNotes.map(note => (
                            <div 
                              key={note.id}
                              onClick={() => onSelect(note.id)}
                              className={`group/item relative py-2 pl-3 pr-3 cursor-pointer transition-all duration-200 flex items-center gap-2 rounded-[12px] border border-transparent ${
                                note.id === activeId 
                                  ? `${activeItemClass} ${isDark ? 'border-white/15' : 'border-white'}`
                                  : `${isDark ? 'text-slate-200' : 'text-slate-700'} ${hoverItemClass}`
                              }`}
                            >
                              <SquarePen size={12} className={`shrink-0 transition-colors drop-shadow-[0_2px_8px_rgba(59,130,246,0.45)] ${
                                note.id === activeId ? (isDark ? 'text-[#00E8FF]' : 'text-[#0052CC]') : 'text-slate-400'
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
                                className={`${liquidButtonTone} liquid-btn-icon h-8 w-8 text-[10px] opacity-0 group-hover/item:opacity-100`}
                                title="Delete Note"
                                type="button"
                              >
                                <Trash size={12} className={isDark ? 'text-red-300' : 'text-red-500'} />
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
                <p>{searchQuery.trim() ? 'No notes match your search' : 'Empty Library'}</p>
              </div>
            )}
          </div>
        </div>

        {/* Bottom Glass Box with Action Buttons - Liquid Style */}
        <div className="p-5 z-10">
          <div className={`grid grid-cols-5 gap-2 p-2 rounded-full backdrop-blur-2xl shadow-lg transition-colors duration-500 ${
            isDark 
              ? 'bg-[linear-gradient(180deg,_rgba(0,18,38,0.85),_rgba(0,0,0,0.6))] shadow-[0_20px_50px_-26px_rgba(0,0,0,0.8)]' 
              : 'bg-[linear-gradient(180deg,_rgba(255,255,255,0.9),_rgba(255,255,255,0.75))] border-white/70 shadow-[0_20px_50px_-28px_rgba(0,82,204,0.32)] border'
          }`}>
            <button type="button" onClick={onNewNote} className={actionBtnClass} title="New Note">
              <Plus size={20} className={isDark ? 'text-[#00E8FF]' : 'text-[#0052CC]'} />
            </button>
            <button type="button" onClick={onNewFolder} className={actionBtnClass} title="New Folder">
              <FolderPlus size={20} className={isDark ? 'text-[#00E8FF]' : 'text-[#0052CC]'} />
            </button>
            <button type="button" onClick={onImport} className={actionBtnClass} title="Import">
              <Upload size={20} className={isDark ? 'text-[#00E8FF]' : 'text-[#0052CC]'} />
            </button>
            <button type="button" onClick={onExport} className={actionBtnClass} title="Export PDF">
              <Download size={20} className={isDark ? 'text-[#00E8FF]' : 'text-[#0052CC]'} />
            </button>
            <button type="button" onClick={onOpenTrash} className={actionBtnClass} title="Trash">
              <Trash size={20} className={isDark ? 'text-[#00E8FF]' : 'text-[#0052CC]'} />
            </button>
          </div>
        </div>

      </div>
    </>
  );
};
