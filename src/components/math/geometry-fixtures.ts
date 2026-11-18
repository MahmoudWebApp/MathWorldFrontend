import type { GeometryScene } from './GeometryDiagram';

/** Deterministic bilingual fixture for renderer parity tests with Flutter.
 * Illustrates a 3-4-5 right triangle; not a published learner question.
 */
export const rightTriangleFixture: GeometryScene = {
  schemaVersion: 1,
  viewport: { width: 360, height: 260 },
  altTextAr: 'مثلث قائم الزاوية أ ب ج، الضلعان القائمان ٣ و٤ والوتر ٥',
  altTextEn: 'Right triangle ABC with legs 3 and 4 and hypotenuse 5',
  objects: [
    { id: 'triangle', type: 'polygon', points: [
      { x: 65, y: 205 }, { x: 305, y: 205 }, { x: 65, y: 45 },
    ] },
    { id: 'a', type: 'point', x: 65, y: 205, label: 'A' },
    { id: 'b', type: 'point', x: 305, y: 205, label: 'B' },
    { id: 'c', type: 'point', x: 65, y: 45, label: 'C' },
    { id: 'right-angle', type: 'polygon', points: [
      { x: 65, y: 184 }, { x: 86, y: 184 }, { x: 86, y: 205 },
    ] },
    { id: 'leg-4', type: 'point', x: 180, y: 221, label: '4' },
    { id: 'leg-3', type: 'point', x: 45, y: 125, label: '3' },
    { id: 'hyp-5', type: 'point', x: 197, y: 113, label: '5' },
  ],
};
