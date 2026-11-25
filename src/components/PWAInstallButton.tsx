import React, { useState } from 'react';
import { Download, WifiOff, X } from 'lucide-react';
import { useOnlineStatus, usePWAInstall } from '../hooks/usePWA.ts';

export const PWAInstallButton: React.FC = () => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  if (isInstalled) return null;

  if (isInstallable) {
    return (
      <button
        type="button"
        onClick={install}
        className="inline-flex items-center gap-1.5 rounded-xl bg-[#009F9D] hover:bg-[#007F80] text-white px-3 py-2 text-xs font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer"
        title="Uygulamayı Yükle / تثبيت التطبيق"
      >
        <Download className="w-3.5 h-3.5 shrink-0" />
        <span className="hidden sm:inline">Uygulamayı Yükle</span>
      </button>
    );
  }

  if (isIOS) {
    return (
      <>
        <button
          type="button"
          onClick={() => setShowIOSGuide(true)}
          className="inline-flex items-center gap-1.5 rounded-xl border border-[#D7E9E8] dark:border-[#1D363D] bg-white dark:bg-[#152930] px-2.5 py-2 text-xs font-medium text-[#172B35] dark:text-[#E2F1F1] hover:border-[#009F9D] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
        >
          <Download className="w-3.5 h-3.5 text-[#009F9D]" />
          <span className="hidden sm:inline">Ana Ekrana Ekle</span>
        </button>

        {showIOSGuide && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="w-full max-w-sm rounded-2xl bg-white dark:bg-[#0F1C21] border border-[#D7E9E8] dark:border-[#1D363D] p-6 shadow-xl">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-[#172B35] dark:text-[#F0F7F7]">
                  iPhone / iPad Kurulumu
                </h3>
                <button
                  type="button"
                  onClick={() => setShowIOSGuide(false)}
                  className="p-1.5 rounded-lg text-[#71818A] hover:bg-[#F5FAFA] dark:hover:bg-[#152930]"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <p className="mt-3 text-sm text-[#71818A] dark:text-[#9BB1B5] leading-relaxed">
                1. Safari araç çubuğundaki <strong>Paylaş</strong> simgesine dokunun.
                <br />
                2. Aşağı kaydırıp <strong>Ana Ekrana Ekle</strong> seçeneğine dokunun.
              </p>
              <p className="mt-3 text-sm font-arabic text-[#172B35] dark:text-[#E2F1F1] leading-relaxed" dir="rtl">
                ١. اضغط على زر <strong>المشاركة</strong> في شريط متصفح Safari.
                <br />
                ٢. اختر <strong>إضافة إلى الشاشة الرئيسية</strong>.
              </p>
              <button
                type="button"
                onClick={() => setShowIOSGuide(false)}
                className="mt-5 w-full rounded-xl bg-[#009F9D] hover:bg-[#007F80] py-2.5 text-sm font-semibold text-white transition-colors"
              >
                Anladım / حسناً
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  return null;
};

export const OfflineIndicator: React.FC = () => {
  const isOnline = useOnlineStatus();
  if (isOnline) return null;

  return (
    <div
      role="status"
      className="fixed bottom-20 md:bottom-5 left-4 z-50 flex items-center gap-2 rounded-xl bg-[#172B35] dark:bg-[#152930] border border-[#E6B84A] px-3.5 py-2 text-xs font-medium text-white shadow-lg"
    >
      <WifiOff className="w-4 h-4 text-[#E6B84A] shrink-0" />
      <span>Çevrimdışı Mod — Önbellekteki terimler kullanılıyor · وضع عدم الاتصال</span>
    </div>
  );
};
