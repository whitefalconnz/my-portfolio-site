"use client";

import { useCallback, useEffect, useState } from "react";
import { bySlug, piecesOf } from "../data/work";

/**
 * Where the visitor is. The whole site is one page, so "where" is just what's
 * open: nothing, a project (and which of its pieces), a piece at full screen,
 * or the contact form. It lives in the address after the #, which gives every
 * project and piece its own link and makes the browser's Back button step out
 * one level at a time.
 *
 *   /                      the wall
 *   /#tag                  Tag, open
 *   /#tag/12               Tag, on its twelfth piece
 *   /#tag/12/view          that piece at full screen
 *   /#about  /#contact
 */
export type Route = { open: string | null; piece: number; view: boolean };

export const HOME: Route = { open: null, piece: 0, view: false };

export function parseRoute(hash: string): Route {
  let parts: string[];
  try {
    parts = decodeURIComponent(hash.replace(/^#\/?/, "")).split("/");
  } catch {
    return HOME;
  }
  const [slug, number, mode] = parts;
  if (slug === "contact") return { open: "contact", piece: 0, view: false };

  const entry = bySlug(slug);
  if (!entry) return HOME;
  const last = Math.max(piecesOf(entry).length - 1, 0);
  const piece = Math.min(Math.max((parseInt(number, 10) || 1) - 1, 0), last);
  return { open: slug, piece, view: mode === "view" };
}

export function formatRoute(route: Route): string {
  if (!route.open) return "";
  const entry = bySlug(route.open);
  if (!entry) return `#${route.open}`;
  if (route.view) return `#${route.open}/${route.piece + 1}/view`;
  return route.piece > 0
    ? `#${route.open}/${route.piece + 1}`
    : `#${route.open}`;
}

const write = (
  mode: "push" | "replace",
  hash: string,
  extra: { index?: boolean } = {}
) => {
  const href = window.location.pathname + window.location.search + hash;
  if (mode === "push") {
    // `from` remembers where this step was taken from, so closing it can go
    // back there rather than stacking up a new history entry.
    window.history.pushState({ from: window.location.hash, ...extra }, "", href);
  } else {
    window.history.replaceState(
      { from: window.history.state?.from, ...extra },
      "",
      href
    );
  }
};

export function useRoute() {
  // Starts on the wall so the server's HTML and the browser's first render
  // agree; a link straight to a project opens it a moment after.
  const [route, setRoute] = useState<Route>(HOME);
  const [indexOpen, setIndexOpen] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const sync = () => {
      setRoute(parseRoute(window.location.hash));
      setIndexOpen(Boolean(window.history.state?.index));
    };
    sync();
    setReady(true);
    window.addEventListener("popstate", sync);
    window.addEventListener("hashchange", sync);
    return () => {
      window.removeEventListener("popstate", sync);
      window.removeEventListener("hashchange", sync);
    };
  }, []);

  const go = useCallback((next: Route, mode: "push" | "replace" = "push") => {
    write(mode, formatRoute(next));
    setRoute(next);
    setIndexOpen(false);
  }, []);

  /** Step out to `parent`, undoing the step in if that's how we got here. */
  const back = useCallback(
    (parent: Route) => {
      const from = window.history.state?.from;
      if (typeof from === "string" && from === formatRoute(parent)) {
        window.history.back();
      } else {
        go(parent, "replace");
      }
    },
    [go]
  );

  const openIndex = useCallback(() => {
    write("push", window.location.hash, { index: true });
    setIndexOpen(true);
  }, []);

  const closeIndex = useCallback(() => {
    if (window.history.state?.index) window.history.back();
    else setIndexOpen(false);
  }, []);

  return { route, ready, go, back, indexOpen, openIndex, closeIndex };
}
