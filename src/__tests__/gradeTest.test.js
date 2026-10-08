import { describe, it, expect } from 'vitest';
import { gradeTest } from '../utils/gradeTest.js';
import { ANSWER_KEY } from '../data/scoring.js';
import { QUESTIONS } from '../data/questions.js';

// Construye un mapa de respuestas correctas usando la primera clave valida
function allCorrectAnswers() {
  const answers = {};
  for (const q of QUESTIONS) answers[q.n] = ANSWER_KEY[q.n][0];
  return answers;
}

describe('gradeTest', () => {
  it('califica 80 aciertos con todas las respuestas correctas', () => {
    const result = gradeTest({ answers: allCorrectAnswers(), sexo: 'M' });
    expect(result.correctas).toBe(80);
    expect(result.total).toBe(80);
  });

  it('suma la constante de correccion de hombres (70)', () => {
    const result = gradeTest({ answers: allCorrectAnswers(), sexo: 'M' });
    expect(result.ci).toBe(150);
  });

  it('suma la constante de correccion de mujeres (75)', () => {
    const result = gradeTest({ answers: allCorrectAnswers(), sexo: 'F' });
    expect(result.ci).toBe(155);
  });

  it('devuelve 0 aciertos si no hay respuestas', () => {
    const result = gradeTest({ answers: {}, sexo: 'M' });
    expect(result.correctas).toBe(0);
    expect(result.ci).toBe(70);
  });

  it('acepta ambas respuestas validas en el reactivo 23 (c o d)', () => {
    expect(gradeTest({ answers: { 23: 'c' }, sexo: 'M' }).correctas).toBe(1);
    expect(gradeTest({ answers: { 23: 'd' }, sexo: 'M' }).correctas).toBe(1);
    expect(gradeTest({ answers: { 23: 'a' }, sexo: 'M' }).correctas).toBe(0);
  });

  it('las areas suman los aciertos totales', () => {
    const result = gradeTest({ answers: allCorrectAnswers(), sexo: 'F' });
    const { verbal, abstracto, logico } = result.areaCorrect;
    expect(verbal + abstracto + logico).toBe(80);
  });
});
