import type {EditorialImportRow,AmendmentImportRow} from '@/store/api/platformBrandApi';

// One server transaction, at most 50 candidates and below the 2 MB API limit.
export const MAX_BATCH_BYTES = 1_900_000;
export type BatchFile = {name: string; text: string};
export function combineEditorialFiles(files: BatchFile[]): EditorialImportRow[] {
  const rows: EditorialImportRow[] = [];
  const keys = new Set<string>();
  if (!files.length) throw new Error('InvalidEditorialBatch');
  for (const file of files) {
    const data: unknown = JSON.parse(file.text);
    if (!data || typeof data !== 'object' || !('Items' in data) ||
        !Array.isArray(data.Items) || !data.Items.length) throw new Error('InvalidEditorialBatch');
    for (const row of data.Items) {
      if (!row || typeof row !== 'object' || typeof row.ContentKey !== 'string' ||
          !/^[a-z0-9][a-z0-9-]{0,99}$/.test(row.ContentKey) ||
          typeof row.PrimarySkillKey !== 'string' || !row.PrimarySkillKey.trim() ||
          !Array.isArray(row.ProposedTrackCodes) || !row.ProposedTrackCodes.length ||
          !row.Content || typeof row.Content !== 'object' || Array.isArray(row.Content))
        throw new Error('InvalidEditorialBatch');
      if (keys.has(row.ContentKey)) throw new Error('DuplicateContentKey');
      keys.add(row.ContentKey);
      rows.push({ContentKey: row.ContentKey, PrimarySkillKey: row.PrimarySkillKey,
        ProposedTrackCodes: row.ProposedTrackCodes, Content: row.Content});
      if (rows.length > 50) throw new Error('BatchLimit');
    }
  }
  if (new TextEncoder().encode(JSON.stringify({Items: rows, Confirm: false})).length > MAX_BATCH_BYTES)
    throw new Error('BatchLimit');
  return rows;
}

export type BatchIssue = {ContentKey: string; Status: string; Errors: string[]};
export function readBatchIssues(value: unknown): BatchIssue[] | undefined {
  if (!Array.isArray(value) || value.length > 50) return undefined;
  const issues: BatchIssue[] = [];
  for (const row of value) {
    if (!row || typeof row !== 'object' || typeof row.ContentKey !== 'string' ||
        !/^[a-z0-9][a-z0-9-]{0,99}$/.test(row.ContentKey) ||
        !['Ready','Invalid','AlreadyExists'].includes(row.Status) ||
        !Array.isArray(row.Errors) || row.Errors.length > 50 ||
        !row.Errors.every((x: unknown) => typeof x === 'string' && /^[A-Za-z0-9]{1,100}$/.test(x)))
      return undefined;
    issues.push({ContentKey: row.ContentKey, Status: row.Status, Errors: row.Errors});
  }
  return issues;
}

export function readAmendmentFile(text:string):AmendmentImportRow[]{
  const data=JSON.parse(text);
  if(!data||data.Status!=='NotImportedNotPublished'||!Array.isArray(data.Items)||!data.Items.length||data.Items.length>50)
    throw Error('InvalidAmendmentBatch');
  const seen=new Set<number>();
  const rows:AmendmentImportRow[]=data.Items.map((r:AmendmentImportRow)=>{
    if(!r||r.Status!=='StructuredAmendmentCandidateNotImported'||!Number.isSafeInteger(r.ProblemId)||r.ProblemId<=0||
       seen.has(r.ProblemId)||!Array.isArray(r.ExpectedOptionIds)||r.ExpectedOptionIds.length!==4||
       r.ExpectedOptionIds.some(i=>!Number.isSafeInteger(i)||i<=0)||new Set(r.ExpectedOptionIds).size!==4||
       typeof r.ExpectedLegacySolution?.Ar!=='string'||typeof r.ExpectedLegacySolution?.En!=='string'||
       typeof r.PrimarySkillKey!=='string'||!r.PrimarySkillKey.trim()||!r.Content||typeof r.Content!=='object')
       throw Error('InvalidAmendmentBatch');
    seen.add(r.ProblemId);
    return {ProblemId:r.ProblemId,ExpectedOptionIds:r.ExpectedOptionIds,ExpectedLegacySolution:r.ExpectedLegacySolution,
      PrimarySkillKey:r.PrimarySkillKey,Content:r.Content,Status:r.Status};
  });
  if(new TextEncoder().encode(JSON.stringify({Items:rows,Confirm:false})).length>MAX_BATCH_BYTES)throw Error('BatchLimit');
  return rows;
}
