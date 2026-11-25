'use client';
import { BookOpen } from 'lucide-react';
import { getStageAccent } from '@/lib/stageVisuals';
import { WorkspacePageHeader } from '@/components/ui/WorkspacePageHeader';
import { MathWorldLoading } from '@/components/ui/MathWorldLoading';
import {useEffect,useRef, useState} from 'react';
import {useGetProblemQuery,useDeleteProblemMutation} from '@/store/api/problemsApi';
import {Dialog,DialogContent,DialogHeader,DialogTitle} from '@/components/ui/Dialog';
import {Link} from '@/i18n/routing';
import {combineEditorialFiles, MAX_BATCH_BYTES, type BatchIssue} from './editorialBatchFiles';
import {Tabs,TabsList,TabsTrigger,TabsContent} from '@/components/ui/Tabs';
import {useLocale} from 'next-intl';
import {ReviewedBankImport} from './ReviewedBankImport';
import {AmendmentBatchImport} from './AmendmentBatchImport';
import {HintProposalImport} from './HintProposalImport';
import {SolutionProposalImport} from './SolutionProposalImport';
import {LatexPreview} from '@/components/ui/LatexPreview';
import {useImportEditorialBatchMutation,type EditorialImportRow,type EditorialImportResult,useGetEditorialBankQuery,useAmendEditorialProblemMutation,useGetEditorialDraftsQuery,useGetEditorialDraftQuery,useGetEditorialClassificationQuery,useSaveEditorialDraftMutation,useEditorialActionMutation,type EditorialContent,type EditorialDraft,type Bilingual,type EditorialSolution} from '@/store/api/platformBrandApi';

