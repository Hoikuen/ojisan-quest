import { defineConfig } from 'vite';

// GitHub Pages（https://hoikuen.github.io/ojisan-quest/）公開を想定。
// 本番ビルドのみ /ojisan-quest/、ローカルdev/preview は / のまま。
// アセットはコード側で先頭スラッシュ無しの相対パス（assets/...）で参照すれば
// ローカルでも base 付きでも壊れない（ojisan-x と同方式）。
export default defineConfig(({ command }) => ({
  base: command === 'build' ? '/ojisan-quest/' : '/',
  // ローカルは 5173。プレビューツール等が PORT を指定したらそれに従う。
  server: { port: Number(process.env.PORT) || 5173, host: true },
  build: {
    assetsInlineLimit: 0,
    chunkSizeWarningLimit: 1500,
  },
}));
