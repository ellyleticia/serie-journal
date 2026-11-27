import { useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import SerieForm from '../../components/SerieForm/SerieForm.jsx';
import seriesService from '../../services/seriesService.js';
import { useSnackbar } from '../../contexts/SnackbarContext.js';
import usePageTitle from '../../hooks/usePageTitle.js';

// Página /cadastrar: cria uma série na API e volta para a lista.
function SerieRegister() {
  usePageTitle('Cadastrar série');
  const navigate = useNavigate();
  const { showMessage } = useSnackbar();

  // Erros da API são relançados pelo create() e exibidos pelo SerieForm.
  const handleSubmit = async (serie) => {
    await seriesService.create(serie);
    showMessage('Série cadastrada!', 'success');
    navigate('/series');
  };

  return (
    <Box>
      <Typography
        variant="h4"
        component="h1"
        color="primary"
        sx={{ fontWeight: 700, textAlign: 'center', mb: 3 }}
      >
        Cadastrar série
      </Typography>
      <SerieForm onSubmit={handleSubmit} onCancel={() => navigate('/series')} />
    </Box>
  );
}

export default SerieRegister;
