import { useState, useEffect, useCallback } from 'react';
import { loadJSON, saveJSON } from '../lib/storage';

const FAV_KEY = 'rankingia_favorites';
const NOTES_KEY = 'rankingia_notes';
const RECENT_KEY = 'rankingia_recent';
const MAX_RECENT = 12;
const FAV_EVENT = 'rankingia-favorites-changed';
const NOTES_EVENT = 'rankingia-notes-changed';
const RECENT_EVENT = 'rankingia-recent-changed';

export function useFavorites() {
  const [favorites, setFavorites] = useState<string[]>(() => loadJSON(FAV_KEY, []));
  const [notes, setNotes] = useState<Record<string, string>>(() => loadJSON(NOTES_KEY, {}));
  const [recent, setRecent] = useState<string[]>(() => loadJSON(RECENT_KEY, []));

  useEffect(() => {
    const onFav = () => setFavorites(loadJSON(FAV_KEY, []));
    const onNotes = () => setNotes(loadJSON(NOTES_KEY, {}));
    const onRecent = () => setRecent(loadJSON(RECENT_KEY, []));
    const onStorage = (e: StorageEvent) => {
      if (e.key === FAV_KEY) onFav();
      if (e.key === NOTES_KEY) onNotes();
      if (e.key === RECENT_KEY) onRecent();
    };
    window.addEventListener(FAV_EVENT, onFav);
    window.addEventListener(NOTES_EVENT, onNotes);
    window.addEventListener(RECENT_EVENT, onRecent);
    window.addEventListener('storage', onStorage);
    return () => {
      window.removeEventListener(FAV_EVENT, onFav);
      window.removeEventListener(NOTES_EVENT, onNotes);
      window.removeEventListener(RECENT_EVENT, onRecent);
      window.removeEventListener('storage', onStorage);
    };
  }, []);

  const toggleFavorite = useCallback((id: string) => {
    setFavorites(f => {
      const next = f.includes(id) ? f.filter(x => x !== id) : [...f, id];
      saveJSON(FAV_KEY, next);
      window.dispatchEvent(new CustomEvent(FAV_EVENT));
      return next;
    });
  }, []);

  const isFavorite = useCallback((id: string) => favorites.includes(id), [favorites]);

  const getNote = useCallback((id: string) => notes[id] || '', [notes]);

  const setNote = useCallback((id: string, note: string) => {
    setNotes(n => {
      const next = { ...n };
      if (note.trim()) next[id] = note;
      else delete next[id];
      saveJSON(NOTES_KEY, next);
      window.dispatchEvent(new CustomEvent(NOTES_EVENT));
      return next;
    });
  }, []);

  const addRecent = useCallback((id: string) => {
    setRecent(r => {
      const next = [id, ...r.filter(x => x !== id)].slice(0, MAX_RECENT);
      saveJSON(RECENT_KEY, next);
      window.dispatchEvent(new CustomEvent(RECENT_EVENT));
      return next;
    });
  }, []);

  return { favorites, toggleFavorite, isFavorite, getNote, setNote, recent, addRecent };
}
