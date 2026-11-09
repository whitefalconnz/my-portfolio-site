"use client";

import React, {
  memo,
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import Image from "next/image";
import { Instagram, Linkedin } from "lucide-react";
import TileMotion, {
  type TileMotionMedia,
} from "./components/project/TileMotion";
import { AspectRatio, type Project } from "./types/project";
import "./styles/grid.css";
import ScrollReveal from "./components/animations/ScrollReveal";
import Masonry from "react-masonry-css";
import FadeInImage from "./components/common/FadeInImage";
import FeatureVideo from "./components/common/FeatureVideo";
import HighlightLoop from "./components/common/HighlightLoop";
import GetInTouch from "./components/common/GetInTouch";

// The project view is by far the largest piece of code on the site and nobody
// needs it until they open a project, so it's kept out of the page's first
// download. It is fetched in the background once the page is idle (the
// preload effect in Home), so opening a project is still instant.
const loadProjectModal = () => import("./components/project/ProjectModal");
const ProjectModal = dynamic(loadProjectModal, { ssr: false });

// Static project data. Declared at module scope so it keeps a stable identity
// across renders -- when this lived inside the component it produced a new array
// every render, retriggering the image-dimension effect in an endless loop.
const allProjects: Project[] = [
  // Animation Projects - Featured First
  {
    id: "Tag",
    title: "Tag",
    // A frame from the trailer, so the tile doesn't repeat the player's poster.
    image: "/videos/tag-thumbnail-v01.webp",
    aspectRatio: AspectRatio.LANDSCAPE,
    bgColor: "bg-[#5C3E3C]",
    description:
      "Inspired by a personal moment of fever-induced terror, this narrative follows a child's game of tag with monsters as it spirals into a terrifying chase, climaxing in a moment of imagined injury. The work uses frame-by-frame animation, distorted backgrounds, abstract shapes, and unsettlingly childish monsters to convey how panic overwhelms logic. A subtle 'rubber hose' aesthetic makes reality feel unstable, while environments inspired by Wellington, NZ, serve as a metaphor for panic's uncontrollable force versus the struggle for control. The film acts as a window into this state for those unfamiliar, and as a source of comfort for those who have experienced it. It depicts emotional extremes where survival instinct overrides reason. The completed trailer will be used to promote the full short film, attract collaborators for sound design, and target film festivals like NZIFF and Show Me Shorts, building an audience and network for the project.",
    categories: ["Animation"],
  },
  // Paintings and Illustrations
  {
    id: "Illustrations",
    title: "Illustrations & Paintings",
    image:
      "https://media.jakobbackhouse.com/Img_and_Vid/PersonalPaintings/SaddleRoadQuickSketch.webp",
    aspectRatio: AspectRatio.PORTRAIT,
    bgColor: "bg-[#5C3E3C]",
    description:
      "A collection of digital paintings, illustrations, and traditional artworks exploring various themes and techniques.",
    categories: ["Illustration"],
  },
  // Creative Advertising Projects
  {
    id: "DesignCampaigns",
    title: "Design Campaigns",
    // A close crop of Storyboard_TalesFromTheSun.webp, which is shown in full in
    // the project itself.
    image: "/videos/design-campaigns-thumbnail-v01.webp",
    aspectRatio: AspectRatio.LANDSCAPE,
    bgColor: "bg-[#5C3E3C]",
    description:
      "Three campaigns in one place: Tales from the Sun, Bumble ICK and Truckmate.",
    categories: ["Animation", "Creative Advertising"],
  },
  {
    id: "SmokeAnimation",
    title: "Smoke Animation",
    image:
      "https://media.jakobbackhouse.com/Img_and_Vid/Smoke/SmokePreview.webm",
    aspectRatio: AspectRatio.PORTRAIT,
    bgColor: "bg-[#5C3E3C]",
    description:
      "A personal film about addiction made in Blender Grease Pencil. Exploring the feeling of withdrawing from an addiction, my character makes his way through a journey on a train, from irritation and panic to eventual recovery. A bear intermittently comes into view, tempting the character to smoke. People crowd the train, and the character plunges into a panic where he almost loses his sanity, only to barely resist smoking as the train comes out of the tunnel.",
    categories: ["Animation"],
  },
  {
    id: "MySafetyTV",
    title: "MySafetyTV",
    image:
      "https://media.jakobbackhouse.com/Img_and_Vid/MySafetyTV/MySafetyTVThumbnail.webm",
    aspectRatio: AspectRatio.PORTRAIT,
    bgColor: "bg-[#5C3E3C]",
    description:
      "I worked for an online safety training company called MySafetyTV. One other person and I were tasked with creating the animated explainer videos for the company. There was a 2–4 week turnaround for each video from concept to execution. These videos are part of a learning course that my co-worker and I created.",
    categories: ["Animation", "Creative Advertising"],
  },
  {
    id: "3D Animation",
    title: "3D Animation",
    image:
      "https://media.jakobbackhouse.com/Img_and_Vid/PigBoyPortfolio/Pigboy.webp",
    aspectRatio: AspectRatio.SQUARE,
    bgColor: "bg-[#2C4B7A]",
    description:
      "A selection of 3D work created in Blender, Maya and Unreal Engine.",
    categories: ["Animation"],
  },
  // Update Creative Coding project
  {
    id: "CreativeCoding",
    title: "Creative Coding",
    image:
      "https://media.jakobbackhouse.com/Img_and_Vid/CreativeCoding/output_2.webp",
    aspectRatio: AspectRatio.LANDSCAPE,
    bgColor: "bg-[#5C3E3C]",
    description:
      "How can I create an image manipulator in p5.js that can turn any photo into a painting? What type of images and style should I use to convey the feeling of going for bush walks when I was younger? To create this effect, I thought about how paintings are made and what makes them look like paintings. The primary reason is the effect of using a brush, so the focus of the project was creating the effect of brush strokes in the slightly random but logical way that a painter would create them.",
    categories: ["Illustration"],
  },
];

// Projects kept on file but not shown on the site. To bring one back, remove its
// id from this list; its tile, modal and search data all return with it.
const HIDDEN_PROJECT_IDS = ["MySafetyTV"];

const projects = allProjects.filter(
  (project) => !HIDDEN_PROJECT_IDS.includes(project.id)
);

// Intrinsic size of each project's grid media, used only for its aspect ratio.
// These used to be measured at runtime by downloading every original -- about
// 7.7 MB of print-resolution images plus video metadata on each home visit --
// and the grid waited for that to finish. Values match what that measurement
// produced. If a project's image or video changes, update its entry here.
// Always shown first, in this order, ahead of the shuffled projects.
const PINNED_PROJECT_IDS = ["Tag", "CreativeCoding"];

const PROJECT_DIMENSIONS: Record<string, { width: number; height: number }> = {
  Tag: { width: 1920, height: 1080 },
  Illustrations: { width: 2160, height: 2700 },
  DesignCampaigns: { width: 1600, height: 1062 },
  SmokeAnimation: { width: 1920, height: 1080 },
  MySafetyTV: { width: 1280, height: 720 },
  "3D Animation": { width: 1080, height: 1080 },
  // A 16:9 frame, not the image's own size: the 1920x640 source is cropped to fit.
  CreativeCoding: { width: 1920, height: 1080 },
};

// Tells the browser how wide a grid image is drawn, so it requests a file that
// matches rather than stretching a smaller one. The widths follow the grid: one
// column up to 768px, two up to 1024px, then three, inside Tailwind's container
// steps. Update them if the columns or gaps change.
const gridImageSizes = (scale = 1) =>
  [
    `(max-width: 768px) ${Math.round(90 * scale)}vw`,
    `(max-width: 1023px) ${Math.round(345 * scale)}px`,
    `(max-width: 1024px) ${Math.round(465 * scale)}px`,
    `(max-width: 1279px) ${Math.round(300 * scale)}px`,
    `(max-width: 1535px) ${Math.round(385 * scale)}px`,
    `${Math.round(470 * scale)}px`,
  ].join(", ");

// Images drawn wider than their tile. The 3:1 Creative Coding image is cropped
// into a 16:9 tile, so it's drawn about 1.7x the tile's width.
const PROJECT_IMAGE_SCALE: Record<string, number> = {
  CreativeCoding: 1.7,
};

// Tiles that need more than the default compression. Pigboy's smooth wall and
// fine render grain smear at 50, and 75 is still only about 18 KB at full size.
const PROJECT_IMAGE_QUALITY: Record<string, number> = {
  "3D Animation": 75,
};

// What each tile does when it's hovered, or on screen on a touch device. Clips
// were cut from the project's own footage and start close to the poster. A
// project with no entry here keeps a still tile.
const MEDIA_HOST = "https://media.jakobbackhouse.com/Img_and_Vid";
const PROJECT_MOTION: Record<string, TileMotionMedia> = {
  Tag: { kind: "clip", base: "/videos/tag-tile-v01" },
  SmokeAnimation: { kind: "clip", base: "/videos/smoke-tile-v01" },
  Illustrations: {
    kind: "slides",
    images: [
      { src: `${MEDIA_HOST}/PersonalPaintings/BrightLights.webp`, width: 2480, height: 3508 },
      { src: `${MEDIA_HOST}/PersonalPaintings/HighaltitudeLandScape(compressed).webp`, width: 5752, height: 8136 },
      { src: `${MEDIA_HOST}/PersonalPaintings/New_Series.webp`, width: 3508, height: 2480 },
      { src: `${MEDIA_HOST}/PersonalPaintings/Run(compressed).webp`, width: 1906, height: 2700 },
      { src: `${MEDIA_HOST}/PersonalPaintings/11.webp`, width: 4961, height: 3508 },
      { src: `${MEDIA_HOST}/PersonalPaintings/photobash.webp`, width: 3508, height: 4961 },
      { src: `${MEDIA_HOST}/PersonalPaintings/RBackgroundScene3Pencil(0.4).webp`, width: 4364, height: 2454 },
      { src: `${MEDIA_HOST}/PersonalPaintings/SaddleRoadQuickSketch.webp`, width: 2160, height: 2700 },
    ],
  },
  CreativeCoding: {
    kind: "slides",
    images: [
      { src: `${MEDIA_HOST}/CreativeCoding/output_3.webp`, width: 1920, height: 640 },
      { src: `${MEDIA_HOST}/CreativeCoding/output_1.webp`, width: 1920, height: 640 },
      { src: `${MEDIA_HOST}/CreativeCoding/output_2.webp`, width: 1920, height: 640 },
    ],
  },
  // One image from each of the three campaigns.
  DesignCampaigns: {
    kind: "slides",
    images: [
      { src: `${MEDIA_HOST}/GanttWithTheWind/KickTheIckSlide.webp`, width: 1868, height: 1048 },
      { src: `${MEDIA_HOST}/TruckMate/Jakob_Backhouse_BMD1R6_Mockup.webp`, width: 8333, height: 5188 },
      { src: "/videos/design-campaigns-thumbnail-v01.webp", width: 1600, height: 1062 },
    ],
  },
  // Stills from the films in this project. A clip can replace these when one is
  // exported: there's no video file to cut from yet.
  "3D Animation": {
    kind: "slides",
    images: [
      { src: "/videos/3d-tile-stagefright-v01.webp", width: 720, height: 720 },
      { src: `${MEDIA_HOST}/PigBoyPortfolio/SpiritzThumbnail-min.jpg`, width: 3264, height: 1896 },
      { src: "/videos/3d-tile-sunchaser-v01.webp", width: 720, height: 720 },
      { src: "/videos/3d-tile-sculpture-v01.webp", width: 720, height: 720 },
      { src: `${MEDIA_HOST}/PigBoyPortfolio/Pigboy.webp`, width: 1080, height: 1080 },
    ],
  },
};

// Structured data for the work on this page. Projects open in a modal rather
// than at their own URLs, so this is how their titles, descriptions and images
// reach search engines. Built once from the same data the grid renders.
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
    numberOfItems: projects.length,
    itemListElement: projects.map((project, index) => ({
      "@type": "ListItem",
      position: index + 1,
      item: {
        "@type": "CreativeWork",
        name: project.title,
        description: project.description,
        // Video thumbnails aren't images; omit rather than mislabel them.
        ...(/\.(webm|mp4)$/.test(project.image)
          ? {}
          : { image: new URL(project.image, "https://jakobbackhouse.com/").href }),
        genre: project.categories,
        creator: { "@id": "https://jakobbackhouse.com/#person" },
      },
    })),
  },
});

