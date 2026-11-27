import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import SerieForm from './SerieForm.jsx';
import { validateField } from './validation.js';

const VALID = {
  title: '  Dark ',
  seasons: '3',
  releaseDate: '2017-12-01',
  director: 'Baran bo Odar',
  production: 'Netflix',
  category: 'Sci-Fi/Mystery',
  watchedAt: '2023-08-18',
};

// Os labels do MUI recebem " *" nos campos obrigatórios, por isso a regex com ^.
const LABELS = {
  title: /^Título/,
  seasons: /^Número de Temporadas/,
  releaseDate: /^Data de Lançamento da Temporada/,
  director: /^Diretor/,
  production: /^Produtora/,
  category: /^Categoria/,
  watchedAt: /^Data em que assistiu/,
};

const field = (name) => screen.getByLabelText(LABELS[name]);

function fill(values) {
  Object.entries(values).forEach(([name, value]) => {
    fireEvent.change(field(name), { target: { value } });
  });
}

function renderForm(props = {}) {
  const onSubmit = props.onSubmit ?? vi.fn();
  render(<SerieForm onSubmit={onSubmit} onCancel={vi.fn()} {...props} />);
  return { onSubmit };
}

const submit = () => fireEvent.click(screen.getByRole('button', { name: 'Salvar' }));

describe('SerieForm', () => {
  it('mostra erros em todos os campos obrigatórios ao enviar vazio', () => {
    const { onSubmit } = renderForm();
    submit();

    expect(onSubmit).not.toHaveBeenCalled();
    expect(screen.getByText('Informe o título.')).toBeInTheDocument();
    expect(screen.getByText('Informe o número de temporadas.')).toBeInTheDocument();
    expect(screen.getByText('Informe a categoria.')).toBeInTheDocument();
    expect(screen.getByText('Informe a data em que assistiu.')).toBeInTheDocument();
    expect(field('title')).toHaveAttribute('aria-invalid', 'true');
    // O foco vai para o primeiro campo inválido.
    expect(field('title')).toHaveFocus();
  });

  it('valida ao sair do campo', () => {
    renderForm();
    fireEvent.blur(field('director'));
    expect(screen.getByText('Informe o diretor.')).toBeInTheDocument();
  });

  it.each(['0', '-2', '1.5'])('rejeita temporadas = %s', (seasons) => {
    const { onSubmit } = renderForm();
    fill({ ...VALID, seasons });
    submit();

    expect(screen.getByText('Informe um número inteiro maior ou igual a 1.')).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('rejeita data em que assistiu anterior ao lançamento', () => {
    const { onSubmit } = renderForm();
    fill({ ...VALID, watchedAt: '2017-11-30' });
    submit();

    expect(
      screen.getByText('A data em que assistiu não pode ser anterior ao lançamento.'),
    ).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('rejeita data em que assistiu no futuro', () => {
    const { onSubmit } = renderForm();
    fill({ ...VALID, watchedAt: '2999-01-01' });
    submit();

    expect(screen.getByText('A data em que assistiu não pode ser futura.')).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('rejeita datas inexistentes (validação)', () => {
    // O input date do jsdom descarta valores inválidos, então a regra é testada direto.
    expect(validateField('releaseDate', { releaseDate: '2023-02-30' })).toBe(
      'Informe uma data válida.',
    );
    expect(validateField('watchedAt', { watchedAt: '10/03/2023' })).toBe(
      'Informe uma data válida.',
    );
  });

  it('com dados válidos, chama onSubmit com o objeto correto', async () => {
    const { onSubmit } = renderForm({ onSubmit: vi.fn().mockResolvedValue(undefined) });
    fill(VALID);
    submit();

    await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1));
    expect(onSubmit).toHaveBeenCalledWith({
      title: 'Dark',
      seasons: 3,
      releaseDate: '2017-12-01',
      director: 'Baran bo Odar',
      production: 'Netflix',
      category: 'Sci-Fi/Mystery',
      watchedAt: '2023-08-18',
    });
  });

  it('no modo edição, vem preenchido e envia o id', async () => {
    const serie = { id: 5, ...VALID, title: 'Dark', seasons: 3 };
    const { onSubmit } = renderForm({
      initialData: serie,
      onSubmit: vi.fn().mockResolvedValue(undefined),
    });

    expect(field('title')).toHaveValue('Dark');
    expect(field('seasons')).toHaveValue(3);
    expect(field('releaseDate')).toHaveValue('2017-12-01');
    expect(field('watchedAt')).toHaveValue('2023-08-18');

    fill({ seasons: '4' });
    submit();

    await waitFor(() => expect(onSubmit).toHaveBeenCalled());
    expect(onSubmit.mock.calls[0][0]).toMatchObject({ id: 5, seasons: 4, title: 'Dark' });
  });

  it('mostra o erro da API no topo e mantém o que foi digitado', async () => {
    renderForm({ onSubmit: vi.fn().mockRejectedValue(new Error('Erro no servidor da API.')) });
    fill(VALID);
    submit();

    expect(await screen.findByRole('alert')).toHaveTextContent('Erro no servidor da API.');
    expect(field('title')).toHaveValue(VALID.title);
    expect(screen.getByRole('button', { name: 'Salvar' })).toBeEnabled();
  });

  it('desabilita o envio durante a requisição (sem envio duplo)', async () => {
    let resolveRequest;
    const onSubmit = vi.fn(() => new Promise((resolve) => { resolveRequest = resolve; }));
    renderForm({ onSubmit });
    fill(VALID);

    const button = screen.getByRole('button', { name: 'Salvar' });
    // Dois cliques seguidos: só o primeiro pode gerar envio.
    fireEvent.click(button);
    fireEvent.click(button);

    expect(onSubmit).toHaveBeenCalledTimes(1);
    await waitFor(() => expect(button).toBeDisabled());

    resolveRequest();
    await waitFor(() => expect(button).toBeEnabled());
  });
});
