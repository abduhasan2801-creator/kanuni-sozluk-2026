import React, { useEffect, useState } from 'react';
import { Pause, Volume2 } from 'lucide-react';
import { speechController, type SpeechStatus } from '../lib/speech.ts';

interface SpeechButtonProps {
  text: string;
  lang: 'tr' | 'ar';
  idKey: string;
  label?: string;
  compact?: boolean;
}

export const SpeechButton: React.FC<SpeechButtonProps> = ({
  text,
  lang,
  idKey,
  label,
  compact = false,
}) => {
  const [status, setStatus] = useState<SpeechStatus>('idle');

  useEffect(() => {
    return speechController.subscribe((nextStatus, key) => {
      if (key === idKey) {
        setStatus(nextStatus);
      } else if (nextStatus === 'idle' || key !== idKey) {
        setStatus('idle');
      }
    });
  }, [idKey]);

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    speechController.toggle(text, lang, idKey);
  };

  const isSpeaking = status === 'speaking';
  const isPaused = status === 'paused';

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label={
        lang === 'tr'
          ? `Türkçe telaffuzu dinle: ${text}`
          : `استمع للنطق العربي: ${text}`
      }
      title={
        status === 'unsupported'
          ? 'Tarayıcı sesli okuma desteklemiyor'
          : isSpeaking
          ? 'Duraklat / إيقاف مؤقت'
          : lang === 'tr'
          ? 'Türkçe Dinle'
          : 'استماع بالعربية'
      }
      className={`inline-flex items-center justify-center gap-1.5 rounded-xl border transition-colors min-h-[40px] ${
        compact ? 'px-2.5 py-1.5 text-xs' : 'px-3.5 py-2 text-xs font-medium'
      } ${
        isSpeaking
          ? 'bg-[#009F9D] text-white border-[#009F9D]'
          : isPaused
          ? 'bg-[#DDF5F3] dark:bg-[#132C2E] text-[#007F80] dark:text-[#4DE0DC] border-[#009F9D]'
          : 'bg-white dark:bg-[#152930] text-[#172B35] dark:text-[#E2F1F1] border-[#D7E9E8] dark:border-[#1D363D] hover:border-[#009F9D] hover:text-[#007F80] dark:hover:text-[#4DE0DC]'
      } whitespace-nowrap shrink-0 cursor-pointer`}
    >
      {isSpeaking ? (
        <Pause className="w-4 h-4 shrink-0" />
      ) : (
        <Volume2 className="w-4 h-4 shrink-0 text-[#009F9D] dark:text-[#4DE0DC]" />
      )}
      {label && <span>{isSpeaking ? (lang === 'tr' ? 'Duraklat' : 'إيقاف مؤقت') : label}</span>}
    </button>
  );
};
