"use client";

import { useEffect, useRef, useState } from "react";
import { Volume2, VolumeX } from "lucide-react";

const POSTER =
  "https://media.jakobbackhouse.com/Img_and_Vid/Tag/TagThumbnailHeroSection.webp";
const SOURCE =
  "https://media.jakobbackhouse.com/Img_and_Vid/Tag/TagFullInitial.webm";

/**
 * Click-to-play video for the Tag trailer, previously the full-screen hero.
 * It now sits inline under the header at the showreel's 16:9 size, so it fills
 * whatever box the parent gives it rather than owning a whole viewport.
 *
 * Safari needs an explicit load() and a readiness poll before play() will
 * resolve, which is why that branch exists.
 */
export default function FeatureVideo() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [showOverlay, setShowOverlay] = useState(true);
  const [isSoundOn, setIsSoundOn] = useState(false);
  const [isSafari, setIsSafari] = useState(false);
  const [isBuffering, setIsBuffering] = useState(false);

  useEffect(() => {
    const ua = navigator.userAgent;
    setIsSafari(
      /^((?!chrome|android).)*safari/i.test(ua) || /iPad|iPhone|iPod/.test(ua)
    );
  }, []);

  const handleClick = () => {
    const video = videoRef.current;
    if (!video) return;

    if (!video.paused) {
      video.pause();
      setShowOverlay(true);
      return;
    }

    if (!isSafari) {
      video.play().catch(() => setShowOverlay(true));
      setShowOverlay(false);
      return;
    }

    // Safari: load first, then poll readyState before attempting play.
    setIsBuffering(true);
    video.load();

    let attempts = 0;
    const playWhenReady = () => {
      attempts++;
      if (videoRef.current && videoRef.current.readyState >= 2) {
        videoRef.current
          .play()
          .then(() => {
            setShowOverlay(false);
            setIsBuffering(false);
          })
          .catch(() => setIsBuffering(false));
      } else if (attempts < 30) {
        setTimeout(playWhenReady, 100);
      } else {
        setIsBuffering(false);
      }
    };
    setTimeout(playWhenReady, 200);
  };

  const handleSoundToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsSoundOn((prev) => {
      const next = !prev;
      if (videoRef.current) videoRef.current.muted = !next;
      return next;
    });
  };

  return (
    <div
      className="absolute inset-0 cursor-pointer border border-line bg-surface"
      onClick={handleClick}
    >
      <video
        ref={videoRef}
        muted={!isSoundOn}
        playsInline
        webkit-playsinline="true"
        className="w-full h-full object-cover"
        poster={POSTER}
        preload={isSafari ? "metadata" : "none"}
        onEnded={() => setShowOverlay(true)}
        onCanPlay={() => setIsBuffering(false)}
      >
        <source src={SOURCE} type="video/webm" />
        Your browser does not support the video tag.
      </video>

      <button
        onClick={handleSoundToggle}
        className="absolute top-3 right-3 z-20 p-2 bg-ground border border-line hover:border-accent"
        aria-label={isSoundOn ? "Turn sound off" : "Turn sound on"}
      >
        {isSoundOn ? (
          <Volume2 className="w-4 h-4 text-ink" />
        ) : (
          <VolumeX className="w-4 h-4 text-ink" />
        )}
      </button>

      {showOverlay && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center px-5 py-4 bg-ground border border-line">
            {isBuffering ? (
              <div className="flex items-center justify-center gap-2">
                <div className="w-4 h-4 border border-ink border-t-transparent rounded-full animate-spin" />
                <p className="font-satoshi text-sm text-ink">Loading video…</p>
              </div>
            ) : (
              <p className="font-satoshi text-sm md:text-base text-ink">
                <span className="block md:hidden">Tap to play</span>
                <span className="hidden md:block">Click to play</span>
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
