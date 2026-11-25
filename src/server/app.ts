import express, { type NextFunction, type Request, type Response } from 'express';
import { validateSearchInput } from '../lib/languageValidation.ts';
import type {
  DifficultyLevel,
  QuizQuestion,
  SearchDirection,
  SearchFilters,
} from '../types/legal.ts';
import { extractDocumentTerminology, runLegalAssistant } from './ai.ts';
import {
  bootstrapAdminPassword,
  getAuthSetupState,
  requireAdminAuth,
  verifyAdminLogin,
  type AdminRole,
} from './auth.ts';
import { CONSTITUTIONAL_PROVISIONS, OFFICIAL_DOCUMENT_GUIDES } from './data/constitutionsAndDocs.ts';
import { LEGAL_DISTINCTIONS } from './data/distinctions.ts';
import { SPECIALIZATIONS } from './data/specializations.ts';
import { dictionaryStore } from './database.ts';

function parseCsvRows(csvText: string): Array<Record<string, string>> {
  const lines = csvText
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);
  if (lines.length < 2) return [];

  const splitLine = (line: string) => {
    const out: string[] = [];
    let cur = '';
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (ch === '"') {
        if (inQuotes && line[i + 1] === '"') {
          cur += '"';
          i++;
        } else {
          inQuotes = !inQuotes;
        }
      } else if (ch === ',' && !inQuotes) {
        out.push(cur);
        cur = '';
      } else {
        cur += ch;
      }
    }
    out.push(cur);
    return out.map((s) => s.trim());
  };

  const headers = splitLine(lines[0]);
  return lines.slice(1).map((line) => {
    const vals = splitLine(line);
    const row: Record<string, string> = {};
    headers.forEach((h, idx) => {
      row[h] = vals[idx] || '';
    });
    return row;
  });
}

