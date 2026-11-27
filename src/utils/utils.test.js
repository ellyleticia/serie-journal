import { describe, it, expect } from 'vitest';
import {
  formatDateBR,
  isBeforeDate,
  isFutureDate,
  isValidISODate,
  toApiDate,
  toInputDate,
} from './date.js';
import { normalizeText } from './text.js';

describe('utils/date', () => {
  it('formata YYYY-MM-DD para dd/mm/aaaa', () => {
    expect(formatDateBR('2023-03-10')).toBe('10/03/2023');
    expect(formatDateBR('')).toBe('—');
    expect(formatDateBR('2023-02-30')).toBe('—');
  });

  it('converte para o formato do input e da API', () => {
    expect(toInputDate('2023-03-10')).toBe('2023-03-10');
    expect(toInputDate('10/03/2023')).toBe('2023-03-10');
    expect(toInputDate(undefined)).toBe('');
    expect(toApiDate('2023-03-10')).toBe('2023-03-10');
    expect(toApiDate('lixo')).toBe('');
  });

  it('valida datas de forma estrita', () => {
    expect(isValidISODate('2024-02-29')).toBe(true);
    expect(isValidISODate('2023-02-29')).toBe(false);
    expect(isValidISODate('2023-3-1')).toBe(false);
  });

  it('compara datas', () => {
    expect(isFutureDate('2999-01-01')).toBe(true);
    expect(isFutureDate('2000-01-01')).toBe(false);
    expect(isBeforeDate('2020-01-01', '2020-01-02')).toBe(true);
    expect(isBeforeDate('2020-01-02', '2020-01-02')).toBe(false);
  });
});

describe('utils/text', () => {
  it('normaliza maiúsculas, acentos e espaços', () => {
    expect(normalizeText('  Ficção CIENTÍFICA ')).toBe('ficcao cientifica');
    expect(normalizeText(null)).toBe('');
  });
});
