import { Sun, Moon, Sidebar as SidebarIcon, Download, Upload, MoreHorizontal } from 'lucide-react';
import { Theme, Note } from '../App';

interface ToolbarProps {
  theme: Theme;
  onToggleTheme: () => void;
  onToggleSidebar: () => void;
  sidebarCollapsed: boolean;
  activeNote: Note | null;
  onExport: () => void;
  onImport: () => void;
}

export function Toolbar({
  theme,
  onToggleTheme,
  onToggleSidebar,
  activeNote,
  onExport,
  onImport,
}: ToolbarProps) {
  return (
    <div className={`h-10 border-b ${theme === 'dark' ? 'border-white/5 bg-slate-950/60' : 'border-slate-200 bg-white/60'} backdrop-blur-2xl flex items-center px-2.5 gap-2`}>
      <button
        onClick={onToggleSidebar}
        className={`p-1 rounded-md ${theme === 'dark' ? 'hover:bg-white/5 text-slate-400' : 'hover:bg-slate-200/70 text-slate-600'} transition-all`}
        aria-label="Toggle sidebar"
      >
        <SidebarIcon className="w-4 h-4" />
      </button>

      <div className="flex-1" />

      <div className="flex items-center gap-1">
        <button
          onClick={onImport}
          className={`p-1 rounded-md ${theme === 'dark' ? 'hover:bg-white/5 text-slate-400' : 'hover:bg-slate-200/70 text-slate-600'} transition-all`}
          aria-label="Import"
        >
          <Upload className="w-4 h-4" />
        </button>

        {activeNote && (
          <button
            onClick={onExport}
            className={`p-1 rounded-md ${theme === 'dark' ? 'hover:bg-white/5 text-slate-400' : 'hover:bg-slate-200/70 text-slate-600'} transition-all`}
            aria-label="Export"
          >
            <Download className="w-4 h-4" />
          </button>
        )}

        <div className={`w-px h-4 ${theme === 'dark' ? 'bg-white/10' : 'bg-slate-300'} mx-1`} />

        <button
          onClick={onToggleTheme}
          className={`p-1 rounded-md ${theme === 'dark' ? 'hover:bg-white/5 text-slate-400' : 'hover:bg-slate-200/70 text-slate-600'} transition-all`}
          aria-label="Toggle theme"
        >
          {theme === 'light' ? (
            <Moon className="w-4 h-4" />
          ) : (
            <Sun className="w-4 h-4" />
          )}
        </button>
        
        <button
          className={`p-1 rounded-md ${theme === 'dark' ? 'hover:bg-white/5 text-slate-400' : 'hover:bg-slate-200/70 text-slate-600'} transition-all`}
          aria-label="More"
        >
          <MoreHorizontal className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
