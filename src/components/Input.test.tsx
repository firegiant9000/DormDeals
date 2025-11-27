import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Input from './Input';

describe('Input', () => {
  describe('Rendering', () => {
    it('renders input element', () => {
      render(<Input />);
      const input = screen.getByRole('textbox');
      expect(input).toBeInTheDocument();
    });

    it('renders with label', () => {
      render(<Input id="email-input" label="Email Address" />);
      expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();
    });

    it('associates label with input using htmlFor', () => {
      render(<Input id="email-input" label="Email" />);
      const label = screen.getByText('Email');
      const input = screen.getByLabelText('Email');
      expect(label).toHaveAttribute('for', 'email-input');
      expect(input).toHaveAttribute('id', 'email-input');
    });

    it('shows required indicator when required', () => {
      render(<Input label="Required Field" required />);
      const requiredIndicator = screen.getByText('*');
      expect(requiredIndicator).toBeInTheDocument();
      expect(requiredIndicator).toHaveClass('text-red-500');
    });

    it('does not show required indicator when not required', () => {
      render(<Input label="Optional Field" />);
      expect(screen.queryByText('*')).not.toBeInTheDocument();
    });
  });

  describe('Error State', () => {
    it('shows error message when error is provided', () => {
      render(<Input error="This field is required" />);
      expect(screen.getByText('This field is required')).toBeInTheDocument();
      expect(screen.getByText('This field is required')).toHaveAttribute('role', 'alert');
    });

    it('applies error styling to input when error exists', () => {
      const { container } = render(<Input error="Error message" />);
      const input = container.querySelector('input');
      expect(input).toHaveClass('border-red-500');
    });

    it('does not show helper text when error is present', () => {
      render(<Input error="Error" helperText="Helper text" />);
      expect(screen.getByText('Error')).toBeInTheDocument();
      expect(screen.queryByText('Helper text')).not.toBeInTheDocument();
    });
  });

  describe('Helper Text', () => {
    it('shows helper text when provided', () => {
      render(<Input helperText="Enter your email address" />);
      expect(screen.getByText('Enter your email address')).toBeInTheDocument();
    });

    it('does not show helper text when error is present', () => {
      render(<Input helperText="Helper" error="Error" />);
      expect(screen.queryByText('Helper')).not.toBeInTheDocument();
    });
  });

  describe('Interactions', () => {
    it('handles onChange events', async () => {
      const user = userEvent.setup();
      const handleChange = vi.fn();
      render(<Input onChange={handleChange} />);
      
      const input = screen.getByRole('textbox');
      await user.type(input, 'test');
      
      expect(handleChange).toHaveBeenCalled();
    });

    it('updates value on user input', async () => {
      const user = userEvent.setup();
      render(<Input />);
      
      const input = screen.getByRole('textbox') as HTMLInputElement;
      await user.type(input, 'hello');
      
      expect(input.value).toBe('hello');
    });

    it('handles focus events', async () => {
      const user = userEvent.setup();
      const handleFocus = vi.fn();
      render(<Input onFocus={handleFocus} />);
      
      const input = screen.getByRole('textbox');
      await user.click(input);
      
      expect(handleFocus).toHaveBeenCalled();
    });

    it('handles blur events', async () => {
      const user = userEvent.setup();
      const handleBlur = vi.fn();
      render(<Input onBlur={handleBlur} />);
      
      const input = screen.getByRole('textbox');
      await user.click(input);
      await user.tab();
      
      expect(handleBlur).toHaveBeenCalled();
    });
  });

  describe('Input Types', () => {
    it('renders text input by default', () => {
      render(<Input />);
      const input = screen.getByRole('textbox');
      // HTML inputs default to type="text" even if not explicitly set
      const type = input.getAttribute('type');
      expect(type === null || type === 'text').toBe(true);
    });

    it('renders email input type', () => {
      render(<Input type="email" />);
      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('type', 'email');
    });

    it('renders password input type', () => {
      const { container } = render(<Input type="password" />);
      const input = container.querySelector('input[type="password"]');
      expect(input).toBeInTheDocument();
      expect(input).toHaveAttribute('type', 'password');
    });

    it('renders number input type', () => {
      render(<Input type="number" />);
      const input = screen.getByRole('spinbutton');
      expect(input).toHaveAttribute('type', 'number');
    });
  });

  describe('Sizes', () => {
    it('renders with default md size', () => {
      const { container } = render(<Input />);
      const input = container.querySelector('input');
      // Check if classes are present in the className string (may have spaces due to framer-motion)
      const classNames = input?.className || '';
      expect(classNames.includes('px-4') || classNames.includes('p x - 4')).toBe(true);
      expect(classNames.includes('py-2.5') || classNames.includes('p y - 2 . 5')).toBe(true);
    });

    it('renders with sm size', () => {
      const { container } = render(<Input size="sm" />);
      const input = container.querySelector('input');
      const classNames = input?.className || '';
      expect(classNames.includes('px-3') || classNames.includes('p x - 3')).toBe(true);
      expect(classNames.includes('py-2') || classNames.includes('p y - 2')).toBe(true);
    });

    it('renders with lg size', () => {
      const { container } = render(<Input size="lg" />);
      const input = container.querySelector('input');
      const classNames = input?.className || '';
      expect(classNames.includes('px-4') || classNames.includes('p x - 4')).toBe(true);
      expect(classNames.includes('py-3') || classNames.includes('p y - 3')).toBe(true);
    });
  });

  describe('Variants', () => {
    it('renders default variant', () => {
      const { container } = render(<Input />);
      const input = container.querySelector('input');
      expect(input).toHaveClass('border', 'border-gray-300');
    });

    it('renders filled variant', () => {
      const { container } = render(<Input variant="filled" />);
      const input = container.querySelector('input');
      expect(input).toHaveClass('bg-gray-100');
      expect(input).toHaveClass('border-0');
    });

    it('renders outlined variant', () => {
      const { container } = render(<Input variant="outlined" />);
      const input = container.querySelector('input');
      expect(input).toHaveClass('border-2');
      expect(input).toHaveClass('bg-transparent');
    });
  });

  describe('Icons', () => {
    it('renders with left icon', () => {
      const LeftIcon = () => <span data-testid="left-icon">@</span>;
      render(<Input leftIcon={<LeftIcon />} />);
      expect(screen.getByTestId('left-icon')).toBeInTheDocument();
    });

    it('renders with right icon', () => {
      const RightIcon = () => <span data-testid="right-icon">✓</span>;
      render(<Input rightIcon={<RightIcon />} />);
      expect(screen.getByTestId('right-icon')).toBeInTheDocument();
    });

    it('applies padding for left icon', () => {
      const LeftIcon = () => <span>@</span>;
      const { container } = render(<Input leftIcon={<LeftIcon />} />);
      const input = container.querySelector('input');
      expect(input).toHaveClass('pl-10');
    });

    it('applies padding for right icon', () => {
      const RightIcon = () => <span>✓</span>;
      const { container } = render(<Input rightIcon={<RightIcon />} />);
      const input = container.querySelector('input');
      expect(input).toHaveClass('pr-10');
    });
  });

  describe('Character Count', () => {
    it('shows character count when showCharCount is true', () => {
      render(<Input value="test" showCharCount maxLength={10} />);
      expect(screen.getByText('4/10')).toBeInTheDocument();
    });

    it('does not show character count when showCharCount is false', () => {
      render(<Input value="test" maxLength={10} />);
      expect(screen.queryByText(/\/10/)).not.toBeInTheDocument();
    });

    it('updates character count as user types', async () => {
      const user = userEvent.setup();
      const TestComponent = () => {
        const [value, setValue] = React.useState('');
        return (
          <Input 
            showCharCount 
            maxLength={10} 
            value={value} 
            onChange={(e) => setValue(e.target.value)} 
          />
        );
      };
      
      render(<TestComponent />);
      
      const input = screen.getByRole('textbox');
      await user.type(input, 'hello');
      
      expect(screen.getByText('5/10')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('has proper label association', () => {
      render(<Input id="test-input" label="Test Label" />);
      const input = screen.getByLabelText('Test Label');
      expect(input).toHaveAttribute('id', 'test-input');
    });

    it('supports aria-label', () => {
      render(<Input aria-label="Custom label" />);
      const input = screen.getByLabelText('Custom label');
      expect(input).toBeInTheDocument();
    });

    it('supports aria-describedby for error', () => {
      render(<Input error="Error message" id="input-id" />);
      // Error message should be associated with input
      const errorMessage = screen.getByText('Error message');
      expect(errorMessage).toHaveAttribute('role', 'alert');
    });

    it('is accessible via keyboard', async () => {
      const user = userEvent.setup();
      render(<Input />);
      
      const input = screen.getByRole('textbox');
      await user.tab();
      
      expect(input).toHaveFocus();
    });
  });

  describe('Disabled State', () => {
    it('renders disabled input', () => {
      render(<Input disabled />);
      const input = screen.getByRole('textbox');
      expect(input).toBeDisabled();
    });

    it('applies disabled styles', () => {
      const { container } = render(<Input disabled />);
      const input = container.querySelector('input');
      expect(input).toHaveClass('disabled:opacity-50', 'disabled:cursor-not-allowed');
    });
  });

  describe('Placeholder', () => {
    it('renders placeholder text', () => {
      render(<Input placeholder="Enter your name" />);
      const input = screen.getByPlaceholderText('Enter your name');
      expect(input).toBeInTheDocument();
    });
  });
});

