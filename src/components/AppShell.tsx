import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Bookmark,
  Bot,
  FileSearch,
  GitCompare,
  GraduationCap,
  History,
  Home,
  LayoutGrid,
  Menu,
  Moon,
  Scale,
  ScrollText,
  Search,
  Shield,
  Sun,
  X,
} from 'lucide-react';
import { useAppPreferences } from '../context/AppPreferencesContext.tsx';
import { getFavorites } from '../lib/storage.ts';
import { OfflineIndicator, PWAInstallButton } from './PWAInstallButton.tsx';

const ROUTE_LABELS: Array<{ prefix: string; label: string }> = [
  { prefix: '/search', label: 'Gelişmiş Arama' },
  { prefix: '/categories', label: 'Hukuk Dalları' },
  { prefix: '/distinctions', label: 'Hukuki Farklar' },
  { prefix: '/legislation', label: 'Anayasa & Belgeler' },
  { prefix: '/document-translator', label: 'Belge Çeviri Modu' },
  { prefix: '/quiz', label: 'Terim Testi' },
  { prefix: '/ai-assistant', label: 'Hukuk Asistanı' },
  { prefix: '/favorites', label: 'Sık Kullanılanlar' },
  { prefix: '/history', label: 'Arama Geçmişi' },
  { prefix: '/admin', label: 'Yönetim Paneli' },
  { prefix: '/term', label: 'Terim Detayı' },
  { prefix: '/', label: 'Ana Sayfa' },
];

export const TurkishFlagIcon: React.FC<{ className?: string }> = ({ className = 'w-5 h-3.5' }) => (
  <svg
    viewBox="0 0 30 20"
    className={`${className} rounded-[2px] border border-black/10 shrink-0`}
    aria-label="Türkiye"
  >
    <rect width="30" height="20" fill="#E30A17" />
    <circle cx="11.5" cy="10" r="5" fill="#FFFFFF" />
    <circle cx="12.7" cy="10" r="4" fill="#E30A17" />
    <polygon
      points="17,10 19.6,10.8 18,8.6 18,11.4 19.6,9.2"
      fill="#FFFFFF"
    />
  </svg>
);

export const EgyptFlagIcon: React.FC<{ className?: string }> = ({ className = 'w-5 h-3.5' }) => (
  <svg
    viewBox="0 0 30 20"
    className={`${className} rounded-[2px] border border-black/10 shrink-0`}
    aria-label="Mısır"
  >
    <rect width="30" height="6.67" y="0" fill="#CE1126" />
    <rect width="30" height="6.67" y="6.67" fill="#FFFFFF" />
    <rect width="30" height="6.67" y="13.33" fill="#000000" />
    <circle cx="15" cy="10" r="1.7" fill="#C09300" />
  </svg>
);

