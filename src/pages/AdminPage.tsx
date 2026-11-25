import React, { useCallback, useEffect, useState } from 'react';
import {
  BarChart3,
  Check,
  Download,
  Edit3,
  Loader2,
  LogOut,
  Plus,
  Shield,
  Star,
  Trash2,
  Upload,
} from 'lucide-react';
import type {
  EditorialStage,
  JurisdictionType,
  LegalSpecialization,
  LegalStatus,
  LegalTerm,
  MissingTermLog,
  TranslationClassification,
  VerificationStatus,
} from '../types/legal.ts';

type AdminRole = 'Admin' | 'Legal Reviewer' | 'Linguistic Editor';

interface AdminOverviewResponse {
  stats: {
    totalTerms: number;
    verifiedTerms: number;
    pendingTerms: number;
    missingCount: number;
    featuredTerm: LegalTerm | null;
    popularTerms: LegalTerm[];
  };
  missingTerms: MissingTermLog[];
}

const EDITORIAL_STAGES: EditorialStage[] = [
  'Term collection',
  'Linguistic verification',
  'Legal definition verification',
  'Comparative legal analysis',
  'Translation equivalence assessment',
  'Official source verification',
  'Expert review',
  'Publication',
];

const VERIFICATION_STATUSES: VerificationStatus[] = [
  'Officially Verified',
  'Source Referenced',
  'Legally Reviewed',
  'Linguistically Reviewed',
  'Expert Reviewed',
  'Pending Verification',
  'Pending Legal Verification',
  'Disputed Translation',
  'Historical Reference',
];

const TRANSLATION_CLASSES: TranslationClassification[] = [
  'Exact Legal Equivalent',
  'Functional Legal Equivalent',
  'Contextual Equivalent',
  'Explanatory Translation',
  'Descriptive Translation',
  'No Direct Equivalent',
  'Borrowed Legal Term',
  'Historical Legal Term',
  'Deprecated Term',
];

