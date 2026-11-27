import { describe, it, expect, vi, afterEach } from 'vitest';
import { AxiosError } from 'axios';
import api, { ApiError, toApiError } from './api.js';

const httpError = (status, data) =>
  new AxiosError('Request failed', 'ERR_BAD_RESPONSE', {}, {}, { status, data });

describe('toApiError', () => {
  it('converte 404 em mensagem em português e guarda a mensagem original', () => {
    const error = toApiError(httpError(404, { error: 'Serie not found' }));

    expect(error).toBeInstanceOf(ApiError);
    expect(error.status).toBe(404);
    expect(error.message).toBe('Série não encontrada.');
    expect(error.apiMessage).toBe('Serie not found');
  });

  it('converte 500 em mensagem de erro do servidor', () => {
    const error = toApiError(httpError(500, { message: 'Internal server error' }));
    expect(error.message).toBe('Erro no servidor da API. Tente novamente mais tarde.');
  });

  it('aceita respostas em HTML (rota inexistente) sem quebrar', () => {
    const error = toApiError(httpError(400, '<html>Not Found</html>'));
    expect(error.message).toBe('Erro inesperado na requisição (status 400).');
    expect(error.apiMessage).toBeNull();
  });

  it('identifica API fora do ar (sem resposta)', () => {
    const error = toApiError(new AxiosError('Network Error', 'ERR_NETWORK'));
    expect(error.isNetworkError).toBe(true);
    expect(error.message).toMatch(/Não foi possível conectar à API/);
  });

  it('identifica timeout', () => {
    const error = toApiError(new AxiosError('timeout', 'ECONNABORTED'));
    expect(error.message).toMatch(/demorou para responder/);
  });
});

describe('interceptor de resposta', () => {
  const originalAdapter = api.defaults.adapter;

  afterEach(() => {
    api.defaults.adapter = originalAdapter;
    vi.useRealTimers();
  });

  it('repete um GET que falhou por erro de rede (API reiniciando)', async () => {
    vi.useFakeTimers();
    const adapter = vi
      .fn()
      .mockImplementationOnce((config) =>
        Promise.reject(new AxiosError('Network Error', 'ERR_NETWORK', config)),
      )
      .mockImplementationOnce((config) =>
        Promise.resolve({ data: [{ id: 1 }], status: 200, statusText: 'OK', headers: {}, config }),
      );
    api.defaults.adapter = adapter;

    const request = api.get('/series');
    await vi.advanceTimersByTimeAsync(1000);

    await expect(request).resolves.toMatchObject({ data: [{ id: 1 }] });
    expect(adapter).toHaveBeenCalledTimes(2);
  });

  it('repete DELETE e PUT (idempotentes) após erro de rede', async () => {
    vi.useFakeTimers();
    const fail = (config) => Promise.reject(new AxiosError('Network Error', 'ERR_NETWORK', config));
    const ok = (config) =>
      Promise.resolve({ data: {}, status: 200, statusText: 'OK', headers: {}, config });
    const adapter = vi
      .fn()
      .mockImplementationOnce(fail)
      .mockImplementationOnce(ok)
      .mockImplementationOnce(fail)
      .mockImplementationOnce(fail)
      .mockImplementationOnce(ok);
    api.defaults.adapter = adapter;

    const del = api.delete('/series/1');
    await vi.advanceTimersByTimeAsync(1000);
    await expect(del).resolves.toMatchObject({ status: 200 });

    const put = api.put('/series', { id: 1 });
    await vi.advanceTimersByTimeAsync(2000);
    await expect(put).resolves.toMatchObject({ status: 200 });

    expect(adapter).toHaveBeenCalledTimes(5);
  });

  it('desiste após 3 novas tentativas e devolve um ApiError de rede', async () => {
    vi.useFakeTimers();
    const adapter = vi.fn((config) =>
      Promise.reject(new AxiosError('Network Error', 'ERR_NETWORK', config)),
    );
    api.defaults.adapter = adapter;

    const request = api.get('/series');
    const assertion = expect(request).rejects.toMatchObject({ isNetworkError: true });
    await vi.advanceTimersByTimeAsync(5000);
    await assertion;
    expect(adapter).toHaveBeenCalledTimes(4);
  });

  it('não repete POST e devolve um ApiError', async () => {
    const adapter = vi.fn((config) =>
      Promise.reject(new AxiosError('Network Error', 'ERR_NETWORK', config)),
    );
    api.defaults.adapter = adapter;

    await expect(api.post('/series', {})).rejects.toBeInstanceOf(ApiError);
    expect(adapter).toHaveBeenCalledTimes(1);
  });
});
