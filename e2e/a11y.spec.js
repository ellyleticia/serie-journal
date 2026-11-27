import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { loadEnv } from 'vite';

// Auditoria automática de acessibilidade (axe-core, WCAG 2.1 A/AA) e de responsividade
// (sem rolagem horizontal) em 375px (celular), 768px (tablet) e 1280px (desktop).
const API_URL = loadEnv('development', process.cwd(), 'VITE_').VITE_API_URL || 'http://localhost:5000';
const VIEWPORTS = [
  { name: 'celular', width: 375, height: 740 },
  { name: 'tablet', width: 768, height: 1000 },
  { name: 'desktop', width: 1280, height: 900 },
];

async function expectAccessible(page) {
  // Espera as transições do MUI (ex.: fade do diálogo) terminarem: no meio da
  // animação o elemento ainda está semitransparente e o contraste medido seria falso.
  await page.waitForFunction(() =>
    document.getAnimations().every((animation) => animation.playState !== 'running'),
  );
  const { violations } = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
    .analyze();
  const summary = violations.map(
    (v) => `${v.id} (${v.impact}): ${v.help} → ${v.nodes.map((n) => n.target.join(' ')).join(', ')}`,
  );
  expect(summary, summary.join('\n')).toEqual([]);
}

async function expectNoHorizontalScroll(page) {
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - window.innerWidth,
  );
  expect(overflow, 'a página não deve ter rolagem horizontal').toBeLessThanOrEqual(0);
}

async function apiIsUp(request) {
  try {
    return (await request.get(`${API_URL}/series`, { timeout: 3000 })).ok();
  } catch {
    return false;
  }
}

for (const viewport of VIEWPORTS) {
  test.describe(`${viewport.name} (${viewport.width}px)`, () => {
    test.use({ viewport: { width: viewport.width, height: viewport.height } });

    for (const [path, heading] of [
      ['/', 'Página Inicial'],
      ['/sobre', 'Sobre o Projeto'],
      ['/cadastrar', 'Cadastrar série'],
      ['/rota-inexistente', '404'],
    ]) {
      test(`${path} é acessível e cabe na tela`, async ({ page }) => {
        await page.goto(path);
        await expect(page.getByRole('heading', { level: 1, name: heading })).toBeVisible();
        await expectAccessible(page);
        await expectNoHorizontalScroll(page);
      });
    }

    test('formulário com erros de validação é acessível', async ({ page }) => {
      await page.goto('/cadastrar');
      await page.getByRole('button', { name: 'Salvar' }).click();
      await expect(page.getByText('Informe o título.')).toBeVisible();
      await expectAccessible(page);
      await expectNoHorizontalScroll(page);
    });

    test('lista, busca e diálogo de exclusão (com a API) são acessíveis', async ({ page, request }) => {
      test.skip(!(await apiIsUp(request)), `API não está rodando em ${API_URL}`);

      await page.goto('/series');
      await expect(page.getByRole('article').first()).toBeVisible();
      await expectAccessible(page);
      await expectNoHorizontalScroll(page);

      await page.getByRole('searchbox', { name: 'Buscar série' }).fill('xyz-sem-resultado');
      await expect(page.getByText('Nenhuma série encontrada')).toBeVisible();
      await expectAccessible(page);

      await page.getByRole('button', { name: 'Limpar busca' }).click();
      await page.getByRole('article').first().getByRole('button', { name: /^Excluir / }).click();
      await expect(page.getByRole('dialog')).toBeVisible();
      await expectAccessible(page);
      await page.getByRole('button', { name: 'Cancelar' }).click();
    });
  });
}

test('menu do celular (Drawer) é acessível e navega com o teclado', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 740 });
  await page.goto('/');
  await page.getByRole('button', { name: 'Abrir menu de navegação' }).click();
  await expect(page.getByRole('link', { name: 'Lista de séries' })).toBeVisible();
  await expectAccessible(page);

  await page.keyboard.press('Escape');
  await expect(page.getByRole('link', { name: 'Lista de séries' })).toBeHidden();
});

test('foco visível ao navegar com Tab pela NavBar', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'Página Inicial' })).toBeVisible();

  // Tab: claquete → Home → Sobre
  await page.keyboard.press('Tab');
  await page.keyboard.press('Tab');
  await page.keyboard.press('Tab');
  const focused = page.locator(':focus');
  await expect(focused).toHaveText('Sobre');
  const outline = await focused.evaluate((el) => getComputedStyle(el).outlineStyle);
  expect(outline).not.toBe('none');
});
