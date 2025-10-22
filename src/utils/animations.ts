import { Variants } from 'framer-motion';
import React from 'react';

// Check if user prefers reduced motion
export const prefersReducedMotion = () => {
  if (typeof window !== 'undefined') {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }
  return false;
};

// Common animation variants
export const fadeInUp: Variants = {
  hidden: { 
    opacity: 0, 
    y: 20 
  },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: {
      duration: 0.6,
      ease: [0.6, -0.05, 0.01, 0.99]
    }
  }
};

export const fadeIn: Variants = {
  hidden: { 
    opacity: 0 
  },
  visible: { 
    opacity: 1,
    transition: {
      duration: 0.5,
      ease: "easeOut"
    }
  }
};

export const slideInLeft: Variants = {
  hidden: { 
    opacity: 0, 
    x: -30 
  },
  visible: { 
    opacity: 1, 
    x: 0,
    transition: {
      duration: 0.5,
      ease: "easeOut"
    }
  }
};

export const slideInRight: Variants = {
  hidden: { 
    opacity: 0, 
    x: 30 
  },
  visible: { 
    opacity: 1, 
    x: 0,
    transition: {
      duration: 0.5,
      ease: "easeOut"
    }
  }
};

export const scaleIn: Variants = {
  hidden: { 
    opacity: 0, 
    scale: 0.9 
  },
  visible: { 
    opacity: 1, 
    scale: 1,
    transition: {
      duration: 0.4,
      ease: "easeOut"
    }
  }
};

// Stagger container for children
export const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1
    }
  }
};

// Stagger item for individual elements
export const staggerItem: Variants = {
  hidden: { 
    opacity: 0, 
    y: 20 
  },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: {
      duration: 0.5,
      ease: "easeOut"
    }
  }
};

// Page transition variants
export const pageTransition: Variants = {
  initial: { 
    opacity: 0, 
    y: 20 
  },
  in: { 
    opacity: 1, 
    y: 0,
    transition: {
      duration: 0.4,
      ease: "easeOut"
    }
  },
  out: { 
    opacity: 0, 
    y: -20,
    transition: {
      duration: 0.3,
      ease: "easeIn"
    }
  }
};

// Card hover animations
export const cardHover: Variants = {
  rest: { 
    scale: 1,
    y: 0,
    transition: {
      duration: 0.2,
      ease: "easeOut"
    }
  },
  hover: { 
    scale: 1.02,
    y: -4,
    transition: {
      duration: 0.2,
      ease: "easeOut"
    }
  }
};

// Button animations
export const buttonHover: Variants = {
  rest: { 
    scale: 1,
    transition: {
      duration: 0.2,
      ease: "easeOut"
    }
  },
  hover: { 
    scale: 1.05,
    transition: {
      duration: 0.2,
      ease: "easeOut"
    }
  },
  tap: { 
    scale: 0.95,
    transition: {
      duration: 0.1,
      ease: "easeOut"
    }
  }
};

// Form field animations
export const formField: Variants = {
  hidden: { 
    opacity: 0, 
    x: -20 
  },
  visible: { 
    opacity: 1, 
    x: 0,
    transition: {
      duration: 0.4,
      ease: "easeOut"
    }
  }
};

// Loading spinner animation
export const spinnerRotate: Variants = {
  animate: {
    rotate: 360,
    transition: {
      duration: 1,
      repeat: Infinity,
      ease: "linear"
    }
  }
};

// Hero section animations
export const heroTitle: Variants = {
  hidden: { 
    opacity: 0, 
    y: 30 
  },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: {
      duration: 0.8,
      ease: [0.6, -0.05, 0.01, 0.99]
    }
  }
};

export const heroSubtitle: Variants = {
  hidden: { 
    opacity: 0, 
    y: 20 
  },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: {
      duration: 0.6,
      delay: 0.2,
      ease: "easeOut"
    }
  }
};

export const heroButton: Variants = {
  hidden: { 
    opacity: 0, 
    y: 20 
  },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: {
      duration: 0.6,
      delay: 0.4,
      ease: "easeOut"
    }
  }
};

// Results grid animations
export const resultsGrid: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1
    }
  }
};

export const resultCard: Variants = {
  hidden: { 
    opacity: 0, 
    y: 20,
    scale: 0.95
  },
  visible: { 
    opacity: 1, 
    y: 0,
    scale: 1,
    transition: {
      duration: 0.5,
      ease: "easeOut"
    }
  }
};

// Utility function to get animation variants based on user preference
export const getAnimationVariants = (variants: Variants): Variants => {
  if (prefersReducedMotion()) {
    // Return minimal animations for users who prefer reduced motion
    return {
      hidden: { opacity: 0 },
      visible: { 
        opacity: 1,
        transition: { duration: 0.1 }
      }
    };
  }
  return variants;
};

// Intersection Observer hook for scroll animations
export const useInView = () => {
  const [ref, inView] = React.useState<HTMLElement | null>(null);
  
  React.useEffect(() => {
    if (!ref) return;
    
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          // Element is in view
        }
      },
      { threshold: 0.1 }
    );
    
    observer.observe(ref);
    return () => observer.disconnect();
  }, [ref]);
  
  return [ref, inView] as const;
};
