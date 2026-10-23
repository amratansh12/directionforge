# Stage 1 · References and gallery

## Collect

- **User-provided**: copy files into `design/references/`; for URLs, capture a screenshot of each.
- **Claude gathers**: search the sites named in the brief for the use case (the surface type and
  intent, not the product's competitors' content). Aim for 30–50 references, spread across clearly
  different visual languages, so grouping has something to work with. Prefer shots that show a full
  screen or page.
- Capture with the browser tools available in the session (screenshot of the shot's image, or
  download the image itself). Name files `<site>-<nn>-<slug>.<ext>`.
- Log every file in `design/references/SOURCES.md` (file, site, URL, date).
- If a site blocks capture or needs login, say which and continue with the rest; do not work around
  logins.

## Group

Group by **design style, visual vocabulary and UI language**: how it looks and feels, never what it
does. Good group names: "Print-tech paper", "Minimal & airy", "Data-dense terminal", "Editorial
serif". Bad: "Has filters", "Pricing tables", "Dark mode toggle".

- 5–10 groups, each with 3+ references where possible. A reference belongs to one group.
- For each group write `feel` (one or two sentences on the feel and intent it carries) and
  `vocabulary` (3–6 style words: type, ground, density, texture, motion). No feature tags.

## Build the gallery

Write `design/references/gallery-data.js`:

```js
window.DS_GALLERY = {
  title: 'References · <project>',
  intro: 'One line on what to look for.',
  pick: 5, // from brief counts
  groups: [
    { id: 'print-tech', name: 'Print-tech paper', feel: '…', vocabulary: ['halftone', 'mono labels', 'paper ground'],
      images: [{ file: 'dribbble-01-foo.png', source: 'https://…', note: 'Short note on the feel' }] },
  ],
};
```

`gallery.html` (already copied by scaffold) renders it: groups, click to enlarge, a "Pick this
style" box per group and **Copy my picks**, which copies `Picks: <name>, <name>, …`.

## Stop

Start the server in the background if not running (`serve.py . --port 8000`) and give the user the
gallery URL (`http://localhost:<port>/references/gallery.html`). Ask them to pick N styles (default
5) and paste the copied picks back, or name them.

Update `decisions.md`: log the picks in the user's words; `stage: 2`, `waiting on: direction approval`.
