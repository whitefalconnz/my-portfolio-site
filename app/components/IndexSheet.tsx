"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { CONTACT, ENTRIES, STACKS, piecesOf } from "../data/work";

/**
 * Every piece on the site as one plain list, with a search. The wall is for
 * wandering; this is for someone who knows what they want. Typing narrows it
 * by title, project, section, category or any word in a description.
 */

type Line = {
  slug: string;
  piece: number;
  title: string;
  section: string;
  haystack: string;
};

type Block = { slug: string; title: string; lines: Line[] };

const BLOCKS: Block[] = [
  ...STACKS.map((entry) => ({
    slug: entry.slug,
    title: entry.title,
    lines: piecesOf(entry).map((piece, index) => ({
      slug: entry.slug,
      piece: index,
      title: piece.title,
      section: piece.section,
      haystack: [
        entry.title,
        entry.categories.join(" "),
        piece.section,
        piece.title,
        piece.text,
      ]
        .join(" ")
        .toLowerCase(),
    })),
  })),
  {
    slug: "",
    title: "Loops",
    lines: ENTRIES.filter((entry) => entry.kind === "loop").map((entry) => ({
      slug: entry.slug,
      piece: 0,
      title: entry.note ? `${entry.title}, ${entry.note.toLowerCase()}` : entry.title,
      section: "",
      haystack: `loops animation ${entry.title} ${entry.text}`.toLowerCase(),
    })),
  },
];

export default function IndexSheet({
  onGo,
  onClose,
}: {
  onGo: (slug: string, piece: number) => void;
  onClose: () => void;
}) {
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  // Hold the page still behind the list, and hand focus back on the way out.
  useEffect(() => {
    const before = document.activeElement as HTMLElement | null;
    const root = document.documentElement;
    const overflow = root.style.overflow;
    root.style.overflow = "hidden";
    // Straight into the search with a keyboard; on a touch screen that would
    // throw the keyboard up over the list, so wait to be asked.
    if (window.matchMedia("(hover: hover) and (pointer: fine)").matches) {
      inputRef.current?.focus({ preventScroll: true });
    }
    return () => {
      root.style.overflow = overflow;
      before?.focus?.({ preventScroll: true });
    };
  }, []);

  const words = useMemo(
    () => query.toLowerCase().split(/\s+/).filter(Boolean),
    [query]
  );
  const matches = (haystack: string) =>
    words.every((word) => haystack.includes(word));

  const blocks = BLOCKS.map((block) => ({
    ...block,
    lines: block.lines.filter((line) => matches(line.haystack)),
  })).filter((block) => block.lines.length > 0);

  const pages = [
    { label: "About", slug: "about" },
    { label: "Contact", slug: "contact" },
  ].filter((page) => matches(page.label.toLowerCase()));
  const first = blocks[0]?.lines[0];

  const link = (slug: string, piece: number) => ({
    href: piece > 0 ? `#${slug}/${piece + 1}` : `#${slug}`,
    onClick: (event: React.MouseEvent) => {
      event.preventDefault();
      onGo(slug, piece);
    },
  });

  return (
    <div className="index" role="dialog" aria-modal="true" aria-label="Index">
      <header className="index-bar">
        <input
          ref={inputRef}
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              if (first) onGo(first.slug, first.piece);
              else if (pages[0]) onGo(pages[0].slug, 0);
            }
          }}
          placeholder="Search everything"
          aria-label="Search everything"
          autoComplete="off"
          spellCheck={false}
        />
        <button type="button" className="word" onClick={onClose}>
          Close
        </button>
      </header>

      <div className="index-body">
        {blocks.map((block) => {
          let section = "";
          return (
            <section className="index-block" key={block.title}>
              <h2>
                {block.slug ? (
                  <a {...link(block.slug, 0)}>{block.title}</a>
                ) : (
                  block.title
                )}
                <span className="dim"> {block.lines.length}</span>
              </h2>
              <ul>
                {block.lines.map((line) => {
                  const heading =
                    line.section && line.section !== section
                      ? line.section
                      : null;
                  section = line.section;
                  return (
                    <li key={`${line.slug}/${line.piece}`}>
                      {heading && <span className="index-section">{heading}</span>}
                      <a className="word" {...link(line.slug, line.piece)}>
                        {line.title}
                      </a>
                    </li>
                  );
                })}
              </ul>
            </section>
          );
        })}

        {(pages.length > 0 || words.length === 0) && (
          <section className="index-block">
            <h2>Jakob Backhouse</h2>
            <ul>
              {pages.map((page) => (
                <li key={page.slug}>
                  <a className="word" {...link(page.slug, 0)}>
                    {page.label}
                  </a>
                </li>
              ))}
              {words.length === 0 && (
                <>
                  <li>
                    <a className="word" href={`mailto:${CONTACT.email}`}>
                      {CONTACT.email}
                    </a>
                  </li>
                  <li>
                    <a
                      className="word"
                      href={CONTACT.instagram}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Instagram
                    </a>
                  </li>
                  <li>
                    <a
                      className="word"
                      href={CONTACT.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      LinkedIn
                    </a>
                  </li>
                </>
              )}
            </ul>
          </section>
        )}

        {blocks.length === 0 && pages.length === 0 && (
          <p className="dim">Nothing by that name.</p>
        )}
      </div>
    </div>
  );
}
