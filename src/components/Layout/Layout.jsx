import { Suspense } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import Container from '@mui/material/Container';
import Paper from '@mui/material/Paper';
import NavBar from '../NavBar/NavBar.jsx';
import cinemaBackground from '../../assets/cinema-background.jpg';

// Páginas que precisam de mais largura (grid de 3 colunas na lista).
const WIDE_ROUTES = ['/series'];

// Estrutura comum: fundo de cinema fixo, NavBar e a página num card branco central.
function Layout() {
  const { pathname } = useLocation();
  const isWide = WIDE_ROUTES.includes(pathname);

  return (
    <Box sx={{ minHeight: '100vh', position: 'relative' }}>
      {/* Fundo fixo em um elemento próprio (background-attachment: fixed falha no iOS). */}
      <Box
        aria-hidden="true"
        sx={{
          position: 'fixed',
          inset: 0,
          zIndex: -1,
          backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.35), rgba(0, 0, 0, 0.35)), url(${cinemaBackground})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          backgroundColor: 'grey.900',
        }}
      />

      <NavBar />

      <Container component="main" maxWidth={isWide ? 'lg' : 'md'} sx={{ py: { xs: 3, md: 6 } }}>
        <Paper
          elevation={0}
          sx={{
            borderRadius: 2, // 2 × 12px do tema = 24px
            p: { xs: 3, sm: 4, md: 5 },
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.25)',
          }}
        >
          <Suspense
            fallback={
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
                <CircularProgress aria-label="Carregando página" />
              </Box>
            }
          >
            <Outlet />
          </Suspense>
        </Paper>
      </Container>
    </Box>
  );
}

export default Layout;
