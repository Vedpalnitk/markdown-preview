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

  // Visuals
  const glassClass = `backdrop-blur-[26px] shadow-[0_18px_36px_-14px_rgba(0,0,0,0.35)]`;
  const themeClass = isDark 
    ? 'bg-white/10 border border-white/15 ring-1 ring-white/10' 
    : 'bg-white/80 border border-white/70 ring-1 ring-white/70 shadow-blue-200/30';

  return (
    <button 
      onClick={onToggleList}
      className={`fixed bottom-8 left-8 z-50 w-16 h-16 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110 active:scale-95 group ${glassClass} ${themeClass}`}
      title="Open Library"
    >
      <span className="absolute inset-0 rounded-full border border-white/10 opacity-60 group-hover:opacity-90 transition-opacity" />
      <Menu 
        size={24} 
        strokeWidth={2} 
        className={`transition-colors duration-300 ${isDark ? 'text-blue-300 group-hover:text-white' : 'text-blue-600 group-hover:text-blue-800'}`} 
      />
    </button>
  );
};
