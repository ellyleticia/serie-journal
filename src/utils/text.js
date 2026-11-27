/** Normaliza texto para busca: minúsculas, sem acentos e sem espaços nas pontas. */
export function normalizeText(value) {
  return String(value ?? '')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .trim();
}
