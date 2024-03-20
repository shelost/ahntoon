// vite.config.js
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [sveltekit()],
  css: {
    preprocessorOptions: {
      scss: {
        // This example assumes you have a `src/styles` directory with `_variables.scss`
        additionalData: `@import "./src/styles/variables.scss";`
      }
    }
  }
});
