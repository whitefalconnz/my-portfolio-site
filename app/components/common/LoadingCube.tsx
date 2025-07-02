"use client"

import React, { useEffect, useState, useRef } from 'react';
import { getCDNUrl } from '../../utils/cdn';

interface LoadingScreenProps {
  transitionState: 'entering' | 'visible' | 'exiting';
}

export default function LoadingScreen({ transitionState }: LoadingScreenProps) {
  const [progress, setProgress] = useState(0);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [videoError, setVideoError] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Debug: Log CDN URLs
  useEffect(() => {
    console.log('Dark mode:', isDarkMode);
    console.log('MP4 URL:', getCDNUrl(isDarkMode ? "/Img_and_Vid/FinalDarkRunCycle.mp4" : "/Img_and_Vid/FinalLightRunCycle.mp4"));
    console.log('WebM URL:', getCDNUrl(isDarkMode ? "/Img_and_Vid/FinalDarkRunCycle.webm" : "/Img_and_Vid/FinalLightRunCycle.webm"));
  }, [isDarkMode]);

  useEffect(() => {
    if (transitionState === 'visible') {
      // Simulate loading progress
      const interval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 100) {
            clearInterval(interval);
            return 100;
          }
          // More realistic loading progression
          const increment = Math.random() * 15 + 5;
          return Math.min(prev + increment, 100);
        });
      }, 150);

      return () => clearInterval(interval);
    }
  }, [transitionState]);

  // Dark mode detection
  useEffect(() => {
    const checkDarkMode = () => {
      const isDark = document.documentElement.classList.contains('dark');
      setIsDarkMode(isDark);
    };

    checkDarkMode();

    // Set up observer for theme changes
    const observer = new MutationObserver(checkDarkMode);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    });

    return () => {
      observer.disconnect();
    };
  }, []);

  // Force video play on Safari mobile
  useEffect(() => {
    const video = videoRef.current;
    if (video && transitionState === 'visible') {
      const playVideo = async () => {
        try {
          console.log('Attempting to play video:', video.src);
          await video.play();
          console.log('Video playing successfully');
        } catch (error) {
          console.log('Video autoplay failed:', error);
          setVideoError(true);
        }
      };
      
      // Small delay to ensure video is loaded
      setTimeout(playVideo, 100);
    }
  }, [transitionState, isDarkMode]);

  const handleVideoError = () => {
    console.log('Video failed to load, switching to sprite fallback');
    console.log('Current video sources:', videoRef.current?.querySelectorAll('source'));
    setVideoError(true);
  };

  return (
    <div className={`loading-screen ${transitionState} bg-white dark:bg-[#1A1818] text-black dark:text-white`}>
      <div className="scanlines" />
      <div className="loading-content">
        <div className="running-animation">
          {!videoError ? (
            <video
              ref={videoRef}
              autoPlay
              loop
              muted
              playsInline
              webkit-playsinline="true"
              className="running-sprite"
              key={isDarkMode ? 'dark' : 'light'} // Force re-render when theme changes
              onError={handleVideoError}
              preload="auto"
              controls={false}
            >
              {isDarkMode ? (
                <>
                  <source src={getCDNUrl("/Img_and_Vid/FinalDarkRunCycle.webm")} type="video/webm" />
                  <source src={getCDNUrl("/Img_and_Vid/FinalDarkRunCycle.mp4")} type="video/mp4" />
                </>
              ) : (
                <>
                  <source src={getCDNUrl("/Img_and_Vid/FinalLightRunCycle.webm")} type="video/webm" />
                  <source src={getCDNUrl("/Img_and_Vid/FinalLightRunCycle.mp4")} type="video/mp4" />
                </>
              )}
              Your browser does not support the video tag.
            </video>
          ) : (
            // Fallback animated CSS sprite if video fails
            <div 
              className="running-sprite-fallback"
              style={{ 
                background: isDarkMode 
                  ? `url(${getCDNUrl("/Img_and_Vid/FinalDarkRunCycle_sprite.png")}) no-repeat center center`
                  : `url(${getCDNUrl("/Img_and_Vid/FinalLightRunCycle_sprite.png")}) no-repeat center center`,
                backgroundSize: 'contain',
                animation: 'sprite-animation 1s steps(8) infinite'
              }}
            />
          )}
        </div>

        <div className="progress-container">
          <div className="progress-wrapper">
            <div className="progress-bar-background">
              <div 
                className="progress-bar-fill"
                style={{ width: `${progress}%` }}
              />
              <div className="progress-bar-glow" style={{ left: `${progress}%` }} />
            </div>
          </div>
        </div>
        
        <div className="loading-text text-black dark:text-white">
          Now Loading
          <span className="dots">
            <span>.</span>
            <span>.</span>
            <span>.</span>
          </span>
        </div>
      </div>
    </div>
  )
}
