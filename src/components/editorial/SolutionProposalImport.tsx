'use client';
import {useRef,useState} from 'react';
import type {EditorialSolution} from '@/store/api/platformBrandApi';
import {selectSolutionProposal,type SolutionSource,type SolutionSelection} from './selectSolutionProposal';
import {LatexPreview} from '@/components/ui/LatexPreview';

type Props={ar:boolean;source:SolutionSource;onApply:(patch:Partial<EditorialSolution>)=>void};
export function SolutionProposalImport({ar,source,onApply}:Props){
  const [selection,setSelection]=useState<SolutionSelection>();
  const [formula,setFormula]=useState('');
  const [reading,setReading]=useState(false);
  const latest=useRef(0);
  async function load(file?:File){
    const request=++latest.current;
    setSelection(undefined);setFormula('');setReading(false);
    if(!file)return;
    if(file.size>2_000_000){setSelection({kind:'invalid'});return;}
    setReading(true);
    try{
      const next=selectSolutionProposal(JSON.parse(await file.text()),source);
      if(request===latest.current)setSelection(next);
    }catch{if(request===latest.current)setSelection({kind:'invalid'});}
    finally{if(request===latest.current)setReading(false);}
  }
  const labels={missing:ar?'لا يوجد اقتراح لهذه المسألة.':'No proposal for this question.',
    stale:ar?'تغيّر السؤال أو الإجابة أو الحل الأصلي منذ إعداد الاقتراح.':'The question, correct option or original solution has changed.',
    invalid:ar?'ملف اقتراحات غير صالح.':'Invalid proposal file.'};
  return <details className="rounded-xl border p-3 text-sm space-y-3">
    <summary className="cursor-pointer font-semibold">{ar?'استيراد قانون وشرح مقترح':'Import proposed rule and explanation'}</summary>
    <p className="text-muted-foreground">{ar?'يُطابق الاقتراح مع النصين والحل السابق والخيار الصحيح. يعبّئ الفكرة وخطوة الشرح فقط، ويمكن اختيار القانون. أكمل التحقق والنتيجة والوحدة والخطأ الشائع قبل إرسال المسودة. لا حفظ أو نشر تلقائي.':'Checks both question texts, previous solution and correct option. Prefills the idea and explanation step; optionally select a formula. Complete verification, result, unit and common error before submitting. Nothing is automatically saved or published.'}</p>
    <input type="file" accept=".json,application/json" aria-label={ar?'ملف الحلول المقترحة':'Solution proposal file'} disabled={reading} onChange={e=>void load(e.target.files?.[0])}/>
    {reading&&<p role="status">{ar?'جارٍ قراءة الملف…':'Reading file…'}</p>}
    {selection&&(selection.kind==='ready'?<>
      <div className="space-y-2 rounded-lg border p-2">
        <p lang="ar" dir="rtl">{selection.idea.Ar}</p><p lang="en" dir="ltr">{selection.idea.En}</p>
        <p lang="ar" dir="rtl">{selection.step.Ar}</p><p lang="en" dir="ltr">{selection.step.En}</p>
      </div>
      {selection.formulaChoices.length>0&&<fieldset className="space-y-2">
        <legend>{ar?'اختر صيغة القانون إن كانت مناسبة':'Choose the formula if appropriate'}</legend>
        <label className="flex gap-2"><input type="radio" name="candidate-formula" checked={formula===''} onChange={()=>setFormula('')}/>{ar?'إدخال القانون يدوياً':'Enter formula manually'}</label>
        {selection.formulaChoices.map((f,i)=><label key={i} className="flex gap-2"><input type="radio" name="candidate-formula" checked={formula===f} onChange={()=>setFormula(f)}/><LatexPreview latex={f}/></label>)}
      </fieldset>}
      <button type="button" className="rounded-xl border px-3 py-2 font-semibold" onClick={()=>{onApply({Idea:selection.idea,Steps:[selection.step],...(formula?{FormulaLatex:formula}:{})});setSelection(undefined);}}>{ar?'استخدام الشرح في المسودة':'Use explanation in draft'}</button>
    </>:<p role="alert">{labels[selection.kind]}</p>)}
  </details>;
}
