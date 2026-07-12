# Pagefind for search, run as a post-build step

Search indexing runs after `ng build` via `npx pagefind --site dist/mat-expressive-docs/browser`. Pagefind crawls the prerendered HTML output, generates a binary search index and a WASM query engine (~50KB total), and writes them into the dist folder. The Search Modal calls `pagefind.debouncedSearch()` from the Pagefind JS API — no custom indexing code, no index bundled into the Angular app.

The alternative was a client-side index (MiniSearch or Fuse.js) where the Build Script generates a JSON index from page metadata and prose, bundles it with the app, and searches it in-memory. This would require maintaining a separate indexing step in the Build Script and shipping the full index on every page load. Pagefind's post-build approach indexes exactly what gets shipped (the rendered HTML) with zero custom code and zero bundle cost.

Algolia DocSearch was not chosen for v1: it requires applying to their open-source program, ongoing API key management, and an external crawler that indexes the live deployed site — adding an external dependency before the site exists.

## Consequences

The full build command becomes a three-step sequence: `node scripts/build-docs.ts && ng build --prerender && npx pagefind --site dist/mat-expressive-docs/browser`. The dist folder must exist before Pagefind runs. Whatever deploys the site (currently the `deploy.yaml` GitHub Pages workflow, via `npm run build:docs`) must chain all three steps.
