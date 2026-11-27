import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import SerieRegister from './SerieRegister/SerieRegister.jsx';
import EditSerie from './EditSerie/EditSerie.jsx';
import SnackbarProvider from '../contexts/SnackbarProvider.jsx';
import seriesService from '../services/seriesService.js';
import { ApiError } from '../services/api.js';

vi.mock('../services/seriesService.js', () => ({
  default: { getById: vi.fn(), create: vi.fn(), update: vi.fn() },
}));

const serie = {
  id: 2,
  title: 'Dark',
  seasons: 3,
  releaseDate: '2017-12-01',
  director: 'Baran bo Odar',
  production: 'Netflix',
  category: 'Sci-Fi/Mystery',
  watchedAt: '2023-08-18',
};

const LABELS = {
  title: /^Título/,
  seasons: /^Número de Temporadas/,
  releaseDate: /^Data de Lançamento da Temporada/,
  director: /^Diretor/,
  production: /^Produtora/,
  category: /^Categoria/,
  watchedAt: /^Data em que assistiu/,
};

function renderAt(path) {
  render(
    <SnackbarProvider>
      <MemoryRouter initialEntries={[path]}>
        <Routes>
          <Route path="/cadastrar" element={<SerieRegister />} />
          <Route path="/editar/:id" element={<EditSerie />} />
          <Route path="/series" element={<h1>Página da lista</h1>} />
        </Routes>
      </MemoryRouter>
    </SnackbarProvider>,
  );
}

describe('SerieRegister (/cadastrar)', () => {
  beforeEach(() => vi.clearAllMocks());

  it('cria a série, avisa e redireciona para a lista', async () => {
    seriesService.create.mockResolvedValue({ ...serie, id: 11 });
    renderAt('/cadastrar');

    expect(screen.getByRole('heading', { name: 'Cadastrar série' })).toBeInTheDocument();
    Object.entries(LABELS).forEach(([name, label]) => {
      fireEvent.change(screen.getByLabelText(label), { target: { value: String(serie[name]) } });
    });
    fireEvent.click(screen.getByRole('button', { name: 'Salvar' }));

    expect(await screen.findByRole('heading', { name: 'Página da lista' })).toBeInTheDocument();
    expect(screen.getByText('Série cadastrada!')).toBeInTheDocument();
    const { id: _id, ...withoutId } = serie;
    expect(seriesService.create).toHaveBeenCalledWith(withoutId);
  });

  it('Cancelar volta para a lista sem chamar a API', async () => {
    renderAt('/cadastrar');
    fireEvent.click(screen.getByRole('button', { name: 'Cancelar' }));

    expect(await screen.findByRole('heading', { name: 'Página da lista' })).toBeInTheDocument();
    expect(seriesService.create).not.toHaveBeenCalled();
  });
});

describe('EditSerie (/editar/:id)', () => {
  beforeEach(() => vi.clearAllMocks());

  it('carrega pelo id, preenche o formulário e salva com update()', async () => {
    seriesService.getById.mockResolvedValue(serie);
    seriesService.update.mockResolvedValue({ ...serie, seasons: 4 });
    renderAt('/editar/2');

    expect(screen.getByRole('progressbar')).toBeInTheDocument();
    expect(await screen.findByLabelText(LABELS.title)).toHaveValue('Dark');
    expect(seriesService.getById).toHaveBeenCalledWith('2', expect.anything());

    fireEvent.change(screen.getByLabelText(LABELS.seasons), { target: { value: '4' } });
    fireEvent.click(screen.getByRole('button', { name: 'Salvar' }));

    expect(await screen.findByRole('heading', { name: 'Página da lista' })).toBeInTheDocument();
    expect(screen.getByText('Série atualizada!')).toBeInTheDocument();
    expect(seriesService.update).toHaveBeenCalledWith({ ...serie, seasons: 4 });
  });

  it('mostra "Série não encontrada" quando a API responde 404', async () => {
    seriesService.getById.mockRejectedValue(new ApiError('Série não encontrada.', { status: 404 }));
    renderAt('/editar/999');

    expect(await screen.findByText(/Série não encontrada/)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Voltar para a lista' })).toHaveAttribute('href', '/series');
    expect(screen.queryByRole('button', { name: 'Salvar' })).not.toBeInTheDocument();
  });
});
