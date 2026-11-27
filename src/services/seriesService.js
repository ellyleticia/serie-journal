import api from './api.js';

const RESOURCE = '/series';

const TEXT_FIELDS = ['title', 'director', 'production', 'category', 'releaseDate', 'watchedAt'];

// Monta o corpo enviado à API: textos sem espaços nas pontas e temporadas como número.
// A API não valida nada e grava o que receber, então a normalização fica aqui.
function toPayload(serie) {
  const payload = {};
  TEXT_FIELDS.forEach((field) => {
    payload[field] = String(serie[field] ?? '').trim();
  });
  payload.seasons = Number(serie.seasons);
  return payload;
}

/** GET /series — lista todas as séries. */
export async function getAll(config) {
  const { data } = await api.get(RESOURCE, config);
  return Array.isArray(data) ? data : [];
}

/** GET /series/:id — busca uma série pelo id. */
export async function getById(id, config) {
  const { data } = await api.get(`${RESOURCE}/${id}`, config);
  return data;
}

/** POST /series — cadastra uma série. A API gera o id. */
export async function create(serie) {
  const { data } = await api.post(RESOURCE, toPayload(serie));
  return data;
}

/**
 * PUT /series — atualiza uma série.
 * A rota não tem :id: o id vai no corpo e precisa ser number,
 * porque a API compara com === e substitui o registro inteiro.
 */
export async function update(serie) {
  const id = Number(serie.id);
  if (!Number.isInteger(id)) {
    throw new Error('update() precisa de uma série com id numérico.');
  }
  const { data } = await api.put(RESOURCE, { ...toPayload(serie), id });
  return data;
}

/** DELETE /series/:id — remove uma série. */
export async function remove(id) {
  const { data } = await api.delete(`${RESOURCE}/${id}`);
  return data;
}

const seriesService = { getAll, getById, create, update, remove };

export default seriesService;
