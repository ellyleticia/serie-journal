import { defineConfig } from '@playwright/test';

// Teste E2E: precisa da serieJournal-api rodando (ver README).
// O frontend é iniciado automaticamente (ou reaproveitado, se já estiver no ar).
export default defineConfig({
  testDir: './e2e',
  timeout: 30_000,
  fullyParallel: false,
  workers: 1,
  reporter: [['list'], ['html', { open: 'never' }]],
  use: {
    baseURL: 'http://localhost:5173',
    // Usa o Google Chrome instalado no sistema (não precisa baixar navegador).
    // Sem o Chrome, rode "npx playwright install chromium" e remova esta linha.
    channel: 'chrome',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  webServer: {
    command: 'npm run dev -- --port 5173 --strictPort',
    url: 'http://localhost:5173',
    reuseExistingServer: true,
    timeout: 60_000,
  },
});
