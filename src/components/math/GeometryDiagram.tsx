'use client';

import { useId } from 'react';

export type GeometryObject =
  | { id: string; type: 'point'; x: number; y: number; label?: string }
  | { id: string; type: 'segment' | 'ray' | 'vector' | 'line'; x1: number; y1: number; x2: number; y2: number; label?: string }
  | { id: string; type: 'circle'; cx: number; cy: number; r: number; label?: string }
  | { id: string; type: 'polygon'; points: { x: number; y: number }[]; label?: string }
  | { id: string; type: 'angle'; cx: number; cy: number; radius: number; startDegrees: number; endDegrees: number; label?: string }
  | { id: string; type: 'axes'; originX: number; originY: number; xLength: number; yLength: number };

export interface GeometryScene {
  schemaVersion: 1;
  viewport: { width: number; height: number };
  objects: GeometryObject[];
  altTextAr: string;
  altTextEn: string;
}

const finite = (...values: unknown[]) => values.every(value => typeof value === 'number' && Number.isFinite(value) && Math.abs(value) <= 10000);
const validText = (text?: unknown) => text === undefined || (typeof text === 'string' && text.length <= 80);
const bounded = (n: number) => Number.isFinite(n) && Math.abs(n) <= 10000;

/** Never inject raw SVG or HTML. Only known geometric primitives are rendered. */
export function isGeometryScene(value: unknown): value is GeometryScene {
  if (!value || typeof value !== 'object') return false;
  const scene = value as Partial<GeometryScene>;
  const view = scene.viewport;
  if (scene.schemaVersion !== 1 || !view || !bounded(view.width) || !bounded(view.height) ||
      view.width <= 0 || view.height <= 0 || !Array.isArray(scene.objects) ||
      scene.objects.length > 100 || typeof scene.altTextAr !== 'string' ||
      typeof scene.altTextEn !== 'string' || scene.altTextAr.length > 500 ||
      scene.altTextEn.length > 500) return false;
  const ids = new Set<string>();
  for (const item of scene.objects) {
    if (!item || typeof item.id !== 'string' || !/^[a-zA-Z0-9_-]{1,40}$/.test(item.id) ||
        ids.has(item.id) || !validText('label' in item ? item.label : undefined)) return false;
    ids.add(item.id);
    switch (item.type) {
      case 'point':
        if (!finite(item.x, item.y)) return false;
        break;
      case 'segment': case 'ray': case 'vector': case 'line':
        if (!finite(item.x1, item.y1, item.x2, item.y2) ||
            (item.x1 === item.x2 && item.y1 === item.y2)) return false;
        break;
      case 'circle':
        if (!finite(item.cx, item.cy, item.r) || item.r <= 0) return false;
        break;
      case 'polygon':
        if (!Array.isArray(item.points) || item.points.length < 3 || item.points.length > 30 ||
            !item.points.every(p => p && finite(p.x, p.y))) return false;
        break;
      case 'angle':
        if (!finite(item.cx, item.cy, item.radius, item.startDegrees, item.endDegrees) ||
            item.radius <= 0 || Math.abs(item.endDegrees - item.startDegrees) <= 0 ||
            Math.abs(item.endDegrees - item.startDegrees) >= 360) return false;
        break;
      case 'axes':
        if (!finite(item.originX, item.originY, item.xLength, item.yLength) ||
            item.xLength <= 0 || item.yLength <= 0) return false;
        break;
      default: return false;
    }
  }
  return true;
}

function anglePoint(cx: number, cy: number, radius: number, degrees: number) {
  const radians = degrees * Math.PI / 180;
  return { x: cx + radius * Math.cos(radians), y: cy - radius * Math.sin(radians) };
}

export function GeometryDiagram({ scene, locale = 'ar' }: { scene: GeometryScene; locale?: string }) {
  const markerId = `geometry-arrow-${useId().replace(/:/g, '')}`;
  if (!isGeometryScene(scene)) return null;
  const alt = locale === 'ar' ? scene.altTextAr : scene.altTextEn;
  return (
    <figure className="my-4 overflow-hidden rounded-2xl border border-slate-200 bg-white p-3 dark:border-slate-700 dark:bg-slate-900">
      <svg viewBox={`0 0 ${scene.viewport.width} ${scene.viewport.height}`}
        role="img" aria-label={alt} className="mx-auto block h-auto w-full max-w-xl"
        xmlns="http://www.w3.org/2000/svg">
        <defs><marker id={markerId} markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto" markerUnits="strokeWidth">
          <path d="M0 0 L6 3 L0 6" fill="none" stroke="currentColor" strokeWidth="1.5" />
        </marker></defs>
        <g fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          {scene.objects.map(item => {
            if (item.type === 'point') return <circle key={item.id} cx={item.x} cy={item.y} r="3.5" fill="currentColor" />;
            if (item.type === 'circle') return <circle key={item.id} cx={item.cx} cy={item.cy} r={item.r} />;
            if (item.type === 'polygon') return <polygon key={item.id} points={item.points.map(p => `${p.x},${p.y}`).join(' ')} />;
            if (item.type === 'angle') {
              const start = anglePoint(item.cx, item.cy, item.radius, item.startDegrees);
              const end = anglePoint(item.cx, item.cy, item.radius, item.endDegrees);
              const sweep = item.endDegrees - item.startDegrees;
              return <path key={item.id} d={`M ${start.x} ${start.y} A ${item.radius} ${item.radius} 0 ${Math.abs(sweep) > 180 ? 1 : 0} ${sweep > 0 ? 0 : 1} ${end.x} ${end.y}`} />;
            }
            if (item.type === 'axes') return <g key={item.id}>
              <line x1={item.originX-item.xLength} y1={item.originY} x2={item.originX+item.xLength} y2={item.originY} markerEnd={`url(#${markerId})`} />
              <line x1={item.originX} y1={item.originY+item.yLength} x2={item.originX} y2={item.originY-item.yLength} markerEnd={`url(#${markerId})`} />
            </g>;
            return <line key={item.id} x1={item.x1} y1={item.y1} x2={item.x2} y2={item.y2}
              markerEnd={item.type === 'ray' || item.type === 'vector' || item.type === 'line' ? `url(#${markerId})` : undefined} />;
          })}
        </g>
        <g fill="currentColor" fontSize="14" fontFamily="sans-serif">
          {scene.objects.map(item => {
            if (!('label' in item) || !item.label) return null;
            const x = item.type === 'point' ? item.x : item.type === 'circle' ? item.cx : item.type === 'polygon' ? item.points[0].x : item.type === 'angle' ? item.cx : item.x1;
            const y = item.type === 'point' ? item.y : item.type === 'circle' ? item.cy : item.type === 'polygon' ? item.points[0].y : item.type === 'angle' ? item.cy : item.y1;
            return <text key={`label-${item.id}`} x={x+7} y={y-8}>{item.label}</text>;
          })}
        </g>
      </svg>
      <figcaption className="mt-2 text-center text-xs text-slate-600 dark:text-slate-300">{alt}</figcaption>
    </figure>
  );
}
