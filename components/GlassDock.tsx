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
  const glassClass = `backdrop-blur-[40px] shadow-[0_20px_40px_-12px_rgba(0,0,0,0.2)] border`;
  const themeClass = isDark 
    ? 'bg-gray-900/60 border-white/10 shadow-black/40' 
    : 'bg-white/70 border-white/60 shadow-blue-900/10';

  return (
    <button 
      onClick={onToggleList}
      className={`fixed bottom-8 left-8 z-50 w-14 h-14 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110 active:scale-95 group ${glassClass} ${themeClass}`}
      title="Open Library"
    >
      <Menu 
        size={24} 
        strokeWidth={2} 
        className={`transition-colors duration-300 ${isDark ? 'text-blue-300 group-hover:text-white' : 'text-blue-600 group-hover:text-blue-800'}`} 
      />
    </button>
  );
};