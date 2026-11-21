import assert from 'node:assert/strict';
import fs from 'node:fs';
import ts from 'typescript';

// Run the same TypeScript parser used by both public and learner pages.
const source = fs.readFileSync('src/lib/mathSegments.ts', 'utf8');
const compiled = ts.transpileModule(source, {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
}).outputText;
const moduleRef = { exports: {} };
new Function('module', 'exports', compiled)(moduleRef, moduleRef.exports);
const { parseMathSegments } = moduleRef.exports;
const slash = String.fromCharCode(92);

const examples = [
  { input: 'بسّط ' + slash + '(2^{3}' + slash + 'times2^2' + slash + ') على صورة قوة للعدد 2',
    type: 'inline', expression: '2^{3}' + slash + 'times2^2' },
  { input: 'بسّط ' + slash + slash + '(2^{3}' + slash + slash + 'times2^2' + slash + slash + ') على صورة قوة للعدد 2',
    type: 'inline', expression: '2^{3}' + slash + 'times2^2' },
  { input: 'نجمع الأسس: ' + slash + '[2^{3}' + slash + 'times2^2=2^5' + slash + '] إذن الناتج',
    type: 'block', expression: '2^{3}' + slash + 'times2^2=2^5' },
  { input: 'The answer is $2^5$, because $$2^3 ' + slash + 'times 2^2=2^5$$.',
    type: 'block', expression: '2^3 ' + slash + 'times 2^2=2^5' },
];
for (const { input, type, expression } of examples) {
  const segments = parseMathSegments(input);
  assert(segments.some(segment => segment.type === type && segment.value === expression),
    'Failed to parse expected ' + type + ' math');
  assert(!segments.some(segment => segment.type === 'text' &&
    segment.value.includes(slash + 'times')), 'Raw math TeX leaked into prose');
}
assert.deepEqual(parseMathSegments('No math here.'),
  [{ type: 'text', value: 'No math here.' }]);
console.log('PASS: Arabic, English, inline/block and double-escaped LaTeX.');