// useLayoutEffect runs before the browser paints; it's a no-op (with a warning)
// during server rendering, so fall back to useEffect there.
const useIsomorphicLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;

const CATEGORIES = ["Animation", "Creative Advertising", "Illustration"];

const MASONRY_BREAKPOINTS = { default: 3, 1024: 2, 768: 1 };

const PAGE_STYLES = `
        /* Prevent hyphenation and mid-word breaks globally */
        * {
          -webkit-hyphens: none;
          -moz-hyphens: none;
          -ms-hyphens: none;
          hyphens: none;
          word-break: normal;
          overflow-wrap: normal;
        }
        
        /* Subtle loading spinner animation */
        .loading-spinner {
          transition: opacity 0.3s ease-in-out;
        }
        
        .loading-spinner div {
          box-shadow: 0 0 20px rgba(255, 255, 255, 0.2);
        }
        
        /* Improve mobile touch targets */
        .mobile-touch-target {
          min-height: 44px;
          min-width: 44px;
          touch-action: manipulation;
        }
        
        /* Prevent zoom on double tap */
        .no-zoom {
          touch-action: manipulation;
        }
        `;

// Still shown in place of a video tile on Safari and phones.
const VIDEO_POSTERS: Record<string, string> = {
  SmokeAnimation: `${MEDIA_HOST}/Smoke/SmokeThumbnail(Safari).webp`,
  MySafetyTV: `${MEDIA_HOST}/MySafetyTV/MySafetyTVThumbnail(Safari).webp`,
};
const DEFAULT_VIDEO_POSTER = `${MEDIA_HOST}/Tag/Development/TagPoster1.webp`;

