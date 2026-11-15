# Le Tanger: website

Static multi-page site in French. There's no CMS: edit the source files and rebuild.

## Edit
- Text, rooms, the drinks menu and the FAQ: `src/data.mjs`
- Page layouts and sections: `src/build.mjs`
- Styles: `src/assets/css/styles.css`
- Behaviour (booking links, sunset time, menu, gallery, WhatsApp form): `src/assets/js/main.js`

Rebuild after any edit (from this folder):

```
node src/build.mjs
```

## Preview
```
node tools/serve.mjs 4610
```
Then open http://localhost:4610

## Deploy
Upload everything **except** `src/`, `tools/`, `BRIEF.md` and `README.md` to the web root of letanger.com:
the `.html` files, the `residences/` folder and the `assets/` folder.

## Notes
- Every "Réserver" button uses the same direct-book link. The script rewrites the dates to today and tomorrow (Tangier time) on every page load, so the link never goes stale.
- The contact form sends nothing to a server: it opens WhatsApp (+212 656 103 761) with the message pre-filled.
- Photos: `assets/img/*-1200.webp` and `*-2400.webp`, warm-graded from the Fata Morgana shoot. The fire photos with guests are AI-edited (Higgsfield).
