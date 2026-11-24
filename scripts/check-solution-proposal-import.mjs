import assert from 'node:assert/strict';
import fs from 'node:fs';
import ts from 'typescript';
const source=fs.readFileSync('src/components/editorial/selectSolutionProposal.ts','utf8');
const js=ts.transpileModule(source,{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.ES2022}}).outputText;
const {selectSolutionProposal}=await import('data:text/javascript;base64,'+Buffer.from(js).toString('base64'));
const expected={problemId:6,stageId:1,question:{Ar:'سؤال',En:'Question'},legacy:{Ar:'الحل',En:'Solution'},correctOption:'8'};
const row={ProblemId:6,StageId:1,ExpectedQuestionAr:'سؤال',ExpectedQuestionEn:'Question',ExpectedSolutionAr:'الحل',ExpectedSolutionEn:'Solution',ExpectedCorrectOption:'8',ProposedSolutionAr:'قاعدة\n\nشرح',ProposedSolutionEn:'Rule: $x+a=b$, $x=b-a$.\n\nExplanation',Status:'CandidateSolutionOnlyNotApplied'};
assert.deepEqual(selectSolutionProposal({Items:[row]},expected),{kind:'ready',idea:{Ar:'قاعدة',En:'Rule: $x+a=b$, $x=b-a$.'},step:{Ar:'شرح',En:'Explanation'},formulaChoices:['x+a=b','x=b-a']});
for(const changed of [{ExpectedQuestionAr:'different'},{ExpectedSolutionEn:'different'},{ExpectedCorrectOption:'9'},{StageId:2}])
  assert.equal(selectSolutionProposal({Items:[{...row,...changed}]},expected).kind,'stale');
for(const changed of [{Status:'Published'},{ProposedSolutionEn:'single paragraph'},{ProposedSolutionAr:'x'.repeat(4001)}])
  assert.equal(selectSolutionProposal({Items:[{...row,...changed}]},expected).kind,'invalid');
assert.equal(selectSolutionProposal({Items:[row,row]},expected).kind,'invalid');
assert.equal(selectSolutionProposal({Items:[]},expected).kind,'missing');
assert.deepEqual(selectSolutionProposal({Items:[{...row,ProposedSolutionEn:'Theorem only.\n\nProof.'}]},expected).formulaChoices,[]);
console.log('PASS: source-bound solution import; no automatic formula choice, no publication');
