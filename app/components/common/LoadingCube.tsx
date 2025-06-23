"use client"

import React from 'react';
import { getCDNUrl } from '../../utils/cdn';

interface LoadingScreenProps {
  transitionState: 'entering' | 'visible' | 'exiting';
}

export default function LoadingScreen({ transitionState }: LoadingScreenProps) {
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
        
        <div className="loading-text text-black dark:text-white">
          Now Loading
          <span className="dots">
            <span>.</span>
            <span>.</span>
            <span>.</span>
          </span>
        </div>

        <div className="progress-container">
          <div className="progress-bar" />
        </div>
      </div>
    </div>
  )
}
