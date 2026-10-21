# Sprint Board

A Scrum sprint board built with React 18.

- Drag stories between columns, or use the arrow buttons on each card (keyboard friendly).
- Create, edit and delete stories with points, label and assignee.
- The burndown chart (plain SVG) recalculates from the sprint day each story reached Done.
- State is managed with `useReducer` and saved to `localStorage`.

```
src/main.jsx         entry point
src/App.jsx          board, columns, cards, toolbar
src/Burndown.jsx     burndown chart with hover and keyboard readout
src/StoryDialog.jsx  create / edit form in a native <dialog>
src/store.js         reducer, persistence, burndown maths
src/data.js          sprint, team and seed stories
```

Build: `npm install && npm run build` (esbuild bundles everything into `dist/app.js`).
