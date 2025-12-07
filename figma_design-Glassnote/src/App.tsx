import { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { EditorPane } from './components/EditorPane';
import { TabBar } from './components/TabBar';
import { Toolbar } from './components/Toolbar';
import { mockNotes, mockFolders } from './data/mockData';
import { PanelLeftClose } from 'lucide-react';

export interface Note {
  id: string;
  title: string;
  content: string;
  folderId: string;
  createdAt: number;
  updatedAt: number;
  pinned: boolean;
  tags: string[];
  deleted: boolean;
}

export interface Folder {
  id: string;
  name: string;
  parentId: string | null;
  icon?: string;
}

export interface Tab {
  id: string;
  noteId: string;
}

export type Theme = 'light' | 'dark';

export default function App() {
  const [theme, setTheme] = useState<Theme>('dark');
  const [folders, setFolders] = useState<Folder[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [tabs, setTabs] = useState<Tab[]>([]);
  const [activeTabId, setActiveTabId] = useState<string | null>(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>('all');
  const [viewMode, setViewMode] = useState<'all' | 'pinned' | 'deleted'>('all');

  // Load data from localStorage on mount
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as Theme;
    const savedFolders = localStorage.getItem('folders');
    const savedNotes = localStorage.getItem('notes');
    const savedTabs = localStorage.getItem('tabs');
    const savedActiveTabId = localStorage.getItem('activeTabId');

    if (savedTheme) setTheme(savedTheme);
    
    // Load or initialize with mock data
    if (savedFolders) {
      setFolders(JSON.parse(savedFolders));
    } else {
      setFolders(mockFolders);
    }
    
    if (savedNotes) {
      setNotes(JSON.parse(savedNotes));
    } else {
      setNotes(mockNotes);
    }
    
    if (savedTabs) setTabs(JSON.parse(savedTabs));
    if (savedActiveTabId) setActiveTabId(savedActiveTabId);

    // Listen for sidebar search events
    const handleSidebarSearch = (e: Event) => {
      const customEvent = e as CustomEvent;
      setSearchQuery(customEvent.detail);
    };
    
    window.addEventListener('sidebarSearch', handleSidebarSearch);
    return () => window.removeEventListener('sidebarSearch', handleSidebarSearch);
  }, []);

  // Save data to localStorage
  useEffect(() => {
    localStorage.setItem('theme', theme);
  }, [theme]);

  useEffect(() => {
    if (folders.length > 0) {
      localStorage.setItem('folders', JSON.stringify(folders));
    }
  }, [folders]);

  useEffect(() => {
    if (notes.length > 0) {
      localStorage.setItem('notes', JSON.stringify(notes));
    }
  }, [notes]);

  useEffect(() => {
    localStorage.setItem('tabs', JSON.stringify(tabs));
  }, [tabs]);

  useEffect(() => {
    if (activeTabId) {
      localStorage.setItem('activeTabId', activeTabId);
    }
  }, [activeTabId]);

  const activeNote = tabs.find(tab => tab.id === activeTabId)
    ? notes.find(note => note.id === tabs.find(tab => tab.id === activeTabId)?.noteId)
    : null;

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  const createNote = (folderId: string) => {
    const newNote: Note = {
      id: Date.now().toString(),
      title: 'Untitled',
      content: '',
      folderId,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      pinned: false,
      tags: [],
      deleted: false,
    };
    setNotes([...notes, newNote]);
    openNote(newNote.id);
  };

  const openNote = (noteId: string) => {
    const existingTab = tabs.find(tab => tab.noteId === noteId);
    if (existingTab) {
      setActiveTabId(existingTab.id);
    } else {
      const newTab: Tab = {
        id: Date.now().toString(),
        noteId,
      };
      setTabs([...tabs, newTab]);
      setActiveTabId(newTab.id);
    }
  };

  const closeTab = (tabId: string) => {
    const newTabs = tabs.filter(tab => tab.id !== tabId);
    setTabs(newTabs);
    if (activeTabId === tabId) {
      setActiveTabId(newTabs.length > 0 ? newTabs[newTabs.length - 1].id : null);
    }
  };

  const updateNote = (noteId: string, updates: Partial<Note>) => {
    setNotes(notes.map(note => 
      note.id === noteId 
        ? { ...note, ...updates, updatedAt: Date.now() }
        : note
    ));
  };

  const deleteNote = (noteId: string) => {
    setNotes(notes.map(note => 
      note.id === noteId ? { ...note, deleted: true } : note
    ));
    setTabs(tabs.filter(tab => tab.noteId !== noteId));
    if (activeNote?.id === noteId) {
      setActiveTabId(tabs.length > 1 ? tabs[0].id : null);
    }
  };

  const permanentlyDeleteNote = (noteId: string) => {
    setNotes(notes.filter(note => note.id !== noteId));
    setTabs(tabs.filter(tab => tab.noteId !== noteId));
    if (activeNote?.id === noteId) {
      setActiveTabId(tabs.length > 1 ? tabs[0].id : null);
    }
  };

  const restoreNote = (noteId: string) => {
    setNotes(notes.map(note => 
      note.id === noteId ? { ...note, deleted: false } : note
    ));
  };

  const togglePinNote = (noteId: string) => {
    setNotes(notes.map(note => 
      note.id === noteId ? { ...note, pinned: !note.pinned } : note
    ));
  };

  const createFolder = (name: string, parentId: string | null = null, icon?: string) => {
    const newFolder: Folder = {
      id: Date.now().toString(),
      name,
      parentId,
      icon,
    };
    setFolders([...folders, newFolder]);
  };

  const deleteFolder = (folderId: string) => {
    // Move notes to default folder instead of deleting
    setNotes(notes.map(note => 
      note.folderId === folderId ? { ...note, folderId: 'all' } : note
    ));
    
    // Delete all subfolders
    const subfoldersToDelete = folders.filter(folder => folder.parentId === folderId);
    subfoldersToDelete.forEach(folder => deleteFolder(folder.id));
    
    // Delete folder
    setFolders(folders.filter(folder => folder.id !== folderId));
  };

  const renameFolder = (folderId: string, newName: string) => {
    setFolders(folders.map(folder => 
      folder.id === folderId ? { ...folder, name: newName } : folder
    ));
  };

  const exportNote = (noteId: string) => {
    const note = notes.find(n => n.id === noteId);
    if (!note) return;

    const blob = new Blob([note.content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${note.title}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const importNote = (folderId: string) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.md,.txt';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const content = e.target?.result as string;
          const title = file.name.replace(/\.(md|txt)$/, '');
          const newNote: Note = {
            id: Date.now().toString(),
            title,
            content,
            folderId,
            createdAt: Date.now(),
            updatedAt: Date.now(),
            pinned: false,
            tags: [],
            deleted: false,
          };
          setNotes([...notes, newNote]);
          openNote(newNote.id);
        };
        reader.readAsText(file);
      }
    };
    input.click();
  };

  return (
    <div className={`h-screen ${theme === 'dark' ? 'dark bg-slate-900' : 'bg-slate-50'} flex flex-col overflow-hidden relative`}>
      {/* Animated mesh gradient background */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className={`absolute inset-0 ${
          theme === 'dark' 
            ? 'bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900' 
            : 'bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50'
        }`} />
        <div className={`absolute top-0 right-0 w-[600px] h-[600px] rounded-full ${
          theme === 'dark'
            ? 'bg-blue-500/10'
            : 'bg-blue-400/20'
        } blur-3xl animate-pulse-slow`} />
        <div className={`absolute bottom-0 left-0 w-[500px] h-[500px] rounded-full ${
          theme === 'dark'
            ? 'bg-purple-500/10'
            : 'bg-purple-400/20'
        } blur-3xl animate-pulse-slower`} />
        <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full ${
          theme === 'dark'
            ? 'bg-cyan-500/5'
            : 'bg-cyan-400/15'
        } blur-3xl animate-pulse-slowest`} />
        {/* Noise texture overlay for glass effect */}
        <div className="absolute inset-0 opacity-[0.015] mix-blend-overlay" 
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' /%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' /%3E%3C/svg%3E")`
          }}
        />
      </div>
      
      <div className={`h-full w-full ${theme === 'dark' ? 'bg-slate-900' : 'bg-slate-50'}`}>
        <div className="h-full w-full flex flex-col p-3 gap-3">
          <div className="flex-1 flex overflow-hidden gap-3">
            <Sidebar
              folders={folders}
              notes={notes.filter(n => !n.deleted)}
              deletedNotes={notes.filter(n => n.deleted)}
              onCreateNote={createNote}
              onOpenNote={openNote}
              onDeleteNote={deleteNote}
              onPermanentlyDeleteNote={permanentlyDeleteNote}
              onRestoreNote={restoreNote}
              onTogglePin={togglePinNote}
              onCreateFolder={createFolder}
              onDeleteFolder={deleteFolder}
              onRenameFolder={renameFolder}
              onImport={importNote}
              onExport={exportNote}
              collapsed={sidebarCollapsed}
              theme={theme}
              searchQuery={searchQuery}
              selectedFolderId={selectedFolderId}
              onSelectFolder={setSelectedFolderId}
              viewMode={viewMode}
              onViewModeChange={setViewMode}
              onToggleSidebar={() => setSidebarCollapsed(!sidebarCollapsed)}
              activeNote={activeNote}
            />
            
            {/* Floating Editor Panel */}
            <div className="flex-1 flex flex-col overflow-hidden">
              <TabBar
                tabs={tabs}
                notes={notes}
                activeTabId={activeTabId}
                onTabClick={setActiveTabId}
                onTabClose={closeTab}
                theme={theme}
              />
              
              <EditorPane
                note={activeNote}
                onUpdateNote={updateNote}
                theme={theme}
                onToggleTheme={toggleTheme}
                sidebarCollapsed={sidebarCollapsed}
                onToggleSidebar={() => setSidebarCollapsed(!sidebarCollapsed)}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}