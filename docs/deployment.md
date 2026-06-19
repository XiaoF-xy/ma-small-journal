# Deployment

This project is a Vite static frontend in the first stage.

## Build

```bash
npm install
npm run build
```

The production files are generated in `dist/`.

## GitHub Pages

GitHub Pages hosts the static `dist/` output through `.github/workflows/deploy.yml`.

The app is configured for:

```text
https://xiaof-xy.github.io/ma-small-journal/
```

Because this deploys under a repository subpath, `vite.config.ts` sets:

```ts
export default defineConfig({
  base: "/ma-small-journal/",
  plugins: [react()],
});
```

In GitHub, open **Settings → Pages**, set **Source** to **GitHub Actions**, then push to `main`.

If you later switch to a custom domain at the root, change `base` back to `/`.

## Netlify

Netlify settings:

- Build command: `npm run build`
- Publish directory: `dist`

No serverless function is required for the current single-device version.

## Future Backend

Multiplayer rooms and AI review should be implemented behind a backend API. Do not put AI provider keys in the Vite frontend.
