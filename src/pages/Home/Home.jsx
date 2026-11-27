import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import usePageTitle from '../../hooks/usePageTitle.js';

// Página inicial: título cursivo e mensagem de boas-vindas.
function Home() {
  usePageTitle('Página Inicial');
  return (
    <Box sx={{ textAlign: 'center', py: { xs: 2, md: 4 } }}>
      <Typography
        variant="cursiveTitle"
        color="primary"
        sx={{ fontSize: { xs: '2.5rem', sm: '3.25rem', md: '3.75rem' } }}
      >
        Página Inicial
      </Typography>

      <Typography
        variant="h5"
        component="p"
        sx={{ fontWeight: 700, mt: 3, fontSize: { xs: '1.2rem', sm: '1.5rem' } }}
      >
        Bem-vindo ao projeto CRUD de séries!
      </Typography>

      <Typography sx={{ mt: 1.5, color: 'text.secondary', fontSize: '1.05rem' }}>
        Gerencie séries assistidas de uma forma fácil e intuitiva.
      </Typography>
    </Box>
  );
}

export default Home;
