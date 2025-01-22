import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    setupFiles: ['opfs-mock'],
    coverage: {
      provider: 'istanbul'
    }
  }
});
