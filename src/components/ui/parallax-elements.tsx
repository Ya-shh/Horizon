"use client";

import { useRef, useEffect, ReactNode } from 'react';
import { motion, useInView, useAnimation, Variants } from 'framer-motion';
import { Parallax } from 'react-scroll-parallax';
import gsap from 'gsap';

// Fade in animation for elements as they enter the viewport
export function FadeIn({ 
  children, 
  delay = 0,
  direction = null,
  className = '',
  distance = 30,
  damping = 25
}: { 
  children: ReactNode;
  delay?: number;
  direction?: 'up' | 'down' | 'left' | 'right' | null;
  className?: string;
  distance?: number;
  damping?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, amount: 0.3 });
  const controls = useAnimation();
  
  useEffect(() => {
    if (isInView) {
      controls.start('visible');
    }
  }, [isInView, controls]);
  
  // Define different variants based on the direction
  const variants: Variants = {
    hidden: {
      opacity: 0,
      x: direction === 'left' ? -distance : direction === 'right' ? distance : 0,
      y: direction === 'up' ? -distance : direction === 'down' ? distance : 0
    },
    visible: {
      opacity: 1,
      x: 0,
      y: 0,
      transition: {
        duration: 0.8,
        delay,
        type: "spring",
        damping
      }
    }
  };
  
  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={controls}
      variants={variants}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// Decorative floating element with random movement
export function FloatingElement({
  children,
  className = '',
  speed = 3,
  xRange = 20,
  yRange = 20
}: {
  children: ReactNode;
  className?: string;
  speed?: number;
  xRange?: number;
  yRange?: number;
}) {
  const elementRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    if (!elementRef.current) return;
    
    const element = elementRef.current;
    
    // Create slightly random movement
    const timeline = gsap.timeline({
      repeat: -1,
      yoyo: true,
      ease: "power1.inOut"
    });
    
    const randomX = (Math.random() - 0.5) * 2 * xRange;
    const randomY = (Math.random() - 0.5) * 2 * yRange;
    const randomRotation = (Math.random() - 0.5) * 15;
    
    timeline.to(element, {
      x: randomX,
      y: randomY,
      rotation: randomRotation,
      duration: speed,
      ease: "sine.inOut"
    });
    
    return () => {
      timeline.kill();
    };
  }, [speed, xRange, yRange]);
  
  return (
    <div ref={elementRef} className={`transition-transform will-change-transform ${className}`}>
      {children}
    </div>
  );
}

// Parallax scroll section with layered elements
export function ParallaxSection({
  children,
  className = '',
  speed = -10
}: {
  children: ReactNode;
  className?: string;
  speed?: number;
}) {
  return (
    <Parallax speed={speed} className={className}>
      {children}
    </Parallax>
  );
}

// Text that reveals letter by letter
export function RevealText({
  text,
  className = '',
  delay = 0,
  staggerChildren = 0.02
}: {
  text: string;
  className?: string;
  delay?: number;
  staggerChildren?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, amount: 0.3 });
  const controls = useAnimation();
  
  useEffect(() => {
    if (isInView) {
      controls.start('visible');
    }
  }, [isInView, controls]);
  
  const container: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren,
        delayChildren: delay
      }
    }
  };
  
  const child: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        damping: 12,
        stiffness: 100
      }
    }
  };
  
  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={controls}
      variants={container}
      className={className}
      aria-label={text}
    >
      {text.split('').map((char, index) => (
        <motion.span
          key={index}
          variants={child}
          className="inline-block"
          style={{ 
            display: char === ' ' ? 'inline' : 'inline-block',
            whiteSpace: 'pre'
          }}
        >
          {char}
        </motion.span>
      ))}
    </motion.div>
  );
}

// Magnetic element that attracts to cursor
export function MagneticElement({
  children,
  className = '',
  strength = 40,
  isolationRadius = 100
}: {
  children: ReactNode;
  className?: string;
  strength?: number;
  isolationRadius?: number;
}) {
  const elementRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;
    
    let bounds: DOMRect;
    let isMoving = false;
    
    const handleMouseMove = (e: MouseEvent) => {
      if (!bounds) bounds = element.getBoundingClientRect();
      
      const mouseX = e.clientX;
      const mouseY = e.clientY;
      const centerX = bounds.left + bounds.width / 2;
      const centerY = bounds.top + bounds.height / 2;
      
      const deltaX = mouseX - centerX;
      const deltaY = mouseY - centerY;
      
      const distance = Math.sqrt(deltaX ** 2 + deltaY ** 2);
      const maxDistance = Math.max(bounds.width, bounds.height);
      
      // Check if any other magnetic element is closer to the mouse
      const otherMagneticElements = document.querySelectorAll('[data-magnetic="true"]');
      let isClosest = true;
      
      otherMagneticElements.forEach(otherElement => {
        if (otherElement === element) return;
        
        const otherBounds = otherElement.getBoundingClientRect();
        const otherCenterX = otherBounds.left + otherBounds.width / 2;
        const otherCenterY = otherBounds.top + otherBounds.height / 2;
        
        const otherDeltaX = mouseX - otherCenterX;
        const otherDeltaY = mouseY - otherCenterY;
        
        const otherDistance = Math.sqrt(otherDeltaX ** 2 + otherDeltaY ** 2);
        
        // If another element is too close, don't move this one
        if (Math.abs(distance - otherDistance) < isolationRadius && otherDistance < distance) {
          isClosest = false;
        }
      });
      
      if (distance < maxDistance * 1.5 && isClosest) {
        isMoving = true;
        const x = deltaX * strength / 100;
        const y = deltaY * strength / 100;
        
        gsap.to(element, {
          x,
          y,
          duration: 0.3,
          ease: "power2.out"
        });
      } else if (isMoving) {
        isMoving = false;
        gsap.to(element, {
          x: 0,
          y: 0,
          duration: 0.5,
          ease: "elastic.out(1, 0.3)"
        });
      }
    };
    
    const handleMouseLeave = () => {
      isMoving = false;
      gsap.to(element, {
        x: 0,
        y: 0,
        duration: 0.7,
        ease: "elastic.out(1, 0.3)"
      });
    };
    
    const handleResize = () => {
      bounds = element.getBoundingClientRect();
    };
    
    document.addEventListener('mousemove', handleMouseMove);
    element.addEventListener('mouseleave', handleMouseLeave);
    window.addEventListener('resize', handleResize);
    
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      element?.removeEventListener('mouseleave', handleMouseLeave);
      window.removeEventListener('resize', handleResize);
    };
  }, [strength, isolationRadius]);
  
  return (
    <div ref={elementRef} className={`relative inline-block ${className}`} data-magnetic="true">
      {children}
    </div>
  );
} 