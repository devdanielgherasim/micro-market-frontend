import React from 'react';
import {useProducts} from '@/hooks/useProducts';
import {ProductCard} from './ProductCard';

export const ProductList: React.FC = () => {
    const {data: products, loading, error, refetch} = useProducts();

    return (
        <div className="space-y-4">
            {error && (
                <div
                    className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-3 sm:px-4 py-2 sm:py-3 rounded-lg text-sm relative shadow-sm"
                    role="alert">
                    <strong className="font-semibold">Error: </strong>
                    <span className="block sm:inline">{error}</span>
                </div>
            )}

            {loading && !products.length ? (
                <div className="flex justify-center items-center py-6 sm:py-8 md:py-10">
                    <div
                        className="animate-spin rounded-full h-8 w-8 sm:h-10 sm:w-10 md:h-12 md:w-12 border-2 border-primary-500 dark:border-primary-400 border-t-transparent shadow-md"></div>
                </div>
            ) : products.length > 0 ? (
                <div
                    className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 laptop:grid-cols-3 gap-3 sm:gap-4 md:gap-5 laptop:gap-6">
                    {products.map((product) => (
                        <ProductCard key={product.id} product={product}/>
                    ))}
                </div>
            ) : (
                <div
                    className="text-center py-6 sm:py-8 md:py-10 text-sm sm:text-base text-secondary-500 dark:text-secondary-400 bg-secondary-50 dark:bg-secondary-800/50 rounded-lg shadow-sm p-4 sm:p-6">
                    <svg className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-3 text-secondary-400 dark:text-secondary-500"
                         fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                              d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"/>
                    </svg>
                    <p>No products found. Check back later for updates.</p>
                    <button
                        onClick={refetch}
                        className="mt-4 px-4 py-2 bg-primary-100 hover:bg-primary-200 text-primary-700 dark:bg-primary-900/30 dark:hover:bg-primary-800/40 dark:text-primary-300 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 dark:focus:ring-offset-secondary-900"
                    >
                        Refresh
                    </button>
                </div>
            )}
        </div>
    );
};
