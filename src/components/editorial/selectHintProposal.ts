import type {Bilingual} from '@/store/api/platformBrandApi';

export type HintSelection =
  | {kind: 'ready'; hints: [Bilingual, Bilingual]}
  | {kind: 'missing' | 'stale' | 'held' | 'invalid'};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isHint(value: unknown): value is Bilingual {
  if (!isRecord(value)) return false;
  return [value.Ar, value.En].every(text =>
    typeof text === 'string' && text.trim().length > 0 && text.trim().length <= 1000);
}

export function selectHintProposal(file: unknown, problemId: number, question: Bilingual): HintSelection {
  if (!isRecord(file) || !Array.isArray(file.items)) return {kind: 'invalid'};
  const rows = file.items.filter((row: unknown) => isRecord(row) && row.problemId === problemId);
  if (!rows.length) return {kind: 'missing'};
  if (rows.length !== 1) return {kind: 'invalid'};

  const row: unknown = rows[0];
  if (!isRecord(row) || !isRecord(row.question)) return {kind: 'invalid'};
  if (row.question.Ar !== question.Ar || row.question.En !== question.En) return {kind: 'stale'};
  if (row.taxonomyReviewPending === true) return {kind: 'held'};
  if (row.taxonomyReviewPending !== undefined && row.taxonomyReviewPending !== false) return {kind: 'invalid'};
  if (!Array.isArray(row.Hints) || row.Hints.length !== 2) return {kind: 'invalid'};

  const [first, second] = row.Hints;
  if (!isHint(first) || !isHint(second)) return {kind: 'invalid'};
  if (first.Ar.trim() === second.Ar.trim() || first.En.trim() === second.En.trim()) return {kind: 'invalid'};
  return {kind: 'ready', hints: [
    {Ar: first.Ar.trim(), En: first.En.trim()},
    {Ar: second.Ar.trim(), En: second.En.trim()},
  ]};
}
