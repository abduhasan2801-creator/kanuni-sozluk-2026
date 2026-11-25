import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import type {
  EditorialStage,
  LegalTerm,
  MissingTermLog,
  SearchDirection,
  SearchFilters,
  SearchResponse,
} from '../types/legal.ts';
import { EXPANDED_LEGAL_TERMS } from './data/legalTermsExpansion.ts';
import { LEGAL_TERMS_PART_1 } from './data/legalTermsPart1.ts';
import { LEGAL_TERMS_PART_2 } from './data/legalTermsPart2.ts';
import { LEGAL_TERMS_PART_3 } from './data/legalTermsPart3.ts';
import { SPECIALIZATIONS } from './data/specializations.ts';

export interface AdminRecord {
  passwordHash: string;
  salt: string;
  role: 'Admin';
  claimedAt: string;
}

interface DatabaseSchema {
  terms: LegalTerm[];
  missingTerms: MissingTermLog[];
  admin?: AdminRecord;
}

const DATA_DIR = path.resolve(process.cwd(), 'data');
const BUNDLED_DB_PATH = path.join(DATA_DIR, 'kanuni-db.json');
const TMP_DB_PATH = path.join(os.tmpdir(), 'ahd-kanuni-db.json');

function isReadOnlyRuntime(): boolean {
  return Boolean(
    process.env.VERCEL ||
      process.env.AWS_LAMBDA_FUNCTION_NAME ||
      process.env.KANUNI_READONLY_FS === '1'
  );
}

