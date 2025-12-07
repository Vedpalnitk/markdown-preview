import React, { useMemo, useState, useEffect } from 'react';
import { Note, Theme } from '../types';
import { Trash, ChevronRight, FileText, Plus, Upload, Download, X, Search } from 'lucide-react';
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
  const [libraryTitle, setLibraryTitle] = useState(() => localStorage.getItem('glassnote_library_title') || 'My Workspace');
  const [localSearch, setLocalSearch] = useState('');

  const groupedNotes = useMemo(() => {
    const groups: Record<string, Note[]> = {};
    const query = localSearch.toLowerCase().trim();
    notes.forEach(note => {
      if (query && !`${note.title} ${note.content}`.toLowerCase().includes(query)) return;
      const g = note.group || 'GENERAL';
      if (!groups[g]) groups[g] = [];
      groups[g].push(note);
    });
    return groups;
  }, [notes, localSearch]);

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

  const sidebarBg = isDark
    ? 'bg-[#0f1625]/96 border border-white/[0.04] shadow-[0_18px_60px_-40px_rgba(0,0,0,0.9)]'
    : 'bg-[#f7f9fc] border border-black/[0.04]';

  const textPrimary = isDark ? 'text-[#d9e5f7]' : 'text-[#1f2a3d]';
  const textSecondary = isDark ? 'text-[#9cb1d3]' : 'text-[#4a5970]';
  const textMuted = isDark ? 'text-[#6b7b95]' : 'text-[#7c8ba5]';
  const activeNoteBg = isDark ? 'bg-[rgba(43,127,255,0.12)] text-[#d9e5f7]' : 'bg-[rgba(36,99,235,0.12)] text-[#1f2a3d]';
  const activeIcon = isDark ? 'text-[#8ec5ff]' : 'text-[#2463eb]';

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
            className="fixed inset-0 bg-black/30 backdrop-blur-sm z-30 md:hidden"
          />
        )}
      </AnimatePresence>

      <aside className={`
        ${pinned ? 'relative h-[calc(100vh-80px)] w-[230px]' : 'fixed inset-y-0 left-0 w-[85%] max-w-[260px]'}
        z-40 transition-transform duration-300 ease-out
        ${pinned ? 'translate-x-0' : (isOpen ? 'translate-x-0' : '-translate-x-full')}
        ${sidebarBg} backdrop-blur-2xl flex flex-col rounded-3xl overflow-hidden
      `}>

        {/* Header - Workspace Title */}
        <div className="px-3 pt-3 pb-2">
          <div className="flex items-center justify-between">
            <div className={`flex items-center gap-2 ${textPrimary} text-sm font-semibold`}>
              <div className="w-7 h-7 rounded-xl bg-[rgba(43,127,255,0.2)] border border-white/10 flex items-center justify-center text-[11px]">
                {libraryTitle.charAt(0).toUpperCase()}
              </div>
              <input
                type="text"
                value={libraryTitle}
                onChange={handleTitleChange}
                className={`bg-transparent border-none outline-none text-sm font-semibold ${textPrimary}`}
                placeholder="Workspace"
                spellCheck={false}
              />
            </div>
            {!pinned && (
              <button
                onClick={onClose}
                className={`p-1 rounded-lg transition-colors ${isDark ? 'hover:bg-white/[0.08]' : 'hover:bg-black/[0.05]'}`}
                aria-label="Close sidebar"
              >
                <X size={14} className={textSecondary} />
              </button>
            )}
          </div>
          <div className={`mt-3 flex items-center gap-2 rounded-xl px-2 py-1.5 ${isDark ? 'bg-white/[0.04] border border-white/[0.06]' : 'bg-white border border-black/[0.05]'}`}>
            <Search size={14} className={textMuted} />
            <input
              type="text"
              value={localSearch}
              onChange={(e) => setLocalSearch(e.target.value)}
              placeholder="Search"
              className={`flex-1 bg-transparent outline-none text-sm ${textPrimary} placeholder:${textMuted}`}
            />
          </div>
        </div>

        {/* Navigation Tree */}
        <nav className="flex-1 overflow-y-auto px-2 pb-2">
          <div className="space-y-1">
            {Object.entries(groupedNotes).sort((a, b) => a[0].localeCompare(b[0])).map(([groupName, rawGroupNotes]) => {
              const groupNotes = rawGroupNotes as Note[];
              const isExpanded = expandedGroups[groupName];

              return (
                <div key={groupName}>
                  {/* Group/Folder Header */}
                  <button
                    onClick={() => toggleGroup(groupName)}
                    className={`group flex items-center gap-2 w-full rounded-xl px-2 py-2 transition-colors ${isDark ? 'hover:bg-white/[0.03]' : 'hover:bg-black/[0.02]'} ${textSecondary}`}
                  >
                    <ChevronRight
                      size={12}
                      className={`${textMuted} transition-transform duration-200 ${isExpanded ? 'rotate-90' : ''}`}
                    />
                    <FileText size={14} strokeWidth={1.6} className={textMuted} />
                    <span className="truncate text-sm">{groupName}</span>
                    <span className={`${textMuted} text-xs ml-auto`}>{groupNotes.length}</span>
                    <span className="opacity-0 group-hover:opacity-100 transition-opacity">
                      <Plus size={12} className={textMuted} />
                    </span>
                  </button>

                  {/* Notes/Pages List */}
                  <AnimatePresence initial={false}>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.12, ease: 'easeOut' }}
                        className="overflow-hidden"
                      >
                        <div className="ml-2">
                          {groupNotes.map(note => {
                            const isActive = note.id === activeId;
                            return (
                              <div
                                key={note.id}
                                onClick={() => onSelect(note.id)}
                                className={`group/item flex items-center gap-2 px-2.5 py-[7px] rounded-xl cursor-pointer transition-all border
                                  ${isActive
                                    ? `${activeNoteBg} border-[rgba(43,127,255,0.25)]`
                                    : `${isDark ? 'hover:bg-white/[0.03] text-white/70 border-transparent' : 'hover:bg-black/[0.02] text-[#37352f]/80 border-transparent'}`
                                  }`}
                              >
                                <FileText
                                  size={14}
                                  strokeWidth={1.6}
                                  className={isActive ? activeIcon : textMuted}
                                />
                                <div className="flex-1 min-w-0">
                                  <div className={`text-[13px] truncate ${isActive ? 'font-semibold' : ''}`}>
                                    {note.title || 'Untitled'}
                                  </div>
                                  <div className={`flex items-center gap-1 text-[11px] ${textMuted}`}>
                                    <span className="truncate">{(note.content || '').slice(0, 60) || 'Start writing...'}</span>
                                    <span>•</span>
                                    <span>{new Date(note.updatedAt).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}</span>
                                  </div>
                                </div>
                                <div className="flex items-center gap-1 opacity-0 group-hover/item:opacity-100 transition-opacity">
                                  <button
                                    onClick={(e) => { e.stopPropagation(); onDelete(note.id); }}
                                    className={`p-0.5 rounded ${isDark ? 'hover:bg-white/10' : 'hover:bg-black/5'}`}
                                    aria-label="Delete"
                                  >
                                    <Trash size={10} className={isDark ? 'text-red-400' : 'text-red-500'} />
                                  </button>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}

            {Object.keys(groupedNotes).length === 0 && (
              <div className={`text-center py-8 ${textMuted}`}>
                <FileText size={28} className="mx-auto mb-2 opacity-30" />
                <p className="text-xs">{localSearch.trim() ? 'No results found' : 'No pages yet'}</p>
              </div>
            )}
          </div>
        </nav>

        {/* Bottom Section */}
        <div className={`px-1.5 py-1.5 border-t ${isDark ? 'border-white/[0.06]' : 'border-[#e8e5e0]/50'}`}>
          <button
            onClick={onNewNote}
            className={`w-full flex items-center gap-2 px-2 py-[6px] rounded-xl text-[13px] transition-colors ${isDark ? 'hover:bg-white/[0.06] text-[#aabbd8]' : 'hover:bg-black/[0.03] text-[#5f6f86]'}`}
          >
            <Plus size={14} strokeWidth={1.6} />
            <span>New page</span>
          </button>
          <button
            onClick={onImport}
            className={`w-full flex items-center gap-2 px-2 py-[6px] rounded-xl text-[13px] transition-colors ${isDark ? 'hover:bg-white/[0.06] text-[#aabbd8]' : 'hover:bg-black/[0.03] text-[#5f6f86]'}`}
          >
            <Upload size={14} strokeWidth={1.6} />
            <span>Import</span>
          </button>
          <button
            onClick={onOpenTrash}
            className={`w-full flex items-center gap-2 px-2 py-[6px] rounded-xl text-[13px] transition-colors ${isDark ? 'hover:bg-white/[0.06] text-[#aabbd8]' : 'hover:bg-black/[0.03] text-[#5f6f86]'}`}
          >
            <Trash size={14} strokeWidth={1.6} />
            <span>Trash</span>
          </button>
        </div>
      </aside>
    </>
  );
};
