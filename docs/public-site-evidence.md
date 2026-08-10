# Public site evidence

The static site is assembled by `npm run build` from `site/`, compiled Native UI assets, recipes, and benchmark evidence. The current generated artifact has 58 files and is served from `public/` with no server runtime.

Routes: `/`, `/lab/`, `/examples/`, `/recipes/`, `/guides/`, `/benchmarks/`, `/changelog.html`, and `/roadmap.html`.

Verification completed locally:

- `npm test`: pass (43 tests).
- `node --test tests/docs.test.mjs tests/site-build.test.mjs`: pass.
- `npm run test:browser-contract`: pass.
- `vercel.json` requires `npm run build`, `public`, and no framework.
- Manifest coverage uses the existing 5 layouts, 10 compositions, and 3 variants; no new public library symbol was promoted.
- Site JavaScript is optional code-copy feedback only.

The Playwright Chromium, Firefox, and WebKit suite was attempted twice. This macOS execution environment terminated all browser processes before test startup (`MachPortRendezvousServer` permission denial for Chromium and aborts for WebKit), so browser/axe results remain pending CI or another host. No site assertion executed in that run.
