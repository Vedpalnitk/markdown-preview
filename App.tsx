import React, { useState, useEffect, useRef } from 'react';
import { Note, ViewMode, Theme } from './types';
import { getNotes, saveNote, createNewNote, deleteNote } from './services/storageService';
import { polishMarkdown } from './services/geminiService';
import { MarkdownView } from './components/MarkdownView';
import { GlassDock } from './components/GlassDock';
import { NoteList } from './components/NoteList';
import { Loader2, Folder } from 'lucide-react';

// Declare html2pdf global
declare const html2pdf: any;

const App: React.FC = () => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [activeNoteId, setActiveNoteId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>(ViewMode.EDIT);
  const [theme, setTheme] = useState<Theme>(Theme.LIGHT);
  const [isListOpen, setIsListOpen] = useState(false);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  
  // Ref for hidden file input
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load notes on mount
  useEffect(() => {
    const loadedNotes = getNotes();
    setNotes(loadedNotes);
    if (loadedNotes.length > 0) {
      setActiveNoteId(loadedNotes[0].id);
    } else {
      handleNewNote();
    }
    
    // Check system preference for theme
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      setTheme(Theme.DARK);
    }
  }, []);

  const activeNote = notes.find(n => n.id === activeNoteId);

  const updateActiveNote = (content: string) => {
    if (!activeNote) return;
    
    // Simple logic to extract title from first # header
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
    const updatedNote = { ...activeNote, group, updatedAt: Date.now() };
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

  const handleDeleteNote = (id: string) => {
    deleteNote(id);
    const remaining = notes.filter(n => n.id !== id);
    setNotes(remaining);
    if (activeNoteId === id) {
      setActiveNoteId(remaining.length > 0 ? remaining[0].id : null);
    }
  };

  const handleAiPolish = async () => {
    if (!activeNote) return;
    setIsAiLoading(true);
    const polished = await polishMarkdown(activeNote.content);
    updateActiveNote(polished);
    setIsAiLoading(false);
    setViewMode(ViewMode.PREVIEW); 
  };

  // --- Import Logic ---
  const handleImportClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      const title = file.name.replace(/\.(md|txt)$/, '');
      const newNote = createNewNote(title, content);
      
      setNotes([newNote, ...notes]);
      saveNote(newNote);
      setActiveNoteId(newNote.id);
      setViewMode(ViewMode.PREVIEW);
    };
    reader.readAsText(file);
    // Reset input
    event.target.value = '';
  };

  // --- Export Logic ---
  const handleExportPdf = () => {
    if (!activeNote) return;
    
    // 1. Show the Export Overlay
    setIsExporting(true);

    // 2. Wait for render, then capture
    setTimeout(() => {
      const element = document.getElementById('pdf-content');
      if (!element) {
        setIsExporting(false);
        return;
      }

      // Force scroll to top to ensure html2canvas starts at 0,0
      window.scrollTo(0, 0);

      const opt = {
        margin:       0, 
        filename:     `${activeNote.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.pdf`,
        image:        { type: 'jpeg', quality: 0.98 },
        html2canvas:  { 
          scale: 2, 
          useCORS: true, 
          scrollY: 0,
          scrollX: 0,
          x: 0, 
          y: 0,
          width: 794, // Force A4 pixel width
          windowWidth: 794
        }, 
        jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' },
        pagebreak:    { mode: ['css', 'legacy'] } 
      };

      html2pdf()
        .set(opt)
        .from(element)
        .save()
        .then(() => {
          setIsExporting(false);
        })
        .catch((err: any) => {
          console.error(err);
          setIsExporting(false);
        });
    }, 1500); 
  };

  // Background Styles
  const bgGradient = theme === Theme.DARK 
    ? "bg-[conic-gradient(at_top_left,_var(--tw-gradient-stops))] from-gray-900 via-slate-900 to-black"
    : "bg-[conic-gradient(at_top_left,_var(--tw-gradient-stops))] from-rose-100 via-indigo-100 to-teal-100";

  return (
    <div className={`min-h-screen w-full relative ${bgGradient} transition-colors duration-500`}>
      
      {/* Hidden File Input */}
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleFileChange} 
        accept=".md,.txt,.markdown" 
        className="hidden" 
      />

      {/* PDF Export Overlay - ABSOLUTE POSITIONED AT TOP */}
      {isExporting && activeNote && (
        <div className="absolute top-0 left-0 z-[9999] bg-white w-full min-h-screen">
           {/* Inject Print Specific Styles */}
           <style>
            {`
              #pdf-content {
                width: 794px; /* A4 width at 96 DPI */
                padding: 20mm; /* A4 Margins */
                background: white;
                color: black !important;
                position: absolute;
                top: 0;
                left: 0;
              }

              /* Ensure text is black in export */
              #pdf-content * {
                color: black !important;
                text-shadow: none !important;
              }
              
              /* Strict Page Breaking Rules */
              #pdf-content .prose p,
              #pdf-content .prose ul,
              #pdf-content .prose ol,
              #pdf-content .prose li,
              #pdf-content .prose blockquote,
              #pdf-content .prose table,
              #pdf-content .prose figure,
              #pdf-content .katex-display {
                page-break-inside: avoid !important;
                break-inside: avoid !important;
              }

              /* Code Blocks */
              #pdf-content .prose pre {
                page-break-inside: avoid !important;
                break-inside: avoid !important;
                white-space: pre-wrap !important;
                border: 1px solid #eee;
              }

              /* Headings */
              #pdf-content .prose h1,
              #pdf-content .prose h2,
              #pdf-content .prose h3 {
                page-break-after: avoid !important;
                break-after: avoid !important;
                margin-top: 1.5em;
              }
            `}
           </style>

           <div className="fixed top-5 right-5 bg-black/80 text-white px-6 py-3 rounded-full backdrop-blur-md shadow-xl z-[10000] flex items-center gap-3 border border-white/10">
              <Loader2 className="animate-spin" size={20} />
              <span className="font-medium">Generating PDF...</span>
           </div>
           
           {/* Print Content */}
           <div id="pdf-content">
              <div className="prose prose-slate max-w-none">
                <div className="mb-8 border-b border-gray-200 pb-4">
                  <h1 className="text-4xl font-bold mb-2 leading-tight">{activeNote.title}</h1>
                  <p className="text-gray-500 text-sm">
                    {new Date(activeNote.updatedAt).toLocaleDateString()} • {activeNote.group}
                  </p>
                </div>
                <MarkdownView content={activeNote.content} theme={Theme.LIGHT} />
              </div>
           </div>
        </div>
      )}

      {/* Main Content Area */}
      {!isExporting && (
        <main className={`h-screen w-full overflow-y-auto pt-10 pb-32 px-4 md:px-0 transition-all duration-300 ${isListOpen ? 'md:pl-80' : ''}`}>
          <div className="max-w-4xl mx-auto">
            {activeNote ? (
              <div className={`backdrop-blur-md rounded-3xl shadow-xl border transition-all duration-300 min-h-[80vh] p-8 md:p-12 mb-10
                ${theme === Theme.DARK ? 'bg-black/40 border-white/10 text-gray-100' : 'bg-white/40 border-white/40 text-gray-800'}`}>
                
                {/* Header */}
                <div className="flex flex-col gap-2 mb-6 border-b border-white/10 pb-4">
                  <div className="flex justify-between items-center">
                    <input 
                      type="text"
                      value={activeNote.title}
                      disabled
                      className="bg-transparent text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-purple-600 w-full outline-none truncate"
                    />
                    <div className="text-xs opacity-50 whitespace-nowrap flex items-center gap-2">
                      {isAiLoading ? <div className="flex items-center gap-2 text-amber-500"><Loader2 className="animate-spin" size={14}/> Polishing...</div> : 'Saved'}
                    </div>
                  </div>
                  
                  {/* Group / Folder Input */}
                  <div className="flex items-center gap-2 text-sm opacity-70">
                    <Folder size={14} />
                    <input 
                      type="text" 
                      value={activeNote.group || 'General'} 
                      onChange={(e) => updateActiveGroup(e.target.value)}
                      className="bg-transparent border-b border-transparent hover:border-current focus:border-current outline-none transition-colors"
                      placeholder="Group"
                    />
                  </div>
                </div>

                {/* Editor / Preview */}
                {viewMode === ViewMode.EDIT ? (
                  <textarea 
                    className="w-full h-[60vh] bg-transparent outline-none resize-none font-mono text-base leading-relaxed"
                    placeholder="# Start writing..."
                    value={activeNote.content}
                    onChange={(e) => updateActiveNote(e.target.value)}
                    spellCheck={false}
                  />
                ) : (
                  <div className="min-h-[60vh]" id="markdown-content-area">
                    <MarkdownView content={activeNote.content} theme={theme} />
                  </div>
                )}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-[80vh] text-center opacity-50">
                <p>No note selected. Create a new one to get started.</p>
              </div>
            )}
          </div>
        </main>
      )}

      {/* Sidebar */}
      {!isExporting && (
        <NoteList 
          notes={notes}
          activeId={activeNoteId || ''}
          onSelect={(id) => { setActiveNoteId(id); setIsListOpen(false); }}
          onDelete={handleDeleteNote}
          isOpen={isListOpen}
          onClose={() => setIsListOpen(false)}
          theme={theme}
        />
      )}

      {/* Dynamic Glass Dock */}
      {!isExporting && (
        <GlassDock 
          onNewNote={handleNewNote}
          onToggleList={() => setIsListOpen(!isListOpen)}
          onToggleView={() => setViewMode(viewMode === ViewMode.EDIT ? ViewMode.PREVIEW : ViewMode.EDIT)}
          onToggleTheme={() => setTheme(theme === Theme.LIGHT ? Theme.DARK : Theme.LIGHT)}
          onAiAction={handleAiPolish}
          onImport={handleImportClick}
          onExport={handleExportPdf}
          viewMode={viewMode}
          theme={theme}
        />
      )}

      {/* Overlay for sidebar on mobile */}
      {isListOpen && !isExporting && (
        <div 
          className="fixed inset-0 z-30 bg-black/20 backdrop-blur-sm md:hidden"
          onClick={() => setIsListOpen(false)}
        />
      )}
    </div>
  );
};

export default App;