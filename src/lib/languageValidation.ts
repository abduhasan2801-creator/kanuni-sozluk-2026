import type { SearchDirection } from '../types/legal.ts';

export interface LanguageValidationResult {
  valid: boolean;
  hasArabic: boolean;
  hasTurkishOrLatin: boolean;
  errorMessage?: string;
}

const ARABIC_REGEX = /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/;
const TURKISH_LATIN_REGEX = /[a-zA-ZçÇğĞıİöÖşŞüÜâÂîÎûÛ]/;

export function validateSearchInput(
  rawInput: string,
  direction: SearchDirection
): LanguageValidationResult {
  const input = rawInput.trim();
  if (!input) {
    return {
      valid: false,
      hasArabic: false,
      hasTurkishOrLatin: false,
      errorMessage:
        direction === 'tr-ar'
          ? 'Lütfen aramak istediğiniz Türkçe hukuk terimini yazın.'
          : 'يرجى إدخال المصطلح القانوني باللغة العربية للبحث.',
    };
  }

  const hasArabic = ARABIC_REGEX.test(input);
  const hasTurkishOrLatin = TURKISH_LATIN_REGEX.test(input);

  if (direction === 'tr-ar') {
    if (hasArabic && hasTurkishOrLatin) {
      return {
        valid: false,
        hasArabic,
        hasTurkishOrLatin,
        errorMessage:
          'Türkçe → Arapça yönünde karma dil girişi desteklenmez. Lütfen yalnızca Türkçe karakterlerle (ç, ğ, ı, İ, ö, ş, ü dâhil) yazın.',
      };
    }
    if (hasArabic) {
      return {
        valid: false,
        hasArabic,
        hasTurkishOrLatin,
        errorMessage:
          'Türkçe → Arapça yönü seçiliyken Arapça metin girilemez. Lütfen Türkçe bir hukuk terimi yazın veya çeviri yönünü manuel olarak değiştirin.',
      };
    }
    if (!hasTurkishOrLatin) {
      return {
        valid: false,
        hasArabic,
        hasTurkishOrLatin,
        errorMessage: 'Lütfen geçerli bir Türkçe hukuk terimi veya ifadesi girin.',
      };
    }
    return { valid: true, hasArabic, hasTurkishOrLatin };
  }

  // direction === 'ar-tr'
  if (hasTurkishOrLatin && hasArabic) {
    return {
      valid: false,
      hasArabic,
      hasTurkishOrLatin,
      errorMessage:
        'لا يُسمح بإدخال نص مختلط اللغات عند اختيار اتجاه (عربي → تركي). يرجى إدخال المصطلح باللغة العربية فقط.',
    };
  }
  if (hasTurkishOrLatin) {
    return {
      valid: false,
      hasArabic,
      hasTurkishOrLatin,
      errorMessage:
        'عند اختيار اتجاه (عربي → تركي)، يُسمح بإدخال المصطلحات العربية فقط. تم رصد أحرف تركية؛ يرجى إدخال مصطلح عربي أو تغيير الاتجاه يدويًا.',
    };
  }
  if (!hasArabic) {
    return {
      valid: false,
      hasArabic,
      hasTurkishOrLatin,
      errorMessage: 'يرجى إدخال مصطلح قانوني صحيح باللغة العربية.',
    };
  }

  return { valid: true, hasArabic, hasTurkishOrLatin };
}
