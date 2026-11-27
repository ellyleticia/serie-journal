import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Drawer from '@mui/material/Drawer';
import IconButton from '@mui/material/IconButton';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import Toolbar from '@mui/material/Toolbar';
import MenuIcon from '@mui/icons-material/Menu';
import MovieFilterIcon from '@mui/icons-material/MovieFilter';

// Links da navegação. `end` faz a Home ficar ativa só em "/".
const NAV_LINKS = [
  { to: '/', label: 'Home', end: true },
  { to: '/sobre', label: 'Sobre' },
  { to: '/cadastrar', label: 'Cadastrar' },
  { to: '/series', label: 'Lista de séries' },
];

// O NavLink adiciona a classe "active" (e aria-current="page") no link da rota atual.
const pillSx = {
  borderRadius: 999,
  px: 2.5,
  py: 0.75,
  textTransform: 'none',
  fontWeight: 500,
  whiteSpace: 'nowrap',
  color: 'text.primary',
  bgcolor: 'grey.200',
  '&:hover': { bgcolor: 'grey.300' },
  '&.active': {
    bgcolor: 'primary.main',
    color: 'primary.contrastText',
    '&:hover': { bgcolor: 'primary.dark' },
  },
  '&.Mui-focusVisible': {
    outline: '2px solid',
    outlineColor: 'primary.main',
    outlineOffset: 2,
  },
};

const drawerItemSx = {
  borderRadius: 999,
  mx: 1,
  mb: 0.5,
  '&.active': {
    bgcolor: 'primary.main',
    color: 'primary.contrastText',
    '&:hover': { bgcolor: 'primary.dark' },
  },
};

// Barra de navegação: claquete à esquerda e links em pílula à direita.
// No celular, os links vão para um Drawer aberto pelo botão de menu.
function NavBar() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const closeDrawer = () => setDrawerOpen(false);

  return (
    <AppBar
      position="sticky"
      color="inherit"
      elevation={0}
      sx={{ bgcolor: 'background.paper', borderBottom: 1, borderColor: 'divider' }}
    >
      <Toolbar sx={{ gap: 2 }}>
        <IconButton
          component={NavLink}
          to="/"
          aria-label="Serie Journal — página inicial"
          edge="start"
          sx={{ color: 'primary.main' }}
        >
          <MovieFilterIcon fontSize="large" />
        </IconButton>

        <Box sx={{ flexGrow: 1 }} />

        {/* Pílulas: tablet e desktop */}
        <Box
          component="nav"
          aria-label="Navegação principal"
          sx={{ display: { xs: 'none', sm: 'flex' }, gap: 1 }}
        >
          {NAV_LINKS.map((link) => (
            <Button
              key={link.to}
              component={NavLink}
              to={link.to}
              end={link.end}
              disableElevation
              sx={pillSx}
            >
              {link.label}
            </Button>
          ))}
        </Box>

        {/* Botão de menu: celular */}
        <IconButton
          aria-label="Abrir menu de navegação"
          aria-controls="nav-drawer"
          aria-expanded={drawerOpen}
          onClick={() => setDrawerOpen(true)}
          sx={{ display: { xs: 'inline-flex', sm: 'none' } }}
        >
          <MenuIcon />
        </IconButton>
      </Toolbar>

      <Drawer id="nav-drawer" anchor="right" open={drawerOpen} onClose={closeDrawer}>
        <Box component="nav" aria-label="Navegação principal" sx={{ width: 240, pt: 2 }}>
          <List>
            {NAV_LINKS.map((link) => (
              <ListItem key={link.to} disablePadding>
                <ListItemButton
                  component={NavLink}
                  to={link.to}
                  end={link.end}
                  onClick={closeDrawer}
                  sx={drawerItemSx}
                >
                  <ListItemText primary={link.label} />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        </Box>
      </Drawer>
    </AppBar>
  );
}

export default NavBar;
