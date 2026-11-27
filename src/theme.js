import { createTheme } from '@mui/material/styles';

// Fonte cursiva usada apenas no título da Home (carregada no index.html).
export const CURSIVE_FONT = '"Dancing Script", cursive';

const SANS_SERIF_FONT = '"Roboto", "Helvetica", "Arial", sans-serif';

const theme = createTheme({
  palette: {
    // Roxo: identidade visual (títulos, link ativo da NavBar).
    primary: {
      main: '#5E35B1',
      contrastText: '#FFFFFF',
    },
    // Azul: botões de ação (Salvar, editar).
    secondary: {
      main: '#1976D2',
      contrastText: '#FFFFFF',
    },
    error: {
      main: '#D32F2F',
    },
    background: {
      default: '#F5F6F8',
      paper: '#FFFFFF',
    },
  },
  shape: {
    borderRadius: 12,
  },
  typography: {
    fontFamily: SANS_SERIF_FONT,
    // Variante customizada para o título cursivo da Home.
    cursiveTitle: {
      fontFamily: CURSIVE_FONT,
      fontWeight: 700,
      fontSize: '3rem',
      lineHeight: 1.2,
    },
  },
  components: {
    MuiTypography: {
      defaultProps: {
        variantMapping: {
          cursiveTitle: 'h1',
        },
      },
    },
  },
});

export default theme;
