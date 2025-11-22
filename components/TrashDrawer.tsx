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
  const liquidButtonTone = isDark ? 'liquid-btn liquid-btn-dark text-white' : 'liquid-btn liquid-btn-light text-[#0B1B40]';
  const cardClass = isDark
    ? 'bg-[#061427]/80 border border-[#0d243c] text-white'
    : 'bg-white border border-[#E7ECF7] text-[#001226]';
  const btnClass = `${liquidButtonTone} liquid-btn-icon h-10 w-10 text-sm`;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            className={`fixed inset-y-0 right-0 w-full max-w-md z-50 p-5 overflow-y-auto backdrop-blur-[22px] ${
              isDark ? 'bg-[#050b16]/90' : 'bg-white/95'
            }`}
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 220, damping: 28 }}
          >
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] opacity-70">Trash</p>
                <h3 className="text-xl font-semibold">Recently Deleted</h3>
              </div>
              <button
                onClick={onClose}
                className={`${btnClass}`}
              >
                <X size={16} />
              </button>
            </div>

            {notes.length === 0 ? (
              <div className={`mt-10 text-center text-sm opacity-60`}>
                No deleted notes. Items stay here for 30 days.
              </div>
            ) : (
              <div className="space-y-3">
                {notes.map(note => (
                  <div key={note.id} className={`p-4 rounded-2xl ${cardClass}`}>
                    <div className="flex items-center justify-between gap-2">
                      <div className="min-w-0">
                        <p className="text-sm font-semibold truncate">{note.title}</p>
                        <p className="text-xs opacity-70">
                          Deleted {new Date(note.deletedAt || Date.now()).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          className={btnClass}
                          onClick={() => onRestore(note.id)}
                          title="Restore"
                        >
                          <Undo2 size={14} />
                        </button>
                        <button
                          className={btnClass}
                          onClick={() => onDelete(note.id)}
                          title="Delete permanently"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
