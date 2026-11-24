import type {Bilingual} from '@/store/api/platformBrandApi';

export type SolutionSource={problemId:number;stageId:number;question:Bilingual;legacy:Bilingual;correctOption:string};
export type SolutionSelection={kind:'ready';idea:Bilingual;step:Bilingual;formulaChoices:string[]}
  |{kind:'missing'|'stale'|'invalid'};
function record(value:unknown):value is Record<string,unknown>{
  return value!==null&&typeof value==='object'&&!Array.isArray(value);
}
function paragraphs(value:unknown):string[]|null{
  if(typeof value!=='string'||!value.trim()||value.length>4000)return null;
  const parts=value.split(/\r?\n\s*\r?\n/).map(x=>x.trim());
  return parts.length===2&&parts.every(x=>x.length>0&&x.length<=2000)?parts:null;
}
export function selectSolutionProposal(file:unknown,source:SolutionSource):SolutionSelection{
  if(!record(file)||!Array.isArray(file.Items)||file.Items.length>1000)return {kind:'invalid'};
  const rows=file.Items.filter((x:unknown)=>record(x)&&x.ProblemId===source.problemId);
  if(!rows.length)return {kind:'missing'};
  if(rows.length!==1||!record(rows[0]))return {kind:'invalid'};
  const row=rows[0];
  if(row.Status!=='CandidateSolutionOnlyNotApplied')return {kind:'invalid'};
  if(row.StageId!==source.stageId||row.ExpectedQuestionAr!==source.question.Ar||
     row.ExpectedQuestionEn!==source.question.En||row.ExpectedSolutionAr!==source.legacy.Ar||
     row.ExpectedSolutionEn!==source.legacy.En||row.ExpectedCorrectOption!==source.correctOption)
    return {kind:'stale'};
  const ar=paragraphs(row.ProposedSolutionAr),en=paragraphs(row.ProposedSolutionEn);
  if(!ar||!en)return {kind:'invalid'};
  // Candidate paragraph one is the named rule; paragraph two is the
  // reviewed explanation. Formula selection remains an explicit editor action:
  // some laws contain several expressions, and some are theorem-only.
  const formulaChoices=[...new Set([...en[0].matchAll(/\$([^$\n]+)\$/g)].map(x=>x[1].trim()).filter(x=>x&&x.length<=2000))];
  return {kind:'ready',idea:{Ar:ar[0],En:en[0]},step:{Ar:ar[1],En:en[1]},formulaChoices};
}
