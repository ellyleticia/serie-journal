import { useMemo, useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Grid from '@mui/material/Grid';
import InputAdornment from '@mui/material/InputAdornment';
import Skeleton from '@mui/material/Skeleton';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';
import SerieList from '../../components/SerieList/SerieList.jsx';
import useSeries from '../../hooks/useSeries.js';
import { useSnackbar } from '../../contexts/SnackbarContext.js';
import { normalizeText } from '../../utils/text.js';
import usePageTitle from '../../hooks/usePageTitle.js';

const SEARCH_FIELDS = ['title', 'director', 'category'];

// Cards "fantasmas" exibidos enquanto a lista carrega.
function LoadingGrid() {
  return (
    <Grid container spacing={3} aria-busy="true" aria-label="Carregando séries">
      {Array.from({ length: 6 }, (_, index) => (
        <Grid key={index} size={{ xs: 12, sm: 6, md: 4 }}>
          <Card variant="outlined" sx={{ borderRadius: 2 }}>
            <CardContent>
              <Skeleton variant="text" width="70%" height={32} />
              {Array.from({ length: 6 }, (__, line) => (
                <Skeleton key={line} variant="text" width={`${90 - line * 6}%`} />
              ))}
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
}

// Página /series: busca as séries na API e passa a lista para a SerieList via props.
function SerieListPage() {
  usePageTitle('Lista de séries');
  const { series, loading, error, reload, removeSerie } = useSeries();
  const { showMessage } = useSnackbar();
  const [search, setSearch] = useState('');

  const term = normalizeText(search);
  const filteredSeries = useMemo(
    () =>
      term
        ? series.filter((serie) =>
            SEARCH_FIELDS.some((field) => normalizeText(serie[field]).includes(term)),
          )
        : series,
    [series, term],
  );

  // Chamado pela SerieList depois que o usuário confirma no diálogo.
  const handleDelete = async (serie) => {
    try {
      await removeSerie(serie.id);
      showMessage(`Série "${serie.title}" excluída.`, 'success');
    } catch (err) {
      showMessage(`Não foi possível excluir a série. ${err.message}`, 'error');
    }
  };

  const hasSeries = series.length > 0;

  return (
    <Box>
      <Box
        sx={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 2,
          mb: 3,
        }}
      >
        <Typography variant="h4" component="h1" color="primary" sx={{ fontWeight: 700 }}>
          Lista de séries
        </Typography>
        <Button
          component={RouterLink}
          to="/cadastrar"
          variant="contained"
          color="secondary"
          startIcon={<AddIcon />}
        >
          Cadastrar série
        </Button>
      </Box>

      {!loading && !error && hasSeries && (
        <TextField
          fullWidth
          type="search"
          label="Buscar série"
          placeholder="Título, diretor ou categoria"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          sx={{ mb: 3 }}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon aria-hidden="true" />
                </InputAdornment>
              ),
            },
          }}
        />
      )}

      {loading && <LoadingGrid />}

      {!loading && error && (
        <Alert
          severity="error"
          action={
            <Button color="inherit" size="small" onClick={reload}>
              Tentar novamente
            </Button>
          }
        >
          Não foi possível carregar as séries. {error.message}
        </Alert>
      )}

      {!loading && !error && hasSeries && filteredSeries.length === 0 && (
        <Box sx={{ textAlign: 'center', py: 6 }}>
          <Typography variant="h6" component="p" sx={{ mb: 2 }}>
            Nenhuma série encontrada
          </Typography>
          <Button variant="outlined" onClick={() => setSearch('')}>
            Limpar busca
          </Button>
        </Box>
      )}

      {!loading && !error && (!hasSeries || filteredSeries.length > 0) && (
        <SerieList series={filteredSeries} onDelete={handleDelete} />
      )}
    </Box>
  );
}

export default SerieListPage;
