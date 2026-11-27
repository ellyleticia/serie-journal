// Gera os prints do README em docs/screenshots/.
// Pré-requisitos: a API rodando e o frontend no ar (npm run dev).
// Uso: npm run screenshots
import { mkdir } from 'node:fs/promises';
import { chromium } from '@playwright/test';

const BASE_URL = process.env.BASE_URL || 'http://localhost:5173';
const OUT_DIR = 'docs/screenshots';

const browser = await chromium.launch({ channel: 'chrome' });
const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });

// Espera as transições do MUI terminarem antes de cada print.
async function settle() {
  await page.waitForFunction(() =>
    document.getAnimations().every((animation) => animation.playState !== 'running'),
  );
}

// fullPage: aumenta a janela até caber a página inteira (o modo fullPage do
// Playwright desenha errado a NavBar sticky e o fundo fixo).
async function shot(name, { fullPage = false } = {}) {
  const viewport = page.viewportSize();
  if (fullPage) {
    await page.evaluate(() => window.scrollTo(0, 0));
    const height = await page.evaluate(() => document.documentElement.scrollHeight);
    await page.setViewportSize({ width: viewport.width, height: Math.max(height, viewport.height) });
  }
  await settle();
  const path = `${OUT_DIR}/${name}.jpg`;
  await page.screenshot({ path, type: 'jpeg', quality: 82 });
  if (fullPage) await page.setViewportSize(viewport);
  console.log(`✔ ${path}`);
}

await mkdir(OUT_DIR, { recursive: true });

await page.goto(`${BASE_URL}/`);
await page.getByRole('heading', { name: 'Página Inicial' }).waitFor();
await page.evaluate(() => document.fonts.ready);
await shot('01-home');

await page.goto(`${BASE_URL}/sobre`);
await page.getByRole('heading', { name: 'Sobre o Projeto' }).waitFor();
await shot('02-sobre');

await page.goto(`${BASE_URL}/cadastrar`);
await page.getByRole('heading', { name: 'Cadastrar série' }).waitFor();
await shot('03-cadastrar-vazio', { fullPage: true });

await page.getByLabel(/^Título/).fill('Nova série');
await page.getByLabel(/^Número de Temporadas/).fill('0');
await page.getByLabel(/^Data de Lançamento da Temporada/).fill('2024-05-10');
await page.getByLabel(/^Data em que assistiu/).fill('2024-01-01');
await page.getByRole('button', { name: 'Salvar' }).click();
await page.getByText('Informe o diretor.').waitFor();
await page.evaluate(() => document.activeElement?.blur());
await shot('04-cadastrar-erros', { fullPage: true });

await page.goto(`${BASE_URL}/series`);
await page.getByRole('article').first().waitFor();
await shot('05-lista');

await page.getByRole('searchbox', { name: 'Buscar série' }).fill('drama');
await shot('06-busca');

await page.getByRole('searchbox', { name: 'Buscar série' }).fill('');
await page.getByRole('button', { name: 'Excluir Stranger Things' }).click();
await page.getByRole('dialog').waitFor();
await shot('07-exclusao-dialogo');
await page.getByRole('button', { name: 'Cancelar' }).click();

await page.goto(`${BASE_URL}/editar/2`);
await page.getByRole('heading', { name: 'Editar série' }).waitFor();
await page.getByLabel(/^Título/).waitFor();
await shot('08-editar', { fullPage: true });

await page.goto(`${BASE_URL}/rota-inexistente`);
await page.getByRole('heading', { name: '404' }).waitFor();
await shot('09-pagina-404');

// Celular (375px)
await page.setViewportSize({ width: 375, height: 740 });
await page.goto(`${BASE_URL}/series`);
await page.getByRole('article').first().waitFor();
await shot('10-celular-lista');

await page.getByRole('button', { name: 'Abrir menu de navegação' }).click();
await page.getByRole('link', { name: 'Lista de séries' }).waitFor();
await shot('11-celular-menu');

await browser.close();
