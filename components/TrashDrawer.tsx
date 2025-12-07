import React from 'react';
import { Note, Theme } from '../types';
import { motion, AnimatePresence } from 'framer-motion';
import { Undo2, Trash2, X } from 'lucide-react';

interface TrashDrawerProps {
  notes: Note[];
  isOpen: boolean;
  onClose: () => void;
  onRestore: (id: string) => void;
  onDelete: (id: string) => void;
  theme: Theme;
}

export const TrashDrawer: React.FC<TrashDrawerProps> = ({
  notes,
  isOpen,
  onClose,
  onRestore,
  onDelete,
  theme
}) => {
  const isDark = theme === Theme.DARK;

  const textPrimary = isDark ? 'text-white/90' : 'text-[#37352f]';
  const textSecondary = isDark ? 'text-white/60' : 'text-[#91918e]';
  const textMuted = isDark ? 'text-white/40' : 'text-[#b4b4b0]';

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            className={`fixed inset-y-0 right-0 w-full max-w-sm z-50 overflow-y-auto
              ${isDark ? 'bg-[#1f1f1f]' : 'bg-white'} border-l ${isDark ? 'border-white/[0.06]' : 'border-[#e8e5e0]'}`}
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          >
            {/* Header */}
            <div className={`sticky top-0 z-10 px-4 py-3 border-b ${isDark ? 'border-white/[0.06] bg-[#1f1f1f]' : 'border-[#e8e5e0] bg-white'}`}>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className={`text-base font-semibold ${textPrimary}`}>Trash</h3>
                  <p className={`text-xs ${textMuted}`}>{notes.length} items</p>
                </div>
                <button
                  onClick={onClose}
                  className={`p-1.5 rounded-md transition-colors ${isDark ? 'hover:bg-white/[0.08]' : 'hover:bg-black/[0.04]'}`}
                >
                  <X size={18} className={textSecondary} />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="p-4">
              {notes.length === 0 ? (
                <div className={`text-center py-12 ${textMuted}`}>
                  <Trash2 size={32} className="mx-auto mb-3 opacity-40" />
                  <p className="text-sm">Trash is empty</p>
                  <p className="text-xs mt-1">Deleted items appear here for 30 days</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {notes.map(note => (
                    <div
                      key={note.id}
                      className={`group p-3 rounded-lg border transition-colors
                        ${isDark
                          ? 'border-white/[0.06] hover:bg-white/[0.04]'
                          : 'border-[#e8e5e0] hover:bg-black/[0.02]'
                        }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex-1 min-w-0">
                          <p className={`text-sm font-medium truncate ${textPrimary}`}>
                            {note.title || 'Untitled'}
                          </p>
                          <p className={`text-xs ${textMuted}`}>
                            Deleted {new Date(note.deletedAt || Date.now()).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                          </p>
                        </div>
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => onRestore(note.id)}
                            className={`p-1.5 rounded-md transition-colors ${isDark ? 'hover:bg-white/[0.1]' : 'hover:bg-black/[0.06]'}`}
                            title="Restore"
                          >
                            <Undo2 size={14} className={isDark ? 'text-[#00E8FF]' : 'text-[#0052CC]'} />
                          </button>
                          <button
                            onClick={() => onDelete(note.id)}
                            className={`p-1.5 rounded-md transition-colors ${isDark ? 'hover:bg-red-500/20' : 'hover:bg-red-50'}`}
                            title="Delete permanently"
                          >
                            <Trash2 size={14} className="text-red-500" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
