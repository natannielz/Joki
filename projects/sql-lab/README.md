# Campus Events SQL Lab

A SQL workbench running SQLite in the browser (sql.js, SQLite compiled to WebAssembly).

- `seed.js` holds the schema (six tables with primary keys, foreign keys, CHECK and UNIQUE constraints and indexes),
  a deterministic data generator, and the saved queries.
- `app.js` boots SQLite, renders the schema browser, runs queries from the CodeMirror editor and exports results as CSV.

Saved queries cover joins, conditional aggregation, CTEs, pivots with `SUM(CASE …)`, window functions
(`RANK`, `SUM … OVER ()`), `NOT EXISTS` subqueries and an `INSERT` that demonstrates the UNIQUE constraint.

All data is fictional. Open `index.html` in a browser; no build step.
