import axios from 'axios';

// URL base da API vinda do .env (VITE_API_URL). O fallback segue a porta padrão da serieJournal-api.
const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// Repetição automática em caso de erro de rede (sem resposta da API).
// A serieJournal-api roda com nodemon e reinicia após cada escrita no JSON,
// então uma requisição feita logo depois de salvar/excluir pode encontrar a API
// fora do ar por ~1–2s. Só métodos idempotentes são repetidos (repetir não causa
// efeito duplicado); POST não, para não correr o risco de cadastrar duas vezes.
const RETRYABLE_METHODS = ['get', 'put', 'delete'];
const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 700;

/** Erro padronizado devolvido por todas as chamadas à API. */
export class ApiError extends Error {
  constructor(message, { status = null, apiMessage = null, isNetworkError = false } = {}) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.apiMessage = apiMessage;
    this.isNetworkError = isNetworkError;
  }
}

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
});

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// A API responde erros às vezes com { error }, às vezes com { message },
// e rotas inexistentes devolvem uma página HTML.
function extractApiMessage(data) {
  if (data && typeof data === 'object') {
    return data.message || data.error || null;
  }
  return null;
}

/** Converte qualquer erro do Axios em um ApiError com mensagem em português. */
export function toApiError(error) {
  if (error instanceof ApiError) return error;

  if (error.code === 'ECONNABORTED' || error.code === 'ETIMEDOUT') {
    return new ApiError('A API demorou para responder. Tente novamente.', {
      isNetworkError: true,
    });
  }

  if (!error.response) {
    return new ApiError(
      'Não foi possível conectar à API. Verifique se ela está rodando.',
      { isNetworkError: true },
    );
  }

  const { status, data } = error.response;
  const apiMessage = extractApiMessage(data);

  let message;
  if (status === 404) {
    message = 'Série não encontrada.';
  } else if (status >= 500) {
    message = 'Erro no servidor da API. Tente novamente mais tarde.';
  } else {
    message = apiMessage || `Erro inesperado na requisição (status ${status}).`;
  }

  return new ApiError(message, { status, apiMessage });
}

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    // Requisições canceladas (ex.: componente desmontado) seguem como estão.
    if (axios.isCancel(error)) return Promise.reject(error);

    const config = error.config;
    const isRetryable = RETRYABLE_METHODS.includes(config?.method?.toLowerCase());
    const isNetworkFailure = !error.response && error.code !== 'ECONNABORTED';

    if (config && isRetryable && isNetworkFailure) {
      config.retryCount = (config.retryCount || 0) + 1;
      if (config.retryCount <= MAX_RETRIES) {
        await wait(RETRY_DELAY_MS);
        return api(config);
      }
    }

    return Promise.reject(toApiError(error));
  },
);

export default api;
