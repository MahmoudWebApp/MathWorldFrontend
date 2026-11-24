import type {TrackMapping} from '@/store/api/stagesApi';
export const MAX_TRACK_PROPOSAL_BYTES=2_000_000;
function record(value:unknown):value is Record<string,unknown>{
  return !!value&&typeof value==='object'&&!Array.isArray(value);
}
function ids(value:unknown,limit:number):number[]{
  if(!Array.isArray(value)||!value.length||value.length>limit||
     value.some(x=>typeof x!=='number'||!Number.isSafeInteger(x)||x<=0)||new Set(value).size!==value.length)
    throw new Error('InvalidTrackProposal');
  return value as number[];
}
// Only prefill a single matching draft's mapping; no API calls or publishing.
export function readTrackProposal(text:string,stageId:number,code:string):TrackMapping{
  if(new TextEncoder().encode(text).length>MAX_TRACK_PROPOSAL_BYTES)throw new Error('InvalidTrackProposal');
  const data:unknown=JSON.parse(text);
  if(!record(data)||data.Status!=='ProblemLevelPlacementProposalNotApproved'||
     !Array.isArray(data.Tracks)||data.Tracks.length>100)throw new Error('InvalidTrackProposal');
  const matches=data.Tracks.filter(t=>record(t)&&t.StageId===stageId&&t.Code===code);
  if(matches.length!==1)throw new Error('TrackProposalNotFound');
  const t=matches[0];
  if(t.Status!=='UnpublishedProposal')throw new Error('InvalidTrackProposal');
  const mapping={CategoryIds:ids(t.CategoryIds,300),SkillIds:ids(t.SkillIds,2000),ProblemIds:ids(t.ProblemIds,10000)};
  if(t.ProblemCount!==mapping.ProblemIds.length)throw new Error('InvalidTrackProposal');
  return mapping;
}
