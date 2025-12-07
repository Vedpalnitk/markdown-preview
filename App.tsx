import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Note, ViewMode, Theme } from './types';
import { getNotes, saveNote, createNewNote, deleteNote, getTrashNotes, moveNoteToTrash, restoreNoteFromTrash, deleteTrashNote } from './services/storageService';
import { MarkdownView } from './components/MarkdownView';
import { GlassDock } from './components/GlassDock';
import { TrashDrawer } from './components/TrashDrawer';
import { NoteList } from './components/NoteList';
import { ScrollProgress } from './components/ScrollProgress';
import { TabBar } from './components/TabBar';
import { Toolbar } from './components/Toolbar';
import {
  Loader2,
  Sun,
  Moon,
  Eye,
  Edit3,
  Maximize2,
  Minimize2,
  Share,
  PanelLeft,
  PanelLeftClose,
  Heading1,
  Heading2,
  Bold,
  Italic,
  List,
  ListOrdered,
  Link2,
  Image,
  CheckSquare
} from 'lucide-react';

// Declare html2pdf global
declare const html2pdf: any;

const App: React.FC = () => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [activeNoteId, setActiveNoteId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>(ViewMode.EDIT);
  const [theme, setTheme] = useState<Theme>(Theme.LIGHT);
  const [isListOpen, setIsListOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [zoom, setZoom] = useState(100);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [trashNotes, setTrashNotes] = useState<Note[]>([]);
  const [isTrashOpen, setIsTrashOpen] = useState(false);
  const [wasSidebarCollapsed, setWasSidebarCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [tabs, setTabs] = useState<string[]>([]);

  // Folder Creation Modal State
  const [showFolderDialog, setShowFolderDialog] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);
  const folderInputRef = useRef<HTMLInputElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const filteredNotes = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return notes;
    return notes.filter(note => {
      const haystack = `${note.title} ${note.content} ${note.group}`.toLowerCase();
      return haystack.includes(query);
    });
  }, [notes, searchQuery]);

  useEffect(() => {
    const prefersDark = typeof window !== 'undefined' && window.matchMedia?.('(prefers-color-scheme: dark)').matches;
    const savedTheme = typeof window !== 'undefined' ? (localStorage.getItem('glassnote_theme') as Theme | null) : null;
    if (savedTheme === Theme.DARK || savedTheme === Theme.LIGHT) {
      setTheme(savedTheme);
    } else if (prefersDark) {
      setTheme(Theme.DARK);
    }

    const loadedNotes = getNotes();
    setNotes(loadedNotes);
    if (loadedNotes.length > 0) {
      setActiveNoteId(loadedNotes[0].id);
      setTabs([loadedNotes[0].id]);
    } else {
      handleNewNote();
    }

    setTrashNotes(getTrashNotes());

  }, []);

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (!mobile) {
        setIsListOpen(false);
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Focus input when dialog opens
  useEffect(() => {
    if (showFolderDialog && folderInputRef.current) {
      setTimeout(() => folderInputRef.current?.focus(), 100);
    }
  }, [showFolderDialog]);

  const activeNote = notes.find(n => n.id === activeNoteId);

  const updateActiveNote = (content: string) => {
    setNotes(prev => {
      const note = prev.find(n => n.id === activeNoteId);
      if (!note) return prev;
      const titleMatch = content.match(/^#\s+(.*)/);
      const title = titleMatch ? titleMatch[1] : (note.title || content.slice(0, 20) || 'Untitled');
      const updatedNote = { ...note, content, title, updatedAt: Date.now() };
      const next = prev.map(n => n.id === activeNoteId ? updatedNote : n);
      saveNote(updatedNote);
      return next;
    });
  };

  const selectNote = (id: string) => {
    setActiveNoteId(id);
    setTabs((prev) => {
      if (prev.includes(id)) return prev;
      return [...prev, id];
    });
  };

  const updateActiveGroup = (group: string) => {
    setNotes(prev => {
      const note = prev.find(n => n.id === activeNoteId);
      if (!note) return prev;
      const updatedNote = { ...note, group: group.toUpperCase(), updatedAt: Date.now() };
      const next = prev.map(n => n.id === activeNoteId ? updatedNote : n);
      saveNote(updatedNote);
      return next;
    });
  };

  const updateActiveTitle = (title: string) => {
    setNotes(prev => {
      const note = prev.find(n => n.id === activeNoteId);
      if (!note) return prev;
      const updatedNote = { ...note, title, updatedAt: Date.now() };
      const next = prev.map(n => n.id === activeNoteId ? updatedNote : n);
      saveNote(updatedNote);
      return next;
    });
  };

  const handleNewNote = () => {
    const newNote = createNewNote();
    setNotes([newNote, ...notes]);
    saveNote(newNote);
    setActiveNoteId(newNote.id);
    setTabs((prev) => [newNote.id, ...prev.filter((id) => id !== newNote.id)]);
    setViewMode(ViewMode.EDIT);
  };

  const openFolderDialog = () => {
    // Create a new folder directly with a default name
    const folderCount = notes.filter(n => n.group?.startsWith('NEW FOLDER')).length;
    const folderName = folderCount === 0 ? 'NEW FOLDER' : `NEW FOLDER ${folderCount + 1}`;

    const newNote = createNewNote('Start Here', '');
    newNote.group = folderName;

    setNotes(prev => [newNote, ...prev]);
    saveNote(newNote);
    setActiveNoteId(newNote.id);
    setViewMode(ViewMode.EDIT);
    setIsListOpen(true);
  };

  const handleDeleteNote = (id: string) => {
    const noteToDelete = notes.find(n => n.id === id);
    if (!noteToDelete) return;
    const updatedTrash = moveNoteToTrash(noteToDelete);
    setTrashNotes(updatedTrash);
    deleteNote(id);
    const remaining = notes.filter(n => n.id !== id);
    setNotes(remaining);
    setTabs((prev) => prev.filter((tabId) => tabId !== id));
    if (activeNoteId === id) {
      const fallback = remaining.length > 0 ? remaining[0].id : null;
      setActiveNoteId(fallback);
    }
  };

  const handleCloseTab = (id: string) => {
    setTabs((prev) => {
      const next = prev.filter((tabId) => tabId !== id);
      if (activeNoteId === id) {
        const fallbackId = next.length > 0 ? next[next.length - 1] : (notes[0]?.id ?? null);
        setActiveNoteId(fallbackId);
      }
      return next;
    });
  };


  const handleImportClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
      fileInputRef.current.click();
    }
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    const fileReaders = Array.from(files).map((file: File) => {
      return new Promise<Note>((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          const content = e.target?.result as string;
          const title = file.name.replace(/\.(md|txt|markdown)$/i, '');
          const newNote = createNewNote(title, content);
          resolve(newNote);
        };
        reader.readAsText(file);
      });
    });

    try {
      const newNotes = await Promise.all(fileReaders);
      newNotes.forEach(note => saveNote(note));
      setNotes(prev => [...newNotes, ...prev]);

      if (newNotes.length > 0) {
        setActiveNoteId(newNotes[0].id);
        setViewMode(ViewMode.PREVIEW);
        setIsListOpen(true);
      }
    } catch (error) {
      console.error("Error importing files:", error);
    }
  };

  const handleExportPdf = () => {
    if (!activeNote) return;
    setIsExporting(true);
    setTimeout(() => {
      const element = document.getElementById('pdf-content');
      if (!element) {
        setIsExporting(false);
        return;
      }
      window.scrollTo(0, 0);
      const opt = {
        margin: 0,
        filename: `${activeNote.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: {
          scale: 2,
          useCORS: true,
          scrollY: 0,
          scrollX: 0,
          x: 0,
          y: 0,
          width: 794,
          windowWidth: 794
        },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
        pagebreak: { mode: ['css', 'legacy'] }
      };
      html2pdf().set(opt).from(element).save().then(() => setIsExporting(false)).catch(() => setIsExporting(false));
    }, 1500);
  };

  const isDark = theme === Theme.DARK;

  // Glassnote.ai palette inspired by the shared Figma
  const baseBg = isDark ? 'bg-[#0f1625]' : 'bg-[#f5f7fb]';
  const chromePanel = isDark
    ? 'bg-white/[0.03] border border-white/[0.06] shadow-[0_18px_60px_-30px_rgba(0,0,0,0.8)]'
    : 'bg-white border border-black/[0.05] shadow-[0_22px_70px_-34px_rgba(15,23,42,0.18)]';
  const textPrimary = isDark ? 'text-[#d9e5f7]' : 'text-[#1f2a3d]';
  const textSecondary = isDark ? 'text-[#9cb1d3]' : 'text-[#4a5970]';
  const textMuted = isDark ? 'text-[#6b7b95]' : 'text-[#7c8ba5]';
  const accentColor = isDark ? '#2b7fff' : '#2463eb';
  const accentChip = isDark
    ? 'bg-[rgba(43,127,255,0.15)] border border-[rgba(43,127,255,0.3)] shadow-[0_10px_24px_-14px_rgba(43,127,255,0.55)]'
    : 'bg-[rgba(36,99,235,0.14)] border border-[rgba(36,99,235,0.24)] shadow-[0_10px_24px_-14px_rgba(36,99,235,0.35)]';
  const mutedChip = isDark ? 'bg-white/[0.03] border border-white/[0.06]' : 'bg-white border border-black/[0.05]';
  const iconTint = isDark ? '#c8d5e9' : '#2f3f57';
  const placeholderClass = isDark ? 'placeholder:text-[#6b7b95]' : 'placeholder:text-[#94a3b8]';

  const formattedDate = activeNote
    ? new Date(activeNote.updatedAt).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    })
    : '';

  const tags = activeNote
    ? [
      (activeNote.group || 'general').toLowerCase(),
      ...(activeNote.title ? activeNote.title.toLowerCase().split(' ').slice(0, 2) : [])
    ]
    : [];

  const handleRestoreFromTrash = (id: string) => {
    const restored = restoreNoteFromTrash(id);
    if (!restored) return;
    const cleaned: Note = { ...restored, deletedAt: undefined, updatedAt: Date.now() };
    saveNote(cleaned);
    setNotes(prev => [cleaned, ...prev]);
    setTrashNotes(getTrashNotes());
    setIsTrashOpen(false);
    setActiveNoteId(cleaned.id);
  };

  const handleDeleteFromTrash = (id: string) => {
    const updated = deleteTrashNote(id);
    setTrashNotes(updated);
  };

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('glassnote_theme', theme);
    }
  }, [theme]);



  const toggleFullScreen = () => {
    setIsFullScreen(prev => {
      if (!prev) {
        setWasSidebarCollapsed(isSidebarCollapsed);
        setIsSidebarCollapsed(true);
        setIsListOpen(false);
      } else {
        setIsSidebarCollapsed(wasSidebarCollapsed);
      }
      return !prev;
    });
  };

  return (
    <div className={`min-h-screen w-full relative overflow-hidden ${baseBg} transition-colors duration-300`}>
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-40 -top-48 size-[520px] bg-[radial-gradient(circle_at_center,rgba(43,127,255,0.16),transparent_60%)] blur-[120px]" />
        <div className="absolute right-[-140px] top-[-100px] size-[540px] bg-[radial-gradient(circle_at_center,rgba(110,216,255,0.18),transparent_60%)] blur-[130px]" />
        <div className="absolute bottom-[-180px] right-[-120px] size-[520px] bg-[radial-gradient(circle_at_center,rgba(65,142,255,0.24),transparent_60%)] blur-[120px]" />
      </div>

      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept=".md,.txt,.markdown"
        multiple
        className="hidden"
      />

      {/* PDF Export Overlay */}
      {isExporting && activeNote && (
        <div className="absolute top-0 left-0 z-[9999] bg-white w-full min-h-screen">
          <style>
            {`
              #pdf-content { width: 794px; padding: 20mm; background: white; color: black !important; position: absolute; top: 0; left: 0; }
              #pdf-content * { color: black !important; text-shadow: none !important; }
              #pdf-content .prose p, #pdf-content .prose ul, #pdf-content .prose ol, #pdf-content .prose li, #pdf-content .prose table, #pdf-content .katex-display { page-break-inside: avoid !important; }
            `}
          </style>
          <div className="fixed top-5 right-5 bg-black/80 text-white px-6 py-3 rounded-lg backdrop-blur-md shadow-xl z-[10000] flex items-center gap-3">
            <Loader2 className="animate-spin" size={20} />
            <span className="font-medium text-sm">Generating PDF...</span>
          </div>
          <div id="pdf-content">
            <div className="prose prose-slate max-w-none">
              <div className="mb-8 border-b border-gray-200 pb-4">
                <h1 className="text-4xl font-bold mb-2 leading-tight">{activeNote.title}</h1>
                <p className="text-gray-500 text-sm">{new Date(activeNote.updatedAt).toLocaleDateString()} • {activeNote.group}</p>
              </div>
              <MarkdownView content={activeNote.content} theme={Theme.LIGHT} />
            </div>
          </div>
        </div>
      )}

      {/* Main Layout */}
      {!isExporting && (
        <div className="relative flex h-screen gap-4 px-4 py-4">
          {/* Desktop Sidebar */}
          {!isSidebarCollapsed && (
            <div className="hidden md:block w-[240px] shrink-0">
              <NoteList
                notes={filteredNotes}
                activeId={activeNoteId || ''}
                onSelect={(id) => selectNote(id)}
                onDelete={handleDeleteNote}
                onNewNote={handleNewNote}
                onNewFolder={openFolderDialog}
                onImport={handleImportClick}
                onExport={handleExportPdf}
                onOpenTrash={() => setIsTrashOpen(true)}
                isOpen={true}
                onClose={() => { }}
                theme={theme}
                pinned
                searchQuery={searchQuery}
              />
            </div>
          )}

          {/* Main Content Area */}
          <main className="flex-1 min-w-0">
            <div className={`relative flex h-full flex-col overflow-hidden rounded-3xl backdrop-blur-2xl ${chromePanel}`}>
              <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_10%_15%,rgba(255,255,255,0.05),transparent_45%)]" />
              <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_80%_10%,rgba(43,127,255,0.08),transparent_38%)]" />
              <div className="relative flex h-full flex-col">
                {activeNote ? (
                  <>
                    <div className="px-4 pt-3 flex items-center gap-3">
                      <TabBar
                        tabs={tabs}
                        notes={notes}
                        activeId={activeNoteId}
                        onSelect={selectNote}
                        onClose={handleCloseTab}
                        theme={theme}
                      />
                      <Toolbar
                        theme={theme}
                        onToggleTheme={() => setTheme(isDark ? Theme.LIGHT : Theme.DARK)}
                        onToggleSidebar={() => setIsSidebarCollapsed((prev) => !prev)}
                        activeNote={activeNote}
                        onExport={handleExportPdf}
                        onImport={handleImportClick}
                      />
                    </div>
                    <div className="flex items-center justify-between gap-3 px-6 pt-5 pb-3">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            if (isMobile) {
                              setIsListOpen(true);
                            } else {
                              setIsSidebarCollapsed(prev => !prev);
                            }
                          }}
                          className={`h-8 w-8 rounded-full flex items-center justify-center ${mutedChip} transition-all duration-150 hover:scale-105 hover:border-white/20 hover:bg-white/[0.08]`}
                          style={{ color: iconTint }}
                          title={isSidebarCollapsed ? 'Show sidebar' : 'Hide sidebar'}
                          type="button"
                        >
                          {isSidebarCollapsed ? <PanelLeft size={16} /> : <PanelLeftClose size={16} />}
                        </button>
                        <span className={`px-3 py-1 text-[12px] rounded-full ${mutedChip}`}>
                          <input
                            type="text"
                            value={activeNote.group || ''}
                            onChange={(e) => updateActiveGroup(e.target.value)}
                            className={`bg-transparent outline-none w-[120px] text-ellipsis ${textSecondary}`}
                            placeholder="General"
                          />
                        </span>
                        <input
                          type="text"
                          value={activeNote.title}
                          onChange={(e) => updateActiveTitle(e.target.value)}
                          className={`px-3 py-1 text-[14px] rounded-full font-semibold outline-none w-[240px] ${accentChip}`}
                          style={{ color: accentColor, background: 'rgba(43,127,255,0.1)' }}
                          placeholder="Untitled"
                        />
                      </div>
                      <div className="flex items-center gap-2">
                        {[Heading1, Heading2, Bold, Italic, List, ListOrdered, Link2, Image, CheckSquare].map((IconComp, idx) => (
                          <button
                            key={idx}
                            className={`h-8 w-8 rounded-full flex items-center justify-center ${mutedChip} transition-all duration-150 hover:scale-105 hover:border-white/20 hover:bg-white/[0.08]`}
                            style={{ color: iconTint }}
                            title="Formatting control"
                            type="button"
                          >
                            <IconComp size={14} strokeWidth={1.8} />
                          </button>
                        ))}
                        <button
                          onClick={() => setViewMode(viewMode === ViewMode.EDIT ? ViewMode.PREVIEW : ViewMode.EDIT)}
                          className={`h-8 rounded-full px-3 text-[12px] font-medium transition-all duration-150 flex items-center gap-2 ${viewMode === ViewMode.PREVIEW ? accentChip : mutedChip}`}
                          style={{ color: viewMode === ViewMode.PREVIEW ? accentColor : iconTint }}
                          title={viewMode === ViewMode.EDIT ? 'Preview' : 'Edit'}
                          type="button"
                        >
                          {viewMode === ViewMode.PREVIEW ? <Eye size={14} /> : <Edit3 size={14} />}
                          {viewMode === ViewMode.PREVIEW ? 'Preview' : 'Edit'}
                        </button>
                        <button
                          onClick={() => setTheme(isDark ? Theme.LIGHT : Theme.DARK)}
                          className={`h-8 w-8 rounded-full flex items-center justify-center transition-all duration-150 ${mutedChip} hover:scale-105 hover:border-white/20 hover:bg-white/[0.08]`}
                          style={{ color: accentColor }}
                          title="Toggle theme"
                          type="button"
                        >
                          {isDark ? <Sun size={15} /> : <Moon size={15} />}
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 px-6 pb-4 text-[13px]">
                      {formattedDate && (
                        <span className={`flex items-center gap-2 ${textSecondary}`}>
                          <Calendar size={12} />
                          {formattedDate}
                        </span>
                      )}
                      <div className="flex items-center gap-2 overflow-x-auto">
                        {tags.map((tag, idx) => (
                          <span key={`${tag}-${idx}`} className={`px-2 py-1 rounded-full text-[12px] capitalize ${mutedChip} ${textSecondary}`}>
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div ref={contentRef} className="flex-1 overflow-y-auto px-6 pb-6">
                      <div className={`rounded-2xl border backdrop-blur-xl px-6 py-5 ${mutedChip} bg-[#0f1625]/60`}>
                        <div className="flex items-center justify-between gap-2">
                          <input
                            type="text"
                            value={activeNote.title}
                            onChange={(e) => updateActiveTitle(e.target.value)}
                            className={`bg-transparent text-2xl md:text-3xl font-semibold outline-none flex-1 min-w-0 leading-tight ${textPrimary}`}
                            placeholder="Weekly Team Sync"
                          />
                          <div className="flex items-center gap-2">
                            <button
                              onClick={toggleFullScreen}
                              className={`h-9 w-9 rounded-full flex items-center justify-center transition-all duration-150 ${mutedChip} hover:scale-105 hover:border-white/20 hover:bg-white/[0.08]`}
                              style={{ color: iconTint }}
                              title={isFullScreen ? 'Exit fullscreen' : 'Fullscreen'}
                              type="button"
                            >
                              {isFullScreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
                            </button>
                            <button
                              className={`h-9 w-9 rounded-full flex items-center justify-center transition-all duration-150 ${mutedChip} hover:scale-105 hover:border-white/20 hover:bg-white/[0.08]`}
                              style={{ color: iconTint }}
                              type="button"
                              onClick={() => handleExportPdf()}
                              title="Export PDF"
                            >
                              <Share size={16} />
                            </button>
                          </div>
                        </div>
                        <p className={`mt-2 text-sm ${textMuted}`}>
                          {formattedDate ? `Last edited ${formattedDate}` : 'Start a new note'}
                        </p>
                        <div className="mt-4">
                          {viewMode === ViewMode.EDIT ? (
                            <textarea
                              style={{ fontSize: `${(zoom / 100) * 15}px` }}
                              className={`w-full min-h-[60vh] outline-none resize-none leading-relaxed bg-transparent ${textPrimary} ${placeholderClass}`}
                              placeholder="Start writing..."
                              value={activeNote.content}
                              onChange={(e) => updateActiveNote(e.target.value)}
                              spellCheck={false}
                            />
                          ) : (
                            <MarkdownView content={activeNote.content} theme={theme} zoom={zoom} />
                          )}
                        </div>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="flex flex-1 items-center justify-center">
                    <div className={`text-center ${textMuted}`}>
                      <div className={`w-16 h-16 rounded-xl mx-auto mb-4 flex items-center justify-center ${mutedChip}`}>
                        <Edit3 size={28} />
                      </div>
                      <p className="text-lg font-medium mb-1">No note selected</p>
                      <p className="text-sm">Select a note from the sidebar or create a new one</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </main>
        </div>
      )}

      {/* Mobile Sidebar Overlay */}
      {!isExporting && (
        <div className="md:hidden">
          <NoteList
            notes={filteredNotes}
            activeId={activeNoteId || ''}
            onSelect={(id) => {
              selectNote(id);
              setIsListOpen(false);
            }}
            onDelete={handleDeleteNote}
            onNewNote={handleNewNote}
            onNewFolder={openFolderDialog}
            onImport={handleImportClick}
            onExport={handleExportPdf}
            onOpenTrash={() => setIsTrashOpen(true)}
            isOpen={isListOpen}
            onClose={() => setIsListOpen(false)}
            theme={theme}
            pinned={false}
            searchQuery={searchQuery}
          />
        </div>
      )}

      {/* Mobile Dock */}
      {!isExporting && !isListOpen && !isFullScreen && (
        <div className="md:hidden">
          <GlassDock
            onToggleList={() => setIsListOpen(true)}
            theme={theme}
          />
        </div>
      )}

      {/* Scroll Progress Indicator */}
      {!isExporting && activeNote && (
        <ScrollProgress contentRef={contentRef} theme={theme} />
      )}

      <TrashDrawer
        notes={trashNotes}
        isOpen={isTrashOpen}
        onClose={() => setIsTrashOpen(false)}
        onRestore={handleRestoreFromTrash}
        onDelete={handleDeleteFromTrash}
        theme={theme}
      />
    </div>
  );
};

export default App;
