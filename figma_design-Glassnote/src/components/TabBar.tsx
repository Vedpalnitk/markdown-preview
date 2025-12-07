import { Tab, Note, Theme } from '../App';
import { X } from 'lucide-react';

interface TabBarProps {
  tabs: Tab[];
  notes: Note[];
  activeTabId: string | null;
  onTabClick: (tabId: string) => void;
  onTabClose: (tabId: string) => void;
  theme: Theme;
}

export function TabBar({
  tabs,
  notes,
  activeTabId,
  onTabClick,
  onTabClose,
  theme,
}: TabBarProps) {
  if (tabs.length === 0) return null;

  return (
    <div className="h-8 flex items-center overflow-x-auto px-2">
      {tabs.map(tab => {
        const note = notes.find(n => n.id === tab.noteId);
        const isActive = tab.id === activeTabId;
        
        return (
          <div
            key={tab.id}
            className={`
              flex items-center gap-1.5 px-3 py-1 rounded-2xl
              cursor-pointer group min-w-24 max-w-40 mx-0.5
              ${isActive 
                ? theme === 'dark' 
                  ? 'bg-blue-500/15 text-blue-300 border border-blue-500/30 shadow-lg shadow-blue-500/20' 
                  : 'bg-blue-100/80 text-blue-700 border border-blue-300/50 shadow-md'
                : theme === 'dark' 
                  ? 'text-slate-400 hover:bg-blue-500/5 hover:text-slate-300 border border-transparent' 
                  : 'text-slate-600 hover:bg-blue-50/50 hover:text-slate-700 border border-transparent'
              }
              transition-all text-xs backdrop-blur-xl hover:scale-105
            `}
            onClick={() => onTabClick(tab.id)}
          >
            <span className="flex-1 truncate">
              {note?.title || 'Untitled'}
            </span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onTabClose(tab.id);
              }}
              className={`p-0.5 rounded-xl ${
                theme === 'dark' ? 'hover:bg-blue-500/20' : 'hover:bg-blue-200'
              } opacity-0 group-hover:opacity-100 transition-opacity`}
              aria-label="Close tab"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        );
      })}
    </div>
  );
}