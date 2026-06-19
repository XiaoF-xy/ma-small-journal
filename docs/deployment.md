# Deployment

This project is a Vite static frontend in the first stage.

## Build

```bash
npm install
npm run build
```

The production files are generated in `dist/`.

## GitHub Pages

GitHub Pages can host the static `dist/` output. If the site is deployed under a repository subpath, configure Vite's `base` option before deploying.

For `https://xiaof-xy.github.io/ma-small-journal/`, use:

```ts
// vite.config.ts
export default defineConfig({
  base: "/ma-small-journal/",
  plugins: [react()],
});
```

For a custom domain at the root, keep the default `/` base.

## Netlify

Netlify settings:

- Build command: `npm run build`
- Publish directory: `dist`

No serverless function is required for the current single-device version.

## Future Backend

Multiplayer rooms and AI review should be implemented behind a backend API. Do not put AI provider keys in the Vite frontend.

