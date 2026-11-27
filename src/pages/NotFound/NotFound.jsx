import { Link as RouterLink } from 'react-router-dom';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import usePageTitle from '../../hooks/usePageTitle.js';

// Rota coringa (404) para endereços inexistentes.
function NotFound() {
  usePageTitle('Página não encontrada');
  return (
    <Box sx={{ textAlign: 'center', py: 2 }}>
      <Typography variant="h2" component="h1" color="primary" sx={{ fontWeight: 700 }}>
        404
      </Typography>
      <Typography sx={{ mt: 2, mb: 4 }}>
        A página que você procura não foi encontrada.
      </Typography>
      <Button component={RouterLink} to="/" variant="contained" color="secondary">
        Voltar para a página inicial
      </Button>
    </Box>
  );
}

export default NotFound;
