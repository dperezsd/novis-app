import { describe, it, expect, vi, afterEach } from 'vitest';
import { getCandidateId } from '../utils/candidateId.js';
import { getInitials } from '../utils/formatters.js';
import { computeSecondsLeft } from '../utils/timeRemaining.js';
import { TEST_DURATION_SECONDS } from '../data/testConfig.js';
import { checkAdminPassword } from '../utils/adminAuth.js';

describe('getCandidateId', () => {
  it('normaliza documento y nombre', () => {
    const id = getCandidateId({ documento: '1.234-567 890', nombre: '  Santiago   SALLAS ' });
    expect(id).toBe('1234567890__santiago sallas');
  });

  it('no falla con campos vacios', () => {
    expect(getCandidateId({})).toBe('__');
  });
});

describe('getInitials', () => {
  it('devuelve hasta 2 iniciales en mayuscula', () => {
    expect(getInitials('santiago sallas perez')).toBe('SS');
  });

  it('devuelve vacio si no hay nombre', () => {
    expect(getInitials()).toBe('');
  });
});

describe('computeSecondsLeft', () => {
  afterEach(() => vi.useRealTimers());

  it('devuelve la duracion completa al iniciar', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-01-01T10:00:00Z'));
    expect(computeSecondsLeft(Date.now())).toBe(TEST_DURATION_SECONDS);
  });

  it('descuenta el tiempo transcurrido', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-01-01T10:10:00Z'));
    const startedAt = new Date('2026-01-01T10:00:00Z').getTime();
    expect(computeSecondsLeft(startedAt)).toBe(TEST_DURATION_SECONDS - 600);
  });

  it('nunca devuelve negativos cuando se agota el tiempo', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-01-01T12:00:00Z'));
    const startedAt = new Date('2026-01-01T10:00:00Z').getTime();
    expect(computeSecondsLeft(startedAt)).toBe(0);
  });
});

describe('checkAdminPassword', () => {
  it('rechaza una contrasena incorrecta', () => {
    expect(checkAdminPassword('incorrecta')).toBe(false);
  });
});
