import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, within, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import SerieListPage from './SerieListPage.jsx';
import SnackbarProvider from '../../contexts/SnackbarProvider.jsx';
import seriesService from '../../services/seriesService.js';

// O serviço é mockado: o teste não depende da API rodando.
vi.mock('../../services/seriesService.js', () => ({
  default: { getAll: vi.fn(), remove: vi.fn() },
}));

const apiSeries = [
  { id: 1, title: 'Breaking Bad', seasons: 5, releaseDate: '2008-01-20', director: 'Vince Gilligan', production: 'AMC', category: 'Drama/Crime', watchedAt: '2023-03-10' },
  { id: 2, title: 'Dark', seasons: 3, releaseDate: '2017-12-01', director: 'Baran bo Odar', production: 'Netflix', category: 'Ficção Científica', watchedAt: '2023-08-18' },
  { id: 3, title: 'Fleabag', seasons: 2, releaseDate: '2016-07-21', director: 'Phoebe Waller-Bridge', production: 'BBC', category: 'Comedy/Drama', watchedAt: '2024-01-14' },
];

function renderPage() {
  return render(
    <SnackbarProvider>
      <MemoryRouter>
        <SerieListPage />
      </MemoryRouter>
    </SnackbarProvider>,
  );
}

const cardTitles = () =>
  screen.queryAllByRole('article').map((card) => within(card).getByRole('heading').textContent);

describe('SerieListPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    seriesService.getAll.mockResolvedValue(apiSeries);
  });

  it('carrega as séries do serviço e passa para a lista', async () => {
    renderPage();

    expect(await screen.findByRole('heading', { name: 'Breaking Bad' })).toBeInTheDocument();
    expect(cardTitles()).toEqual(['Breaking Bad', 'Dark', 'Fleabag']);
    expect(seriesService.getAll).toHaveBeenCalledTimes(1);
  });

  it('filtra por título, diretor ou categoria, sem diferenciar maiúsculas nem acentos', async () => {
    const user = userEvent.setup();
    renderPage();
    const search = await screen.findByRole('searchbox', { name: 'Buscar série' });

    await user.type(search, 'DARK');
    expect(cardTitles()).toEqual(['Dark']);

    await user.clear(search);
    await user.type(search, 'waller');
    expect(cardTitles()).toEqual(['Fleabag']);

    await user.clear(search);
    await user.type(search, 'ficcao cientifica');
    expect(cardTitles()).toEqual(['Dark']);

    await user.clear(search);
    await user.type(search, 'drama');
    expect(cardTitles()).toEqual(['Breaking Bad', 'Fleabag']);
  });

  it('mostra "Nenhuma série encontrada" e limpa a busca', async () => {
    const user = userEvent.setup();
    renderPage();
    const search = await screen.findByRole('searchbox', { name: 'Buscar série' });

    await user.type(search, 'xyz');
    expect(screen.getByText('Nenhuma série encontrada')).toBeInTheDocument();
    expect(cardTitles()).toEqual([]);

    await user.click(screen.getByRole('button', { name: 'Limpar busca' }));
    expect(cardTitles()).toHaveLength(3);
  });

  it('mostra o estado vazio quando a API não tem séries', async () => {
    seriesService.getAll.mockResolvedValue([]);
    renderPage();

    expect(await screen.findByText('Nenhuma série cadastrada')).toBeInTheDocument();
    expect(screen.queryByRole('searchbox')).not.toBeInTheDocument();
  });

  it('mostra erro e recarrega com "Tentar novamente"', async () => {
    const user = userEvent.setup();
    seriesService.getAll
      .mockRejectedValueOnce(new Error('Não foi possível conectar à API.'))
      .mockResolvedValueOnce(apiSeries);
    renderPage();

    expect(await screen.findByRole('alert')).toHaveTextContent('Não foi possível conectar à API.');
    await user.click(screen.getByRole('button', { name: 'Tentar novamente' }));

    expect(await screen.findByRole('heading', { name: 'Dark' })).toBeInTheDocument();
    expect(seriesService.getAll).toHaveBeenCalledTimes(2);
  });

  it('exclui após confirmar: chama remove(id), tira o card e avisa', async () => {
    const user = userEvent.setup();
    seriesService.remove.mockResolvedValue({ message: 'Serie removed successfully' });
    renderPage();

    await user.click(await screen.findByRole('button', { name: 'Excluir Dark' }));
    await user.click(within(await screen.findByRole('dialog')).getByRole('button', { name: 'Excluir' }));

    expect(seriesService.remove).toHaveBeenCalledWith(2);
    expect(await screen.findByText('Série "Dark" excluída.')).toBeInTheDocument();
    // Espera o diálogo fechar (enquanto aberto, o MUI esconde o resto da página com aria-hidden).
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    expect(cardTitles()).toEqual(['Breaking Bad', 'Fleabag']);
  });

  it('mantém o card e avisa quando a exclusão falha', async () => {
    const user = userEvent.setup();
    seriesService.remove.mockRejectedValue(new Error('Erro no servidor da API.'));
    renderPage();

    await user.click(await screen.findByRole('button', { name: 'Excluir Dark' }));
    await user.click(within(await screen.findByRole('dialog')).getByRole('button', { name: 'Excluir' }));

    expect(await screen.findByText(/Não foi possível excluir a série/)).toBeInTheDocument();
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    expect(cardTitles()).toContain('Dark');
  });
});
