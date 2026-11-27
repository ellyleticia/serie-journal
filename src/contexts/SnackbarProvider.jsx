import { useCallback, useMemo, useState } from 'react';
import Alert from '@mui/material/Alert';
import Snackbar from '@mui/material/Snackbar';
import { SnackbarContext } from './SnackbarContext.js';

// Exibe avisos de sucesso/erro em qualquer página.
// Fica acima das rotas, então o aviso continua visível após um redirecionamento.
function SnackbarProvider({ children }) {
  const [snack, setSnack] = useState({ open: false, message: '', severity: 'success', key: 0 });

  const showMessage = useCallback((message, severity = 'success') => {
    setSnack({ open: true, message, severity, key: Date.now() });
  }, []);

  const handleClose = (_event, reason) => {
    if (reason === 'clickaway') return;
    setSnack((current) => ({ ...current, open: false }));
  };

  const value = useMemo(() => ({ showMessage }), [showMessage]);

  return (
    <SnackbarContext.Provider value={value}>
      {children}
      <Snackbar
        key={snack.key}
        open={snack.open}
        autoHideDuration={4000}
        onClose={handleClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleClose} severity={snack.severity} variant="filled" sx={{ width: '100%' }}>
          {snack.message}
        </Alert>
      </Snackbar>
    </SnackbarContext.Provider>
  );
}

export default SnackbarProvider;
