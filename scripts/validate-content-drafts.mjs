// Dependency-free structural gate for unpublished MathWorld math draft CSVs.
// This is not a substitute for editorial mathematical/curriculum approval.
import { readFileSync } from 'node:fs';

const root = new URL('../docs/content/', import.meta.url);
const files = [
  'mathworld-initial-32-questions.csv',
  'mathworld-next-32-questions.csv',
  'mathworld-proposed-categories-32-question-drafts.csv',
  'mathworld-proposed-categories-next-32-question-drafts.csv',
  'mathworld-proposed-categories-96-expansion-drafts.csv',
  'mathworld-existing-categories-96-expansion-drafts.csv',
];
const categoryFile = 'mathworld-proposed-16-new-categories.csv';
const problemsFields = [
  'ContentKey', 'StageId', 'QuestionTextAr', 'QuestionTextEn',
  'DetailedSolutionAr', 'DetailedSolutionEn', 'Points',
  'Option1', 'Option2', 'Option3', 'Option4', 'CorrectOption',
];

function readCsv(file) {
  const text = readFileSync(new URL(file, root), 'utf8').replace(/^\uFEFF/, '');
  let row = [], cell = '', insideQuotes = false;
  const rows = [];
  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    if (char === '"') {
      if (insideQuotes && text[i + 1] === '"') {
        cell += '"';
        i++;
      } else if (insideQuotes || cell.length === 0) {
        insideQuotes = !insideQuotes;
      } else {
        throw Error(file + ': invalid CSV quoting near character ' + i);
      }
    } else if (char === ',' && !insideQuotes) {
      row.push(cell);
      cell = '';
    } else if ((char === '\n' || char === '\r') && !insideQuotes) {
      if (char === '\r' && text[i + 1] === '\n') i++;
      row.push(cell);
      if (row.some(value => value.trim())) rows.push(row);
      row = [];
      cell = '';
    } else {
      cell += char;
    }
  }
  if (insideQuotes) throw Error(file + ': unclosed quoted field');
  row.push(cell);
  if (row.some(value => value.trim())) rows.push(row);
  const [headers, ...dataRows] = rows;
  if (!headers || !dataRows.length) throw Error(file + ': no CSV data');
  const uniqueHeaders = new Set(headers);
  if (headers.length !== uniqueHeaders.size) {
    throw Error(file + ': duplicate header column');
  }
  return dataRows.map((cells, index) => {
    if (cells.length !== headers.length) {
      throw Error(file + ': line ' + (index + 2) + ' has ' + cells.length +
        ' columns; expected ' + headers.length);
    }
    return Object.fromEntries(headers.map((name, i) => [name, cells[i]]));
  });
}

const problems = files.flatMap(readCsv);
const proposed = readCsv(categoryFile);
const proposedStages = new Map();
const mistakes = [];

for (const category of proposed) {
  if (!category.ContentKey || proposedStages.has(category.ContentKey)) {
    mistakes.push('Duplicate/empty proposed category key: ' + category.ContentKey);
  }
  if (!/^[1-4]$/.test(category.StageId)) {
    mistakes.push('Invalid stage in proposed category ' + category.ContentKey);
  }
  if (category.ReviewStatus !== 'Proposed') {
    mistakes.push('Category must remain Proposed: ' + category.ContentKey);
  }
  proposedStages.set(category.ContentKey, category.StageId);
}
if (proposedStages.size !== 16) {
  mistakes.push('Expected 16 proposed categories, found ' + proposedStages.size);
}

const uniqueKeys = new Set();
const promptsAr = new Map();
const promptsEn = new Map();
const categories = new Map();
const stageCounts = new Map();
const normalized = value => String(value ?? '').trim().toLowerCase()
  .replace(/\s+/gu, ' ');

for (const q of problems) {
  const key = q.ContentKey || '(missing key)';
  for (const name of problemsFields) {
    if (!q[name]?.trim()) mistakes.push(key + ': missing ' + name);
  }
  if (uniqueKeys.has(key)) mistakes.push('Duplicate ContentKey: ' + key);
  uniqueKeys.add(key);

  for (const [field, observed] of [
    ['QuestionTextAr', promptsAr], ['QuestionTextEn', promptsEn],
  ]) {
    const value = normalized(q[field]);
    if (observed.has(value)) {
      mistakes.push('Repeated ' + field + ' for ' + key + ' and ' + observed.get(value));
    }
    observed.set(value, key);
  }

  const answers = [q.Option1, q.Option2, q.Option3, q.Option4];
  if (new Set(answers.map(normalized)).size !== 4 ||
      answers.some(answer => !answer?.trim())) {
    mistakes.push(key + ': expected four nonempty distinct choices');
  }
  if (!/^[1-4]$/.test(q.CorrectOption)) {
    mistakes.push(key + ': correct answer must be a 1-based option index');
  }
  if (!/^[1-4]$/.test(q.StageId)) {
    mistakes.push(key + ': invalid stage ID');
  }
  if (!Number.isInteger(Number(q.Points)) || Number(q.Points) <= 0) {
    mistakes.push(key + ': invalid point value');
  }

  let categoryKey;
  if (q.ProposedCategoryKey) {
    categoryKey = q.ProposedCategoryKey;
    if (proposedStages.get(categoryKey) !== q.StageId) {
      mistakes.push(key + ': proposed category not in this stage');
    }
    if (q.ReviewStatus !== 'Proposed') {
      mistakes.push(key + ': proposed question must remain unpublished');
    }
  } else {
    const id = Number(q.CategoryId);
    if (!Number.isSafeInteger(id) || id < 1 || id > 16) {
      mistakes.push(key + ': unrecognized existing category');
    }
    if (Math.floor((id - 1) / 4) + 1 !== Number(q.StageId)) {
      mistakes.push(key + ': existing category belongs to another stage');
    }
    categoryKey = 'existing:' + q.CategoryId;
  }
  categories.set(categoryKey, (categories.get(categoryKey) ?? 0) + 1);
  stageCounts.set(q.StageId, (stageCounts.get(q.StageId) ?? 0) + 1);
}

if (categories.size !== 32) {
  mistakes.push('Expected 32 categories, got ' + categories.size);
}
for (const [name, count] of categories) {
  if (count < 10) {
    mistakes.push(name + ': only ' + count + ' draft questions; at least ten required');
  }
}
for (const stage of ['1', '2', '3', '4']) {
  if ((stageCounts.get(stage) ?? 0) < 80) {
    mistakes.push('Stage ' + stage + ': fewer than 80 draft questions');
  }
}

if (mistakes.length) {
  console.error('MathWorld bilingual draft content gate FAILED:');
  mistakes.forEach(message => console.error(' - ' + message));
  process.exitCode = 1;
} else {
  console.log('MathWorld draft content gate PASSED: ' +
    problems.length + ' unique questions, ' +
    categories.size + ' categories, minimum ' +
    Math.min(...categories.values()) + ' drafts each.');
  console.log('No production import or mathematical/curriculum certification implied.');
}
