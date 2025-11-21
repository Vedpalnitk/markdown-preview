import React, { useState, useEffect, useRef } from 'react';
import { Note, ViewMode, Theme } from './types';
import { getNotes, saveNote, createNewNote, deleteNote } from './services/storageService';
import { MarkdownView } from './components/MarkdownView';
import { GlassDock } from './components/GlassDock';
import { NoteList } from './components/NoteList';
import { Loader2, Folder, Sun, Moon, Eye, Pencil, FolderPlus, X, Check, Maximize2, Minimize2, ZoomIn, ZoomOut } from 'lucide-react';

// Declare html2pdf global
declare const html2pdf: any;

const App: React.FC = () => {
  const prefersDark = typeof window !== 'undefined' && window.matchMedia?.('(prefers-color-scheme: dark)').matches;
  const [notes, setNotes] = useState<Note[]>([]);
  const [activeNoteId, setActiveNoteId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>(ViewMode.EDIT);
  const [theme, setTheme] = useState<Theme>(prefersDark ? Theme.DARK : Theme.LIGHT);
  const [isListOpen, setIsListOpen] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [zoom, setZoom] = useState(100);
  
  // Folder Creation Modal State
  const [showFolderDialog, setShowFolderDialog] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const folderInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const loadedNotes = getNotes();
    setNotes(loadedNotes);
    if (loadedNotes.length > 0) {
      setActiveNoteId(loadedNotes[0].id);
    } else {
      handleNewNote();
    }
    
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      setTheme(Theme.DARK);
    }

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

  // Apple-style Liquid Glass Gradient Backgrounds
  const bgGradient = isDark
    ? "bg-[radial-gradient(ellipse_at_center,_rgba(24,26,33,0.9)_0%,_rgba(10,12,18,0.95)_45%,_rgba(4,6,12,1)_100%)]"
    : "bg-[radial-gradient(ellipse_at_center,_rgba(248,249,252,1)_0%,_rgba(235,239,246,1)_55%,_rgba(224,230,241,1)_100%)]";

  const panelShell = isDark
    ? 'bg-[linear-gradient(135deg,_rgba(26,28,36,0.8),_rgba(22,24,32,0.95))] border border-white/5 text-slate-100 shadow-[0_20px_60px_-30px_rgba(0,0,0,0.7)] ring-1 ring-white/10'
    : 'bg-[linear-gradient(135deg,_#ffffff,_#f3f5fa)] border border-slate-200 text-slate-800 shadow-[0_20px_60px_-30px_rgba(59,130,246,0.35)] ring-1 ring-white/80';

  const controlButtonClass = `p-2.5 rounded-full backdrop-blur-2xl transition-all duration-300 hover:-translate-y-0.5 active:scale-95 ${
    isDark
      ? 'bg-gradient-to-br from-white/12 via-blue-500/10 to-white/6 text-blue-100/90 shadow-[0_12px_32px_-16px_rgba(0,0,0,0.65)]'
      : 'bg-gradient-to-br from-white via-blue-50/80 to-white text-blue-700/90 shadow-[0_12px_32px_-16px_rgba(59,130,246,0.35)]'
  }`;

  const chipClass = `px-3 py-1 rounded-full text-[11px] font-semibold tracking-wide border backdrop-blur transition-colors ${
    isDark
      ? 'bg-white/5 border-white/10 text-blue-100/80'
      : 'bg-white/80 border-white/70 text-slate-600'
  }`;

  return (
    <div className={`min-h-screen w-full relative ${bgGradient} transition-colors duration-700 overflow-hidden selection:bg-blue-500/30`}>
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className={`absolute -left-24 -top-10 w-72 h-72 rounded-full blur-3xl opacity-40 ${isDark ? 'bg-indigo-900/40' : 'bg-slate-200/80'}`} />
        <div className={`absolute right-[-10%] top-20 w-[360px] h-[360px] rounded-full blur-3xl opacity-40 ${isDark ? 'bg-slate-900/60' : 'bg-blue-200/70'}`} />
        <div className={`absolute inset-x-0 bottom-[-30%] h-[420px] blur-3xl opacity-40 ${isDark ? 'bg-gradient-to-br from-slate-900/60 via-indigo-900/30 to-black/70' : 'bg-gradient-to-br from-slate-100/80 via-white/50 to-blue-50/70'}`} />
        <div className={`absolute inset-0 ${isDark ? 'opacity-[0.08]' : 'opacity-[0.08]'} bg-[radial-gradient(circle_at_center,_rgba(255,255,255,0.2)_1px,_transparent_1px)] [background-size:18px_18px]`} />
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
        <div className="md:flex md:items-stretch md:gap-4 h-screen">
          <div className="hidden md:flex md:flex-col md:pt-4 md:pl-3 md:pb-4">
            <NoteList 
              notes={notes}
              activeId={activeNoteId || ''}
              onSelect={(id) => setActiveNoteId(id)}
              onDelete={handleDeleteNote}
              onNewNote={handleNewNote}
              onNewFolder={openFolderDialog}
              onImport={handleImportClick}
              onExport={handleExportPdf}
              isOpen={true}
              onClose={() => {}}
              theme={theme}
              pinned
            />
          </div>

          <main className={`h-screen w-full overflow-hidden pt-4 pb-6 px-3 md:px-4 transition-all duration-500 md:flex-1`}>
            <div className={`${isFullScreen ? 'max-w-6xl' : 'max-w-5xl'} mx-auto h-full transition-all duration-500 flex flex-col min-h-0`}>
              <div className="mb-3 px-2 md:px-4" />

              {activeNote ? (
                <div className={`backdrop-blur-2xl rounded-[18px] shadow-xl border transition-all duration-500 flex-1 relative overflow-hidden flex flex-col min-h-0 ${panelShell}`}>
                  <div className={`sticky top-0 z-10 flex flex-wrap items-start justify-between gap-2 border-b border-white/10 pb-3 pt-4 px-5 md:px-8 backdrop-blur-2xl ${isDark ? 'bg-[#0e1016]/85' : 'bg-white/70'}`}>
                  <div className="flex flex-col gap-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <Folder size={16} className={isDark ? 'text-blue-200' : 'text-blue-600'} />
                        <input
                          type="text"
                          value={activeNote.group || 'GENERAL'}
                          onChange={(e) => updateActiveGroup(e.target.value)}
                          className={`bg-transparent outline-none uppercase tracking-[0.12em] text-[12px] font-semibold w-44 focus:ring-0 ${isDark ? 'text-slate-100' : 'text-slate-700'}`}
                          placeholder="GROUP"
                        />
                      </div>
                      <input
                        type="text"
                        value={activeNote.title}
                        className={`bg-transparent text-xl md:text-2xl font-semibold outline-none truncate w-full bg-clip-text leading-tight tracking-tight px-0 ${
                          isDark ? 'text-white' : 'text-slate-900'
                        }`}
                        onChange={(e) => updateActiveTitle(e.target.value)}
                      />
                    </div>
                    <div className="flex items-center gap-2 flex-wrap justify-end">
                      <button
                        onClick={() => setZoom(Math.max(50, zoom - 10))}
                        className={controlButtonClass}
                        title="Zoom Out"
                      >
                        <ZoomOut size={16} />
                      </button>
                      <span className={`px-3 py-2 rounded-full text-xs font-semibold ${isDark ? 'text-blue-200 bg-white/5 border border-white/10' : 'text-blue-700 bg-white/80 border border-white/70 shadow-sm'}`}>{zoom}%</span>
                      <button
                        onClick={() => setZoom(Math.min(200, zoom + 10))}
                        className={controlButtonClass}
                        title="Zoom In"
                      >
                        <ZoomIn size={16} />
                      </button>
                      <button
                        onClick={() => setIsFullScreen(!isFullScreen)}
                        className={controlButtonClass}
                        title="Toggle Full Screen"
                      >
                        {isFullScreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
                      </button>
                      <button
                        onClick={() => setViewMode(viewMode === ViewMode.EDIT ? ViewMode.PREVIEW : ViewMode.EDIT)}
                        className={controlButtonClass}
                        title="Toggle View Mode"
                      >
                        {viewMode === ViewMode.EDIT ? <Eye size={16} /> : <Pencil size={16} />}
                      </button>
                    </div>
                  </div>

                  <div className="p-2 md:p-3 overflow-y-auto flex-1 min-h-0 max-h-full">
                    {viewMode === ViewMode.EDIT ? (
                      <textarea
                        style={{ fontSize: `${(zoom / 100) * 12}px` }}
                        className={`w-full min-h-[70vh] bg-transparent outline-none resize-none font-mono leading-relaxed placeholder:opacity-40 p-1 tracking-tight ${
                          isDark ? 'text-gray-200' : 'text-slate-800'
                        }`}
                        placeholder="Start typing your markdown..."
                        value={activeNote.content}
                        onChange={(e) => updateActiveNote(e.target.value)}
                        spellCheck={false}
                      />
                    ) : (
                      <div className="flex-1 overflow-y-auto p-1" id="markdown-content-area">
                        <MarkdownView content={activeNote.content} theme={theme} zoom={zoom} />
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className={`flex flex-col items-center justify-center h-[80vh] text-center opacity-40 ${isDark ? 'text-blue-200' : 'text-slate-500'}`}>
                  <div className="mb-4 p-6 rounded-[32px] bg-white/5 backdrop-blur-xl">
                    <Folder size={48} strokeWidth={1} />
                  </div>
                  <p className="text-lg font-medium">Select a note from the library</p>
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
            notes={notes}
            activeId={activeNoteId || ''}
            onSelect={(id) => { 
              setActiveNoteId(id); 
              if (window.innerWidth < 768) {
                setIsListOpen(false);
              }
            }}
            onDelete={handleDeleteNote}
            onNewNote={handleNewNote}
            onNewFolder={openFolderDialog}
            onImport={handleImportClick}
            onExport={handleExportPdf}
            isOpen={isListOpen}
            onClose={() => setIsListOpen(false)}
            theme={theme}
            pinned={false}
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
          className={`fixed bottom-6 right-6 z-40 w-12 h-12 rounded-full flex items-center justify-center backdrop-blur-2xl transition-all duration-300 hover:scale-105 active:scale-95 ${
            isDark
              ? 'bg-white/10 text-blue-100 shadow-[0_14px_30px_-16px_rgba(0,0,0,0.7)]'
              : 'bg-white/80 text-blue-700 shadow-[0_14px_30px_-16px_rgba(59,130,246,0.35)]'
          }`}
          title="Toggle theme"
        >
          {isDark ? <Sun size={18} /> : <Moon size={18} />}
        </button>
      )}
    </div>
  );
};

export default App;
