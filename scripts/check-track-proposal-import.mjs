import assert from 'node:assert/strict';
import fs from 'node:fs';
import ts from 'typescript';
const source=fs.readFileSync('src/components/curriculum/trackProposalImport.ts','utf8');
const js=ts.transpileModule(source,{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.ES2022}}).outputText;
const {readTrackProposal}=await import('data:text/javascript;base64,'+Buffer.from(js).toString('base64'));
const row={StageId:1,Code:'grade-1',Status:'UnpublishedProposal',CategoryIds:[1,2],SkillIds:[3],ProblemIds:[4,5],ProblemCount:2};
const file=(rows=[row],status='ProblemLevelPlacementProposalNotApproved')=>JSON.stringify({Status:status,Tracks:rows});
assert.deepEqual(readTrackProposal(file(),1,'grade-1'),{CategoryIds:[1,2],SkillIds:[3],ProblemIds:[4,5]});
assert.throws(()=>readTrackProposal(file(),2,'grade-1'),/TrackProposalNotFound/);
assert.throws(()=>readTrackProposal(file([row,row]),1,'grade-1'),/TrackProposalNotFound/);
for(const changed of [{ProblemIds:[4,4]},{ProblemIds:[4,'5']},{ProblemIds:[]},{ProblemCount:9},{Status:'Published'},{CategoryIds:[-1]}])
 assert.throws(()=>readTrackProposal(file([{...row,...changed}]),1,'grade-1'),/InvalidTrackProposal/);
assert.throws(()=>readTrackProposal(file([row],'Approved'),1,'grade-1'),/InvalidTrackProposal/);
console.log('PASS: draft mapping import is stage/code-bound and rejects malformed or duplicate IDs');
