import Box from '@mui/material/Box';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Typography from '@mui/material/Typography';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutlineRounded';
import usePageTitle from '../../hooks/usePageTitle.js';

const FEATURES = [
  'Cadastrar novas séries assistidas, com validação dos campos;',
  'Listar e buscar séries por título, diretor ou categoria;',
  'Editar as informações de uma série já cadastrada;',
  'Excluir séries, com confirmação antes da remoção.',
];

// Página "Sobre": objetivo do projeto e tecnologias utilizadas.
function About() {
  usePageTitle('Sobre');
  return (
    <Box>
      <Typography
        variant="h4"
        component="h1"
        color="primary"
        sx={{ fontWeight: 700, textAlign: 'center', mb: 3 }}
      >
        Sobre o Projeto
      </Typography>

      <Typography sx={{ mb: 2 }}>
        O <strong>Serie Journal</strong> é uma aplicação de CRUD de séries
        assistidas desenvolvida com <strong>React</strong> (Vite e React
        Router) para a disciplina de{' '}
        <strong>Desenvolvimento de Sistemas Frontend</strong> da PUCRS.
      </Typography>

      <Typography sx={{ mb: 1 }}>Com a aplicação é possível:</Typography>

      <List disablePadding sx={{ mb: 2 }}>
        {FEATURES.map((feature) => (
          <ListItem key={feature} disableGutters>
            <ListItemIcon sx={{ minWidth: 36, color: 'primary.main' }}>
              <CheckCircleOutlineIcon fontSize="small" aria-hidden="true" />
            </ListItemIcon>
            <ListItemText primary={feature} />
          </ListItem>
        ))}
      </List>

      <Typography>
        Nesta segunda fase, os dados vêm de uma API REST (serieJournal-api),
        consumida com <strong>Axios</strong> por meio de uma camada de serviço,
        e a interface foi construída com os componentes do{' '}
        <strong>Material UI (MUI)</strong>.
      </Typography>
    </Box>
  );
}

export default About;
