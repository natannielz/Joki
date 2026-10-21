# Waste Report Insights

A Python notebook that runs in the browser through Pyodide (CPython compiled to WebAssembly).

The Python lives in the `<script type="text/x-python">` cells of `index.html`. Each cell is editable and runs in a
shared namespace, like Jupyter. Python sends chart data back with `show_bars`, `show_line` and `show_table`
(defined in `app.js`), and `charts.js` draws them as accessible SVG with hover tooltips.

The analysis uses only the standard library (`random`, `statistics`, `collections`, `datetime`) on a simulated,
seeded dataset of 1,800 reports across Tangerang Selatan's seven districts. Populations are rounded and used only
to weight the simulation.

Open `index.html` in a browser; Python (about 8 MB) downloads on the first visit and is cached afterwards.
