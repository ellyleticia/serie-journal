import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';

dayjs.extend(customParseFormat);

// Formatos usados no projeto:
// - API e <input type="date">: YYYY-MM-DD (o mesmo formato nos dois)
// - Exibição na tela: DD/MM/YYYY
export const ISO_FORMAT = 'YYYY-MM-DD';
export const BR_FORMAT = 'DD/MM/YYYY';

function parseStrict(value, format) {
  if (typeof value !== 'string' || value.trim() === '') return null;
  const parsed = dayjs(value.trim(), format, true);
  return parsed.isValid() ? parsed : null;
}

/** true se o valor é uma data real no formato YYYY-MM-DD (ex.: rejeita 2023-02-30). */
export function isValidISODate(value) {
  return parseStrict(value, ISO_FORMAT) !== null;
}

/** API → exibição: '2023-03-10' → '10/03/2023'. Valor inválido volta como '—'. */
export function formatDateBR(value) {
  const parsed = parseStrict(value, ISO_FORMAT);
  return parsed ? parsed.format(BR_FORMAT) : '—';
}

/**
 * API → input: garante YYYY-MM-DD para o campo de data.
 * Aceita também DD/MM/YYYY, por segurança. Valor inválido vira ''.
 */
export function toInputDate(value) {
  const parsed = parseStrict(value, ISO_FORMAT) || parseStrict(value, BR_FORMAT);
  return parsed ? parsed.format(ISO_FORMAT) : '';
}

/** Input → API: o formato é o mesmo, só normaliza. Valor inválido vira ''. */
export function toApiDate(value) {
  const parsed = parseStrict(value, ISO_FORMAT);
  return parsed ? parsed.format(ISO_FORMAT) : '';
}

/** Data de hoje em YYYY-MM-DD (útil para o atributo max do input). */
export function todayISO() {
  return dayjs().format(ISO_FORMAT);
}

/** true se a data (YYYY-MM-DD) for depois de hoje. */
export function isFutureDate(value) {
  const parsed = parseStrict(value, ISO_FORMAT);
  return parsed ? parsed.isAfter(dayjs(), 'day') : false;
}

/** true se a data `a` for anterior à data `b` (ambas YYYY-MM-DD). */
export function isBeforeDate(a, b) {
  const da = parseStrict(a, ISO_FORMAT);
  const db = parseStrict(b, ISO_FORMAT);
  return da && db ? da.isBefore(db, 'day') : false;
}
