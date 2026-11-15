"use client";

import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type PointerEvent,
  type MouseEvent,
} from "react";
import {
  ABOUT,
  piecesOf,
  type Entry,
  type FlatPiece,
  type Still,
} from "../data/work";
import { stillOf, thumb } from "../lib/img";
import { Clip, StageImage, Vimeo } from "./Media";

/**
 * What unfolds under a cell when it's opened. One big view of the current
 * piece, its caption beside it, and every piece in the project as a strip of
 * thumbnails underneath, so the whole project is one click away.
 */

/** Sideways swipes on a touch screen step through the pieces. */
function useSwipe(step: (direction: number) => void) {
  const start = useRef<{ x: number; y: number } | null>(null);
  const swiped = useRef(false);

  return {
    onPointerDown: (event: PointerEvent) => {
      if (event.pointerType === "mouse") return;
      start.current = { x: event.clientX, y: event.clientY };
      swiped.current = false;
    },
    onPointerUp: (event: PointerEvent) => {
      const from = start.current;
      start.current = null;
      if (!from) return;
      const dx = event.clientX - from.x;
      const dy = event.clientY - from.y;
      if (Math.abs(dx) > 48 && Math.abs(dx) > Math.abs(dy) * 1.5) {
        swiped.current = true;
        step(dx < 0 ? 1 : -1);
      }
    },
    onPointerCancel: () => {
      start.current = null;
    },
    // A swipe that ends on the picture mustn't also count as a tap on it.
    onClickCapture: (event: MouseEvent) => {
      if (!swiped.current) return;
      swiped.current = false;
      event.preventDefault();
      event.stopPropagation();
    },
  };
}

export function Stage({
  piece,
  poster,
  step,
  onView,
}: {
  piece: FlatPiece;
  poster?: Still;
  step: (direction: number) => void;
  onView: () => void;
}) {
  const swipe = useSwipe(step);
  const { media } = piece;

  // On a narrow screen the view takes the shape of what's in it, within
  // reason, so the caption sits right under the picture.
  const shape = Math.min(2.2, Math.max(0.8, media.w / media.h));

  return (
    <div
      className="stage"
      style={{ "--shape": shape } as CSSProperties}
      {...swipe}
    >
      {media.type === "image" && (
        <StageImage
          key={media.src}
          media={media}
          title={piece.title}
          onView={onView}
        />
      )}
      {media.type === "video" && (
        <Clip key={media.src} media={media} title={piece.title} />
      )}
      {media.type === "vimeo" && (
        <Vimeo
          key={media.src}
          media={media}
          title={piece.title}
          poster={poster}
        />
      )}
    </div>
  );
}

function Sheet({
  entry,
  current,
  posters,
  onPiece,
}: {
  entry: Entry;
  current: number;
  posters: Record<string, Still>;
  onPiece: (index: number) => void;
}) {
  const sheetRef = useRef<HTMLElement>(null);

  // On a narrow screen the thumbnails are one row that scrolls sideways, so
  // keep the current one in the middle of it. Only the row moves, never the
  // page.
  useEffect(() => {
    const sheet = sheetRef.current;
    const thumbnail = sheet?.querySelector<HTMLElement>("[aria-current]");
    if (!sheet || !thumbnail || sheet.scrollWidth <= sheet.clientWidth) return;
    sheet.scrollTo({
      left:
        thumbnail.offsetLeft - (sheet.clientWidth - thumbnail.offsetWidth) / 2,
      behavior: "smooth",
    });
  }, [current]);

  let index = -1;

  return (
    <nav
      ref={sheetRef}
      className="sheet"
      aria-label={`Everything in ${entry.title}`}
    >
      {entry.sections.map((section) => (
        <div className="sheet-group" key={section.title + section.pieces[0].title}>
          <p className="sheet-title">{section.title}</p>
          <div className="sheet-thumbs">
            {section.pieces.map((piece) => {
              index += 1;
              const at = index;
              const still = stillOf(piece.media, posters[piece.media.src]);
              const shape = still ?? { w: 16, h: 9 };
              return (
                <a
                  key={piece.media.src}
                  href={`#${entry.slug}/${at + 1}`}
                  className="thumb"
                  style={{ aspectRatio: `${shape.w} / ${shape.h}` }}
                  aria-current={at === current ? "true" : undefined}
                  aria-label={piece.title}
                  title={piece.title}
                  data-video={piece.media.type !== "image" || undefined}
                  onClick={(event) => {
                    event.preventDefault();
                    onPiece(at);
                  }}
                >
                  {still && (
                    // A plain image on purpose: the big view reuses this
                    // exact file as its instant preview.
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={thumb(still)}
                      alt=""
                      loading="lazy"
                      decoding="async"
                    />
                  )}
                </a>
              );
            })}
          </div>
        </div>
      ))}
    </nav>
  );
}