export const AppShell: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { theme, toggleTheme, favoritesCount, setFavoritesCount } = useAppPreferences();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    getFavorites().then((list) => setFavoritesCount(list.length));
  }, [setFavoritesCount]);

  useEffect(() => {
    setDrawerOpen(false);
  }, [location.pathname]);

  const currentLabel =
    ROUTE_LABELS.find((r) =>
      r.prefix === '/' ? location.pathname === '/' : location.pathname.startsWith(r.prefix)
    )?.label || 'Ana Sayfa';

  const isActive = (path: string) =>
    path === '/' ? location.pathname === '/' : location.pathname.startsWith(path);

  const navItems = [
    { to: '/', labelTr: 'Ana Sayfa', labelAr: 'الرئيسية', icon: Home },
    { to: '/search', labelTr: 'Hukuki Arama', labelAr: 'البحث القانوني', icon: Search },
    { to: '/categories', labelTr: 'Pano · Hukuk Dalları', labelAr: 'التخصصات القانونية', icon: LayoutGrid },
    { to: '/distinctions', labelTr: 'Hukuki Terimler Arasındaki Farklar', labelAr: 'الفروق بين المصطلحات', icon: GitCompare },
    { to: '/legislation', labelTr: 'Anayasalar, Mevzuat & Kimlikler', labelAr: 'الدساتير والوثائق الرسمية', icon: ScrollText },
    { to: '/document-translator', labelTr: 'Resmî Belge Çeviri & Analiz Modu', labelAr: 'وضع ترجمة وتحليل الوثائق', icon: FileSearch },
    { to: '/quiz', labelTr: 'Terim Testi', labelAr: 'اختبار المصطلحات', icon: GraduationCap },
    { to: '/ai-assistant', labelTr: 'Yapay Zekâ Hukuk Asistanı', labelAr: 'المساعد القانوني الذكي', icon: Bot },
    { to: '/favorites', labelTr: 'Sık Kullanılanlar', labelAr: 'المفضلة', icon: Bookmark },
    { to: '/history', labelTr: 'Arama Geçmişi', labelAr: 'سجل البحث', icon: History },
    { to: '/admin', labelTr: 'Yönetim Paneli (Admin)', labelAr: 'لوحة الإدارة والتحرير', icon: Shield },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-[#F5FAFA] dark:bg-[#0B1418] text-[#172B35] dark:text-[#F0F7F7]">
      {/* Sticky Top Header (Preserving AHD Dictionary Header Layout) */}
      <header className="sticky top-0 z-40 bg-white/95 dark:bg-[#0F1C21]/95 backdrop-blur-md border-b border-[#D7E9E8] dark:border-[#1D363D]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-4">
          {/* Left: Hamburger + Current Label */}
          <div className="flex items-center gap-3 min-w-0">
            <button
              type="button"
              onClick={() => setDrawerOpen(true)}
              aria-label="Menüyü Aç"
              className="min-w-[40px] min-h-[40px] flex items-center justify-center rounded-xl text-[#172B35] dark:text-[#F0F7F7] hover:bg-[#DDF5F3]/60 dark:hover:bg-[#152930] transition-colors cursor-pointer"
            >
              <Menu className="w-5 h-5" />
            </button>
            <Link
              to="/"
              className="text-sm font-semibold text-[#172B35] dark:text-[#F0F7F7] whitespace-nowrap truncate"
            >
              {currentLabel}
            </Link>
          </div>

          {/* Center / Brand: Turkish Flag + AHD Kanuni Sözlük */}
          <Link
            to="/"
            className="flex items-center gap-2.5 whitespace-nowrap shrink-0"
          >
            <TurkishFlagIcon className="w-5 h-3.5" />
            <div className="flex items-center gap-1.5">
              <span className="inline-flex items-center justify-center w-6 h-6 rounded-lg bg-[#009F9D] text-white font-bold text-xs">
                <Scale className="w-3.5 h-3.5" />
              </span>
              <span className="text-base font-extrabold tracking-tight text-[#172B35] dark:text-[#F0F7F7]">
                AHD <span className="text-[#009F9D]">Kanuni Sözlük</span>
              </span>
            </div>
          </Link>

          {/* Right: Smart AI Assistant + Theme Toggle + PWA Install */}
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              onClick={() => navigate('/ai-assistant')}
              title="Yapay Zekâ Hukuk Asistanı / المساعد القانوني الذكي"
              aria-label="Hukuk Asistanı"
              className="min-w-[40px] min-h-[40px] flex items-center justify-center rounded-xl text-[#007F80] dark:text-[#4DE0DC] hover:bg-[#DDF5F3]/70 dark:hover:bg-[#152930] transition-colors cursor-pointer"
            >
              <Bot className="w-5 h-5" />
            </button>

            <button
              type="button"
              onClick={toggleTheme}
              aria-label={theme === 'dark' ? 'Açık Tema' : 'Koyu Tema'}
              title={theme === 'dark' ? 'Açık Tema / الوضع النهاري' : 'Koyu Tema / الوضع الليلي'}
              className="min-w-[40px] min-h-[40px] flex items-center justify-center rounded-xl text-[#172B35] dark:text-[#F0F7F7] hover:bg-[#DDF5F3]/70 dark:hover:bg-[#152930] transition-colors cursor-pointer"
            >
              {theme === 'dark' ? <Sun className="w-5 h-5 text-[#E6B84A]" /> : <Moon className="w-5 h-5" />}
            </button>

            <PWAInstallButton />
          </div>
        </div>
      </header>

      {/* Hamburger Slide-Over Navigation Drawer */}
      {drawerOpen && (
        <div className="fixed inset-0 z-50 flex">
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-xs"
            onClick={() => setDrawerOpen(false)}
          />
          <aside className="relative z-10 w-80 max-w-[85vw] bg-white dark:bg-[#0F1C21] border-r border-[#D7E9E8] dark:border-[#1D363D] h-full flex flex-col shadow-2xl">
            <div className="p-5 border-b border-[#D7E9E8] dark:border-[#1D363D] flex items-center justify-between bg-[#F5FAFA] dark:bg-[#112126]">
              <div>
                <div className="text-base font-extrabold text-[#172B35] dark:text-[#F0F7F7]">
                  AHD <span className="text-[#009F9D]">Kanuni Sözlük</span>
                </div>
                <div className="text-xs font-arabic text-[#71818A] dark:text-[#8BA4AE]">
                  معجم AHD القانوني التركي العربي
                </div>
              </div>
              <button
                type="button"
                onClick={() => setDrawerOpen(false)}
                aria-label="Menüyü Kapat"
                className="min-w-[40px] min-h-[40px] flex items-center justify-center rounded-xl text-[#71818A] hover:bg-white dark:hover:bg-[#152930] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <nav className="flex-1 overflow-y-auto p-3 space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.to);
                return (
                  <Link
                    key={item.to}
                    to={item.to}
                    className={`flex items-center justify-between gap-3 px-3.5 py-2.5 rounded-xl transition-colors ${
                      active
                        ? 'bg-[#DDF5F3] dark:bg-[#132C2E] text-[#007F80] dark:text-[#4DE0DC] font-semibold'
                        : 'text-[#172B35] dark:text-[#E2F1F1] hover:bg-[#F5FAFA] dark:hover:bg-[#152930]'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <Icon className="w-4 h-4 shrink-0 text-[#009F9D]" />
                      <div className="min-w-0">
                        <div className="text-sm truncate">{item.labelTr}</div>
                        <div className="text-[11px] font-arabic text-[#71818A] dark:text-[#8BA4AE] truncate">
                          {item.labelAr}
                        </div>
                      </div>
                    </div>
                    {item.to === '/favorites' && favoritesCount > 0 && (
                      <span className="text-xs font-mono-tabular font-semibold text-[#007F80] dark:text-[#4DE0DC]">
                        {favoritesCount}
                      </span>
                    )}
                  </Link>
                );
              })}
            </nav>

            <div className="p-4 border-t border-[#D7E9E8] dark:border-[#1D363D] text-[11px] text-[#71818A] dark:text-[#8BA4AE]">
              Türkçe–Arapça Kapsamlı Hukuk Sözlüğü · Türkiye & Mısır Hukuku Karşılaştırmalı Referansı
            </div>
          </aside>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 pb-24">{children}</main>

      <OfflineIndicator />

      {/* Bottom Navigation Bar (5 Destinations with Central Prominent Search Button) */}
      <nav
        aria-label="Alt Gezinme Çubuğu"
        className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-[#0F1C21]/95 backdrop-blur-md border-t border-[#D7E9E8] dark:border-[#1D363D]"
      >
        <div className="max-w-2xl mx-auto px-2 h-16 grid grid-cols-5 items-center">
          <Link
            to="/"
            className={`flex flex-col items-center justify-center min-h-[44px] text-[11px] font-medium transition-colors ${
              isActive('/')
                ? 'text-[#009F9D] dark:text-[#4DE0DC] font-semibold'
                : 'text-[#71818A] dark:text-[#8BA4AE] hover:text-[#172B35] dark:hover:text-[#F0F7F7]'
            }`}
          >
            <Home className="w-5 h-5 mb-0.5" />
            <span className="whitespace-nowrap">Ana Sayfa</span>
          </Link>

          <Link
            to="/categories"
            className={`flex flex-col items-center justify-center min-h-[44px] text-[11px] font-medium transition-colors ${
              isActive('/categories')
                ? 'text-[#009F9D] dark:text-[#4DE0DC] font-semibold'
                : 'text-[#71818A] dark:text-[#8BA4AE] hover:text-[#172B35] dark:hover:text-[#F0F7F7]'
            }`}
          >
            <LayoutGrid className="w-5 h-5 mb-0.5" />
            <span className="whitespace-nowrap">Pano</span>
          </Link>

          {/* Central Prominent Search Button */}
          <div className="flex items-center justify-center -mt-4">
            <button
              type="button"
              onClick={() => navigate('/search')}
              aria-label="Hukuki Terim Ara"
              className={`w-13 h-13 rounded-full flex items-center justify-center shadow-md transition-transform active:scale-95 cursor-pointer border-4 border-[#F5FAFA] dark:border-[#0B1418] ${
                isActive('/search')
                  ? 'bg-[#007F80] text-white'
                  : 'bg-[#009F9D] hover:bg-[#007F80] text-white'
              }`}
            >
              <Search className="w-6 h-6" />
            </button>
          </div>

          <Link
            to="/favorites"
            className={`flex flex-col items-center justify-center min-h-[44px] text-[11px] font-medium transition-colors ${
              isActive('/favorites')
                ? 'text-[#009F9D] dark:text-[#4DE0DC] font-semibold'
                : 'text-[#71818A] dark:text-[#8BA4AE] hover:text-[#172B35] dark:hover:text-[#F0F7F7]'
            }`}
          >
            <Bookmark className="w-5 h-5 mb-0.5" />
            <span className="whitespace-nowrap">Sık Kullanılan</span>
          </Link>

          <Link
            to="/history"
            className={`flex flex-col items-center justify-center min-h-[44px] text-[11px] font-medium transition-colors ${
              isActive('/history')
                ? 'text-[#009F9D] dark:text-[#4DE0DC] font-semibold'
                : 'text-[#71818A] dark:text-[#8BA4AE] hover:text-[#172B35] dark:hover:text-[#F0F7F7]'
            }`}
          >
            <History className="w-5 h-5 mb-0.5" />
            <span className="whitespace-nowrap">Geçmiş</span>
          </Link>
        </div>
      </nav>
    </div>
  );
};
