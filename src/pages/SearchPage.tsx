import React, { useCallback, useEffect, useState } from 'react';
import {
  AlertCircle,
  Filter,
  Loader2,
  Search as SearchIcon,
  SlidersHorizontal,
  X,
} from 'lucide-react';
import { EgyptFlagIcon, TurkishFlagIcon } from '../components/AppShell.tsx';
import { LegalTermDetailCard } from '../components/LegalTermDetailCard.tsx';
import { useAppPreferences } from '../context/AppPreferencesContext.tsx';
import { validateSearchInput } from '../lib/languageValidation.ts';
import { cacheTermOffline, recordSearchHistory, searchOfflineDictionary } from '../lib/storage.ts';
import type {
  JurisdictionType,
  LegalSpecialization,
  LegalStatus,
  SearchDirection,
  SearchFilters,
  SearchResponse,
  VerificationStatus,
} from '../types/legal.ts';

export const SearchPage: React.FC = () => {
  const { direction, setDirection } = useAppPreferences();
  const [query, setQuery] = useState('');
  const [validationError, setValidationError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<SearchResponse | null>(null);
  const [offlineResultNotice, setOfflineResultNotice] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [specializations, setSpecializations] = useState<LegalSpecialization[]>([]);

  const [filters, setFilters] = useState<SearchFilters>({
    jurisdiction: '',
    specializationId: '',
    subcategory: '',
    documentType: '',
    contractType: '',
    issuingAuthority: '',
    lawNumber: '',
    articleNumber: '',
    legalStatus: '',
    verificationStatus: '',
  });

  useEffect(() => {
    fetch('/api/categories')
      .then((res) => res.json())
      .then((data: LegalSpecialization[]) => setSpecializations(data))
      .catch(() => {});
  }, []);

  const executeSearch = useCallback(
    async (searchText: string, searchDir: SearchDirection, activeFilters: SearchFilters) => {
      // STRICT LANGUAGE VALIDATION BEFORE SEARCHING DATABASE
      const validation = validateSearchInput(searchText, searchDir);
      if (!validation.valid) {
        setValidationError(validation.errorMessage || 'Geçersiz giriş.');
        setResult(null);
        return;
      }

      setValidationError(null);
      setOfflineResultNotice(false);
      setLoading(true);
      try {
        const params = new URLSearchParams({
          q: searchText.trim(),
          direction: searchDir,
        });
        Object.entries(activeFilters).forEach(([k, v]) => {
          if (v) params.set(k, String(v));
        });

        const res = await fetch(`/api/search?${params.toString()}`, {
          headers: { Accept: 'application/json' },
        });
        const contentType = res.headers.get('content-type') || '';
        const isJson = contentType.toLowerCase().includes('application/json');

        if (!isJson) {
          throw new Error(`INVALID_CONTENT_TYPE:${res.status}`);
        }

        const data = await res.json();
        if (!res.ok) {
          setValidationError(
            data?.error ||
              (searchDir === 'tr-ar'
                ? `Arama sırasında sunucu hatası oluştu (HTTP ${res.status}).`
                : `حدث خطأ في الخادم أثناء البحث (HTTP ${res.status}).`)
          );
          setResult(null);
          return;
        }

        const searchRes = data as SearchResponse;
        setResult(searchRes);

        if (searchRes.term) {
          await cacheTermOffline(searchRes.term);
        }

        await recordSearchHistory({
          id: `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          query: searchText.trim(),
          direction: searchDir,
          termId: searchRes.term?.id,
          matchedTurkish: searchRes.term?.turkishTerm,
          matchedArabic: searchRes.term?.arabicTerm,
          found: Boolean(searchRes.term),
          timestamp: new Date().toISOString(),
        });
      } catch (err) {
        const offlineMatch = await searchOfflineDictionary(searchText, searchDir, activeFilters);
        if (offlineMatch && offlineMatch.term) {
          setResult(offlineMatch);
          setOfflineResultNotice(true);
          return;
        }

        const errMsg = err instanceof Error ? err.message : '';
        if (errMsg.startsWith('INVALID_CONTENT_TYPE:')) {
          const statusCode = errMsg.split(':')[1] || '';
          setValidationError(
            searchDir === 'tr-ar'
              ? `API sunucusu beklenen JSON yanıtını döndürmedi (HTTP ${statusCode}). Çevrimdışı önbelleğinizdeki kayıtlı terimlere Sık Kullanılanlar bölümünden erişebilirsiniz.`
              : `لم يُرجع الخادم استجابة JSON صالحة (HTTP ${statusCode}). يمكنك الوصول إلى المصطلحات المحفوظة في المفضلة.`
          );
        } else {
          setValidationError(
            searchDir === 'tr-ar'
              ? 'Sunucuya erişilemedi. Çevrimdışıysanız kayıtlı veya önbelleğe alınmış terimleri Sık Kullanılanlar bölümünden açabilirsiniz.'
              : 'تعذر الاتصال بالخادم. يمكنك الوصول إلى المصطلحات المحفوظة في المفضلة.'
          );
        }
        setResult(null);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    executeSearch(query, direction, filters);
  };

  const handleDirectionChange = (nextDir: SearchDirection) => {
    setDirection(nextDir);
    setValidationError(null);
    setResult(null);
  };

  const handleRelatedSearch = (termText: string, targetDir: SearchDirection) => {
    setDirection(targetDir);
    setQuery(termText);
    executeSearch(termText, targetDir, filters);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const activeFilterCount = Object.values(filters).filter(Boolean).length;

  const specMatch = result?.term
    ? specializations.find((s) => s.id === result.term?.specializationId)
    : undefined;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
      {/* Direction Selector + Search Card */}
      <section className="rounded-2xl bg-white dark:bg-[#0F1C21] border border-[#D7E9E8] dark:border-[#1D363D] p-5 sm:p-6 shadow-xs space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-lg sm:text-xl font-bold text-[#172B35] dark:text-[#F0F7F7]">
              Hukuki Terim Arama Motoru
            </h1>
            <p className="text-xs text-[#71818A] dark:text-[#8BA4AE]">
              Seçilen çeviri yönüne uygun tek dil girişi ile kesin hukuki karşılığı görüntüleyin.
            </p>
          </div>

          {/* Strict Manual Direction Selector */}
          <div
            role="group"
            aria-label="Çeviri Yönü Seçici"
            className="inline-flex rounded-xl bg-[#F5FAFA] dark:bg-[#112126] p-1 border border-[#D7E9E8] dark:border-[#1D363D]"
          >
            <button
              type="button"
              onClick={() => handleDirectionChange('tr-ar')}
              className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold transition-colors min-h-[38px] cursor-pointer ${
                direction === 'tr-ar'
                  ? 'bg-[#009F9D] text-white shadow-xs'
                  : 'text-[#71818A] dark:text-[#8BA4AE] hover:text-[#172B35] dark:hover:text-[#F0F7F7]'
              }`}
            >
              <TurkishFlagIcon className="w-4 h-3" />
              <span>Türkçe → Arapça</span>
            </button>
            <button
              type="button"
              onClick={() => handleDirectionChange('ar-tr')}
              className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold font-arabic transition-colors min-h-[38px] cursor-pointer ${
                direction === 'ar-tr'
                  ? 'bg-[#009F9D] text-white shadow-xs'
                  : 'text-[#71818A] dark:text-[#8BA4AE] hover:text-[#172B35] dark:hover:text-[#F0F7F7]'
              }`}
            >
              <EgyptFlagIcon className="w-4 h-3" />
              <span>عربي → تركي</span>
            </button>
          </div>
        </div>

        {/* Search Input Form */}
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="flex flex-col sm:flex-row gap-2.5">
            <div className="relative flex-1">
              <input
                type="text"
                value={query}
                onChange={(e) => {
                  const val = e.target.value;
                  setQuery(val);
                  if (val.trim()) {
                    const check = validateSearchInput(val, direction);
                    setValidationError(check.valid ? null : check.errorMessage || null);
                  } else {
                    setValidationError(null);
                  }
                }}
                dir={direction === 'ar-tr' ? 'rtl' : 'ltr'}
                placeholder={
                  direction === 'tr-ar'
                    ? 'Yalnızca Türkçe hukuk terimi yazın (ör. İpotek, Tapu Senedi, Vekâletname)...'
                    : 'اكتب المصطلح القانوني بالعربية فقط (مثال: الرهن العقاري، التوكيل الرسمي، الفسخ)...'
                }
                className={`w-full rounded-xl border bg-[#F5FAFA] dark:bg-[#112126] px-4 py-3 text-sm sm:text-base text-[#172B35] dark:text-[#F0F7F7] placeholder:text-[#71818A]/70 focus:outline-none focus:ring-2 transition-all min-h-[48px] ${
                  direction === 'ar-tr' ? 'font-arabic text-right pl-10' : 'pr-10'
                } ${
                  validationError
                    ? 'border-[#D94F4F] focus:ring-[#D94F4F]/25'
                    : 'border-[#D7E9E8] dark:border-[#1D363D] focus:border-[#009F9D] focus:ring-[#009F9D]/20'
                }`}
              />
              {query && (
                <button
                  type="button"
                  onClick={() => {
                    setQuery('');
                    setValidationError(null);
                    setResult(null);
                  }}
                  aria-label="Aramayı Temizle"
                  className={`absolute top-1/2 -translate-y-1/2 p-1.5 text-[#71818A] hover:text-[#172B35] cursor-pointer ${
                    direction === 'ar-tr' ? 'left-2' : 'right-2'
                  }`}
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setShowFilters((v) => !v)}
                className={`inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl border text-xs font-semibold min-h-[48px] transition-colors cursor-pointer ${
                  showFilters || activeFilterCount > 0
                    ? 'bg-[#DDF5F3] dark:bg-[#132C2E] border-[#009F9D] text-[#007F80] dark:text-[#4DE0DC]'
                    : 'bg-white dark:bg-[#152930] border-[#D7E9E8] dark:border-[#1D363D] text-[#172B35] dark:text-[#E2F1F1]'
                }`}
              >
                <SlidersHorizontal className="w-4 h-4" />
                <span>Filtreler</span>
                {activeFilterCount > 0 && (
                  <span className="font-mono-tabular px-1.5 py-0.5 rounded bg-[#009F9D] text-white text-[10px]">
                    {activeFilterCount}
                  </span>
                )}
              </button>

              <button
                type="submit"
                disabled={loading}
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-[#009F9D] hover:bg-[#007F80] text-white font-bold text-sm transition-colors min-h-[48px] disabled:opacity-60 cursor-pointer"
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <SearchIcon className="w-4 h-4" />
                )}
                <span>{direction === 'tr-ar' ? 'Ara' : 'بحث'}</span>
              </button>
            </div>
          </div>

          {/* Strict Language Validation Alert */}
          {validationError && (
            <div
              role="alert"
              dir={direction === 'ar-tr' ? 'rtl' : 'ltr'}
              className={`rounded-xl bg-[#FEF2F2] dark:bg-[#2C1315] border border-[#F5C2C2] dark:border-[#5C2327] px-4 py-3 flex items-start gap-2.5 text-xs sm:text-sm text-[#A62828] dark:text-[#FCA5A5] ${
                direction === 'ar-tr' ? 'font-arabic text-right' : ''
              }`}
            >
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{validationError}</span>
            </div>
          )}

          {/* Quick Sample Prompts */}
          <div className="flex flex-wrap items-center gap-2 text-xs text-[#71818A] dark:text-[#8BA4AE]">
            <span>Örnek terimler:</span>
            {(direction === 'tr-ar'
              ? ['Tapu Senedi', 'İpotek', 'Vekâletname', 'Fesih', 'Tebligat', 'Mirasçılık Belgesi']
              : ['الرَّهن العقاري', 'التوكيل الرسمي', 'الفسخ', 'الشهر العقاري', 'بطاقة الرقم القومي', 'التقادم المسقط']
            ).map((sample) => (
              <button
                key={sample}
                type="button"
                dir={direction === 'ar-tr' ? 'rtl' : 'ltr'}
                onClick={() => {
                  setQuery(sample);
                  executeSearch(sample, direction, filters);
                }}
                className={`px-2.5 py-1 rounded-lg bg-[#F5FAFA] dark:bg-[#112126] border border-[#D7E9E8] dark:border-[#1D363D] hover:border-[#009F9D] text-[#172B35] dark:text-[#E2F1F1] transition-colors cursor-pointer ${
                  direction === 'ar-tr' ? 'font-arabic' : ''
                }`}
              >
                {sample}
              </button>
            ))}
          </div>
        </form>

        {/* Collapsible Advanced Legal Filters (Section 23.6) */}
        {showFilters && (
          <div className="pt-4 border-t border-[#D7E9E8] dark:border-[#1D363D] space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-bold text-[#007F80] dark:text-[#4DE0DC]">
                <Filter className="w-3.5 h-3.5" />
                <span>Gelişmiş Hukuki Filtreler (Yargı Yetkisi, Belge Türü, Kanun/Madde No)</span>
              </div>
              {activeFilterCount > 0 && (
                <button
                  type="button"
                  onClick={() =>
                    setFilters({
                      jurisdiction: '',
                      specializationId: '',
                      subcategory: '',
                      documentType: '',
                      contractType: '',
                      issuingAuthority: '',
                      lawNumber: '',
                      articleNumber: '',
                      legalStatus: '',
                      verificationStatus: '',
                    })
                  }
                  className="text-xs text-[#009F9D] hover:underline cursor-pointer"
                >
                  Filtreleri Sıfırla
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
              <select
                value={filters.jurisdiction || ''}
                onChange={(e) =>
                  setFilters((f) => ({ ...f, jurisdiction: e.target.value as JurisdictionType | '' }))
                }
                aria-label="Yargı Yetkisi"
                className="rounded-xl border border-[#D7E9E8] dark:border-[#1D363D] bg-[#F5FAFA] dark:bg-[#112126] px-3 py-2.5 text-[#172B35] dark:text-[#F0F7F7]"
              >
                <option value="">Tüm Yargı Yetkileri</option>
                <option value="Turkish Law">Türk Hukuku (Turkish Law)</option>
                <option value="Egyptian Law">Mısır Hukuku (Egyptian Law)</option>
                <option value="Comparative Law">Karşılaştırmalı Hukuk</option>
                <option value="International Law">Uluslararası Hukuk</option>
                <option value="General Legal Terminology">Genel Hukuk Terimleri</option>
              </select>

              <select
                value={filters.specializationId || ''}
                onChange={(e) => setFilters((f) => ({ ...f, specializationId: e.target.value }))}
                aria-label="Hukuk Dalı"
                className="rounded-xl border border-[#D7E9E8] dark:border-[#1D363D] bg-[#F5FAFA] dark:bg-[#112126] px-3 py-2.5 text-[#172B35] dark:text-[#F0F7F7]"
              >
                <option value="">Tüm Hukuk Dalları</option>
                {specializations.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.nameTr}
                  </option>
                ))}
              </select>

              <select
                value={filters.legalStatus || ''}
                onChange={(e) =>
                  setFilters((f) => ({ ...f, legalStatus: e.target.value as LegalStatus | '' }))
                }
                aria-label="Mevzuat Durumu"
                className="rounded-xl border border-[#D7E9E8] dark:border-[#1D363D] bg-[#F5FAFA] dark:bg-[#112126] px-3 py-2.5 text-[#172B35] dark:text-[#F0F7F7]"
              >
                <option value="">Tüm Mevzuat Durumları</option>
                <option value="Current">Yürürlükte (Current)</option>
                <option value="Amended">Değiştirilmiş (Amended)</option>
                <option value="Repealed">Mülga (Repealed)</option>
                <option value="Historical">Tarihî (Historical)</option>
              </select>

              <select
                value={filters.verificationStatus || ''}
                onChange={(e) =>
                  setFilters((f) => ({
                    ...f,
                    verificationStatus: e.target.value as VerificationStatus | '',
                  }))
                }
                aria-label="Doğrulama Durumu"
                className="rounded-xl border border-[#D7E9E8] dark:border-[#1D363D] bg-[#F5FAFA] dark:bg-[#112126] px-3 py-2.5 text-[#172B35] dark:text-[#F0F7F7]"
              >
                <option value="">Tüm Doğrulama Durumları</option>
                <option value="Officially Verified">Resmî Kaynakla Doğrulandı</option>
                <option value="Source Referenced">Kaynak Referanslı (Source Referenced)</option>
                <option value="Legally Reviewed">Hukuki İncelemeden Geçti</option>
                <option value="Linguistically Reviewed">Dil İncelemesinden Geçti</option>
                <option value="Expert Reviewed">Uzman İncelemesinden Geçti</option>
                <option value="Pending Legal Verification">Hukuki Doğrulama Bekliyor</option>
              </select>

              <input
                type="text"
                value={filters.lawNumber || ''}
                onChange={(e) => setFilters((f) => ({ ...f, lawNumber: e.target.value }))}
                placeholder="Kanun Numarası (ör. 4721, 6098)"
                className="rounded-xl border border-[#D7E9E8] dark:border-[#1D363D] bg-[#F5FAFA] dark:bg-[#112126] px-3 py-2.5 text-[#172B35] dark:text-[#F0F7F7]"
              />

              <input
                type="text"
                value={filters.articleNumber || ''}
                onChange={(e) => setFilters((f) => ({ ...f, articleNumber: e.target.value }))}
                placeholder="Madde Numarası (ör. Madde 85)"
                className="rounded-xl border border-[#D7E9E8] dark:border-[#1D363D] bg-[#F5FAFA] dark:bg-[#112126] px-3 py-2.5 text-[#172B35] dark:text-[#F0F7F7]"
              />
            </div>
          </div>
        )}
      </section>

      {/* Single Intended Term Display OR Mandatory Not-Found Message */}
      {result && result.term && (
        <div className="space-y-3">
          {offlineResultNotice && (
            <div className="rounded-xl bg-[#FFF9E6] dark:bg-[#2A220E] border border-[#E6B84A]/40 px-4 py-2.5 text-xs text-[#7A5908] dark:text-[#F6D377] flex items-center justify-between gap-2">
              <span>Çevrimdışı önbellekten (IndexedDB) gösteriliyor ·</span>
              <span dir="rtl" className="font-arabic">معروض من الذاكرة المحلية دون اتصال بالخادم</span>
            </div>
          )}
          <LegalTermDetailCard
            term={result.term}
            direction={result.direction}
            matchType={result.matchType === 'closest_verified' ? 'closest_verified' : 'exact'}
            onSelectRelatedTerm={handleRelatedSearch}
            specializationName={
              specMatch ? { tr: specMatch.nameTr, ar: specMatch.nameAr } : undefined
            }
          />
        </div>
      )}

      {result && !result.term && (
        <section className="rounded-2xl bg-white dark:bg-[#0F1C21] border border-[#D7E9E8] dark:border-[#1D363D] p-8 text-center space-y-3">
          <p
            dir="rtl"
            className="text-lg font-bold font-arabic-display text-[#172B35] dark:text-[#F0F7F7]"
          >
            {result.notFoundMessage || 'لم يتم العثور على المصطلح في قاعدة البيانات.'}
          </p>
          <p className="text-sm text-[#71818A] dark:text-[#8BA4AE]">
            Aradığınız terim veritabanında bulunamadı. Eksik terim kaydı editör incelemesine iletildi;
            isterseniz Yazım/Terim Asistanından karşılaştırmalı açıklama talep edebilirsiniz.
          </p>
        </section>
      )}
    </div>
  );
};
