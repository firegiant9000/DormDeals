import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';

export interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  /**
   * Label for the input
   */
  label?: string;
  /**
   * Error message to display
   */
  error?: string;
  /**
   * Helper text to display below the input
   */
  helperText?: string;
  /**
   * Size of the input
   */
  size?: 'sm' | 'md' | 'lg';
  /**
   * Variant of the input styling
   */
  variant?: 'default' | 'filled' | 'outlined';
  /**
   * Whether the input is required
   */
  required?: boolean;
  /**
   * Icon to display on the left side
   */
  leftIcon?: React.ReactNode;
  /**
   * Icon to display on the right side
   */
  rightIcon?: React.ReactNode;
  /**
   * Whether to show character count
   */
  showCharCount?: boolean;
  /**
   * Maximum character count
   */
  maxLength?: number;
  /**
   * Additional CSS classes for the container
   */
  containerClassName?: string;
  /**
   * Additional CSS classes for the input
   */
  inputClassName?: string;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      error,
      helperText,
      size = 'md',
      variant = 'default',
      required = false,
      leftIcon,
      rightIcon,
      showCharCount = false,
      maxLength,
      containerClassName = '',
      inputClassName = '',
      className,
      onFocus,
      onBlur,
      ...props
    },
    ref
  ) => {
    const [isFocused, setIsFocused] = useState(false);
    const [hasValue, setHasValue] = useState(!!props.value || !!props.defaultValue);
    const inputRef = useRef<HTMLInputElement>(null);

    // Combine refs
    useEffect(() => {
      if (typeof ref === 'function') {
        ref(inputRef.current);
      } else if (ref) {
        ref.current = inputRef.current;
      }
    }, [ref]);

    // Update hasValue when value changes
    useEffect(() => {
      setHasValue(!!props.value);
    }, [props.value]);

    // Size classes
    const sizeClasses = {
      sm: {
        input: 'text-sm px-3 py-2',
        label: 'text-sm',
        helper: 'text-xs',
        icon: 'w-4 h-4'
      },
      md: {
        input: 'text-sm px-4 py-2.5',
        label: 'text-sm',
        helper: 'text-sm',
        icon: 'w-5 h-5'
      },
      lg: {
        input: 'text-base px-4 py-3',
        label: 'text-base',
        helper: 'text-sm',
        icon: 'w-5 h-5'
      }
    };

    // Variant classes
    const variantClasses = {
      default: [
        'border',
        'border-gray-300',
        'dark:border-gray-600',
        'bg-white',
        'dark:bg-gray-800',
        'focus:border-primary-500',
        'focus:ring-2',
        'focus:ring-primary-200',
        'dark:focus:ring-primary-800'
      ],
      filled: [
        'border-0',
        'bg-gray-100',
        'dark:bg-gray-700',
        'focus:bg-white',
        'dark:focus:bg-gray-600',
        'focus:ring-2',
        'focus:ring-primary-200',
        'dark:focus:ring-primary-800'
      ],
      outlined: [
        'border-2',
        'border-gray-300',
        'dark:border-gray-600',
        'bg-transparent',
        'focus:border-primary-500',
        'focus:ring-2',
        'focus:ring-primary-200',
        'dark:focus:ring-primary-800'
      ]
    };

    // Error state classes
    const errorClasses = error ? [
      'border-red-500',
      'focus:border-red-500',
      'focus:ring-red-200',
      'dark:focus:ring-red-800'
    ] : [];

    // Base input classes
    const baseInputClasses = [
      'w-full',
      'rounded-lg',
      'transition-all',
      'duration-200',
      'focus:outline-none',
      'disabled:opacity-50',
      'disabled:cursor-not-allowed',
      'placeholder-gray-400',
      'dark:placeholder-gray-500',
      'text-gray-900',
      'dark:text-gray-100'
    ];

    // Combine input classes
    const inputClasses = [
      ...baseInputClasses,
      ...sizeClasses[size].input,
      ...variantClasses[variant],
      ...errorClasses,
      leftIcon && 'pl-10',
      rightIcon && 'pr-10',
      inputClassName,
      className
    ].filter(Boolean).join(' ');

    // Container classes
    const containerClasses = [
      'relative',
      'w-full',
      containerClassName
    ].filter(Boolean).join(' ');

    const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
      setIsFocused(true);
      onFocus?.(e);
    };

    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
      setIsFocused(false);
      setHasValue(!!e.target.value);
      onBlur?.(e);
    };

    const currentLength = (props.value as string)?.length || 0;

    return (
      <div className={containerClasses}>
        {/* Label */}
        {label && (
          <label
            htmlFor={props.id}
            className={`block font-medium text-gray-700 dark:text-gray-300 mb-2 ${sizeClasses[size].label}`}
          >
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}

        {/* Input container */}
        <div className="relative">
          {/* Left icon */}
          {leftIcon && (
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500">
              <div className={sizeClasses[size].icon}>
                {leftIcon}
              </div>
            </div>
          )}

          {/* Input */}
          <motion.input
            ref={inputRef}
            className={inputClasses}
            onFocus={handleFocus}
            onBlur={handleBlur}
            maxLength={maxLength}
            {...props}
            animate={{
              scale: isFocused ? 1.01 : 1,
            }}
            transition={{ duration: 0.1 }}
          />

          {/* Right icon */}
          {rightIcon && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500">
              <div className={sizeClasses[size].icon}>
                {rightIcon}
              </div>
            </div>
          )}
        </div>

        {/* Helper text and error */}
        <div className="mt-2 space-y-1">
          {/* Error message */}
          {error && (
            <motion.p
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              className={`text-red-600 dark:text-red-400 ${sizeClasses[size].helper}`}
              role="alert"
              aria-live="polite"
            >
              {error}
            </motion.p>
          )}

          {/* Helper text */}
          {helperText && !error && (
            <p className={`text-gray-500 dark:text-gray-400 ${sizeClasses[size].helper}`}>
              {helperText}
            </p>
          )}

          {/* Character count */}
          {showCharCount && maxLength && (
            <div className="flex justify-end">
              <span className={`text-gray-400 dark:text-gray-500 ${sizeClasses[size].helper}`}>
                {currentLength}/{maxLength}
              </span>
            </div>
          )}
        </div>
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;
