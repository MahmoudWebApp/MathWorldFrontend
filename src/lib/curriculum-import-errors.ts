/**
 * Human-readable editorial import diagnostics. Keep backend error codes as the
 * source of truth: unknown codes are shown verbatim instead of hidden.
 */
const messages: Record<string, { ar: string; en: string }> = {
  InvalidContentKey: { ar: 'مفتاح المحتوى غير صالح (3–80 حرفاً إنكليزياً صغيراً أو رقماً أو _ أو -).', en: 'Invalid content key (3–80 lowercase letters, digits, _ or -).' },
  DuplicateContentKey: { ar: 'مفتاح المحتوى مكرر في الملف.', en: 'Duplicate content key in this file.' },
  DuplicateContentKeyInBatch: { ar: 'مفتاح المحتوى مكرر في الدفعة.', en: 'Duplicate content key in this batch.' },
  UnknownStage: { ar: 'معرّف المرحلة غير موجود.', en: 'Unknown educational stage ID.' },
  UnknownCategory: { ar: 'معرّف الفئة غير موجود.', en: 'Unknown category ID.' },
  CategoryStageMismatch: { ar: 'الفئة لا تنتمي إلى المرحلة المختارة.', en: 'Category does not belong to the selected stage.' },
  InvalidOrder: { ar: 'الترتيب يجب أن يكون من 0 إلى 999.', en: 'Order must be between 0 and 999.' },
  InvalidBilingualName: { ar: 'اسم الفئة بالعربية أو الإنكليزية غير صالح (2–160 حرفاً).', en: 'Arabic/English category name must be 2–160 characters.' },
  InvalidSuggestedIconKey: { ar: 'رمز الأيقونة يجب أن يبدأ بحرف إنكليزي صغير ويمكن أن يحتوي أحرفاً وأرقاماً وشرطات.', en: 'Icon key must begin with a lowercase letter and use lowercase letters, digits or hyphens.' },
  ReviewStatusMustBeProposed: { ar: 'حالة المراجعة يجب أن تكون Proposed.', en: 'Review status must be Proposed.' },
  NotesTooLong: { ar: 'ملاحظة الفئة أطول من 500 حرف.', en: 'Category note exceeds 500 characters.' },
  DuplicateArabicNameInBatch: { ar: 'اسم الفئة العربي مكرر بنفس المرحلة في الملف.', en: 'Duplicate Arabic name in this stage in the file.' },
  DuplicateEnglishNameInBatch: { ar: 'اسم الفئة الإنكليزي مكرر بنفس المرحلة في الملف.', en: 'Duplicate English name in this stage in the file.' },
  ArabicNameAlreadyExists: { ar: 'اسم الفئة العربي موجود مسبقاً في هذه المرحلة.', en: 'Arabic category name already exists in this stage.' },
  EnglishNameAlreadyExists: { ar: 'اسم الفئة الإنكليزي موجود مسبقاً في هذه المرحلة.', en: 'English category name already exists in this stage.' },
  MissingBilingualContent: { ar: 'السؤال أو الحل مفقود بالعربية أو الإنكليزية.', en: 'Missing Arabic/English question or worked solution.' },
  DuplicateQuestionInBatch: { ar: 'السؤال مكرر في الدفعة.', en: 'Duplicate question in this batch.' },
  QuestionAlreadyExistsInStage: { ar: 'السؤال موجود مسبقاً ضمن المرحلة.', en: 'Question already exists in this stage.' },
  InvalidPoints: { ar: 'النقاط يجب أن تكون بين 1 و100000.', en: 'Points must be between 1 and 100000.' },
  ExactlyFourOptionsRequired: { ar: 'مطلوب أربعة خيارات بالضبط.', en: 'Exactly four options are required.' },
  EmptyOption: { ar: 'يوجد خيار فارغ.', en: 'An answer option is empty.' },
  ExactlyOneCorrectOptionRequired: { ar: 'يجب تحديد إجابة صحيحة واحدة فقط.', en: 'Exactly one correct option is required.' },
  InvalidOptionOrder: { ar: 'ترتيب الخيارات غير صالح.', en: 'Invalid option ordering.' },
  DuplicateOptions: { ar: 'هناك خيارات إجابة مكررة.', en: 'Duplicate answer options.' },
  NullProblem: { ar: 'صف مسألة فارغ.', en: 'Empty question row.' },
  NullCategory: { ar: 'صف فئة فارغ.', en: 'Empty category row.' },
};

export function curriculumImportError(code: string, isArabic: boolean): string {
  const known = messages[code];
  return known ? (isArabic ? known.ar : known.en) : code;
}
