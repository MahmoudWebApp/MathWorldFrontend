import { BookOpenCheck, LockOpen, Lightbulb, FileDown, ChartNoAxesCombined, Sparkles, GraduationCap, ShieldCheck } from 'lucide-react';

// Single source for all web plan comparisons and paywall explanations.
// Add newly shipped Premium benefits here; do not advertise disabled capabilities.
export const premiumBenefits = [
  { id:'practice', icon:BookOpenCheck, ar:'حل عدد غير محدود من المسائل في جميع الفئات', en:'Unlimited problems in all categories' },
  { id:'topics', icon:LockOpen, ar:'فتح جميع فئات الصف أو المساق الحالي', en:'Unlock all topics in the selected grade or course' },
  { id:'hints', icon:Lightbulb, ar:'تلميحات متدرجة تساعد على حل المسائل', en:'Progressive hints to help solve problems' },
  { id:'documents', icon:FileDown, ar:'تحميل السؤال وطريقة الحل بصيغتي PDF وWord بعد الإجابة الصحيحة', en:'Download the question and solution as PDF and Word after a correct answer' },
  { id:'analytics', icon:ChartNoAxesCombined, ar:'تقارير وإحصائيات شخصية مع تصدير PDF وExcel', en:'Personal analytics with PDF and Excel reports' },
  { id:'challenge', icon:Sparkles, ar:'تحدٍ يومي تفاعلي حتى خمس مسائل متتالية', en:'Sequential daily challenge with up to five questions' },
  { id:'exams', icon:GraduationCap, ar:'امتحانات مخصصة وشهادة عند الاجتياز', en:'Custom exams with a certificate on passing' },
  { id:'adfree', icon:ShieldCheck, ar:'بدون إعلانات ضمن MathWorld', en:'Ad-free MathWorld' },
] as const;

export function getPremiumBenefits(examsEnabled=false){
  return premiumBenefits.filter(item=>item.id!=='exams'||examsEnabled);
}
