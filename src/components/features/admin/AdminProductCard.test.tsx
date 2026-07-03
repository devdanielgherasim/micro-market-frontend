import {fireEvent, render, screen} from '@testing-library/react';
import React from 'react';
import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';

import {Product} from '@/types';

import {AdminProductCard} from './AdminProductCard';

function makeProduct(overrides: Partial<Product> = {}): Product {
    return {
        id: 'p-1',
        name: 'Widget',
        description: 'A very useful widget',
        price: 19.5,
        category: 'Tools',
        isAvailable: true,
        ...overrides,
    };
}

describe('AdminProductCard', () => {
    afterEach(() => {
        vi.restoreAllMocks();
    });

    it('renders the product name, category, description and formatted price', () => {
        render(<AdminProductCard product={makeProduct()}/>);

        expect(screen.getByText('Widget')).toBeInTheDocument();
        expect(screen.getByText('Tools')).toBeInTheDocument();
        expect(screen.getByText('A very useful widget')).toBeInTheDocument();
        expect(screen.getByText('$19.50')).toBeInTheDocument();
    });

    it('shows "In Stock" when the product is available', () => {
        render(<AdminProductCard product={makeProduct({isAvailable: true})}/>);
        expect(screen.getByText('In Stock')).toBeInTheDocument();
    });

    it('shows "Out of Stock" when the product is not available', () => {
        render(<AdminProductCard product={makeProduct({isAvailable: false})}/>);
        expect(screen.getByText('Out of Stock')).toBeInTheDocument();
    });

    it('links the View button to the product detail page', () => {
        render(<AdminProductCard product={makeProduct({id: 'abc-123'})}/>);

        const viewLink = screen.getByRole('link', {name: /View/});
        expect(viewLink).toHaveAttribute('href', '/products/abc-123');
    });

    it('calls onEdit with the product when the Edit button is clicked', () => {
        const onEdit = vi.fn();
        const product = makeProduct();
        render(<AdminProductCard product={product} onEdit={onEdit}/>);

        fireEvent.click(screen.getByRole('button', {name: /Edit/}));

        expect(onEdit).toHaveBeenCalledWith(product);
    });

    describe('delete flow', () => {
        beforeEach(() => {
            vi.spyOn(window, 'confirm');
        });

        it('calls onDelete with the product id when the user confirms deletion', async () => {
            vi.mocked(window.confirm).mockReturnValue(true);
            const onDelete = vi.fn().mockResolvedValue(undefined);
            render(<AdminProductCard product={makeProduct({id: 'p-42', name: 'Gadget'})} onDelete={onDelete}/>);

            fireEvent.click(screen.getByRole('button', {name: /Delete/}));

            expect(window.confirm).toHaveBeenCalledWith('Are you sure you want to delete Gadget?');
            await vi.waitFor(() => expect(onDelete).toHaveBeenCalledWith('p-42'));
        });

        it('does not call onDelete when the user cancels the confirmation', () => {
            vi.mocked(window.confirm).mockReturnValue(false);
            const onDelete = vi.fn();
            render(<AdminProductCard product={makeProduct()} onDelete={onDelete}/>);

            fireEvent.click(screen.getByRole('button', {name: /Delete/}));

            expect(onDelete).not.toHaveBeenCalled();
        });

        it('does nothing when no onDelete handler is provided, even if confirmed', () => {
            vi.mocked(window.confirm).mockReturnValue(true);
            render(<AdminProductCard product={makeProduct()}/>);

            expect(() => fireEvent.click(screen.getByRole('button', {name: /Delete/}))).not.toThrow();
        });
    });
});
