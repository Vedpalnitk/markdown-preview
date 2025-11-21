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
  const [notes, setNotes] = useState<Note[]>([]);
  const [activeNoteId, setActiveNoteId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>(ViewMode.EDIT);
  const [theme, setTheme] = useState<Theme>(Theme.LIGHT);
  const [isListOpen, setIsListOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [zoom, setZoom] = useState(70);
  
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
    if (!activeNote) return;
    
    const titleMatch = content.match(/^#\s+(.*)/);
    const title = titleMatch ? titleMatch[1] : (content.slice(0, 20) || 'Untitled');
    
    const updatedNote = {
      ...activeNote,
      content,
      title,
      updatedAt: Date.now()
    };

    const updatedNotes = notes.map(n => n.id === activeNoteId ? updatedNote : n);
    setNotes(updatedNotes);
    saveNote(updatedNote);
  };

  const updateActiveGroup = (group: string) => {
    if (!activeNote) return;
    const upperGroup = group.toUpperCase();
    const updatedNote = { ...activeNote, group: upperGroup, updatedAt: Date.now() };
    const updatedNotes = notes.map(n => n.id === activeNoteId ? updatedNote : n);
    setNotes(updatedNotes);
    saveNote(updatedNote);
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
    ? "bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-slate-900 via-black to-slate-950"
    : "bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-blue-100 via-white to-blue-50";

  return (
    <div className={`min-h-screen w-full relative ${bgGradient} transition-colors duration-700 overflow-hidden selection:bg-blue-500/30`}>
      
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

      <button
        onClick={() => setTheme(theme === Theme.LIGHT ? Theme.DARK : Theme.LIGHT)}
        className={`fixed top-6 right-6 z-50 p-4 rounded-[24px] shadow-xl backdrop-blur-2xl border transition-all duration-300 hover:scale-110 active:scale-95 ${
          isDark
            ? 'bg-gradient-to-br from-slate-900/50 to-black/50 text-blue-200 border-white/20 shadow-black/50 hover:text-white hover:from-slate-800/60 hover:to-black/60 ring-1 ring-white/10'
            : 'bg-gradient-to-br from-white/80 to-blue-50/60 text-blue-600 border-white/60 shadow-blue-300/40 hover:text-blue-800 hover:from-white/90 hover:to-blue-50/80 ring-1 ring-white/40'
        }`}
      >
        {theme === Theme.DARK ? <Sun size={22} /> : <Moon size={22} />}
      </button>


      {!isExporting && (
        <main className={`h-screen w-full overflow-y-auto pt-10 pb-32 px-4 md:px-0 transition-all duration-500 ${isListOpen && !isFullScreen ? 'md:pl-72' : ''}`}>
          <div className={`${isFullScreen ? 'max-w-6xl' : 'max-w-4xl'} mx-auto transition-all duration-500`}>
            {activeNote ? (
              <div className={`backdrop-blur-3xl rounded-[48px] shadow-2xl border transition-all duration-500 min-h-[85vh] mb-10 relative overflow-hidden
                ${isDark
                  ? 'bg-gradient-to-br from-black/40 via-slate-900/30 to-black/40 border-white/20 text-blue-50 shadow-black/50 ring-1 ring-white/10'
                  : 'bg-gradient-to-br from-white/70 via-blue-50/40 to-white/70 border-white/80 text-slate-800 shadow-blue-200/50 ring-1 ring-white/60'
                }`}>

                <div className={`sticky top-0 z-10 flex flex-col gap-6 border-b border-white/10 pb-6 pt-8 px-8 md:px-12 backdrop-blur-2xl ${isDark ? 'bg-black/50' : 'bg-white/50'}`}>
                  <div className="flex justify-between items-start">
                    <div className="flex flex-col gap-2">
                       <div className={`flex items-center gap-2 text-sm transition-opacity opacity-80 hover:opacity-100 font-medium tracking-wide ${isDark ? 'text-blue-300' : 'text-blue-600'}`}>
                        <Folder size={16} />
                        <input
                          type="text"
                          value={activeNote.group || 'GENERAL'}
                          onChange={(e) => updateActiveGroup(e.target.value)}
                          className="bg-transparent border-b-2 border-transparent hover:border-current focus:border-current outline-none transition-all w-40 uppercase tracking-wider placeholder-current"
                          placeholder="GROUP"
                        />
                      </div>
                      <div className={`text-xs font-medium ${isDark ? 'text-blue-400/40' : 'text-blue-900/30'}`}>
                        Last edited just now
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setZoom(Math.max(50, zoom - 10))}
                        className={`p-3 rounded-[18px] backdrop-blur-xl border transition-all duration-300 hover:scale-105 active:scale-95 ${
                          isDark ? 'bg-white/10 hover:bg-white/15 text-blue-300 border-white/20 ring-1 ring-white/10' : 'bg-white/70 hover:bg-white/90 text-blue-600 border-white/60 ring-1 ring-white/40 shadow-sm'
                        }`}
                        title="Zoom Out"
                      >
                        <ZoomOut size={20} />
                      </button>
                      <span className={`text-sm font-medium px-2 ${isDark ? 'text-blue-300' : 'text-blue-600'}`}>{zoom}%</span>
                      <button
                        onClick={() => setZoom(Math.min(200, zoom + 10))}
                        className={`p-3 rounded-[18px] backdrop-blur-xl border transition-all duration-300 hover:scale-105 active:scale-95 ${
                          isDark ? 'bg-white/10 hover:bg-white/15 text-blue-300 border-white/20 ring-1 ring-white/10' : 'bg-white/70 hover:bg-white/90 text-blue-600 border-white/60 ring-1 ring-white/40 shadow-sm'
                        }`}
                        title="Zoom In"
                      >
                        <ZoomIn size={20} />
                      </button>
                      <button
                        onClick={() => setIsFullScreen(!isFullScreen)}
                        className={`p-3 rounded-[18px] backdrop-blur-xl border transition-all duration-300 hover:scale-105 active:scale-95 ${
                          isDark ? 'bg-white/10 hover:bg-white/15 text-blue-300 border-white/20 ring-1 ring-white/10' : 'bg-white/70 hover:bg-white/90 text-blue-600 border-white/60 ring-1 ring-white/40 shadow-sm'
                        }`}
                        title="Toggle Full Screen"
                      >
                        {isFullScreen ? <Minimize2 size={20} /> : <Maximize2 size={20} />}
                      </button>
                      <button
                        onClick={() => setViewMode(viewMode === ViewMode.EDIT ? ViewMode.PREVIEW : ViewMode.EDIT)}
                        className={`p-3 rounded-[18px] backdrop-blur-xl border transition-all duration-300 hover:scale-105 active:scale-95 ${
                          isDark ? 'bg-white/10 hover:bg-white/15 text-blue-300 border-white/20 ring-1 ring-white/10' : 'bg-white/70 hover:bg-white/90 text-blue-600 border-white/60 ring-1 ring-white/40 shadow-sm'
                        }`}
                        title="Toggle View Mode"
                      >
                        {viewMode === ViewMode.EDIT ? <Eye size={20} /> : <Pencil size={20} />}
                      </button>
                    </div>
                  </div>

                  <input
                    type="text"
                    value={activeNote.title}
                    disabled
                    className={`bg-transparent text-2xl font-bold outline-none truncate w-full bg-clip-text leading-tight tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}
                  />
                </div>

                <div className="p-8 md:p-12">
                  {viewMode === ViewMode.EDIT ? (
                    <textarea
                      style={{ fontSize: `${zoom}%` }}
                      className={`w-full h-[65vh] bg-transparent outline-none resize-none font-mono text-xs leading-relaxed placeholder:opacity-30 selection:bg-blue-500/30 ${isDark ? 'text-gray-200' : 'text-slate-700'}`}
                      placeholder="Start typing your markdown..."
                      value={activeNote.content}
                      onChange={(e) => updateActiveNote(e.target.value)}
                      spellCheck={false}
                    />
                  ) : (
                    <div className="min-h-[65vh]" id="markdown-content-area">
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
      )}

      {!isExporting && !isFullScreen && (
        <NoteList 
          notes={notes}
          activeId={activeNoteId || ''}
          onSelect={(id) => { setActiveNoteId(id); setIsListOpen(false); }}
          onDelete={handleDeleteNote}
          onNewNote={handleNewNote}
          onNewFolder={openFolderDialog}
          onImport={handleImportClick}
          onExport={handleExportPdf}
          isOpen={isListOpen}
          onClose={() => setIsListOpen(false)}
          theme={theme}
        />
      )}

      {!isExporting && !isListOpen && !isFullScreen && (
        <GlassDock 
          onToggleList={() => setIsListOpen(true)}
          theme={theme}
        />
      )}
    </div>
  );
};

export default App;