const input='w-full rounded-xl border bg-background p-2.5 text-sm';
const btn='rounded-xl border px-3 py-2 text-sm font-semibold disabled:opacity-50';
const pair=():Bilingual=>({Ar:'',En:''});
const empty=():EditorialContent=>({StageId:0,CategoryId:0,PrimarySkillId:0,SecondarySkillIds:[],TrackIds:[],DifficultyLevel:1,Points:10,Title:pair(),Question:pair(),Options:Array.from({length:4},(_,i)=>({LatexCode:'',IsCorrect:i===0,ErrorType:'',Reason:pair()})),Hints:[pair(),pair()],Solution:{Idea:pair(),FormulaLatex:'',Steps:[pair()],Substitution:pair(),Result:pair(),Unit:pair(),Verification:pair(),CommonError:pair()}});
const labels:Record<string,[string,string]>={Withdrawn:['مسحوبة','Withdrawn'],Draft:['مسودة','Draft'],NeedsChanges:['تحتاج تعديلات','Needs changes'],PendingReview:['بانتظار المراجعة','Pending review'],Approved:['معتمدة','Approved'],Published:['منشورة','Published']};
const errors:Record<string,[string,string]>={AmendmentSourceChanged:['تغيّر المصدر، يجب بدء مراجعة جديدة','Source changed; start a new review'],AmendmentQuestionImmutable:['هذه المراجعة تحافظ على نص السؤال والخيارات والنقاط والفئة','This review preserves question, options, points and category'],AmendmentTrackRemoval:['لا يمكن حذف ارتباط مسار قائم','Existing track links must be preserved'],AmendmentSkillRemoval:['لا يمكن حذف المهارة الحالية أو تغيير الأساسية','Existing skills and primary skill must be preserved'],AmendmentAlreadyOpen:['توجد مراجعة مفتوحة لهذه المسألة','An open review already exists'],ClassificationRequired:['اختر المرحلة والفئة والمهارة والمسار','Choose stage, category, skill and track'],InvalidSecondarySkills:['راجع المهارات المساندة','Check secondary skills'],InvalidDifficultyOrPoints:['راجع الصعوبة والنقاط','Check difficulty and points'],BilingualQuestionRequired:['أكمل العنوان والسؤال باللغتين','Complete bilingual title and question'],FourDistinctOptionsOneCorrect:['أربعة خيارات مختلفة وصحيح واحد','Four distinct options, exactly one correct'],DistractorReasonsRequired:['أكمل نوع وسبب كل خطأ','Complete distractor types and reasons'],TwoDistinctBilingualHintsRequired:['أكمل تلميحين مختلفين باللغتين','Complete two distinct bilingual hints'],StructuredSolutionRequired:['أكمل القانون والخطوات وجميع حقول الحل','Complete formula, steps and solution fields'],SolutionTooLong:['طريقة الحل طويلة جداً','Solution is too long'],CategoryStageMismatch:['الفئة لا تتبع المرحلة','Category/stage mismatch'],SkillCategoryMismatch:['المهارة لا تتبع الفئة','Skill/category mismatch'],TrackStageMismatch:['المسار لا يتبع المرحلة','Track/stage mismatch'],QuestionAlreadyExists:['السؤال موجود مسبقاً','Question already exists'],EditorialPublicationDisabled:['النشر معطّل حتى اكتمال إصدار الحل الآمن','Publication disabled pending secure solve release'],DraftChangedOrLocked:['المسودة تغيرت أو أصبحت مقفلة','Draft changed or is locked']};
function PairField({label,value,onChange,disabled=false}:{label:string;value:Bilingual;onChange:(p:Bilingual)=>void;disabled?:boolean}){
  return <fieldset disabled={disabled} className="space-y-1"><legend className="text-sm font-semibold">{label}</legend><div className="grid gap-2 sm:grid-cols-2"><textarea aria-label={label+' AR'} dir="rtl" placeholder="العربية" className={input} value={value.Ar} onChange={e=>onChange({...value,Ar:e.target.value})}/><textarea aria-label={label+' EN'} dir="ltr" placeholder="English" className={input} value={value.En} onChange={e=>onChange({...value,En:e.target.value})}/></div></fieldset>;
}
function MathPreview({value}:{value:string}) {
  return <div className="whitespace-pre-wrap break-words">{value.split(/(\$\$[\s\S]*?\$\$|\$[^$\n]+\$)/g).map((p,i)=>p.startsWith('$$')&&p.endsWith('$$')?<LatexPreview key={i} latex={p.slice(2,-2)} block/>:p.startsWith('$')&&p.endsWith('$')?<LatexPreview key={i} latex={p.slice(1,-1)}/>:<span key={i}>{p}</span>)}</div>;
}
function Wizard({initial,initialStage=0,initialCategory=0,admin,canSubmit,onSaved,onClose}:{initial?:EditorialDraft;initialStage?:number;initialCategory?:number;admin:boolean;canSubmit:boolean;onSaved:(id:number)=>void;onClose:()=>void}){
  const ar=useLocale()==='ar';const [draft,setDraft]=useState(initial);const [content,setContent]=useState<EditorialContent>(()=>{const base={...empty(),StageId:initialStage,CategoryId:initialCategory};const p=initial?.Content;return p?{...base,...p,Title:p.Title??base.Title,Question:p.Question??base.Question,Options:p.Options?.length===4?p.Options.map(o=>({...o,Reason:o.Reason??pair()})):base.Options,Hints:p.Hints?.length===2?p.Hints:base.Hints,Solution:p.Solution?{...base.Solution,...p.Solution,Idea:p.Solution.Idea??base.Solution.Idea,Steps:p.Solution.Steps??base.Solution.Steps,Substitution:p.Solution.Substitution??base.Solution.Substitution,Result:p.Solution.Result??base.Solution.Result,Unit:p.Solution.Unit??base.Solution.Unit,Verification:p.Solution.Verification??base.Solution.Verification,CommonError:p.Solution.CommonError??base.Solution.CommonError}:base.Solution,TrackIds:p.TrackIds??[],SecondarySkillIds:p.SecondarySkillIds??[]}:base;});
  const [step,setStep]=useState(0);const [note,setNote]=useState('');const [message,setMessage]=useState('');const [error,setError]=useState<string[]>([]);const [dirty,setDirty]=useState(false);
  const [save,{isLoading:saving}]=useSaveEditorialDraftMutation();const [action,{isLoading:acting}]=useEditorialActionMutation();
  const inventory=useGetEditorialClassificationQuery(content.StageId);
  const amendment=!!draft?.SourceProblemId;
  const [processing,setProcessing]=useState(false);
  const busy=saving||acting||processing;const editable=!draft||['Draft','NeedsChanges'].includes(draft.Status);const disabled=!editable||busy;
  const steps=ar?['التصنيف','السؤال','الخيارات','التلميحات','طريقة الحل','المعاينة والمراجعة']:['Classification','Question','Options','Hints','Solution','Preview and review'];
  function patch(p:Partial<EditorialContent>){setContent(c=>({...c,...p}));setDirty(true);setMessage('');}
  function patchSolution(p:Partial<EditorialSolution>){patch({Solution:{...content.Solution,...p}});}
  function failure(e:unknown){const x=e as {data?:{message?:string;errors?:Record<string,string[]>}};const codes=x.data?.errors?.validation??[x.data?.message??'Request failed'];setError(codes.map(c=>errors[c]?.[ar?0:1]??c));}
  async function store(){setError([]);setMessage('');try{const d=await save({id:draft?.Id,Revision:draft?.Revision??0,Content:content}).unwrap();setDraft(d);setDirty(false);setMessage(ar?'تم حفظ المسودة':'Draft saved');onSaved(d.Id);return d;}catch(e){failure(e);return null;}}
  async function transition(name:'submit'|'review'|'publish'|'withdraw',confirm?:boolean){setError([]);setMessage('');if(!draft||dirty)return;try{const d=await action({id:draft.Id,Revision:draft.Revision,action:name,Note:note,Confirm:confirm}).unwrap();setDraft(d);setNote('');setMessage(ar?'تم تحديث حالة المسودة':'Draft status updated');onSaved(d.Id);}catch(e){failure(e);}}
  async function completeProblem(){
    if(busy||!canSubmit)return;
    if(admin&&!window.confirm(ar?'تأكيد اعتماد ونشر المسألة للطلاب؟':'Confirm approval and publication to learners?'))return;
    setProcessing(true);setError([]);setMessage('');
    try{
      let current=draft;
      if(!current||dirty){const saved=await store();if(!saved)return;current=saved;}
      if(!current)return;
      if(admin&&['Draft','NeedsChanges','PendingReview','Approved'].includes(current.Status)){
        current=await action({id:current.Id,Revision:current.Revision,action:'publish',DirectApproval:true,Confirm:true,Note:note.trim()||(ar?'اعتماد مباشر بواسطة الأدمن':'Approved directly by administrator')}).unwrap();setDraft(current);onSaved(current.Id);
      }else if(!admin&&['Draft','NeedsChanges'].includes(current.Status)){
        current=await action({id:current.Id,Revision:current.Revision,action:'submit'}).unwrap();setDraft(current);onSaved(current.Id);
      }
      if(current.Status!==(admin?'Published':'PendingReview'))throw Error('UnexpectedEditorialStatus');
      setMessage(admin?(ar?'تم نشر المسألة بنجاح':'Problem published'):(ar?'تم إرسال المسألة للموافقة':'Problem submitted for approval'));setNote('');
    }catch(e){failure(e);}finally{setProcessing(false);}
  }
  const pick=(id:number,arr:number[])=>arr.includes(id)?arr.filter(x=>x!==id):[...arr,id];
  const n=(x:{NameAr:string;NameEn:string})=>ar?x.NameAr:x.NameEn;
  const showPair=(p:Bilingual)=>ar?p.Ar:p.En;
  const close=()=>{if(!dirty||window.confirm(ar?'توجد تغييرات غير محفوظة. هل تريد إغلاق المحرر؟':'Unsaved changes. Close the editor?'))onClose();};
  return <section className="space-y-4 rounded-2xl border bg-card p-4">
    <div className="flex flex-wrap justify-between gap-2"><h2 className="text-xl font-bold">{draft?'#'+draft.Id:ar?'مسألة جديدة':'New problem'} · {labels[draft?.Status??'Draft']?.[ar?0:1]}</h2><button className={btn} onClick={close}>{ar?'إغلاق':'Close'}</button></div>
    {amendment&&<aside className="rounded-xl border p-3 text-sm space-y-2"><p className="font-bold">{ar?'مراجعة المسألة المنشورة':'Review existing problem'} #{draft?.SourceProblemId}</p><p>{ar?'تبقى المسألة ومعرفات خياراتها وتاريخ الطالب كما هي. يمكنك تحسين الشرح والتلميحات وإضافة روابط تصنيف معتمدة، دون تغيير السؤال أو الإجابة.':'The original problem, option IDs and learner history remain unchanged. Improve the explanation and hints and add reviewed links without changing the question or answer.'}</p><details><summary className="cursor-pointer">{ar?'الحل السابق للمقارنة':'Previous solution for comparison'}</summary><MathPreview value={(ar?draft?.LegacySolutionAr:draft?.LegacySolutionEn)??''}/></details></aside>}
    {draft?.ReviewNote&&<p className="rounded-xl border p-3 text-sm">{ar?'ملاحظة المراجع: ':'Review note: '}{draft.ReviewNote}</p>}
    <nav className="grid grid-cols-2 gap-2 sm:grid-cols-3" aria-label={ar?'خطوات المحرر':'Editor steps'}>{steps.map((label,i)=><button key={i} className={btn+(step===i?' border-primary bg-primary/10':'')} aria-current={step===i?'step':undefined} onClick={()=>setStep(i)}>{i+1}. {label}</button>)}</nav>
    <fieldset disabled={disabled} className="space-y-4">
      {step===0&&<>
        {inventory.isError&&<p role="alert">{ar?'تعذّر تحميل التصنيف':'Could not load classification'}</p>}
        <label className="block text-sm">{ar?'المرحلة':'Stage'}<select className={input} disabled={amendment} value={content.StageId} onChange={e=>patch({StageId:Number(e.target.value),CategoryId:0,PrimarySkillId:0,SecondarySkillIds:[],TrackIds:[]})}><option value={0}>—</option>{inventory.data?.Stages.map(x=><option key={x.Id} value={x.Id}>{n(x)}</option>)}</select></label>
        <fieldset><legend className="text-sm font-semibold">{ar?'الصفوف والمساقات':'Grades and courses'}</legend><div className="grid gap-2 sm:grid-cols-2">{inventory.currentData?.Tracks.map(x=><label className="flex items-center gap-2 text-sm" key={x.Id}><input type="checkbox" disabled={amendment&&!!initial?.Content.TrackIds?.includes(x.Id)} checked={content.TrackIds.includes(x.Id)} onChange={()=>patch({TrackIds:pick(x.Id,content.TrackIds)})}/>{n(x)}</label>)}</div></fieldset>
        <label className="block text-sm">{ar?'الفئة':'Category'}<select className={input} disabled={amendment} value={content.CategoryId} onChange={e=>patch({CategoryId:Number(e.target.value),PrimarySkillId:0,SecondarySkillIds:[]})}><option value={0}>—</option>{inventory.currentData?.Categories.map(x=><option key={x.Id} value={x.Id}>{n(x)}</option>)}</select></label>
        <label className="block text-sm">{ar?'المهارة الأساسية':'Primary skill'}<select className={input} disabled={amendment&&!!initial?.Content.PrimarySkillId} value={content.PrimarySkillId} onChange={e=>patch({PrimarySkillId:Number(e.target.value),SecondarySkillIds:content.SecondarySkillIds.filter(x=>x!==Number(e.target.value))})}><option value={0}>—</option>{inventory.currentData?.Skills.filter(x=>x.CategoryId===content.CategoryId).map(x=><option key={x.Id} value={x.Id}>{n(x)}</option>)}</select></label>
        <fieldset><legend className="text-sm font-semibold">{ar?'المهارات المساندة':'Secondary skills'}</legend>{inventory.currentData?.Skills.filter(x=>x.CategoryId===content.CategoryId&&x.Id!==content.PrimarySkillId).map(x=><label className="flex items-center gap-2 text-sm" key={x.Id}><input type="checkbox" disabled={amendment&&!!initial?.Content.SecondarySkillIds?.includes(x.Id)} checked={content.SecondarySkillIds.includes(x.Id)} onChange={()=>patch({SecondarySkillIds:pick(x.Id,content.SecondarySkillIds)})}/>{n(x)}</label>)}</fieldset>
        <div className="grid gap-2 sm:grid-cols-2"><label>{ar?'الصعوبة':'Difficulty'}<select className={input} value={content.DifficultyLevel} onChange={e=>patch({DifficultyLevel:Number(e.target.value)})}>{[1,2,3,4,5].map(x=><option key={x} value={x}>{x}</option>)}</select></label><label>{ar?'النقاط':'Points'}<input type="number" min={1} max={100000} className={input} disabled={amendment} value={content.Points} onChange={e=>patch({Points:Number(e.target.value)})}/></label></div>
      </>}
      {step===1&&<><PairField label={ar?'العنوان':'Title'} value={content.Title} onChange={v=>patch({Title:v})}/><PairField label={ar?'السؤال (يدعم LaTeX بين علامتي الدولار)':'Question (LaTeX between dollar signs)'} disabled={amendment} value={content.Question} onChange={v=>patch({Question:v})}/><MathPreview value={showPair(content.Question)}/></>}
      {step===2&&content.Options.map((o,i)=><div className="space-y-2 rounded-xl border p-3" key={i}><label className="flex gap-2"><input type="radio" name="correct-option" disabled={amendment} checked={o.IsCorrect} onChange={()=>patch({Options:content.Options.map((x,j)=>({...x,IsCorrect:j===i}))})}/>{ar?'الخيار الصحيح':'Correct option'} {i+1}</label><input aria-label={(ar?'الخيار':'Option')+' '+(i+1)} dir="ltr" className={input} disabled={amendment} value={o.LatexCode} onChange={e=>patch({Options:content.Options.map((x,j)=>j===i?{...x,LatexCode:e.target.value}:x)})}/><LatexPreview latex={o.LatexCode}/>{!o.IsCorrect&&<><label className="block text-sm">{ar?'نوع الخطأ':'Error type'}<input className={input} value={o.ErrorType} onChange={e=>patch({Options:content.Options.map((x,j)=>j===i?{...x,ErrorType:e.target.value}:x)})}/></label><PairField label={ar?'سبب الخطأ':'Reason'} value={o.Reason} onChange={v=>patch({Options:content.Options.map((x,j)=>j===i?{...x,Reason:v}:x)})}/></>}</div>)}
      {step===3&&<>
        {editable && draft?.SourceProblemId && content.Hints.every(h => !h?.Ar?.trim() && !h?.En?.trim()) ?
          <HintProposalImport key={draft.Id} ar={ar} problemId={draft.SourceProblemId} question={content.Question}
            onApply={Hints => patch({Hints})}/> : null}
        <p className="text-sm text-muted-foreground">{ar?'لا تكتب الإجابة النهائية ضمن التلميحات.':'Do not reveal the final answer in hints.'}</p>{content.Hints.map((h,i)=><PairField key={i} label={i===0?(ar?'تلميح القانون أو الفكرة':'Rule or concept hint'):(ar?'تلميح بداية الخطوة':'First-step hint')} value={h} onChange={v=>patch({Hints:content.Hints.map((x,j)=>j===i?v:x)})}/>)}</>}
      {step===4&&<>
        {editable&&draft?.SourceProblemId&&content.Options.filter(o=>o.IsCorrect).length===1&&
          !content.Solution.Idea.Ar.trim()&&!content.Solution.Idea.En.trim()&&
          content.Solution.Steps.every(s=>!s.Ar.trim()&&!s.En.trim())&&
          <SolutionProposalImport key={draft.Id} ar={ar} source={{problemId:draft.SourceProblemId,stageId:content.StageId,question:content.Question,
            legacy:{Ar:draft.LegacySolutionAr??'',En:draft.LegacySolutionEn??''},correctOption:content.Options.find(o=>o.IsCorrect)!.LatexCode}}
            onApply={p=>patchSolution(p)}/>}
        <PairField label={ar?'الفكرة والقانون':'Idea and rule'} value={content.Solution.Idea} onChange={v=>patchSolution({Idea:v})}/><label>{ar?'صيغة القانون LaTeX':'Formula LaTeX'}<input dir="ltr" className={input} value={content.Solution.FormulaLatex} onChange={e=>patchSolution({FormulaLatex:e.target.value})}/></label><LatexPreview latex={content.Solution.FormulaLatex} block/>
        {content.Solution.Steps.map((v,i)=><div key={i} className="rounded-xl border p-3 space-y-2"><PairField label={(ar?'الخطوة ':'Step ')+(i+1)} value={v} onChange={p=>patchSolution({Steps:content.Solution.Steps.map((x,j)=>j===i?p:x)})}/><div className="flex flex-wrap gap-2">{[-1,1].map(d=><button type="button" key={d} className={btn} disabled={i+d<0||i+d>=content.Solution.Steps.length} onClick={()=>{const a=[...content.Solution.Steps];[a[i],a[i+d]]=[a[i+d],a[i]];patchSolution({Steps:a});}}>{d<0?(ar?'للأعلى':'Move up'):(ar?'للأسفل':'Move down')}</button>)}<button className={btn} type="button" disabled={content.Solution.Steps.length===1} onClick={()=>patchSolution({Steps:content.Solution.Steps.filter((_,j)=>i!==j)})}>{ar?'حذف':'Remove'}</button></div></div>)}
        <button type="button" className={btn} disabled={content.Solution.Steps.length>=20} onClick={()=>patchSolution({Steps:[...content.Solution.Steps,pair()]})}>{ar?'إضافة خطوة':'Add step'}</button>
        {([['Substitution','التعويض','Substitution'],['Result','النتيجة','Result'],['Unit','الوحدة (بلا وحدة إن لم تنطبق)','Unit (unitless if not applicable)'],['Verification','التحقق','Verification'],['CommonError','الخطأ الشائع','Common error']] as const).map(([key,a,b])=><PairField key={key} label={ar?a:b} value={content.Solution[key]} onChange={v=>patchSolution({[key]:v})}/>)}</>}
    </fieldset>
    {step===5&&<div className="space-y-3 rounded-xl border p-4"><h3 className="font-bold">{showPair(content.Title)}</h3><MathPreview value={showPair(content.Question)}/>{content.Options.map((o,i)=><div className="rounded-lg border p-2" key={i}><LatexPreview latex={o.LatexCode}/>{o.IsCorrect&&<span className="ms-2 font-semibold text-emerald-600">{ar?'صحيح':'Correct'}</span>}{!o.IsCorrect&&<p className="text-sm">{o.ErrorType} · {showPair(o.Reason)}</p>}</div>)}<h4 className="font-bold">{ar?'التلميحات (معاينة إدارية فقط)':'Hints (editorial preview only)'}</h4>{content.Hints.map((h,i)=><MathPreview key={i} value={showPair(h)}/>)}<h4 className="font-bold">{ar?'طريقة الحل':'Solution'}</h4><MathPreview value={showPair(content.Solution.Idea)}/><LatexPreview latex={content.Solution.FormulaLatex} block/>{content.Solution.Steps.map((x,i)=><div key={i}>{i+1}. <MathPreview value={showPair(x)}/></div>)}{[content.Solution.Substitution,content.Solution.Result,content.Solution.Unit,content.Solution.Verification,content.Solution.CommonError].map((p,i)=><MathPreview key={i} value={showPair(p)}/>)}</div>}
    <div className="flex flex-wrap gap-2"><button className={btn} disabled={step===0} onClick={()=>setStep(i=>i-1)}>{ar?'السابق':'Previous'}</button><button className={btn} disabled={step===5} onClick={()=>setStep(i=>i+1)}>{ar?'التالي':'Next'}</button>{editable&&<button className={btn} disabled={busy||(!dirty&&!!draft)} onClick={()=>void store()}>{saving?(ar?'جارٍ الحفظ…':'Saving…'):(ar?'حفظ للمتابعة لاحقاً':'Save for later')}</button>}{editable&&canSubmit&&<button className={btn+' sr-wave-button text-white'} disabled={busy} onClick={()=>void completeProblem()}>{admin?(ar?'حفظ ونشر':'Save and publish'):(ar?'إرسال للموافقة':'Submit for approval')}</button>}</div>
    {dirty&&<p className="text-sm text-muted-foreground">{ar?'يمكنك حفظ المسألة للمتابعة لاحقاً، أو إرسالها مباشرة.':'Save for later or submit directly.'}</p>}
    {admin&&draft&&['PendingReview','Approved'].includes(draft.Status)&&<div className="space-y-2 rounded-xl border p-3"><label>{ar?'ملاحظات المراجع':'Review notes'}<textarea className={input} value={note} onChange={e=>setNote(e.target.value)}/></label><div className="flex flex-wrap gap-2"><button className={btn} disabled={busy||!note.trim()} onClick={()=>void transition('review',false)}>{ar?'إعادة للتعديل':'Return for changes'}</button>{draft.Status==='PendingReview'&&<button className={btn+' sr-wave-button text-white'} disabled={busy} onClick={()=>void completeProblem()}>{ar?'موافقة ونشر':'Approve and publish'}</button>}{draft.Status==='Approved'&&<button className={btn} disabled={busy} onClick={()=>{if(window.confirm(ar?'تأكيد نشر المسألة للطلاب؟':'Confirm publication to learners?'))void transition('publish',true);}}>{ar?'نشر المسألة':'Publish problem'}</button>}</div></div>}
    {draft&&!dirty&&(editable||(admin&&['PendingReview','Approved'].includes(draft.Status)))&&<button className={btn} disabled={busy} onClick={()=>{const reason=window.prompt(ar?'سبب سحب المسودة (سيبقى السجل محفوظاً)':'Reason for withdrawing the draft (history is retained)');if(reason?.trim()){setNote(reason);void action({id:draft.Id,action:'withdraw',Revision:draft.Revision,Note:reason}).unwrap().then(d=>{setDraft(d);setNote('');onSaved(d.Id);}).catch(failure);}}}>{ar?'سحب المسودة':'Withdraw draft'}</button>}
    {message&&<p role="status" className="text-sm text-primary">{message}</p>}{error.length>0&&<ul role="alert" className="list-inside list-disc text-sm text-destructive">{error.map((x,i)=><li key={i}>{x}</li>)}</ul>}
  </section>;
}
function Existing({id,...props}:{id:number;admin:boolean;canSubmit:boolean;onSaved:(id:number)=>void;onClose:()=>void}){const {currentData,isError,refetch}=useGetEditorialDraftQuery(id,{refetchOnMountOrArgChange:true});const ar=useLocale()==='ar';if(isError)return <button className={btn} onClick={()=>void refetch()}>{ar?'إعادة المحاولة':'Retry'}</button>;if(!currentData)return <p role="status">{ar?'جارٍ تحميل المسودة…':'Loading draft…'}</p>;return <Wizard key={id} initial={currentData} {...props}/>;}
function BatchImport(){
  const ar=useLocale()==='ar';const [rows,setRows]=useState<EditorialImportRow[]|null>(null);
  const [result,setResult]=useState<EditorialImportResult|null>(null);const [issues,setIssues]=useState<BatchIssue[]>([]);
  const [error,setError]=useState('');const [names,setNames]=useState<string[]>([]);
  const [reading,setReading]=useState(false);const latest=useRef(0);
  const [run,{isLoading}]=useImportEditorialBatchMutation();
  const busy=reading||isLoading;
  async function load(files:File[]){
    const request=++latest.current;
    setRows(null);setResult(null);setIssues([]);setError('');setNames([]);
    if(!files.length){setReading(false);return;}
    setReading(true);
    try{
      if(files.length>50||files.reduce((total,file)=>total+file.size,0)>MAX_BATCH_BYTES)throw Error('BatchLimit');
      const parsed=combineEditorialFiles(await Promise.all(files.map(async file=>({name:file.name,text:await file.text()}))));
      if(request!==latest.current)return;
      setRows(parsed);setNames(files.map(file=>file.name));
    }catch(e){
      if(request!==latest.current)return;
      const code=e instanceof Error?e.message:'';
      setError(code==='DuplicateContentKey'?(ar?'تكرر معرف محتوى بين الملفات.':'Duplicate content key across files.'):
        code==='BatchLimit'?(ar?'الحد الإجمالي 50 مسألة وأقل من 1.9 ميغابايت للدفعة.':'Combined limit: 50 problems and less than 1.9 MB.'):
        (ar?'ملف غير صالح: يجب أن يحتوي كل ملف على Items صالحة.':'Invalid file: each file must contain valid Items.'));
    }finally{if(request===latest.current)setReading(false);}
  }
  async function submit(confirm:boolean){
    if(!rows||busy)return;
    if(confirm&&!(result?.Ready&&result.Ready>0))return;
    setError('');setIssues([]);setResult(null);
    try{
      const value=await run({Items:rows,Confirm:confirm}).unwrap();
      setResult(value);if(confirm)setRows(null);
    }catch(e){
      const data=(e as {data?:{message?:string;editorialBatchIssues?:BatchIssue[]}}).data;
      setIssues(data?.editorialBatchIssues??[]);
      setError(data?.message==='EditorialBatchInvalid'?(ar?'الدفعة غير صالحة؛ لم تُحفظ أي مسودة. راجع أسباب الرفض أدناه.':'Batch validation failed; no drafts were saved. Review the errors below.'):(ar?'تعذّر استيراد الدفعة. أعد المعاينة للتحقق قبل المحاولة مجدداً.':'Could not import batch. Preview again before retrying.'));
    }
  }
  const batchErrors:Record<string,[string,string]>={SkillNotFound:['المهارة غير موجودة','Skill not found'],ImportClassificationMismatch:['التصنيف غير مطابق للمهارة','Classification does not match skill'],QuestionAlreadyExistsInBatch:['السؤال مكرر ضمن الدفعة','Duplicate question in batch'],QuestionAlreadyExistsInDraft:['السؤال موجود في مسودة أخرى','Question already exists in another draft'],DraftTooLarge:['المسودة كبيرة جداً','Draft too large']};
  return <details className="rounded-xl border p-4"><summary className="cursor-pointer font-bold">{ar?'استيراد دفعة مسودات':'Import draft batch'}</summary><div className="mt-3 space-y-3">
    <p className="text-sm text-muted-foreground">{ar?'اختر ملفاً أو عدة ملفات JSON (حتى 50 مسألة إجمالاً). تُراجع جميع الملفات معاً؛ المعاينة لا تحفظ شيئاً، والتأكيد ينشئ مسودات فقط دون نشر.':'Choose one or more JSON files (up to 50 problems total). All files are validated together; preview writes nothing and confirmation creates drafts only, never publishes.'}</p>
    <input type="file" multiple accept=".json,application/json" disabled={isLoading} aria-label={ar?'ملفات المسودات':'Draft files'} onChange={e=>void load(Array.from(e.target.files??[]))}/>
    {reading&&<p role="status">{ar?'جارٍ قراءة الملفات…':'Reading files…'}</p>}
    {names.length>0&&<p className="break-words text-sm">{names.join(' · ')}{rows?' · '+rows.length+' '+(ar?'مسألة':'problems'):''}</p>}
    <div className="flex flex-wrap gap-2"><button className={btn} disabled={!rows||busy} onClick={()=>void submit(false)}>{ar?'تحقق ومعاينة':'Validate and preview'}</button><button className={btn} disabled={!rows||busy||!(result?.Ready&&result.Ready>0)} onClick={()=>{if(window.confirm(ar?'إنشاء المسودات دون نشر؟':'Create drafts without publishing?'))void submit(true);}}>{ar?'إنشاء المسودات':'Create drafts'}</button></div>
    {result&&<div className="text-sm space-y-1" role="status"><p>{ar?'الجاهزة للإنشاء':'Ready to create'}: {result.Ready??0} · {ar?'المُنشأة':'Created'}: {result.Created}</p>{result.Items.map(row=><p key={row.ContentKey}>{row.ContentKey} · {row.Status==='AlreadyExists'?(ar?'موجودة مسبقاً':'Already exists'):(ar?'صالحة':'Validated')}</p>)}</div>}
    {error&&<p role="alert" className="text-destructive">{error}</p>}
    {issues.filter(row=>row.Status==='Invalid').map(row=><div key={row.ContentKey} className="rounded-lg border p-2 text-sm"><p className="font-semibold" dir="ltr">{row.ContentKey}</p><ul className="list-inside list-disc text-destructive">{row.Errors.map((code,index)=><li key={index}>{batchErrors[code]?.[ar?0:1]??errors[code]?.[ar?0:1]??code}</li>)}</ul></div>)}
  </div></details>;
}
function BankReview({onOpen,stage,category,setStage,setCategory}:{onOpen:(id:number)=>void;stage:number;category:number;setStage:(id:number)=>void;setCategory:(id:number)=>void}){
  const ar=useLocale()==='ar';const [page,setPage]=useState(1);const [error,setError]=useState('');const [preview,setPreview]=useState<number|null>(null);
  const detail=useGetProblemQuery({Id:preview??0},{skip:preview===null});const [remove,{isLoading:deleting}]=useDeleteProblemMutation();
  const inventory=useGetEditorialClassificationQuery(stage);
  const bank=useGetEditorialBankQuery({page,stageId:stage||undefined,categoryId:category||undefined},{refetchOnMountOrArgChange:true});
  const [amend,{isLoading}]=useAmendEditorialProblemMutation();
  async function open(id:number){setError('');try{const draft=await amend(id).unwrap();onOpen(draft.Id);}catch(e){const code=(e as {data?:{message?:string}}).data?.message??'';setError(errors[code]?.[ar?0:1]??(ar?'تعذّر فتح المراجعة':'Could not start review'));}}
  async function deleteLegacy(id:number){if(!window.confirm(ar?'تأكيد حذف هذه المسألة؟':'Confirm deletion of this problem?'))return;setError('');try{await remove(id).unwrap();await bank.refetch();}catch{setError(ar?'تعذّر الحذف. قد تكون المسألة مرتبطة بمحتوى أو بسجل طالب محمي.':'Deletion failed. The problem may be linked to protected content or learner history.');}}
  return <section className="space-y-3 rounded-xl border bg-card p-4">
    <div className="grid gap-2 sm:grid-cols-2"><select aria-label={ar?'المرحلة':'Stage'} className={input} value={stage} onChange={e=>{setStage(Number(e.target.value));setCategory(0);setPage(1);}}><option value={0}>{ar?'كل المراحل':'All stages'}</option>{inventory.data?.Stages.map(x=><option key={x.Id} value={x.Id}>{ar?x.NameAr:x.NameEn}</option>)}</select><select aria-label={ar?'الفئة':'Category'} className={input} value={category} disabled={!stage} onChange={e=>{setCategory(Number(e.target.value));setPage(1);}}><option value={0}>{ar?'كل الفئات':'All categories'}</option>{inventory.currentData?.Categories.map(x=><option key={x.Id} value={x.Id}>{ar?x.NameAr:x.NameEn}</option>)}</select></div>
    {bank.isError&&<button className={btn} onClick={()=>void bank.refetch()}>{ar?'إعادة المحاولة':'Retry'}</button>}{bank.isFetching&&!bank.currentData&&<MathWorldLoading compact mode="filter"/>}
    {bank.currentData&&<div className="overflow-x-auto rounded-xl border"><table className="mw-workspace-table min-w-[620px] text-sm"><thead><tr><th className="p-3 text-start">ID</th><th className="p-3 text-start">{ar?'المسألة':'Problem'}</th><th className="p-3 text-start">{ar?'الحالة':'Status'}</th><th className="p-3 text-end">{ar?'الإجراء':'Action'}</th></tr></thead><tbody>
      {bank.currentData.Items.map(row=><tr key={row.Id} className="border-b mw-topic-row" style={{'--stage-accent':getStageAccent({Id:row.StageId})} as import('react').CSSProperties}><td className="p-3 tabular-nums text-muted-foreground">#{row.Id}</td><td className="p-3 font-semibold"><MathPreview value={ar?row.TitleAr:row.TitleEn}/></td><td className="p-3"><span className="inline-flex rounded-lg px-2 py-1 text-xs font-semibold bg-card">{row.HasOpenReview?(ar?'مراجعة مفتوحة':'Review open'):row.HasStructuredSolution?(ar?'حل منظم':'Structured solution'):(ar?'يحتاج مراجعة':'Needs review')}</span></td><td className="p-3 text-end"><div className="flex flex-wrap justify-end gap-1"><button type="button" className={btn} onClick={()=>setPreview(row.Id)}>{ar?'عرض':'View'}</button><button className={btn+' mw-topic-action whitespace-nowrap'} disabled={isLoading||row.HasOpenReview} onClick={()=>void open(row.Id)}>{row.HasOpenReview?(ar?'في قائمة المراجعة':'In review queue'):(ar?'مراجعة':'Review')}</button>{!row.HasStructuredSolution&&!row.HasOpenReview&&<button type="button" className={btn+' text-destructive'} disabled={deleting} onClick={()=>void deleteLegacy(row.Id)}>{ar?'حذف':'Delete'}</button>}</div></td></tr>)}
      {!bank.currentData.Items.length&&<tr><td colSpan={4} className="p-6 text-center text-muted-foreground">{ar?'لا توجد مسائل مطابقة':'No matching problems'}</td></tr>}
    </tbody></table></div>}
    {error&&<p role="alert" className="text-destructive">{error}</p>}
    <Dialog open={preview!==null} onOpenChange={open=>{if(!open)setPreview(null);}}><DialogContent className="max-w-2xl"><DialogHeader><DialogTitle>{ar?'معاينة المسألة':'Problem preview'} #{preview}</DialogTitle></DialogHeader>
      {detail.isFetching?<MathWorldLoading compact/>:detail.isError||!detail.currentData?<p role="alert">{ar?'تعذّر تحميل المسألة':'Could not load problem'}</p>:'QuestionTextAr' in detail.currentData?<div className="space-y-3"><MathPreview value={ar?detail.currentData.QuestionTextAr:detail.currentData.QuestionTextEn}/>{detail.currentData.Options.map((o,i)=><div key={i} className={'rounded-lg border p-2 '+(o.IsCorrect?'border-emerald-500':'')}><LatexPreview latex={o.LatexCode}/></div>)}<h3 className="font-bold">{ar?'طريقة الحل':'Solution'}</h3><MathPreview value={ar?detail.currentData.DetailedSolutionAr:detail.currentData.DetailedSolutionEn}/>{detail.currentData.YoutubeSolutionUrl&&/^https:\/\/(www\.)?(youtube\.com|youtu\.be)\//i.test(detail.currentData.YoutubeSolutionUrl)&&<a href={detail.currentData.YoutubeSolutionUrl} target="_blank" rel="noreferrer" className="text-primary underline">{ar?'فيديو الحل':'Solution video'}</a>}</div>:<p>{ar?'المعاينة الإدارية غير متاحة':'Admin preview unavailable'}</p>}
    </DialogContent></Dialog>
    <div className="flex gap-2"><button className={btn} disabled={page===1} onClick={()=>setPage(p=>p-1)}>{ar?'السابق':'Previous'}</button><span>{page}</span><button className={btn} disabled={page*30>=(bank.currentData?.Total??0)} onClick={()=>setPage(p=>p+1)}>{ar?'التالي':'Next'}</button></div>
  </section>;
}
export function EditorialWorkspace({admin,canSubmit,initialStage=0,initialCategory=0,create=false,initialTab='published',embedded=false}:{admin:boolean;canSubmit:boolean;initialStage?:number;initialCategory?:number;create?:boolean;initialTab?:'published'|'requests';embedded?:boolean}){
  const ar=useLocale()==='ar';const [page,setPage]=useState(1);const [selected,setSelected]=useState<number|'new'|null>(create?'new':null);
  const [stage,setStage]=useState(initialStage);const [category,setCategory]=useState(initialCategory);
  const [tab,setTab]=useState<string>(admin?initialTab:'requests');
  const list=useGetEditorialDraftsQuery(admin?{page,activeOnly:true}:page,{refetchOnMountOrArgChange:true});
  useEffect(()=>{if(page>1&&list.currentData&&page>Math.max(1,Math.ceil(list.currentData.Total/30)))setPage(Math.max(1,Math.ceil(list.currentData.Total/30)));},[page,list.currentData]);
  const props={admin,canSubmit,onSaved:()=>{void list.refetch();},onClose:()=>setSelected(null)};
  const requests=<div className="space-y-3">
    {list.isError&&<button className={btn} onClick={()=>void list.refetch()}>{ar?'إعادة المحاولة':'Retry'}</button>}
    {list.isFetching&&!list.currentData&&<MathWorldLoading compact mode="tab"/>}
    {list.currentData&&<div className="overflow-x-auto rounded-xl border"><table className="mw-workspace-table min-w-[560px] text-sm">
      <thead><tr><th className="p-3 text-start">ID</th><th className="p-3 text-start">{ar?'المسألة':'Problem'}</th><th className="p-3 text-start">{ar?'الحالة':'Status'}</th><th className="p-3 text-end">{ar?'الإجراء':'Action'}</th></tr></thead><tbody>
      {list.currentData.Items.filter(d=>!admin||!['Published','Withdrawn'].includes(d.Status)).map(d=><tr key={d.Id} className="border-b"><td className="p-3 tabular-nums text-muted-foreground">#{d.SourceProblemId??d.Id}</td><td className="p-3 font-semibold"><MathPreview value={(ar?d.QuestionTextAr:d.QuestionTextEn)||(ar?'مسألة محفوظة':'Saved problem')}/></td><td className="p-3"><span className="rounded-lg bg-muted px-2 py-1 text-xs">{labels[d.Status]?.[ar?0:1]??d.Status}</span></td><td className="p-3 text-end"><button className={btn+' whitespace-nowrap'} onClick={()=>setSelected(d.Id)}>{admin?(ar?'مراجعة':'Review'):(ar?'عرض':'View')}</button></td></tr>)}
      {list.currentData.Items.length===0&&<tr><td colSpan={4} className="p-6 text-center text-muted-foreground">{admin?(ar?'لا توجد مسائل بانتظار المراجعة':'No problems awaiting review'):(ar?'لا توجد مسائل محفوظة':'No saved problems')}</td></tr>}
      </tbody></table></div>}
    {(list.currentData?.Total??0)>30&&<div className="flex items-center gap-2"><button className={btn} disabled={page===1} onClick={()=>setPage(p=>p-1)}>{ar?'السابق':'Previous'}</button><span>{page}</span><button className={btn} disabled={page*30>=(list.currentData?.Total??0)} onClick={()=>setPage(p=>p+1)}>{ar?'التالي':'Next'}</button></div>}
  </div>;
  return <div className="space-y-4">{embedded?<div className="flex justify-end"><button className={btn+' sr-wave-button text-white'} disabled={selected!==null} onClick={()=>setSelected('new')}>{ar?'إضافة مسألة':'Add problem'}</button></div>:<WorkspacePageHeader title={admin?(ar?'إدارة المسائل':'Problem management'):(ar?'مسائلي':'My problems')} icon={BookOpen} actions={<button className={btn+' sr-wave-button text-white'} disabled={selected!==null} onClick={()=>setSelected('new')}>{ar?'إضافة مسألة':'Add problem'}</button>}/>}
  {selected==='new'?<Wizard {...props} initialStage={stage} initialCategory={category}/>:typeof selected==='number'?<Existing key={selected} id={selected} {...props}/>:admin?<Tabs value={tab} onValueChange={setTab} dir={ar?'rtl':'ltr'}><TabsList className="flex h-auto w-fit max-w-full flex-wrap justify-start gap-1"><TabsTrigger value="published">{ar?'المسائل المنشورة':'Published problems'}</TabsTrigger><TabsTrigger value="requests">{ar?'بحاجة للمراجعة':'Needs review'}</TabsTrigger><TabsTrigger value="import">{ar?'استيراد جماعي':'Bulk import'}</TabsTrigger></TabsList><TabsContent value="published"><BankReview stage={stage} category={category} setStage={setStage} setCategory={setCategory} onOpen={id=>setSelected(id)}/></TabsContent><TabsContent value="requests">{requests}</TabsContent><TabsContent value="import" className="space-y-4"><ReviewedBankImport onChanged={()=>void list.refetch()}/><div className="flex flex-wrap gap-2"><Link className={btn} href="/admin/problems/import">{ar?'معاينة CSV':'CSV preview'}</Link><Link className={btn} href="/admin/problems/guide">{ar?'دليل المسائل':'Problem guide'}</Link></div><details className="rounded-xl border p-4"><summary className="cursor-pointer font-semibold">{ar?'استيراد ملفات مخصصة':'Import custom files'}</summary><div className="mt-3 space-y-3"><BatchImport/><AmendmentBatchImport/></div></details></TabsContent></Tabs>:requests}
  </div>;
}
