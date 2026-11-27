import { describe, it, expect, vi, beforeEach } from 'vitest';
import api from './api.js';
import seriesService from './seriesService.js';

// A instância do Axios é mockada: nenhuma requisição real é feita.
vi.mock('./api.js', () => ({
  default: { get: vi.fn(), post: vi.fn(), put: vi.fn(), delete: vi.fn() },
}));

const formSerie = {
  title: '  Dark ',
  seasons: '3',
  releaseDate: '2017-12-01',
  director: 'Baran bo Odar',
  production: 'Netflix',
  category: 'Sci-Fi/Mystery',
  watchedAt: '2023-08-18',
};

const normalized = {
  title: 'Dark',
  seasons: 3,
  releaseDate: '2017-12-01',
  director: 'Baran bo Odar',
  production: 'Netflix',
  category: 'Sci-Fi/Mystery',
  watchedAt: '2023-08-18',
};

describe('seriesService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('getAll() faz GET /series e devolve o array', async () => {
    api.get.mockResolvedValue({ data: [{ id: 1 }] });

    await expect(seriesService.getAll()).resolves.toEqual([{ id: 1 }]);
    expect(api.get).toHaveBeenCalledWith('/series', undefined);
  });

  it('getAll() devolve [] se a resposta não for um array', async () => {
    api.get.mockResolvedValue({ data: '<html>' });
    await expect(seriesService.getAll()).resolves.toEqual([]);
  });

  it('getById() faz GET /series/:id', async () => {
    api.get.mockResolvedValue({ data: { id: 7 } });

    await expect(seriesService.getById(7)).resolves.toEqual({ id: 7 });
    expect(api.get).toHaveBeenCalledWith('/series/7', undefined);
  });

  it('create() faz POST /series com o corpo normalizado e sem id', async () => {
    api.post.mockResolvedValue({ data: { ...normalized, id: 11 } });

    await expect(seriesService.create({ ...formSerie, id: 99 })).resolves.toMatchObject({ id: 11 });
    expect(api.post).toHaveBeenCalledWith('/series', normalized);
  });

  it('update() faz PUT /series com o id numérico no corpo', async () => {
    api.put.mockResolvedValue({ data: { ...normalized, id: 5 } });

    await seriesService.update({ ...formSerie, id: '5' });
    expect(api.put).toHaveBeenCalledWith('/series', { ...normalized, id: 5 });
  });

  it('update() sem id válido lança erro e não chama a API', async () => {
    await expect(seriesService.update(formSerie)).rejects.toThrow('id numérico');
    expect(api.put).not.toHaveBeenCalled();
  });

  it('remove() faz DELETE /series/:id', async () => {
    api.delete.mockResolvedValue({ data: { message: 'Serie removed successfully' } });

    await seriesService.remove(3);
    expect(api.delete).toHaveBeenCalledWith('/series/3');
  });

  it('repassa o erro da API para quem chamou', async () => {
    api.get.mockRejectedValue(new Error('Série não encontrada.'));
    await expect(seriesService.getById(999)).rejects.toThrow('Série não encontrada.');
  });
});