const isVideoFile = (src: string) =>
  src.endsWith(".webm") || src.endsWith(".mp4");

// Browsers remember only the shuffled order of project ids, not the projects
// themselves, so a changed image or description reaches everyone straight away.
const getStoredOrder = (): string[] => {
  try {
    const stored = JSON.parse(localStorage.getItem("projectOrderIds") ?? "[]");
    return Array.isArray(stored) ? stored : [];
  } catch {
    return [];
  }
};

const shuffleArray = (array: Project[]) => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

// Pinned projects keep their fixed order at the front; the rest are shuffled
const orderProjects = (array: Project[]) => {
  const pinned = PINNED_PROJECT_IDS.flatMap((id) =>
    array.filter((project) => project.id === id)
  );
  const rest = array.filter(
    (project) => !PINNED_PROJECT_IDS.includes(project.id)
  );
  return [...pinned, ...shuffleArray(rest)];
};

// The visitor's saved order while it still fits the current project list
// (every project present, none gone, pinned projects still in front), or a
// freshly shuffled one, which is then saved.
const resolveProjectOrder = (): Project[] => {
  const storedOrder = getStoredOrder();
  const storedProjects = storedOrder.flatMap((id) =>
    projects.filter((project) => project.id === id)
  );

  if (
    storedOrder.length === projects.length &&
    new Set(storedProjects).size === projects.length &&
    PINNED_PROJECT_IDS.every((id, index) => storedOrder[index] === id)
  ) {
    return storedProjects;
  }

  const fresh = orderProjects(projects);
  try {
    localStorage.setItem(
      "projectOrderIds",
      JSON.stringify(fresh.map((project) => project.id))
    );
    // Older visits saved the whole project list under these keys.
    localStorage.removeItem("projectOrder");
    localStorage.removeItem("projectDataVersion");
  } catch {
    // Storage can be unavailable; the order just won't persist.
  }
  return fresh;
};

