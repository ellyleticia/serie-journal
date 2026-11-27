import { isBeforeDate, isFutureDate, isValidISODate, toInputDate } from '../../utils/date.js';

// Campos do formulário, na ordem em que aparecem na tela.
export const FIELDS = [
  'title',
  'seasons',
  'releaseDate',
  'director',
  'production',
  'category',
  'watchedAt',
];

export const EMPTY_FORM = {
  title: '',
  seasons: '',
  releaseDate: '',
  director: '',
  production: '',
  category: '',
  watchedAt: '',
};

const REQUIRED_MESSAGES = {
  title: 'Informe o título.',
  seasons: 'Informe o número de temporadas.',
  releaseDate: 'Informe a data de lançamento da temporada.',
  director: 'Informe o diretor.',
  production: 'Informe a produtora.',
  category: 'Informe a categoria.',
  watchedAt: 'Informe a data em que assistiu.',
};

/** Valida um campo. Devolve a mensagem de erro ou '' se estiver válido. */
export function validateField(name, values) {
  const value = String(values[name] ?? '').trim();

  if (!value) return REQUIRED_MESSAGES[name] ?? '';

  switch (name) {
    case 'seasons': {
      if (!/^\d+$/.test(value) || Number(value) < 1) {
        return 'Informe um número inteiro maior ou igual a 1.';
      }
      return '';
    }
    case 'releaseDate':
      return isValidISODate(value) ? '' : 'Informe uma data válida.';
    case 'watchedAt': {
      if (!isValidISODate(value)) return 'Informe uma data válida.';
      if (isFutureDate(value)) return 'A data em que assistiu não pode ser futura.';
      if (isValidISODate(values.releaseDate) && isBeforeDate(value, values.releaseDate)) {
        return 'A data em que assistiu não pode ser anterior ao lançamento.';
      }
      return '';
    }
    default:
      return '';
  }
}

/** Valida o formulário inteiro. Devolve { campo: mensagem } só com os campos inválidos. */
export function validateForm(values) {
  return FIELDS.reduce((errors, field) => {
    const message = validateField(field, values);
    if (message) errors[field] = message;
    return errors;
  }, {});
}

/** Série da API → valores do formulário (tudo string, datas em YYYY-MM-DD). */
export function toFormValues(serie) {
  if (!serie) return { ...EMPTY_FORM };
  return {
    title: serie.title ?? '',
    seasons: serie.seasons != null ? String(serie.seasons) : '',
    releaseDate: toInputDate(serie.releaseDate),
    director: serie.director ?? '',
    production: serie.production ?? '',
    category: serie.category ?? '',
    watchedAt: toInputDate(serie.watchedAt),
  };
}

/** Valores do formulário → série (textos sem espaços nas pontas, temporadas como número). */
export function toSerie(values, id) {
  const serie = {
    title: values.title.trim(),
    seasons: Number(values.seasons),
    releaseDate: values.releaseDate,
    director: values.director.trim(),
    production: values.production.trim(),
    category: values.category.trim(),
    watchedAt: values.watchedAt,
  };
  return id != null ? { id, ...serie } : serie;
}
