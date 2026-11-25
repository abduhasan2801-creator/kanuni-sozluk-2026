import type { LegalTerm } from '../../types/legal.ts';

function makeTerm3(
  partial: Omit<
    LegalTerm,
    | 'revisions'
    | 'lastVerifiedDate'
    | 'lastUpdatedDate'
    | 'searchCount'
    | 'editorialStage'
    | 'legalStatus'
  > & {
    lastVerifiedDate?: string;
    lastUpdatedDate?: string;
    searchCount?: number;
    editorialStage?: LegalTerm['editorialStage'];
    legalStatus?: LegalTerm['legalStatus'];
  }
): LegalTerm {
  const verifiedDate = partial.lastVerifiedDate ?? '2026-10-15';
  return {
    ...partial,
    lastVerifiedDate: verifiedDate,
    lastUpdatedDate: partial.lastUpdatedDate ?? verifiedDate,
    searchCount: partial.searchCount ?? 150,
    editorialStage: partial.editorialStage ?? 'Publication',
    legalStatus: partial.legalStatus ?? 'Current',
    revisions: [
      {
        version: 1,
        editedAt: `${verifiedDate}T09:00:00Z`,
        editedBy: 'AHD Legal Editorial Board',
        changeNote: 'Initial comparative legal verification and source citation.',
        stage: 'Publication',
      },
    ],
  };
}

