import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, 
  List, 
  Settings, 
  Sparkles, 
  Eye, 
  Edit3, 
  Moon, 
  Sun,
  X,
  Menu,
  UploadCloud,
  Download
} from 'lucide-react';
import { Theme, ViewMode } from '../types';

interface GlassDockProps {
  onNewNote: () => void;
  onToggleList: () => void;
  onToggleView: () => void;
  onToggleTheme: () => void;
  onAiAction: () => void;
  onImport: () => void;
  onExport: () => void;
  viewMode: ViewMode;
  theme: Theme;
}

export const GlassDock: React.FC<GlassDockProps> = ({
  onNewNote,
  onToggleList,
  onToggleView,
  onToggleTheme,
  onAiAction,
  onImport,
  onExport,
  viewMode,
  theme
}) => {
  const [isExpanded, setIsExpanded] = useState(true);

  const containerVariants = {
    collapsed: { width: '64px', height: '64px', borderRadius: '32px' },
    expanded: { width: 'auto', height: '72px', borderRadius: '24px' }
  };

  const buttonClass = `p-3 rounded-full transition-all duration-200 hover:scale-110 active:scale-95 flex items-center justify-center`;
  const glassClass = `backdrop-blur-xl shadow-2xl border border-white/20`;
  const themeClass = theme === Theme.DARK ? 'bg-black/60 text-white' : 'bg-white/70 text-slate-800';

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex flex-col items-center gap-2">
      <motion.div
        layout
        initial="expanded"
        animate={isExpanded ? "expanded" : "collapsed"}
        variants={containerVariants}
        transition={{ type: "spring", stiffness: 300, damping: 25 }}
        className={`${glassClass} ${themeClass} flex items-center justify-center px-2 overflow-hidden`}
        onClick={(e) => {
           if (!isExpanded) setIsExpanded(true);
        }}
      >
        <AnimatePresence mode="wait">
          {!isExpanded ? (
            <motion.button
              key="expand-btn"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="w-full h-full flex items-center justify-center"
              onClick={() => setIsExpanded(true)}
            >
              <Menu size={24} />
            </motion.button>
          ) : (
            <motion.div 
              key="actions"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center gap-2 px-2"
            >
              {/* File Actions */}
              <button onClick={onToggleList} className={`${buttonClass} hover:bg-blue-500/20`} title="Notes List">
                <List size={20} />
              </button>
              <button onClick={onImport} className={`${buttonClass} hover:bg-indigo-500/20`} title="Import Markdown">
                <UploadCloud size={20} />
              </button>
              <button onClick={onExport} className={`${buttonClass} hover:bg-teal-500/20`} title="Export PDF">
                <Download size={20} />
              </button>

              <div className="w-px h-8 bg-gray-400/30 mx-1"></div>

              {/* Creation & AI */}
              <button onClick={onNewNote} className={`${buttonClass} hover:bg-green-500/20`} title="New Note">
                <Plus size={20} />
              </button>
               <button onClick={onAiAction} className={`${buttonClass} hover:bg-amber-500/20 text-amber-500`} title="AI Magic">
                <Sparkles size={20} />
              </button>

              <div className="w-px h-8 bg-gray-400/30 mx-1"></div>

              {/* View & Theme */}
              <button onClick={onToggleView} className={`${buttonClass} hover:bg-purple-500/20`} title={viewMode === ViewMode.EDIT ? "Switch to Reading" : "Switch to Editing"}>
                {viewMode === ViewMode.EDIT ? <Eye size={20} /> : <Edit3 size={20} />}
              </button>

              <button onClick={onToggleTheme} className={`${buttonClass} hover:bg-gray-500/20`} title="Toggle Theme">
                {theme === Theme.DARK ? <Sun size={20} /> : <Moon size={20} />}
              </button>
              
              <button 
                onClick={(e) => { e.stopPropagation(); setIsExpanded(false); }} 
                className={`${buttonClass} bg-red-500/10 text-red-500 hover:bg-red-500/20 ml-2`}
                title="Collapse Dock"
              >
                <X size={18} />
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};