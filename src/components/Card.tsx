import React from 'react';
import { motion } from 'framer-motion';

export interface CardProps {
  /**
   * Card content
   */
  children: React.ReactNode;
  /**
   * Additional CSS classes
   */
  className?: string;
  /**
   * Whether the card is clickable
   */
  clickable?: boolean;
  /**
   * Click handler for the card
   */
  onClick?: () => void;
  /**
   * Card variant for different styling
   */
  variant?: 'default' | 'elevated' | 'outlined' | 'flat';
  /**
   * Padding size
   */
  padding?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  /**
   * Whether to show hover effects
   */
  hoverable?: boolean;
  /**
   * Animation variant for entrance
   */
  animation?: 'none' | 'fade' | 'slide' | 'scale';
  /**
   * Animation delay in milliseconds
   */
  animationDelay?: number;
}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  (
    {
      children,
      className = '',
      clickable = false,
      onClick,
      variant = 'default',
      padding = 'md',
      hoverable = false,
      animation = 'fade',
      animationDelay = 0,
      ...props
    },
    ref
  ) => {
    // Base classes
    const baseClasses = [
      'bg-white',
      'dark:bg-gray-800',
      'rounded-lg',
      'transition-all',
      'duration-200'
    ];

    // Variant-specific classes
    const variantClasses = {
      default: [
        'shadow-sm',
        'border',
        'border-gray-200',
        'dark:border-gray-700'
      ],
      elevated: [
        'shadow-lg',
        'border',
        'border-gray-100',
        'dark:border-gray-600'
      ],
      outlined: [
        'border-2',
        'border-gray-300',
        'dark:border-gray-600',
        'shadow-none'
      ],
      flat: [
        'shadow-none',
        'border-0'
      ]
    };

    // Padding classes
    const paddingClasses = {
      none: [],
      sm: ['p-3'],
      md: ['p-4'],
      lg: ['p-6'],
      xl: ['p-8']
    };

    // Interactive classes
    const interactiveClasses = clickable || hoverable ? [
      'cursor-pointer',
      'hover:shadow-md',
      'hover:scale-[1.02]',
      'active:scale-[0.98]'
    ] : [];

    // Combine all classes
    const cardClasses = [
      ...baseClasses,
      ...variantClasses[variant],
      ...paddingClasses[padding],
      ...interactiveClasses,
      className
    ].filter(Boolean).join(' ');

    // Animation variants
    const animationVariants = {
      none: {},
      fade: {
        initial: { opacity: 0 },
        animate: { opacity: 1 },
        exit: { opacity: 0 }
      },
      slide: {
        initial: { opacity: 0, y: 20 },
        animate: { opacity: 1, y: 0 },
        exit: { opacity: 0, y: -20 }
      },
      scale: {
        initial: { opacity: 0, scale: 0.95 },
        animate: { opacity: 1, scale: 1 },
        exit: { opacity: 0, scale: 0.95 }
      }
    };

    const Component = clickable ? motion.div : motion.div;

    return (
      <Component
        ref={ref}
        className={cardClasses}
        onClick={onClick}
        role={clickable ? 'button' : undefined}
        tabIndex={clickable ? 0 : undefined}
        onKeyDown={clickable ? (e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onClick?.();
          }
        } : undefined}
        initial={animation !== 'none' ? animationVariants[animation].initial : undefined}
        animate={animation !== 'none' ? animationVariants[animation].animate : undefined}
        exit={animation !== 'none' ? animationVariants[animation].exit : undefined}
        transition={{
          duration: 0.3,
          delay: animationDelay / 1000,
          ease: 'easeOut'
        }}
        {...props}
      >
        {children}
      </Component>
    );
  }
);

Card.displayName = 'Card';

export default Card;
