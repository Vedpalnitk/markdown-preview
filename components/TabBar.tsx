import React from 'react';
import { X } from 'lucide-react';
import { Note, Theme } from '../types';

interface TabBarProps {
  tabs: string[];
  notes: Note[];
  activeId: string | null;
  onSelect: (id: string) => void;
  onClose: (id: string) => void;
  theme: Theme;
}

export const TabBar: React.FC<TabBarProps> = ({
  tabs,
  notes,
  activeId,
  onSelect,
  onClose,
  theme
}) => {
  if (!tabs.length) return null;

  const isDark = theme === Theme.DARK;

  return (
    <div className="h-10 flex items-center overflow-x-auto px-2 gap-1">
      {tabs.map((id) => {
        const note = notes.find((n) => n.id === id);
        const isActive = id === activeId;

        return (
          <div
            key={id}
            className={`group flex items-center gap-1.5 px-3 py-2 rounded-2xl cursor-pointer min-w-[150px] max-w-[220px] backdrop-blur-xl border transition-all duration-150 ${
              isActive
                ? isDark
                  ? 'bg-[rgba(43,127,255,0.15)] text-[#8ec5ff] border-[rgba(43,127,255,0.35)] shadow-[0_10px_24px_-14px_rgba(43,127,255,0.55)]'
                  : 'bg-[rgba(36,99,235,0.14)] text-[#2463eb] border-[rgba(36,99,235,0.24)] shadow-[0_10px_24px_-14px_rgba(36,99,235,0.35)]'
                : isDark
                  ? 'text-[#9cb1d3] border-transparent hover:border-white/10 hover:bg-white/[0.04]'
                  : 'text-[#4a5970] border-transparent hover:border-black/[0.06] hover:bg-black/[0.03]'
            }`}
            onClick={() => onSelect(id)}
          >
            <span className="flex-1 truncate text-sm">{note?.title || 'Untitled'}</span>
            <button
              className={`p-0.5 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity ${
                isDark ? 'hover:bg-white/[0.08]' : 'hover:bg-black/[0.06]'
              }`}
              onClick={(e) => {
                e.stopPropagation();
                onClose(id);
              }}
              title="Close tab"
              aria-label="Close tab"
            >
              <X size={14} />
            </button>
          </div>
        );
      })}
    </div>
  );
};
