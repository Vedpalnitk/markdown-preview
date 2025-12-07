import { useState } from 'react';
import { Folder, Note, Theme } from '../App';
import { ChevronRight, Pin, Trash2, Archive, Clock, Plus, Search as SearchIcon, Sparkles, FolderPlus, FileText, PanelLeftClose, Edit2, Download, MoreHorizontal } from 'lucide-react';
import { IconRenderer } from './IconRenderer';

interface SidebarProps {
  folders: Folder[];
  notes: Note[];
  deletedNotes: Note[];
  onCreateNote: (folderId: string) => void;
  onOpenNote: (noteId: string) => void;
  onDeleteNote: (noteId: string) => void;
  onPermanentlyDeleteNote: (noteId: string) => void;
  onRestoreNote: (noteId: string) => void;
  onTogglePin: (noteId: string) => void;
  onCreateFolder: (name: string, parentId: string | null, icon?: string) => void;
  onDeleteFolder: (folderId: string) => void;
  onRenameFolder: (folderId: string, newName: string) => void;
  onImport: (folderId: string) => void;
  onExport: (noteId: string) => void;
  collapsed: boolean;
  theme: Theme;
  searchQuery: string;
  selectedFolderId: string | null;
  onSelectFolder: (folderId: string) => void;
  viewMode: 'all' | 'pinned' | 'deleted';
  onViewModeChange: (mode: 'all' | 'pinned' | 'deleted') => void;
  onToggleSidebar: () => void;
  activeNote?: Note | null;
}