export function createApiApp(options: { attachApiFallbackHandlers?: boolean } = {}) {
  const { attachApiFallbackHandlers = true } = options;
  const app = express();

  app.use(express.json({ limit: '12mb' }));

  // Public Dictionary Overview
  app.get('/api/overview', (_req, res) => {
    const stats = dictionaryStore.getStats();
    res.json({
      ...stats,
      specializationsCount: SPECIALIZATIONS.length,
      distinctionsCount: LEGAL_DISTINCTIONS.length,
      constitutionalProvisionsCount: CONSTITUTIONAL_PROVISIONS.length,
    });
  });

  // Strict Single-Term Search Engine
  app.get('/api/search', (req, res, next) => {
    try {
      const q = String(req.query.q || '');
      const direction: SearchDirection = req.query.direction === 'ar-tr' ? 'ar-tr' : 'tr-ar';

      const validation = validateSearchInput(q, direction);
      if (!validation.valid) {
        return res.status(400).json({
          error: validation.errorMessage,
          validation,
        });
      }

      const filters: SearchFilters = {
        jurisdiction: (req.query.jurisdiction as SearchFilters['jurisdiction']) || '',
        specializationId: String(req.query.specializationId || ''),
        subcategory: String(req.query.subcategory || ''),
        documentType: String(req.query.documentType || ''),
        contractType: String(req.query.contractType || ''),
        issuingAuthority: String(req.query.issuingAuthority || ''),
        lawNumber: String(req.query.lawNumber || ''),
        articleNumber: String(req.query.articleNumber || ''),
        legalStatus: (req.query.legalStatus as SearchFilters['legalStatus']) || '',
        verificationStatus:
          (req.query.verificationStatus as SearchFilters['verificationStatus']) || '',
      };

      const result = dictionaryStore.searchExactTerm(q, direction, filters);
      res.json(result);
    } catch (err) {
      next(err);
    }
  });

  // Paginated Terms Listing (for browsing by specialization / filter / admin)
  app.get('/api/terms', (req, res, next) => {
    try {
      const page = Number(req.query.page || 1);
      const limit = Number(req.query.limit || 20);
      const q = String(req.query.q || '');
      const filters: SearchFilters = {
        jurisdiction: (req.query.jurisdiction as SearchFilters['jurisdiction']) || '',
        specializationId: String(req.query.specializationId || ''),
        subcategory: String(req.query.subcategory || ''),
        documentType: String(req.query.documentType || ''),
        contractType: String(req.query.contractType || ''),
        issuingAuthority: String(req.query.issuingAuthority || ''),
        lawNumber: String(req.query.lawNumber || ''),
        articleNumber: String(req.query.articleNumber || ''),
        legalStatus: (req.query.legalStatus as SearchFilters['legalStatus']) || '',
        verificationStatus:
          (req.query.verificationStatus as SearchFilters['verificationStatus']) || '',
      };
      res.json(dictionaryStore.listTerms({ page, limit, q, filters }));
    } catch (err) {
      next(err);
    }
  });

  // Single Term Detail
  app.get('/api/terms/:id', (req, res, next) => {
    try {
      const term = dictionaryStore.getTermById(req.params.id);
      if (!term) {
        return res.status(404).json({ error: 'Term not found' });
      }
      res.json(term);
    } catch (err) {
      next(err);
    }
  });

  // Categories / Legal Specializations with live counts
  app.get('/api/categories', (_req, res, next) => {
    try {
      const counts = dictionaryStore.getSpecializationCounts();
      const enriched = SPECIALIZATIONS.map((s) => ({
        ...s,
        termCount: counts[s.id] || 0,
      }));
      res.json(enriched);
    } catch (err) {
      next(err);
    }
  });

  // Legal Distinctions Database
  app.get('/api/distinctions', (req, res) => {
    const groupId = String(req.query.groupId || '');
    const q = String(req.query.q || '').trim().toLowerCase();
    let list = LEGAL_DISTINCTIONS;
    if (groupId) {
      list = list.filter((d) => d.groupId === groupId);
    }
    if (q) {
      list = list.filter(
        (d) =>
          d.termA.tr.toLowerCase().includes(q) ||
          d.termA.ar.includes(q) ||
          d.termB.tr.toLowerCase().includes(q) ||
          d.termB.ar.includes(q) ||
          d.mainDifferenceTr.toLowerCase().includes(q)
      );
    }
    res.json(list);
  });

  // Constitutions & Official Document Guides
  app.get('/api/legislation', (req, res) => {
    const country = String(req.query.country || '');
    const q = String(req.query.q || '').trim().toLowerCase();
    let provisions = CONSTITUTIONAL_PROVISIONS;
    let guides = OFFICIAL_DOCUMENT_GUIDES;
    if (country === 'Turkey' || country === 'Egypt') {
      provisions = provisions.filter((p) => p.country === country);
      guides = guides.filter((g) => g.country === country);
    }
    if (q) {
      provisions = provisions.filter(
        (p) =>
          p.originalText.toLowerCase().includes(q) ||
          p.translatedText.toLowerCase().includes(q) ||
          p.articleNumber.toLowerCase().includes(q) ||
          p.constitutionTitleTr.toLowerCase().includes(q)
      );
    }
    res.json({ provisions, guides });
  });

  // Verified Terminology Quiz Generator ("Terim Testi")
  app.get('/api/quiz', (req, res, next) => {
    try {
      const direction: SearchDirection = req.query.direction === 'ar-tr' ? 'ar-tr' : 'tr-ar';
      const difficulty = String(req.query.difficulty || 'All') as DifficultyLevel | 'All';
      const specializationId = String(req.query.specializationId || '');
      const count = Math.min(15, Math.max(3, Number(req.query.count || 6)));

      const verifiedPool = dictionaryStore.getAllVerifiedTerms();
      let pool = verifiedPool;
      if (difficulty !== 'All') {
        const byDiff = pool.filter((t) => t.difficulty === difficulty);
        if (byDiff.length >= 4) pool = byDiff;
      }
      if (specializationId) {
        const bySpec = pool.filter((t) => t.specializationId === specializationId);
        if (bySpec.length >= 4) pool = bySpec;
      }

      const shuffled = [...pool].sort(() => Math.random() - 0.5).slice(0, count);
      const questions: QuizQuestion[] = shuffled.map((target) => {
        const distractors = [...verifiedPool]
          .filter((other) => other.id !== target.id)
          .sort(() => Math.random() - 0.5)
          .slice(0, 3);

        const promptTerm = direction === 'tr-ar' ? target.turkishTerm : target.arabicTerm;
        const correctOption = direction === 'tr-ar' ? target.arabicTerm : target.turkishTerm;
        const options = [
          correctOption,
          ...distractors.map((d) => (direction === 'tr-ar' ? d.arabicTerm : d.turkishTerm)),
        ].sort(() => Math.random() - 0.5);

        return {
          id: `q-${target.id}-${Math.random().toString(36).slice(2, 6)}`,
          promptTerm,
          promptLanguage: direction === 'tr-ar' ? 'tr' : 'ar',
          correctOption,
          options,
          specializationId: target.specializationId,
          difficulty: target.difficulty,
          explanationTr: target.turkishDefinition,
          explanationAr: target.arabicDefinition,
          sourceTitle: `${target.source.authority} — ${target.source.documentTitle}`,
          termId: target.id,
        };
      });

      res.json({ direction, difficulty, questions });
    } catch (err) {
      next(err);
    }
  });

  // Gemini AI Legal Search Assistant (Server-Side)
  app.post('/api/ai/assistant', async (req, res) => {
    try {
      const { question, language, jurisdictionFocus } = req.body || {};
      if (!question || typeof question !== 'string' || !question.trim()) {
        return res.status(400).json({ error: 'Question is required.' });
      }
      const result = await runLegalAssistant({
        question: question.trim(),
        language: language === 'ar' ? 'ar' : 'tr',
        jurisdictionFocus,
      });
      res.json(result);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'AI assistant request failed.';
      console.error('AI Assistant error:', err);
      res.status(500).json({ error: message });
    }
  });

  // Gemini AI Document Terminology Extraction (Server-Side)
  app.post('/api/ai/extract-document', async (req, res) => {
    try {
      const { text, fileBase64, mimeType, fileName } = req.body || {};
      if ((!text || !String(text).trim()) && !fileBase64) {
        return res.status(400).json({ error: 'Please provide document text or upload a supported file.' });
      }
      const result = await extractDocumentTerminology({ text, fileBase64, mimeType, fileName });
      res.json(result);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Document analysis failed.';
      console.error('Document extraction error:', err);
      res.status(500).json({ error: message });
    }
  });

  // Admin Auth Routes
  app.get('/api/admin/auth/state', (_req, res) => {
    res.json(getAuthSetupState());
  });

  app.post('/api/admin/auth/bootstrap', (req, res) => {
    const { password } = req.body || {};
    const result = bootstrapAdminPassword(String(password || ''));
    if (result.error) {
      return res.status(400).json({ error: result.error });
    }
    res.json(result);
  });

  app.post('/api/admin/auth/login', (req, res) => {
    const { password, role } = req.body || {};
    const result = verifyAdminLogin(String(password || ''), role as AdminRole);
    if (result.error) {
      return res.status(401).json({ error: result.error });
    }
    res.json(result);
  });

  // Protected Admin Routes
  app.get('/api/admin/overview', requireAdminAuth(), (_req, res) => {
    res.json({
      stats: dictionaryStore.getStats(),
      missingTerms: dictionaryStore.getMissingTerms(),
    });
  });

  app.post('/api/admin/terms', requireAdminAuth(['Admin', 'Legal Reviewer']), (req, res) => {
    const payload = req.body;
    if (!payload?.turkishTerm || !payload?.arabicTerm) {
      return res.status(400).json({ error: 'Turkish term and Arabic equivalent are required.' });
    }
    const result = dictionaryStore.createTerm(payload, req.body.editedBy || 'Admin');
    if (result.duplicate) {
      return res.status(409).json({
        error: 'Duplicate entry detected in dictionary.',
        duplicate: result.duplicate,
      });
    }
    res.status(201).json(result.created);
  });

  app.put('/api/admin/terms/:id', requireAdminAuth(), (req, res) => {
    const { changeNote, editedBy, ...patch } = req.body || {};
    const updated = dictionaryStore.updateTerm(
      req.params.id,
      patch,
      changeNote || 'Editorial workflow update',
      editedBy || 'Reviewer'
    );
    if (!updated) {
      return res.status(404).json({ error: 'Term not found.' });
    }
    res.json(updated);
  });

  app.delete('/api/admin/terms/:id', requireAdminAuth(['Admin']), (req, res) => {
    const ok = dictionaryStore.deleteTerm(req.params.id);
    if (!ok) {
      return res.status(404).json({ error: 'Term not found.' });
    }
    res.json({ deleted: true });
  });

  app.post('/api/admin/import', requireAdminAuth(['Admin', 'Legal Reviewer']), (req, res) => {
    const { format, content } = req.body || {};
    if (!content) {
      return res.status(400).json({ error: 'Import payload is required.' });
    }
    try {
      let rows: Array<Record<string, unknown>> = [];
      if (format === 'csv') {
        rows = parseCsvRows(String(content));
      } else {
        const parsed = typeof content === 'string' ? JSON.parse(content) : content;
        rows = Array.isArray(parsed) ? parsed : [parsed];
      }
      const summary = dictionaryStore.bulkImportTerms(rows, 'Admin Bulk Import');
      res.json(summary);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Invalid import format.';
      res.status(400).json({ error: msg });
    }
  });

  app.get('/api/admin/export', requireAdminAuth(), (req, res) => {
    const format = req.query.format === 'csv' ? 'csv' : 'json';
    if (format === 'csv') {
      res.setHeader('Content-Type', 'text/csv; charset=utf-8');
      res.setHeader('Content-Disposition', 'attachment; filename="ahd-kanuni-sozluk.csv"');
      return res.send(dictionaryStore.exportCsv());
    }
    const all = dictionaryStore.listTerms({ page: 1, limit: 100000 }).items;
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename="ahd-kanuni-sozluk.json"');
    res.send(JSON.stringify(all, null, 2));
  });

  app.delete('/api/admin/missing/:id', requireAdminAuth(), (req, res) => {
    const ok = dictionaryStore.resolveMissingTerm(req.params.id);
    res.json({ resolved: ok });
  });

  // Always return JSON for unknown /api/* routes (never fall through to HTML)
  app.use('/api', (_req, res) => {
    res.status(404).json({ error: 'API endpoint not found.' });
  });

  if (attachApiFallbackHandlers) {
    attachJsonErrorMiddleware(app);
  }

  return app;
}

export function attachJsonErrorMiddleware(app: express.Express) {
  app.use((err: unknown, req: Request, res: Response, next: NextFunction) => {
    if (res.headersSent) {
      return next(err);
    }
    const status =
      typeof (err as { status?: unknown })?.status === 'number'
        ? (err as { status: number }).status
        : typeof (err as { statusCode?: unknown })?.statusCode === 'number'
          ? (err as { statusCode: number }).statusCode
          : 500;
    const message =
      err instanceof Error && err.message
        ? err.message
        : 'Internal server error.';
    console.error(`API Error [${req.method} ${req.originalUrl}]:`, err);
    res.status(status).json({ error: message });
  });
}
