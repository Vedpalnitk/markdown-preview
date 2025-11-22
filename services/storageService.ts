import { Note } from '../types';

const STORAGE_KEY = 'glassnote_notes';
const TRASH_KEY = 'glassnote_trash';
const THIRTY_DAYS = 30 * 24 * 60 * 60 * 1000;

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
    content: initialContent || '',
    group: 'GENERAL', // Default to Uppercase
    updatedAt: Date.now(),
  };
};

const purgeExpiredTrash = (notes: Note[]): Note[] => {
  const now = Date.now();
  const filtered = notes.filter(note => !note.deletedAt || (now - note.deletedAt) <= THIRTY_DAYS);
  if (filtered.length !== notes.length) {
    localStorage.setItem(TRASH_KEY, JSON.stringify(filtered));
  }
  return filtered;
};

export const getTrashNotes = (): Note[] => {
  try {
    const stored = localStorage.getItem(TRASH_KEY);
    const parsed: Note[] = stored ? JSON.parse(stored) : [];
    return purgeExpiredTrash(parsed);
  } catch (e) {
    console.error("Failed to load trash", e);
    return [];
  }
};

export const moveNoteToTrash = (note: Note): Note[] => {
  const trash = getTrashNotes();
  const trashedNote: Note = { ...note, deletedAt: Date.now() };
  const updated = [trashedNote, ...trash.filter(n => n.id !== note.id)];
  localStorage.setItem(TRASH_KEY, JSON.stringify(updated));
  return updated;
};

export const restoreNoteFromTrash = (id: string): Note | null => {
  const trash = getTrashNotes();
  const index = trash.findIndex(n => n.id === id);
  if (index === -1) return null;
  const [restored] = trash.splice(index, 1);
  localStorage.setItem(TRASH_KEY, JSON.stringify(trash));
  const { deletedAt, ...note } = restored;
  return { ...note, deletedAt: undefined };
};

export const deleteTrashNote = (id: string): Note[] => {
  const trash = getTrashNotes().filter(n => n.id !== id);
  localStorage.setItem(TRASH_KEY, JSON.stringify(trash));
  return trash;
};
