import React from 'react';
import { motion } from 'framer-motion';

export interface LoadingSpinnerProps {
  /**
   * Size of the spinner
   */
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  /**
   * Color of the spinner
   */
  color?: 'primary' | 'secondary' | 'white' | 'gray' | 'red' | 'green' | 'blue';
  /**
   * Custom color (overrides color prop)
   */
  customColor?: string;
  /**
   * Speed of the animation in seconds
   */
  speed?: number;
  /**
   * Whether to show a pulsing effect
   */
  pulse?: boolean;
  /**
   * Additional CSS classes
   */
  className?: string;
  /**
   * Accessibility label
   */
  'aria-label'?: string;
  /**
   * Whether the spinner is visible
   */
  visible?: boolean;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'md',
  color = 'primary',
  customColor,
  speed = 1,
  pulse = false,
  className = '',
  'aria-label': ariaLabel = 'Loading',
  visible = true,
}) => {
  // Size classes
  const sizeClasses = {
    xs: 'w-3 h-3',
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
    xl: 'w-12 h-12'
  };

  // Color classes
  const colorClasses = {
    primary: 'text-primary-600',
    secondary: 'text-gray-600',
    white: 'text-white',
    gray: 'text-gray-400',
    red: 'text-red-600',
    green: 'text-green-600',
    blue: 'text-blue-600'
  };

  // Base classes
  const baseClasses = [
    'inline-block',
    'animate-spin',
    sizeClasses[size],
    customColor ? '' : colorClasses[color],
    className
  ].filter(Boolean).join(' ');

  // Animation variants
  const spinnerVariants = {
    spin: {
      rotate: [0, 360],
      transition: {
        duration: speed,
        repeat: Infinity,
        ease: 'linear'
      }
    },
    pulse: {
      scale: [1, 1.1, 1],
      opacity: [1, 0.7, 1],
      transition: {
        duration: speed * 0.5,
        repeat: Infinity,
        ease: 'easeInOut'
      }
    }
  };

  if (!visible) return null;

  return (
    <motion.div
      className={baseClasses}
      variants={spinnerVariants}
      animate={pulse ? 'pulse' : 'spin'}
      role="status"
      aria-label={ariaLabel}
      style={customColor ? { color: customColor } : undefined}
    >
      <svg
        className="w-full h-full"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
      >
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
        />
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        />
      </svg>
    </motion.div>
  );
};

export default LoadingSpinner;
