import { createContext, useContext } from 'react';

// Contexto dos avisos (Snackbar). O valor padrão é um no-op,
// então componentes renderizados sem o provider (ex.: em testes) não quebram.
export const SnackbarContext = createContext({ showMessage: () => {} });

/** Retorna { showMessage(message, severity = 'success') }. */
export function useSnackbar() {
  return useContext(SnackbarContext);
}
