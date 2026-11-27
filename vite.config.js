import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    rolldownOptions: {
      output: {
        // Separa as bibliotecas em arquivos próprios: ficam em cache no navegador
        // entre deploys e nenhum arquivo passa do limite de 500 kB.
        codeSplitting: {
          groups: [
            { name: 'react-vendor', test: /node_modules[\\/](react|react-dom|react-router|react-router-dom|scheduler)[\\/]/, priority: 20 },
            { name: 'mui-vendor', test: /node_modules[\\/](@mui|@emotion|@babel[\\/]runtime|react-transition-group|@popperjs|stylis)[\\/]/, priority: 10 },
          ],
        },
      },
    },
  },
  server: {
    // Relatórios gerados pelos testes não devem recarregar a página do dev server.
    watch: {
      ignored: ['**/coverage/**', '**/playwright-report/**', '**/test-results/**'],
    },
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './src/setupTests.js',
    include: ['src/**/*.test.{js,jsx}'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      include: ['src/**/*.{js,jsx}'],
      exclude: ['src/main.jsx', 'src/setupTests.js', 'src/**/*.test.{js,jsx}'],
    },
  },
})
