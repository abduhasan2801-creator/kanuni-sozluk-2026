import React, { useEffect, useState } from 'react';
import { Bookmark, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { SpeechButton } from '../components/SpeechButton.tsx';
import { useAppPreferences } from '../context/AppPreferencesContext.tsx';
import { getFavorites, removeFavorite } from '../lib/storage.ts';
import type { LegalTerm } from '../types/legal.ts';

export const FavoritesPage: React.FC = () => {
  const { setFavoritesCount } = useAppPreferences();
  const [items, setItems] = useState<LegalTerm[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    const list = await getFavorites();
    setItems(list);
    setFavoritesCount(list.length);
    setLoading(false);
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleRemove = async (id: string) => {
    await removeFavorite(id);
    await load();
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-[#007F80] dark:text-[#4DE0DC]">
            <Bookmark className="w-4 h-4" />
            <span>ÇEVRİMDIŞI ERİŞİLEBİLİR KAYITLAR</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#172B35] dark:text-[#F0F7F7] mt-1">
            Sık Kullanılan Hukuki Terimler ({items.length})
          </h1>
        </div>
        <span dir="rtl" className="text-sm font-bold font-arabic text-[#007F80] dark:text-[#4DE0DC]">
          المصطلحات المحفوظة في المفضلة
        </span>
      </div>

      {loading ? null : items.length === 0 ? (
        <div className="rounded-2xl bg-white dark:bg-[#0F1C21] border border-[#D7E9E8] dark:border-[#1D363D] p-10 text-center space-y-3">
          <p className="text-sm text-[#71818A] dark:text-[#8BA4AE]">
            Henüz sık kullanılanlara eklediğiniz bir hukuk terimi bulunmuyor.
          </p>
          <Link
            to="/search"
            className="inline-flex px-4 py-2 rounded-xl bg-[#009F9D] text-white text-xs font-bold"
          >
            Terim Ara
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((term) => (
            <div
              key={term.id}
              className="rounded-2xl bg-white dark:bg-[#0F1C21] border border-[#D7E9E8] dark:border-[#1D363D] p-4 sm:p-5 flex flex-wrap items-center justify-between gap-4"
            >
              <Link to={`/term/${term.id}`} className="flex-1 min-w-[220px] space-y-1">
                <div className="flex flex-wrap items-baseline gap-3">
                  <span className="text-base font-bold text-[#172B35] dark:text-[#F0F7F7] hover:text-[#009F9D]">
                    {term.turkishTerm}
                  </span>
                  <span dir="rtl" className="text-base font-bold font-arabic text-[#007F80] dark:text-[#4DE0DC]">
                    {term.arabicTerm}
                  </span>
                </div>
                <p className="text-xs text-[#71818A] dark:text-[#8BA4AE] line-clamp-1">
                  {term.turkishDefinition}
                </p>
              </Link>

              <div className="flex items-center gap-2 shrink-0">
                <SpeechButton text={term.turkishTerm} lang="tr" idKey={`fav-tr-${term.id}`} compact />
                <SpeechButton text={term.arabicTerm} lang="ar" idKey={`fav-ar-${term.id}`} compact />
                <button
                  type="button"
                  onClick={() => handleRemove(term.id)}
                  aria-label="Kaldır"
                  className="min-w-[40px] min-h-[40px] rounded-xl border border-[#D7E9E8] dark:border-[#1D363D] flex items-center justify-center text-[#71818A] hover:text-[#D94F4F] cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
