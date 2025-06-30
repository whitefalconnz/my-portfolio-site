"use client"

import React, { useEffect, useState } from 'react';
import { getCDNUrl } from '../../utils/cdn';

interface LoadingScreenProps {
  transitionState: 'entering' | 'visible' | 'exiting';
}

export default function LoadingScreen({ transitionState }: LoadingScreenProps) {
  const [progress, setProgress] = useState(0);

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

  return (
    <div className={`loading-screen ${transitionState} bg-white dark:bg-[#1A1818] text-black dark:text-white`}>
      <div className="scanlines" />
      <div className="loading-content">
        <div className="running-animation">
          <video
            autoPlay
            loop
            muted
            playsInline
            className="running-sprite"
            style={{ width: '800px', height: '800px' }}
          >
            <source src={getCDNUrl("/Img_and_Vid/RunCycleLoadingScreen.webm")} type="video/webm" />
          </video>
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