export const LEGAL_TERMS_PART_3: LegalTerm[] = [
  makeTerm3({
    id: 'trm-mustakil-tapu',
    turkishTerm: 'Müstakil Tapu',
    arabicTerm: 'سند ملكية مستقل',
    turkishPronunciation: 'müs-ta-kil ta-pu',
    arabicPronunciation: 'sanad milkiyya mustaqill',
    turkishDefinition:
      'Bir taşınmazın veya bağımsız bölümün tamamının (1/1 hisse) tek bir gerçek ya da tüzel kişiye ait olduğunu gösteren tapu kaydıdır.',
    arabicDefinition:
      'سند ملكية عقارية يثبت ملكية العقار أو الوحدة المستقلة بالكامل (حصة 1/1) لشخص طبيعي أو اعتباري واحد دون شركاء على الشيوع.',
    turkishExamples: [
      {
        tr: 'Taşınmaz tam hisseyle tek malik adına kayıtlı olduğu için müstakil tapu niteliğindedir.',
        ar: 'نظرًا لقيد العقار بحصة كاملة باسم مالك واحد، فإنه يعد سند ملكية مستقل.',
      },
    ],
    arabicExamples: [
      {
        ar: 'يملك المشتري العقار بموجب سند ملكية مستقل يتيح له التصرف فيه منفردًا.',
        tr: 'Alıcı, taşınmaza tek başına tasarruf etme yetkisi veren müstakil tapuya sahiptir.',
      },
    ],
    specializationId: 'real-estate-land-registry',
    documentTypes: ['Property Deeds'],
    issuingAuthority: 'Tapu ve Kadastro Genel Müdürlüğü',
    jurisdiction: 'Turkish Law',
    legislativeClassification: 'Turkish Official Administrative Term',
    translationClassification: 'Exact Legal Equivalent',
    verificationStatus: 'Officially Verified',
    legalContext: {
      tr: 'Hisseli tapunun aksine malik satış, ipotek veya kiralamada diğer kişilerin onayına veya önalım hakkına tabi değildir.',
      ar: 'يُقابل في العربية «الملكية المفرزة / سند الملكية المستقل» في مقابل «سند الملكية على الشيوع».',
    },
    comparativeAnalysis: {
      originDefinition: 'Tek malikli tam mülkiyet tapu kaydı.',
      targetConcept: 'ملكية مفرزة مستقلة لمالك واحد.',
      meaningDifferences: 'Tam örtüşme sağlar.',
      legalEffectsDifferences: 'Şufa (önalım) hakkı söz konusu değildir.',
      proceduralDifferences: 'Tek malikin başvurusuyla devir yapılabilir.',
      recommendedTranslation: 'سند ملكية مستقل',
      alternativeTranslations: ['طابو مستقل (ملكية فردية كاملة)'],
      commonMistakes: ['"Müstakil Tapu"yu sadece "müstakil ev/villa" tapusu sanmak; daire tapusu da tek kişiye aitse müstakil tapudur.'],
    },
    translatorNotes: {
      tr: 'Apartman dairesi de tek kişiye aitse "Müstakil Tapu"dur; "سند ملكية مستقل" yazılmalıdır.',
      ar: 'كلمة «Müstakil» هنا تعني استقلال الملكية لشخص واحد (حصة 1/1)، حتى لو كان العقار شقة في عمارة.',
    },
    relatedTerms: ['Hisseli Tapu', 'Tapu Senedi', 'Bağımsız Bölüm'],
    confusableTerms: ['Hisseli Tapu', 'Müstakil Konut'],
    synonyms: ['Tam Hisseli Tapu'],
    source: {
      authority: 'Tapu ve Kadastro Genel Müdürlüğü',
      documentTitle: '4721 sayılı Türk Medeni Kanunu m. 683',
      lawNumber: '4721',
      jurisdiction: 'Turkish Law',
      verificationDate: '2026-10-15',
      status: 'Current',
    },
    searchCount: 380,
    difficulty: 'Beginner',
  }),
  makeTerm3({
    id: 'trm-hisseli-tapu',
    turkishTerm: 'Hisseli Tapu',
    arabicTerm: 'سند ملكية على الشيوع',
    turkishPronunciation: 'his-se-li ta-pu',
    arabicPronunciation: 'sanad milkiyya ʿalā sh-shuyūʿ',
    turkishDefinition:
      'Bir taşınmaz üzerinde birden fazla kişinin belirli pay oranlarıyla (paylı mülkiyet) veya pay oranı ayrılmaksızın (elbirliği mülkiyeti) ortak malik olduğunu gösteren tapu kaydıdır.',
    arabicDefinition:
      'سند ملكية يثبت اشتراك أكثر من مالك في عقار واحد بحصص شائعة، دون فرز مادي لكل حصة على أرض الواقع.',
    turkishExamples: [
      {
        tr: 'Hisseli tapuda bir paydaşın payını üçüncü kişiye satması hâlinde diğer paydaşların önalım (şufa) hakkı doğabilir.',
        ar: 'في سند الملكية على الشيوع، إذا باع أحد الشركاء حصته إلى طرف ثالث، قد ينشأ للشركاء الآخرين حق الشفعة.',
      },
    ],
    arabicExamples: [
      {
        ar: 'لا يجوز لمالك الحصة الشائعة بيع جزء مفرز محدد من الأرض قبل إتمام الفرز والتجنيب.',
        tr: 'Paylı malik, ifraz ve taksim yapılmadıkça taşınmazın belirli bir parçasını müstakil olarak satamaz.',
      },
    ],
    specializationId: 'real-estate-land-registry',
    documentTypes: ['Property Deeds', 'Land Registry Extracts'],
    issuingAuthority: 'Tapu ve Kadastro Genel Müdürlüğü',
    jurisdiction: 'Turkish Law',
    legislativeClassification: 'Turkish Official Administrative Term',
    translationClassification: 'Exact Legal Equivalent',
    verificationStatus: 'Officially Verified',
    legalContext: {
      tr: 'TMK m. 732 gereği paylı mülkiyette paydaşların yasal önalım (şufa / الشفعة) hakkı bulunur.',
      ar: 'يقابله في مصر «الملكية الشائعة» (م. 825 مدني مصري) مع حق الشفعة للشريك في الشيوع (م. 936).',
    },
    comparativeAnalysis: {
      originDefinition: 'Birden çok hissedarlı tapu kaydı.',
      targetConcept: 'سند ملكية على الشيوع (المادة 825 مدني مصري).',
      meaningDifferences: 'Tam örtüşme vardır.',
      legalEffectsDifferences: 'Yasal önalım (الشفعة) riski ve yönetim/taksim kısıtları doğurur.',
      proceduralDifferences: 'Mısır’da şufa talebi için resmî ihbar ve bedel tevdii şarttır; Türkiye’de satışın bildiriminden itibaren 3 ay içinde şufa davası açılır.',
      recommendedTranslation: 'سند ملكية على الشيوع',
      alternativeTranslations: ['طابو بحصص شائعة'],
      commonMistakes: ['"Hisse" kelimesini anonim şirket hissesiyle (أسهم) karıştırmak; gayrimenkulde karşılığı "حصة شائعة"dır.'],
    },
    translatorNotes: {
      tr: 'Tapu bağlamında "Paydaş / Hissedar" = "الشريك في الملكية على الشيوع".',
      ar: 'في العقارات تُترجم «Hisse» إلى «حصة»، أما في الشركات المساهمة فتُترجم إلى «أسهم».',
    },
    relatedTerms: ['Müstakil Tapu', 'Paylı Mülkiyet', 'فرز وتجنيب'],
    confusableTerms: ['Müstakil Tapu', 'Hisse Senedi'],
    synonyms: ['Paylı Tapu'],
    source: {
      authority: 'Mevzuat Bilgi Sistemi',
      documentTitle: '4721 sayılı Türk Medeni Kanunu',
      lawNumber: '4721',
      articleNumber: 'Madde 688, 732',
      jurisdiction: 'Turkish Law',
      verificationDate: '2026-10-15',
      status: 'Current',
    },
    searchCount: 390,
    difficulty: 'Intermediate',
  }),
  makeTerm3({
    id: 'trm-kadastro',
    turkishTerm: 'Kadastro',
    arabicTerm: 'المساحة العقارية / السجل المساحي',
    turkishPronunciation: 'ka-das-tro',
    arabicPronunciation: 'al-misāḥa al-ʿaqāriyya / as-sijill al-misāḥī',
    turkishDefinition:
      'Ülke koordinat sistemine göre taşınmaz malların sınırlarının arazi ve harita üzerinde belirlenerek hukuki durumlarının ve hak sahiplerinin tespit edilmesi işlemidir (3402 s. Kadastro Kanunu m. 1).',
    arabicDefinition:
      'العملية الهندسية والقانونية لتحديد حدود العقارات والأراضي ومساحاتها على الخرائط المساحية وتثبيت أوصافها وربطها بالسجل العقاري.',
    turkishExamples: [
      {
        tr: 'Kadastro Müdürlüğü tarafından yapılan ölçüm sonucunda parselin kesin yüzölçümü güncellendi.',
        ar: 'عُدلت المساحة النهائية للقطعة العقارية بناءً على أعمال الرفع المساحي التي أجرتها مديرية المساحة العقارية.',
      },
    ],
    arabicExamples: [
      {
        ar: 'تُصدر الهيئة المصرية العامة للمساحة كشف التحديد المساحي اللازم لإجراءات الشهر العقاري.',
        tr: 'Mısır Genel Kadastro Kurumu, tescil işlemleri için gerekli kadastro tespit belgesini (كشف التحديد المساحي) düzenler.',
      },
    ],
    specializationId: 'real-estate-land-registry',
    documentTypes: ['Land Registry Extracts', 'Property Deeds'],
    issuingAuthority: 'Tapu ve Kadastro Genel Müdürlüğü / الهيئة المصرية العامة للمساحة',
    jurisdiction: 'Comparative Law',
    legislativeClassification: 'Turkish Legislative Term',
    translationClassification: 'Exact Legal Equivalent',
    verificationStatus: 'Officially Verified',
    legalContext: {
      tr: 'Türkiye’de Tapu ve Kadastro tek genel müdürlük altında birleşmiştir; Mısır’da ise "الهيئة المصرية العامة للمساحة" ayrı teknik kurumdur.',
      ar: 'يقابله في مصر «الهيئة المصرية العامة للمساحة».',
    },
    comparativeAnalysis: {
      originDefinition: 'Taşınmazların geometrik ve hukuki tespiti.',
      targetConcept: 'المساحة العقارية / كشف التحديد المساحي (مصر).',
      meaningDifferences: 'Kavram aynıdır.',
      legalEffectsDifferences: 'Kadastro tutanakları kesinleştikten sonra 10 yıllık hak düşürücü süreye tabidir (3402 s. K. m. 12).',
      proceduralDifferences: 'Mısır’da شهر عقاري başvurularında الرقمي/المساحي rapor zorunludur.',
      recommendedTranslation: 'المساحة العقارية / السجل المساحي',
      alternativeTranslations: ['التحديد المساحي (الكاداسترو)'],
      commonMistakes: ['"Kadastro"yu "İmar Planı" (المخطط العمراني) ile karıştırmak.'],
    },
    translatorNotes: {
      tr: '"Kadastro Müdürlüğü" = "مديرية المساحة العقارية".',
      ar: 'لا تخلط بين «Kadastro» (المساحة العقارية) و«İmar Planı» (المخطط التنظيمي العمراني).',
    },
    relatedTerms: ['Tapu Sicili', 'Ada / Parsel', 'كشف التحديد المساحي'],
    confusableTerms: ['İmar Planı'],
    synonyms: ['Arazi Ölçüm ve Tespiti'],
    source: {
      authority: 'Tapu ve Kadastro Genel Müdürlüğü',
      documentTitle: '3402 sayılı Kadastro Kanunu',
      lawNumber: '3402',
      articleNumber: 'Madde 1',
      jurisdiction: 'Turkish Law',
      verificationDate: '2026-10-15',
      status: 'Current',
    },
    searchCount: 320,
    difficulty: 'Intermediate',
  }),
  makeTerm3({
    id: 'trm-on-sozlesme',
    turkishTerm: 'Ön Sözleşme',
    arabicTerm: 'العقد الابتدائي / الوعد بالتعاقد',
    turkishPronunciation: 'ön söz-leş-me',
    arabicPronunciation: 'al-ʿaqd al-ibtidāʾī / al-waʿd bi-t-taʿāqud',
    turkishDefinition:
      'Tarafların ileride esas bir sözleşmeyi kurma yükümlülüğü altına girdikleri hazırlık niteliğindeki borçlandırıcı sözleşmedir (TBK m. 29).',
    arabicDefinition:
      'اتفاق تمهيدي يلزم طرفيه أو أحدهما بإبرام العقد النهائي مستقبلاً خلال مدة محددة ووفق شروط متفق عليها.',
    turkishExamples: [
      {
        tr: 'Kanunda öngörülen şekil şartı, kural olarak ön sözleşme için de geçerlidir (TBK m. 29/2).',
        ar: 'يسري الشكل القانوني المقرر للعقد النهائي كقاعدة عامة على العقد التمهيدي (الوعد بالتعاقد) أيضًا.',
      },
    ],
    arabicExamples: [
      {
        ar: 'لا ينعقد الوعد بالتعاقد إلا إذا عُينت جميع المسائل الجوهرية للعقد المراد إبرامه والمدة التي يجب إبرامه فيها.',
        tr: 'Ön sözleşme, kurulacak asıl sözleşmenin tüm esaslı unsurları ve kurulma süresi belirlenmedikçe geçerli olmaz.',
      },
    ],
    specializationId: 'contracts-obligations',
    documentTypes: ['Contracts'],
    contractType: 'Preliminary Contract',
    jurisdiction: 'Comparative Law',
    legislativeClassification: 'Turkish Legislative Term',
    translationClassification: 'Contextual Equivalent',
    verificationStatus: 'Officially Verified',
    legalContext: {
      tr: 'TBK m. 29’a göre asıl sözleşme resmî şekle tabi ise ön sözleşme de resmî şekle tabidir.',
      ar: 'يُقابل «الوعد بالتعاقد» المنصوص عليه في المادة 101 من القانون المدني المصري.',
    },
    comparativeAnalysis: {
      originDefinition: 'İleride sözleşme yapma borcu doğuran sözleşme (TBK m. 29).',
      targetConcept: 'الوعد بالتعاقد (المادة 101 مدني مصري).',
      meaningDifferences: 'Mısır emlak piyasasındaki "عقد ابتدائي" kavramı ile karıştırılmamalıdır.',
      legalEffectsDifferences: 'Kaçınan tarafa karşı ifa davası açılabilir.',
      proceduralDifferences: 'Taşınmaz satış vaadi noter önünde düzenlenir.',
      recommendedTranslation: 'العقد التمهيدي / الوعد بالتعاقد',
      alternativeTranslations: ['العقد الابتدائي (عند التمهيد لعقد نهائي)'],
      commonMistakes: ['Mısır’daki adi satış sözleşmesi olan "عقد ابتدائي" ile TBK m. 29’daki ön sözleşmeyi aynı hukuki rejim sanmak.'],
    },
    translatorNotes: {
      tr: 'Hukuk metinlerinde TBK m. 29 bağlamında "الوعد بالتعاقد / العقد التمهيدي" ifadesi daha nettir.',
      ar: 'في القانون التركي يُفضّل ترجمة «Ön Sözleşme» إلى «العقد التمهيدي / الوعد بالتعاقد» لتمييزه عن «العقد الابتدائي العرفي» المصري.',
    },
    relatedTerms: ['Kesin Sözleşme', 'Sözleşme', 'عقد ابتدائي'],
    confusableTerms: ['Niyet Mektubu (خطاب النوايا)', 'Kesin Sözleşme'],
    synonyms: ['Sözleşme Yapma Vaadi'],
    source: {
      authority: 'Mevzuat Bilgi Sistemi',
      documentTitle: '6098 sayılı Türk Borçlar Kanunu',
      lawNumber: '6098',
      articleNumber: 'Madde 29',
      jurisdiction: 'Turkish Law',
      verificationDate: '2026-10-15',
      status: 'Current',
    },
    searchCount: 310,
    difficulty: 'Intermediate',
  }),
  makeTerm3({
    id: 'trm-kesin-sozlesme',
    turkishTerm: 'Kesin Sözleşme',
    arabicTerm: 'العقد النهائي',
    turkishPronunciation: 'ke-sin söz-leş-me',
    arabicPronunciation: 'al-ʿaqd an-nihāʾī',
    turkishDefinition:
      'Ön sözleşme veya ihale/protokol aşamasının ardından tarafların nihai hak ve borçlarını kesin biçimde kuran asıl sözleşmedir.',
    arabicDefinition:
      'العقد الأصلي النهائي الذي يُبرم تنفيذًا لوعد بالتعاقد أو بعد إجراءات الترسية، ويرتب كامل الآثار القانونية المقصودة.',
    turkishExamples: [
      {
        tr: 'İhale kararının kesinleşmesini takiben yüklenici ile kesin sözleşme imzalandı.',
        ar: 'عقب اعتماد قرار المناقصة، تم توقيع العقد النهائي مع المقاول.',
      },
    ],
    arabicExamples: [
      {
        ar: 'يحل العقد النهائي محل الاتفاقات التمهيدية السابقة ويلزم الطرفين بجميع بنوده.',
        tr: 'Kesin sözleşme, önceki hazırlık anlaşmalarının yerini alır ve tüm hükümleriyle tarafları bağlar.',
      },
    ],
    specializationId: 'contracts-obligations',
    documentTypes: ['Contracts'],
    contractType: 'Final Contract',
    jurisdiction: 'Comparative Law',
    legislativeClassification: 'Turkish Legislative Term',
    translationClassification: 'Exact Legal Equivalent',
    verificationStatus: 'Officially Verified',
    legalContext: {
      tr: 'Özellikle kamu ihaleleri, inşaat ve gayrimenkul satış vaadi sonrası asıl devir aşamasında kullanılır.',
      ar: 'يُقابل «العقد النهائي» في المعاملات العقارية والتجارية المصرية.',
    },
    comparativeAnalysis: {
      originDefinition: 'Nihai hukuki sonuç doğuran asıl sözleşme.',
      targetConcept: 'العقد النهائي (أو العقد المسجل في العقارات بمصر).',
      meaningDifferences: 'Gayrimenkulde Mısır uygulamasında "العقد النهائي" çoğu zaman الشهر العقاري’de tescil edilecek sözleşmeyi ifade eder.',
      legalEffectsDifferences: 'Asıl edimlerin ifasını zorunlu kılar.',
      proceduralDifferences: 'Önceki protokolleri ilga eden bütünlük maddesi (Entire Agreement) içerir.',
      recommendedTranslation: 'العقد النهائي',
      alternativeTranslations: ['العقد الأصلي النهائي'],
      commonMistakes: ['"Kesin" sıfatını mahkeme kararı olan "Kesinleşmiş Karar" ile karıştırmak.'],
    },
    translatorNotes: {
      tr: 'Sözleşme metinlerinde standart karşılık "العقد النهائي"dır.',
      ar: 'المقابل القياسي لـ «Kesin Sözleşme» هو «العقد النهائي».',
    },
    relatedTerms: ['Ön Sözleşme', 'Sözleşme', 'عقد مسجل'],
    confusableTerms: ['Ön Sözleşme', 'Kesinleşmiş Karar'],
    synonyms: ['Nihai Sözleşme', 'Asıl Sözleşme'],
    source: {
      authority: 'Mevzuat Bilgi Sistemi',
      documentTitle: '6098 sayılı TBK & 4734 sayılı Kamu İhale Kanunu',
      lawNumber: '6098',
      jurisdiction: 'Turkish Law',
      verificationDate: '2026-10-15',
      status: 'Current',
    },
    searchCount: 260,
    difficulty: 'Beginner',
  }),
  makeTerm3({
    id: 'trm-davaci-davali',
    turkishTerm: 'Davacı / Davalı',
    arabicTerm: 'المدعي / المدعى عليه',
    turkishPronunciation: 'da-va-cı / da-va-lı',
    arabicPronunciation: 'al-muddaʿī / al-muddaʿā ʿalayh',
    turkishDefinition:
      'Hukuk veya idare mahkemesinde bir hakkın korunması talebiyle dava açan tarafa "Davacı", kendisine karşı dava açılan tarafa ise "Davalı" denir.',
    arabicDefinition:
      'في الخصومة القضائية المدنية أو الإدارية: «المدعي» هو من يرفع الدعوى القضائية طالبًا الحماية لحقه، و«المدعى عليه» هو الطرف الموجهة ضده الدعوى.',
    turkishExamples: [
      {
        tr: 'Davacı vekili, davalının sözleşmeye aykırı davrandığını ileri sürerek tazminat talep etti.',
        ar: 'طالب وكيل المدعي بالتعويض مستندًا إلى إخلال المدعى عليه بأحكام العقد.',
      },
    ],
    arabicExamples: [
      {
        ar: 'يقع عبء الإثبات على عاتق المدعي الذي يدعي خلاف الظاهر أو الأصل.',
        tr: 'İspat yükü, aksini iddia eden davacıya aittir.',
      },
    ],
    specializationId: 'judicial-litigation',
    documentTypes: ['Court Pleadings', 'Court Judgments'],
    issuingAuthority: 'Adli ve İdari Yargı Mahkemeleri',
    jurisdiction: 'Comparative Law',
    legislativeClassification: 'Turkish Legislative Term',
    translationClassification: 'Exact Legal Equivalent',
    verificationStatus: 'Officially Verified',
    legalContext: {
      tr: 'Ceza davalarında şikâyet eden "Müşteki / Katılan", suçlanan ise "Sanık" sıfatını alır; "Davacı/Davalı" hukuk ve idare davalarına özgüdür.',
      ar: 'ملاحظة: في الدعوى الجنائية يُسمى «المشتكي / المدعي بالحق المدني» و«المتهم»، أما في المدنية والإدارية فهو «المدعي» و«المدعى عليه».',
    },
    comparativeAnalysis: {
      originDefinition: 'Hukuk yargılamasının iki asli tarafı (HMK m. 50 vd.).',
      targetConcept: 'المدعي والمدعى عليه (قانون المرافعات المصري).',
      meaningDifferences: 'İstinaf ve temyizde sıfatlar "İstinaf Eden / İstinaf Olunan" veya "Temyiz Eden / Karşı Taraf" biçiminde anılır.',
      legalEffectsDifferences: 'Taraf ehliyeti ve dava ehliyeti dava şartıdır (HMK m. 114).',
      proceduralDifferences: 'Karşı dava (دعوى فرعية/متقابلة) açıldığında roller birleşebilir.',
      recommendedTranslation: 'المدعي / المدعى عليه',
      alternativeTranslations: ['رافع الدعوى / المرفوعة ضده الدعوى'],
      commonMistakes: ['Ceza mahkemesindeki "Sanık"ı "Davalı" diye çevirmek.'],
    },
    translatorNotes: {
      tr: '"Davacı Vekili" = محامي/وكيل المدعي؛ "Karşı Davacı" = المدعي في الدعوى المتقابلة.',
      ar: 'المقابل المطابق في المحاكم المدنية والإدارية هو «المدعي» و«المدعى عليه».',
    },
    relatedTerms: ['Dava Dilekçesi', 'Gerekçeli Karar', 'Şüpheli', 'Sanık'],
    confusableTerms: ['Şikâyetçi (Müşteki)', 'Sanık'],
    synonyms: ['Tarafeyn'],
    source: {
      authority: 'Mevzuat Bilgi Sistemi',
      documentTitle: '6100 sayılı Hukuk Muhakemeleri Kanunu',
      lawNumber: '6100',
      articleNumber: 'Madde 50-57',
      jurisdiction: 'Turkish Law',
      verificationDate: '2026-10-15',
      status: 'Current',
    },
    searchCount: 450,
    difficulty: 'Beginner',
  }),
  makeTerm3({
    id: 'trm-kesinlesmis-karar',
    turkishTerm: 'Kesinleşmiş Karar',
    arabicTerm: 'الحكم النهائي البات / الحكم الحائز لقوة الأمر المقضي',
    turkishPronunciation: 'ke-sin-leş-miş ka-rar',
    arabicPronunciation: 'al-ḥukm an-nihāʾī al-bātt',
    turkishDefinition:
      'Tüm olağan kanun yollarının (istinaf ve temyiz) tüketilmesi, tarafların kanun yolundan feragat etmesi veya sürenin geçmesi sonucu artık değiştirilemez ve kesin hüküm (HMK m. 303) niteliği kazanmış mahkeme kararıdır.',
    arabicDefinition:
      'الحكم القضائي الذي استنفد طرق الطعن العادية (أو فاتت مواعيدها) وحاز قوة الأمر المقضي به وأصبح واجب التنفيذ وغير قابل للطعن العادي.',
    turkishExamples: [
      {
        tr: 'Yabancı ülkede tanıma ve tenfiz yapılabilmesi için mahkeme kararının kesinleşmiş karar şerhi taşıması şarttır (MÖHUK m. 52).',
        ar: 'يشترط للاعتراف بالحكم الأجنبي وتنفيذه أن يحمل الحكم تذييلاً بصيرورته حكمًا نهائيًا باتًا.',
      },
    ],
    arabicExamples: [
      {
        ar: 'تحوز الأحكام التي حازت قوة الأمر المقضي حجية فيما فصلت فيه من الحقوق ولا يجوز إعادة نظر النزاع.',
        tr: 'Kesinleşmiş kararlar, karara bağladıkları haklar bakımından kesin hüküm teşkil eder ve aynı uyuşmazlık yeniden görülemez.',
      },
    ],
    specializationId: 'judicial-litigation',
    documentTypes: ['Court Judgments'],
    issuingAuthority: 'Adli ve İdari Yargı Mahkemeleri',
    jurisdiction: 'Comparative Law',
    legislativeClassification: 'Turkish Legislative Term',
    translationClassification: 'Exact Legal Equivalent',
    verificationStatus: 'Officially Verified',
    legalContext: {
      tr: 'MÖHUK m. 52 ve 54 gereğince yurt dışından gelen boşanma veya alacak kararlarının Türkiye’de tanınması için "Kesinleşme Şerhi" (شهادة نهائية الحكم) zorunludur.',
      ar: 'في مصر يُفرّق الفقه بين «الحكم النهائي» (غير قابل للاستئناف) و«الحكم البات» (استنفد الطعن بالنقض أيضًا)؛ وفي الوثائق التركية يشمل «Kesinleşmiş Karar» الحالتين بعد سقوط مواعيد الطعن.',
    },
    comparativeAnalysis: {
      originDefinition: 'Şeklî ve maddi anlamda kesin hüküm (HMK m. 303).',
      targetConcept: 'الحكم البات / الحائز لقوة الأمر المقضي (قانون الإثبات المصري م. 101).',
      meaningDifferences: 'Mısır’da "النهائي" istinaf sonrası, "البات" ise نقض sonrası kesinliği vurgular.',
      legalEffectsDifferences: 'Nüfus ve tapu tescili ile yabancı kararların tenfizi ancak kesinleşme sonrası yapılabilir.',
      proceduralDifferences: 'Mahkeme kalemince kararın arkasına veya ekine "Kesinleşme Şerhi" düzenlenir.',
      recommendedTranslation: 'الحكم النهائي البات (الحائز لقوة الأمر المقضي)',
      alternativeTranslations: ['الحكم المذيل بصيغة النهائية والقطعية'],
      commonMistakes: ['İlk derece mahkemesinin henüz istinafa açık "Nihai Karar"ını "Kesinleşmiş Karar" diye çevirmek.'],
    },
    translatorNotes: {
      tr: '"Kesinleşme Şerhi" = "تذييل/شهادة صيرورة الحكم نهائيًا وباتًا".',
      ar: 'المقابل الدقيق لـ «Kesinleşme Şerhi» عند ترجمة الأحكام التركية للخارج هو «شهادة صيرورة الحكم نهائيًا وباتًا».',
    },
    relatedTerms: ['Gerekçeli Karar', 'İstinaf', 'Temyiz', 'İcra Takibi'],
    confusableTerms: ['Nihai Karar', 'Ara Karar'],
    synonyms: ['Kesin Hüküm'],
    source: {
      authority: 'Mevzuat Bilgi Sistemi',
      documentTitle: '6100 sayılı HMK m. 303 & 5718 sayılı MÖHUK m. 52',
      lawNumber: '6100 / 5718',
      articleNumber: 'Madde 303 / 52',
      jurisdiction: 'Turkish Law',
      verificationDate: '2026-10-15',
      status: 'Current',
    },
    searchCount: 430,
    difficulty: 'Intermediate',
  }),
  makeTerm3({
    id: 'trm-anonim-sirket',
    turkishTerm: 'Anonim Şirket',
    arabicTerm: 'شركة مساهمة',
    turkishPronunciation: 'a-no-nim şir-ket',
    arabicPronunciation: 'sharika musāhima',
    turkishDefinition:
      'Sermayesi belirli ve paylara bölünmüş olan, borçlarından dolayı yalnız malvarlığıyla sorumlu bulunan ve pay sahiplerinin yalnızca taahhüt etmiş oldukları sermaye payları ile şirkete karşı sorumlu olduğu sermaye şirketidir (TTK m. 329).',
    arabicDefinition:
      'شركة أموال ينقسم رأسمالها إلى أسهم متساوية القيمة قابلة للتداول، ولا يُسأل المساهم فيها إلا في حدود قيمة أسهمه، ويديرها مجلس إدارة.',
    turkishExamples: [
      {
        tr: 'Anonim şirketin yönetim kurulu, genel kurul tarafından en çok üç yıl süreyle görev yapmak üzere seçilir.',
        ar: 'تنتخب الجمعية العامة مجلس إدارة الشركة المساهمة لمدة لا تتجاوز ثلاث سنوات.',
      },
    ],
    arabicExamples: [
      {
        ar: 'تخضع الشركات المساهمة في مصر لأحكام قانون الشركات رقم 159 لسنة 1981 والهيئة العامة للاستثمار.',
        tr: 'Mısır’da anonim şirketler 1981 tarihli 159 sayılı Şirketler Kanunu ve Yatırım İdaresi (GAFI) düzenlemelerine tabidir.',
      },
    ],
    specializationId: 'commercial-corporate',
    documentTypes: ['Company Formation Documents', 'Commercial Registry Documents'],
    issuingAuthority: 'Ticaret Bakanlığı / الهيئة العامة للاستثمار والمناطق الحرة',
    jurisdiction: 'Comparative Law',
    legislativeClassification: 'Turkish Legislative Term',
    translationClassification: 'Exact Legal Equivalent',
    verificationStatus: 'Officially Verified',
    legalContext: {
      tr: '6102 sayılı TTK’ya göre tek pay sahibiyle kurulabilir; Yönetim Kurulu (مجلس الإدارة) ve Genel Kurul (الجمعية العامة) zorunlu organlardır.',
      ar: 'يُقابل «الشركة المساهمة» (ش.م.م) في القانون المصري رقم 159 لسنة 1981 (يشترط في مصر 3 مؤسسين على الأقل).',
    },
    comparativeAnalysis: {
      originDefinition: 'Paylara bölünmüş sermayeli şirket (TTK m. 329).',
      targetConcept: 'شركة مساهمة (القانون المصري 159/1981).',
      meaningDifferences: 'Limited şirketten farklı olarak kamu borçlarından pay sahiplerinin şahsi sorumluluğu yoktur (yönetim kurulu üyeleri hariç).',
      legalEffectsDifferences: 'Hamiline/nama yazılı pay senedi basılabilir; nama yazılı payların devri noter onayına tabi değildir.',
      proceduralDifferences: 'Esas sözleşme ticaret siciline tescil edilir.',
      recommendedTranslation: 'شركة مساهمة',
      alternativeTranslations: ['الشركة المساهمة (A.Ş.)'],
      commonMistakes: ['"A.Ş." kısaltmasını "Limited Şirket" ile karıştırmak.'],
    },
    translatorNotes: {
      tr: 'Şirket unvanlarındaki "A.Ş." = "ش.م" veya "شركة مساهمة" şeklinde çevrilir.',
      ar: 'تُترجم «Anonim Şirket (A.Ş.)» إلى «شركة مساهمة».',
    },
    relatedTerms: ['Limited Şirket', 'Ticaret Sicili', 'Yönetim Kurulu', 'Genel Kurul'],
    confusableTerms: ['Limited Şirket'],
    synonyms: ['A.Ş.'],
    source: {
      authority: 'Mevzuat Bilgi Sistemi',
      documentTitle: '6102 sayılı Türk Ticaret Kanunu',
      lawNumber: '6102',
      articleNumber: 'Madde 329',
      jurisdiction: 'Turkish Law',
      verificationDate: '2026-10-15',
      status: 'Current',
    },
    searchCount: 395,
    difficulty: 'Beginner',
  }),
  makeTerm3({
    id: 'trm-haciz',
    turkishTerm: 'Haciz',
    arabicTerm: 'الحجز (التنفيذي / التحفظي)',
    turkishPronunciation: 'ha-ciz',
    arabicPronunciation: 'al-ḥajz',
    turkishDefinition:
      'Kesinleşmiş bir icra takibi veya ihtiyati haciz kararı uyarınca, borçlunun alacağı karşılayacak miktardaki taşınır, taşınmaz malvarlığı veya üçüncü kişilerdeki alacaklarına İcra Dairesince hukuken el konulmasıdır.',
    arabicDefinition:
      'وضع مال المدين المنقول أو العقاري أو ما له لدى الغير تحت يد القضاء أو جهة التنفيذ لمنعه من التصرف فيه، تمهيدًا لبيعه واستيفاء حق الدائن.',
    turkishExamples: [
      {
        tr: 'Borçlunun banka hesaplarına ve taşınmazlarına icra müdürlüğünce haciz konulmuştur.',
        ar: 'تم وضع الحجز من قبل دائرة التنفيذ على الحسابات البنكية وعقارات المدين.',
      },
    ],
    arabicExamples: [
      {
        ar: 'ينقسم الحجز في قانون المرافعات إلى حجز تحفظي وحجز تنفيذي وحجز ما للمدين لدى الغير.',
        tr: 'Usul hukukunda haciz; ihtiyati haciz, icrai (kesin) haciz ve üçüncü kişilerdeki alacakların haczi olarak ayrılır.',
      },
    ],
    specializationId: 'enforcement-bankruptcy',
    documentTypes: ['Court Judgments', 'Land Registry Extracts'],
    issuingAuthority: 'İcra Daireleri / قاضي التنفيذ المصري',
    jurisdiction: 'Comparative Law',
    legislativeClassification: 'Turkish Legislative Term',
    translationClassification: 'Exact Legal Equivalent',
    verificationStatus: 'Officially Verified',
    legalContext: {
      tr: 'Kesin (İcrai) Haciz satış isteme yetkisi verirken, İhtiyati Haciz geçici güvence sağlar.',
      ar: 'ملاحظة: يختلف الحجز (Haciz) الذي تقرره جهة التنفيذ عن الرهن الاتفاقي (İpotek/Rehin).',
    },
    comparativeAnalysis: {
      originDefinition: 'Cebri icra yoluyla malvarlığına el koyma (İİK m. 78 vd.).',
      targetConcept: 'الحجز التنفيذي وحجز ما للمدين لدى الغير.',
      meaningDifferences: 'Tam hukuki paralellik vardır.',
      legalEffectsDifferences: 'Hacizli malın haciz alacaklısının hakkına zarar verecek şekilde devri sınırlandırılır.',
      proceduralDifferences: 'Türkiye’de UYAP üzerinden elektronik banka (e-haciz) ve tapu haczi uygulanır.',
      recommendedTranslation: 'الحجز',
      alternativeTranslations: ['الحجز التنفيذي'],
      commonMistakes: ['"Haciz"i (الحجز القضائي/التنفيذي) "İpotek" (الرهن العقاري الاتفاقي) ile karıştırmak.'],
    },
    translatorNotes: {
      tr: '"Haczin Fekki / Kaldırılması" = "رفع الحجز".',
      ar: 'ترجم «Haczin Kaldırılması» إلى «رفع الحجز».',
    },
    relatedTerms: ['İcra Takibi', 'İhtiyati Haciz', 'Takyidat'],
    confusableTerms: ['İpotek', 'İhtiyati Tedbir'],
    synonyms: ['İcrai El Koyma'],
    source: {
      authority: 'Mevzuat Bilgi Sistemi',
      documentTitle: '2004 sayılı İcra ve İflas Kanunu',
      lawNumber: '2004',
      articleNumber: 'Madde 78-105',
      jurisdiction: 'Turkish Law',
      verificationDate: '2026-10-15',
      status: 'Current',
    },
    searchCount: 375,
    difficulty: 'Beginner',
  }),
  makeTerm3({
    id: 'trm-yururluk',
    turkishTerm: 'Yürürlük / Yürürlük Tarihi',
    arabicTerm: 'النفاذ / تاريخ السريان',
    turkishPronunciation: 'yü-rür-lük ta-ri-hi',
    arabicPronunciation: 'an-nafādh / tārīkh as-sarayān',
    turkishDefinition:
      'Bir kanun, kararname, yönetmelik veya sözleşmenin hukuki sonuçlarını doğurmaya ve uygulanmaya başladığı durum ve bu başlangıç tarihidir.',
    arabicDefinition:
      'بدء سريان القاعدة القانونية أو بنود العقد وإنتاجها لآثارها القانونية الملزمة اعتبارًا من التاريخ المحدد لذلك.',
    turkishExamples: [
      {
        tr: 'Bu Kanun yayımı tarihinde yürürlüğe girer.',
        ar: 'يُعمل بهذا القانون اعتبارًا من تاريخ نشره (يدخل حيز النفاذ في تاريخ النشر).',
      },
    ],
    arabicExamples: [
      {
        ar: 'يسري هذا العقد اعتبارًا من تاريخ توقيعه من قبل الطرفين.',
        tr: 'Bu sözleşme taraflarca imzalandığı tarihte yürürlüğe girer.',
      },
    ],
    specializationId: 'legislation-statutes',
    documentTypes: ['Contracts', 'Constitutional Texts', 'Government Decisions'],
    issuingAuthority: 'TBMM / Resmî Gazete / الجريدة الرسمية',
    jurisdiction: 'Comparative Law',
    legislativeClassification: 'Turkish Legislative Term',
    translationClassification: 'Exact Legal Equivalent',
    verificationStatus: 'Officially Verified',
    legalContext: {
      tr: 'Kanunların son maddelerinde daima "Yürürlük" ve "Yürütme" maddeleri bulunur.',
      ar: 'في التشريعات المصرية يُعبّر عنها بـ «يُنشر هذا القانون في الجريدة الرسمية، ويُعمل به من...».',
    },
    comparativeAnalysis: {
      originDefinition: 'Normun veya sözleşmenin bağlayıcılık kazanma anı.',
      targetConcept: 'النفاذ / تاريخ بدء السريان والعمل به.',
      meaningDifferences: 'Sözleşmelerde "تاريخ السريان", kanunlarda "الدخول حيز النفاذ / العمل بالقانون" tercih edilir.',
      legalEffectsDifferences: '"Yürürlükten Kaldırma (İlga)" = الإلغاء التشريعي.',
      proceduralDifferences: 'Kanunda tarih yazılmamışsa 10 sayılı CK gereği yayımını izleyen 45. gün yürürlüğe girer (Mısır’da Anayasa m. 225 gereği 30. gün).',
      recommendedTranslation: 'النفاذ / تاريخ السريان',
      alternativeTranslations: ['تاريخ الدخول حيز النفاذ', 'تاريخ بدء العمل بالقانون'],
      commonMistakes: ['Kanun sonundaki "Yürürlük" (النفاذ) maddesini "Yürütme" (التنفيذ من قبل الوزراء/السلطة التنفيذية) maddesiyle karıştırmak!'],
    },
    translatorNotes: {
      tr: 'Kanun sonundaki iki klasik madde: "Yürürlük" = النفاذ / بدء العمل · "Yürütme" = التنفيذ (يُعهد بتنفيذه إلى...).',
      ar: 'احفظ الفرق في ختام القوانين التركية: «Yürürlük» (النفاذ والعمل بالقانون) و«Yürütme» (جهة التنفيذ: رئيس الجمهورية/الوزراء).',
    },
    relatedTerms: ['Resmî Gazete', 'Madde / Fıkra / Bent', 'Sözleşme'],
    confusableTerms: ['Yürütme (التنفيذ)'],
    synonyms: ['Meriyet'],
    source: {
      authority: 'Mevzuat Bilgi Sistemi',
      documentTitle: '10 sayılı CK & T.C. Anayasası',
      jurisdiction: 'Turkish Law',
      verificationDate: '2026-10-15',
      status: 'Current',
    },
    searchCount: 340,
    difficulty: 'Beginner',
  }),
  makeTerm3({
    id: 'trm-kredi-sozlesmesi',
    turkishTerm: 'Kredi Sözleşmesi',
    arabicTerm: 'عقد القرض / التمويل بحسب السياق',
    turkishPronunciation: 'kre-di söz-leş-me-si',
    arabicPronunciation: 'ʿaqd al-qarḍ / ʿaqd at-tamwīl',
    turkishDefinition:
      'Banka veya finans kuruluşunun (kredi veren) belirli bir nakdi veya gayrinakdi finansman imkânını müşteriye (kredi alan) tahsis etmeyi, müşterinin de anapara, faiz/kâr payı ve masrafları geri ödemeyi üstlendiği sözleşmedir.',
    arabicDefinition:
      'عقد يلتزم بمقتضاه البنك أو جهة التمويل بوضع مبلغ مالي أو تسهيل ائتماني تحت تصرف العميل مقابل التزامه بالسداد مع العوائد أو هامش الربح في الآجال المحددة.',
    turkishExamples: [
      {
        tr: 'Ticari kredi sözleşmesi kapsamında şirketin taşınmazı üzerine ipotek tesis edildi.',
        ar: 'بموجب عقد التمويل التجاري، تم إنشاء رهن عقاري على عقار الشركة.',
      },
    ],
    arabicExamples: [
      {
        ar: 'يلتزم المقترض بسداد الأقساط المستحقة وفق الجدول الزمني المرفق بعقد القرض.',
        tr: 'Kredi borçlusu, kredi sözleşmesine ekli ödeme planına göre vadesi gelen taksitleri ödemekle yükümlüdür.',
      },
    ],
    specializationId: 'banking-law',
    documentTypes: ['Contracts'],
    contractType: 'Loan Agreement',
    jurisdiction: 'Comparative Law',
    legislativeClassification: 'Turkish Legislative Term',
    translationClassification: 'Contextual Equivalent',
    verificationStatus: 'Officially Verified',
    legalContext: {
      tr: 'Türkiye’de tüketici kredileri (6502 s. TKHK), ticari krediler ve katılım bankacılığı finansman sözleşmeleri ayrı düzenlenir.',
      ar: 'يُترجم في المصارف التقليدية إلى «عقد قرض / تسهيل ائتماني»، وفي المصارف التشاركية/الإسلامية إلى «عقد تمويل».',
    },
    comparativeAnalysis: {
      originDefinition: 'Bankacılık kredi tahsis ve geri ödeme sözleşmesi.',
      targetConcept: 'عقد القرض المصرفي / عقد التمويل (قانون التجارة المصري م. 338).',
      meaningDifferences: 'Katılım bankalarında (البنوك التشاركية) "Kâr Payı / Murabaha" yapısı kullanılır.',
      legalEffectsDifferences: 'Kredi sözleşmeleri icra hukukunda İİK m. 68/b kapsamında özel ispat gücüne sahiptir.',
      proceduralDifferences: 'Türkiye’de tüketici kredilerinde 14 gün içinde cayma hakkı vardır.',
      recommendedTranslation: 'عقد القرض / عقد التمويل',
      alternativeTranslations: ['عقد التسهيل الائتماني'],
      commonMistakes: ['Katılım bankacılığı belgelerinde "Kâr Payı"nı "Faiz" diye çevirmek.'],
    },
    translatorNotes: {
      tr: 'Ticari bankalarda "عقد التسهيل الائتماني / القرض", katılım bankalarında "عقد التمويل" kullanın.',
      ar: 'اختر «عقد قرض» للبنوك التقليدية و«عقد تمويل» للمصارف التشاركية/الإسلامية.',
    },
    relatedTerms: ['İpotek', 'Temerrüt', 'Sözleşme'],
    confusableTerms: ['Kefalet', 'Garanti Sözleşmesi'],
    synonyms: ['Banka Kredi Sözleşmesi'],
    source: {
      authority: 'BDDK / Mevzuat Bilgi Sistemi',
      documentTitle: '5411 sayılı Bankacılık Kanunu & 6502 sayılı TKHK',
      lawNumber: '5411',
      jurisdiction: 'Turkish Law',
      verificationDate: '2026-10-15',
      status: 'Current',
    },
    searchCount: 295,
    difficulty: 'Intermediate',
  }),
  makeTerm3({
    id: 'trm-sigorta-sozlesmesi',
    turkishTerm: 'Sigorta Sözleşmesi',
    arabicTerm: 'عقد التأمين',
    turkishPronunciation: 'si-gor-ta söz-leş-me-si',
    arabicPronunciation: 'ʿaqd at-taʾmīn',
    turkishDefinition:
      'Sigortacının bir prim karşılığında, kişinin para ile ölçülebilir bir menfaatini zarara uğratan tehlikenin (rizikonun) meydana gelmesi hâlinde bunu tazmin etmeyi veya bir ya da birkaç kişinin hayat süreleri sebebiyle para ödemeyi üstlendiği sözleşmedir (TTK m. 1401).',
    arabicDefinition:
      'عقد يلتزم المؤمِّن بمقتضاه أن يؤدي إلى المؤمَّن له أو المستفيد مبلغًا من المال أو إيرادًا أو أي عوض مالي آخر في حالة وقوع الحادث أو تحقق الخطر المبيّن بالعقد، نظير قسط يؤديه المؤمَّن له.',
    turkishExamples: [
      {
        tr: 'Zorunlu deprem sigortası (DASK) poliçesi tapu devir işlemlerinde ibraz edilmesi gereken belgelerdendir.',
        ar: 'تعد وثيقة التأمين الإلزامي ضد الزلازل (DASK) من المستندات الواجب تقديمها عند نقل الملكية العقارية.',
      },
    ],
    arabicExamples: [
      {
        ar: 'يقع على المؤمَّن له التزام بالإفصاح الدقيق عن كافة الظروف الجوهرية المتعلقة بالخطر المؤمَّن منه.',
        tr: 'Sigorta ettiren, rizikoya ilişkin tüm önemli hususları doğru biçimde beyan etmekle yükümlüdür.',
      },
    ],
    specializationId: 'insurance-law',
    documentTypes: ['Contracts'],
    contractType: 'Insurance Contract',
    jurisdiction: 'Comparative Law',
    legislativeClassification: 'Turkish Legislative Term',
    translationClassification: 'Exact Legal Equivalent',
    verificationStatus: 'Officially Verified',
    legalContext: {
      tr: '6102 sayılı TTK Altıncı Kitap (m. 1401-1520) ile düzenlenir; DASK ve Zorunlu Trafik Sigortası yaygın türlerdir.',
      ar: 'يُقابل المواد 747-771 من القانون المدني المصري (عقد التأمين).',
    },
    comparativeAnalysis: {
      originDefinition: 'Prim karşılığı riziko teminatı sağlayan sözleşme (TTK m. 1401).',
      targetConcept: 'عقد التأمين (القانون المدني المصري م. 747).',
      meaningDifferences: 'Her iki sistemde de "Sigorta Poliçesi" = "وثيقة/بوليصة التأمين", "Prim" = "قسط التأمين" anlamına gelir.',
      legalEffectsDifferences: 'Sigortacı ödemeyi yaptıktan sonra zarar sorumlusuna halefiyet (الرجوع / الحلول) yoluyla rücu edebilir.',
      proceduralDifferences: 'Türkiye’de Sigorta Tahkim Komisyonu hızlı çözüm merciidir.',
      recommendedTranslation: 'عقد التأمين',
      alternativeTranslations: ['وثيقة التأمين (للبوليصة)'],
      commonMistakes: ['"Sosyal Sigorta (SGK)" ile özel "Sigorta Sözleşmesi"ni karıştırmak.'],
    },
    translatorNotes: {
      tr: '"Sigortacı" = المؤمِّن · "Sigortalı" = المؤمَّن له · "Lehtar" = المستفيد · "Prim" = قسط التأمين.',
      ar: 'احفظ أطراف التأمين: Sigortacı (المؤمِّن) · Sigorta Ettiren (طالب التأمين) · Sigortalı (المؤمَّن له) · Lehtar (المستفيد).',
    },
    relatedTerms: ['Sözleşme', 'Tazminat', 'SGK'],
    confusableTerms: ['Sosyal Güvenlik (SGK)'],
    synonyms: ['Sigorta Poliçesi'],
    source: {
      authority: 'Mevzuat Bilgi Sistemi',
      documentTitle: '6102 sayılı Türk Ticaret Kanunu',
      lawNumber: '6102',
      articleNumber: 'Madde 1401',
      jurisdiction: 'Turkish Law',
      verificationDate: '2026-10-15',
      status: 'Current',
    },
    searchCount: 270,
    difficulty: 'Beginner',
  }),
  makeTerm3({
    id: 'trm-sirket-ana-sozlesmesi',
    turkishTerm: 'Şirket Ana Sözleşmesi / Esas Sözleşme',
    arabicTerm: 'عقد تأسيس الشركة / النظام الأساسي للشركة',
    turkishPronunciation: 'şir-ket a-na söz-leş-me-si',
    arabicPronunciation: 'ʿaqd taʾsīs ash-sharika / an-niẓām al-asāsī',
    turkishDefinition:
      'Bir ticaret şirketinin unvanını, merkezini, faaliyet konusunu, sermayesini, ortaklık yapısını, yönetim ve temsil esaslarını belirleyen ve ticaret siciline tescil edilen temel kuruluş belgesidir.',
    arabicDefinition:
      'الوثيقة التأسيسية الجوهرية للشركة التي تحدد اسمها التجاري ومركزها الرئيسي وغرضها ورأسمالها وحصص الشركاء ونظام إدارتها وتمثيلها وتُسجل في السجل التجاري.',
    turkishExamples: [
      {
        tr: 'Şirketin faaliyet konusunun genişletilebilmesi için esas sözleşme değişikliğinin genel kurulca onaylanıp tescil edilmesi gerekir.',
        ar: 'لتوسيع غرض الشركة، يجب اعتماد تعديل النظام الأساسي من الجمعية العامة وقيده في السجل التجاري.',
      },
    ],
    arabicExamples: [
      {
        ar: 'يُحرر عقد تأسيس الشركة ذات المسؤولية المحدودة والنظام الأساسي للشركة المساهمة وفق النماذج المعتمدة.',
        tr: 'Limited şirket kuruluş sözleşmesi ve anonim şirket esas sözleşmesi onaylı örneklere göre düzenlenir.',
      },
    ],
    specializationId: 'commercial-corporate',
    documentTypes: ['Company Formation Documents', 'Commercial Registry Documents', 'Contracts'],
    contractType: 'Company Formation Agreement',
    issuingAuthority: 'Ticaret Bakanlığı / MERSİS / الهيئة العامة للاستثمار',
    jurisdiction: 'Comparative Law',
    legislativeClassification: 'Turkish Legislative Term',
    translationClassification: 'Exact Legal Equivalent',
    verificationStatus: 'Officially Verified',
    legalContext: {
      tr: 'TTK’da Limited Şirkette "Şirket Sözleşmesi", Anonim Şirkette "Esas Sözleşme" terimi kullanılır; uygulamada "Ana Sözleşme" de yaygındır.',
      ar: 'في مصر يُفرّق في الشركات المساهمة بين «العقد الابتدائي للتأسيس» و«النظام الأساسي»، وفي ذات المسؤولية المحدودة يُسمى «عقد التأسيس».',
    },
    comparativeAnalysis: {
      originDefinition: 'Şirketin kurucu anayasası niteliğindeki tescilli sözleşme.',
      targetConcept: 'عقد تأسيس الشركة والنظام الأساسي.',
      meaningDifferences: 'Türkiye’de tek belge (MERSİS üzerinden) hem kuruluşu hem işleyişi düzenler.',
      legalEffectsDifferences: 'Tescil ile tüzel kişilik doğar.',
      proceduralDifferences: 'Türkiye’de imza süreci ticaret sicili müdürlüğünde veya noter huzurunda tamamlanır.',
      recommendedTranslation: 'عقد تأسيس الشركة / النظام الأساسي للشركة',
      alternativeTranslations: ['العقد التأسيسي للشركة'],
      commonMistakes: ['"Tadil Tasarısı" (مشروع تعديل النظام الأساسي) ile ilk kuruluş sözleşmesini karıştırmak.'],
    },
    translatorNotes: {
      tr: 'Limited şirkette "عقد تأسيس الشركة", Anonim şirkette "النظام الأساسي للشركة" tercihi daha yerindedir.',
      ar: 'استخدم «عقد تأسيس الشركة» للشركة محدودة المسؤولية، و«النظام الأساسي» للشركة المساهمة.',
    },
    relatedTerms: ['Ticaret Sicili', 'Limited Şirket', 'Anonim Şirket', 'İmza Sirküleri'],
    confusableTerms: ['İç Yönerge (التوجيه الداخلي)'],
    synonyms: ['Kuruluş Sözleşmesi'],
    source: {
      authority: 'Ticaret Bakanlığı / Mevzuat',
      documentTitle: '6102 sayılı Türk Ticaret Kanunu m. 339, 576',
      lawNumber: '6102',
      articleNumber: 'Madde 339 / 576',
      jurisdiction: 'Turkish Law',
      verificationDate: '2026-10-15',
      status: 'Current',
    },
    searchCount: 350,
    difficulty: 'Intermediate',
  }),
];
