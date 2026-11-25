import React, { useState } from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  FileSearch,
  Loader2,
  Upload,
} from 'lucide-react';
import { Link } from 'react-router-dom';

interface ExtractedTerm {
  sourceTerm: string;
  recommendedTranslation: string;
  contextNote: string;
  verifiedMatch: {
    id: string;
    turkishTerm: string;
    arabicTerm: string;
    translationClassification: string;
    verificationStatus: string;
    matchType: string;
  } | null;
}

interface DocumentExtractionResult {
  detectedLanguage: string;
  documentCategory: string;
  detectedCountrySystem?: string;
  authorities: string[];
  articlesAndCitations: string[];
  clausesSummary?: string[];
  extractedTerms: ExtractedTerm[];
  ambiguousExpressions?: string[];
}

export const DocumentTranslatorPage: React.FC = () => {
  const [text, setText] = useState('');
  const [fileInfo, setFileInfo] = useState<{
    name: string;
    mimeType: string;
    base64: string;
  } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<DocumentExtractionResult | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 6 * 1024 * 1024) {
      setError('Dosya boyutu en fazla 6 MB olabilir.');
      return;
    }

    setError(null);
    if (file.type === 'text/plain') {
      const reader = new FileReader();
      reader.onload = () => {
        setText(String(reader.result || ''));
        setFileInfo(null);
      };
      reader.readAsText(file);
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = String(reader.result || '');
      const base64 = dataUrl.includes(',') ? dataUrl.split(',')[1] : dataUrl;
      setFileInfo({
        name: file.name,
        mimeType: file.type || 'application/octet-stream',
        base64,
      });
    };
    reader.readAsDataURL(file);
  };

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim() && !fileInfo) {
      setError('Lütfen analiz edilecek belge metnini yapıştırın veya PDF/görsel yükleyin.');
      return;
    }
    setError(null);
    setLoading(true);
    try {
      const res = await fetch('/api/ai/extract-document', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: text.trim() || undefined,
          fileBase64: fileInfo?.base64,
          mimeType: fileInfo?.mimeType,
          fileName: fileInfo?.name,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Belge analizi tamamlanamadı.');
      }
      setResult(data as DocumentExtractionResult);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Belge analizi sırasında hata oluştu.');
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
              <FileSearch className="w-4 h-4" />
              <span>HUKUKİ BELGE TANIMA VE TERİM ÇIKARMA MODU</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-[#172B35] dark:text-[#F0F7F7] mt-1">
              Resmî Belge & Sözleşme Terim Analizi
            </h1>
          </div>
          <p dir="rtl" className="text-sm font-bold font-arabic text-[#007F80] dark:text-[#4DE0DC]">
            تحليل العقود والوثائق القانونية واستخراج المصطلحات الموثقة
          </p>
        </div>

        <p className="text-xs sm:text-sm text-[#71818A] dark:text-[#8BA4AE]">
          Sözleşme, tapu senedi, vekâletname, kimlik veya mahkeme kararı metnini yapıştırın ya da
          görsel/PDF yükleyin. Sistem çıkarılan terimleri AHD Kanuni Sözlük’teki doğrulanmış
          karşılıklarla eşleştirir.
        </p>

        <form onSubmit={handleAnalyze} className="space-y-4">
          <textarea
            rows={6}
            value={text}
            onChange={(e) => setText(e.target.value)}
            dir="auto"
            placeholder="Türkçe veya Arapça hukuki belge metnini buraya yapıştırın... / الصق نص العقد أو الوثيقة الرسمية هنا..."
            className="w-full rounded-xl border border-[#D7E9E8] dark:border-[#1D363D] bg-[#F5FAFA] dark:bg-[#112126] p-4 text-sm text-[#172B35] dark:text-[#F0F7F7] focus:outline-none focus:border-[#009F9D]"
          />

          <div className="flex flex-wrap items-center justify-between gap-3">
            <label className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-[#D7E9E8] dark:border-[#1D363D] bg-[#F5FAFA] dark:bg-[#112126] hover:border-[#009F9D] text-xs font-semibold cursor-pointer">
              <Upload className="w-4 h-4 text-[#009F9D]" />
              <span>
                {fileInfo ? `Seçildi: ${fileInfo.name}` : 'PDF / Görsel / TXT Belge Yükle'}
              </span>
              <input
                type="file"
                accept=".txt,.pdf,image/*"
                onChange={handleFileChange}
                className="hidden"
              />
            </label>

            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-[#009F9D] hover:bg-[#007F80] text-white font-bold text-sm min-h-[44px] disabled:opacity-60 cursor-pointer"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Analiz Ediliyor...</span>
                </>
              ) : (
                <>
                  <FileSearch className="w-4 h-4" />
                  <span>Belgeyi Analiz Et</span>
                </>
              )}
            </button>
          </div>
        </form>

        {error && (
          <div className="rounded-xl bg-[#FEF2F2] dark:bg-[#2C1315] border border-[#F5C2C2] dark:border-[#5C2327] px-4 py-3 text-xs sm:text-sm text-[#A62828] dark:text-[#FCA5A5]">
            {error}
          </div>
        )}
      </div>

      {result && (
        <section className="space-y-5">
          <div className="rounded-2xl bg-[#FFF9E6] dark:bg-[#241E0F] border border-[#E6B84A]/40 p-4 flex items-start gap-2.5 text-xs text-[#7A5908] dark:text-[#F6D377]">
            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-[#E6B84A]" />
            <span>
              <strong>Doğrulama Ayrımı:</strong> Yeşil işaretli karşılıklar AHD Kanuni Sözlük
              veritabanından doğrulanmış terimlerdir. Yapay zekâ tarafından çıkarılan metin önerileri
              resmî hukuki danışmanlık yerine geçmez.
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="rounded-2xl bg-white dark:bg-[#0F1C21] border border-[#D7E9E8] dark:border-[#1D363D] p-4">
              <div className="text-xs text-[#71818A]">Belge Dili · لغة الوثيقة</div>
              <div className="text-base font-bold mt-1">{result.detectedLanguage}</div>
            </div>
            <div className="rounded-2xl bg-white dark:bg-[#0F1C21] border border-[#D7E9E8] dark:border-[#1D363D] p-4">
              <div className="text-xs text-[#71818A]">Belge Kategorisi · تصنيف الوثيقة</div>
              <div className="text-base font-bold mt-1">{result.documentCategory}</div>
            </div>
            <div className="rounded-2xl bg-white dark:bg-[#0F1C21] border border-[#D7E9E8] dark:border-[#1D363D] p-4">
              <div className="text-xs text-[#71818A]">Kurumlar · الجهات المذكورة</div>
              <div className="text-xs font-medium mt-1">
                {result.authorities.length > 0 ? result.authorities.join(', ') : 'Belirtilmemiş'}
              </div>
            </div>
          </div>

          <div className="rounded-2xl bg-white dark:bg-[#0F1C21] border border-[#D7E9E8] dark:border-[#1D363D] p-5 sm:p-6 space-y-4">
            <h2 className="text-base font-bold text-[#172B35] dark:text-[#F0F7F7]">
              Çıkarılan Hukuki Terimler ve Sözlük Eşleşmeleri ({result.extractedTerms.length})
            </h2>

            <div className="space-y-3">
              {result.extractedTerms.map((item, idx) => (
                <div
                  key={idx}
                  className="rounded-xl border border-[#D7E9E8] dark:border-[#1D363D] bg-[#F5FAFA] dark:bg-[#112126] p-4 space-y-2"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="font-bold text-sm text-[#172B35] dark:text-[#F0F7F7]" dir="auto">
                      {item.sourceTerm}
                    </div>
                    <div className="font-bold text-sm text-[#007F80] dark:text-[#4DE0DC]" dir="auto">
                      {item.recommendedTranslation}
                    </div>
                  </div>
                  <p className="text-xs text-[#71818A] dark:text-[#9BB1B5]" dir="auto">
                    {item.contextNote}
                  </p>
                  {item.verifiedMatch ? (
                    <div className="pt-2 border-t border-[#D7E9E8] dark:border-[#1D363D] flex flex-wrap items-center justify-between gap-2 text-xs">
                      <span className="inline-flex items-center gap-1.5 text-[#007F80] dark:text-[#4DE0DC] font-semibold">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>
                          AHD Doğrulanmış Eşleşme: {item.verifiedMatch.turkishTerm} ↔{' '}
                          <span className="font-arabic">{item.verifiedMatch.arabicTerm}</span>
                        </span>
                      </span>
                      <Link
                        to={`/term/${item.verifiedMatch.id}`}
                        className="font-bold text-[#009F9D] hover:underline"
                      >
                        Detayı Aç →
                      </Link>
                    </div>
                  ) : (
                    <div className="pt-1 text-[11px] text-[#71818A]">
                      Sözlükte doğrudan kayıtlı değil — YZ bağlamsal önerisi
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
};
