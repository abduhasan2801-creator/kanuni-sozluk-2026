import type { LegalTerm } from '../../types/legal.ts';
import { EXPANSION_TERMS_PART_1 } from './legalTermsExpansion1.ts';
import { EXPANSION_TERMS_PART_2 } from './legalTermsExpansion2.ts';
import { EXPANSION_TERMS_PART_3 } from './legalTermsExpansion3.ts';
import { EXPANSION_TERMS_PART_4 } from './legalTermsExpansion4.ts';

export const EXPANDED_LEGAL_TERMS: LegalTerm[] = [
  ...EXPANSION_TERMS_PART_1,
  ...EXPANSION_TERMS_PART_2,
  ...EXPANSION_TERMS_PART_3,
  ...EXPANSION_TERMS_PART_4,
];
