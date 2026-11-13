'use client';

import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import type { RootState } from '@/store';
import { API_BASE_URL } from '@/store/api/baseQuery';
import { GeometryDiagram, isGeometryScene, type GeometryScene } from '@/components/math/GeometryDiagram';
import { rightTriangleFixture } from '@/components/math/geometry-fixtures';

type Props = {
  problemId: number;
  locale: string;
  initialScene?: GeometryScene | null;
  onSaved?: (scene: GeometryScene | null) => void;
};

/** Authenticated Admin problem editor. Backend remains the authority for all writes. */
export function AdminGeometryEditor({ problemId, locale, initialScene, onSaved }: Props) {
  const ar = locale === 'ar';
  const authToken = useSelector((state: RootState) => state.auth.token);
  const [json, setJson] = useState(() => JSON.stringify(initialScene ?? {
    schemaVersion: 1,
    viewport: { width: 360, height: 260 },
    altTextAr: 'رسم هندسي',
    altTextEn: 'Geometry diagram',
    objects: [],
  }, null, 2));
  const [message, setMessage] = useState('');
  const [saving, setSaving] = useState(false);
  const [scene, setScene] = useState<GeometryScene | null>(initialScene ?? null);

  useEffect(() => {
    if (!initialScene) return;
    setJson(JSON.stringify(initialScene, null, 2));
    setScene(initialScene);
  }, [initialScene]);

  let parsed: GeometryScene | null = null;
  try {
    const candidate: unknown = JSON.parse(json);
    if (isGeometryScene(candidate) && candidate.altTextAr.trim() && candidate.altTextEn.trim()) parsed = candidate;
  } catch {
    // A partial edit is not a valid preview or request.
  }
  const valid = parsed !== null && json.length <= 30000;
  const token = () => {
    const match = document.cookie.split(';').map(x => x.trim()).find(x => x.startsWith('token='));
    if (!match) return '';
    try { return decodeURIComponent(match.slice(6)); } catch { return ''; }
  };
  const useExample = () => {
    if (!window.confirm(ar ? 'استبدال النص الحالي بمثال المثلث؟' : 'Replace the current draft with the triangle example?')) return;
    setJson(JSON.stringify(rightTriangleFixture, null, 2));
    setMessage('');
  };
  const save = async () => {
    if (!parsed || !valid || saving) return;
    if (!window.confirm(ar ? 'تأكيد حفظ الرسم الهندسي؟' : 'Save this geometry diagram?')) return;
    setSaving(true);
    setMessage('');
    try {
      const response = await fetch(`${API_BASE_URL}/admin/problems/${problemId}/diagram`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${authToken || token()}` },
        body: JSON.stringify({ scene: parsed }),
      });
      if (!response.ok) throw new Error(String(response.status));
      setScene(parsed);
      onSaved?.(parsed);
      setMessage(ar ? 'تم حفظ الرسم' : 'Diagram saved');
    } catch {
      setMessage(ar ? 'فشل الحفظ. تحقق من صلاحيات الأدمن والاتصال.' : 'Save failed. Check admin permissions and connection.');
    } finally { setSaving(false); }
  };
  const remove = async () => {
    if (saving || !window.confirm(ar ? 'حذف الرسم فقط دون المسألة؟' : 'Delete only the diagram, not the problem?')) return;
    setSaving(true);
    setMessage('');
    try {
      const response = await fetch(`${API_BASE_URL}/admin/problems/${problemId}/diagram`, {
        method: 'DELETE', headers: { Authorization: `Bearer ${authToken || token()}` },
      });
      if (!response.ok && response.status !== 404) throw new Error(String(response.status));
      setScene(null);
      onSaved?.(null);
      setMessage(ar ? 'تم حذف الرسم' : 'Diagram removed');
    } catch {
      setMessage(ar ? 'تعذر حذف الرسم' : 'Could not remove diagram');
    } finally { setSaving(false); }
  };
  return (
    <section dir={ar ? 'rtl' : 'ltr'} className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-900">
      <h2 className="mb-2 text-lg font-bold">{ar ? 'محرر الرسم الهندسي' : 'Geometry diagram editor'}</h2>
      <p className="mb-3 text-sm text-slate-500">{ar ? 'عدّل وصف الرسم وعناصره بصيغة JSON الآمنة. المعاينة تظهر قبل الحفظ.' : 'Edit the safe JSON scene and preview it before saving.'}</p>
      <button type="button" onClick={useExample} className="mb-3 rounded-lg border border-slate-300 px-3 py-2 text-sm dark:border-slate-600">
        {ar ? 'تحميل مثال مثلث قائم (دون حفظ)' : 'Load right-triangle example (not saved)'}
      </button>
      <textarea aria-label={ar ? 'بيانات الرسم' : 'Diagram JSON'} spellCheck={false} value={json}
        onChange={e => { setJson(e.target.value); setMessage(''); }} rows={12}
        className="w-full rounded-lg border border-slate-300 bg-transparent p-3 font-mono text-xs dark:border-slate-700" />
      {!valid && <p role="alert" className="mt-2 text-sm text-red-600">{ar ? 'صيغة الرسم غير صالحة أو أكبر من الحد المسموح.' : 'Invalid diagram format or size.'}</p>}
      {parsed && <GeometryDiagram scene={parsed} locale={locale} />}
      <div className="mt-3 flex flex-wrap gap-3">
        <button type="button" disabled={!valid || saving} onClick={save}
          className="rounded-lg bg-emerald-700 px-4 py-2 text-white disabled:opacity-50">{saving ? '...' : ar ? 'حفظ الرسم' : 'Save diagram'}</button>
        {scene && <button type="button" disabled={saving} onClick={remove}
          className="rounded-lg border border-red-500 px-4 py-2 text-red-600 disabled:opacity-50">{ar ? 'حذف الرسم' : 'Delete diagram'}</button>}
      </div>
      {message && <p role="status" className="mt-3 text-sm">{message}</p>}
    </section>
  );
}
