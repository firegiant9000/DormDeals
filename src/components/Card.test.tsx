import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Card from './Card';

describe('Card', () => {
  describe('Rendering', () => {
    it('renders children correctly', () => {
      render(
        <Card>
          <div>Card Content</div>
        </Card>
      );
      expect(screen.getByText('Card Content')).toBeInTheDocument();
    });

    it('renders multiple children', () => {
      render(
        <Card>
          <div>First</div>
          <div>Second</div>
        </Card>
      );
      expect(screen.getByText('First')).toBeInTheDocument();
      expect(screen.getByText('Second')).toBeInTheDocument();
    });

    it('applies custom className', () => {
      const { container } = render(
        <Card className="custom-card-class">
          <div>Content</div>
        </Card>
      );
      const card = container.firstChild as HTMLElement;
      expect(card).toHaveClass('custom-card-class');
    });
  });

  describe('Variants', () => {
    it('renders default variant', () => {
      const { container } = render(<Card>Default</Card>);
      const card = container.firstChild as HTMLElement;
      expect(card).toHaveClass('shadow-sm');
    });

    it('renders elevated variant', () => {
      const { container } = render(<Card variant="elevated">Elevated</Card>);
      const card = container.firstChild as HTMLElement;
      expect(card).toHaveClass('shadow-lg');
    });

    it('renders outlined variant', () => {
      const { container } = render(<Card variant="outlined">Outlined</Card>);
      const card = container.firstChild as HTMLElement;
      expect(card).toHaveClass('border-2');
      expect(card).toHaveClass('shadow-none');
    });

    it('renders flat variant', () => {
      const { container } = render(<Card variant="flat">Flat</Card>);
      const card = container.firstChild as HTMLElement;
      expect(card).toHaveClass('shadow-none');
      expect(card).toHaveClass('border-0');
    });
  });

  describe('Padding', () => {
    it('renders with default md padding', () => {
      const { container } = render(<Card>Content</Card>);
      const card = container.firstChild as HTMLElement;
      expect(card).toHaveClass('p-4');
    });

    it('renders with no padding', () => {
      const { container } = render(<Card padding="none">Content</Card>);
      const card = container.firstChild as HTMLElement;
      expect(card).not.toHaveClass('p-3', 'p-4', 'p-6', 'p-8');
    });

    it('renders with sm padding', () => {
      const { container } = render(<Card padding="sm">Content</Card>);
      const card = container.firstChild as HTMLElement;
      expect(card).toHaveClass('p-3');
    });

    it('renders with lg padding', () => {
      const { container } = render(<Card padding="lg">Content</Card>);
      const card = container.firstChild as HTMLElement;
      expect(card).toHaveClass('p-6');
    });

    it('renders with xl padding', () => {
      const { container } = render(<Card padding="xl">Content</Card>);
      const card = container.firstChild as HTMLElement;
      expect(card).toHaveClass('p-8');
    });
  });

  describe('Clickable Card', () => {
    it('handles onClick when provided', async () => {
      const user = userEvent.setup();
      const handleClick = vi.fn();
      render(
        <Card onClick={handleClick} clickable>
          Clickable Card
        </Card>
      );
      
      const card = screen.getByText('Clickable Card').closest('div');
      await user.click(card!);
      
      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('has button role when clickable', () => {
      render(
        <Card onClick={vi.fn()} clickable>
          Clickable
        </Card>
      );
      const card = screen.getByRole('button');
      expect(card).toBeInTheDocument();
    });

    it('has tabIndex when clickable', () => {
      const { container } = render(
        <Card onClick={vi.fn()} clickable>
          Clickable
        </Card>
      );
      const card = container.firstChild as HTMLElement;
      expect(card).toHaveAttribute('tabIndex', '0');
    });

    it('handles Enter key press when clickable', async () => {
      const user = userEvent.setup();
      const handleClick = vi.fn();
      render(
        <Card onClick={handleClick} clickable>
          Keyboard Card
        </Card>
      );
      
      const card = screen.getByRole('button');
      card.focus();
      await user.keyboard('{Enter}');
      
      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('handles Space key press when clickable', async () => {
      const user = userEvent.setup();
      const handleClick = vi.fn();
      render(
        <Card onClick={handleClick} clickable>
          Keyboard Card
        </Card>
      );
      
      const card = screen.getByRole('button');
      card.focus();
      await user.keyboard(' ');
      
      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('does not have button role when not clickable', () => {
      render(<Card>Not Clickable</Card>);
      expect(screen.queryByRole('button')).not.toBeInTheDocument();
    });
  });

  describe('Hoverable', () => {
    it('applies hover styles when hoverable', () => {
      const { container } = render(<Card hoverable>Hoverable</Card>);
      const card = container.firstChild as HTMLElement;
      expect(card).toHaveClass('cursor-pointer', 'hover:shadow-md');
    });

    it('does not apply hover styles when not hoverable', () => {
      const { container } = render(<Card>Not Hoverable</Card>);
      const card = container.firstChild as HTMLElement;
      expect(card).not.toHaveClass('hover:shadow-md');
    });
  });

  describe('Animation', () => {
    it('renders with no animation', () => {
      const { container } = render(<Card animation="none">No Animation</Card>);
      const card = container.firstChild as HTMLElement;
      expect(card).toBeInTheDocument();
    });

    it('renders with fade animation', () => {
      const { container } = render(<Card animation="fade">Fade</Card>);
      const card = container.firstChild as HTMLElement;
      expect(card).toBeInTheDocument();
    });

    it('renders with slide animation', () => {
      const { container } = render(<Card animation="slide">Slide</Card>);
      const card = container.firstChild as HTMLElement;
      expect(card).toBeInTheDocument();
    });

    it('renders with scale animation', () => {
      const { container } = render(<Card animation="scale">Scale</Card>);
      const card = container.firstChild as HTMLElement;
      expect(card).toBeInTheDocument();
    });
  });
});

