import React, { useState } from 'react';
import { AlertTriangle, Bot, CheckCircle2, Loader2, Send } from 'lucide-react';
import { Link } from 'react-router-dom';

interface AssistantResponse {
  summary: string;
  turkishLawPerspective: string;
  egyptianLawPerspective: string;
  internationalContext?: string;
  translatorCaution: string;
  disclaimer: string;
  matchedVerifiedTerms: Array<{
    id: string;
    turkishTerm: string;
    arabicTerm: string;
    jurisdiction: string;
    classification: string;
    source: string;
  }>;
}

export const AIAssistantPage: React.FC = () => {
  const [question, setQuestion] = useState('');
  const [language, setLanguage] = useState<'tr' | 'ar'>('tr');
  const [jurisdictionFocus, setJurisdictionFocus] = useState<'Comparative' | 'Turkey' | 'Egypt'>(
    'Comparative'
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [response, setResponse] = useState<AssistantResponse | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/ai/assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: question.trim(),
          language,
          jurisdictionFocus,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Asistan yanıt veremedi.');
      setResponse(data as AssistantResponse);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Bir hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
      <div className="rounded-2xl bg-white dark:bg-[#0F1C21] border border-[#D7E9E8] dark:border-[#1D363D] p-5 sm:p-6 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-[#007F80] dark:text-[#4DE0DC]">
              <Bot className="w-4 h-4" />
              <span>YAPAY ZEKÂ DESTEKLİ KARŞILAŞTIRMALI HUKUK ASİSTANI</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-[#172B35] dark:text-[#F0F7F7] mt-1">
              Hukuki Terminoloji & Karşılaştırmalı Açıklama Asistanı
            </h1>
          </div>
          <p dir="rtl" className="text-sm font-bold font-arabic text-[#007F80] dark:text-[#4DE0DC]">
            المساعد القانوني الذكي للترجمة المقارنة
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value as 'tr' | 'ar')}
              aria-label="Yanıt Dili"
              className="rounded-xl border border-[#D7E9E8] dark:border-[#1D363D] bg-[#F5FAFA] dark:bg-[#112126] px-3 py-2.5"
            >
              <option value="tr">Yanıt Dili: Türkçe (Arapça hukuki terimlerle)</option>
              <option value="ar">لغة الإجابة: العربية (مع المصطلحات التركية)</option>
            </select>
            <select
              value={jurisdictionFocus}
              onChange={(e) =>
                setJurisdictionFocus(e.target.value as 'Comparative' | 'Turkey' | 'Egypt')
              }
              aria-label="Odak Hukuk Sistemi"
              className="rounded-xl border border-[#D7E9E8] dark:border-[#1D363D] bg-[#F5FAFA] dark:bg-[#112126] px-3 py-2.5"
            >
              <option value="Comparative">Karşılaştırmalı (Türkiye ↔ Mısır)</option>
              <option value="Turkey">Türkiye Hukuku Odaklı</option>
              <option value="Egypt">Mısır Hukuku Odaklı</option>
            </select>
          </div>

          <div className="flex flex-col sm:flex-row gap-2.5">
            <input
              type="text"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              dir={language === 'ar' ? 'rtl' : 'ltr'}
              placeholder={
                language === 'tr'
                  ? 'Örn: Türkiye’deki Tapu Senedi ile Mısır’daki الشهر العقاري sözleşmesi arasındaki hukuki fark nedir?'
                  : 'مثال: ما الفرق القانوني بين الفسخ والبطلان في القانونين التركي والمصري؟'
              }
              className={`flex-1 rounded-xl border border-[#D7E9E8] dark:border-[#1D363D] bg-[#F5FAFA] dark:bg-[#112126] px-4 py-3 text-sm min-h-[48px] ${
                language === 'ar' ? 'font-arabic text-right' : ''
              }`}
            />
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-[#009F9D] hover:bg-[#007F80] text-white font-bold text-sm min-h-[48px] disabled:opacity-60 cursor-pointer"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              <span>Açıkla</span>
            </button>
          </div>
        </form>

        {error && (
          <div className="rounded-xl bg-[#FEF2F2] dark:bg-[#2C1315] border border-[#F5C2C2] dark:border-[#5C2327] px-4 py-3 text-xs sm:text-sm text-[#A62828] dark:text-[#FCA5A5]">
            {error}
          </div>
        )}
      </div>

      {response && (
        <div className="space-y-5">
          {response.matchedVerifiedTerms.length > 0 && (
            <section className="rounded-2xl bg-white dark:bg-[#0F1C21] border border-[#D7E9E8] dark:border-[#1D363D] p-5 space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-[#007F80] dark:text-[#4DE0DC]">
                <CheckCircle2 className="w-4 h-4" />
                <span>Sözlükte Doğrulanmış İlgili Kayıtlar (Resmî Veri)</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {response.matchedVerifiedTerms.map((t) => (
                  <Link
                    key={t.id}
                    to={`/term/${t.id}`}
                    className="rounded-xl bg-[#F5FAFA] dark:bg-[#112126] border border-[#D7E9E8] dark:border-[#1D363D] hover:border-[#009F9D] p-3.5 text-xs space-y-1"
                  >
                    <div className="font-bold text-[#172B35] dark:text-[#F0F7F7]">
                      {t.turkishTerm} ↔ <span className="font-arabic text-[#007F80]">{t.arabicTerm}</span>
                    </div>
                    <div className="text-[#71818A]">{t.source}</div>
                  </Link>
                ))}
              </div>
            </section>
          )}

          <section
            dir="auto"
            className="rounded-2xl bg-white dark:bg-[#0F1C21] border border-[#D7E9E8] dark:border-[#1D363D] p-6 space-y-5 text-sm leading-relaxed"
          >
            <div>
              <h2 className="text-xs font-bold text-[#007F80] dark:text-[#4DE0DC] mb-1">
                Özet Değerlendirme · الخلاصة (AI Terminoloji Yardımı)
              </h2>
              <p>{response.summary}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="rounded-xl bg-[#F5FAFA] dark:bg-[#112126] p-4 space-y-1">
                <div className="text-xs font-bold text-[#007F80] dark:text-[#4DE0DC]">
                  Türk Hukuku Açısından · في القانون التركي
                </div>
                <p>{response.turkishLawPerspective}</p>
              </div>
              <div className="rounded-xl bg-[#F5FAFA] dark:bg-[#112126] p-4 space-y-1">
                <div className="text-xs font-bold text-[#007F80] dark:text-[#4DE0DC]">
                  Mısır Hukuku Açısından · في القانون المصري
                </div>
                <p>{response.egyptianLawPerspective}</p>
              </div>
            </div>

            <div className="rounded-xl bg-[#DDF5F3]/50 dark:bg-[#132C2E] p-4 space-y-1">
              <div className="text-xs font-bold text-[#007F80] dark:text-[#4DE0DC]">
                Hukuk Çevirmeni İçin Uyarı · تنبيه للمترجم القانوني
              </div>
              <p>{response.translatorCaution}</p>
            </div>

            <div className="rounded-xl bg-[#FFF9E6] dark:bg-[#241E0F] border border-[#E6B84A]/40 p-4 flex items-start gap-2.5 text-xs text-[#7A5908] dark:text-[#F6D377]">
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-[#E6B84A]" />
              <span>{response.disclaimer}</span>
            </div>
          </section>
        </div>
      )}
    </div>
  );
};
