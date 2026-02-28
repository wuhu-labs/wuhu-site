# wuhu-site

Static website for [wuhu.ai](https://wuhu.ai).

## Stack

- **[Astro](https://astro.build/)** — static site generator
- **[Starlight](https://starlight.astro.build/)** — documentation theme for Astro
- Node 22+

## Development

```bash
npm install
npm run dev      # local dev server at localhost:4321
npm run build    # production build to dist/
npm run preview  # preview the production build locally
```

## Deployment

The site is deployed to **Cloudflare R2** as a static asset bucket. Deployment
configuration is managed separately and is not part of this repo.

## Structure

```
src/
  content/
    docs/           # Markdown/MDX pages (Starlight content collection)
      index.mdx     # Landing page
      download.mdx  # Download & install
      guides/       # Guides (getting started, architecture, etc.)
  assets/           # Images and other assets
public/             # Static files served as-is (favicon, etc.)
astro.config.mjs    # Astro + Starlight configuration
```

## Conventions

- Keep pages concise and technically accurate.
- Use Markdown (`.md`) for pure text pages, MDX (`.mdx`) when Starlight
  components are needed.
- The sidebar is defined manually in `astro.config.mjs` — update it when
  adding new pages.
