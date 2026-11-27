import { describe, it, expect, vi } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import SerieList from './SerieList.jsx';

const sampleSeries = [
  {
    id: 1,
    title: 'Breaking Bad',
    seasons: 5,
    releaseDate: '2008-01-20',
    director: 'Vince Gilligan',
    production: 'AMC',
    category: 'Drama',
    watchedAt: '2019-03-15',
  },
  {
    id: 2,
    title: 'Friends',
    seasons: 10,
    releaseDate: '1994-09-22',
    director: 'James Burrows',
    production: 'Warner Bros',
    category: 'Comédia',
    watchedAt: '2018-07-01',
  },
];

function renderList({ series = sampleSeries, onDelete = vi.fn() } = {}) {
  return render(
    <MemoryRouter>
      <SerieList series={series} onDelete={onDelete} />
    </MemoryRouter>,
  );
}

describe('SerieList', () => {
  it('renderiza um card por série recebida via props', () => {
    renderList();

    expect(screen.getAllByRole('article')).toHaveLength(2);
    expect(screen.getByRole('heading', { name: 'Breaking Bad' })).toBeInTheDocument();
    expect(screen.getByText('Vince Gilligan')).toBeInTheDocument();
    // Datas exibidas em dd/mm/aaaa.
    expect(screen.getByText('20/01/2008')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Editar Friends' })).toHaveAttribute(
      'href',
      '/editar/2',
    );
  });

  it('mostra o estado vazio quando não há séries', () => {
    renderList({ series: [] });

    expect(screen.getByText('Nenhuma série cadastrada')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Cadastrar série' })).toHaveAttribute(
      'href',
      '/cadastrar',
    );
  });

  it('chama onDelete com a série só depois de confirmar no diálogo', async () => {
    const user = userEvent.setup();
    const onDelete = vi.fn().mockResolvedValue(undefined);
    renderList({ onDelete });

    await user.click(screen.getByRole('button', { name: 'Excluir Breaking Bad' }));
    const dialog = await screen.findByRole('dialog');
    expect(within(dialog).getByText('Breaking Bad')).toBeInTheDocument();
    expect(onDelete).not.toHaveBeenCalled();

    await user.click(within(dialog).getByRole('button', { name: 'Excluir' }));
    expect(onDelete).toHaveBeenCalledWith(sampleSeries[0]);
  });

  it('não chama onDelete ao cancelar', async () => {
    const user = userEvent.setup();
    const onDelete = vi.fn();
    renderList({ onDelete });

    await user.click(screen.getByRole('button', { name: 'Excluir Friends' }));
    await user.click(await screen.findByRole('button', { name: 'Cancelar' }));

    expect(onDelete).not.toHaveBeenCalled();
  });
});
