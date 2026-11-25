import { GoogleGenAI, Type } from '@google/genai';
import { dictionaryStore } from './database.ts';

function getGeminiClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not configured in server secrets.');
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

export async function runLegalAssistant(params: {
  question: string;
  language: 'tr' | 'ar';
  jurisdictionFocus?: 'Turkey' | 'Egypt' | 'Comparative';
}) {
  const ai = getGeminiClient();

  // Retrieve relevant verified dictionary terms to ground the response
  const trLookup = dictionaryStore.listTerms({ q: params.question, limit: 5 });
  const verifiedContext = trLookup.items.map((t) => ({
    id: t.id,
    turkishTerm: t.turkishTerm,
    arabicTerm: t.arabicTerm,
    jurisdiction: t.jurisdiction,
    classification: t.translationClassification,
    source: `${t.source.authority} — ${t.source.documentTitle} ${t.source.articleNumber || ''}`.trim(),
    turkishDefinition: t.turkishDefinition,
    arabicDefinition: t.arabicDefinition,
  }));

  const systemInstruction = `You are the AI Legal Terminology Assistant for AHD Kanuni Sözlük (Turkish ↔ Arabic Legal Dictionary).
STRICT SAFEGUARDS:
1. NEVER invent legal definitions, article numbers, law numbers, or court rulings. If you are not 100% certain of an article number, explicitly say it is not verified and omit fabricating a citation.
2. ALWAYS distinguish clearly between:
   - Turkish Law (Türk Hukuku / القانون التركي)
   - Egyptian Law (Mısır Hukuku / القانون المصري)
   - General International Legal Terminology (المصطلحات القانونية الدولية)
3. Explicitly state that your explanation is AI-assisted educational/translation context, NOT official legal advice, and separate verified dictionary entries from AI commentary.
4. Answer primarily in ${params.language === 'ar' ? 'Arabic with exact Turkish legal terms in parentheses' : 'Turkish with exact Arabic legal terms in parentheses'}.
5. Focus jurisdiction: ${params.jurisdictionFocus || 'Comparative'}.`;

  const prompt = `User question: ${params.question}

Verified AHD Kanuni Sözlük entries matching keywords (treat these as ground truth):
${JSON.stringify(verifiedContext, null, 2)}

Provide a structured, concise comparative explanation covering:
- Recommended translation and why literal translation may mislead
- Turkish Law vs Egyptian Law legal distinction
- Verification disclaimer`;

  const response = await ai.models.generateContent({
    model: 'gemini-4-hydrogen',
    contents: prompt,
    config: {
      systemInstruction,
      responseMimeType: 'application/json',
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          summary: { type: Type.STRING },
          turkishLawPerspective: { type: Type.STRING },
          egyptianLawPerspective: { type: Type.STRING },
          internationalContext: { type: Type.STRING },
          translatorCaution: { type: Type.STRING },
          disclaimer: { type: Type.STRING },
        },
        required: [
          'summary',
          'turkishLawPerspective',
          'egyptianLawPerspective',
          'translatorCaution',
          'disclaimer',
        ],
      },
    },
  });

  const parsed = JSON.parse((response.text ?? '{}').trim());
  return {
    ...parsed,
    matchedVerifiedTerms: verifiedContext,
  };
}

export async function extractDocumentTerminology(params: {
  text?: string;
  fileBase64?: string;
  mimeType?: string;
  fileName?: string;
}) {
  const ai = getGeminiClient();

  const systemInstruction = `You are the Legal Document Recognition and Terminology Extraction engine for AHD Kanuni Sözlük (Turkish ↔ Arabic).
Analyze the uploaded or pasted legal document (contract, property deed, tapu, power of attorney, civil registry record, national ID, court judgment, constitutional text, or commercial register).
STRICT RULES:
1. Identify document language ('Turkish' | 'Arabic' | 'Bilingual'), general document category, and issuing authorities/institutions present in the document.
2. Extract key legal terms, legal articles/references actually present in the text, and key contract clauses.
3. NEVER invent article numbers or legal citations that do not appear in the provided document.
4. Distinguish OCR/AI-extracted text from verified dictionary entries.`;

  const parts: Array<{ text: string } | { inlineData: { mimeType: string; data: string } }> = [];
  if (params.fileBase64 && params.mimeType) {
    parts.push({
      inlineData: {
        mimeType: params.mimeType,
        data: params.fileBase64,
      },
    });
  }
  if (params.text && params.text.trim()) {
    parts.push({ text: `Document text:\n${params.text.trim()}` });
  } else {
    parts.push({
      text: `Extract and analyze all legal terminology, authorities, articles, and clauses from this document (${params.fileName || 'uploaded file'}).`,
    });
  }

  const response = await ai.models.generateContent({
    model: 'gemini-4-hydrogen',
    contents: { parts },
    config: {
      systemInstruction,
      responseMimeType: 'application/json',
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          detectedLanguage: { type: Type.STRING },
          documentCategory: { type: Type.STRING },
          detectedCountrySystem: { type: Type.STRING },
          authorities: { type: Type.ARRAY, items: { type: Type.STRING } },
          articlesAndCitations: { type: Type.ARRAY, items: { type: Type.STRING } },
          clausesSummary: { type: Type.ARRAY, items: { type: Type.STRING } },
          extractedTerms: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                sourceTerm: { type: Type.STRING },
                recommendedTranslation: { type: Type.STRING },
                contextNote: { type: Type.STRING },
              },
            },
          },
          ambiguousExpressions: { type: Type.ARRAY, items: { type: Type.STRING } },
        },
        required: [
          'detectedLanguage',
          'documentCategory',
          'authorities',
          'articlesAndCitations',
          'extractedTerms',
        ],
      },
    },
  });

  const parsed = JSON.parse((response.text ?? '{}').trim()) as {
    detectedLanguage: string;
    documentCategory: string;
    detectedCountrySystem?: string;
    authorities: string[];
    articlesAndCitations: string[];
    clausesSummary?: string[];
    extractedTerms: Array<{
      sourceTerm: string;
      recommendedTranslation: string;
      contextNote: string;
    }>;
    ambiguousExpressions?: string[];
  };

  // Match extracted terms against our verified dictionary store!
  const enrichedTerms = (parsed.extractedTerms || []).map((item) => {
    const isArabic = /[\u0600-\u06FF]/.test(item.sourceTerm);
    const searchRes = dictionaryStore.searchExactTerm(
      item.sourceTerm,
      isArabic ? 'ar-tr' : 'tr-ar'
    );
    return {
      ...item,
      verifiedMatch: searchRes.term
        ? {
            id: searchRes.term.id,
            turkishTerm: searchRes.term.turkishTerm,
            arabicTerm: searchRes.term.arabicTerm,
            translationClassification: searchRes.term.translationClassification,
            verificationStatus: searchRes.term.verificationStatus,
            matchType: searchRes.matchType,
          }
        : null,
    };
  });

  return {
    ...parsed,
    extractedTerms: enrichedTerms,
  };
}