export function normalizeTurkish(input: string, foldDiacritics = false): string {
  let s = input.trim().toLocaleLowerCase('tr-TR').replace(/\s+/g, ' ');
  if (foldDiacritics) {
    s = s
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
  return s;
}

export function normalizeArabic(input: string, foldForms = false): string {
  let s = input
    .trim()
    .replace(/[\u064B-\u065F\u0670\u0640]/g, '') // strip tashkeel & tatweel
    .replace(/\s+/g, ' ');
  if (foldForms) {
    s = s
      .replace(/[أإآٱ]/g, 'ا')
      .replace(/ى/g, 'ي')
      .replace(/ة/g, 'ه')
      .replace(/ؤ/g, 'و')
      .replace(/ئ/g, 'ي');
  }
  return s;
}

function tokenize(text: string): string[] {
  return text
    .split(/[\s/(),.;:«»"'-]+/)
    .map((t) => t.trim())
    .filter((t) => t.length >= 2);
}

function trigramDice(a: string, b: string): number {
  if (!a || !b) return 0;
  if (a === b) return 1;
  if (a.length < 2 || b.length < 2) return a === b ? 1 : 0;
  const getBigrams = (str: string) => {
    const map = new Map<string, number>();
    for (let i = 0; i < str.length - 1; i++) {
      const bg = str.slice(i, i + 2);
      map.set(bg, (map.get(bg) || 0) + 1);
    }
    return map;
  };
  const aMap = getBigrams(a);
  const bMap = getBigrams(b);
  let overlap = 0;
  for (const [bg, countA] of aMap.entries()) {
    const countB = bMap.get(bg) || 0;
    overlap += Math.min(countA, countB);
  }
  return (2 * overlap) / (a.length - 1 + (b.length - 1));
}

class LegalDictionaryStore {
  private data: DatabaseSchema;
  private trExactIndex = new Map<string, string>();
  private trFoldIndex = new Map<string, string>();
  private arExactIndex = new Map<string, string>();
  private arFoldIndex = new Map<string, string>();
  private tokenIndex = new Map<string, Set<string>>();
  private subcategoryIdToNameTr = new Map<string, string>();
  private writableDbPath: string | null;

  constructor() {
    for (const spec of SPECIALIZATIONS) {
      for (const sub of spec.subcategories || []) {
        this.subcategoryIdToNameTr.set(sub.id, sub.nameTr);
      }
    }
    this.writableDbPath = this.resolveWritableDbPath();
    this.data = this.loadOrSeed();
    this.syncExpandedCatalog();
    this.rebuildIndexes();
  }

  private resolveWritableDbPath(): string | null {
    if (!isReadOnlyRuntime()) {
      try {
        if (!fs.existsSync(DATA_DIR)) {
          fs.mkdirSync(DATA_DIR, { recursive: true });
        }
        fs.accessSync(DATA_DIR, fs.constants.W_OK);
        return BUNDLED_DB_PATH;
      } catch {
        // Fall through to /tmp if workspace data dir is read-only
      }
    }

    if (process.env.KANUNI_DISABLE_TMP_FS === '1') {
      return null;
    }

    try {
      const tmpDir = os.tmpdir();
      fs.accessSync(tmpDir, fs.constants.W_OK);
      return TMP_DB_PATH;
    } catch {
      return null;
    }
  }

  private readDbFile(filePath: string): DatabaseSchema | null {
    try {
      if (!fs.existsSync(filePath)) return null;
      const raw = fs.readFileSync(filePath, 'utf-8');
      const parsed = JSON.parse(raw) as DatabaseSchema;
      if (Array.isArray(parsed.terms) && parsed.terms.length > 0) {
        return {
          terms: parsed.terms,
          missingTerms: Array.isArray(parsed.missingTerms) ? parsed.missingTerms : [],
          admin: parsed.admin,
        };
      }
    } catch (err) {
      console.error(`Failed to read database file at ${filePath}:`, err);
    }
    return null;
  }

  private loadOrSeed(): DatabaseSchema {
    const bundled = this.readDbFile(BUNDLED_DB_PATH);

    // If running in serverless /tmp mode and /tmp has a valid state with >= bundled terms, reuse it
    if (this.writableDbPath === TMP_DB_PATH) {
      const tmpData = this.readDbFile(TMP_DB_PATH);
      if (tmpData && (!bundled || tmpData.terms.length >= bundled.terms.length)) {
        return tmpData;
      }
    }

    if (bundled) {
      return bundled;
    }

    // Fallback: seed in memory from compiled TypeScript modules (syncExpandedCatalog adds all 221 expanded terms next)
    const seeded: DatabaseSchema = {
      terms: [...LEGAL_TERMS_PART_1, ...LEGAL_TERMS_PART_2, ...LEGAL_TERMS_PART_3],
      missingTerms: [],
    };
    return seeded;
  }

  private persist(target: DatabaseSchema = this.data): boolean {
    if (!this.writableDbPath) {
      return false;
    }
    try {
      const dir = path.dirname(this.writableDbPath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      const tmpPath = `${this.writableDbPath}.${process.pid}.tmp`;
      fs.writeFileSync(tmpPath, JSON.stringify(target, null, 2), 'utf-8');
      fs.renameSync(tmpPath, this.writableDbPath);
      return true;
    } catch (err) {
      const code = (err as NodeJS.ErrnoException)?.code;
      if (code === 'EROFS' || code === 'EACCES' || code === 'EPERM' || code === 'ENOENT') {
        if (this.writableDbPath !== TMP_DB_PATH && process.env.KANUNI_DISABLE_TMP_FS !== '1') {
          this.writableDbPath = TMP_DB_PATH;
          try {
            const tmpPath = `${TMP_DB_PATH}.${process.pid}.tmp`;
            fs.writeFileSync(tmpPath, JSON.stringify(target, null, 2), 'utf-8');
            fs.renameSync(tmpPath, TMP_DB_PATH);
            return true;
          } catch {
            this.writableDbPath = null;
          }
        } else {
          this.writableDbPath = null;
        }
      }
      console.warn('Database persistence skipped (read-only/in-memory mode):', code || err);
      return false;
    }
  }

  private syncExpandedCatalog(): void {
    const existingIds = new Set(this.data.terms.map((t) => t.id));
    const existingTrExact = new Set(this.data.terms.map((t) => normalizeTurkish(t.turkishTerm, false)));
    const existingTrFold = new Set(this.data.terms.map((t) => normalizeTurkish(t.turkishTerm, true)));

    let inserted = 0;
    for (const term of EXPANDED_LEGAL_TERMS) {
      const trExact = normalizeTurkish(term.turkishTerm, false);
      const trFold = normalizeTurkish(term.turkishTerm, true);
      if (existingIds.has(term.id) || existingTrExact.has(trExact) || existingTrFold.has(trFold)) {
        continue;
      }
      this.data.terms.push({ ...term });
      existingIds.add(term.id);
      existingTrExact.add(trExact);
      existingTrFold.add(trFold);
      inserted += 1;
    }

    if (inserted > 0) {
      this.persist();
    }
  }

  private rebuildIndexes(): void {
    this.trExactIndex.clear();
    this.trFoldIndex.clear();
    this.arExactIndex.clear();
    this.arFoldIndex.clear();
    this.tokenIndex.clear();

    for (const term of this.data.terms) {
      const trExact = normalizeTurkish(term.turkishTerm, false);
      const trFold = normalizeTurkish(term.turkishTerm, true);
      if (!this.trExactIndex.has(trExact)) this.trExactIndex.set(trExact, term.id);
      if (!this.trFoldIndex.has(trFold)) this.trFoldIndex.set(trFold, term.id);

      const arExact = normalizeArabic(term.arabicTerm, false);
      const arFold = normalizeArabic(term.arabicTerm, true);
      if (!this.arExactIndex.has(arExact)) this.arExactIndex.set(arExact, term.id);
      if (!this.arFoldIndex.has(arFold)) this.arFoldIndex.set(arFold, term.id);

      const allTokens = [
        ...tokenize(trFold),
        ...tokenize(arFold),
        ...(term.turkishEquivalent ? tokenize(normalizeTurkish(term.turkishEquivalent, true)) : []),
        ...(term.egyptianEquivalent ? tokenize(normalizeArabic(term.egyptianEquivalent, true)) : []),
        ...term.synonyms.flatMap((s) => [...tokenize(normalizeTurkish(s, true)), ...tokenize(normalizeArabic(s, true))]),
      ];
      for (const tok of allTokens) {
        if (!this.tokenIndex.has(tok)) {
          this.tokenIndex.set(tok, new Set());
        }
        this.tokenIndex.get(tok)!.add(term.id);
      }
    }
  }

  public getTermById(id: string): LegalTerm | undefined {
    return this.data.terms.find((t) => t.id === id);
  }

  public getSpecializationCounts(): Record<string, number> {
    const counts: Record<string, number> = {};
    for (const term of this.data.terms) {
      counts[term.specializationId] = (counts[term.specializationId] || 0) + 1;
      if (Array.isArray(term.secondarySpecializationIds)) {
        for (const secId of term.secondarySpecializationIds) {
          if (secId && secId !== term.specializationId) {
            counts[secId] = (counts[secId] || 0) + 1;
          }
        }
      }
    }
    return counts;
  }

  public getStats() {
    const totalTerms = this.data.terms.length;
    const officiallyVerifiedTerms = this.data.terms.filter(
      (t) => t.verificationStatus === 'Officially Verified'
    ).length;
    const sourceReferencedTerms = this.data.terms.filter(
      (t) => t.verificationStatus === 'Source Referenced'
    ).length;
    const verifiedTerms = this.data.terms.filter(
      (t) =>
        t.verificationStatus === 'Officially Verified' ||
        t.verificationStatus === 'Source Referenced' ||
        t.verificationStatus === 'Legally Reviewed' ||
        t.verificationStatus === 'Linguistically Reviewed' ||
        t.verificationStatus === 'Expert Reviewed'
    ).length;
    const pendingTerms = this.data.terms.filter(
      (t) =>
        t.verificationStatus === 'Pending Verification' ||
        t.verificationStatus === 'Pending Legal Verification'
    ).length;
    const featuredTerm =
      this.data.terms.find((t) => t.isMonthlyFeatured) || this.data.terms[0] || null;
    const popularTerms = [...this.data.terms]
      .sort((a, b) => b.searchCount - a.searchCount)
      .slice(0, 8);

    return {
      totalTerms,
      verifiedTerms,
      officiallyVerifiedTerms,
      sourceReferencedTerms,
      pendingTerms,
      missingCount: this.data.missingTerms.length,
      featuredTerm,
      popularTerms,
    };
  }

  private matchesFilters(term: LegalTerm, filters: SearchFilters): boolean {
    if (filters.jurisdiction && term.jurisdiction !== filters.jurisdiction) return false;
    if (
      filters.specializationId &&
      term.specializationId !== filters.specializationId &&
      !(term.secondarySpecializationIds || []).includes(filters.specializationId)
    ) {
      return false;
    }
    if (filters.subcategory) {
      const subFilter = normalizeTurkish(filters.subcategory, true);
      const mapped = this.subcategoryIdToNameTr.get(filters.subcategory);
      const mappedNorm = mapped ? normalizeTurkish(mapped, true) : subFilter;
      const termSub = normalizeTurkish(term.subcategory || '', true);
      if (!termSub || (termSub !== subFilter && termSub !== mappedNorm)) {
        return false;
      }
    }
    if (filters.documentType && !term.documentTypes.includes(filters.documentType)) return false;
    if (filters.contractType && term.contractType !== filters.contractType) return false;
    if (
      filters.issuingAuthority &&
      !(term.issuingAuthority || '').toLowerCase().includes(filters.issuingAuthority.toLowerCase())
    ) {
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
    if (filters.legalStatus && term.legalStatus !== filters.legalStatus) return false;
    if (filters.verificationStatus && term.verificationStatus !== filters.verificationStatus) {
      return false;
    }
    return true;
  }

  public searchExactTerm(
    rawQuery: string,
    direction: SearchDirection,
    filters: SearchFilters = {}
  ): SearchResponse {
    const query = rawQuery.trim();
    if (!query) {
      return {
        query: '',
        direction,
        matchType: 'not_found',
        term: null,
        notFoundMessage: 'لم يتم العثور على المصطلح في قاعدة البيانات.',
        filtersApplied: filters,
      };
    }

    const candidates = this.data.terms.filter((t) => this.matchesFilters(t, filters));

    if (direction === 'tr-ar') {
      const qExact = normalizeTurkish(query, false);
      const qFold = normalizeTurkish(query, true);

      // 1. Exact Turkish match
      const exactId = this.trExactIndex.get(qExact) || this.trFoldIndex.get(qFold);
      if (exactId) {
        const found = candidates.find((t) => t.id === exactId);
        if (found) {
          this.incrementSearchCount(found.id);
          return { query, direction, matchType: 'exact', term: found, filtersApplied: filters };
        }
      }

      // 2. Exact match on Turkish synonyms, slash-separated segments, or Turkish equivalent
      for (const term of candidates) {
        const parts = term.turkishTerm.split('/').map((p) => normalizeTurkish(p, true));
        const eqParts = (term.turkishEquivalent || '').split('/').map((p) => normalizeTurkish(p, true));
        const syns = term.synonyms.map((s) => normalizeTurkish(s, true));
        if (parts.includes(qFold) || eqParts.includes(qFold) || syns.includes(qFold)) {
          this.incrementSearchCount(term.id);
          return { query, direction, matchType: 'exact', term, filtersApplied: filters };
        }
      }

      // 3. Closest verified match (strict threshold to avoid irrelevant results)
      let bestTerm: LegalTerm | null = null;
      let bestScore = 0;
      for (const term of candidates) {
        if (
          term.verificationStatus === 'Pending Verification' ||
          term.verificationStatus === 'Pending Legal Verification'
        ) {
          continue;
        }
        const target = normalizeTurkish(term.turkishTerm, true);
        let score = trigramDice(qFold, target);
        if (target.startsWith(qFold) && qFold.length >= 3) {
          score = Math.max(score, 0.72);
        } else if (
          qFold.length >= 4 &&
          (target.includes(qFold) || qFold.includes(target))
        ) {
          score = Math.max(score, 0.65);
        }
        if (score > bestScore) {
          bestScore = score;
          bestTerm = term;
        }
      }

      if (bestTerm && bestScore >= 0.56) {
        this.incrementSearchCount(bestTerm.id);
        return {
          query,
          direction,
          matchType: 'closest_verified',
          term: bestTerm,
          filtersApplied: filters,
        };
      }
    } else {
      const qExact = normalizeArabic(query, false);
      const qFold = normalizeArabic(query, true);

      // 1. Exact Arabic match
      const exactId = this.arExactIndex.get(qExact) || this.arFoldIndex.get(qFold);
      if (exactId) {
        const found = candidates.find((t) => t.id === exactId);
        if (found) {
          this.incrementSearchCount(found.id);
          return { query, direction, matchType: 'exact', term: found, filtersApplied: filters };
        }
      }

      // 2. Exact match on slash-separated Arabic equivalents, Egyptian equivalents, or synonyms (with/without "ال")
      const stripAl = (s: string) => (s.startsWith('ال') ? s.slice(2) : s);
      const qBare = stripAl(qFold);
      for (const term of candidates) {
        const parts = term.arabicTerm
          .replace(/بحسب السياق/g, '')
          .split('/')
          .map((p) => normalizeArabic(p, true));
        const eqParts = (term.egyptianEquivalent || '')
          .split('/')
          .map((p) => normalizeArabic(p, true));
        const syns = term.synonyms.map((s) => normalizeArabic(s, true));
        const allForms = [...parts, ...eqParts, ...syns].filter(Boolean);
        if (
          allForms.some((f) => f === qFold || stripAl(f) === qBare)
        ) {
          this.incrementSearchCount(term.id);
          return { query, direction, matchType: 'exact', term, filtersApplied: filters };
        }
      }

      // 3. Closest verified match
      let bestTerm: LegalTerm | null = null;
      let bestScore = 0;
      for (const term of candidates) {
        if (
          term.verificationStatus === 'Pending Verification' ||
          term.verificationStatus === 'Pending Legal Verification'
        ) {
          continue;
        }
        const parts = term.arabicTerm
          .replace(/بحسب السياق/g, '')
          .split('/')
          .map((p) => normalizeArabic(p, true));
        for (const p of parts) {
          let score = trigramDice(qFold, p);
          if (stripAl(p) === qBare && qBare.length >= 3) score = Math.max(score, 0.85);
          if (p.startsWith(qFold) && qFold.length >= 3) score = Math.max(score, 0.72);
          if (qFold.length >= 4 && (p.includes(qFold) || qFold.includes(p))) {
            score = Math.max(score, 0.64);
          }
          if (score > bestScore) {
            bestScore = score;
            bestTerm = term;
          }
        }
      }

      if (bestTerm && bestScore >= 0.56) {
        this.incrementSearchCount(bestTerm.id);
        return {
          query,
          direction,
          matchType: 'closest_verified',
          term: bestTerm,
          filtersApplied: filters,
        };
      }
    }

    this.logMissingTerm(query, direction);
    return {
      query,
      direction,
      matchType: 'not_found',
      term: null,
      notFoundMessage: 'لم يتم العثور على المصطلح في قاعدة البيانات.',
      filtersApplied: filters,
    };
  }

  private incrementSearchCount(id: string): void {
    const term = this.data.terms.find((t) => t.id === id);
    if (term) {
      term.searchCount = (term.searchCount || 0) + 1;
      this.persist();
    }
  }

  private logMissingTerm(query: string, direction: SearchDirection): void {
    const normalized =
      direction === 'tr-ar' ? normalizeTurkish(query, true) : normalizeArabic(query, true);
    const existing = this.data.missingTerms.find(
      (m) =>
        m.direction === direction &&
        (direction === 'tr-ar'
          ? normalizeTurkish(m.query, true) === normalized
          : normalizeArabic(m.query, true) === normalized)
    );
    const now = new Date().toISOString();
    if (existing) {
      existing.count += 1;
      existing.lastSearchedAt = now;
    } else {
      this.data.missingTerms.unshift({
        id: `miss-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        query,
        direction,
        count: 1,
        lastSearchedAt: now,
      });
      if (this.data.missingTerms.length > 500) {
        this.data.missingTerms = this.data.missingTerms.slice(0, 500);
      }
    }
    this.persist();
  }

  public listTerms(params: {
    page?: number;
    limit?: number;
    q?: string;
    filters?: SearchFilters;
  }) {
    const page = Math.max(1, params.page || 1);
    const limit = Math.min(100, Math.max(1, params.limit || 20));
    const q = (params.q || '').trim();
    const filters = params.filters || {};

    let items = this.data.terms.filter((t) => this.matchesFilters(t, filters));

    if (q) {
      const qTr = normalizeTurkish(q, true);
      const qAr = normalizeArabic(q, true);
      items = items.filter(
        (t) =>
          normalizeTurkish(t.turkishTerm, true).includes(qTr) ||
          normalizeArabic(t.arabicTerm, true).includes(qAr) ||
          normalizeTurkish(t.turkishDefinition, true).includes(qTr) ||
          normalizeArabic(t.arabicDefinition, true).includes(qAr) ||
          normalizeTurkish(t.turkishEquivalent || '', true).includes(qTr) ||
          normalizeArabic(t.egyptianEquivalent || '', true).includes(qAr) ||
          normalizeTurkish(t.subcategory || '', true).includes(qTr) ||
          t.synonyms.some(
            (s) =>
              normalizeTurkish(s, true).includes(qTr) ||
              normalizeArabic(s, true).includes(qAr)
          ) ||
          (t.source.lawNumber || '').toLowerCase().includes(q.toLowerCase()) ||
          (t.source.articleNumber || '').toLowerCase().includes(q.toLowerCase())
      );
    }

    const total = items.length;
    const totalPages = Math.max(1, Math.ceil(total / limit));
    const safePage = Math.min(page, totalPages);
    const offset = (safePage - 1) * limit;
    return {
      items: items.slice(offset, offset + limit),
      total,
      page: safePage,
      limit,
      totalPages,
    };
  }

  public getAllVerifiedTerms(): LegalTerm[] {
    return this.data.terms.filter(
      (t) =>
        t.verificationStatus !== 'Pending Verification' &&
        t.verificationStatus !== 'Pending Legal Verification'
    );
  }

  public getMissingTerms(): MissingTermLog[] {
    return this.data.missingTerms;
  }

  public resolveMissingTerm(id: string): boolean {
    const before = this.data.missingTerms.length;
    this.data.missingTerms = this.data.missingTerms.filter((m) => m.id !== id);
    if (this.data.missingTerms.length !== before) {
      this.persist();
      return true;
    }
    return false;
  }

  public createTerm(
    input: Omit<LegalTerm, 'id' | 'revisions' | 'searchCount' | 'lastUpdatedDate'> & {
      id?: string;
    },
    editedBy = 'Administrator'
  ): { created?: LegalTerm; duplicate?: LegalTerm } {
    const trFold = normalizeTurkish(input.turkishTerm, true);
    const arFold = normalizeArabic(input.arabicTerm, true);
    const duplicate = this.data.terms.find(
      (t) =>
        normalizeTurkish(t.turkishTerm, true) === trFold &&
        normalizeArabic(t.arabicTerm, true) === arFold
    );
    if (duplicate) {
      return { duplicate };
    }

    const now = new Date().toISOString();
    const today = now.slice(0, 10);
    const id =
      input.id ||
      `trm-${trFold.replace(/[^a-z0-9]+/g, '-').slice(0, 28)}-${Date.now().toString(36)}`;

    const created: LegalTerm = {
      ...input,
      id,
      turkishExamples: input.turkishExamples || [],
      arabicExamples: input.arabicExamples || [],
      documentTypes: input.documentTypes || ['Contracts'],
      legislativeClassification:
        input.legislativeClassification || 'Turkish Legislative Term',
      translationClassification:
        input.translationClassification || 'Functional Legal Equivalent',
      verificationStatus: input.verificationStatus || 'Pending Verification',
      editorialStage: input.editorialStage || 'Term collection',
      legalStatus: input.legalStatus || 'Current',
      legalContext: input.legalContext || { tr: '', ar: '' },
      comparativeAnalysis: input.comparativeAnalysis || {
        originDefinition: input.turkishDefinition || '',
        targetConcept: input.arabicDefinition || '',
        meaningDifferences: '',
        legalEffectsDifferences: '',
        proceduralDifferences: '',
        recommendedTranslation: input.arabicTerm,
        alternativeTranslations: [],
        commonMistakes: [],
      },
      translatorNotes: input.translatorNotes || { tr: '', ar: '' },
      relatedTerms: input.relatedTerms || [],
      confusableTerms: input.confusableTerms || [],
      synonyms: input.synonyms || [],
      difficulty: input.difficulty || 'Intermediate',
      lastVerifiedDate: input.lastVerifiedDate || today,
      lastUpdatedDate: today,
      searchCount: 0,
      revisions: [
        {
          version: 1,
          editedAt: now,
          editedBy,
          changeNote: 'Created via Editorial Console',
          stage: input.editorialStage || 'Term collection',
        },
      ],
    };

    if (created.isMonthlyFeatured) {
      this.data.terms.forEach((t) => {
        t.isMonthlyFeatured = false;
      });
    }

    this.data.terms.unshift(created);
    this.persist();
    this.rebuildIndexes();
    return { created };
  }

  public updateTerm(
    id: string,
    patch: Partial<LegalTerm>,
    changeNote = 'Updated entry',
    editedBy = 'Administrator'
  ): LegalTerm | null {
    const index = this.data.terms.findIndex((t) => t.id === id);
    if (index === -1) return null;

    const existing = this.data.terms[index];
    const now = new Date().toISOString();
    const today = now.slice(0, 10);

    if (patch.isMonthlyFeatured) {
      this.data.terms.forEach((t) => {
        if (t.id !== id) t.isMonthlyFeatured = false;
      });
    }

    const nextStage: EditorialStage = patch.editorialStage || existing.editorialStage;
    const updated: LegalTerm = {
      ...existing,
      ...patch,
      id: existing.id,
      lastUpdatedDate: today,
      lastVerifiedDate:
        patch.verificationStatus === 'Officially Verified' ? today : patch.lastVerifiedDate || existing.lastVerifiedDate,
      revisions: [
        {
          version: (existing.revisions[0]?.version || existing.revisions.length) + 1,
          editedAt: now,
          editedBy,
          changeNote,
          stage: nextStage,
        },
        ...existing.revisions,
      ].slice(0, 25),
    };

    this.data.terms[index] = updated;
    this.persist();
    this.rebuildIndexes();
    return updated;
  }

  public deleteTerm(id: string): boolean {
    const before = this.data.terms.length;
    this.data.terms = this.data.terms.filter((t) => t.id !== id);
    if (this.data.terms.length !== before) {
      this.persist();
      this.rebuildIndexes();
      return true;
    }
    return false;
  }

  public bulkImportTerms(
    rawEntries: Array<Partial<LegalTerm>>,
    editedBy = 'Bulk Importer'
  ): { inserted: number; skippedDuplicates: number; errors: string[] } {
    let inserted = 0;
    let skippedDuplicates = 0;
    const errors: string[] = [];
    const now = new Date().toISOString();
    const today = now.slice(0, 10);

    for (let i = 0; i < rawEntries.length; i++) {
      const entry = rawEntries[i];
      const tr = (entry.turkishTerm || '').trim();
      const ar = (entry.arabicTerm || '').trim();
      if (!tr || !ar) {
        errors.push(`Row ${i + 1}: Missing Turkish or Arabic term.`);
        continue;
      }

      const trFold = normalizeTurkish(tr, true);
      const arFold = normalizeArabic(ar, true);
      const exists = this.data.terms.some(
        (t) =>
          normalizeTurkish(t.turkishTerm, true) === trFold &&
          normalizeArabic(t.arabicTerm, true) === arFold
      );
      if (exists) {
        skippedDuplicates += 1;
        continue;
      }

      const newTerm: LegalTerm = {
        id: `trm-imp-${Date.now().toString(36)}-${i}`,
        turkishTerm: tr,
        arabicTerm: ar,
        turkishPronunciation: entry.turkishPronunciation || '',
        arabicPronunciation: entry.arabicPronunciation || '',
        turkishDefinition:
          entry.turkishDefinition || `${tr} hukuki teriminin doğrulanmayı bekleyen tanımı.`,
        arabicDefinition:
          entry.arabicDefinition || `تعريف المصطلح القانوني (${ar}) قيد المراجعة والتوثيق.`,
        turkishExamples: entry.turkishExamples || [],
        arabicExamples: entry.arabicExamples || [],
        specializationId: entry.specializationId || 'contracts-obligations',
        documentTypes: entry.documentTypes || ['Contracts'],
        contractType: entry.contractType,
        issuingAuthority: entry.issuingAuthority || '',
        jurisdiction: entry.jurisdiction || 'Comparative Law',
        legislativeClassification: entry.legislativeClassification || 'Turkish Legislative Term',
        translationClassification: entry.translationClassification || 'Contextual Equivalent',
        verificationStatus: entry.verificationStatus || 'Pending Verification',
        editorialStage: entry.editorialStage || 'Term collection',
        legalStatus: entry.legalStatus || 'Current',
        legalContext: entry.legalContext || { tr: '', ar: '' },
        comparativeAnalysis: entry.comparativeAnalysis || {
          originDefinition: entry.turkishDefinition || '',
          targetConcept: entry.arabicDefinition || '',
          meaningDifferences: '',
          legalEffectsDifferences: '',
          proceduralDifferences: '',
          recommendedTranslation: ar,
          alternativeTranslations: [],
          commonMistakes: [],
        },
        translatorNotes: entry.translatorNotes || { tr: '', ar: '' },
        relatedTerms: entry.relatedTerms || [],
        confusableTerms: entry.confusableTerms || [],
        synonyms: entry.synonyms || [],
        source: entry.source || {
          authority: 'Pending Official Verification',
          documentTitle: 'Imported Entry — Requires Source Check',
          jurisdiction: entry.jurisdiction || 'Comparative Law',
          verificationDate: today,
          status: 'Current',
        },
        lastVerifiedDate: today,
        lastUpdatedDate: today,
        searchCount: 0,
        difficulty: entry.difficulty || 'Intermediate',
        revisions: [
          {
            version: 1,
            editedAt: now,
            editedBy,
            changeNote: 'Bulk import',
            stage: entry.editorialStage || 'Term collection',
          },
        ],
      };

      this.data.terms.unshift(newTerm);
      inserted += 1;
    }

    if (inserted > 0) {
      this.persist();
      this.rebuildIndexes();
    }
    return { inserted, skippedDuplicates, errors };
  }

  public exportCsv(): string {
    const headers = [
      'id',
      'turkishTerm',
      'arabicTerm',
      'specializationId',
      'jurisdiction',
      'legislativeClassification',
      'translationClassification',
      'verificationStatus',
      'legalStatus',
      'turkishDefinition',
      'arabicDefinition',
      'sourceAuthority',
      'sourceDocumentTitle',
      'lawNumber',
      'articleNumber',
      'lastVerifiedDate',
    ];
    const escape = (val: string | undefined) => {
      const s = (val || '').replace(/"/g, '""');
      return `"${s}"`;
    };
    const rows = this.data.terms.map((t) =>
      [
        t.id,
        t.turkishTerm,
        t.arabicTerm,
        t.specializationId,
        t.jurisdiction,
        t.legislativeClassification,
        t.translationClassification,
        t.verificationStatus,
        t.legalStatus,
        t.turkishDefinition,
        t.arabicDefinition,
        t.source.authority,
        t.source.documentTitle,
        t.source.lawNumber,
        t.source.articleNumber,
        t.lastVerifiedDate,
      ]
        .map(escape)
        .join(',')
    );
    return [headers.join(','), ...rows].join('\n');
  }

  public getAdminRecord(): AdminRecord | undefined {
    return this.data.admin;
  }

  public saveAdminRecord(record: AdminRecord): void {
    this.data.admin = record;
    this.persist();
  }
}

export const dictionaryStore = new LegalDictionaryStore();
