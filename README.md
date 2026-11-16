# jakobbackhouse.com

Portfolio of Jakob Backhouse, designer and animator, Wellington NZ.

The site is a single page, black and white, in one typeface at one size. At
rest it shows a wall of work and nothing else. Everything unfolds from there
without leaving the page:

- **A cell on the wall** opens the project under its own row: one big view, a
  caption, and every piece in the project as a thumbnail.
- **A piece** opens at full screen, where images zoom (click, scroll or pinch)
  and drag.
- **Index** lists every piece on the site and searches them.
- **About** and **Contact** unfold on the same page. The old `/about` and
  `/contact` addresses redirect to them.
- **The runner** along the bottom edge shows how far through the page you are,
  and stands in wherever something is loading. Clicking him goes back to the
  start.

Every project and piece has its own link (`/#tag`, `/#tag/12`,
`/#tag/12/view`), and the browser's Back button steps out one level at a time.

## Changing the content

All of it lives in [`app/data/work.ts`](app/data/work.ts): the projects, their
sections and pieces, the two loops, the About text and the contact links. The
wall, the index, the search and the data search engines read are all built
from that file, so adding a piece there is all it takes.

Each image needs its real width and height, which reserve its shape on the
page before it loads. A Vimeo film with no `poster` gets Vimeo's own thumbnail
when the site is built.

To hide a project without deleting it, give it `hidden: true`.

## Where things are

| | |
| --- | --- |
| `app/data/work.ts` | All content |
| `app/components/Portfolio.tsx` | The page: top bar, wall, footer, and what's open |
| `app/components/Cell.tsx` | One cell of the wall and what it does when pointed at |
| `app/components/Panel.tsx` | An open project, and About |
| `app/components/Viewer.tsx` | Full screen, zoom and pan |
| `app/components/IndexSheet.tsx` | The index and its search |
| `app/components/Runner.tsx` | The runner |
| `app/lib/nav.ts` | The address after the `#`, and Back |
| `app/globals.css` | Every style on the site |

## Running it

```bash
npm install
npm run dev
```

Then open [http://localhost:3000](http://localhost:3000).

Two settings are read from the hosting environment:

- `RESEND_API_KEY` sends the contact form. Without it the form tells the
  visitor to email instead.
- `NEXT_PUBLIC_GA_ID` turns on Google Analytics.
