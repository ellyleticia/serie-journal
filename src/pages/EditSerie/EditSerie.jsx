import { useEffect, useState } from 'react';
import { Link as RouterLink, useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Typography from '@mui/material/Typography';
import SerieForm from '../../components/SerieForm/SerieForm.jsx';
import seriesService from '../../services/seriesService.js';
import { useSnackbar } from '../../contexts/SnackbarContext.js';
import usePageTitle from '../../hooks/usePageTitle.js';

// Página /editar/:id: carrega a série, preenche o formulário e salva com PUT /series.
function EditSerie() {
  usePageTitle('Editar série');
  const { id } = useParams();
  const navigate = useNavigate();
  const { showMessage } = useSnackbar();

  const [serie, setSerie] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    seriesService
      .getById(id, { signal: controller.signal })
      .then((data) => {
        setSerie(data);
        setError(null);
      })
      .catch((err) => {
        if (!axios.isCancel(err)) setError(err);
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, [id, reloadKey]);

  const retry = () => {
    setLoading(true);
    setError(null);
    setReloadKey((key) => key + 1);
  };

  const handleSubmit = async (data) => {
    await seriesService.update({ ...data, id: serie.id });
    showMessage('Série atualizada!', 'success');
    navigate('/series');
  };

  let content;
  if (loading) {
    content = (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
        <CircularProgress aria-label="Carregando série" />
      </Box>
    );
  } else if (error?.status === 404) {
    content = (
      <Box sx={{ textAlign: 'center' }}>
        <Alert severity="warning" sx={{ mb: 3, textAlign: 'left' }}>
          Série não encontrada. Ela pode ter sido excluída.
        </Alert>
        <Button component={RouterLink} to="/series" variant="contained" color="secondary">
          Voltar para a lista
        </Button>
      </Box>
    );
  } else if (error) {
    content = (
      <Alert
        severity="error"
        action={
          <Button color="inherit" size="small" onClick={retry}>
            Tentar novamente
          </Button>
        }
      >
        Não foi possível carregar a série. {error.message}
      </Alert>
    );
  } else {
    content = (
      <SerieForm
        key={serie.id}
        initialData={serie}
        onSubmit={handleSubmit}
        onCancel={() => navigate('/series')}
      />
    );
  }

  return (
    <Box>
      <Typography
        variant="h4"
        component="h1"
        color="primary"
        sx={{ fontWeight: 700, textAlign: 'center', mb: 3 }}
      >
        Editar série
      </Typography>
      {content}
    </Box>
  );
}

export default EditSerie;