export function Sidebar({
  folders,
  notes,
  deletedNotes,
  onCreateNote,
  onOpenNote,
  onTogglePin,
  onDeleteNote,
  collapsed,
  searchQuery,
  selectedFolderId,
  onSelectFolder,
  viewMode,
  onViewModeChange,
  theme,
  onToggleSidebar,
  onExport,
  activeNote,
  onCreateFolder,
  onImport,
  onDeleteFolder,
  onRenameFolder,
}: SidebarProps) {
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set(['all', 'work', 'personal']));

  const cycleViewMode = () => {
    if (viewMode === 'all') {
      onViewModeChange('pinned');
    } else if (viewMode === 'pinned') {
      onViewModeChange('deleted');
    } else {
      onViewModeChange('all');
    }
  };

  const getViewModeIcon = () => {
    switch (viewMode) {
      case 'pinned':
        return <Pin className="w-3.5 h-3.5 mx-auto" />;
      case 'deleted':
        return <Archive className="w-3.5 h-3.5 mx-auto" />;
      default:
        return <FileText className="w-3.5 h-3.5 mx-auto" />;
    }
  };

  const getViewModeLabel = () => {
    switch (viewMode) {
      case 'pinned':
        return 'Pinned';
      case 'deleted':
        return 'Deleted';
      default:
        return 'All Notes';
    }
  };

  const handleCreateFolder = () => {
    const folderName = prompt('Enter folder name:');
    if (folderName && folderName.trim()) {
      onCreateFolder(folderName.trim(), selectedFolderId === 'all' ? null : selectedFolderId);
    }
  };

  const toggleFolder = (folderId: string) => {
    const newExpanded = new Set(expandedFolders);
    if (newExpanded.has(folderId)) {
      newExpanded.delete(folderId);
    } else {
      newExpanded.add(folderId);
    }
    setExpandedFolders(newExpanded);
  };

  const filterNotes = (notesToFilter: Note[], folderId?: string) => {
    let filtered = notesToFilter;
    
    if (searchQuery) {
      filtered = filtered.filter(note => 
        note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        note.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (note.tags && note.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase())))
      );
    }
    
    if (folderId && folderId !== 'all') {
      filtered = filtered.filter(note => note.folderId === folderId);
    }
    
    return filtered.sort((a, b) => {
      if (a.pinned && !b.pinned) return -1;
      if (!a.pinned && b.pinned) return 1;
      return b.updatedAt - a.updatedAt;
    });
  };

  const getTimeAgo = (timestamp: number) => {
    const now = Date.now();
    const diff = now - timestamp;
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor(diff / (1000 * 60));
    
    if (days > 0) return `${days}d`;
    if (hours > 0) return `${hours}h`;
    if (minutes > 0) return `${minutes}m`;
    return 'now';
  };

  const getPreviewText = (content: string) => {
    return content
      .replace(/[#*`>\-\[\]]/g, '')
      .split('\n')
      .filter(line => line.trim())
      .slice(0, 1)
      .join(' ')
      .substring(0, 45);
  };

  const renderNoteItem = (note: Note, depth: number = 0, highlighted: boolean = false) => (
    <div
      key={note.id}
      className={`group px-1.5 py-1.5 mb-1 pb-1.5 border-b ${
        theme === 'dark' ? 'border-blue-500/5' : 'border-blue-200/30'
      } hover:bg-blue-500/5 rounded cursor-pointer transition-all ${
        highlighted ? 'bg-blue-500/10 border-blue-400/20' : ''
      }`}
      style={{ paddingLeft: `${depth * 12 + 6}px` }}
      onClick={() => onOpenNote(note.id)}
    >
      <div className="flex items-start gap-1">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1 mb-0.5">
            {note.pinned && <Pin className="w-2.5 h-2.5 text-blue-400/80 flex-shrink-0 fill-blue-400/80" />}
            <span className="text-slate-200 dark:text-slate-200 text-slate-800 truncate text-xs">
              {note.title || 'Untitled'}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <p className="text-slate-500 dark:text-slate-500 text-slate-600 text-xs line-clamp-1 flex-1">
              {getPreviewText(note.content)}
            </p>
            <span className="text-slate-600 dark:text-slate-600 text-slate-500 text-xs ml-1 flex-shrink-0">{getTimeAgo(note.updatedAt)}</span>
          </div>
        </div>
        {/* Contextual actions on hover */}
        <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onTogglePin(note.id);
            }}
            className={`p-0.5 rounded ${theme === 'dark' ? 'hover:bg-blue-500/20 text-blue-400/70 hover:text-blue-400' : 'hover:bg-blue-100 text-blue-500/70 hover:text-blue-600'} transition-all`}
            aria-label={note.pinned ? "Unpin" : "Pin"}
            title={note.pinned ? "Unpin" : "Pin"}
          >
            <Pin className={`w-3 h-3 ${note.pinned ? 'fill-current' : ''}`} />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onExport(note.id);
            }}
            className={`p-0.5 rounded ${theme === 'dark' ? 'hover:bg-blue-500/20 text-blue-400/70 hover:text-blue-400' : 'hover:bg-blue-100 text-blue-500/70 hover:text-blue-600'} transition-all`}
            aria-label="Export"
            title="Export"
          >
            <Download className="w-3 h-3" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDeleteNote(note.id);
            }}
            className={`p-0.5 rounded ${theme === 'dark' ? 'hover:bg-red-500/20 text-red-400/70 hover:text-red-400' : 'hover:bg-red-100 text-red-500/70 hover:text-red-600'} transition-all`}
            aria-label="Delete"
            title="Delete"
          >
            <Trash2 className="w-3 h-3" />
          </button>
        </div>
      </div>
    </div>
  );

  const renderFolder = (folder: Folder, depth: number = 0) => {
    const isExpanded = expandedFolders.has(folder.id);
    const subFolders = folders.filter(f => f.parentId === folder.id);
    const isSelected = selectedFolderId === folder.id;
    const folderNotes = filterNotes(notes, folder.id);
    const allFolderNotes = notes.filter(n => n.folderId === folder.id);

    return (
      <div key={folder.id}>
        <div
          className={`group flex items-center gap-2 px-2 py-1 hover:bg-blue-500/5 rounded-xl cursor-pointer transition-all text-sm ${
            isSelected ? 'bg-blue-500/10' : ''
          }`}
          style={{ paddingLeft: `${depth * 12 + 8}px` }}
          onClick={() => {
            toggleFolder(folder.id);
            onSelectFolder(folder.id);
            onViewModeChange('all');
          }}
        >
          <ChevronRight className={`w-3 h-3 text-slate-500 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
          {folder.icon && <IconRenderer name={folder.icon} className="text-blue-400/70" size={14} />}
          <span className="flex-1 text-slate-300 truncate">{folder.name}</span>
          <span className="text-slate-600 text-xs">{allFolderNotes.length}</span>
          {/* Contextual actions on hover */}
          <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onCreateNote(folder.id);
              }}
              className={`p-0.5 rounded ${theme === 'dark' ? 'hover:bg-blue-500/20 text-blue-400/70 hover:text-blue-400' : 'hover:bg-blue-100 text-blue-500/70 hover:text-blue-600'} transition-all`}
              aria-label="Add note"
              title="Add note"
            >
              <Plus className="w-3 h-3" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                const newName = prompt('Rename folder:', folder.name);
                if (newName && newName.trim()) {
                  onRenameFolder(folder.id, newName.trim());
                }
              }}
              className={`p-0.5 rounded ${theme === 'dark' ? 'hover:bg-blue-500/20 text-blue-400/70 hover:text-blue-400' : 'hover:bg-blue-100 text-blue-500/70 hover:text-blue-600'} transition-all`}
              aria-label="Rename"
              title="Rename"
            >
              <Edit2 className="w-3 h-3" />
            </button>
            {folder.id !== 'all' && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  if (confirm(`Delete folder "${folder.name}"? Notes will be moved to All Notes.`)) {
                    onDeleteFolder(folder.id);
                  }
                }}
                className={`p-0.5 rounded ${theme === 'dark' ? 'hover:bg-red-500/20 text-red-400/70 hover:text-red-400' : 'hover:bg-red-100 text-red-500/70 hover:text-red-600'} transition-all`}
                aria-label="Delete"
                title="Delete"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>

        {isExpanded && (
          <>
            {/* Render notes for this folder */}
            {folderNotes.length > 0 && (
              <div className={`mt-0.5 mb-1 ${theme === 'dark' ? '[&>div]:!border-slate-700/40' : ''}`}>
                {folderNotes.map(note => renderNoteItem(note, depth + 1, note.pinned))}
              </div>
            )}
            
            {/* Render subfolders */}
            {subFolders.map(subFolder => renderFolder(subFolder, depth + 1))}
          </>
        )}
      </div>
    );
  };

  if (collapsed) return null;

  return (
    <div className={`w-52 rounded-[32px] ${
      theme === 'dark' 
        ? 'bg-slate-800/60 shadow-2xl shadow-black/20 ring-1 ring-slate-700/50' 
        : 'bg-white/60 shadow-2xl shadow-slate-900/20 ring-1 ring-blue-200/50'
    } backdrop-blur-3xl flex flex-col h-full overflow-hidden ${collapsed ? 'hidden' : ''}`}>
      {/* Logo and controls header */}
      <div className={`p-2 border-b ${theme === 'dark' ? 'border-slate-700/50' : 'border-blue-200/40'}`}>
        <div className="flex items-center gap-2 mb-2">
          <div className={`flex items-center gap-2 flex-1 px-3 py-2 rounded-2xl ${
            theme === 'dark' 
              ? 'bg-gradient-to-r from-blue-500/15 to-purple-500/15 shadow-lg shadow-blue-500/10' 
              : 'bg-gradient-to-r from-blue-500/10 to-purple-500/10 shadow-lg shadow-blue-500/20'
          } backdrop-blur-xl border ${theme === 'dark' ? 'border-slate-700/50' : 'border-blue-300/30'}`}>
            <Sparkles className={`w-5 h-5 ${theme === 'dark' ? 'text-blue-400' : 'text-blue-500'}`} />
            <span className={`${theme === 'dark' ? 'text-slate-200' : 'text-slate-800'} font-bold text-lg`}>
              glassnote<span className={`${theme === 'dark' ? 'text-blue-400' : 'text-blue-500'}`}>.ai</span>
            </span>
          </div>
          <button
            onClick={onToggleSidebar}
            className={`p-1.5 rounded-xl ${
              theme === 'dark' 
                ? 'hover:bg-blue-500/15 text-slate-400 hover:text-blue-400 hover:shadow-lg hover:shadow-blue-500/20' 
                : 'hover:bg-blue-100 text-slate-600 hover:text-blue-600 hover:shadow-md'
            } transition-all backdrop-blur-xl`}
            aria-label="Collapse sidebar"
            title="Collapse sidebar"
          >
            <PanelLeftClose className="w-4 h-4" />
          </button>
        </div>


      </div>

      <div className={`p-1.5 border-b ${theme === 'dark' ? 'border-slate-700/50' : 'border-blue-200/40'} flex items-center gap-1`}>
        {/* Search bar */}
        <div className="relative flex-1">
          <SearchIcon className={`w-3 h-3 ${theme === 'dark' ? 'text-slate-500' : 'text-slate-400'} absolute left-2 top-1/2 -translate-y-1/2 pointer-events-none`} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              const event = new CustomEvent('sidebarSearch', { detail: e.target.value });
              window.dispatchEvent(event);
            }}
            placeholder="Search"
            className={`w-full pl-7 pr-2 py-1 ${
              theme === 'dark' 
                ? 'bg-slate-800/50 border-slate-700/50 text-slate-300 placeholder:text-slate-600 focus:border-slate-600 focus:bg-slate-800 focus:shadow-lg focus:shadow-black/20'
                : 'bg-blue-50/70 border-blue-200 text-slate-800 placeholder:text-slate-500 focus:border-blue-500 focus:bg-blue-100/50 focus:shadow-md'
            } border rounded-xl outline-none transition-all text-xs backdrop-blur-xl`}
          />
        </div>

        <button
          onClick={() => onCreateNote(selectedFolderId || 'all')}
          className={`p-1 rounded-xl ${
            theme === 'dark' 
              ? 'hover:bg-blue-500/15 text-blue-400 hover:text-blue-300 hover:shadow-lg hover:shadow-blue-500/10' 
              : 'hover:bg-blue-100 text-blue-600 hover:text-blue-700 hover:shadow-md'
          } transition-all backdrop-blur-xl hover:scale-110`}
          aria-label="New Note"
          title="New Note"
        >
          <Plus className="w-3.5 h-3.5" />
        </button>

        <button
          onClick={handleCreateFolder}
          className={`p-1 rounded-xl ${
            theme === 'dark' 
              ? 'hover:bg-blue-500/15 text-blue-400/70 hover:text-blue-400 hover:shadow-lg hover:shadow-blue-500/10' 
              : 'hover:bg-blue-100 text-blue-500/70 hover:text-blue-600 hover:shadow-md'
          } transition-all backdrop-blur-xl hover:scale-110`}
          aria-label="New Folder"
          title="New Folder"
        >
          <FolderPlus className="w-3.5 h-3.5" />
        </button>

        <button
          onClick={cycleViewMode}
          className={`p-1 rounded-xl ${
            theme === 'dark' 
              ? 'hover:bg-blue-500/15 text-blue-400/70 hover:text-blue-400 hover:shadow-lg hover:shadow-blue-500/10' 
              : 'hover:bg-blue-100 text-blue-500/70 hover:text-blue-600 hover:shadow-md'
          } transition-all backdrop-blur-xl hover:scale-110`}
          aria-label={getViewModeLabel()}
          title={getViewModeLabel()}
        >
          {getViewModeIcon()}
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-1.5 space-y-0.5">
        {viewMode === 'deleted' ? (
          <div>
            <div className="text-slate-500 text-xs px-2 mb-1.5 flex items-center gap-1">
              <Archive className="w-3 h-3" />
              Deleted Notes
            </div>
            <div className="space-y-0.5">
              {deletedNotes.map(note => renderNoteItem(note, 0))}
              {deletedNotes.length === 0 && (
                <div className="text-center text-slate-600 py-4 text-xs">
                  No deleted notes
                </div>
              )}
            </div>
          </div>
        ) : (
          <>
            {folders
              .filter(folder => folder.parentId === null)
              .map(folder => renderFolder(folder))}
            
            {filterNotes(notes).length === 0 && !searchQuery && (
              <div className="text-center text-slate-600 py-8 text-xs">
                No notes yet
              </div>
            )}
            
            {searchQuery && filterNotes(notes).length === 0 && (
              <div className="text-center text-slate-600 py-8 text-xs">
                No notes found
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}