import {fireEvent, render, screen} from '@testing-library/react';
import React from 'react';
import {describe, expect, it, vi} from 'vitest';

import {Pagination} from './Pagination';

describe('Pagination', () => {
    it('renders nothing when there is one page or fewer', () => {
        const {container} = render(
            <Pagination currentPage={0} totalPages={1} onPageChange={vi.fn()}/>
        );
        expect(container).toBeEmptyDOMElement();
    });

    it('renders a button for every page when the total is small (<= 5)', () => {
        render(<Pagination currentPage={0} totalPages={3} onPageChange={vi.fn()}/>);

        expect(screen.getByRole('button', {name: '1'})).toBeInTheDocument();
        expect(screen.getByRole('button', {name: '2'})).toBeInTheDocument();
        expect(screen.getByRole('button', {name: '3'})).toBeInTheDocument();
    });

    it('calls onPageChange with the zero-based page index when a page button is clicked', () => {
        const onPageChange = vi.fn();
        render(<Pagination currentPage={0} totalPages={3} onPageChange={onPageChange}/>);

        fireEvent.click(screen.getByRole('button', {name: '2'}));

        expect(onPageChange).toHaveBeenCalledWith(1);
    });

    it('disables First and Prev on the first page', () => {
        render(<Pagination currentPage={0} totalPages={5} onPageChange={vi.fn()}/>);

        expect(screen.getByRole('button', {name: /First/})).toBeDisabled();
        expect(screen.getByRole('button', {name: /Prev/})).toBeDisabled();
        expect(screen.getByRole('button', {name: /Next/})).not.toBeDisabled();
        expect(screen.getByRole('button', {name: /Last/})).not.toBeDisabled();
    });

    it('disables Next and Last on the final page', () => {
        render(<Pagination currentPage={4} totalPages={5} onPageChange={vi.fn()}/>);

        expect(screen.getByRole('button', {name: /Next/})).toBeDisabled();
        expect(screen.getByRole('button', {name: /Last/})).toBeDisabled();
        expect(screen.getByRole('button', {name: /First/})).not.toBeDisabled();
        expect(screen.getByRole('button', {name: /Prev/})).not.toBeDisabled();
    });

    it('calls onPageChange with currentPage + 1 when Next is clicked', () => {
        const onPageChange = vi.fn();
        render(<Pagination currentPage={1} totalPages={5} onPageChange={onPageChange}/>);

        fireEvent.click(screen.getByRole('button', {name: /Next/}));

        expect(onPageChange).toHaveBeenCalledWith(2);
    });

    it('calls onPageChange with 0 when First is clicked and with the last index when Last is clicked', () => {
        const onPageChange = vi.fn();
        render(<Pagination currentPage={2} totalPages={5} onPageChange={onPageChange}/>);

        fireEvent.click(screen.getByRole('button', {name: /First/}));
        expect(onPageChange).toHaveBeenLastCalledWith(0);

        fireEvent.click(screen.getByRole('button', {name: /Last/}));
        expect(onPageChange).toHaveBeenLastCalledWith(4);
    });

    it('renders ellipses when there are more than 5 pages and the current page is in the middle', () => {
        render(<Pagination currentPage={5} totalPages={10} onPageChange={vi.fn()}/>);

        const ellipses = screen.getAllByText('...');
        expect(ellipses.length).toBeGreaterThan(0);
        // First and last page are always present as anchors of the window.
        expect(screen.getByRole('button', {name: '1'})).toBeInTheDocument();
        expect(screen.getByRole('button', {name: '10'})).toBeInTheDocument();
    });

    it('disables every button when isLoading is true', () => {
        render(<Pagination currentPage={1} totalPages={3} onPageChange={vi.fn()} isLoading/>);

        screen.getAllByRole('button').forEach((button) => {
            expect(button).toBeDisabled();
        });
    });
});
