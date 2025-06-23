import React, { ReactNode } from 'react';
import useScrollReveal from '../../hooks/useScrollReveal';

interface ScrollRevealProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  direction?: 'up' | 'down' | 'left' | 'right' | 'fade';
  duration?: number;
  distance?: string;
  threshold?: number;
  rootMargin?: string;
  easing?: string;
  triggerOnce?: boolean;
  style?: React.CSSProperties;
}

const ScrollReveal: React.FC<ScrollRevealProps> = ({
  children,
  className = '',
  delay = 0,
  direction = 'up',
  duration = 800,
  distance = '20px',
  threshold = 0.1,
  rootMargin = '0px',
  easing = 'cubic-bezier(0.25, 0.1, 0.25, 1.0)',
  triggerOnce = true,
  style = {},
}) => {
  const [ref, isInView] = useScrollReveal<HTMLDivElement>({
    threshold,
    rootMargin,
    triggerOnce,
  });

  const getTransformValue = () => {
    switch (direction) {
      case 'up':
        return `translateY(${distance})`;
      case 'down':
        return `translateY(-${distance})`;
      case 'left':
        return `translateX(${distance})`;
      case 'right':
        return `translateX(-${distance})`;
      case 'fade':
        return 'none';
      default:
        return `translateY(${distance})`;
    }
  };

  const baseStyle: React.CSSProperties = {
    opacity: 0,
    transform: getTransformValue(),
    transition: `opacity ${duration}ms ${easing}, transform ${duration}ms ${easing}`,
    transitionDelay: `${delay}ms`,
    willChange: 'opacity, transform',
  };

  const activeStyle: React.CSSProperties = {
    opacity: 1,
    transform: 'none',
  };

  return (
    <div
      ref={ref}
      className={className}
      style={{
        ...style,
        ...baseStyle,
        ...(isInView ? activeStyle : {}),
      }}
    >
      {children}
    </div>
  );
};

export default ScrollReveal;
