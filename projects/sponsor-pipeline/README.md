# Sponsor Pipeline

A fundraising tracker for student organisations, written in strict TypeScript without a framework.

- Progress toward the target, split into funds received and amounts committed but not yet paid.
- Pipeline stages from prospect to funds received; click a stage to filter.
- Sortable, searchable sponsor table with inline stage changes and overdue follow-up flags.
- Add / edit / delete in a native `<dialog>`, CSV export, data saved in `localStorage`.

```
src/types.ts   domain types (Stage, Tier, Sponsor, ViewState)
src/store.ts   state store with subscribe, persistence and derived totals
src/format.ts  rupiah formatting, dates, CSV, HTML escaping
src/data.ts    campaign and fictional seed sponsors
src/main.ts    rendering and event wiring
```

Build: `npm install && npm run build` (type-checks with `tsc --noEmit`, then bundles with esbuild into `dist/app.js`).
