import React, { useEffect, useState } from 'react';
import { History, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import {
  clearSearchHistory,
  deleteSearchHistoryItem,
  getSearchHistory,
} from '../lib/storage.ts';
import type { SearchHistoryItem } from '../types/legal.ts';

export const HistoryPage: React.FC = () => {
  const [items, setItems] = useState<SearchHistoryItem[]>([]);

  const load = async () => {
    const list = await getSearchHistory();
    setItems(list);
  };

  useEffect(() => {
    load();
  }, []);

  const handleDelete = async (id: string) => {
    await deleteSearchHistoryItem(id);
    await load();
  };

  const handleClear = async () => {
    await clearSearchHistory();
    await load();
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-[#007F80] dark:text-[#4DE0DC]">
            <History className="w-4 h-4" />
            <span>ARAMA GEÇMİŞİ</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#172B35] dark:text-[#F0F7F7] mt-1">
            Son Hukuki Aramalar ({items.length})
          </h1>
        </div>
        {items.length > 0 && (
          <button
            type="button"
            onClick={handleClear}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-[#D7E9E8] dark:border-[#1D363D] text-xs font-semibold text-[#A62828] dark:text-[#FCA5A5] hover:bg-[#FEF2F2] dark:hover:bg-[#2C1315] cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Tümünü Temizle</span>
          </button>
        )}
      </div>

      {items.length === 0 ? (
        <div className="rounded-2xl bg-white dark:bg-[#0F1C21] border border-[#D7E9E8] dark:border-[#1D363D] p-10 text-center text-sm text-[#71818A]">
          Henüz bir arama geçmişiniz bulunmuyor.
        </div>
      ) : (
        <div className="space-y-2.5">
          {items.map((item) => (
            <div
              key={item.id}
              className="rounded-2xl bg-white dark:bg-[#0F1C21] border border-[#D7E9E8] dark:border-[#1D363D] p-4 flex flex-wrap items-center justify-between gap-3"
            >
              <div className="space-y-1 min-w-[200px]">
                <div className="flex items-center gap-2 text-xs text-[#71818A]">
                  <span className="font-mono-tabular font-semibold text-[#007F80] dark:text-[#4DE0DC]">
                    {item.direction === 'tr-ar' ? 'TR → AR' : 'AR → TR'}
                  </span>
                  <span>·</span>
                  <span className="font-mono-tabular">
                    {new Date(item.timestamp).toLocaleString('tr-TR')}
                  </span>
                </div>
                {item.termId ? (
                  <Link
                    to={`/term/${item.termId}`}
                    className="block text-sm font-bold text-[#172B35] dark:text-[#F0F7F7] hover:text-[#009F9D]"
                  >
                    {item.matchedTurkish} ↔{' '}
                    <span className="font-arabic text-[#007F80] dark:text-[#4DE0DC]">
                      {item.matchedArabic}
                    </span>
                  </Link>
                ) : (
                  <div className="text-sm font-semibold text-[#71818A]">
                    {item.query} (Bulunamadı)
                  </div>
                )}
              </div>

              <button
                type="button"
                onClick={() => handleDelete(item.id)}
                aria-label="Kaydı Sil"
                className="min-w-[38px] min-h-[38px] rounded-xl border border-[#D7E9E8] dark:border-[#1D363D] flex items-center justify-center text-[#71818A] hover:text-[#D94F4F] cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
