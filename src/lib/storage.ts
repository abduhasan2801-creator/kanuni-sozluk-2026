import type {
  LegalTerm,
  SearchDirection,
  SearchFilters,
  SearchHistoryItem,
  SearchResponse,
} from '../types/legal.ts';

const DB_NAME = 'ahd_kanuni_db';
const DB_VERSION = 1;
const STORE_FAVORITES = 'favorites';
const STORE_HISTORY = 'history';
const STORE_CACHED_TERMS = 'cached_terms';
const STORE_META = 'meta';

export interface QuizProgressStats {
  quizzesCompleted: number;
  totalQuestions: number;
  totalCorrect: number;
  bestPercentage: number;
  lastPlayedAt?: string;
}

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof indexedDB === 'undefined') {
      reject(new Error('IndexedDB unavailable'));
      return;
    }
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE_FAVORITES)) {
        db.createObjectStore(STORE_FAVORITES, { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains(STORE_HISTORY)) {
        db.createObjectStore(STORE_HISTORY, { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains(STORE_CACHED_TERMS)) {
        db.createObjectStore(STORE_CACHED_TERMS, { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains(STORE_META)) {
        db.createObjectStore(STORE_META, { keyPath: 'key' });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function idbGetAll<T>(storeName: string): Promise<T[]> {
  try {
    const db = await openDB();
    return await new Promise((resolve, reject) => {
      const tx = db.transaction(storeName, 'readonly');
      const store = tx.objectStore(storeName);
      const req = store.getAll();
      req.onsuccess = () => resolve((req.result || []) as T[]);
      req.onerror = () => reject(req.error);
    });
  } catch {
    const raw = localStorage.getItem(`ahd_${storeName}`);
    return raw ? (JSON.parse(raw) as T[]) : [];
  }
}

async function idbPut<T extends { id: string }>(storeName: string, item: T): Promise<void> {
  try {
    const db = await openDB();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(storeName, 'readwrite');
      tx.objectStore(storeName).put(item);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } catch {
    const existing = await idbGetAll<T>(storeName);
    const filtered = existing.filter((x) => x.id !== item.id);
    filtered.unshift(item);
    localStorage.setItem(`ahd_${storeName}`, JSON.stringify(filtered));
  }
}

async function idbDelete(storeName: string, id: string): Promise<void> {
  try {
    const db = await openDB();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(storeName, 'readwrite');
      tx.objectStore(storeName).delete(id);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } catch {
    const existing = await idbGetAll<{ id: string }>(storeName);
    localStorage.setItem(
      `ahd_${storeName}`,
      JSON.stringify(existing.filter((x) => x.id !== id))
    );
  }
}

async function idbClear(storeName: string): Promise<void> {
  try {
    const db = await openDB();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(storeName, 'readwrite');
      tx.objectStore(storeName).clear();
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } catch {
    localStorage.removeItem(`ahd_${storeName}`);
  }
}

// Favorites API
export async function getFavorites(): Promise<LegalTerm[]> {
  return idbGetAll<LegalTerm>(STORE_FAVORITES);
}

export async function isFavoriteTerm(id: string): Promise<boolean> {
  const all = await getFavorites();
  return all.some((t) => t.id === id);
}

export async function addFavorite(term: LegalTerm): Promise<void> {
  await idbPut(STORE_FAVORITES, term);
}

export async function removeFavorite(id: string): Promise<void> {
  await idbDelete(STORE_FAVORITES, id);
}

// Search History API
export async function getSearchHistory(): Promise<SearchHistoryItem[]> {
  const items = await idbGetAll<SearchHistoryItem>(STORE_HISTORY);
  return items.sort((a, b) => b.timestamp.localeCompare(a.timestamp));
}

export async function recordSearchHistory(item: SearchHistoryItem): Promise<void> {
  await idbPut(STORE_HISTORY, item);
}

export async function deleteSearchHistoryItem(id: string): Promise<void> {
  await idbDelete(STORE_HISTORY, id);
}

export async function clearSearchHistory(): Promise<void> {
  await idbClear(STORE_HISTORY);
}

// Offline Term Cache API
export async function cacheTermOffline(term: LegalTerm): Promise<void> {
  await idbPut(STORE_CACHED_TERMS, term);
}

export async function getCachedTermOffline(id: string): Promise<LegalTerm | undefined> {
  const all = await idbGetAll<LegalTerm>(STORE_CACHED_TERMS);
  return all.find((t) => t.id === id);
}

export async function getAllCachedTermsOffline(): Promise<LegalTerm[]> {
  return idbGetAll<LegalTerm>(STORE_CACHED_TERMS);
}

// Quiz Progress
export function getQuizProgress(): QuizProgressStats {
  try {
    const raw = localStorage.getItem('ahd_quiz_progress');
    if (raw) return JSON.parse(raw) as QuizProgressStats;
  } catch {
    // ignore
  }
  return {
    quizzesCompleted: 0,
    totalQuestions: 0,
    totalCorrect: 0,
    bestPercentage: 0,
  };
}

export function saveQuizResult(correct: number, total: number): QuizProgressStats {
  const current = getQuizProgress();
  const pct = total > 0 ? Math.round((correct / total) * 100) : 0;
  const next: QuizProgressStats = {
    quizzesCompleted: current.quizzesCompleted + 1,
    totalQuestions: current.totalQuestions + total,
    totalCorrect: current.totalCorrect + correct,
    bestPercentage: Math.max(current.bestPercentage, pct),
    lastPlayedAt: new Date().toISOString(),
  };
  try {
    localStorage.setItem('ahd_quiz_progress', JSON.stringify(next));
  } catch {
    // ignore
  }
  return next;
}

function normalizeTrClient(input: string): string {
  return input
    .trim()
    .toLocaleLowerCase('tr-TR')
    .replace(/\s+/g, ' ')
    .replace(/ç/g, 'c')
    .replace(/ğ/g, 'g')
    .replace(/ı/g, 'i')
    .replace(/ö/g, 'o')
    .replace(/ş/g, 's')
    .replace(/ü/g, 'u')
    .replace(/â/g, 'a')
    .replace(/î/g, 'i')
    .replace(/û/g, 'u');
}

function normalizeArClient(input: string): string {
  return input
    .trim()
    .replace(/[\u064B-\u065F\u0670\u0640]/g, '')
    .replace(/\s+/g, ' ')
    .replace(/[أإآٱ]/g, 'ا')
    .replace(/ى/g, 'ي')
    .replace(/ة/g, 'ه')
    .replace(/ؤ/g, 'و')
    .replace(/ئ/g, 'ي');
}

function matchesClientFilters(term: LegalTerm, filters: SearchFilters): boolean {
  if (filters.jurisdiction && term.jurisdiction !== filters.jurisdiction) return false;
  if (
    filters.specializationId &&
    term.specializationId !== filters.specializationId &&
    !(term.secondarySpecializationIds || []).includes(filters.specializationId)
  ) {
    return false;
  }
  if (filters.legalStatus && term.legalStatus !== filters.legalStatus) return false;
  if (filters.verificationStatus && term.verificationStatus !== filters.verificationStatus) {
    return false;
  }
  if (
    filters.lawNumber &&
    !(term.source.lawNumber || '').toLowerCase().includes(filters.lawNumber.toLowerCase())
  ) {
    return false;
  }
  if (
    filters.articleNumber &&
    !(term.source.articleNumber || '').toLowerCase().includes(filters.articleNumber.toLowerCase())
  ) {
    return false;
  }
  return true;
}

export async function searchOfflineDictionary(
  rawQuery: string,
  direction: SearchDirection,
  filters: SearchFilters = {}
): Promise<SearchResponse | null> {
  const query = rawQuery.trim();
  if (!query) return null;

  const [cached, favs] = await Promise.all([
    getAllCachedTermsOffline(),
    getFavorites(),
  ]);

  const byId = new Map<string, LegalTerm>();
  for (const t of [...favs, ...cached]) {
    if (!byId.has(t.id)) byId.set(t.id, t);
  }

  const candidates = Array.from(byId.values()).filter((t) =>
    matchesClientFilters(t, filters)
  );
  if (candidates.length === 0) return null;

  if (direction === 'tr-ar') {
    const qNorm = normalizeTrClient(query);
    for (const term of candidates) {
      const forms = [
        ...term.turkishTerm.split('/'),
        ...(term.turkishEquivalent ? term.turkishEquivalent.split('/') : []),
        ...term.synonyms,
      ].map(normalizeTrClient);
      if (forms.includes(qNorm)) {
        return {
          query,
          direction,
          matchType: 'exact',
          term,
          filtersApplied: filters,
        };
      }
    }
    const partial = candidates.find(
      (t) => qNorm.length >= 3 && normalizeTrClient(t.turkishTerm).includes(qNorm)
    );
    if (partial) {
      return {
        query,
        direction,
        matchType: 'closest_verified',
        term: partial,
        filtersApplied: filters,
      };
    }
  } else {
    const qNorm = normalizeArClient(query);
    const stripAl = (s: string) => (s.startsWith('ال') ? s.slice(2) : s);
    const qBare = stripAl(qNorm);

    for (const term of candidates) {
      const forms = [
        ...term.arabicTerm.replace(/بحسب السياق/g, '').split('/'),
        ...(term.egyptianEquivalent ? term.egyptianEquivalent.split('/') : []),
        ...term.synonyms,
      ]
        .map(normalizeArClient)
        .filter(Boolean);
      if (forms.some((f) => f === qNorm || stripAl(f) === qBare)) {
        return {
          query,
          direction,
          matchType: 'exact',
          term,
          filtersApplied: filters,
        };
      }
    }
    const partial = candidates.find(
      (t) => qNorm.length >= 3 && normalizeArClient(t.arabicTerm).includes(qNorm)
    );
    if (partial) {
      return {
        query,
        direction,
        matchType: 'closest_verified',
        term: partial,
        filtersApplied: filters,
      };
    }
  }

  return null;
}

