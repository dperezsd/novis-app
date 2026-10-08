import { describe, it, expect } from 'vitest';
import { getRange, ANSWER_KEY, AREAS } from '../data/scoring.js';

describe('getRange', () => {
  it.each([
    [130, 'Superior'],
    [121, 'Superior'],
    [115, 'Superior al término medio'],
    [108, 'Promedio término medio'],
    [102, 'Inferior al término medio'],
    [99, 'Deficiente'],
    [50, 'Deficiente'],
  ])('CI %i -> %s', (ci, label) => {
    expect(getRange(ci).label).toBe(label);
  });
});

describe('integridad de datos', () => {
  it('la clave de respuestas cubre los 80 reactivos', () => {
    expect(Object.keys(ANSWER_KEY)).toHaveLength(80);
  });

  it('cada reactivo pertenece a exactamente una area', () => {
    for (let n = 1; n <= 80; n++) {
      const count = Object.values(AREAS).filter((a) => a.items.includes(n)).length;
      expect(count, `reactivo ${n}`).toBe(1);
    }
  });
});
