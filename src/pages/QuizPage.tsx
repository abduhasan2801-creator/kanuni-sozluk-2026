import React, { useEffect, useState } from 'react';
import {
  Award,
  CheckCircle2,
  GraduationCap,
  Loader2,
  RefreshCw,
  XCircle,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { SpeechButton } from '../components/SpeechButton.tsx';
import { getQuizProgress, saveQuizResult, type QuizProgressStats } from '../lib/storage.ts';
import type {
  DifficultyLevel,
  LegalSpecialization,
  QuizQuestion,
  SearchDirection,
} from '../types/legal.ts';

export const QuizPage: React.FC = () => {
  const [direction, setDirection] = useState<SearchDirection>('tr-ar');
  const [difficulty, setDifficulty] = useState<DifficultyLevel | 'All'>('All');
  const [specializationId, setSpecializationId] = useState('');
  const [specializations, setSpecializations] = useState<LegalSpecialization[]>([]);
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState<QuizProgressStats>(() => getQuizProgress());

  useEffect(() => {
    fetch('/api/categories')
      .then((res) => res.json())
      .then((data: LegalSpecialization[]) => setSpecializations(data))
      .catch(() => {});
  }, []);

  const loadQuiz = async () => {
    setLoading(true);
    setFinished(false);
    setCurrentIdx(0);
    setScore(0);
    setSelectedOption(null);
    try {
      const params = new URLSearchParams({
        direction,
        difficulty,
        count: '6',
      });
      if (specializationId) params.set('specializationId', specializationId);
      const res = await fetch(`/api/quiz?${params.toString()}`);
      const data = await res.json();
      setQuestions((data.questions || []) as QuizQuestion[]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadQuiz();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const currentQ = questions[currentIdx];

  const handleAnswer = (opt: string) => {
    if (selectedOption || !currentQ) return;
    setSelectedOption(opt);
    if (opt === currentQ.correctOption) {
      setScore((s) => s + 1);
    }
  };

  const handleNext = () => {
    if (currentIdx + 1 >= questions.length) {
      const updated = saveQuizResult(score, questions.length);
      setProgress(updated);
      setFinished(true);
    } else {
      setCurrentIdx((i) => i + 1);
      setSelectedOption(null);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
      {/* Header & Progress Bar */}
      <div className="rounded-2xl bg-white dark:bg-[#0F1C21] border border-[#D7E9E8] dark:border-[#1D363D] p-5 sm:p-6 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-[#007F80] dark:text-[#4DE0DC]">
              <GraduationCap className="w-4 h-4" />
              <span>DOĞRULANMIŞ HUKUK TERMİNOLOJİSİ TESTİ</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-[#172B35] dark:text-[#F0F7F7] mt-1">
              Terim Testi · اختبار المصطلحات القانونية
            </h1>
          </div>

          <div className="flex items-center gap-3 text-xs font-mono-tabular">
            <div className="px-3 py-1.5 rounded-xl bg-[#F5FAFA] dark:bg-[#112126] border border-[#D7E9E8] dark:border-[#1D363D]">
              Test: {progress.quizzesCompleted}
            </div>
            <div className="px-3 py-1.5 rounded-xl bg-[#DDF5F3] dark:bg-[#132C2E] text-[#007F80] dark:text-[#4DE0DC] font-bold">
              En Yüksek: %{progress.bestPercentage}
            </div>
          </div>
        </div>

        {/* Quiz Settings */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs pt-2 border-t border-[#D7E9E8] dark:border-[#1D363D]">
          <select
            value={direction}
            onChange={(e) => setDirection(e.target.value as SearchDirection)}
            aria-label="Test Yönü"
            className="rounded-xl border border-[#D7E9E8] dark:border-[#1D363D] bg-[#F5FAFA] dark:bg-[#112126] px-3 py-2.5"
          >
            <option value="tr-ar">Türkçe → Arapça</option>
            <option value="ar-tr">عربي → تركي</option>
          </select>

          <select
            value={difficulty}
            onChange={(e) => setDifficulty(e.target.value as DifficultyLevel | 'All')}
            aria-label="Zorluk Seviyesi"
            className="rounded-xl border border-[#D7E9E8] dark:border-[#1D363D] bg-[#F5FAFA] dark:bg-[#112126] px-3 py-2.5"
          >
            <option value="All">Tüm Seviyeler</option>
            <option value="Beginner">Başlangıç (Beginner)</option>
            <option value="Intermediate">Orta (Intermediate)</option>
            <option value="Advanced">İleri (Advanced)</option>
          </select>

          <select
            value={specializationId}
            onChange={(e) => setSpecializationId(e.target.value)}
            aria-label="Hukuk Dalı"
            className="rounded-xl border border-[#D7E9E8] dark:border-[#1D363D] bg-[#F5FAFA] dark:bg-[#112126] px-3 py-2.5"
          >
            <option value="">Tüm Hukuk Dalları</option>
            {specializations.map((s) => (
              <option key={s.id} value={s.id}>
                {s.nameTr}
              </option>
            ))}
          </select>

          <button
            type="button"
            onClick={loadQuiz}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#009F9D] hover:bg-[#007F80] text-white font-bold px-4 py-2.5 cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Yeni Test Başlat</span>
          </button>
        </div>
      </div>

      {/* Quiz Content */}
      {loading ? (
        <div className="p-12 flex justify-center">
          <Loader2 className="w-6 h-6 animate-spin text-[#009F9D]" />
        </div>
      ) : finished ? (
        <div className="rounded-2xl bg-white dark:bg-[#0F1C21] border border-[#D7E9E8] dark:border-[#1D363D] p-8 text-center space-y-4">
          <Award className="w-12 h-12 text-[#E6B84A] mx-auto" />
          <h2 className="text-2xl font-bold text-[#172B35] dark:text-[#F0F7F7]">
            Test Tamamlandı · انتهى الاختبار
          </h2>
          <p className="text-lg font-mono-tabular font-bold text-[#007F80] dark:text-[#4DE0DC]">
            Skorunuz: {score} / {questions.length} (
            {questions.length > 0 ? Math.round((score / questions.length) * 100) : 0}%)
          </p>
          <button
            type="button"
            onClick={loadQuiz}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#009F9D] hover:bg-[#007F80] text-white font-bold text-sm cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Tekrar Çöz</span>
          </button>
        </div>
      ) : currentQ ? (
        <div className="rounded-2xl bg-white dark:bg-[#0F1C21] border border-[#D7E9E8] dark:border-[#1D363D] p-6 sm:p-8 space-y-6">
          <div className="flex items-center justify-between text-xs text-[#71818A] font-mono-tabular">
            <span>
              Soru {currentIdx + 1} / {questions.length}
            </span>
            <span>
              {currentQ.difficulty} · Doğru: {score}
            </span>
          </div>

          <div className="rounded-xl bg-[#F5FAFA] dark:bg-[#112126] border border-[#D7E9E8] dark:border-[#1D363D] p-5 flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="text-xs text-[#71818A] mb-1">
                {currentQ.promptLanguage === 'tr'
                  ? 'Aşağıdaki Türkçe hukuk teriminin doğru Arapça karşılığı hangisidir?'
                  : 'ما هو المقابل القانوني التركي الصحيح للمصطلح العربي التالي؟'}
              </div>
              <div
                dir={currentQ.promptLanguage === 'ar' ? 'rtl' : 'ltr'}
                className={`text-2xl font-bold text-[#172B35] dark:text-[#F0F7F7] ${
                  currentQ.promptLanguage === 'ar' ? 'font-arabic-display' : ''
                }`}
              >
                {currentQ.promptTerm}
              </div>
            </div>
            <SpeechButton
              text={currentQ.promptTerm}
              lang={currentQ.promptLanguage}
              idKey={currentQ.id}
              label="Dinle"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {currentQ.options.map((opt) => {
              const isSelected = selectedOption === opt;
              const isCorrect = opt === currentQ.correctOption;
              let style =
                'bg-white dark:bg-[#152930] border-[#D7E9E8] dark:border-[#1D363D] hover:border-[#009F9D]';
              if (selectedOption) {
                if (isCorrect) {
                  style =
                    'bg-[#E6F7F2] dark:bg-[#0E2B24] border-[#009F9D] text-[#007F80] dark:text-[#4DE0DC]';
                } else if (isSelected) {
                  style =
                    'bg-[#FEF2F2] dark:bg-[#2C1315] border-[#D94F4F] text-[#A62828] dark:text-[#FCA5A5]';
                }
              }

              return (
                <button
                  key={opt}
                  type="button"
                  disabled={Boolean(selectedOption)}
                  onClick={() => handleAnswer(opt)}
                  dir={currentQ.promptLanguage === 'tr' ? 'rtl' : 'ltr'}
                  className={`rounded-xl border p-4 text-sm sm:text-base font-bold transition-colors flex items-center justify-between gap-3 cursor-pointer ${
                    currentQ.promptLanguage === 'tr' ? 'font-arabic text-right' : 'text-left'
                  } ${style}`}
                >
                  <span>{opt}</span>
                  {selectedOption && isCorrect && <CheckCircle2 className="w-5 h-5 shrink-0" />}
                  {selectedOption && isSelected && !isCorrect && (
                    <XCircle className="w-5 h-5 shrink-0" />
                  )}
                </button>
              );
            })}
          </div>

          {selectedOption && (
            <div className="rounded-xl bg-[#F5FAFA] dark:bg-[#112126] border border-[#D7E9E8] dark:border-[#1D363D] p-4 space-y-3">
              <div className="text-xs font-bold text-[#007F80] dark:text-[#4DE0DC]">
                Doğrulanmış Hukuki Açıklama · {currentQ.sourceTitle}
              </div>
              <p className="text-xs sm:text-sm text-[#172B35] dark:text-[#E2F1F1]">
                {currentQ.explanationTr}
              </p>
              <p dir="rtl" className="text-xs sm:text-sm font-arabic text-[#71818A] dark:text-[#9BB1B5]">
                {currentQ.explanationAr}
              </p>
              <div className="flex items-center justify-between pt-2">
                <Link
                  to={`/term/${currentQ.termId}`}
                  className="text-xs font-bold text-[#009F9D] hover:underline"
                >
                  Terim Kartını İncele →
                </Link>
                <button
                  type="button"
                  onClick={handleNext}
                  className="px-5 py-2 rounded-xl bg-[#009F9D] hover:bg-[#007F80] text-white font-bold text-xs cursor-pointer"
                >
                  {currentIdx + 1 >= questions.length ? 'Sonucu Gör' : 'Sonraki Soru →'}
                </button>
              </div>
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
};
