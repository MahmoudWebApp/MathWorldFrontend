'use client';

import {useRef, useState} from 'react';
import type {Bilingual} from '@/store/api/platformBrandApi';
import {selectHintProposal, type HintSelection} from './selectHintProposal';

type Props = {
  ar: boolean;
  problemId: number;
  question: Bilingual;
  onApply: (hints: [Bilingual, Bilingual]) => void;
};

const messages = {
  missing: ['الملف لا يحتوي تلميحات لهذه المسألة.', 'This file has no hints for this problem.'],
  stale: ['تغيّر نص المسألة منذ إعداد الملف.', 'The question has changed since the file was prepared.'],
  held: ['يجب مراجعة تصنيف هذه المسألة أولاً.', 'This problem’s classification needs review first.'],
  invalid: ['تعذّرت قراءة تلميحين مختلفين بالعربية والإنكليزية من الملف.', 'Could not read two distinct bilingual hints from the file.'],
  large: ['اختر ملفاً أصغر من 2 ميغابايت.', 'Choose a file smaller than 2 MB.'],
};

export function HintProposalImport({ar, problemId, question, onApply}: Props) {
  const [selection, setSelection] = useState<HintSelection | {kind: 'large'}>();
  const latest = useRef(0);

  async function select(file?: File) {
    const request = ++latest.current;
    setSelection(undefined);
    if (!file) return;
    if (file.size >= 2_000_000) {
      setSelection({kind: 'large'});
      return;
    }
    try {
      const choice = selectHintProposal(JSON.parse(await file.text()), problemId, question);
      if (request === latest.current) setSelection(choice);
    } catch {
      if (request === latest.current) setSelection({kind: 'invalid'});
    }
  }

  return <details className="rounded-xl border p-3 text-sm">
    <summary className="cursor-pointer font-semibold">{ar ? 'استيراد تلميحات مقترحة' : 'Import proposed hints'}</summary>
    <label className="mt-3 block">
      {ar ? 'ملف مقترحات التلميحات (JSON)' : 'Hint proposal file (JSON)'}
      <input type="file" accept=".json,application/json" className="block w-full py-2"
        onChange={event => void select(event.target.files?.[0])}/>
    </label>
    {selection && (selection.kind === 'ready' ? <>
      <ol className="list-decimal space-y-2 ps-5">
        {selection.hints.map((hint, index) => <li key={index}>
          <p lang="ar" dir="rtl">{hint.Ar}</p>
          <p lang="en" dir="ltr">{hint.En}</p>
        </li>)}
      </ol>
      <button type="button" className="mt-3 rounded-xl border px-3 py-2 font-semibold"
        onClick={() => onApply(selection.hints)}>{ar ? 'استخدام التلميحين في المسودة' : 'Use these hints in the draft'}</button>
    </> : <p role="alert">{messages[selection.kind][ar ? 0 : 1]}</p>)}
  </details>;
}