export default function Panel({
  entry,
  index,
  posters,
  next,
  onPiece,
  onStep,
  onView,
  onClose,
  onOpen,
}: {
  entry: Entry;
  index: number;
  posters: Record<string, Still>;
  // The project after this one, offered at the end of the caption.
  next?: Entry;
  onPiece: (index: number) => void;
  onStep: (direction: number) => void;
  onView: () => void;
  onClose: () => void;
  onOpen: (slug: string) => void;
}) {
  const pieces = piecesOf(entry);
  const piece = pieces[index] ?? pieces[0];
  const [more, setMore] = useState(false);
  const long = entry.text.length > 260;

  return (
    <section
      className="panel"
      data-panel={entry.slug}
      aria-label={entry.title}
      tabIndex={-1}
    >
      <div className="panel-body">
        <Stage
          piece={piece}
          poster={posters[piece.media.src]}
          step={onStep}
          onView={onView}
        />

        <div className="panel-side">
          <div className="panel-text">
            <header className="panel-head">
              <h2>{entry.title}</h2>
              <button type="button" className="word" onClick={onClose}>
                Close
              </button>
            </header>

            {!entry.hideText && (
              <div className="panel-about">
                <p className={long && !more ? "clamp" : undefined}>
                  {entry.text}
                </p>
                {long && (
                  <button
                    type="button"
                    className="word"
                    aria-expanded={more}
                    onClick={() => setMore(!more)}
                  >
                    {more ? "Less" : "More"}
                  </button>
                )}
              </div>
            )}

            <div className="panel-piece">
              <p className="meta">
                <span>
                  {index + 1} / {pieces.length}
                </span>
                {pieces.length > 1 && (
                  <>
                    <button
                      type="button"
                      className="word"
                      onClick={() => onStep(-1)}
                    >
                      Previous
                    </button>
                    <button
                      type="button"
                      className="word"
                      onClick={() => onStep(1)}
                    >
                      Next
                    </button>
                  </>
                )}
                <button type="button" className="word" onClick={onView}>
                  Enlarge
                </button>
              </p>
              <h3>{piece.title}</h3>
              {entry.sections.length > 1 && (
                <p className="dim">{piece.section}</p>
              )}
              <p>{piece.text}</p>
            </div>

            {next && (
              <a
                href={`#${next.slug}`}
                className="word panel-next"
                onClick={(event) => {
                  event.preventDefault();
                  onOpen(next.slug);
                }}
              >
                Next project <span>{next.title}</span>
              </a>
            )}
          </div>
        </div>

        <Sheet
          entry={entry}
          current={index}
          posters={posters}
          onPiece={onPiece}
        />
      </div>
    </section>
  );
}

export function AboutPanel({
  entry,
  onView,
  onClose,
  onContact,
}: {
  entry: Entry;
  onView: () => void;
  onClose: () => void;
  onContact: () => void;
}) {
  const piece = piecesOf(entry)[0];

  return (
    <section
      className="panel panel-bio"
      data-panel={entry.slug}
      aria-label="About"
      tabIndex={-1}
    >
      <div className="panel-body">
        <Stage piece={piece} step={() => {}} onView={onView} />

        <div className="panel-side">
          <div className="panel-text">
            <header className="panel-head">
              <h2>{ABOUT.greeting}</h2>
              <button type="button" className="word" onClick={onClose}>
                Close
              </button>
            </header>

            <div className="panel-about">
              <p>{ABOUT.bio}</p>
              <p>
                <a className="word" href={`mailto:${ABOUT.email}`}>
                  {ABOUT.email}
                </a>
              </p>
            </div>

            <div className="panel-piece">
              <h3>Core Skills</h3>
              <ul>
                {ABOUT.skills.map((skill) => (
                  <li key={skill}>{skill}</li>
                ))}
              </ul>
            </div>

            <div className="panel-piece">
              <h3>Experience</h3>
              <ul className="roles">
                {ABOUT.experience.map((job) => (
                  <li key={job.years} data-current={job.current || undefined}>
                    <span className="years">{job.years}</span>
                    <span>
                      {job.role}
                      <br />
                      {job.href ? (
                        <a
                          className="word"
                          href={job.href}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          {job.place} ↗
                        </a>
                      ) : (
                        <span className="dim">{job.place}</span>
                      )}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            <a
              href="#contact"
              className="word panel-next"
              onClick={(event) => {
                event.preventDefault();
                onContact();
              }}
            >
              Get in touch
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
