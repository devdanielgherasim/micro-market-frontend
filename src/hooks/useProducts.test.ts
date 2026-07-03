import {act, renderHook, waitFor} from '@testing-library/react';
import {describe, expect, it, vi} from 'vitest';

import {getProducts} from '@/services/productService';
import {PageResponse, Product} from '@/types';
import {ApiError} from '@/utils/api';

import {useProducts} from './useProducts';

vi.mock('@/services/productService', () => ({
    getProducts: vi.fn(),
}));

function makeProduct(overrides: Partial<Product> = {}): Product {
    return {
        id: '1',
        name: 'Widget',
        description: 'A widget',
        price: 9.99,
        category: 'tools',
        isAvailable: true,
        ...overrides,
    };
}

function makePage(overrides: Partial<PageResponse<Product>['pagination']> = {}, content: Product[] = [makeProduct()]): PageResponse<Product> {
    return {
        content,
        pagination: {
            page: 0,
            size: 20,
            totalElements: content.length,
            totalPages: 1,
            first: true,
            last: true,
            ...overrides,
        },
    };
}

describe('useProducts', () => {
    it('fetches products on mount and exposes the resulting data and pagination', async () => {
        vi.mocked(getProducts).mockResolvedValue(makePage());

        const {result} = renderHook(() => useProducts());

        expect(result.current.loading).toBe(true);

        await waitFor(() => expect(result.current.loading).toBe(false));

        expect(result.current.data).toHaveLength(1);
        expect(result.current.data[0].name).toBe('Widget');
        expect(result.current.pagination?.totalElements).toBe(1);
        expect(result.current.error).toBeUndefined();
        expect(getProducts).toHaveBeenCalledWith(0, 20);
    });

    it('respects custom initialPage / initialPageSize options', async () => {
        vi.mocked(getProducts).mockResolvedValue(makePage({page: 2, size: 5}));

        const {result} = renderHook(() => useProducts({initialPage: 2, initialPageSize: 5}));

        await waitFor(() => expect(result.current.loading).toBe(false));

        expect(getProducts).toHaveBeenCalledWith(2, 5);
    });

    it('sets an error message built from ApiError message + code on failure', async () => {
        vi.mocked(getProducts).mockRejectedValue(new ApiError('Not found', 404, 'NOT_FOUND'));

        const {result} = renderHook(() => useProducts());

        await waitFor(() => expect(result.current.loading).toBe(false));

        expect(result.current.error).toBe('Not foundNOT_FOUND');
        expect(result.current.data).toEqual([]);
    });

    it('sets a generic error message when the failure is a plain Error', async () => {
        vi.mocked(getProducts).mockRejectedValue(new Error('network down'));

        const {result} = renderHook(() => useProducts());

        await waitFor(() => expect(result.current.loading).toBe(false));

        expect(result.current.error).toBe('network down');
    });

    it('clamps goToPage to zero for a negative page number', async () => {
        vi.mocked(getProducts).mockResolvedValue(makePage());

        const {result} = renderHook(() => useProducts());
        await waitFor(() => expect(result.current.loading).toBe(false));

        vi.mocked(getProducts).mockClear();
        vi.mocked(getProducts).mockResolvedValue(makePage());

        await act(async () => {
            await result.current.goToPage(-5);
        });

        expect(getProducts).toHaveBeenCalledWith(0, 20);
    });

    it('nextPage does nothing when already on the last page', async () => {
        vi.mocked(getProducts).mockResolvedValue(makePage({first: true, last: true}));

        const {result} = renderHook(() => useProducts());
        await waitFor(() => expect(result.current.loading).toBe(false));

        vi.mocked(getProducts).mockClear();

        await act(async () => {
            await result.current.nextPage();
        });

        expect(getProducts).not.toHaveBeenCalled();
    });

    it('prevPage does nothing when already on the first page', async () => {
        vi.mocked(getProducts).mockResolvedValue(makePage({first: true, last: false}));

        const {result} = renderHook(() => useProducts());
        await waitFor(() => expect(result.current.loading).toBe(false));

        vi.mocked(getProducts).mockClear();

        await act(async () => {
            await result.current.prevPage();
        });

        expect(getProducts).not.toHaveBeenCalled();
    });

    it('nextPage advances to currentPage + 1 when not on the last page', async () => {
        vi.mocked(getProducts).mockResolvedValue(makePage({page: 0, first: true, last: false, totalPages: 3}));

        const {result} = renderHook(() => useProducts());
        await waitFor(() => expect(result.current.loading).toBe(false));

        vi.mocked(getProducts).mockClear();
        vi.mocked(getProducts).mockResolvedValue(makePage({page: 1, first: false, last: false, totalPages: 3}));

        await act(async () => {
            await result.current.nextPage();
        });

        expect(getProducts).toHaveBeenCalledWith(1, 20);
    });
});
