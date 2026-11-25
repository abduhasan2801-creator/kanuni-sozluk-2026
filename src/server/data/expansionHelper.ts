import type {
  DifficultyLevel,
  JurisdictionType,
  LegalTerm,
  LegislativeClassification,
  TranslationClassification,
  VerificationStatus,
} from '../../types/legal.ts';

export interface CompactTermSpec {
  id: string;
  tr: string;
  ar: string;
  specializationId: string;
  secondarySpecializationIds?: string[];
  mainCategory: string;
  subcategory: string;
  defTr: string;
  defAr: string;
  synonyms: string[];
  contextTr: string;
  contextAr: string;
  egyptianEquivalent: string;
  turkishEquivalent: string;
  authority: string;
  documentTitle: string;
  lawNumber?: string;
  sourceUrl?: string;
  notesTr: string;
  notesAr: string;
  jurisdiction?: JurisdictionType;
  legislativeClassification?: LegislativeClassification;
  translationClassification?: TranslationClassification;
  verificationStatus?: VerificationStatus;
  difficulty?: DifficultyLevel;
  relatedTerms?: string[];
  confusableTerms?: string[];
  meaningDiff?: string;
  legalEffectsDiff?: string;
  proceduralDiff?: string;
  commonMistakes?: string[];
  documentTypes?: string[];
}

export function buildExpandedTerm(spec: CompactTermSpec): LegalTerm {
  const today = '2026-11-25';
  const verificationStatus: VerificationStatus = spec.verificationStatus || 'Source Referenced';
  const jurisdiction: JurisdictionType = spec.jurisdiction || 'Comparative Law';

  return {
    id: spec.id,
    turkishTerm: spec.tr,
    arabicTerm: spec.ar,
    turkishDefinition: spec.defTr,
    arabicDefinition: spec.defAr,
    turkishExamples: [
      {
        tr: `${spec.tr} kavramı, ${spec.documentTitle} çerçevesinde hukuki sonuç doğurur.`,
        ar: `يترتب على مفهوم (${spec.ar}) آثار قانونية وفقًا لأحكام ${spec.documentTitle}.`,
      },
    ],
    arabicExamples: [],
    specializationId: spec.specializationId,
    secondarySpecializationIds: spec.secondarySpecializationIds,
    mainCategory: spec.mainCategory,
    subcategory: spec.subcategory,
    egyptianEquivalent: spec.egyptianEquivalent,
    turkishEquivalent: spec.turkishEquivalent,
    documentTypes: spec.documentTypes || ['Legislation', 'Judicial & Official Texts'],
    issuingAuthority: spec.authority,
    jurisdiction,
    legislativeClassification:
      spec.legislativeClassification || 'Turkish Legislative Term',
    translationClassification:
      spec.translationClassification || 'Functional Legal Equivalent',
    verificationStatus,
    editorialStage:
      verificationStatus === 'Pending Legal Verification'
        ? 'Comparative legal analysis'
        : 'Official source verification',
    legalStatus: 'Current',
    legalContext: {
      tr: spec.contextTr,
      ar: spec.contextAr,
    },
    comparativeAnalysis: {
      originDefinition: spec.defTr,
      targetConcept: `${spec.egyptianEquivalent} — ${spec.defAr}`,
      meaningDifferences:
        spec.meaningDiff ||
        `Türk hukukundaki "${spec.tr}" kavramı ile Mısır hukukundaki "${spec.egyptianEquivalent}" karşılığı arasındaki kavramsal kapsam ve uygulama farkları dikkate alınmalıdır.`,
      legalEffectsDifferences:
        spec.legalEffectsDiff ||
        `Her iki sistemde doğurduğu hukuki sonuçlar ilgili ulusal mevzuata tabidir.`,
      proceduralDifferences:
        spec.proceduralDiff ||
        `Yetkili merci ve usul kuralları Türkiye ve Mısır mevzuatına göre farklılık gösterebilir.`,
      recommendedTranslation: spec.ar,
      alternativeTranslations: spec.synonyms.filter((s) => /[\u0600-\u06FF]/.test(s)),
      commonMistakes: spec.commonMistakes || [],
    },
    translatorNotes: {
      tr: spec.notesTr,
      ar: spec.notesAr,
    },
    relatedTerms: spec.relatedTerms || [],
    confusableTerms: spec.confusableTerms || [],
    synonyms: spec.synonyms,
    source: {
      authority: spec.authority,
      documentTitle: spec.documentTitle,
      lawNumber: spec.lawNumber,
      url: spec.sourceUrl,
      jurisdiction,
      verificationDate: today,
      status: 'Current',
    },
    lastVerifiedDate: today,
    lastUpdatedDate: today,
    searchCount: 0,
    difficulty: spec.difficulty || 'Intermediate',
    revisions: [
      {
        version: 1,
        editedAt: `${today}T00:00:00.000Z`,
        editedBy: 'AHD Legal Editorial Board',
        changeNote: 'Added in 13-category Turkish-Arabic legal database expansion',
        stage:
          verificationStatus === 'Pending Legal Verification'
            ? 'Comparative legal analysis'
            : 'Official source verification',
      },
    ],
  };
}
