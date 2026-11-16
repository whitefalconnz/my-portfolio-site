import Portfolio from "./components/Portfolio";
import { STACKS } from "./data/work";
import { vimeoPosters } from "./lib/vimeo";

// Built once and served as a plain file. Rebuilt in the background about once
// a day, which is only to pick up a changed Vimeo thumbnail.
export const revalidate = 86400;

// Structured data for the work on this page. Projects unfold in place rather
// than at their own pages, so this is how their titles, descriptions and
// images reach search engines. Built from the same data the wall renders.
const PROJECTS_JSON_LD = JSON.stringify({
  "@context": "https://schema.org",
  "@type": "CollectionPage",
  "@id": "https://jakobbackhouse.com/#work",
  url: "https://jakobbackhouse.com/",
  name: "Work | Jakob Backhouse",
  about: { "@id": "https://jakobbackhouse.com/#person" },
  isPartOf: { "@id": "https://jakobbackhouse.com/#website" },
  mainEntity: {
    "@type": "ItemList",
    numberOfItems: STACKS.length,
    itemListElement: STACKS.map((project, index) => ({
      "@type": "ListItem",
      position: index + 1,
      item: {
        "@type": "CreativeWork",
        name: project.title,
        description: project.text,
        url: `https://jakobbackhouse.com/#${project.slug}`,
        image: new URL(project.cover.src, "https://jakobbackhouse.com/").href,
        genre: project.categories,
        creator: { "@id": "https://jakobbackhouse.com/#person" },
      },
    })),
  },
});

export default async function Home() {
  const posters = await vimeoPosters();

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: PROJECTS_JSON_LD }}
      />
      <Portfolio posters={posters} />
    </>
  );
}
