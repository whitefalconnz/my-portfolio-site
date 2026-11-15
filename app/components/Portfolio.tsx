"use client";

import {
  Fragment,
  useCallback,
  useEffect,
  useRef,
  useState,
  type MouseEvent,
} from "react";
import dynamic from "next/dynamic";
import {
  CATEGORIES,
  CONTACT,
  ENTRIES,
  STACKS,
  bySlug,
  piecesOf,
  type Still,
} from "../data/work";
import { HOME, parseRoute, useRoute, type Route } from "../lib/nav";
import { trackProjectView } from "../lib/analytics";
import Cell from "./Cell";
import Runner from "./Runner";

// Everything below the surface is fetched only when it's first needed, or in
// the background once the page is idle, so the first view downloads just the
// wall. Opening something for the first time is still instant in practice.
const loaders = {
  panel: () => import("./Panel"),
  viewer: () => import("./Viewer"),
  index: () => import("./IndexSheet"),
  contact: () => import("./Contact"),
};
const Panel = dynamic(loaders.panel, { ssr: false });
const AboutPanel = dynamic(
  () => loaders.panel().then((module) => module.AboutPanel),
  { ssr: false }
);
const Viewer = dynamic(loaders.viewer, { ssr: false });
const IndexSheet = dynamic(loaders.index, { ssr: false });
const Contact = dynamic(loaders.contact, { ssr: false });

const LOOPS = ENTRIES.filter((entry) => entry.kind === "loop");

const plainClick = (event: MouseEvent) =>
  !(event.metaKey || event.ctrlKey || event.shiftKey || event.altKey);

function Filter({
  open,
  chosen,
  onToggle,
  onChoose,
}: {
  open: boolean;
  chosen: string[];
  onToggle: () => void;
  onChoose: (category: string) => void;
}) {
  return (
    <div className="filter" data-open={open || undefined}>
      <button
        type="button"
        className="word"
        aria-expanded={open}
        onClick={onToggle}
      >
        Filter
      </button>
      {open &&
        CATEGORIES.map((category) => (
          <button
            key={category}
            type="button"
            className="word"
            aria-pressed={chosen.includes(category)}
            onClick={() => onChoose(category)}
          >
            {category}
          </button>
        ))}
    </div>
  );
}

