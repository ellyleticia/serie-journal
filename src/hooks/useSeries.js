import { useCallback, useEffect, useState } from 'react';
import axios from 'axios';
import seriesService from '../services/seriesService.js';

/**
 * Estado da lista de séries vinda da API (usado na página /series).
 *
 * Depois de excluir, o estado local é atualizado sem chamar getAll() de novo.
 * Motivo: a API reinicia (nodemon) logo após cada escrita, e uma releitura
 * imediata poderia falhar.
 */
export default function useSeries({ autoLoad = true } = {}) {
  const [series, setSeries] = useState([]);
  const [loading, setLoading] = useState(autoLoad);
  const [error, setError] = useState(null);

  // Incrementar esta chave dispara uma nova busca (ver reload()).
  const [reloadKey, setReloadKey] = useState(0);

  // Busca a lista ao montar e a cada reload. A requisição é cancelada se o
  // componente desmontar (ou no duplo efeito do StrictMode).
  useEffect(() => {
    if (!autoLoad && reloadKey === 0) return undefined;
    const controller = new AbortController();

    seriesService
      .getAll({ signal: controller.signal })
      .then((data) => {
        setSeries(data);
        setError(null);
      })
      .catch((err) => {
        if (!axios.isCancel(err)) setError(err);
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });

    return () => controller.abort();
  }, [autoLoad, reloadKey]);

  // Recarregar sob demanda (ex.: botão "Tentar novamente").
  const reload = useCallback(() => {
    setLoading(true);
    setError(null);
    setReloadKey((key) => key + 1);
  }, []);

  const removeSerie = useCallback(async (id) => {
    await seriesService.remove(id);
    setSeries((current) => current.filter((s) => s.id !== id));
  }, []);

  return { series, loading, error, reload, removeSerie };
}
