import React, { useEffect, useState } from 'react';
import { AlertTriangle, GitCompare, Loader2, Search } from 'lucide-react';
import type { LegalDistinction } from '../types/legal.ts';

const GROUPS = [
  { id: '', labelTr: 'Tümü', labelAr: 'الكل' },
  { id: 'contracts', labelTr: 'Sözleşmeler', labelAr: 'العقود' },
  { id: 'real-estate', labelTr: 'Taşınmaz & Tapu', labelAr: 'العقارات والشهر العقاري' },
  { id: 'notarial', labelTr: 'Noter & Vekâlet', labelAr: 'التوثيق والوكالات' },
  { id: 'judicial', labelTr: 'Yargı & İcra', labelAr: 'القضاء والتنفيذ' },
];

export const DistinctionsPage: React.FC = () => {
  const [groupId, setGroupId] = useState('');
  const [searchText, setSearchText] = useState('');
  const [items, setItems] = useState<LegalDistinction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (groupId) params.set('groupId', groupId);
    if (searchText.trim()) params.set('q', searchText.trim());
    fetch(`/api/distinctions?${params.toString()}`)
      .then((res) => res.json())
      .then((data: LegalDistinction[]) => setItems(data))
      .finally(() => setLoading(false));
  }, [groupId, searchText]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
      <div className="rounded-2xl bg-white dark:bg-[#0F1C21] border border-[#D7E9E8] dark:border-[#1D363D] p-5 sm:p-6 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-[#007F80] dark:text-[#4DE0DC]">
              <GitCompare className="w-4 h-4" />
              <span>KARŞILAŞTIRMALI FARKLAR VERİTABANI</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-[#172B35] dark:text-[#F0F7F7] mt-1">
              Hukuki Terimler Arasındaki Farklar
            </h1>
          </div>
          <h2 dir="rtl" className="text-lg font-bold font-arabic text-[#007F80] dark:text-[#4DE0DC]">
            الفروق بين المصطلحات القانونية المتشابهة
          </h2>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
          <div className="flex flex-wrap gap-2">
            {GROUPS.map((g) => (
              <button
                key={g.id || 'all'}
                type="button"
                onClick={() => setGroupId(g.id)}
                className={`px-3.5 py-2 rounded-xl text-xs font-semibold border transition-colors cursor-pointer ${
                  groupId === g.id
                    ? 'bg-[#009F9D] border-[#009F9D] text-white'
                    : 'bg-[#F5FAFA] dark:bg-[#112126] border-[#D7E9E8] dark:border-[#1D363D] text-[#172B35] dark:text-[#E2F1F1] hover:border-[#009F9D]'
                }`}
              >
                {g.labelTr} · <span className="font-arabic">{g.labelAr}</span>
              </button>
            ))}
          </div>

          <div className="relative sm:w-72">
            <Search className="w-4 h-4 text-[#71818A] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              placeholder="Karşılaştırma ara (ör. Fesih, İpotek)..."
              className="w-full pl-9 pr-3 py-2 rounded-xl border border-[#D7E9E8] dark:border-[#1D363D] bg-[#F5FAFA] dark:bg-[#112126] text-xs sm:text-sm"
            />
          </div>
        </div>
      </div>

      {loading ? (
        <div className="p-12 flex justify-center">
          <Loader2 className="w-6 h-6 animate-spin text-[#009F9D]" />
        </div>
      ) : (
        <div className="space-y-5">
          {items.map((item) => (
            <article
              key={item.id}
              className="rounded-2xl bg-white dark:bg-[#0F1C21] border border-[#D7E9E8] dark:border-[#1D363D] overflow-hidden shadow-xs"
            >
              <div className="px-5 py-3 bg-[#F5FAFA] dark:bg-[#112126] border-b border-[#D7E9E8] dark:border-[#1D363D] flex flex-wrap items-center justify-between gap-2 text-xs">
                <span className="font-bold text-[#007F80] dark:text-[#4DE0DC]">
                  {item.groupTitleTr} · <span className="font-arabic">{item.groupTitleAr}</span>
                </span>
                <span className="text-[#71818A] dark:text-[#8BA4AE]">
                  {item.jurisdiction} · {item.sourceLabel}
                </span>
              </div>

              <div className="p-5 sm:p-6 space-y-5">
                {/* Side-by-Side Terms */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="rounded-xl border border-[#D7E9E8] dark:border-[#1D363D] p-4 space-y-2">
                    <div className="text-base font-bold text-[#172B35] dark:text-[#F0F7F7]">
                      {item.termA.tr}
                    </div>
                    <div dir="rtl" className="text-sm font-bold font-arabic text-[#007F80] dark:text-[#4DE0DC]">
                      {item.termA.ar}
                    </div>
                    <p className="text-xs sm:text-sm text-[#172B35] dark:text-[#E2F1F1] leading-relaxed">
                      {item.termA.definitionTr}
                    </p>
                    <p dir="rtl" className="text-xs sm:text-sm font-arabic text-[#71818A] dark:text-[#9BB1B5] leading-relaxed">
                      {item.termA.definitionAr}
                    </p>
                  </div>

                  <div className="rounded-xl border border-[#D7E9E8] dark:border-[#1D363D] p-4 space-y-2">
                    <div className="text-base font-bold text-[#172B35] dark:text-[#F0F7F7]">
                      {item.termB.tr}
                    </div>
                    <div dir="rtl" className="text-sm font-bold font-arabic text-[#007F80] dark:text-[#4DE0DC]">
                      {item.termB.ar}
                    </div>
                    <p className="text-xs sm:text-sm text-[#172B35] dark:text-[#E2F1F1] leading-relaxed">
                      {item.termB.definitionTr}
                    </p>
                    <p dir="rtl" className="text-xs sm:text-sm font-arabic text-[#71818A] dark:text-[#9BB1B5] leading-relaxed">
                      {item.termB.definitionAr}
                    </p>
                  </div>
                </div>

                {/* Main Difference & Legal Consequences */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs sm:text-sm">
                  <div className="rounded-xl bg-[#F5FAFA] dark:bg-[#112126] p-4 space-y-1.5">
                    <div className="font-bold text-[#007F80] dark:text-[#4DE0DC]">
                      Temel Hukuki Fark · الفرق الجوهري
                    </div>
                    <p>{item.mainDifferenceTr}</p>
                    <p dir="rtl" className="font-arabic text-[#71818A] dark:text-[#9BB1B5]">
                      {item.mainDifferenceAr}
                    </p>
                  </div>
                  <div className="rounded-xl bg-[#F5FAFA] dark:bg-[#112126] p-4 space-y-1.5">
                    <div className="font-bold text-[#007F80] dark:text-[#4DE0DC]">
                      Hukuki Sonuçlar · الآثار القانونية المترتبة
                    </div>
                    <p>{item.legalConsequencesTr}</p>
                    <p dir="rtl" className="font-arabic text-[#71818A] dark:text-[#9BB1B5]">
                      {item.legalConsequencesAr}
                    </p>
                  </div>
                </div>

                {/* Usage & Translation Warning */}
                <div className="rounded-xl bg-[#FFF9E6] dark:bg-[#241E0F] border border-[#E6B84A]/40 p-4 space-y-1.5 text-xs sm:text-sm">
                  <div className="flex items-center gap-2 font-bold text-[#8F680C] dark:text-[#F6D377]">
                    <AlertTriangle className="w-4 h-4 text-[#E6B84A]" />
                    <span>Çevirmen Uyarısı · تنبيه المترجم القانوني</span>
                  </div>
                  <p className="text-[#172B35] dark:text-[#F0F7F7]">{item.translationWarningTr}</p>
                  <p dir="rtl" className="font-arabic text-[#172B35] dark:text-[#F0F7F7]">
                    {item.translationWarningAr}
                  </p>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
};
