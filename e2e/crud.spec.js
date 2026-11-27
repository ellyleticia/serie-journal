import { test, expect } from '@playwright/test';
import { loadEnv } from 'vite';

// Mesma URL da API usada pelo frontend (.env → VITE_API_URL).
const API_URL = loadEnv('development', process.cwd(), 'VITE_').VITE_API_URL || 'http://localhost:5000';

const title = `Série E2E ${Date.now()}`;
const editedTitle = `${title} (editada)`;

async function apiIsUp(request) {
  try {
    const response = await request.get(`${API_URL}/series`, { timeout: 3000 });
    return response.ok();
  } catch {
    return false;
  }
}

test.describe('CRUD completo de séries (com a API rodando)', () => {
  test.beforeAll(async ({ request }) => {
    test.skip(!(await apiIsUp(request)), `API não está rodando em ${API_URL}`);
  });

  // Se o teste falhar no meio, remove a série criada para não sujar os dados.
  test.afterAll(async ({ request }) => {
    if (!(await apiIsUp(request))) return;
    const series = await (await request.get(`${API_URL}/series`)).json();
    for (const serie of series.filter((s) => s.title.startsWith(title))) {
      await request.delete(`${API_URL}/series/${serie.id}`);
    }
  });

  test('cadastrar → ver na lista → editar → excluir', async ({ page }) => {
    // Cadastrar
    await page.goto('/');
    await page.getByRole('navigation', { name: 'Navegação principal' })
      .getByRole('link', { name: 'Cadastrar' }).click();
    await expect(page.getByRole('heading', { name: 'Cadastrar série' })).toBeVisible();

    await page.getByLabel(/^Título/).fill(title);
    await page.getByLabel(/^Número de Temporadas/).fill('2');
    await page.getByLabel(/^Data de Lançamento da Temporada/).fill('2022-06-10');
    await page.getByLabel(/^Diretor/).fill('Diretora E2E');
    await page.getByLabel(/^Produtora/).fill('Produtora E2E');
    await page.getByLabel(/^Categoria/).fill('Drama');
    await page.getByLabel(/^Data em que assistiu/).fill('2023-02-15');
    await page.getByRole('button', { name: 'Salvar' }).click();

    // Ver na lista
    await expect(page).toHaveURL(/\/series$/);
    await expect(page.getByText('Série cadastrada!')).toBeVisible();
    await page.getByRole('searchbox', { name: 'Buscar série' }).fill(title);
    const card = page.getByRole('article').filter({ hasText: title });
    await expect(card).toHaveCount(1);
    await expect(card).toContainText('10/06/2022');
    await expect(card).toContainText('15/02/2023');

    // Editar
    await card.getByRole('link', { name: `Editar ${title}` }).click();
    await expect(page.getByRole('heading', { name: 'Editar série' })).toBeVisible();
    await expect(page.getByLabel(/^Título/)).toHaveValue(title);
    await page.getByLabel(/^Título/).fill(editedTitle);
    await page.getByLabel(/^Número de Temporadas/).fill('3');
    await page.getByRole('button', { name: 'Salvar' }).click();

    await expect(page).toHaveURL(/\/series$/);
    await expect(page.getByText('Série atualizada!')).toBeVisible();
    await page.getByRole('searchbox', { name: 'Buscar série' }).fill(editedTitle);
    const editedCard = page.getByRole('article').filter({ hasText: editedTitle });
    await expect(editedCard).toContainText('Número de temporadas: 3');

    // Excluir
    await editedCard.getByRole('button', { name: `Excluir ${editedTitle}` }).click();
    const dialog = page.getByRole('dialog');
    await expect(dialog).toContainText(editedTitle);
    await dialog.getByRole('button', { name: 'Excluir' }).click();

    await expect(page.getByText(`Série "${editedTitle}" excluída.`)).toBeVisible();
    await expect(page.getByRole('article').filter({ hasText: editedTitle })).toHaveCount(0);
    await expect(page.getByText('Nenhuma série encontrada')).toBeVisible();
  });
});