type TouchStart = { x: number; y: number; time: number };

/**
 * One tile of the project grid. Memoised, and it owns its own "has my image
 * arrived" flag, so one tile finishing loading (or anything else changing on
 * the page) doesn't re-render the other tiles.
 */
const ProjectTile = memo(function ProjectTile({
  project,
  index,
  isMobile,
  isSafari,
  paused,
  onOpen,
}: {
  project: Project;
  index: number;
  isMobile: boolean;
  isSafari: boolean;
  paused: boolean;
  onOpen: (projectId: string) => void;
}) {
  const [loaded, setLoaded] = useState(false);
  const markLoaded = useCallback(() => setLoaded(true), []);
  const touchStart = useRef<TouchStart | null>(null);

  const dimensions = PROJECT_DIMENSIONS[project.id];
  const aspectRatio = dimensions ? dimensions.width / dimensions.height : 1;
  const motion = PROJECT_MOTION[project.id];
  const isVideo = isVideoFile(project.image);
  const quality = PROJECT_IMAGE_QUALITY[project.id] ?? (index < 6 ? 50 : 35);
  const mediaClass = `object-cover w-full h-full transition-all duration-500 ${
    loaded ? "opacity-100" : "opacity-0"
  }`;

  const open = (event: React.MouseEvent | React.TouchEvent) => {
    event.preventDefault();
    event.stopPropagation();
    onOpen(project.id);
  };

  // Tap detection for touch screens: a touch that barely moves and ends
  // quickly opens the project, anything else is a scroll.
  const handleTouchStart = (event: React.TouchEvent) => {
    event.stopPropagation();
    const touch = event.touches[0];
    touchStart.current = {
      x: touch.clientX,
      y: touch.clientY,
      time: Date.now(),
    };
  };

  const handleTouchEnd = (event: React.TouchEvent) => {
    event.stopPropagation();
    event.preventDefault();

    const start = touchStart.current;
    touchStart.current = null;
    if (!start) {
      open(event);
      return;
    }

    const end = event.changedTouches[0];
    const isTap =
      Math.abs(end.clientX - start.x) < 15 &&
      Math.abs(end.clientY - start.y) < 15 &&
      Date.now() - start.time < 750;
    if (isTap) open(event);
  };

  return (
    /* No entry animation -- thumbnails just appear. */
    <div
      className="project-masonry-item"
      style={{ "--aspect-ratio": aspectRatio } as React.CSSProperties}
    >
      <div
        className="group relative cursor-pointer mobile-touch-target no-zoom"
        onClick={open}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        style={{
          WebkitTouchCallout: "none",
          WebkitUserSelect: "none",
          touchAction: "manipulation",
        }}
      >
        <div className="relative border border-line overflow-hidden">
          <div
            className="project-item-inner"
            style={{ paddingBottom: `${(1 / aspectRatio) * 100}%` }}
          >
            {isVideo && !isSafari && !isMobile && !motion ? (
              <video
                autoPlay
                loop
                muted
                playsInline
                webkit-playsinline="true"
                controls={false}
                disablePictureInPicture
                className={`absolute inset-0 ${mediaClass}`}
                preload="auto"
                onLoadedData={(e) => {
                  markLoaded();
                  // Refused autoplay is fine: it plays on hover instead.
                  (e.target as HTMLVideoElement).play().catch(() => {});
                }}
                onCanPlay={markLoaded}
                onMouseEnter={(e) => {
                  (e.target as HTMLVideoElement).play().catch(() => {});
                }}
              >
                {/* One source, the file that exists. If MP4 encodes are
                    uploaded later, list them ahead of the WebM. */}
                <source
                  src={project.image}
                  type={
                    project.image.endsWith(".mp4") ? "video/mp4" : "video/webm"
                  }
                />
              </video>
            ) : (
              <Image
                src={
                  isVideo
                    ? VIDEO_POSTERS[project.id] || DEFAULT_VIDEO_POSTER
                    : project.image
                }
                alt={project.title}
                fill
                quality={isVideo ? 50 : quality}
                priority={index < 3}
                loading={index < 6 ? "eager" : "lazy"}
                className={mediaClass}
                sizes={gridImageSizes(
                  isVideo ? 1 : PROJECT_IMAGE_SCALE[project.id]
                )}
                onLoad={markLoaded}
                onError={markLoaded}
              />
            )}

            {motion && (
              <TileMotion
                media={motion}
                paused={paused}
                tileAspectRatio={aspectRatio}
                sizes={gridImageSizes}
                quality={quality}
              />
            )}

            {/* Subtle loading indicator */}
            {!loaded && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/10 backdrop-blur-sm z-10">
                <div className="loading-spinner">
                  <div className="w-8 h-8 border border-white/30 border-t-white/80 rounded-full animate-spin"></div>
                </div>
              </div>
            )}

            <div
              className={`absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent transition-opacity duration-300 ${
                isMobile
                  ? "opacity-100" // Always visible on mobile
                  : "opacity-0 group-hover:opacity-100" // Hover effect on desktop
              }`}
            >
              {/* Title only -- description and category chips are in the
                  project view. */}
              <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                <h3 className="text-lg font-display font-medium">
                  {project.title}
                </h3>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

/**
 * The illustration that links to /about, with a label that follows the mouse.
 * The label's position lives here rather than in the page, so moving the mouse
 * over it re-renders this link alone and not the whole home page.
 */
function AboutIllustrationLink() {
  const [tooltip, setTooltip] = useState<{ x: number; y: number } | null>(
    null
  );

  return (
    <div>
      <Link
        href="/about"
        className="block border border-line overflow-hidden cursor-pointer group"
        onMouseEnter={(e) => setTooltip({ x: e.clientX, y: e.clientY })}
        onMouseLeave={() => setTooltip(null)}
        onMouseMove={(e) => {
          if (tooltip) setTooltip({ x: e.clientX, y: e.clientY });
        }}
      >
        <FadeInImage
          src="https://media.jakobbackhouse.com/Img_and_Vid/WebsitePortfolio.webp"
          alt="About Jakob Backhouse — illustration of an artist drawing at a desk by a window"
          width={720}
          height={540}
          // Always in the first view on the screens that show it.
          loading="eager"
          // Drawn about 230px wide beside the trailer, and a third of the
          // container under it on tablets.
          sizes="(max-width: 1023px) 33vw, 320px"
          className="block w-full h-auto transition-transform duration-300"
        />
      </Link>

      {tooltip && (
        <div
          className="fixed z-50 pointer-events-none bg-ink text-ground px-3 py-2 rounded-md text-sm font-satoshi shadow-lg border border-ink"
          style={{
            left: tooltip.x + 10,
            top: tooltip.y - 40,
            transform: "translate(0, 0)",
          }}
        >
          Go to about page
        </div>
      )}
    </div>
  );
}

export default function Home() {
  const [selectedProject, setSelectedProject] = useState<string | null>(null);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  // Empty until the browser has worked out this visitor's order. The page is
  // still behind the first-load screen at that point, so the grid and its
  // images load while that screen is up and are ready when it lifts.
  const [randomizedProjects, setRandomizedProjects] = useState<Project[]>([]);
  const [isSafari, setIsSafari] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  // Whether isMobile reflects the real viewport yet. The desktop-only trailer
  // row waits for this, so a phone never inserts it (and never fetches its
  // poster) on the way to finding out it's a phone.
  const [viewportKnown, setViewportKnown] = useState(false);

  // Runs before paint so the first frame already has the right layout for the
  // device and the visitor's project order.
  useIsomorphicLayoutEffect(() => {
    const userAgent = navigator.userAgent;
    setIsSafari(
      /^((?!chrome|android).)*safari/i.test(userAgent) ||
        /iPad|iPhone|iPod/.test(userAgent)
    );

    const isMobileUserAgent =
      /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
        userAgent
      );
    // Small screens count as mobile too.
    const detectMobile = () =>
      setIsMobile(isMobileUserAgent || window.innerWidth <= 768);

    detectMobile();
    setViewportKnown(true);
    setRandomizedProjects(resolveProjectOrder());

    window.addEventListener("resize", detectMobile);
    return () => window.removeEventListener("resize", detectMobile);
  }, []);

  // Fetch the project view's code once the browser has nothing better to do,
  // so the first click on a project doesn't wait for it.
  useEffect(() => {
    const preload = () => {
      loadProjectModal().catch(() => {});
    };
    if ("requestIdleCallback" in window) {
      const id = window.requestIdleCallback(preload, { timeout: 4000 });
      return () => window.cancelIdleCallback(id);
    }
    const timer = setTimeout(preload, 2000);
    return () => clearTimeout(timer);
  }, []);

  const handleProjectOpen = useCallback((projectId: string) => {
    // Defer to the next frame so state updates settle properly on mobile
    requestAnimationFrame(() => setSelectedProject(projectId));
  }, []);

  const toggleCategory = (category: string) => {
    // Save current window scroll position
    const scrollPosition = window.scrollY;

    // Add filtering class for smooth transition
    const masonryElement = document.querySelector(".project-masonry");
    masonryElement?.classList.add("filtering");

    setSelectedCategories((prev) =>
      prev.includes(category)
        ? prev.filter((c) => c !== category)
        : [...prev, category]
    );

    // Restore window scroll position and remove filtering class after state update
    setTimeout(() => {
      window.scrollTo({ top: scrollPosition, behavior: "auto" });
      masonryElement?.classList.remove("filtering");
    }, 50);
  };

  const filteredProjects = useMemo(
    () =>
      selectedCategories.length === 0
        ? randomizedProjects
        : randomizedProjects.filter((project) =>
            project.categories.some((category) =>
              selectedCategories.includes(category)
            )
          ),
    [randomizedProjects, selectedCategories]
  );

  const openProject = selectedProject
    ? filteredProjects.find((p) => p.id === selectedProject)
    : undefined;
  const modalOpen = selectedProject !== null;

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: PAGE_STYLES }} />

      <div
        className="min-h-screen bg-ground grid-pattern overflow-x-hidden relative no-zoom"
        suppressHydrationWarning
        style={{
          visibility: "visible",
          opacity: 1,
          transition: "opacity 0.5s ease-in-out",
          pointerEvents: "auto",
        }}
      >
        <main
          className={`${isMobile ? "pt-8" : "pt-8 md:pt-40"} transition-all duration-500 ease-in-out`}
          style={{
            visibility: "visible",
            opacity: 1,
            pointerEvents: "auto",
          }}
        >
          <div className="container mx-auto px-4">
            {/* Page heading. Kept for SEO and screen readers -- the visible
                intro copy lives on /about, not here. */}
            <h1 className="sr-only">
              Jakob Backhouse — animator and designer, Wellington NZ
            </h1>
            <script
              type="application/ld+json"
              dangerouslySetInnerHTML={{ __html: PROJECTS_JSON_LD }}
            />

            {/* Trailer and illustration, side by side. Desktop only -- on mobile
                the whole row is skipped so a phone lands straight on the work
                rather than on a video plus an empty gap. */}
            {viewportKnown && !isMobile && (
              <>
                {/* Same treatment as the "Explore the rest of my stuff below"
                    line further down, so the two read as a pair. */}
                <div className="text-center mb-8">
                  <p className="text-sm text-gray-500 dark:text-gray-400 font-satoshi tracking-wider">
                    G'day check out some recent highlights below
                  </p>
                </div>

                <div className="flex flex-col lg:flex-row lg:gap-12 lg:items-start mb-20 lg:mb-28">
                  <div className="relative z-10 showreel-container lg:flex-[19] lg:min-w-0">
                    <div>
                      <div className="mb-8 lg:mb-0">
                        <div className="max-w-3xl mx-auto lg:max-w-none">
                          {/* The Tag trailer player, in a 16:9 box. */}
                          <div
                            style={{
                              padding: "56.25% 0 0 0",
                              position: "relative",
                            }}
                          >
                            <FeatureVideo />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right side on desktop: the two loops above the illustration,
                      which links through to /about. A column as tall as the
                      trailer beside it, or a row of three under it on tablets.
                      No z-index here, because an enlarged loop has to clear the
                      site header. */}
                  <div className="relative grid grid-cols-3 lg:grid-cols-1 items-start gap-3 lg:flex-[5] lg:min-w-0">
                    <HighlightLoop
                      base="/videos/duck-hunting-season-wip-v01a"
                      width={1280}
                      height={722}
                      label="Duck Hunting Season, work in progress animation loop"
                      paused={modalOpen}
                      zoomOrigin="origin-top-right"
                    />
                    <HighlightLoop
                      base="/videos/flower-growing-v01"
                      width={960}
                      height={542}
                      label="Animation loop of a rose growing and blooming"
                      paused={modalOpen}
                      zoomOrigin="origin-right"
                    />
                    <AboutIllustrationLink />
                  </div>
                </div>
              </>
            )}

            {/* Projects Section */}
            <div className="relative">
              {/* Explore All Projects Heading */}
              <div>
                <div className="text-center mb-3 md:mb-8">
                  <p className="text-sm text-gray-500 dark:text-gray-400 font-satoshi tracking-wider">
                    {/* Phones skip the highlights row above, so there's no
                        "rest" to speak of. */}
                    {isMobile
                      ? "Explore my stuff below"
                      : "Explore the rest of my stuff below"}
                  </p>
                </div>
              </div>

              {/* Categories Section - Always visible */}
              <div className="relative z-10 mb-4 md:mb-8">
                <div>
                  <div className="text-center">
                    {/* Tighter on phones so all three fit on one line. */}
                    <div className="flex flex-wrap gap-2 md:gap-3 justify-center">
                      {CATEGORIES.map((category) => (
                        <button
                          key={category}
                          onClick={() => toggleCategory(category)}
                          className={`
                             px-3 md:px-4 py-2 font-satoshi text-sm transition-colors duration-150
                             border mobile-touch-target
                             ${
                               selectedCategories.includes(category)
                                 ? "bg-accent border-accent text-accent-contrast"
                                 : "bg-ground border-line text-ink"
                             }
                           `}
                          aria-pressed={selectedCategories.includes(category)}
                        >
                          {category}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <main className="container mx-auto px-4 py-0 relative z-10">
            <div className="masonry-container">
              {randomizedProjects.length > 0 && (
                <Masonry
                  breakpointCols={MASONRY_BREAKPOINTS}
                  className="project-masonry"
                  columnClassName="project-masonry-column"
                >
                  {filteredProjects.map((project, index) => (
                    <ProjectTile
                      key={project.id}
                      project={project}
                      index={index}
                      isMobile={isMobile}
                      isSafari={isSafari}
                      paused={modalOpen}
                      onOpen={handleProjectOpen}
                    />
                  ))}
                </Masonry>
              )}
            </div>
          </main>

          <section
            id="contact"
            className="container mx-auto px-4 mt-24 md:flex md:gap-8 relative z-10"
          >
            <GetInTouch />
          </section>

          <footer className="container mx-auto px-4 py-6 mt-12 relative z-10">
            <ScrollReveal direction="up" delay={400} duration={800}>
              <div className="text-center mb-3">
                <p className="text-xs md:text-sm text-gray-400 dark:text-gray-500 font-satoshi">
                  © {new Date().getFullYear()} Jakob Backhouse. All rights
                  reserved.
                </p>
              </div>
              <div className="flex justify-center space-x-6">
                <div className="p-3 md:p-4 transition-all duration-300">
                  <Link
                    href="https://www.instagram.com/jakobbackhouse_/"
                    className="text-ink hover:text-accent transition-colors"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Instagram className="w-6 h-6" />
                    <span className="sr-only">Instagram</span>
                  </Link>
                </div>
                <div className="p-3 md:p-4 transition-all duration-300">
                  <Link
                    href="https://www.linkedin.com/in/jakob-backhouse/"
                    className="text-ink hover:text-accent transition-colors"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Linkedin className="w-6 h-6" />
                    <span className="sr-only">LinkedIn</span>
                  </Link>
                </div>
              </div>
            </ScrollReveal>
          </footer>

          {selectedProject && (
            <ProjectModal
              isOpen
              onClose={() => {
                document.body.style.pointerEvents = "auto";
                setSelectedProject(null);
              }}
              title={openProject?.title || ""}
              description={openProject?.description || ""}
              image={openProject?.image || ""}
              filteredProjects={filteredProjects}
              selectedProject={selectedProject}
              setSelectedProject={setSelectedProject}
            />
          )}
        </main>
      </div>
    </>
  );
}
