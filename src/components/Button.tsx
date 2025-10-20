import React from 'react';
import { motion } from 'framer-motion';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /**
   * Visual variant of the button
   */
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  /**
   * Size of the button
   */
  size?: 'sm' | 'md' | 'lg' | 'xl';
  /**
   * Whether the button is in a loading state
   */
  loading?: boolean;
  /**
   * Icon to display before the button text
   */
  leftIcon?: React.ReactNode;
  /**
   * Icon to display after the button text
   */
  rightIcon?: React.ReactNode;
  /**
   * Whether the button should take full width
   */
  fullWidth?: boolean;
  /**
   * Additional CSS classes
   */
  className?: string;
  /**
   * Button content
   */
  children: React.ReactNode;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      loading = false,
      leftIcon,
      rightIcon,
      fullWidth = false,
      className = '',
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    // Base classes that apply to all buttons
    const baseClasses = [
      'inline-flex',
      'items-center',
      'justify-center',
      'font-medium',
      'rounded-lg',
      'transition-all',
      'duration-200',
      'focus:outline-none',
      'focus:ring-2',
      'focus:ring-offset-2',
      'disabled:opacity-50',
      'disabled:cursor-not-allowed',
      'relative',
      'overflow-hidden'
    ];

    // Variant-specific classes
    const variantClasses = {
      primary: [
        'bg-primary-600',
        'text-white',
        'hover:bg-primary-700',
        'active:bg-primary-800',
        'focus:ring-primary-500',
        'shadow-sm',
        'hover:shadow-md'
      ],
      secondary: [
        'bg-gray-200',
        'text-gray-900',
        'hover:bg-gray-300',
        'active:bg-gray-400',
        'focus:ring-gray-500',
        'shadow-sm',
        'hover:shadow-md'
      ],
      outline: [
        'border',
        'border-primary-600',
        'text-primary-600',
        'bg-transparent',
        'hover:bg-primary-50',
        'active:bg-primary-100',
        'focus:ring-primary-500'
      ],
      ghost: [
        'text-gray-600',
        'bg-transparent',
        'hover:bg-gray-100',
        'active:bg-gray-200',
        'focus:ring-gray-500'
      ],
      danger: [
        'bg-red-600',
        'text-white',
        'hover:bg-red-700',
        'active:bg-red-800',
        'focus:ring-red-500',
        'shadow-sm',
        'hover:shadow-md'
      ]
    };

    // Size-specific classes
    const sizeClasses = {
      sm: ['text-sm', 'px-3', 'py-1.5', 'gap-1.5'],
      md: ['text-sm', 'px-4', 'py-2', 'gap-2'],
      lg: ['text-base', 'px-6', 'py-3', 'gap-2.5'],
      xl: ['text-lg', 'px-8', 'py-4', 'gap-3']
    };

    // Combine all classes
    const buttonClasses = [
      ...baseClasses,
      ...variantClasses[variant],
      ...sizeClasses[size],
      fullWidth && 'w-full',
      className
    ].filter(Boolean).join(' ');

    const isDisabled = disabled || loading;

    // Separate motion props from HTML props
    const { 
      onAnimationStart, 
      onAnimationEnd, 
      onAnimationIteration,
      onDragStart,
      onDrag,
      onDragEnd,
      onDragCapture,
      onDragEndCapture,
      onDragEnter,
      onDragEnterCapture,
      onDragExit,
      onDragExitCapture,
      onDragLeave,
      onDragLeaveCapture,
      onDragOver,
      onDragOverCapture,
      ...htmlProps 
    } = props;

    return (
      <motion.button
        ref={ref}
        className={buttonClasses}
        disabled={isDisabled}
        whileHover={!isDisabled ? { scale: 1.02 } : {}}
        whileTap={!isDisabled ? { scale: 0.98 } : {}}
        transition={{ duration: 0.1 }}
        {...htmlProps}
      >
        {/* Loading spinner */}
        {loading && (
          <motion.div
            className="absolute inset-0 flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <svg
              className="animate-spin h-4 w-4"
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
        )}

        {/* Button content */}
        <div className={`flex items-center gap-2 ${loading ? 'opacity-0' : 'opacity-100'}`}>
          {leftIcon && <span className="flex-shrink-0">{leftIcon}</span>}
          <span>{children}</span>
          {rightIcon && <span className="flex-shrink-0">{rightIcon}</span>}
        </div>
      </motion.button>
    );
  }
);

Button.displayName = 'Button';

export default Button;
