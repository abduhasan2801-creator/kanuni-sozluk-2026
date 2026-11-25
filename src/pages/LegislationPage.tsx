import React, { useEffect, useState } from 'react';
import { BookOpenCheck, ExternalLink, IdCard, Loader2, ScrollText } from 'lucide-react';
import { EgyptFlagIcon, TurkishFlagIcon } from '../components/AppShell.tsx';
import type { ConstitutionalProvision, OfficialDocumentGuide } from '../types/legal.ts';

export const LegislationPage: React.FC = () => {
  const [country, setCountry] = useState<'All' | 'Turkey' | 'Egypt'>('All');
  const [tab, setTab] = useState<'constitutions' | 'documents'>('constitutions');
  const [provisions, setProvisions] = useState<ConstitutionalProvision[]>([]);
  const [guides, setGuides] = useState<OfficialDocumentGuide[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (country !== 'All') params.set('country', country);
    fetch(`/api/legislation?${params.toString()}`)
      .then((res) => res.json())
      .then((data: { provisions: ConstitutionalProvision[]; guides: OfficialDocumentGuide[] }) => {
        setProvisions(data.provisions);
        setGuides(data.guides);
      })
      .finally(() => setLoading(false));
  }, [country]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
      <div className="rounded-2xl bg-white dark:bg-[#0F1C21] border border-[#D7E9E8] dark:border-[#1D363D] p-5 sm:p-6 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="text-xs font-bold text-[#007F80] dark:text-[#4DE0DC] flex items-center gap-1.5">
              <ScrollText className="w-4 h-4" />
              <span>ANAYASAL METİNLER & RESMÎ KİMLİK / TAPU REHBERİ</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-[#172B35] dark:text-[#F0F7F7] mt-1">
              Anayasalar, Mevzuat ve Resmî Belgeler
            </h1>
          </div>
          <p dir="rtl" className="text-base font-bold font-arabic text-[#007F80] dark:text-[#4DE0DC]">
            الدساتير والتشريعات ودليل الوثائق الرسمية والهويات
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="inline-flex rounded-xl bg-[#F5FAFA] dark:bg-[#112126] p-1 border border-[#D7E9E8] dark:border-[#1D363D]">
            <button
              type="button"
              onClick={() => setTab('constitutions')}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                tab === 'constitutions'
                  ? 'bg-[#009F9D] text-white'
                  : 'text-[#71818A] dark:text-[#8BA4AE]'
              }`}
            >
              <BookOpenCheck className="w-4 h-4" />
              <span>Anayasalar · الدساتير</span>
            </button>
            <button
              type="button"
              onClick={() => setTab('documents')}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                tab === 'documents'
                  ? 'bg-[#009F9D] text-white'
                  : 'text-[#71818A] dark:text-[#8BA4AE]'
              }`}
            >
              <IdCard className="w-4 h-4" />
              <span>Kimlik & Resmî Belgeler · الهويات والوثائق</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            {(['All', 'Turkey', 'Egypt'] as const).map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setCountry(c)}
                className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border transition-colors cursor-pointer ${
                  country === c
                    ? 'bg-[#DDF5F3] dark:bg-[#132C2E] border-[#009F9D] text-[#007F80] dark:text-[#4DE0DC]'
                    : 'bg-white dark:bg-[#0F1C21] border-[#D7E9E8] dark:border-[#1D363D]'
                }`}
              >
                {c === 'Turkey' && <TurkishFlagIcon className="w-4 h-3" />}
                {c === 'Egypt' && <EgyptFlagIcon className="w-4 h-3" />}
                <span>{c === 'All' ? 'Tümü' : c === 'Turkey' ? 'Türkiye' : 'Mısır / مصر'}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {loading ? (
        <div className="p-12 flex justify-center">
          <Loader2 className="w-6 h-6 animate-spin text-[#009F9D]" />
        </div>
      ) : tab === 'constitutions' ? (
        <div className="space-y-4">
          {provisions.map((p) => (
            <article
              key={p.id}
              className="rounded-2xl bg-white dark:bg-[#0F1C21] border border-[#D7E9E8] dark:border-[#1D363D] p-5 sm:p-6 space-y-4"
            >
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#D7E9E8] dark:border-[#1D363D] pb-3">
                <div className="flex items-center gap-2.5">
                  {p.country === 'Turkey' ? (
                    <TurkishFlagIcon className="w-5 h-3.5" />
                  ) : (
                    <EgyptFlagIcon className="w-5 h-3.5" />
                  )}
                  <div>
                    <div className="text-sm font-bold text-[#172B35] dark:text-[#F0F7F7]">
                      {p.constitutionTitleTr} · <span className="font-mono-tabular">{p.articleNumber}</span>
                    </div>
                    <div dir="rtl" className="text-xs font-arabic text-[#007F80] dark:text-[#4DE0DC]">
                      {p.constitutionTitleAr}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <span className="px-2.5 py-1 rounded-lg bg-[#F5FAFA] dark:bg-[#112126] border border-[#D7E9E8] dark:border-[#1D363D] font-mono-tabular">
                    {p.versionLabel}
                  </span>
                  <span
                    className={`px-2.5 py-1 rounded-lg font-semibold ${
                      p.status === 'Current'
                        ? 'bg-[#DDF5F3] dark:bg-[#132C2E] text-[#007F80] dark:text-[#4DE0DC]'
                        : 'bg-[#FFF9E6] dark:bg-[#241E0F] text-[#8F680C] dark:text-[#F6D377]'
                    }`}
                  >
                    {p.status}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 text-sm">
                <div dir={p.country === 'Egypt' ? 'rtl' : 'ltr'} className="space-y-1.5">
                  <div className="text-xs font-bold text-[#71818A] dark:text-[#8BA4AE]">
                    Resmî Metin · النص الرسمي
                  </div>
                  <p className={`leading-relaxed ${p.country === 'Egypt' ? 'font-arabic' : ''}`}>
                    {p.originalText}
                  </p>
                </div>
                <div dir={p.country === 'Turkey' ? 'rtl' : 'ltr'} className="space-y-1.5">
                  <div className="text-xs font-bold text-[#007F80] dark:text-[#4DE0DC]">
                    Hukuki Çeviri · الترجمة القانونية المعتمدة
                  </div>
                  <p className={`leading-relaxed ${p.country === 'Turkey' ? 'font-arabic' : ''}`}>
                    {p.translatedText}
                  </p>
                </div>
              </div>

              <div className="rounded-xl bg-[#F5FAFA] dark:bg-[#112126] p-4 grid grid-cols-1 lg:grid-cols-2 gap-4 text-xs sm:text-sm">
                <p>{p.explanationTr}</p>
                <p dir="rtl" className="font-arabic">
                  {p.explanationAr}
                </p>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-[#71818A]">
                <span>{p.officialSource}</span>
                {p.sourceUrl && (
                  <a
                    href={p.sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-[#007F80] dark:text-[#4DE0DC] font-semibold hover:underline"
                  >
                    <span>Resmî Kaynağı Aç</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="space-y-5">
          {guides.map((doc) => (
            <article
              key={doc.id}
              className="rounded-2xl bg-white dark:bg-[#0F1C21] border border-[#D7E9E8] dark:border-[#1D363D] p-5 sm:p-6 space-y-5"
            >
              <div className="flex flex-wrap items-start justify-between gap-3 border-b border-[#D7E9E8] dark:border-[#1D363D] pb-4">
                <div className="flex items-center gap-3">
                  {doc.country === 'Turkey' ? (
                    <TurkishFlagIcon className="w-6 h-4" />
                  ) : (
                    <EgyptFlagIcon className="w-6 h-4" />
                  )}
                  <div>
                    <h2 className="text-lg font-bold text-[#172B35] dark:text-[#F0F7F7]">
                      {doc.nameTr}
                    </h2>
                    <div dir="rtl" className="text-base font-bold font-arabic text-[#007F80] dark:text-[#4DE0DC]">
                      {doc.nameAr}
                    </div>
                  </div>
                </div>
                <span className="px-3 py-1 rounded-lg bg-[#F5FAFA] dark:bg-[#112126] border border-[#D7E9E8] dark:border-[#1D363D] text-xs font-medium">
                  {doc.documentForm}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs sm:text-sm">
                <div>
                  <strong className="text-[#007F80] dark:text-[#4DE0DC]">Yetkili Kurum:</strong>{' '}
                  {doc.issuingAuthorityTr}
                  <p className="mt-1 text-[#71818A] dark:text-[#8BA4AE]">{doc.purposeTr}</p>
                </div>
                <div dir="rtl" className="font-arabic">
                  <strong className="text-[#007F80] dark:text-[#4DE0DC]">الجهة المصدرة:</strong>{' '}
                  {doc.issuingAuthorityAr}
                  <p className="mt-1 text-[#71818A] dark:text-[#8BA4AE]">{doc.purposeAr}</p>
                </div>
              </div>

              {/* Field-by-field bilingual translation table */}
              <div className="overflow-x-auto rounded-xl border border-[#D7E9E8] dark:border-[#1D363D]">
                <table className="w-full text-left text-xs sm:text-sm border-collapse">
                  <thead className="bg-[#F5FAFA] dark:bg-[#112126] text-[#71818A] dark:text-[#8BA4AE]">
                    <tr>
                      <th className="p-3 font-bold">Türkçe Belge Alanı</th>
                      <th className="p-3 font-bold text-right font-arabic">الحقل المقابل بالعربية</th>
                      <th className="p-3 font-bold">Hukuki & Çeviri Notu</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#D7E9E8] dark:divide-[#1D363D]">
                    {doc.fields.map((f, idx) => (
                      <tr key={idx}>
                        <td className="p-3 font-semibold text-[#172B35] dark:text-[#F0F7F7]">
                          {f.labelTr}
                        </td>
                        <td
                          dir="rtl"
                          className="p-3 font-bold font-arabic text-[#007F80] dark:text-[#4DE0DC]"
                        >
                          {f.labelAr}
                        </td>
                        <td className="p-3 text-xs text-[#71818A] dark:text-[#9BB1B5]">
                          <div>{f.notesTr}</div>
                          <div dir="rtl" className="font-arabic mt-1">
                            {f.notesAr}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="rounded-xl bg-[#DDF5F3]/50 dark:bg-[#132C2E] p-4 grid grid-cols-1 lg:grid-cols-2 gap-4 text-xs sm:text-sm">
                <div>
                  <strong>Tasdik & Apostil Notu:</strong> {doc.authenticationNotesTr}
                </div>
                <div dir="rtl" className="font-arabic">
                  <strong>ملاحظات التصديق والأبوستيل:</strong> {doc.authenticationNotesAr}
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
};
