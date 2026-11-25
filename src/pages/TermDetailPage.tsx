import React, { useEffect, useState } from 'react';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { LegalTermDetailCard } from '../components/LegalTermDetailCard.tsx';
import { useAppPreferences } from '../context/AppPreferencesContext.tsx';
import { cacheTermOffline, getCachedTermOffline } from '../lib/storage.ts';
import type { LegalSpecialization, LegalTerm, SearchDirection } from '../types/legal.ts';

export const TermDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { direction, setDirection } = useAppPreferences();
  const [term, setTerm] = useState<LegalTerm | null>(null);
  const [specializations, setSpecializations] = useState<LegalSpecialization[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/categories')
      .then((res) => res.json())
      .then((data: LegalSpecialization[]) => setSpecializations(data))
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!id) return;
    let active = true;
    setLoading(true);
    setError(null);

    fetch(`/api/terms/${encodeURIComponent(id)}`)
      .then(async (res) => {
        if (!res.ok) throw new Error('Not found');
        return (await res.json()) as LegalTerm;
      })
      .then(async (data) => {
        if (!active) return;
        setTerm(data);
        await cacheTermOffline(data);
      })
      .catch(async () => {
        const offlineTerm = await getCachedTermOffline(id);
        if (!active) return;
        if (offlineTerm) {
          setTerm(offlineTerm);
        } else {
          setError('Terim bulunamadı veya çevrimdışı önbellekte yer almıyor.');
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [id]);

  const handleSelectRelated = async (text: string, targetDir: SearchDirection) => {
    setDirection(targetDir);
    try {
      const res = await fetch(
        `/api/search?q=${encodeURIComponent(text)}&direction=${encodeURIComponent(targetDir)}`
      );
      if (res.ok) {
        const data = await res.json();
        if (data?.term?.id) {
          navigate(`/term/${data.term.id}`);
          return;
        }
      }
    } catch {
      // fallback to search page
    }
    navigate('/search');
  };

  const specMatch = term
    ? specializations.find((s) => s.id === term.specializationId)
    : undefined;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-4">
      <button
        type="button"
        onClick={() => navigate(-1)}
        className="inline-flex items-center gap-2 text-xs font-semibold text-[#007F80] dark:text-[#4DE0DC] hover:underline cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Geri Dön · رجوع</span>
      </button>

      {loading ? (
        <div className="rounded-2xl bg-white dark:bg-[#0F1C21] border border-[#D7E9E8] dark:border-[#1D363D] p-12 flex items-center justify-center">
          <Loader2 className="w-6 h-6 animate-spin text-[#009F9D]" />
        </div>
      ) : error ? (
        <div className="rounded-2xl bg-white dark:bg-[#0F1C21] border border-[#D7E9E8] dark:border-[#1D363D] p-8 text-center text-sm text-[#71818A]">
          {error}
        </div>
      ) : term ? (
        <LegalTermDetailCard
          term={term}
          direction={direction}
          onSelectRelatedTerm={handleSelectRelated}
          specializationName={
            specMatch ? { tr: specMatch.nameTr, ar: specMatch.nameAr } : undefined
          }
        />
      ) : null}
    </div>
  );
};