export const AdminPage: React.FC = () => {
  // Security Rule: Bearer token kept strictly in React memory (never localStorage/sessionStorage)
  const [token, setToken] = useState<string | null>(null);
  const [role, setRole] = useState<AdminRole>('Admin');
  const [needsClaim, setNeedsClaim] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);
  const [passwordInput, setPasswordInput] = useState('');
  const [selectedRole, setSelectedRole] = useState<AdminRole>('Admin');
  const [authError, setAuthError] = useState<string | null>(null);

  const [tab, setTab] = useState<'terms' | 'import' | 'analytics'>('terms');
  const [overview, setOverview] = useState<AdminOverviewResponse | null>(null);
  const [terms, setTerms] = useState<LegalTerm[]>([]);
  const [specializations, setSpecializations] = useState<LegalSpecialization[]>([]);
  const [searchFilter, setSearchFilter] = useState('');
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  // Add/Edit Modal Form State
  const [editingTerm, setEditingTerm] = useState<LegalTerm | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [formState, setFormState] = useState({
    turkishTerm: '',
    arabicTerm: '',
    turkishDefinition: '',
    arabicDefinition: '',
    specializationId: 'contracts',
    jurisdiction: 'Comparative Law' as JurisdictionType,
    translationClassification: 'Functional Legal Equivalent' as TranslationClassification,
    verificationStatus: 'Officially Verified' as VerificationStatus,
    editorialStage: 'Publication' as EditorialStage,
    legalStatus: 'Current' as LegalStatus,
    authority: 'T.C. Adalet Bakanlığı / وزارة العدل المصرية',
    documentTitle: 'Karşılaştırmalı Mevzuat',
    lawNumber: '',
    articleNumber: '',
    translatorNoteTr: '',
    translatorNoteAr: '',
    changeNote: 'Yönetici doğrulama güncellemesi',
  });

  // Bulk import state
  const [importFormat, setImportFormat] = useState<'csv' | 'json'>('csv');
  const [importContent, setImportContent] = useState('');
  const [importResult, setImportResult] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/admin/auth/state')
      .then((res) => res.json())
      .then((data: { needsFirstRunClaim: boolean }) => {
        setNeedsClaim(data.needsFirstRunClaim);
      })
      .finally(() => setAuthLoading(false));

    fetch('/api/categories')
      .then((res) => res.json())
      .then((data: LegalSpecialization[]) => setSpecializations(data))
      .catch(() => {});
  }, []);

  const loadDashboardData = useCallback(async () => {
    if (!token) return;
    const headers = { Authorization: `Bearer ${token}` };
    const [ovRes, termsRes] = await Promise.all([
      fetch('/api/admin/overview', { headers }),
      fetch(`/api/terms?page=1&limit=100&q=${encodeURIComponent(searchFilter)}`),
    ]);
    if (ovRes.status === 401) {
      setToken(null);
      return;
    }
    if (ovRes.ok) {
      setOverview((await ovRes.json()) as AdminOverviewResponse);
    }
    if (termsRes.ok) {
      const data = await termsRes.json();
      setTerms((data.items || []) as LegalTerm[]);
    }
  }, [token, searchFilter]);

  useEffect(() => {
    if (token) {
      loadDashboardData();
    }
  }, [token, loadDashboardData]);

  const handleBootstrap = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    const res = await fetch('/api/admin/auth/bootstrap', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password: passwordInput }),
    });
    const data = await res.json();
    if (!res.ok) {
      setAuthError(data.error || 'Kurulum başarısız.');
      return;
    }
    setToken(data.token);
    setRole(data.role || 'Admin');
    setNeedsClaim(false);
    setPasswordInput('');
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    const res = await fetch('/api/admin/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password: passwordInput, role: selectedRole }),
    });
    const data = await res.json();
    if (!res.ok) {
      setAuthError(data.error || 'Giriş başarısız.');
      return;
    }
    setToken(data.token);
    setRole(data.role || selectedRole);
    setPasswordInput('');
  };

  const openEdit = (t: LegalTerm) => {
    setEditingTerm(t);
    setShowCreateForm(false);
    setFormState({
      turkishTerm: t.turkishTerm,
      arabicTerm: t.arabicTerm,
      turkishDefinition: t.turkishDefinition,
      arabicDefinition: t.arabicDefinition,
      specializationId: t.specializationId,
      jurisdiction: t.jurisdiction,
      translationClassification: t.translationClassification,
      verificationStatus: t.verificationStatus,
      editorialStage: t.editorialStage,
      legalStatus: t.legalStatus,
      authority: t.source.authority,
      documentTitle: t.source.documentTitle,
      lawNumber: t.source.lawNumber || '',
      articleNumber: t.source.articleNumber || '',
      translatorNoteTr: t.translatorNotes.tr,
      translatorNoteAr: t.translatorNotes.ar,
      changeNote: 'Editöryal inceleme güncellemesi',
    });
  };

  const openCreate = () => {
    setEditingTerm(null);
    setShowCreateForm(true);
    setFormState({
      turkishTerm: '',
      arabicTerm: '',
      turkishDefinition: '',
      arabicDefinition: '',
      specializationId: specializations[0]?.id || 'contracts',
      jurisdiction: 'Comparative Law',
      translationClassification: 'Functional Legal Equivalent',
      verificationStatus: 'Pending Verification',
      editorialStage: 'Term collection',
      legalStatus: 'Current',
      authority: '',
      documentTitle: '',
      lawNumber: '',
      articleNumber: '',
      translatorNoteTr: '',
      translatorNoteAr: '',
      changeNote: 'Yeni hukuk terimi eklendi',
    });
  };

  const handleSaveTerm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    setActionMessage(null);

    if (editingTerm) {
      const res = await fetch(`/api/admin/terms/${encodeURIComponent(editingTerm.id)}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          turkishTerm: formState.turkishTerm,
          arabicTerm: formState.arabicTerm,
          turkishDefinition: formState.turkishDefinition,
          arabicDefinition: formState.arabicDefinition,
          specializationId: formState.specializationId,
          jurisdiction: formState.jurisdiction,
          translationClassification: formState.translationClassification,
          verificationStatus: formState.verificationStatus,
          editorialStage: formState.editorialStage,
          legalStatus: formState.legalStatus,
          translatorNotes: {
            tr: formState.translatorNoteTr || editingTerm.translatorNotes.tr,
            ar: formState.translatorNoteAr || editingTerm.translatorNotes.ar,
          },
          source: {
            ...editingTerm.source,
            authority: formState.authority,
            documentTitle: formState.documentTitle,
            lawNumber: formState.lawNumber,
            articleNumber: formState.articleNumber,
          },
          changeNote: formState.changeNote,
          editedBy: role,
        }),
      });
      if (res.ok) {
        setEditingTerm(null);
        setActionMessage('Terim güncellendi ve sürüm geçmişine kaydedildi.');
        await loadDashboardData();
      }
      return;
    }

    const res = await fetch('/api/admin/terms', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        turkishTerm: formState.turkishTerm,
        arabicTerm: formState.arabicTerm,
        turkishDefinition: formState.turkishDefinition,
        arabicDefinition: formState.arabicDefinition,
        specializationId: formState.specializationId,
        jurisdiction: formState.jurisdiction,
        translationClassification: formState.translationClassification,
        verificationStatus: formState.verificationStatus,
        editorialStage: formState.editorialStage,
        legalStatus: formState.legalStatus,
        translatorNotes: {
          tr: formState.translatorNoteTr || 'Resmî kaynak kontrolü önerilir.',
          ar: formState.translatorNoteAr || 'يوصى بمراجعة النص الرسمي المعتمد.',
        },
        source: {
          authority: formState.authority || 'AHD Hukuk Kurulu',
          documentTitle: formState.documentTitle || 'Resmî Mevzuat',
          lawNumber: formState.lawNumber,
          articleNumber: formState.articleNumber,
          jurisdiction: formState.jurisdiction,
          verificationDate: new Date().toISOString().slice(0, 10),
          status: formState.legalStatus,
        },
        editedBy: role,
      }),
    });
    const data = await res.json();
    if (!res.ok) {
      setActionMessage(data.error || 'Terim eklenemedi.');
      return;
    }
    setShowCreateForm(false);
    setActionMessage('Yeni hukuk terimi başarıyla eklendi.');
    await loadDashboardData();
  };

  const handleToggleFeatured = async (t: LegalTerm) => {
    if (!token) return;
    await fetch(`/api/admin/terms/${encodeURIComponent(t.id)}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        isMonthlyFeatured: !t.isMonthlyFeatured,
        changeNote: 'Ayın terimi durumu değiştirildi',
        editedBy: role,
      }),
    });
    await loadDashboardData();
  };

  const handleDeleteTerm = async (id: string) => {
    if (!token) return;
    const res = await fetch(`/api/admin/terms/${encodeURIComponent(id)}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.ok) {
      setActionMessage('Terim silindi.');
      await loadDashboardData();
    } else {
      const data = await res.json();
      setActionMessage(data.error || 'Silme yetkiniz bulunmuyor.');
    }
  };

  const handleBulkImport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !importContent.trim()) return;
    const res = await fetch('/api/admin/import', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ format: importFormat, content: importContent }),
    });
    const data = await res.json();
    if (!res.ok) {
      setImportResult(`Hata: ${data.error}`);
      return;
    }
    setImportResult(
      `İçe aktarma tamamlandı: ${data.inserted ?? 0} yeni terim eklendi, ${data.skippedDuplicates ?? 0} yinelenen kayıt atlandı.`
    );
    await loadDashboardData();
  };

  const handleExport = async (format: 'csv' | 'json') => {
    if (!token) return;
    const res = await fetch(`/api/admin/export?format=${format}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) return;
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ahd-kanuni-sozluk.${format}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleResolveMissing = async (id: string) => {
    if (!token) return;
    await fetch(`/api/admin/missing/${encodeURIComponent(id)}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
    await loadDashboardData();
  };

  if (authLoading) {
    return (
      <div className="p-16 flex justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-[#009F9D]" />
      </div>
    );
  }

  // Unauthenticated View (First-Run Claim or Passcode Login)
  if (!token) {
    return (
      <div className="max-w-md mx-auto px-4 py-12">
        <div className="rounded-2xl bg-white dark:bg-[#0F1C21] border border-[#D7E9E8] dark:border-[#1D363D] p-6 sm:p-8 shadow-sm space-y-5">
          <div className="flex items-center gap-2.5 text-[#007F80] dark:text-[#4DE0DC]">
            <Shield className="w-5 h-5" />
            <h1 className="text-lg font-bold text-[#172B35] dark:text-[#F0F7F7]">
              {needsClaim ? 'İlk Yönetici Parolasını Oluştur' : 'AHD Yönetim Paneli Girişi'}
            </h1>
          </div>

          <p className="text-xs sm:text-sm text-[#71818A] dark:text-[#8BA4AE]">
            {needsClaim
              ? 'Veritabanında henüz yönetici parolası tanımlanmamış. Lütfen en az 8 karakterli bir yönetici parolası belirleyin.'
              : 'Hukuk sözlüğü veritabanı yönetimi, 8 aşamalı editör iş akışı ve CSV/JSON içe aktarım için yetkili girişi yapın.'}
          </p>

          <form onSubmit={needsClaim ? handleBootstrap : handleLogin} className="space-y-4">
            {!needsClaim && (
              <div className="space-y-1">
                <label className="text-xs font-bold text-[#71818A]">Yetki Rolü (RBAC)</label>
                <select
                  value={selectedRole}
                  onChange={(e) => setSelectedRole(e.target.value as AdminRole)}
                  className="w-full rounded-xl border border-[#D7E9E8] dark:border-[#1D363D] bg-[#F5FAFA] dark:bg-[#112126] px-3.5 py-2.5 text-sm"
                >
                  <option value="Admin">Yönetici (Admin)</option>
                  <option value="Legal Reviewer">Hukuk İnceleyicisi (Legal Reviewer)</option>
                  <option value="Linguistic Editor">Dil Editörü (Linguistic Editor)</option>
                </select>
              </div>
            )}

            <div className="space-y-1">
              <label className="text-xs font-bold text-[#71818A]">Yönetici Parolası</label>
              <input
                type="password"
                required
                minLength={needsClaim ? 8 : 1}
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-xl border border-[#D7E9E8] dark:border-[#1D363D] bg-[#F5FAFA] dark:bg-[#112126] px-3.5 py-2.5 text-sm"
              />
            </div>

            {authError && (
              <div className="text-xs text-[#A62828] dark:text-[#FCA5A5] bg-[#FEF2F2] dark:bg-[#2C1315] p-3 rounded-xl">
                {authError}
              </div>
            )}

            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-[#009F9D] hover:bg-[#007F80] text-white font-bold text-sm cursor-pointer"
            >
              {needsClaim ? 'Parolayı Kaydet ve Panele Gir' : 'Giriş Yap'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
      {/* Top Bar */}
      <div className="rounded-2xl bg-white dark:bg-[#0F1C21] border border-[#D7E9E8] dark:border-[#1D363D] p-5 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-[#007F80] dark:text-[#4DE0DC]">
            <Shield className="w-4 h-4" />
            <span>OTURUM ROLÜ: {role.toUpperCase()}</span>
          </div>
          <h1 className="text-xl font-bold text-[#172B35] dark:text-[#F0F7F7] mt-1">
            AHD Kanuni Sözlük Yönetim & Editör Paneli
          </h1>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setTab('terms')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold cursor-pointer ${
              tab === 'terms'
                ? 'bg-[#009F9D] text-white'
                : 'bg-[#F5FAFA] dark:bg-[#112126] border border-[#D7E9E8] dark:border-[#1D363D]'
            }`}
          >
            Terimler ({overview?.stats.totalTerms ?? terms.length})
          </button>
          <button
            type="button"
            onClick={() => setTab('import')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold cursor-pointer ${
              tab === 'import'
                ? 'bg-[#009F9D] text-white'
                : 'bg-[#F5FAFA] dark:bg-[#112126] border border-[#D7E9E8] dark:border-[#1D363D]'
            }`}
          >
            Toplu İçe/Dışa Aktarım
          </button>
          <button
            type="button"
            onClick={() => setTab('analytics')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold cursor-pointer ${
              tab === 'analytics'
                ? 'bg-[#009F9D] text-white'
                : 'bg-[#F5FAFA] dark:bg-[#112126] border border-[#D7E9E8] dark:border-[#1D363D]'
            }`}
          >
            Eksik Terimler ({overview?.missingTerms.length ?? 0})
          </button>
          <button
            type="button"
            onClick={() => setToken(null)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-[#D7E9E8] dark:border-[#1D363D] text-xs font-semibold text-[#71818A] hover:text-[#A62828] cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Çıkış</span>
          </button>
        </div>
      </div>

      {actionMessage && (
        <div className="rounded-xl bg-[#DDF5F3] dark:bg-[#132C2E] border border-[#009F9D]/30 px-4 py-3 text-xs font-semibold text-[#007F80] dark:text-[#4DE0DC]">
          {actionMessage}
        </div>
      )}

      {/* TAB 1: Terms Management + 8-Stage Editorial Workflow */}
      {tab === 'terms' && (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <input
              type="text"
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              placeholder="Terimlerde filtrele (Türkçe veya Arapça)..."
              className="flex-1 min-w-[240px] rounded-xl border border-[#D7E9E8] dark:border-[#1D363D] bg-white dark:bg-[#0F1C21] px-4 py-2.5 text-sm"
            />
            {(role === 'Admin' || role === 'Legal Reviewer') && (
              <button
                type="button"
                onClick={openCreate}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#009F9D] hover:bg-[#007F80] text-white text-xs font-bold cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Yeni Terim Ekle</span>
              </button>
            )}
          </div>

          {(showCreateForm || editingTerm) && (
            <form
              onSubmit={handleSaveTerm}
              className="rounded-2xl bg-white dark:bg-[#0F1C21] border border-[#009F9D] p-5 sm:p-6 space-y-4"
            >
              <div className="flex items-center justify-between">
                <h2 className="text-base font-bold">
                  {editingTerm
                    ? `Terimi Düzenle: ${editingTerm.turkishTerm}`
                    : 'Yeni Hukuk Terimi Oluştur'}
                </h2>
                <button
                  type="button"
                  onClick={() => {
                    setEditingTerm(null);
                    setShowCreateForm(false);
                  }}
                  className="text-xs text-[#71818A] hover:underline cursor-pointer"
                >
                  İptal
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                <input
                  required
                  value={formState.turkishTerm}
                  onChange={(e) => setFormState((s) => ({ ...s, turkishTerm: e.target.value }))}
                  placeholder="Türkçe Terim"
                  className="rounded-xl border border-[#D7E9E8] dark:border-[#1D363D] bg-[#F5FAFA] dark:bg-[#112126] px-3 py-2.5"
                />
                <input
                  required
                  dir="rtl"
                  value={formState.arabicTerm}
                  onChange={(e) => setFormState((s) => ({ ...s, arabicTerm: e.target.value }))}
                  placeholder="المصطلح القانوني بالعربية"
                  className="rounded-xl border border-[#D7E9E8] dark:border-[#1D363D] bg-[#F5FAFA] dark:bg-[#112126] px-3 py-2.5 font-arabic"
                />
                <textarea
                  required
                  rows={2}
                  value={formState.turkishDefinition}
                  onChange={(e) =>
                    setFormState((s) => ({ ...s, turkishDefinition: e.target.value }))
                  }
                  placeholder="Türkçe Hukuki Açıklama"
                  className="rounded-xl border border-[#D7E9E8] dark:border-[#1D363D] bg-[#F5FAFA] dark:bg-[#112126] px-3 py-2"
                />
                <textarea
                  required
                  dir="rtl"
                  rows={2}
                  value={formState.arabicDefinition}
                  onChange={(e) =>
                    setFormState((s) => ({ ...s, arabicDefinition: e.target.value }))
                  }
                  placeholder="التعريف القانوني بالعربية"
                  className="rounded-xl border border-[#D7E9E8] dark:border-[#1D363D] bg-[#F5FAFA] dark:bg-[#112126] px-3 py-2 font-arabic"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
                <select
                  value={formState.specializationId}
                  onChange={(e) =>
                    setFormState((s) => ({ ...s, specializationId: e.target.value }))
                  }
                  className="rounded-xl border border-[#D7E9E8] dark:border-[#1D363D] bg-[#F5FAFA] dark:bg-[#112126] px-3 py-2.5"
                >
                  {specializations.map((sp) => (
                    <option key={sp.id} value={sp.id}>
                      {sp.nameTr}
                    </option>
                  ))}
                </select>

                <select
                  value={formState.editorialStage}
                  onChange={(e) =>
                    setFormState((s) => ({ ...s, editorialStage: e.target.value as EditorialStage }))
                  }
                  className="rounded-xl border border-[#D7E9E8] dark:border-[#1D363D] bg-[#F5FAFA] dark:bg-[#112126] px-3 py-2.5"
                >
                  {EDITORIAL_STAGES.map((st, idx) => (
                    <option key={st} value={st}>
                      {idx + 1}. {st}
                    </option>
                  ))}
                </select>

                <select
                  value={formState.verificationStatus}
                  onChange={(e) =>
                    setFormState((s) => ({
                      ...s,
                      verificationStatus: e.target.value as VerificationStatus,
                    }))
                  }
                  className="rounded-xl border border-[#D7E9E8] dark:border-[#1D363D] bg-[#F5FAFA] dark:bg-[#112126] px-3 py-2.5"
                >
                  {VERIFICATION_STATUSES.map((vs) => (
                    <option key={vs} value={vs}>
                      {vs}
                    </option>
                  ))}
                </select>

                <select
                  value={formState.translationClassification}
                  onChange={(e) =>
                    setFormState((s) => ({
                      ...s,
                      translationClassification: e.target.value as TranslationClassification,
                    }))
                  }
                  className="rounded-xl border border-[#D7E9E8] dark:border-[#1D363D] bg-[#F5FAFA] dark:bg-[#112126] px-3 py-2.5"
                >
                  {TRANSLATION_CLASSES.map((tc) => (
                    <option key={tc} value={tc}>
                      {tc}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
                <input
                  value={formState.authority}
                  onChange={(e) => setFormState((s) => ({ ...s, authority: e.target.value }))}
                  placeholder="Resmî Kurum"
                  className="rounded-xl border border-[#D7E9E8] dark:border-[#1D363D] bg-[#F5FAFA] dark:bg-[#112126] px-3 py-2.5"
                />
                <input
                  value={formState.documentTitle}
                  onChange={(e) => setFormState((s) => ({ ...s, documentTitle: e.target.value }))}
                  placeholder="Kanun / Resmî Belge"
                  className="rounded-xl border border-[#D7E9E8] dark:border-[#1D363D] bg-[#F5FAFA] dark:bg-[#112126] px-3 py-2.5"
                />
                <input
                  value={formState.lawNumber}
                  onChange={(e) => setFormState((s) => ({ ...s, lawNumber: e.target.value }))}
                  placeholder="Kanun No"
                  className="rounded-xl border border-[#D7E9E8] dark:border-[#1D363D] bg-[#F5FAFA] dark:bg-[#112126] px-3 py-2.5"
                />
                <input
                  value={formState.changeNote}
                  onChange={(e) => setFormState((s) => ({ ...s, changeNote: e.target.value }))}
                  placeholder="Değişiklik Notu"
                  className="rounded-xl border border-[#D7E9E8] dark:border-[#1D363D] bg-[#F5FAFA] dark:bg-[#112126] px-3 py-2.5"
                />
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-[#009F9D] hover:bg-[#007F80] text-white text-xs font-bold cursor-pointer"
                >
                  Kaydet
                </button>
              </div>
            </form>
          )}

          <div className="rounded-2xl bg-white dark:bg-[#0F1C21] border border-[#D7E9E8] dark:border-[#1D363D] overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-[#F5FAFA] dark:bg-[#112126] text-[#71818A] border-b border-[#D7E9E8] dark:border-[#1D363D]">
                <tr>
                  <th className="p-3.5 font-bold">Türkçe Terim</th>
                  <th className="p-3.5 font-bold text-right font-arabic">المصطلح العربي</th>
                  <th className="p-3.5 font-bold">İş Akışı Aşaması</th>
                  <th className="p-3.5 font-bold">Doğrulama</th>
                  <th className="p-3.5 font-bold text-right">İşlemler</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#D7E9E8] dark:divide-[#1D363D]">
                {terms.map((t) => (
                  <tr key={t.id}>
                    <td className="p-3.5 font-semibold">{t.turkishTerm}</td>
                    <td dir="rtl" className="p-3.5 font-bold font-arabic text-[#007F80] dark:text-[#4DE0DC]">
                      {t.arabicTerm}
                    </td>
                    <td className="p-3.5">{t.editorialStage}</td>
                    <td className="p-3.5">{t.verificationStatus}</td>
                    <td className="p-3.5">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleToggleFeatured(t)}
                          title="Bu Ayın Hukuki Terimi Yap"
                          className={`p-2 rounded-lg border cursor-pointer ${
                            t.isMonthlyFeatured
                              ? 'bg-[#FFF9E6] border-[#E6B84A] text-[#E6B84A]'
                              : 'border-[#D7E9E8] dark:border-[#1D363D] text-[#71818A]'
                          }`}
                        >
                          <Star className={`w-3.5 h-3.5 ${t.isMonthlyFeatured ? 'fill-[#E6B84A]' : ''}`} />
                        </button>
                        <button
                          type="button"
                          onClick={() => openEdit(t)}
                          title="Düzenle"
                          className="p-2 rounded-lg border border-[#D7E9E8] dark:border-[#1D363D] text-[#007F80] cursor-pointer"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        {role === 'Admin' && (
                          <button
                            type="button"
                            onClick={() => handleDeleteTerm(t.id)}
                            title="Sil"
                            className="p-2 rounded-lg border border-[#D7E9E8] dark:border-[#1D363D] text-[#A62828] cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: Bulk Import & Export */}
      {tab === 'import' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <form
            onSubmit={handleBulkImport}
            className="rounded-2xl bg-white dark:bg-[#0F1C21] border border-[#D7E9E8] dark:border-[#1D363D] p-5 space-y-4"
          >
            <div className="flex items-center gap-2 font-bold text-sm">
              <Upload className="w-4 h-4 text-[#009F9D]" />
              <span>Toplu Terim İçe Aktarımı (CSV / JSON)</span>
            </div>
            <p className="text-xs text-[#71818A]">
              CSV başlıkları: turkishTerm, arabicTerm, specializationId, jurisdiction,
              turkishDefinition, arabicDefinition, authority, documentTitle
            </p>
            <select
              value={importFormat}
              onChange={(e) => setImportFormat(e.target.value as 'csv' | 'json')}
              className="rounded-xl border border-[#D7E9E8] dark:border-[#1D363D] bg-[#F5FAFA] dark:bg-[#112126] px-3 py-2 text-xs"
            >
              <option value="csv">CSV Formatı</option>
              <option value="json">JSON Dizi Formatı</option>
            </select>
            <textarea
              rows={8}
              value={importContent}
              onChange={(e) => setImportContent(e.target.value)}
              placeholder='turkishTerm,arabicTerm,specializationId,jurisdiction,turkishDefinition,arabicDefinition'
              className="w-full rounded-xl border border-[#D7E9E8] dark:border-[#1D363D] bg-[#F5FAFA] dark:bg-[#112126] p-3 text-xs font-mono-tabular"
            />
            {importResult && (
              <div className="rounded-xl bg-[#DDF5F3] dark:bg-[#132C2E] p-3 text-xs font-semibold text-[#007F80] dark:text-[#4DE0DC]">
                {importResult}
              </div>
            )}
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-[#009F9D] hover:bg-[#007F80] text-white text-xs font-bold cursor-pointer"
            >
              Yinelenen Kayıt Kontrollü İçe Aktar
            </button>
          </form>

          <div className="rounded-2xl bg-white dark:bg-[#0F1C21] border border-[#D7E9E8] dark:border-[#1D363D] p-5 space-y-4">
            <div className="flex items-center gap-2 font-bold text-sm">
              <Download className="w-4 h-4 text-[#009F9D]" />
              <span>Veritabanını Dışa Aktar</span>
            </div>
            <p className="text-xs text-[#71818A]">
              Tüm doğrulanmış hukuk terimlerini yedekleme veya akademik inceleme için CSV ya da JSON
              olarak indirin.
            </p>
            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => handleExport('csv')}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-[#D7E9E8] dark:border-[#1D363D] hover:border-[#009F9D] text-xs font-bold cursor-pointer"
              >
                <Download className="w-4 h-4 text-[#009F9D]" />
                <span>CSV Olarak İndir</span>
              </button>
              <button
                type="button"
                onClick={() => handleExport('json')}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-[#D7E9E8] dark:border-[#1D363D] hover:border-[#009F9D] text-xs font-bold cursor-pointer"
              >
                <Download className="w-4 h-4 text-[#009F9D]" />
                <span>JSON Olarak İndir</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: Missing Terms Log & Popular Analytics */}
      {tab === 'analytics' && overview && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="rounded-2xl bg-white dark:bg-[#0F1C21] border border-[#D7E9E8] dark:border-[#1D363D] p-5 space-y-4">
            <h2 className="text-sm font-bold flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-[#009F9D]" />
              <span>En Çok Aranan Terimler</span>
            </h2>
            <div className="space-y-2 text-xs">
              {overview.stats.popularTerms.map((t) => (
                <div
                  key={t.id}
                  className="flex items-center justify-between p-2.5 rounded-xl bg-[#F5FAFA] dark:bg-[#112126]"
                >
                  <span>
                    {t.turkishTerm} ↔ <span className="font-arabic">{t.arabicTerm}</span>
                  </span>
                  <span className="font-mono-tabular font-bold text-[#007F80]">{t.searchCount}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl bg-white dark:bg-[#0F1C21] border border-[#D7E9E8] dark:border-[#1D363D] p-5 space-y-4">
            <h2 className="text-sm font-bold">
              Kullanıcıların Bulamadığı Eksik Terimler ({overview.missingTerms.length})
            </h2>
            {overview.missingTerms.length === 0 ? (
              <p className="text-xs text-[#71818A]">Henüz bekleyen eksik terim kaydı yok.</p>
            ) : (
              <div className="space-y-2 text-xs">
                {overview.missingTerms.map((m) => (
                  <div
                    key={m.id}
                    className="flex items-center justify-between p-3 rounded-xl bg-[#F5FAFA] dark:bg-[#112126]"
                  >
                    <div>
                      <div className="font-bold">{m.query}</div>
                      <div className="text-[#71818A] font-mono-tabular">
                        {m.direction} · {m.count} kez arandı
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleResolveMissing(m.id)}
                      title="Çözüldü Olarak İşaretle"
                      className="p-2 rounded-lg border border-[#D7E9E8] dark:border-[#1D363D] text-[#007F80] cursor-pointer"
                    >
                      <Check className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
