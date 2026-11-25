import React, { useEffect, useState } from 'react';
import {
  AlertTriangle,
  BookOpen,
  Bookmark,
  CheckCircle2,
  ExternalLink,
  GitCompare,
  History,
  Scale,
  ShieldCheck,
} from 'lucide-react';
import { useAppPreferences } from '../context/AppPreferencesContext.tsx';
import { addFavorite, isFavoriteTerm, removeFavorite } from '../lib/storage.ts';
import type { LegalTerm, SearchDirection } from '../types/legal.ts';
import { SpeechButton } from './SpeechButton.tsx';

interface LegalTermDetailCardProps {
  term: LegalTerm;
  direction: SearchDirection;
  matchType?: 'exact' | 'closest_verified';
  onSelectRelatedTerm?: (termText: string, targetDirection: SearchDirection) => void;
  specializationName?: { tr: string; ar: string };
}

const CLASSIFICATION_AR: Record<string, string> = {
  'Turkish Legislative Term': 'مصطلح تشريعي تركي',
  'Egyptian Legislative Term': 'مصطلح تشريعي مصري',
  'Turkish Official Administrative Term': 'مصطلح إداري رسمي تركي',
  'Egyptian Official Administrative Term': 'مصطلح إداري رسمي مصري',
  'International Legal Term': 'مصطلح قانوني دولي',
  'International Treaty Terminology': 'مصطلح وارد في الاتفاقيات الدولية',
  'Exact Legal Equivalent': 'مقابل قانوني مطابق من حيث المفهوم',
  'Functional Legal Equivalent': 'مقابل قانوني وظيفي',
  'Contextual Equivalent': 'مقابل قانوني بحسب السياق',
  'Explanatory Translation': 'ترجمة تفسيرية',
  'Descriptive Translation': 'ترجمة وصفية',
  'No Direct Equivalent': 'لا يوجد مقابل مباشر',
  'Borrowed Legal Term': 'مصطلح قانوني منقول أو معرّب',
  'Historical Legal Term': 'مصطلح قانوني تاريخي',
  'Deprecated Term': 'مصطلح متروك أو غير مستخدم حاليًا',
  'Officially Verified': 'موثق من مصدر رسمي',
  'Source Referenced': 'مُسنَد إلى مصدر تشريعي',
  'Legally Reviewed': 'تمت مراجعته قانونيًا',
  'Linguistically Reviewed': 'تمت مراجعته لغويًا',
  'Expert Reviewed': 'تمت مراجعته بواسطة متخصص',
  'Pending Verification': 'في انتظار التحقق',
  'Pending Legal Verification': 'قيد المراجعة والتحقق القانوني',
  'Disputed Translation': 'ترجمة محل خلاف',
  'Historical Reference': 'مرجع تاريخي',
};

const JURISDICTION_LABELS: Record<string, { tr: string; ar: string }> = {
  'Turkish Law': { tr: 'Türk Hukuku', ar: 'القانون التركي' },
  'Egyptian Law': { tr: 'Mısır Hukuku', ar: 'القانون المصري' },
  'Comparative Law': { tr: 'Karşılaştırmalı Hukuk', ar: 'القانون المقارن' },
  'International Law': { tr: 'Uluslararası Hukuk', ar: 'القانون الدولي' },
  'General Legal Terminology': { tr: 'Genel Hukuk Terimleri', ar: 'المصطلحات القانونية العامة' },
};

