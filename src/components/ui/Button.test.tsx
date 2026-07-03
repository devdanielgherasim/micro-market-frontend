import {fireEvent, render, screen} from '@testing-library/react';
import React from 'react';
import {describe, expect, it, vi} from 'vitest';

import {Button} from './Button';

describe('Button', () => {
    it('renders its children as label text', () => {
        render(<Button>Click me</Button>);
        expect(screen.getByRole('button', {name: 'Click me'})).toBeInTheDocument();
    });

    it('calls onClick when clicked', () => {
        const onClick = vi.fn();
        render(<Button onClick={onClick}>Save</Button>);

        fireEvent.click(screen.getByRole('button', {name: 'Save'}));

        expect(onClick).toHaveBeenCalledTimes(1);
    });

    it('does not call onClick when disabled', () => {
        const onClick = vi.fn();
        render(<Button onClick={onClick} disabled>Save</Button>);

        fireEvent.click(screen.getByRole('button', {name: 'Save'}));

        expect(onClick).not.toHaveBeenCalled();
    });

    it('is disabled and shows a loading label when isLoading is true', () => {
        render(<Button isLoading>Save</Button>);

        const button = screen.getByRole('button');
        expect(button).toBeDisabled();
        expect(screen.getByText('Loading...')).toBeInTheDocument();
        expect(screen.queryByText('Save')).not.toBeInTheDocument();
    });

    it('does not fire onClick while isLoading even without explicit disabled', () => {
        const onClick = vi.fn();
        render(<Button isLoading onClick={onClick}>Save</Button>);

        fireEvent.click(screen.getByRole('button'));

        expect(onClick).not.toHaveBeenCalled();
    });

    it('renders an icon on the left by default and on the right when iconPosition="right"', () => {
        const {rerender} = render(
            <Button icon={<span data-testid="icon">*</span>}>With Icon</Button>
        );
        expect(screen.getByTestId('icon')).toBeInTheDocument();

        rerender(
            <Button icon={<span data-testid="icon">*</span>} iconPosition="right">With Icon</Button>
        );
        expect(screen.getByTestId('icon')).toBeInTheDocument();
    });

    it('applies the className prop passed through to the underlying button', () => {
        render(<Button className="custom-class">Styled</Button>);
        expect(screen.getByRole('button')).toHaveClass('custom-class');
    });

    it('forwards native button attributes such as type', () => {
        render(<Button type="submit">Submit</Button>);
        expect(screen.getByRole('button')).toHaveAttribute('type', 'submit');
    });
});
