import React, { useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight, LayoutGrid, Loader2, Scale, Search as SearchIcon } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { LegalSpecialization, LegalTerm } from '../types/legal.ts';

interface EnrichedSpecialization extends LegalSpecialization {
  termCount: number;
}

interface PaginatedTermsResponse {
  items: LegalTerm[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export const CategoriesPage: React.FC = () => {
  const [categories, setCategories] = useState<EnrichedSpecialization[]>([]);
  const [selectedId, setSelectedId] = useState<string>('');
  const [selectedSubcategory, setSelectedSubcategory] = useState<string>('');
  const [categoryQuery, setCategoryQuery] = useState<string>('');
  const [termsData, setTermsData] = useState<PaginatedTermsResponse | null>(null);
  const [page, setPage] = useState(1);
  const [loadingCats, setLoadingCats] = useState(true);
  const [loadingTerms, setLoadingTerms] = useState(false);

  useEffect(() => {
    fetch('/api/categories')
      .then((res) => res.json())
      .then((data: EnrichedSpecialization[]) => {
        setCategories(data);
        if (data.length > 0) {
          setSelectedId(data[0].id);
        }
      })
      .finally(() => setLoadingCats(false));
  }, []);

  useEffect(() => {
    if (!selectedId) return;
    setLoadingTerms(true);
    const params = new URLSearchParams({
      specializationId: selectedId,
      page: String(page),
      limit: '12',
    });
    if (selectedSubcategory) params.set('subcategory', selectedSubcategory);
    if (categoryQuery.trim()) params.set('q', categoryQuery.trim());

    fetch(`/api/terms?${params.toString()}`)
      .then((res) => res.json())
      .then((data: PaginatedTermsResponse) => setTermsData(data))
      .finally(() => setLoadingTerms(false));
  }, [selectedId, selectedSubcategory, categoryQuery, page]);

  const coreSpecs = categories.filter((c) => c.priorityGroup === 'core');
  const otherSpecs = categories.filter((c) => c.priorityGroup !== 'core');
  const activeSpec = categories.find((c) => c.id === selectedId);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-[#007F80] dark:text-[#4DE0DC] text-xs font-bold">
            <LayoutGrid className="w-4 h-4" />
            <span>PANO · HUKUK DALLARI</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#172B35] dark:text-[#F0F7F7]">
            Hukuki Uzmanlık Alanları ({categories.length})
          </h1>
        </div>
        <p dir="rtl" className="text-sm font-bold font-arabic text-[#007F80] dark:text-[#4DE0DC]">
          التخصصات والفروع القانونية المعتمدة
        </p>
      </div>

      {loadingCats ? (
        <div className="p-12 flex justify-center">
          <Loader2 className="w-6 h-6 animate-spin text-[#009F9D]" />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Specializations Sidebar / Grid */}
          <div className="lg:col-span-5 space-y-5">
            <div className="space-y-2">
              <h2 className="text-xs font-bold text-[#71818A] dark:text-[#8BA4AE]">
                Öncelikli Temel Alanlar · المجالات ذات الأولوية القصوى
              </h2>
              <div className="space-y-2">
                {coreSpecs.map((spec) => (
                  <button
                    key={spec.id}
                    type="button"
                    onClick={() => {
                      setSelectedId(spec.id);
                      setSelectedSubcategory('');
                      setCategoryQuery('');
                      setPage(1);
                    }}
                    className={`w-full text-left rounded-xl border p-3.5 transition-colors flex items-center justify-between gap-3 cursor-pointer ${
                      selectedId === spec.id
                        ? 'bg-[#DDF5F3] dark:bg-[#132C2E] border-[#009F9D] text-[#007F80] dark:text-[#4DE0DC]'
                        : 'bg-white dark:bg-[#0F1C21] border-[#D7E9E8] dark:border-[#1D363D] hover:border-[#009F9D]'
                    }`}
                  >
                    <div className="min-w-0">
                      <div className="text-sm font-bold text-[#172B35] dark:text-[#F0F7F7] truncate">
                        {spec.nameTr}
                      </div>
                      <div className="text-xs font-arabic text-[#71818A] dark:text-[#8BA4AE] truncate">
                        {spec.nameAr}
                      </div>
                    </div>
                    <span className="font-mono-tabular text-xs font-semibold px-2 py-0.5 rounded-lg bg-[#F5FAFA] dark:bg-[#112126] border border-[#D7E9E8] dark:border-[#1D363D] shrink-0">
                      {spec.termCount}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <h2 className="text-xs font-bold text-[#71818A] dark:text-[#8BA4AE]">
                Diğer Hukuk Dalları · التخصصات القانونية الأخرى
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-2 max-h-[420px] overflow-y-auto pr-1">
                {otherSpecs.map((spec) => (
                  <button
                    key={spec.id}
                    type="button"
                    onClick={() => {
                      setSelectedId(spec.id);
                      setSelectedSubcategory('');
                      setCategoryQuery('');
                      setPage(1);
                    }}
                    className={`w-full text-left rounded-xl border p-3 transition-colors flex items-center justify-between gap-2 cursor-pointer ${
                      selectedId === spec.id
                        ? 'bg-[#DDF5F3] dark:bg-[#132C2E] border-[#009F9D] text-[#007F80] dark:text-[#4DE0DC]'
                        : 'bg-white dark:bg-[#0F1C21] border-[#D7E9E8] dark:border-[#1D363D] hover:border-[#009F9D]'
                    }`}
                  >
                    <div className="min-w-0">
                      <div className="text-xs sm:text-sm font-semibold text-[#172B35] dark:text-[#F0F7F7] truncate">
                        {spec.nameTr}
                      </div>
                      <div className="text-[11px] font-arabic text-[#71818A] dark:text-[#8BA4AE] truncate">
                        {spec.nameAr}
                      </div>
                    </div>
                    <span className="font-mono-tabular text-xs text-[#71818A] shrink-0">
                      {spec.termCount}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Terms List for Selected Specialization */}
          <div className="lg:col-span-7 space-y-4">
            {activeSpec && (
              <div className="rounded-2xl bg-white dark:bg-[#0F1C21] border border-[#D7E9E8] dark:border-[#1D363D] p-5 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h2 className="text-lg font-bold text-[#172B35] dark:text-[#F0F7F7] flex items-center gap-2">
                    <Scale className="w-4 h-4 text-[#009F9D]" />
                    <span>{activeSpec.nameTr}</span>
                  </h2>
                  <span dir="rtl" className="text-base font-bold font-arabic text-[#007F80] dark:text-[#4DE0DC]">
                    {activeSpec.nameAr}
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-[#71818A] dark:text-[#8BA4AE]">
                  {activeSpec.descriptionTr}
                </p>
                <p dir="rtl" className="text-xs sm:text-sm font-arabic text-[#71818A] dark:text-[#8BA4AE]">
                  {activeSpec.descriptionAr}
                </p>

                {activeSpec.subcategories && activeSpec.subcategories.length > 0 && (
                  <div className="pt-2 border-t border-[#D7E9E8] dark:border-[#1D363D] flex flex-wrap gap-1.5">
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedSubcategory('');
                        setPage(1);
                      }}
                      className={`px-2.5 py-1 rounded-lg text-xs font-semibold border transition-colors cursor-pointer ${
                        selectedSubcategory === ''
                          ? 'bg-[#009F9D] border-[#009F9D] text-white'
                          : 'bg-[#F5FAFA] dark:bg-[#112126] border-[#D7E9E8] dark:border-[#1D363D] text-[#71818A] dark:text-[#8BA4AE] hover:border-[#009F9D]'
                      }`}
                    >
                      Tümü ({activeSpec.termCount})
                    </button>
                    {activeSpec.subcategories.map((sub) => (
                      <button
                        key={sub.id}
                        type="button"
                        onClick={() => {
                          setSelectedSubcategory(sub.nameTr);
                          setPage(1);
                        }}
                        className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition-colors cursor-pointer ${
                          selectedSubcategory === sub.nameTr
                            ? 'bg-[#009F9D] border-[#009F9D] text-white'
                            : 'bg-[#F5FAFA] dark:bg-[#112126] border-[#D7E9E8] dark:border-[#1D363D] text-[#172B35] dark:text-[#E2F1F1] hover:border-[#009F9D]'
                        }`}
                      >
                        {sub.nameTr}
                      </button>
                    ))}
                  </div>
                )}

                <div className="relative pt-1">
                  <SearchIcon className="w-4 h-4 text-[#71818A] absolute left-3 top-1/2 -translate-y-1/2 mt-0.5" />
                  <input
                    type="text"
                    value={categoryQuery}
                    onChange={(e) => {
                      setCategoryQuery(e.target.value);
                      setPage(1);
                    }}
                    placeholder="Bu dal içinde Türkçe veya Arapça terim filtrele..."
                    className="w-full rounded-xl border border-[#D7E9E8] dark:border-[#1D363D] bg-[#F5FAFA] dark:bg-[#112126] pl-9 pr-3 py-2 text-xs text-[#172B35] dark:text-[#F0F7F7] focus:outline-none focus:border-[#009F9D]"
                  />
                </div>
              </div>
            )}

            {loadingTerms ? (
              <div className="p-10 flex justify-center">
                <Loader2 className="w-5 h-5 animate-spin text-[#009F9D]" />
              </div>
            ) : termsData && termsData.items.length > 0 ? (
              <div className="space-y-3">
                {termsData.items.map((term) => (
                  <Link
                    key={term.id}
                    to={`/term/${term.id}`}
                    className="block rounded-2xl bg-white dark:bg-[#0F1C21] border border-[#D7E9E8] dark:border-[#1D363D] hover:border-[#009F9D] p-4 transition-colors space-y-2"
                  >
                    <div className="flex flex-wrap items-baseline justify-between gap-2">
                      <span className="text-base font-bold text-[#172B35] dark:text-[#F0F7F7]">
                        {term.turkishTerm}
                      </span>
                      <span
                        dir="rtl"
                        className="text-base font-bold font-arabic text-[#007F80] dark:text-[#4DE0DC]"
                      >
                        {term.arabicTerm}
                      </span>
                    </div>
                    <p className="text-xs text-[#71818A] dark:text-[#8BA4AE] line-clamp-2">
                      {term.turkishDefinition}
                    </p>
                    <div className="flex flex-wrap items-center gap-2 text-[11px] text-[#71818A] dark:text-[#8BA4AE]">
                      <span>{term.jurisdiction}</span>
                      <span>·</span>
                      <span>{term.translationClassification}</span>
                      <span>·</span>
                      <span>{term.source.authority}</span>
                    </div>
                  </Link>
                ))}

                {termsData.totalPages > 1 && (
                  <div className="flex items-center justify-between pt-2 text-xs">
                    <button
                      type="button"
                      disabled={page <= 1}
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      className="inline-flex items-center gap-1 px-3 py-2 rounded-xl border border-[#D7E9E8] dark:border-[#1D363D] disabled:opacity-40 cursor-pointer"
                    >
                      <ChevronLeft className="w-4 h-4" />
                      <span>Önceki</span>
                    </button>
                    <span className="font-mono-tabular text-[#71818A]">
                      {page} / {termsData.totalPages}
                    </span>
                    <button
                      type="button"
                      disabled={page >= termsData.totalPages}
                      onClick={() => setPage((p) => p + 1)}
                      className="inline-flex items-center gap-1 px-3 py-2 rounded-xl border border-[#D7E9E8] dark:border-[#1D363D] disabled:opacity-40 cursor-pointer"
                    >
                      <span>Sonraki</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="rounded-2xl bg-white dark:bg-[#0F1C21] border border-[#D7E9E8] dark:border-[#1D363D] p-8 text-center text-sm text-[#71818A]">
                Bu hukuk dalı için henüz yayınlanmış terim kaydı bulunmamaktadır. Yönetim panelinden
                doğrudan yeni terim veya CSV içe aktarımı ekleyebilirsiniz.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
