import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Note, ViewMode, Theme } from './types';
import { getNotes, saveNote, createNewNote, deleteNote, getTrashNotes, moveNoteToTrash, restoreNoteFromTrash, deleteTrashNote } from './services/storageService';
import { MarkdownView } from './components/MarkdownView';
import { GlassDock } from './components/GlassDock';
import { TrashDrawer } from './components/TrashDrawer';
import { NoteList } from './components/NoteList';
import { Loader2, Folder, Sun, Moon, Eye, Pencil, FolderPlus, X, Check, Maximize2, Minimize2, ZoomIn, ZoomOut, PanelLeftClose, PanelRightOpen, Search, Menu } from 'lucide-react';

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
  
  // Folder Creation Modal State
  const [showFolderDialog, setShowFolderDialog] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const folderInputRef = useRef<HTMLInputElement>(null);
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
    if (activeNoteId === id) {
      setActiveNoteId(remaining.length > 0 ? remaining[0].id : null);
    }
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
  const liquidButtonTone = isDark ? 'liquid-btn liquid-btn-dark text-white' : 'liquid-btn liquid-btn-light text-[#0B1B40]';

  // iOS 26 Liquid‑Glass background + surface tokens
  const bgGradient = isDark
    ? 'bg-[linear-gradient(165deg,_#001226_0%,_#001A33_55%,_#003C88_100%)]'
    : 'bg-[linear-gradient(135deg,_#0052CC_0%,_#1A8CFF_45%,_#00D4FF_100%)]';

  const bgMesh = isDark
    ? 'bg-[radial-gradient(circle_at_20%_18%,rgba(0,232,255,0.14)_0%,rgba(0,0,0,0)_42%),radial-gradient(circle_at_78%_10%,rgba(0,240,200,0.12)_0%,rgba(0,0,0,0)_38%),radial-gradient(circle_at_50%_78%,rgba(0,82,204,0.28)_0%,rgba(0,0,0,0)_45%)]'
    : 'bg-[radial-gradient(circle_at_22%_15%,rgba(26,140,255,0.18)_0%,rgba(255,255,255,0)_42%),radial-gradient(circle_at_82%_12%,rgba(3,255,224,0.16)_0%,rgba(255,255,255,0)_40%),radial-gradient(circle_at_52%_80%,rgba(0,212,255,0.3)_0%,rgba(255,255,255,0)_48%)]';

  const panelShell = isDark
    ? 'bg-[linear-gradient(145deg,_rgba(10,10,10,0.35),_rgba(0,0,0,0.55))] border border-[#0f1d2f] text-slate-100 shadow-[0_28px_80px_-38px_rgba(0,0,0,0.85)] ring-1 ring-[#0a1624]'
    : 'bg-[linear-gradient(145deg,_rgba(255,255,255,0.85),_rgba(255,255,255,0.65))] border border-white/70 text-[#001226] shadow-[0_32px_90px_-45px_rgba(0,82,204,0.35)] ring-1 ring-white/80';

  const docHeaderClass = isDark
    ? 'relative overflow-hidden bg-[linear-gradient(140deg,_rgba(0,8,20,0.85),_rgba(0,18,38,0.65))] border-[#0d243c] shadow-[0_26px_70px_-34px_rgba(0,0,0,0.85)] backdrop-blur-[32px] backdrop-saturate-150 ring-1 ring-[#031025] text-white'
    : 'relative overflow-hidden bg-[linear-gradient(140deg,_rgba(255,255,255,0.92),_rgba(255,255,255,0.7))] border-[#DAE4F5]/80 shadow-[0_24px_70px_-32px_rgba(0,82,204,0.25)] backdrop-blur-[28px] ring-1 ring-white/70 text-[#001226]';

  const docHeaderGlow = isDark
    ? 'bg-[radial-gradient(circle_at_18%_20%,rgba(0,232,255,0.2),transparent),radial-gradient(circle_at_80%_5%,rgba(0,82,204,0.25),transparent)]'
    : 'bg-[radial-gradient(circle_at_15%_20%,rgba(26,140,255,0.15),transparent),radial-gradient(circle_at_85%_0%,rgba(3,255,224,0.18),transparent)]';

  const docBodyClass = isDark
    ? 'bg-[rgba(0,8,20,0.9)] text-slate-100'
    : 'bg-white text-[#001226]';

  const controlButtonClass = `${liquidButtonTone} liquid-btn-icon h-9 w-9 font-semibold text-[11px]`;

  const chipClass = `px-3 py-2 rounded-[18px] text-xs font-semibold tracking-wide border flex items-center justify-center ring-1 ${
    isDark
      ? 'bg-[#071426]/70 border-[#0d243c] ring-[#031025] text-[#00E8FF] shadow-[0_14px_32px_-18px_rgba(0,0,0,0.75)]'
      : 'bg-[linear-gradient(145deg,_#fdfdff,_#eef2ff)] border-[#dfe7fb] ring-white/70 text-[#0052CC] shadow-[0_16px_40px_-24px_rgba(0,82,204,0.35)]'
  }`;

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

  const controlGroupClass = `flex items-center gap-1.5 rounded-full border px-2.5 py-1 backdrop-blur ring-1 ${
    isDark
      ? 'border-white/10 bg-[linear-gradient(150deg,_rgba(0,18,38,0.88),_rgba(0,26,51,0.7))] ring-white/12 shadow-[0_20px_55px_-28px_rgba(0,0,0,0.65)]'
      : 'border-white/70 bg-[linear-gradient(135deg,_rgba(255,255,255,0.95),_rgba(255,255,255,0.75))] ring-white/80 shadow-[0_22px_52px_-30px_rgba(0,82,204,0.36)]'
  }`;

  const searchInputClass = `min-w-[160px] w-full rounded-full pl-8 pr-3 h-9 text-xs font-semibold outline-none border ring-1 transition-all duration-300 ${
    isDark
      ? 'bg-[#071426]/70 border-[#0d243c] ring-[#031025] text-white placeholder:text-white/60 focus:border-[#00E8FF]'
      : 'bg-[linear-gradient(145deg,_#ffffff,_#eef4ff)] border-[#dfe7fb] ring-white/70 text-[#0052CC] placeholder:text-slate-400 shadow-[0_16px_40px_-24px_rgba(0,82,204,0.35)] focus:border-[#0052CC]'
  }`;

  return (
    <div className={`min-h-screen w-full relative ${bgGradient} transition-colors duration-700 overflow-hidden selection:bg-[#00D4FF]/30 selection:text-[#001226]`}>
      <div className={`pointer-events-none absolute inset-0 overflow-hidden ${bgMesh}`}>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(255,255,255,0.08)_1px,_transparent_1px)] [background-size:18px_18px]" />
        <div className={`absolute -left-24 top-16 w-80 h-80 rounded-full blur-[120px] opacity-70 ${isDark ? 'bg-[#003C88]/60' : 'bg-[#03FFE0]/50'}`} />
        <div className={`absolute right-[-12%] -top-10 w-[420px] h-[420px] rounded-full blur-[120px] opacity-70 ${isDark ? 'bg-[#00E8FF]/50' : 'bg-[#F9FDFF]/70'}`} />
        <div className={`absolute inset-x-0 bottom-[-32%] h-[460px] blur-[120px] opacity-60 ${isDark ? 'bg-[linear-gradient(160deg,_rgba(0,18,38,0.9),_rgba(0,0,0,0.75))]' : 'bg-[linear-gradient(150deg,_rgba(255,255,255,0.65),_rgba(255,255,255,0.25))]'}`} />
      </div>
      
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleFileChange} 
        accept=".md,.txt,.markdown" 
        multiple
        className="hidden" 
      />


      {isExporting && activeNote && (
        <div className="absolute top-0 left-0 z-[9999] bg-white w-full min-h-screen">
           <style>
            {`
              #pdf-content { width: 794px; padding: 20mm; background: white; color: black !important; position: absolute; top: 0; left: 0; }
              #pdf-content * { color: black !important; text-shadow: none !important; }
              #pdf-content .prose p, #pdf-content .prose ul, #pdf-content .prose ol, #pdf-content .prose li, #pdf-content .prose table, #pdf-content .katex-display { page-break-inside: avoid !important; }
            `}
           </style>
           <div className="fixed top-5 right-5 bg-black/80 text-white px-6 py-3 rounded-full backdrop-blur-md shadow-xl z-[10000] flex items-center gap-3 border border-white/10">
              <Loader2 className="animate-spin" size={20} />
              <span className="font-medium">Generating PDF...</span>
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

      {!isExporting && (
        <div className="md:flex md:items-start md:gap-6 h-screen px-2 md:px-6 py-4 md:pb-10">
          {!isSidebarCollapsed && (
            <div className="hidden md:flex md:flex-col">
              <NoteList 
                notes={filteredNotes}
                activeId={activeNoteId || ''}
                onSelect={(id) => setActiveNoteId(id)}
                onDelete={handleDeleteNote}
                onNewNote={handleNewNote}
                onNewFolder={openFolderDialog}
                onImport={handleImportClick}
                onExport={handleExportPdf}
                onOpenTrash={() => setIsTrashOpen(true)}
                isOpen={true}
                onClose={() => {}}
                theme={theme}
                pinned
                searchQuery={searchQuery}
              />
            </div>
          )}

          <main className={`h-screen md:h-auto md:min-h-[calc(100vh-160px)] w-full overflow-hidden pt-0 pb-6 transition-all duration-500 md:flex-1 md:self-start`}>
            <div className={`${isFullScreen ? 'max-w-6xl' : 'max-w-5xl'} mx-auto h-full transition-all duration-500 flex flex-col min-h-0`}>

              {activeNote ? (
                <div className={`backdrop-blur-[26px] rounded-[20px] shadow-xl border transition-all duration-500 flex-1 relative overflow-hidden flex flex-col min-h-0 ${panelShell}`}>
                <div className={`sticky top-0 z-10 border-b pb-3 pt-4 px-5 md:px-8 ${docHeaderClass}`}>
                  <div className={`absolute inset-0 pointer-events-none opacity-60 ${docHeaderGlow}`} />
                  <div className="relative z-10 flex flex-col gap-4">
                    <div className="flex flex-col lg:flex-row lg:items-center gap-3 lg:gap-6">
                      <div className="flex flex-col gap-1 min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => setIsSidebarCollapsed(prev => !prev)}
                            className={`${controlButtonClass} !h-7 !w-7 hidden md:inline-flex`}
                            title={isSidebarCollapsed ? 'Show Library' : 'Hide Library'}
                          >
                            {isSidebarCollapsed ? <PanelRightOpen size={12} /> : <PanelLeftClose size={12} />}
                          </button>
                          {isMobile && (
                            <button
                              type="button"
                              onClick={() => setIsListOpen(true)}
                              className={`${controlButtonClass} !h-7 !w-7 inline-flex md:hidden`}
                              title="Open Library"
                            >
                              <Menu size={12} />
                            </button>
                          )}
                          <Folder size={16} className={isDark ? 'text-[#00E8FF]' : 'text-[#0052CC]'} />
                          <input
                            type="text"
                            value={activeNote.group || 'GENERAL'}
                            onChange={(e) => updateActiveGroup(e.target.value)}
                            className={`bg-transparent outline-none uppercase tracking-[0.14em] text-[12px] font-semibold w-44 focus:ring-0 ${isDark ? 'text-slate-100' : 'text-slate-700'} placeholder:text-white/50`}
                            placeholder="GROUP"
                          />
                        </div>
                        <input
                          type="text"
                          value={activeNote.title}
                          className={`bg-transparent text-xl md:text-2xl font-semibold outline-none truncate w-full bg-clip-text leading-tight tracking-tight px-0 ${
                            isDark 
                              ? 'text-white drop-shadow-[0_6px_18px_rgba(0,0,0,0.45)]' 
                              : 'text-slate-900'
                          }`}
                          onChange={(e) => updateActiveTitle(e.target.value)}
                        />
                      </div>
                      <div className="flex flex-wrap items-center justify-end gap-3 lg:flex-none">
                        <div className={controlGroupClass}>
                          <button
                            onClick={() => setZoom(Math.max(50, zoom - 10))}
                            className={`${controlButtonClass} !h-9 !w-9`}
                            title="Zoom Out"
                          >
                            <ZoomOut size={18} strokeWidth={2.2} />
                          </button>
                          <span className={`${chipClass} !h-7 px-2.5`}>{zoom}%</span>
                          <button
                            onClick={() => setZoom(Math.min(200, zoom + 10))}
                            className={`${controlButtonClass} !h-9 !w-9`}
                            title="Zoom In"
                          >
                            <ZoomIn size={18} strokeWidth={2.2} />
                          </button>
                        </div>
                        <div className={controlGroupClass}>
                          <button
                            onClick={() => setViewMode(viewMode === ViewMode.EDIT ? ViewMode.PREVIEW : ViewMode.EDIT)}
                            className={`${controlButtonClass} !h-9 !w-9`}
                            title="Toggle View Mode"
                          >
                            {viewMode === ViewMode.EDIT ? <Eye size={18} strokeWidth={2.2} /> : <Pencil size={18} strokeWidth={2.2} />}
                          </button>
                          <button
                            onClick={toggleFullScreen}
                            className={`${controlButtonClass} !h-9 !w-9`}
                            title="Toggle Full Screen"
                          >
                            {isFullScreen ? <Minimize2 size={18} strokeWidth={2.2} /> : <Maximize2 size={18} strokeWidth={2.2} />}
                          </button>
                        </div>
                        <div className="relative">
                          <Search size={16} className={`absolute left-3 top-1/2 -translate-y-1/2 ${isDark ? 'text-white/60' : 'text-slate-400'}`} />
                          <input
                            type="search"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search"
                            className={`${searchInputClass} lg:w-56`}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                  <div className={`flex-1 min-h-0 max-h-full px-6 md:px-10 pb-10 pt-6 ${docBodyClass} overflow-y-auto`} id="markdown-content-area">
                    {viewMode === ViewMode.EDIT ? (
                      <textarea
                        style={{ fontSize: `${(zoom / 100) * 12}px` }}
                        className={`w-full min-h-[70vh] outline-none resize-none font-mono leading-relaxed placeholder:opacity-40 bg-transparent ${
                          isDark 
                            ? 'text-slate-100 caret-[#00E8FF]'
                            : 'text-[#001226] caret-[#0052CC]'
                        }`}
                        placeholder="Start typing your markdown..."
                        value={activeNote.content}
                        onChange={(e) => updateActiveNote(e.target.value)}
                        spellCheck={false}
                      />
                    ) : (
                      <MarkdownView content={activeNote.content} theme={theme} zoom={zoom} />
                    )}
                  </div>
                </div>
              ) : (
                <div className={`flex flex-col items-center justify-center h-[80vh] text-center opacity-90 ${isDark ? 'text-[#00E8FF]/80' : 'text-[#0052CC]/80'}`}>
                  <div className={`mb-4 p-6 rounded-[32px] backdrop-blur-xl border ${
                    isDark ? 'bg-[rgba(0,18,38,0.7)] border-white/12 shadow-[0_18px_36px_-24px_rgba(0,0,0,0.8)]' : 'bg-[rgba(255,255,255,0.75)] border-white/70 shadow-[0_18px_36px_-24px_rgba(0,82,204,0.25)]'
                  }`}>
                    <Folder size={48} strokeWidth={1.5} />
                  </div>
                  <p className="text-lg font-medium tracking-tight">Select a note from the library</p>
                </div>
              )}
            </div>
          </main>
        </div>
      )}

      {/* Mobile overlay sidebar */}
      {!isExporting && (
        <div className="md:hidden">
          <NoteList 
            notes={filteredNotes}
            activeId={activeNoteId || ''}
            onSelect={(id) => { 
              setActiveNoteId(id); 
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

      {!isExporting && !isListOpen && !isFullScreen && (
        <div className="md:hidden">
          <GlassDock 
            onToggleList={() => setIsListOpen(true)}
            theme={theme}
          />
        </div>
      )}

      {/* Theme toggle - bottom right glass icon */}
      {!isExporting && (
        <button
          onClick={() => setTheme(isDark ? Theme.LIGHT : Theme.DARK)}
          className={`fixed bottom-6 right-6 z-40 w-12 h-12 rounded-full ${liquidButtonTone} liquid-btn-icon text-base hover:scale-[1.04]`}
          title="Toggle theme"
        >
          {isDark ? <Sun size={18} /> : <Moon size={18} />}
        </button>
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
