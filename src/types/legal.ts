export type SearchDirection = 'tr-ar' | 'ar-tr';

export type JurisdictionType =
  | 'Turkish Law'
  | 'Egyptian Law'
  | 'Comparative Law'
  | 'International Law'
  | 'General Legal Terminology';

export type LegislativeClassification =
  | 'Turkish Legislative Term'
  | 'Egyptian Legislative Term'
  | 'Turkish Official Administrative Term'
  | 'Egyptian Official Administrative Term'
  | 'International Legal Term'
  | 'International Treaty Terminology';

export type TranslationClassification =
  | 'Exact Legal Equivalent'
  | 'Functional Legal Equivalent'
  | 'Contextual Equivalent'
  | 'Explanatory Translation'
  | 'Descriptive Translation'
  | 'No Direct Equivalent'
  | 'Borrowed Legal Term'
  | 'Historical Legal Term'
  | 'Deprecated Term';

export type VerificationStatus =
  | 'Officially Verified'
  | 'Source Referenced'
  | 'Legally Reviewed'
  | 'Linguistically Reviewed'
  | 'Expert Reviewed'
  | 'Pending Verification'
  | 'Pending Legal Verification'
  | 'Disputed Translation'
  | 'Historical Reference';

export type LegalStatus = 'Current' | 'Amended' | 'Repealed' | 'Historical';

export type DifficultyLevel = 'Beginner' | 'Intermediate' | 'Advanced';

export type EditorialStage =
  | 'Term collection'
  | 'Linguistic verification'
  | 'Legal definition verification'
  | 'Comparative legal analysis'
  | 'Translation equivalence assessment'
  | 'Official source verification'
  | 'Expert review'
  | 'Publication';

export interface ExampleSentence {
  tr: string;
  ar: string;
  context?: string;
}

export interface LegalSourceReference {
  authority: string;
  documentTitle: string;
  lawNumber?: string;
  articleNumber?: string;
  paragraph?: string;
  publicationDate?: string;
  amendmentDate?: string;
  url?: string;
  jurisdiction: JurisdictionType;
  verificationDate: string;
  status: LegalStatus;
}

export interface ComparativeAnalysis {
  originDefinition: string;
  targetConcept: string;
  meaningDifferences: string;
  legalEffectsDifferences: string;
  proceduralDifferences: string;
  recommendedTranslation: string;
  alternativeTranslations: string[];
  commonMistakes: string[];
}

export interface TermRevision {
  version: number;
  editedAt: string;
  editedBy: string;
  changeNote: string;
  stage: EditorialStage;
}

export interface LegalTerm {
  id: string;
  turkishTerm: string;
  arabicTerm: string;
  turkishPronunciation?: string;
  arabicPronunciation?: string;
  turkishDefinition: string;
  arabicDefinition: string;
  turkishExamples: ExampleSentence[];
  arabicExamples: ExampleSentence[];
  specializationId: string;
  secondarySpecializationIds?: string[];
  mainCategory?: string;
  subcategory?: string;
  egyptianEquivalent?: string;
  turkishEquivalent?: string;
  documentTypes: string[];
  contractType?: string;
  issuingAuthority?: string;
  jurisdiction: JurisdictionType;
  legislativeClassification: LegislativeClassification;
  translationClassification: TranslationClassification;
  verificationStatus: VerificationStatus;
  editorialStage: EditorialStage;
  legalStatus: LegalStatus;
  legalContext: {
    tr: string;
    ar: string;
  };
  comparativeAnalysis: ComparativeAnalysis;
  translatorNotes: {
    tr: string;
    ar: string;
  };
  relatedTerms: string[];
  confusableTerms: string[];
  synonyms: string[];
  source: LegalSourceReference;
  lastVerifiedDate: string;
  lastUpdatedDate: string;
  searchCount: number;
  isMonthlyFeatured?: boolean;
  monthlyFeaturedPeriod?: string;
  difficulty: DifficultyLevel;
  revisions: TermRevision[];
}

export interface LegalSubcategory {
  id: string;
  nameTr: string;
  nameAr: string;
}

export interface LegalSpecialization {
  id: string;
  nameEn: string;
  nameTr: string;
  nameAr: string;
  descriptionTr: string;
  descriptionAr: string;
  priorityGroup: 'core' | 'specialized';
  subcategories?: LegalSubcategory[];
}

export interface LegalDistinction {
  id: string;
  groupId: 'contracts' | 'real-estate' | 'notarial' | 'judicial';
  groupTitleTr: string;
  groupTitleAr: string;
  termA: {
    tr: string;
    ar: string;
    definitionTr: string;
    definitionAr: string;
  };
  termB: {
    tr: string;
    ar: string;
    definitionTr: string;
    definitionAr: string;
  };
  mainDifferenceTr: string;
  mainDifferenceAr: string;
  legalConsequencesTr: string;
  legalConsequencesAr: string;
  correctUsageTr: string;
  correctUsageAr: string;
  exampleTr: string;
  exampleAr: string;
  translationWarningTr: string;
  translationWarningAr: string;
  sourceLabel: string;
  jurisdiction: JurisdictionType;
}

export interface ConstitutionalProvision {
  id: string;
  country: 'Turkey' | 'Egypt';
  constitutionTitleTr: string;
  constitutionTitleAr: string;
  versionLabel: string;
  articleNumber: string;
  paragraphNumber?: string;
  chapterTr: string;
  chapterAr: string;
  originalText: string;
  translatedText: string;
  explanationTr: string;
  explanationAr: string;
  status: LegalStatus;
  officialSource: string;
  sourceUrl?: string;
}

export interface OfficialDocumentGuide {
  id: string;
  country: 'Turkey' | 'Egypt';
  nameTr: string;
  nameAr: string;
  issuingAuthorityTr: string;
  issuingAuthorityAr: string;
  documentForm: 'Original' | 'Certified Copy' | 'Extract' | 'Electronic Document (e-Devlet / Digital Egypt)';
  purposeTr: string;
  purposeAr: string;
  fields: Array<{
    labelTr: string;
    labelAr: string;
    notesTr: string;
    notesAr: string;
  }>;
  authenticationNotesTr: string;
  authenticationNotesAr: string;
}

export interface SearchFilters {
  jurisdiction?: JurisdictionType | '';
  specializationId?: string;
  subcategory?: string;
  documentType?: string;
  contractType?: string;
  issuingAuthority?: string;
  lawNumber?: string;
  articleNumber?: string;
  legalStatus?: LegalStatus | '';
  verificationStatus?: VerificationStatus | '';
}

export interface SearchResponse {
  query: string;
  direction: SearchDirection;
  matchType: 'exact' | 'closest_verified' | 'not_found';
  term: LegalTerm | null;
  notFoundMessage?: string;
  filtersApplied: SearchFilters;
}

export interface MissingTermLog {
  id: string;
  query: string;
  direction: SearchDirection;
  count: number;
  lastSearchedAt: string;
}

export interface QuizQuestion {
  id: string;
  promptTerm: string;
  promptLanguage: 'tr' | 'ar';
  correctOption: string;
  options: string[];
  specializationId: string;
  difficulty: DifficultyLevel;
  explanationTr: string;
  explanationAr: string;
  sourceTitle: string;
  termId: string;
}

export interface SearchHistoryItem {
  id: string;
  query: string;
  direction: SearchDirection;
  termId?: string;
  matchedTurkish?: string;
  matchedArabic?: string;
  found: boolean;
  timestamp: string;
}
