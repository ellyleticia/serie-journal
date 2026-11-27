import { useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import Grid from '@mui/material/Grid';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import LiveTvIcon from '@mui/icons-material/LiveTv';
import { formatDateBR } from '../../utils/date.js';

// Uma linha "Rótulo: valor" do card.
function Field({ label, value }) {
  return (
    <Typography variant="body2" sx={{ mb: 0.75 }}>
      <Box component="span" sx={{ fontWeight: 700 }}>
        {label}:
      </Box>{' '}
      {value}
    </Typography>
  );
}

function SerieCard({ serie, onDeleteClick }) {
  return (
    <Card
      variant="outlined"
      component="article"
      aria-labelledby={`serie-title-${serie.id}`}
      sx={{ height: '100%', display: 'flex', flexDirection: 'column', borderRadius: 2 }}
    >
      <CardContent sx={{ flexGrow: 1 }}>
        <Typography
          id={`serie-title-${serie.id}`}
          variant="h6"
          component="h2"
          color="primary"
          sx={{ fontWeight: 700, mb: 1.5, lineHeight: 1.3 }}
        >
          {serie.title}
        </Typography>
        <Field label="Número de temporadas" value={serie.seasons} />
        <Field label="Data de Lançamento da Temporada" value={formatDateBR(serie.releaseDate)} />
        <Field label="Diretor" value={serie.director} />
        <Field label="Produtora" value={serie.production} />
        <Field label="Categoria" value={serie.category} />
        <Field label="Data em que assistiu" value={formatDateBR(serie.watchedAt)} />
      </CardContent>

      <CardActions sx={{ justifyContent: 'flex-end', borderTop: 1, borderColor: 'divider' }}>
        <Tooltip title="Editar série">
          <IconButton
            component={RouterLink}
            to={`/editar/${serie.id}`}
            aria-label={`Editar ${serie.title}`}
            color="secondary"
          >
            <EditIcon />
          </IconButton>
        </Tooltip>
        <Tooltip title="Excluir série">
          <IconButton
            aria-label={`Excluir ${serie.title}`}
            color="error"
            onClick={() => onDeleteClick(serie)}
          >
            <DeleteIcon />
          </IconButton>
        </Tooltip>
      </CardActions>
    </Card>
  );
}

/**
 * Grid de cards das séries. Recebe a lista via props.
 * `onDelete(serie)` só é chamado depois da confirmação no diálogo; se ele
 * devolver uma Promise, o diálogo mostra loading até ela terminar.
 */
function SerieList({ series, onDelete }) {
  const [serieToDelete, setSerieToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const closeDialog = () => {
    if (!deleting) setSerieToDelete(null);
  };

  const confirmDelete = async () => {
    setDeleting(true);
    try {
      await onDelete(serieToDelete);
    } finally {
      setDeleting(false);
      setSerieToDelete(null);
    }
  };

  if (series.length === 0) {
    return (
      <Box sx={{ textAlign: 'center', py: 6 }}>
        <LiveTvIcon sx={{ fontSize: 56, color: 'grey.400' }} aria-hidden="true" />
        <Typography variant="h6" component="p" sx={{ mt: 1, mb: 3 }}>
          Nenhuma série cadastrada
        </Typography>
        <Button component={RouterLink} to="/cadastrar" variant="contained" color="secondary">
          Cadastrar série
        </Button>
      </Box>
    );
  }

  return (
    <>
      <Grid container spacing={3}>
        {series.map((serie) => (
          <Grid key={serie.id} size={{ xs: 12, sm: 6, md: 4 }}>
            <SerieCard serie={serie} onDeleteClick={setSerieToDelete} />
          </Grid>
        ))}
      </Grid>

      <Dialog
        open={Boolean(serieToDelete)}
        onClose={closeDialog}
        aria-labelledby="delete-dialog-title"
        aria-describedby="delete-dialog-description"
      >
        <DialogTitle id="delete-dialog-title">Excluir série</DialogTitle>
        <DialogContent>
          <DialogContentText id="delete-dialog-description">
            Tem certeza que deseja excluir <strong>{serieToDelete?.title}</strong>? Essa
            ação não pode ser desfeita.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={closeDialog} disabled={deleting} variant="outlined">
            Cancelar
          </Button>
          <Button onClick={confirmDelete} loading={deleting} variant="contained" color="error">
            Excluir
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

export default SerieList;
