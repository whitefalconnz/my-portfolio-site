import { useEffect, useRef, useState } from 'react';

interface ScrollInViewOptions {
  threshold?: number;
  triggerOnce?: boolean;
  root?: Element | null;
  rootMargin?: string;
}

export const useScrollInView = (options: ScrollInViewOptions = {}) => {
  const { 
    threshold = 0,
    triggerOnce = false,
    root = null,
    rootMargin = '0px'
  } = options;

  const [isInView, setIsInView] = useState(false);
  const [hasTriggered, setHasTriggered] = useState(false);
  const elementRef = useRef<Element | null>(null);

  useEffect(() => {
    const element = elementRef.current;
    if (!element || (triggerOnce && hasTriggered)) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        const isVisible = entry.isIntersecting;
        setIsInView(isVisible);
        
        if (isVisible && triggerOnce) {
          setHasTriggered(true);
          observer.unobserve(element);
        }
      },
      { threshold, root, rootMargin }
    );

    observer.observe(element);

    return () => {
      if (element) {
        observer.unobserve(element);
      }
    };
  }, [threshold, triggerOnce, root, rootMargin, hasTriggered]);

  const ref = (node: Element | null) => {
    elementRef.current = node;
  };

  return { ref, isInView };
};
