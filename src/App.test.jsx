import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import App from './App.jsx';
import theme from './theme.js';

// Só rotas sem chamadas à API: Home, Sobre e 404.
function renderAt(path) {
  render(
    <ThemeProvider theme={theme}>
      <MemoryRouter initialEntries={[path]}>
        <App />
      </MemoryRouter>
    </ThemeProvider>,
  );
}

describe('App (rotas + Layout)', () => {
  it('renderiza a Home com NavBar, título cursivo e título da aba', async () => {
    renderAt('/');

    // As páginas são carregadas sob demanda (React.lazy), por isso o findBy.
    expect(await screen.findByRole('heading', { level: 1, name: 'Página Inicial' })).toBeInTheDocument();
    expect(document.title).toBe('Página Inicial | Serie Journal');
    expect(screen.getByText('Bem-vindo ao projeto CRUD de séries!')).toBeInTheDocument();
    expect(screen.getByRole('navigation', { name: 'Navegação principal' })).toBeInTheDocument();
  });

  it('navega para Sobre pela NavBar', async () => {
    const user = userEvent.setup();
    renderAt('/');

    await screen.findByRole('heading', { name: 'Página Inicial' });
    await user.click(screen.getByRole('link', { name: 'Sobre' }));

    expect(await screen.findByRole('heading', { name: 'Sobre o Projeto' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Sobre' })).toHaveAttribute('aria-current', 'page');
  });

  it('mostra a página 404 para rotas inexistentes', async () => {
    renderAt('/nao-existe');

    expect(await screen.findByRole('heading', { name: '404' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Voltar para a página inicial' })).toHaveAttribute('href', '/');
  });
});