export default function Portfolio({
  posters,
}: {
  // Vimeo's thumbnails for the films that have no poster of their own.
  posters: Record<string, Still>;
}) {
  const { route, ready, go, back, indexOpen, openIndex, closeIndex } =
    useRoute();
  const routeRef = useRef(route);
  routeRef.current = route;

  const [filterOpen, setFilterOpen] = useState(false);
  const [chosen, setChosen] = useState<string[]>([]);
  // Bumped to bring the open project back into sight when the index sends the
  // visitor to another piece of it.
  const [nudge, setNudge] = useState(0);

  const entry = route.open ? bySlug(route.open) : undefined;
  const pieces = entry ? piecesOf(entry) : [];
  const viewing = Boolean(entry && route.view);
  const covered = viewing || indexOpen;

  // While something covers the page, the page behind it can't be clicked,
  // focused or read out. Set by hand: this version of React doesn't know the
  // attribute.
  const pageRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    pageRef.current?.toggleAttribute("inert", covered);
  }, [covered]);

  // Fetch the deeper layers once the browser has nothing better to do.
  useEffect(() => {
    const preload = () => {
      Object.values(loaders).forEach((load) => load().catch(() => {}));
    };
    if ("requestIdleCallback" in window) {
      const id = window.requestIdleCallback(preload, { timeout: 4000 });
      return () => window.cancelIdleCallback(id);
    }
    const timer = setTimeout(preload, 2000);
    return () => clearTimeout(timer);
  }, []);

  /** Open a project, a loop, about or contact; or close it if it's open. */
  const open = useCallback(
    (slug: string, piece = 0) => {
      const now = routeRef.current;
      const target = bySlug(slug);
      if (!target && slug !== "contact") return;

      if (target?.kind === "loop") {
        go({ open: slug, piece: 0, view: true });
        return;
      }
      if (now.open === slug && !now.view && now.piece === piece) {
        back(HOME);
        return;
      }
      // Moving from one open thing to another replaces it, so Back always
      // returns to the wall in one step.
      go(
        { open: slug, piece, view: false },
        now.open && !now.view ? "replace" : "push"
      );
    },
    [go, back]
  );

  const close = useCallback(() => back(HOME), [back]);

  const closeView = useCallback(() => {
    const now = routeRef.current;
    if (bySlug(now.open ?? "")?.kind === "loop") {
      // A loop goes back to wherever it was opened from.
      back(parseRoute(window.history.state?.from ?? ""));
    } else {
      back({ ...now, view: false });
    }
  }, [back]);

  /** Move to the next or previous piece, carrying on into the next project. */
  const step = useCallback(
    (direction: number) => {
      const now = routeRef.current;
      const current = now.open ? bySlug(now.open) : undefined;
      if (!current) return;
      const count = piecesOf(current).length;
      const piece = now.piece + direction;
      if (piece >= 0 && piece < count) {
        go({ ...now, piece }, "replace");
        return;
      }
      const group =
        current.kind === "stack" ? STACKS : current.kind === "loop" ? LOOPS : [];
      if (group.length < 2) return;
      const other =
        group[(group.indexOf(current) + direction + group.length) % group.length];
      go(
        {
          open: other.slug,
          piece: direction > 0 ? 0 : piecesOf(other).length - 1,
          view: now.view,
        },
        "replace"
      );
    },
    [go]
  );

  const home = useCallback(() => {
    setChosen([]);
    setFilterOpen(false);
    if (routeRef.current.open) go(HOME, "replace");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [go]);

  const view = useCallback(
    () => go({ ...routeRef.current, view: true }),
    [go]
  );

  // Bring whatever just opened up under the top bar. A link straight to a
  // project jumps there; after that everything glides.
  const settled = useRef(false);
  const lastOpen = useRef<string | null>(null);
  useEffect(() => {
    if (!ready) return;
    const instant =
      !settled.current ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    settled.current = true;
    const behavior: ScrollBehavior = instant ? "auto" : "smooth";
    const previous = lastOpen.current;
    lastOpen.current = route.open;

    if (!route.open) {
      // Closed: make sure the cell it came from is still in sight.
      const cell = previous
        ? document.querySelector(`[data-cell="${previous}"]`)
        : null;
      if (cell) {
        const box = cell.getBoundingClientRect();
        if (box.top < 48 || box.bottom > window.innerHeight) {
          cell.scrollIntoView({ behavior, block: "center" });
        }
      }
      return;
    }
    if (entry?.kind === "loop") return;

    // The panel's code may still be arriving, so look again until it's there.
    let tries = 0;
    let timer: ReturnType<typeof setTimeout>;
    const reveal = () => {
      const target = document.querySelector(
        route.open === "contact"
          ? "[data-contact]"
          : `[data-panel="${route.open}"]`
      );
      if (target) target.scrollIntoView({ behavior, block: "start" });
      else if (tries++ < 40) timer = setTimeout(reveal, 50);
    };
    reveal();
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready, route.open, nudge]);

  // Each project opened is reported as its own page view.
  useEffect(() => {
    if (entry && entry.kind !== "loop") trackProjectView(entry.id, entry.title);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [entry?.slug]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.metaKey || event.ctrlKey || event.altKey) return;
      const target = event.target as HTMLElement;

      if (event.key === "Escape") {
        if (indexOpen) closeIndex();
        else if (viewing) closeView();
        else if (routeRef.current.open) close();
        return;
      }
      if (indexOpen || target.matches?.("input, textarea, select, video")) {
        return;
      }
      if (event.key === "/") {
        event.preventDefault();
        openIndex();
      } else if (event.key === "ArrowRight") {
        step(1);
      } else if (event.key === "ArrowLeft") {
        step(-1);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [indexOpen, viewing, close, closeView, closeIndex, openIndex, step]);

  const invert = () => {
    const root = document.documentElement;
    const next = root.dataset.theme === "light" ? "dark" : "light";
    root.dataset.theme = next;
    document
      .querySelector('meta[name="theme-color"]')
      ?.setAttribute("content", next === "light" ? "#ffffff" : "#000000");
    try {
      localStorage.setItem("theme", next);
    } catch {
      // Storage can be unavailable; the choice just won't be remembered.
    }
  };

  const filter = (
    <Filter
      open={filterOpen}
      chosen={chosen}
      onToggle={() => {
        // Closing the filter clears it.
        if (filterOpen) setChosen([]);
        setFilterOpen(!filterOpen);
      }}
      onChoose={(category) =>
        setChosen((prev) =>
          prev.includes(category)
            ? prev.filter((c) => c !== category)
            : [...prev, category]
        )
      }
    />
  );

  const jump = (slug: string) => ({
    href: `#${slug}`,
    onClick: (event: MouseEvent) => {
      if (!plainClick(event)) return;
      event.preventDefault();
      open(slug);
    },
  });

  // How far along the runner stands while a piece is at full screen.
  const place =
    viewing && pieces.length > 1 ? route.piece / (pieces.length - 1) : null;

  const nextStack =
    entry?.kind === "stack"
      ? STACKS[(STACKS.indexOf(entry) + 1) % STACKS.length]
      : undefined;

  return (
    <>
      <div className="page" ref={pageRef}>
        <header className="bar">
          <h1>
            <a
              href="/"
              onClick={(event) => {
                if (!plainClick(event)) return;
                event.preventDefault();
                home();
              }}
            >
              Jakob Backhouse
            </a>
            <span className="role">Designer and animator, Wellington NZ</span>
          </h1>
          <nav aria-label="Site">
            <div className="bar-only">{filter}</div>
            <button
              type="button"
              className="word"
              aria-haspopup="dialog"
              onClick={openIndex}
            >
              Index
            </button>
            <a
              className="word"
              aria-expanded={route.open === "about"}
              {...jump("about")}
            >
              About
            </a>
            <a
              className="word"
              aria-expanded={route.open === "contact"}
              {...jump("contact")}
            >
              Contact
            </a>
            <button type="button" className="word bar-invert" onClick={invert}>
              Invert
            </button>
          </nav>
        </header>

        {/* On a phone the filter and the invert switch sit under the bar. */}
        <div className="tools">
          {filter}
          <button type="button" className="word" onClick={invert}>
            Invert
          </button>
        </div>

        <main className="wall">
          {ENTRIES.map((item, order) => {
            const isOpen = route.open === item.slug;
            return (
              <Fragment key={item.slug}>
                <Cell
                  entry={item}
                  order={order}
                  open={isOpen}
                  off={
                    chosen.length > 0 &&
                    !item.categories.some((c) => chosen.includes(c))
                  }
                  paused={covered}
                  count={piecesOf(item).length}
                  onOpen={open}
                />
                {isOpen && item.kind === "stack" && (
                  <Panel
                    key={item.slug}
                    entry={item}
                    index={route.piece}
                    posters={posters}
                    next={nextStack}
                    onPiece={(piece) => go({ ...route, piece }, "replace")}
                    onStep={step}
                    onView={view}
                    onClose={close}
                    onOpen={open}
                  />
                )}
                {isOpen && item.kind === "about" && (
                  <AboutPanel
                    entry={item}
                    onView={view}
                    onClose={close}
                    onContact={() => open("contact")}
                  />
                )}
              </Fragment>
            );
          })}
        </main>

        {route.open === "contact" && <Contact onClose={close} />}

        <footer className="foot">
          <a className="word" {...jump("contact")}>
            Contact
          </a>
          <a className="word" href={`mailto:${CONTACT.email}`}>
            {CONTACT.email}
          </a>
          <a
            className="word"
            href={CONTACT.instagram}
            target="_blank"
            rel="noopener noreferrer"
          >
            Instagram
          </a>
          <a
            className="word"
            href={CONTACT.linkedin}
            target="_blank"
            rel="noopener noreferrer"
          >
            LinkedIn
          </a>
          <span className="foot-copy">
            © {new Date().getFullYear()} Jakob Backhouse. All rights reserved.
          </span>
        </footer>
      </div>

      {viewing && entry && (
        <Viewer
          entry={entry}
          pieces={pieces}
          index={route.piece}
          posters={posters}
          onStep={step}
          onClose={closeView}
        />
      )}

      {indexOpen && (
        <IndexSheet
          onGo={(slug, piece) => {
            const target = bySlug(slug);
            const next: Route = {
              open: slug,
              piece,
              view: target?.kind === "loop",
            };
            // Takes the index's place in history, so Back returns to wherever
            // the index was opened from.
            go(next, "replace");
            setNudge((n) => n + 1);
          }}
          onClose={closeIndex}
        />
      )}

      <Runner place={place} onHome={home} />
    </>
  );
}
