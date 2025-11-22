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
  const buttonTone = isDark ? 'liquid-btn liquid-btn-dark text-white' : 'liquid-btn liquid-btn-light text-[#0B1B40]';

  return (
    <button 
      onClick={onToggleList}
      className={`fixed bottom-8 left-8 z-50 w-16 h-16 rounded-full ${buttonTone} liquid-btn-icon text-lg hover:scale-110 active:scale-95 group`}
      title="Open Library"
    >
      <span className="absolute inset-0 rounded-full border border-white/10 opacity-60 group-hover:opacity-95 transition-opacity" />
      <Menu 
        size={24} 
        strokeWidth={2} 
        className={`transition-colors duration-300 ${isDark ? 'text-[#00E8FF] group-hover:text-white' : 'text-[#0052CC] group-hover:text-[#001226]'}`} 
      />
    </button>
  );
};
