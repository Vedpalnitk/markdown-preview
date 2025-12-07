import React from 'react';
import { Sun, Moon, Sidebar as SidebarIcon, Download, Upload, MoreHorizontal } from 'lucide-react';
import { Theme, Note } from '../types';

interface ToolbarProps {
  theme: Theme;
  onToggleTheme: () => void;
  onToggleSidebar: () => void;
  sidebarCollapsed?: boolean;
  activeNote: Note | null;
  onExport: () => void;
  onImport: () => void;
}

export const Toolbar: React.FC<ToolbarProps> = ({
  theme,
  onToggleTheme,
  onToggleSidebar,
  activeNote,
  onExport,
  onImport,
}) => {
  const isDark = theme === Theme.DARK;

  return (
    <div
      className={`h-10 border-b backdrop-blur-2xl flex items-center px-3 gap-2 rounded-2xl ${
        isDark ? 'border-white/5 bg-slate-950/60' : 'border-slate-200 bg-white/70'
      }`}
    >
      <button
        onClick={onToggleSidebar}
        className={`h-8 w-8 rounded-xl flex items-center justify-center transition-all ${
          isDark ? 'hover:bg-white/5 text-slate-300' : 'hover:bg-slate-200/70 text-slate-600'
        }`}
        aria-label="Toggle sidebar"
        title="Toggle sidebar"
        type="button"
      >
        <SidebarIcon className="w-4 h-4" />
      </button>

      <div className="flex-1" />

      <div className="flex items-center gap-1.5">
        <button
          onClick={onImport}
          className={`h-8 w-8 rounded-xl flex items-center justify-center transition-all ${
            isDark ? 'hover:bg-white/5 text-slate-300' : 'hover:bg-slate-200/70 text-slate-600'
          }`}
          aria-label="Import"
          type="button"
        >
          <Upload className="w-4 h-4" />
        </button>

        {activeNote && (
          <button
            onClick={onExport}
            className={`h-8 w-8 rounded-xl flex items-center justify-center transition-all ${
              isDark ? 'hover:bg-white/5 text-slate-300' : 'hover:bg-slate-200/70 text-slate-600'
            }`}
            aria-label="Export"
            type="button"
          >
            <Download className="w-4 h-4" />
          </button>
        )}

        <div className={`w-px h-4 mx-1 ${isDark ? 'bg-white/10' : 'bg-slate-300'}`} />

        <button
          onClick={onToggleTheme}
          className={`h-8 w-8 rounded-xl flex items-center justify-center transition-all ${
            isDark ? 'hover:bg-white/5 text-slate-300' : 'hover:bg-slate-200/70 text-slate-600'
          }`}
          aria-label="Toggle theme"
          type="button"
        >
          {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>

        <button
          className={`h-8 w-8 rounded-xl flex items-center justify-center transition-all ${
            isDark ? 'hover:bg-white/5 text-slate-300' : 'hover:bg-slate-200/70 text-slate-600'
          }`}
          aria-label="More"
          type="button"
        >
          <MoreHorizontal className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