export const LegalTermDetailCard: React.FC<LegalTermDetailCardProps> = ({
  term,
  direction,
  matchType,
  onSelectRelatedTerm,
  specializationName,
}) => {
  const { setFavoritesCount } = useAppPreferences();
  const [saved, setSaved] = useState(false);
  const [showRevisions, setShowRevisions] = useState(false);

  useEffect(() => {
    let mounted = true;
    isFavoriteTerm(term.id).then((res) => {
      if (mounted) setSaved(res);
    });
    return () => {
      mounted = false;
    };
  }, [term.id]);

  const toggleFavorite = async () => {
    if (saved) {
      await removeFavorite(term.id);
      setSaved(false);
      setFavoritesCount((c) => Math.max(0, c - 1));
    } else {
      await addFavorite(term);
      setSaved(true);
      setFavoritesCount((c) => c + 1);
    }
  };

  const isArabicLead = direction === 'ar-tr';
  const jurisdictionLabel = JURISDICTION_LABELS[term.jurisdiction] || {
    tr: term.jurisdiction,
    ar: term.jurisdiction,
  };

  const handleRelatedClick = (text: string) => {
    if (!onSelectRelatedTerm) return;
    const isAr = /[\u0600-\u06FF]/.test(text);
    onSelectRelatedTerm(text, isAr ? 'ar-tr' : 'tr-ar');
  };

  return (
    <article className="bg-white dark:bg-[#0F1C21] border border-[#D7E9E8] dark:border-[#1D363D] rounded-2xl overflow-hidden shadow-sm">
      {/* Closest Match Notice if not exact */}
      {matchType === 'closest_verified' && (
        <div className="px-6 py-3 bg-[#FFF9E6] dark:bg-[#2A220E] border-b border-[#E6B84A]/40 flex items-center gap-2.5 text-xs text-[#7A5908] dark:text-[#F6D377]">
          <AlertTriangle className="w-4 h-4 shrink-0 text-[#E6B84A]" />
          <span>
            Tam eşleşme bulunamadı; doğrulanmış en yakın hukuki karşılık (alternatif) gösterilmektedir ·{' '}
            <span className="font-arabic">لم يوجد تطابق تام؛ يُعرض أقرب مصطلح قانوني موثق (بديل).</span>
          </span>
        </div>
      )}

      {/* Term Header */}
      <div className="p-6 sm:p-8 border-b border-[#D7E9E8] dark:border-[#1D363D] bg-[#F5FAFA] dark:bg-[#112126]">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex-1 min-w-[240px]">
            <div className="text-xs font-medium text-[#71818A] dark:text-[#8BA4AE] mb-2">
              {isArabicLead ? 'المصطلح العربي / Arapça Terim' : 'Türkçe Terim / المصطلح التركي'}
            </div>

            {isArabicLead ? (
              <>
                <h1
                  dir="rtl"
                  className="text-2xl sm:text-3xl font-bold font-arabic-display text-[#172B35] dark:text-[#F0F7F7] leading-snug"
                >
                  {term.arabicTerm}
                </h1>
                {term.arabicPronunciation && (
                  <p className="mt-1 text-xs font-mono-tabular text-[#71818A] dark:text-[#8BA4AE]">
                    /{term.arabicPronunciation}/
                  </p>
                )}
                <div className="mt-4 pt-4 border-t border-[#D7E9E8] dark:border-[#1D363D]">
                  <span className="text-xs font-medium text-[#007F80] dark:text-[#4DE0DC] block mb-1">
                    Türkçe Hukuki Karşılığı
                  </span>
                  <p className="text-xl sm:text-2xl font-bold text-[#007F80] dark:text-[#4DE0DC]">
                    {term.turkishTerm}
                  </p>
                  {term.turkishPronunciation && (
                    <p className="mt-0.5 text-xs font-mono-tabular text-[#71818A] dark:text-[#8BA4AE]">
                      /{term.turkishPronunciation}/
                    </p>
                  )}
                </div>
              </>
            ) : (
              <>
                <h1 className="text-2xl sm:text-3xl font-bold text-[#172B35] dark:text-[#F0F7F7] leading-snug">
                  {term.turkishTerm}
                </h1>
                {term.turkishPronunciation && (
                  <p className="mt-1 text-xs font-mono-tabular text-[#71818A] dark:text-[#8BA4AE]">
                    /{term.turkishPronunciation}/
                  </p>
                )}
                <div className="mt-4 pt-4 border-t border-[#D7E9E8] dark:border-[#1D363D]" dir="rtl">
                  <span className="text-xs font-medium font-arabic text-[#007F80] dark:text-[#4DE0DC] block mb-1">
                    المقابل العربي القانوني
                  </span>
                  <p className="text-xl sm:text-2xl font-bold font-arabic-display text-[#007F80] dark:text-[#4DE0DC]">
                    {term.arabicTerm}
                  </p>
                  {term.arabicPronunciation && (
                    <p dir="ltr" className="mt-0.5 text-xs font-mono-tabular text-[#71818A] dark:text-[#8BA4AE] text-right">
                      /{term.arabicPronunciation}/
                    </p>
                  )}
                </div>
              </>
            )}
          </div>

          {/* Action Controls: Pronunciation + Favorite */}
          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <SpeechButton
              text={term.turkishTerm}
              lang="tr"
              idKey={`${term.id}-tr`}
              label="TR Dinle"
            />
            <SpeechButton
              text={term.arabicTerm}
              lang="ar"
              idKey={`${term.id}-ar`}
              label="AR استماع"
            />
            <button
              type="button"
              onClick={toggleFavorite}
              aria-pressed={saved}
              className={`inline-flex items-center gap-1.5 rounded-xl border px-3.5 py-2 text-xs font-semibold transition-colors min-h-[40px] cursor-pointer ${
                saved
                  ? 'bg-[#E6B84A]/15 border-[#E6B84A] text-[#8F680C] dark:text-[#F6D377]'
                  : 'bg-white dark:bg-[#152930] border-[#D7E9E8] dark:border-[#1D363D] text-[#172B35] dark:text-[#E2F1F1] hover:border-[#009F9D]'
              }`}
            >
              <Bookmark className={`w-4 h-4 ${saved ? 'fill-[#E6B84A] text-[#E6B84A]' : ''}`} />
              <span>{saved ? 'Kayıtlı' : 'Kaydet'}</span>
            </button>
          </div>
        </div>

        {/* Dynamic Professional Classification Labels (Section 23.7) */}
        <div className="mt-5 pt-4 border-t border-[#D7E9E8] dark:border-[#1D363D] flex flex-wrap items-center gap-2 text-xs">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white dark:bg-[#0F1C21] border border-[#D7E9E8] dark:border-[#1D363D] text-[#172B35] dark:text-[#E2F1F1] font-medium">
            <Scale className="w-3.5 h-3.5 text-[#009F9D]" />
            <span>{term.legislativeClassification}</span>
            <span className="text-[#71818A] font-arabic">· {CLASSIFICATION_AR[term.legislativeClassification] || ''}</span>
          </span>

          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#DDF5F3] dark:bg-[#132C2E] border border-[#009F9D]/30 text-[#007F80] dark:text-[#4DE0DC] font-semibold">
            <span>{term.translationClassification}</span>
            <span className="font-arabic">· {CLASSIFICATION_AR[term.translationClassification] || ''}</span>
          </span>

          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white dark:bg-[#0F1C21] border border-[#D7E9E8] dark:border-[#1D363D] text-[#172B35] dark:text-[#E2F1F1]">
            <span>{jurisdictionLabel.tr}</span>
            <span className="text-[#71818A] font-arabic">· {jurisdictionLabel.ar}</span>
          </span>

          {specializationName && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white dark:bg-[#0F1C21] border border-[#D7E9E8] dark:border-[#1D363D] text-[#172B35] dark:text-[#E2F1F1]">
              <span>{specializationName.tr}</span>
              <span className="text-[#71818A] font-arabic">· {specializationName.ar}</span>
            </span>
          )}

          {term.subcategory && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white dark:bg-[#0F1C21] border border-[#D7E9E8] dark:border-[#1D363D] text-[#71818A] dark:text-[#8BA4AE]">
              <span>{term.subcategory}</span>
            </span>
          )}

          <span
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border font-medium ${
              term.verificationStatus === 'Officially Verified' ||
              term.verificationStatus === 'Source Referenced'
                ? 'bg-[#E6F7F2] dark:bg-[#0E2B24] border-[#009F9D]/40 text-[#007F80] dark:text-[#4DE0DC]'
                : 'bg-[#FFF9E6] dark:bg-[#2A220E] border-[#E6B84A]/50 text-[#8F680C] dark:text-[#F6D377]'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>{term.verificationStatus}</span>
            <span className="font-arabic">· {CLASSIFICATION_AR[term.verificationStatus] || ''}</span>
          </span>
        </div>
      </div>

      {/* Definitions & Examples Section */}
      <div className="p-6 sm:p-8 space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Arabic Definition */}
          <section
            dir="rtl"
            className={`space-y-2 ${isArabicLead ? 'order-1' : 'order-1 lg:order-2'}`}
          >
            <h2 className="text-sm font-bold font-arabic text-[#007F80] dark:text-[#4DE0DC]">
              التعريف والشرح القانوني بالعربية
            </h2>
            <p className="text-[15px] leading-[1.8] font-arabic text-[#172B35] dark:text-[#E2F1F1]">
              {term.arabicDefinition}
            </p>
          </section>

          {/* Turkish Definition */}
          <section
            dir="ltr"
            className={`space-y-2 ${isArabicLead ? 'order-2' : 'order-2 lg:order-1'}`}
          >
            <h2 className="text-sm font-bold text-[#007F80] dark:text-[#4DE0DC]">
              Türkçe Hukuki Açıklama
            </h2>
            <p className="text-[15px] leading-[1.7] text-[#172B35] dark:text-[#E2F1F1]">
              {term.turkishDefinition}
            </p>
          </section>
        </div>

        {/* Practical Examples */}
        {(term.turkishExamples.length > 0 || term.arabicExamples.length > 0) && (
          <section className="pt-6 border-t border-[#D7E9E8] dark:border-[#1D363D] space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-[#172B35] dark:text-[#F0F7F7] flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-[#009F9D]" />
                <span>Uygulama Örnekleri ve Çevirileri</span>
              </h2>
              <span className="text-xs font-bold font-arabic text-[#007F80] dark:text-[#4DE0DC]" dir="rtl">
                أمثلة تطبيقية وترجمتها القانونية
              </span>
            </div>

            <div className="space-y-4">
              {(isArabicLead ? [...term.arabicExamples, ...term.turkishExamples] : [...term.turkishExamples, ...term.arabicExamples]).map(
                (ex, idx) => (
                  <div
                    key={idx}
                    className="rounded-xl bg-[#F5FAFA] dark:bg-[#112126] border border-[#D7E9E8] dark:border-[#1D363D] p-4 grid grid-cols-1 lg:grid-cols-2 gap-4"
                  >
                    <div dir="ltr" className={isArabicLead ? 'lg:order-2' : 'lg:order-1'}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[11px] font-semibold text-[#71818A] dark:text-[#8BA4AE]">
                          Türkçe Örnek
                        </span>
                        <SpeechButton
                          text={ex.tr}
                          lang="tr"
                          idKey={`${term.id}-ex-tr-${idx}`}
                          compact
                        />
                      </div>
                      <p className="text-sm leading-relaxed text-[#172B35] dark:text-[#E2F1F1]">
                        {ex.tr}
                      </p>
                    </div>
                    <div dir="rtl" className={isArabicLead ? 'lg:order-1' : 'lg:order-2'}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[11px] font-semibold font-arabic text-[#71818A] dark:text-[#8BA4AE]">
                          الترجمة / المثال العربي
                        </span>
                        <SpeechButton
                          text={ex.ar}
                          lang="ar"
                          idKey={`${term.id}-ex-ar-${idx}`}
                          compact
                        />
                      </div>
                      <p className="text-sm font-arabic leading-relaxed text-[#172B35] dark:text-[#E2F1F1]">
                        {ex.ar}
                      </p>
                    </div>
                  </div>
                )
              )}
            </div>
          </section>
        )}

        {/* Legal Context */}
        {(term.legalContext.tr || term.legalContext.ar) && (
          <section className="pt-6 border-t border-[#D7E9E8] dark:border-[#1D363D] grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <h3 className="text-xs font-bold text-[#71818A] dark:text-[#8BA4AE] mb-1.5">
                Hukuki Bağlam ve Kullanım Notu
              </h3>
              <p className="text-sm leading-relaxed text-[#172B35] dark:text-[#E2F1F1]">
                {term.legalContext.tr}
              </p>
            </div>
            <div dir="rtl">
              <h3 className="text-xs font-bold font-arabic text-[#71818A] dark:text-[#8BA4AE] mb-1.5">
                السياق القانوني وملاحظات الاستعمال
              </h3>
              <p className="text-sm font-arabic leading-relaxed text-[#172B35] dark:text-[#E2F1F1]">
                {term.legalContext.ar}
              </p>
            </div>
          </section>
        )}

        {/* Comparative Legal Terminology Engine (Section 23.2) */}
        <section className="pt-6 border-t border-[#D7E9E8] dark:border-[#1D363D] space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-sm font-bold text-[#172B35] dark:text-[#F0F7F7] flex items-center gap-2">
              <GitCompare className="w-4 h-4 text-[#009F9D]" />
              <span>Karşılaştırmalı Hukuk Analizi (Türkiye ↔ Mısır)</span>
            </h2>
            <span className="text-xs font-bold font-arabic text-[#007F80] dark:text-[#4DE0DC]" dir="rtl">
              التحليل القانوني المقارن بين النظامين التركي والمصري
            </span>
          </div>

          {(term.turkishEquivalent || term.egyptianEquivalent) && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              {term.turkishEquivalent && (
                <div className="rounded-xl bg-[#F5FAFA] dark:bg-[#112126] border border-[#D7E9E8] dark:border-[#1D363D] p-3.5 space-y-1">
                  <div className="text-xs font-semibold text-[#007F80] dark:text-[#4DE0DC]">
                    Türk Hukuku Karşılığı
                  </div>
                  <p className="font-semibold text-[#172B35] dark:text-[#F0F7F7]">
                    {term.turkishEquivalent}
                  </p>
                </div>
              )}
              {term.egyptianEquivalent && (
                <div className="rounded-xl bg-[#F5FAFA] dark:bg-[#112126] border border-[#D7E9E8] dark:border-[#1D363D] p-3.5 space-y-1" dir="rtl">
                  <div className="text-xs font-semibold font-arabic text-[#007F80] dark:text-[#4DE0DC]">
                    المقابل في القانون المصري
                  </div>
                  <p className="font-semibold font-arabic text-[#172B35] dark:text-[#F0F7F7]">
                    {term.egyptianEquivalent}
                  </p>
                </div>
              )}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="rounded-xl border border-[#D7E9E8] dark:border-[#1D363D] p-4 space-y-1.5">
              <div className="text-xs font-semibold text-[#007F80] dark:text-[#4DE0DC]">
                Kaynak Sistemdeki Tanım · التعريف في نظام المصدر
              </div>
              <p className="text-[#172B35] dark:text-[#E2F1F1] leading-relaxed">
                {term.comparativeAnalysis.originDefinition}
              </p>
            </div>
            <div className="rounded-xl border border-[#D7E9E8] dark:border-[#1D363D] p-4 space-y-1.5" dir="auto">
              <div className="text-xs font-semibold text-[#007F80] dark:text-[#4DE0DC]">
                Karşı Sistemdeki Kavram · المفهوم المقابل في النظام الآخر
              </div>
              <p className="font-arabic text-[#172B35] dark:text-[#E2F1F1] leading-relaxed">
                {term.comparativeAnalysis.targetConcept}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs sm:text-sm">
            <div className="p-3.5 rounded-xl bg-[#F5FAFA] dark:bg-[#112126]">
              <div className="font-semibold text-[#71818A] dark:text-[#8BA4AE] mb-1">
                Anlam Farkları · فروق المعنى
              </div>
              <p className="text-[#172B35] dark:text-[#E2F1F1] leading-relaxed">
                {term.comparativeAnalysis.meaningDifferences}
              </p>
            </div>
            <div className="p-3.5 rounded-xl bg-[#F5FAFA] dark:bg-[#112126]">
              <div className="font-semibold text-[#71818A] dark:text-[#8BA4AE] mb-1">
                Hukuki Sonuç Farkları · الآثار القانونية
              </div>
              <p className="text-[#172B35] dark:text-[#E2F1F1] leading-relaxed">
                {term.comparativeAnalysis.legalEffectsDifferences}
              </p>
            </div>
            <div className="p-3.5 rounded-xl bg-[#F5FAFA] dark:bg-[#112126]">
              <div className="font-semibold text-[#71818A] dark:text-[#8BA4AE] mb-1">
                İdari Usul Farkları · الإجراءات الإدارية
              </div>
              <p className="text-[#172B35] dark:text-[#E2F1F1] leading-relaxed">
                {term.comparativeAnalysis.proceduralDifferences}
              </p>
            </div>
          </div>

          {term.comparativeAnalysis.commonMistakes.length > 0 && (
            <div className="rounded-xl bg-[#FFF9E6] dark:bg-[#241E0F] border border-[#E6B84A]/40 p-4">
              <div className="text-xs font-bold text-[#8F680C] dark:text-[#F6D377] mb-1.5">
                Yaygın Çeviri Hataları · أخطاء ترجمة شائعة يجب تجنبها
              </div>
              <ul className="list-disc list-inside space-y-1 text-sm text-[#172B35] dark:text-[#F0F7F7]">
                {term.comparativeAnalysis.commonMistakes.map((m, i) => (
                  <li key={i}>{m}</li>
                ))}
              </ul>
            </div>
          )}
        </section>

        {/* Legal Translator's Notes (Section 23.4) */}
        <section className="rounded-2xl bg-[#DDF5F3]/60 dark:bg-[#132C2E] border border-[#009F9D]/30 p-5 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-sm font-bold text-[#007F80] dark:text-[#4DE0DC]">
              Hukuk Çevirmeni Notları — Legal Translator’s Notes
            </h2>
            <h2 className="text-sm font-bold font-arabic text-[#007F80] dark:text-[#4DE0DC]" dir="rtl">
              ملاحظات للمترجم القانوني
            </h2>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 text-sm">
            <p className="text-[#172B35] dark:text-[#E2F1F1] leading-relaxed">
              {term.translatorNotes.tr}
            </p>
            <p dir="rtl" className="font-arabic text-[#172B35] dark:text-[#E2F1F1] leading-relaxed">
              {term.translatorNotes.ar}
            </p>
          </div>
          {term.comparativeAnalysis.alternativeTranslations.length > 0 && (
            <div className="pt-2 border-t border-[#009F9D]/20 text-xs text-[#71818A] dark:text-[#9BB1B5]">
              <span className="font-semibold text-[#172B35] dark:text-[#E2F1F1]">
                Önerilen / Alternatif Çeviriler:{' '}
              </span>
              {term.comparativeAnalysis.recommendedTranslation} ·{' '}
              {term.comparativeAnalysis.alternativeTranslations.join(' · ')}
            </div>
          )}
        </section>

        {/* Synonyms, Related & Confusable Terms */}
        {(term.synonyms.length > 0 || term.relatedTerms.length > 0 || term.confusableTerms.length > 0) && (
          <section className="pt-6 border-t border-[#D7E9E8] dark:border-[#1D363D] space-y-5">
            {term.synonyms.length > 0 && (
              <div>
                <h3 className="text-xs font-bold text-[#71818A] dark:text-[#8BA4AE] mb-2">
                  Eş Anlamlı ve Alternatif Hukuki İfadeler · المرادفات والتعبيرات القانونية البديلة
                </h3>
                <div className="flex flex-wrap gap-2">
                  {term.synonyms.map((syn) => (
                    <span
                      key={syn}
                      dir="auto"
                      className="px-3 py-1 rounded-lg text-xs font-medium bg-[#F5FAFA] dark:bg-[#112126] border border-[#D7E9E8] dark:border-[#1D363D] text-[#172B35] dark:text-[#E2F1F1]"
                    >
                      {syn}
                    </span>
                  ))}
                </div>
              </div>
            )}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {term.relatedTerms.length > 0 && (
              <div>
                <h3 className="text-xs font-bold text-[#71818A] dark:text-[#8BA4AE] mb-2">
                  İlgili Hukuki Terimler · مصطلحات قانونية ذات صلة
                </h3>
                <div className="flex flex-wrap gap-2">
                  {term.relatedTerms.map((rt) => (
                    <button
                      key={rt}
                      type="button"
                      onClick={() => handleRelatedClick(rt)}
                      className="px-3 py-1.5 rounded-lg text-xs font-medium bg-[#F5FAFA] dark:bg-[#112126] border border-[#D7E9E8] dark:border-[#1D363D] text-[#007F80] dark:text-[#4DE0DC] hover:border-[#009F9D] transition-colors cursor-pointer"
                    >
                      {rt}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {term.confusableTerms.length > 0 && (
              <div>
                <h3 className="text-xs font-bold text-[#71818A] dark:text-[#8BA4AE] mb-2">
                  Karıştırılabilecek Terimler · مصطلحات قد تلتبس به
                </h3>
                <div className="flex flex-wrap gap-2">
                  {term.confusableTerms.map((ct) => (
                    <button
                      key={ct}
                      type="button"
                      onClick={() => handleRelatedClick(ct)}
                      className="px-3 py-1.5 rounded-lg text-xs font-medium bg-[#FFF9E6]/60 dark:bg-[#241E0F] border border-[#E6B84A]/40 text-[#8F680C] dark:text-[#F6D377] hover:border-[#E6B84A] transition-colors cursor-pointer"
                    >
                      {ct}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
          </section>
        )}

        {/* Official Legal Source & Citation Metadata (Section 23.5) */}
        <section className="pt-6 border-t border-[#D7E9E8] dark:border-[#1D363D] text-xs space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="font-bold text-[#172B35] dark:text-[#F0F7F7] flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-[#009F9D]" />
              <span>Resmî Hukuki Kaynak ve Doğrulama Bilgisi · المصدر القانوني الموثق</span>
            </div>
            <button
              type="button"
              onClick={() => setShowRevisions((v) => !v)}
              className="inline-flex items-center gap-1 text-[#007F80] dark:text-[#4DE0DC] hover:underline cursor-pointer"
            >
              <History className="w-3.5 h-3.5" />
              <span>Sürüm Geçmişi ({term.revisions.length})</span>
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 text-[#71818A] dark:text-[#8BA4AE]">
            <span>
              <strong className="text-[#172B35] dark:text-[#E2F1F1]">Kurum / الجهة:</strong>{' '}
              {term.source.authority}
            </span>
            <span aria-hidden="true">·</span>
            <span>
              <strong className="text-[#172B35] dark:text-[#E2F1F1]">Belge / الوثيقة:</strong>{' '}
              {term.source.documentTitle}
            </span>
            {term.source.lawNumber && (
              <>
                <span aria-hidden="true">·</span>
                <span className="font-mono-tabular">Kanun/No: {term.source.lawNumber}</span>
              </>
            )}
            {term.source.articleNumber && (
              <>
                <span aria-hidden="true">·</span>
                <span className="font-mono-tabular">{term.source.articleNumber}</span>
              </>
            )}
            <span aria-hidden="true">·</span>
            <span>Durum: {term.legalStatus}</span>
            <span aria-hidden="true">·</span>
            <span className="font-mono-tabular">Son Doğrulama: {term.lastVerifiedDate}</span>
            {term.source.url && (
              <>
                <span aria-hidden="true">·</span>
                <a
                  href={term.source.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-[#007F80] dark:text-[#4DE0DC] font-semibold hover:underline"
                >
                  <span>Resmî Kaynağı Aç</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </>
            )}
          </div>

          {showRevisions && (
            <div className="mt-3 rounded-xl bg-[#F5FAFA] dark:bg-[#112126] border border-[#D7E9E8] dark:border-[#1D363D] p-3.5 space-y-2">
              {term.revisions.map((rev) => (
                <div
                  key={rev.version}
                  className="flex flex-wrap items-center justify-between gap-2 text-xs border-b last:border-0 border-[#D7E9E8] dark:border-[#1D363D] pb-1.5 last:pb-0"
                >
                  <div>
                    <span className="font-mono-tabular font-semibold text-[#172B35] dark:text-[#F0F7F7]">
                      v{rev.version}
                    </span>{' '}
                    · <span className="text-[#007F80] dark:text-[#4DE0DC]">{rev.stage}</span> ·{' '}
                    <span>{rev.changeNote}</span>
                  </div>
                  <div className="text-[#71818A] font-mono-tabular">
                    {rev.editedBy} · {rev.editedAt.slice(0, 10)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </article>
  );
};
