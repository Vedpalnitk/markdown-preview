import { Note } from '../types';

const STORAGE_KEY = 'glassnote_notes';

export const getNotes = (): Note[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (e) {
    console.error("Failed to load notes", e);
    return [];
  }
};

export const saveNote = (note: Note): void => {
  const notes = getNotes();
  const existingIndex = notes.findIndex((n) => n.id === note.id);
  
  if (existingIndex >= 0) {
    notes[existingIndex] = note;
  } else {
    notes.unshift(note);
  }
  
  localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
};

export const deleteNote = (id: string): void => {
  const notes = getNotes().filter((n) => n.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
};

export const createNewNote = (initialTitle?: string, initialContent?: string): Note => {
  return {
    id: crypto.randomUUID(),
    title: initialTitle || 'Untitled Note',
    content: initialContent || '# New Note\n\nStart typing your markdown here...',
    group: 'General',
    updatedAt: Date.now(),
  };
};