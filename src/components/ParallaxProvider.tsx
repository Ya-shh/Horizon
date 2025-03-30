"use client";

import { ReactNode, useEffect, useState } from 'react';
import { ParallaxProvider as ReactParallaxProvider } from 'react-scroll-parallax';
import Lenis from '@studio-freight/lenis';

interface ParallaxProviderProps {
  children: ReactNode;
}

export default function ParallaxProvider({ children }: ParallaxProviderProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);

    // Initialize smooth scrolling with Lenis
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
      touchMultiplier: 2,
    });

    // Create a function to update on animation frame
    function raf(time: number) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }

    // Start the animation frame loop
    requestAnimationFrame(raf);

    return () => {
      lenis.destroy();
    };
  }, []);

  // Only render children on the client to avoid hydration mismatch
  if (!mounted) {
    return null;
  }

  return (
    <ReactParallaxProvider>
      {children}
    </ReactParallaxProvider>
  );
} 