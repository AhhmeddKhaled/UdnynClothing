import { defineConfig } from 'vite'
import react, { reactCompilerPreset } from '@vitejs/plugin-react'
import babel from '@rolldown/plugin-babel'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    babel({ presets: [reactCompilerPreset()] })
  ],
  server: {
    host: true,
    allowedHosts: ["udnynclothing4-rmr6rafl.b4a.run"],
  },
  preview: {
    host: true,
    allowedHosts: ["udnynclothing4-rmr6rafl.b4a.run"],
  },
})