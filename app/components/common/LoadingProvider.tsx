"use client"

import { useState, useEffect } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'
import LoadingScreen from './LoadingCube'
import ContentWrapper from './ContentWrapper'

export default function LoadingProvider({
  children
}: {
  children: React.ReactNode
}) {
  const [isLoading, setIsLoading] = useState(true);
  const [transitionState, setTransitionState] = useState<'entering' | 'visible' | 'exiting'>('entering');
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    // Initial page load
    setTimeout(() => setTransitionState('visible'), 100);
    const timer = setTimeout(() => {
      setTransitionState('exiting');
      setTimeout(() => {
        setIsLoading(false);
      }, 600);
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!isLoading && (pathname || searchParams)) {
      // Immediately hide content and show loading
      setIsLoading(true);
      setTransitionState('entering');
      
      // Show loading animation
      setTimeout(() => setTransitionState('visible'), 100);
      const timer = setTimeout(() => {
        setTransitionState('exiting');
        setTimeout(() => {
          setIsLoading(false);
        }, 600);
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [pathname, searchParams]);

  return (
    <>
      {isLoading && <LoadingScreen transitionState={transitionState} />}
      <ContentWrapper isLoading={isLoading}>
        {children}
      </ContentWrapper>
    </>
  );
}
