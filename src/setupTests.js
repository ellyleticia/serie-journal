// Habilita os matchers do jest-dom (toBeInTheDocument, toHaveClass, etc.)
// e limpa o DOM renderizado após cada teste.
import '@testing-library/jest-dom';
import { afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';

afterEach(() => {
  cleanup();
});
