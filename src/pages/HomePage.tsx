import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeftRight,
  ArrowRight,
  Bot,
  Calendar,
  FileSearch,
  GitCompare,
  GraduationCap,
  Scale,
  ScrollText,
  Search,
  Sparkles,
  TrendingUp,
} from 'lucide-react';
import { EgyptFlagIcon, TurkishFlagIcon } from '../components/AppShell.tsx';
import { SpeechButton } from '../components/SpeechButton.tsx';
import { useAppPreferences } from '../context/AppPreferencesContext.tsx';
import type { LegalTerm, SearchDirection } from '../types/legal.ts';

interface OverviewResponse {
  totalTerms: number;
  verifiedTerms: number;
  pendingTerms: number;
  missingCount: number;
  specializationsCount: number;
  distinctionsCount: number;
  constitutionalProvisionsCount: number;
  featuredTerm: LegalTerm | null;
  popularTerms: LegalTerm[];
}

export const HomePage: React.FC = () => {
  const { setDirection } = useAppPreferences();
  const navigate = useNavigate();
  const [overview, setOverview] = useState<OverviewResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    fetch('/api/overview')
      .then((res) => res.json())
      .then((data: OverviewResponse) => {
        if (active) setOverview(data);
      })
      .catch(() => {
        // Offline fallback handled gracefully
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const handleSelectDirection = (dir: SearchDirection) => {
    setDirection(dir);
    navigate('/search');
  };

  const featured = overview?.featuredTerm;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-8">
      {/* Main Turquoise Hero Card (Preserving AHD Dictionary Hero Experience) */}
      <section className="rounded-3xl bg-[#009F9D] text-white p-6 sm:p-10 shadow-sm relative overflow-hidden">
        <div className="relative z-10 max-w-3xl space-y-5">
          <div className="flex flex-wrap items-center gap-2 text-xs font-medium text-[#DDF5F3]">
            <span className="inline-flex items-center gap-1.5 bg-white/15 px-3 py-1 rounded-lg">
              <Scale className="w-3.5 h-3.5" />
              <span>AHD Sözlük Ailesi</span>
            </span>
            {overview && (
              <span className="inline-flex items-center gap-1.5 bg-white/15 px-3 py-1 rounded-lg font-mono-tabular">
                <span>{overview.verifiedTerms} Doğrulanmış Hukuki Terim</span>
                <span>·</span>
                <span>{overview.specializationsCount} Hukuk Dalı</span>
              </span>
            )}
          </div>

          <div className="space-y-2">
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
              AHD Kanuni Sözlük
            </h1>
            <p
              dir="rtl"
              className="text-xl sm:text-2xl font-bold font-arabic-display text-[#DDF5F3] text-right sm:text-left"
            >
              معجم المصطلحات القانونية الشامل (تركي ↔ عربي)
            </p>
            <p className="text-sm sm:text-base text-[#EBF9F8] leading-relaxed max-w-2xl">
              Avukatlar, yeminli hukuk tercümanları, hâkimler ve akademisyenler için Türkiye ve
              Mısır hukuk sistemlerine dayalı karşılaştırmalı, resmî kaynaklı Türkçe–Arapça hukuk
              terimleri sözlüğü.
            </p>
          </div>

          {/* Primary Action Buttons */}
          <div className="flex flex-wrap items-center gap-3 pt-1">
            <button
              type="button"
              onClick={() => navigate('/search')}
              className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-white text-[#007F80] font-bold text-sm hover:bg-[#F5FAFA] transition-colors shadow-xs min-h-[44px] cursor-pointer"
            >
              <Search className="w-4 h-4" />
              <span>Hemen Ara</span>
            </button>
            <button
              type="button"
              onClick={() => navigate('/quiz')}
              className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-[#007F80] text-white border border-white/25 font-bold text-sm hover:bg-[#00696A] transition-colors min-h-[44px] cursor-pointer"
            >
              <GraduationCap className="w-4 h-4 text-[#E6B84A]" />
              <span>Terim Testi</span>
            </button>
            <button
              type="button"
              onClick={() => navigate('/document-translator')}
              className="inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-white/10 text-white border border-white/25 font-semibold text-sm hover:bg-white/20 transition-colors min-h-[44px] cursor-pointer"
            >
              <FileSearch className="w-4 h-4" />
              <span>Belge Analizi</span>
            </button>
          </div>
        </div>
      </section>

      {/* Two Translation Direction Cards */}
      <section aria-label="Çeviri Yönü Seçimi" className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <button
          type="button"
          onClick={() => handleSelectDirection('tr-ar')}
          className="group text-left rounded-2xl bg-white dark:bg-[#0F1C21] border border-[#D7E9E8] dark:border-[#1D363D] hover:border-[#009F9D] p-5 sm:p-6 transition-all shadow-xs flex items-center justify-between gap-4 cursor-pointer"
        >
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 text-xs font-bold text-[#007F80] dark:text-[#4DE0DC]">
              <TurkishFlagIcon className="w-5 h-3.5" />
              <span>TR → AR</span>
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-[#172B35] dark:text-[#F0F7F7]">
              Türkçe → Arapça
            </h2>
            <p className="text-sm text-[#71818A] dark:text-[#8BA4AE]">
              Türkçe hukuk terimlerini arayın.
            </p>
          </div>
          <span className="w-10 h-10 rounded-xl bg-[#DDF5F3] dark:bg-[#132C2E] text-[#007F80] dark:text-[#4DE0DC] flex items-center justify-center shrink-0 group-hover:bg-[#009F9D] group-hover:text-white transition-colors">
            <ArrowRight className="w-5 h-5" />
          </span>
        </button>

        <button
          type="button"
          onClick={() => handleSelectDirection('ar-tr')}
          dir="rtl"
          className="group text-right rounded-2xl bg-white dark:bg-[#0F1C21] border border-[#D7E9E8] dark:border-[#1D363D] hover:border-[#009F9D] p-5 sm:p-6 transition-all shadow-xs flex items-center justify-between gap-4 cursor-pointer"
        >
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 text-xs font-bold text-[#007F80] dark:text-[#4DE0DC]" dir="ltr">
              <EgyptFlagIcon className="w-5 h-3.5" />
              <span>AR → TR</span>
            </div>
            <h2 className="text-lg sm:text-xl font-bold font-arabic-display text-[#172B35] dark:text-[#F0F7F7]">
              عربي → تركي
            </h2>
            <p className="text-sm font-arabic text-[#71818A] dark:text-[#8BA4AE]">
              ابحث بالمصطلحات القانونية العربية.
            </p>
          </div>
          <span className="w-10 h-10 rounded-xl bg-[#DDF5F3] dark:bg-[#132C2E] text-[#007F80] dark:text-[#4DE0DC] flex items-center justify-center shrink-0 group-hover:bg-[#009F9D] group-hover:text-white transition-colors">
            <ArrowLeftRight className="w-5 h-5" />
          </span>
        </button>
      </section>

      {/* Legal Term of the Month */}
      <section className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#E6B84A]" />
            <h2 className="text-base sm:text-lg font-bold text-[#172B35] dark:text-[#F0F7F7]">
              Bu Ayın Hukuki Terimi
            </h2>
          </div>
          <span
            dir="rtl"
            className="text-sm sm:text-base font-bold font-arabic text-[#007F80] dark:text-[#4DE0DC]"
          >
            مصطلح الشهر القانوني
          </span>
        </div>

        {loading ? (
          <div className="h-44 rounded-2xl bg-white dark:bg-[#0F1C21] border border-[#D7E9E8] dark:border-[#1D363D] animate-pulse" />
        ) : featured ? (
          <div className="rounded-2xl bg-white dark:bg-[#0F1C21] border border-[#D7E9E8] dark:border-[#1D363D] p-5 sm:p-6 shadow-xs space-y-5">
            <div className="flex flex-wrap items-start justify-between gap-4 border-b border-[#D7E9E8] dark:border-[#1D363D] pb-4">
              <div className="space-y-1">
                <div className="inline-flex items-center gap-1.5 text-xs font-mono-tabular font-semibold text-[#8F680C] dark:text-[#F6D377] bg-[#FFF9E6] dark:bg-[#241E0F] border border-[#E6B84A]/40 px-2.5 py-1 rounded-lg">
                  <Calendar className="w-3.5 h-3.5 text-[#E6B84A]" />
                  <span>{featured.monthlyFeaturedPeriod || 'Kasım 2026 / نوفمبر ٢٠٢٦'}</span>
                </div>
                <div className="pt-2 flex flex-wrap items-baseline gap-x-4 gap-y-1">
                  <Link
                    to={`/term/${featured.id}`}
                    className="text-xl sm:text-2xl font-bold text-[#172B35] dark:text-[#F0F7F7] hover:text-[#009F9D] transition-colors"
                  >
                    {featured.turkishTerm}
                  </Link>
                  <span className="text-[#71818A]">↔</span>
                  <Link
                    to={`/term/${featured.id}`}
                    dir="rtl"
                    className="text-xl sm:text-2xl font-bold font-arabic-display text-[#007F80] dark:text-[#4DE0DC] hover:underline"
                  >
                    {featured.arabicTerm}
                  </Link>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <SpeechButton text={featured.turkishTerm} lang="tr" idKey="month-tr" label="TR Dinle" />
                <SpeechButton text={featured.arabicTerm} lang="ar" idKey="month-ar" label="AR استماع" />
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 text-sm">
              <p className="text-[#172B35] dark:text-[#E2F1F1] leading-relaxed">
                {featured.turkishDefinition}
              </p>
              <p dir="rtl" className="font-arabic text-[#172B35] dark:text-[#E2F1F1] leading-[1.8]">
                {featured.arabicDefinition}
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-2 pt-2 text-xs text-[#71818A] dark:text-[#8BA4AE]">
              <span>
                Kaynak: {featured.source.authority} — {featured.source.documentTitle}
              </span>
              <Link
                to={`/term/${featured.id}`}
                className="font-semibold text-[#007F80] dark:text-[#4DE0DC] hover:underline inline-flex items-center gap-1"
              >
                <span>Karşılaştırmalı Analizi Gör</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        ) : null}
      </section>

      {/* Popular Legal Terms */}
      <section className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-[#009F9D]" />
            <h2 className="text-base sm:text-lg font-bold text-[#172B35] dark:text-[#F0F7F7]">
              Popüler Hukuk Terimleri
            </h2>
          </div>
          <span
            dir="rtl"
            className="text-sm font-bold font-arabic text-[#71818A] dark:text-[#8BA4AE]"
          >
            المصطلحات القانونية الأكثر بحثًا
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {(overview?.popularTerms || []).map((term) => (
            <Link
              key={term.id}
              to={`/term/${term.id}`}
              className="rounded-2xl bg-white dark:bg-[#0F1C21] border border-[#D7E9E8] dark:border-[#1D363D] hover:border-[#009F9D] p-4 transition-all flex flex-col justify-between gap-2.5"
            >
              <div>
                <div className="text-sm font-bold text-[#172B35] dark:text-[#F0F7F7] line-clamp-1">
                  {term.turkishTerm}
                </div>
                <div
                  dir="rtl"
                  className="text-sm font-bold font-arabic text-[#007F80] dark:text-[#4DE0DC] mt-1 line-clamp-1"
                >
                  {term.arabicTerm}
                </div>
              </div>
              <div className="flex items-center justify-between text-[11px] text-[#71818A] dark:text-[#8BA4AE] pt-2 border-t border-[#D7E9E8]/70 dark:border-[#1D363D]">
                <span className="truncate">{term.jurisdiction}</span>
                <span className="font-mono-tabular shrink-0">{term.searchCount}</span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Specialized Legal Workspace Modules */}
      <section className="space-y-3">
        <h2 className="text-base sm:text-lg font-bold text-[#172B35] dark:text-[#F0F7F7]">
          Uzmanlaşmış Hukuk Modülleri · الوحدات القانونية المتخصصة
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link
            to="/distinctions"
            className="rounded-2xl bg-white dark:bg-[#0F1C21] border border-[#D7E9E8] dark:border-[#1D363D] hover:border-[#009F9D] p-5 space-y-2 transition-colors"
          >
            <GitCompare className="w-5 h-5 text-[#009F9D]" />
            <div className="font-bold text-sm text-[#172B35] dark:text-[#F0F7F7]">
              Hukuki Terimler Arasındaki Farklar
            </div>
            <div dir="rtl" className="text-xs font-arabic text-[#007F80] dark:text-[#4DE0DC]">
              الفروق بين المصطلحات القانونية المتشابهة
            </div>
            <p className="text-xs text-[#71818A] dark:text-[#8BA4AE]">
              Tapu vs Kira, İpotek vs Rehin, Fesih vs İptal, Tebligat vs İhtarname ve Mısır eşdeğerleri.
            </p>
          </Link>

          <Link
            to="/legislation"
            className="rounded-2xl bg-white dark:bg-[#0F1C21] border border-[#D7E9E8] dark:border-[#1D363D] hover:border-[#009F9D] p-5 space-y-2 transition-colors"
          >
            <ScrollText className="w-5 h-5 text-[#009F9D]" />
            <div className="font-bold text-sm text-[#172B35] dark:text-[#F0F7F7]">
              Anayasalar & Resmî Kimlik Rehberi
            </div>
            <div dir="rtl" className="text-xs font-arabic text-[#007F80] dark:text-[#4DE0DC]">
              الدساتير التركية والمصرية ووثائق الهوية والشهر العقاري
            </div>
            <p className="text-xs text-[#71818A] dark:text-[#8BA4AE]">
              1982 Türk Anayasası, 2014/2019 Mısır Anayasası, T.C. Kimlik ve بطاقة الرقم القومي alanları.
            </p>
          </Link>

          <Link
            to="/document-translator"
            className="rounded-2xl bg-white dark:bg-[#0F1C21] border border-[#D7E9E8] dark:border-[#1D363D] hover:border-[#009F9D] p-5 space-y-2 transition-colors"
          >
            <FileSearch className="w-5 h-5 text-[#009F9D]" />
            <div className="font-bold text-sm text-[#172B35] dark:text-[#F0F7F7]">
              Resmî Belge Çeviri & Analiz Modu
            </div>
            <div dir="rtl" className="text-xs font-arabic text-[#007F80] dark:text-[#4DE0DC]">
              تحليل العقود والوكالات والوثائق الرسمية واستخراج المصطلحات
            </div>
            <p className="text-xs text-[#71818A] dark:text-[#8BA4AE]">
              Sözleşme, tapu, vekâletname veya mahkeme kararı yükleyin; doğrulanmış terim eşleşmesi alın.
            </p>
          </Link>

          <Link
            to="/ai-assistant"
            className="rounded-2xl bg-white dark:bg-[#0F1C21] border border-[#D7E9E8] dark:border-[#1D363D] hover:border-[#009F9D] p-5 space-y-2 transition-colors"
          >
            <Bot className="w-5 h-5 text-[#009F9D]" />
            <div className="font-bold text-sm text-[#172B35] dark:text-[#F0F7F7]">
              Yapay Zekâ Hukuk Asistanı
            </div>
            <div dir="rtl" className="text-xs font-arabic text-[#007F80] dark:text-[#4DE0DC]">
              المساعد القانوني المقارن بالذكاء الاصطناعي
            </div>
            <p className="text-xs text-[#71818A] dark:text-[#8BA4AE]">
              Türkiye hukuku ile Mısır hukuku arasındaki kavramsal farkları kaynaklı açıklamalarla inceleyin.
            </p>
          </Link>
        </div>
      </section>
    </div>
  );
};
