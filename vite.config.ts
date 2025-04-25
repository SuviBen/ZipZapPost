import { defineConfig } from 'vite';

export default defineConfig({
  server: {
    allowedHosts: [
      'localhost',
      'gnat-engaging-wholly.ngrok-free.app'
    ]
  }
}); 