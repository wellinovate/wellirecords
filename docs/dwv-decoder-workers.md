# dwv decoder workers (public/assets/assets/workers/)

These files are copied from `node_modules/dwv/dist/assets/workers/`
(dwv version pinned in package.json). They are required for the
in-browser DICOM viewer
(`src/apps/provider/components/DicomViewerModal.tsx`) to decode
compressed transfer syntaxes: JPEG2000, JPEG lossless, JPEG baseline,
and RLE. Uncompressed DICOM (the common case for most diagnostic
equipment exports) does not need these — the viewer works without
them for that case, but silently fails to decode compressed files if
they're missing.

## Why they live at this exact nested path

dwv ships as a pre-built webpack bundle, not raw ESM source. Its
internal `new Worker(new URL(...))` calls get rewritten by webpack into
a chunk-loader pattern that Vite/Rollup cannot statically analyze, so
Vite does not automatically discover or copy these worker files the
way it would for a plain `new Worker(new URL('./x.js', import.meta.url))`
call in first-party code. (See https://github.com/ivmartel/dwv-vue —
"webpack modifies this creation when creating the dwv bundle".)

At runtime, dwv resolves each worker at
`new URL("./assets/workers/<name>.min.js", import.meta.url)`, where
`import.meta.url` is the URL of whichever built JS chunk happens to
contain dwv's code (in this project, that's the lazy-loaded
RadiologyPage chunk). This project's Vite config (`vite.config.ts`)
places every chunk directly under `dist/assets/`, so the relative path
`./assets/workers/...` resolves to `dist/assets/assets/workers/...` —
hence the doubled `assets/assets` directory in `public/`, which Vite
copies as-is into `dist/` unprocessed.

Verified against a real `npm run build` output: the worker files land
at `dist/assets/assets/workers/*.js`, matching exactly what the
RadiologyPage chunk requests at runtime.

## When to update

If `dwv` is upgraded, re-run:
```
cp node_modules/dwv/dist/assets/workers/*.js public/assets/assets/workers/
```
and verify with `npm run build` that `dist/assets/assets/workers/*.js`
exists and matches. Confirmed working with dwv 0.36.4.

## Known limitation

In local dev (`npm run dev`), Vite does not serve these workers the
same way it does in a production build — this is a documented
dwv/Vite interaction (same GitHub thread above), not specific to this
app. It only affects compressed DICOM in local dev; production
(Vercel) builds are unaffected — verified via `npm run build` above.
