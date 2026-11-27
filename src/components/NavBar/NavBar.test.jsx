import { describe, it, expect } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import NavBar from './NavBar.jsx';

function renderAt(path) {
  render(
    <MemoryRouter initialEntries={[path]}>
      <NavBar />
    </MemoryRouter>,
  );
  return within(screen.getByRole('navigation', { name: 'Navegação principal' }));
}

describe('NavBar', () => {
  it('renderiza os 4 links com os destinos corretos', () => {
    const nav = renderAt('/');

    expect(nav.getAllByRole('link')).toHaveLength(4);
    expect(nav.getByRole('link', { name: 'Home' })).toHaveAttribute('href', '/');
    expect(nav.getByRole('link', { name: 'Sobre' })).toHaveAttribute('href', '/sobre');
    expect(nav.getByRole('link', { name: 'Cadastrar' })).toHaveAttribute('href', '/cadastrar');
    expect(nav.getByRole('link', { name: 'Lista de séries' })).toHaveAttribute('href', '/series');
  });

  it.each([
    ['/', 'Home'],
    ['/sobre', 'Sobre'],
    ['/cadastrar', 'Cadastrar'],
    ['/series', 'Lista de séries'],
  ])('em %s destaca só o link "%s"', (path, activeLabel) => {
    const nav = renderAt(path);

    nav.getAllByRole('link').forEach((link) => {
      if (link.textContent === activeLabel) {
        expect(link).toHaveAttribute('aria-current', 'page');
        expect(link).toHaveClass('active');
      } else {
        expect(link).not.toHaveAttribute('aria-current');
        expect(link).not.toHaveClass('active');
      }
    });
  });

  it('não destaca nenhum link numa rota inexistente', () => {
    const nav = renderAt('/rota-inexistente');
    nav.getAllByRole('link').forEach((link) => {
      expect(link).not.toHaveAttribute('aria-current');
    });
  });

  it('tem o ícone de claquete levando para a Home', () => {
    renderAt('/series');
    expect(screen.getByRole('link', { name: /página inicial/i })).toHaveAttribute('href', '/');
  });
});
