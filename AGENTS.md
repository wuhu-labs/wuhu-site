# wuhu-site

Static website for [wuhu.ai](https://wuhu.ai).

## Stack

- **[Astro](https://astro.build/)** — static site generator
- **[Starlight](https://starlight.astro.build/)** — documentation theme for Astro
- **[Cloudflare R2](https://developers.cloudflare.com/r2/)** — static file hosting
- **[Cloudflare Workers](https://developers.cloudflare.com/workers/)** — index.html routing
- Node 22+

## Development

```bash
npm install
npm run dev      # local dev server at localhost:4321
npm run build    # production build to dist/
npm run preview  # preview the production build locally
```

## Deployment

The site is hosted on **Cloudflare R2** with a **Cloudflare Worker** for
index.html routing (R2 doesn't natively serve index documents for bare paths).

- **R2 bucket**: `wuhu-site`
- **Worker**: `wuhu-site-router` (source in `worker/`)
- **Domain**: `wuhu.ai` (custom domain bound to the R2 bucket)

Use `wrangler whoami` to verify auth and find the account ID.

CI automatically builds and deploys to R2 on push to `main`, and also
redeploys the Worker from `worker/`. The deploy script at
`scripts/deploy.sh` uploads the `dist/` output to the R2 bucket; the
Worker is deployed with `wrangler deploy`. After deploy, CI runs
`scripts/smoke-worker.sh` against production to verify routing.

To deploy the Worker manually (e.g. from this machine):

```bash
cd worker && wrangler deploy
```

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
worker/             # Cloudflare Worker for index.html routing
scripts/            # Deployment scripts
astro.config.mjs    # Astro + Starlight configuration
```

## Conventions

- Keep pages concise and technically accurate.
- Use Markdown (`.md`) for pure text pages, MDX (`.mdx`) when Starlight
  components are needed.
- The sidebar is defined manually in `astro.config.mjs` — update it when
  adding new pages.
