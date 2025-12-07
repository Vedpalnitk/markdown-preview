import React from 'react';
import { Menu } from 'lucide-react';
import { Theme } from '../types';

interface GlassDockProps {
  onToggleList: () => void;
  theme: Theme;
}

export const GlassDock: React.FC<GlassDockProps> = ({
  onToggleList,
  theme
}) => {
  const isDark = theme === Theme.DARK;

  return (
    <button
      onClick={onToggleList}
      className={`fixed bottom-6 left-6 z-50 w-12 h-12 rounded-xl flex items-center justify-center
        transition-all duration-200 hover:scale-105 active:scale-95
        ${isDark
          ? 'bg-white/[0.1] hover:bg-white/[0.15] border border-white/[0.1]'
          : 'bg-black/[0.05] hover:bg-black/[0.08] border border-black/[0.06] shadow-sm'
        }`}
      title="Open Library"
    >
      <Menu
        size={20}
        strokeWidth={2}
        className={isDark ? 'text-white/80' : 'text-[#37352f]/70'}
      />
    </button>
  );
};
