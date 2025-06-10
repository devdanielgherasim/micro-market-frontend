"use client"

import React, {useState} from 'react';
import Link from 'next/link';
import {useProduct} from '@/hooks/useProduct';
import {useAuth} from '@/auth/KeycloakProvider';
import {isClient} from '@/auth/roleUtils';
import {purchaseProduct} from '@/services/orderService';

import type {AppProps} from "next/app";

interface ProductPageParams extends AppProps {
    params: {
        id: string;
    };
    searchParams: Record<string, string | string[] | undefined>;
}

export default function ProductPage({params}: any) {
    const {id} = params;
    const {product, loading, error, refetch} = useProduct(id);
    const {userProfile, isAuthenticated} = useAuth();
    const [isPurchasing, setIsPurchasing] = useState(false);
    const [purchaseError, setPurchaseError] = useState<string | null>(null);
    const [purchaseSuccess, setPurchaseSuccess] = useState(false);

    const handlePurchase = async () => {
        if (!isAuthenticated || !userProfile?.id) {
            setPurchaseError('You must be logged in to purchase products');
            return;
        }

        if (!product?.available) {
            setPurchaseError('This product is out of stock');
            return;
        }

        try {
            setIsPurchasing(true);
            setPurchaseError(null);
            setPurchaseSuccess(false);

            await purchaseProduct(product, userProfile.id);

            setPurchaseSuccess(true);
            setTimeout(() => setPurchaseSuccess(false), 3000); // Clear success message after 3 seconds
        } catch (error) {
            console.error('Failed to purchase product:', error);
            setPurchaseError(error instanceof Error ? error.message : 'Failed to purchase product');
        } finally {
            setIsPurchasing(false);
        }
    };

    if (loading) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="flex justify-center items-center py-16">
                    <div
                        className="animate-spin rounded-full h-12 w-12 border-2 border-blue-500 dark:border-blue-400 border-t-transparent shadow-md"></div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div
                    className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-lg shadow-sm"
                    role="alert">
                    <h2 className="text-lg font-semibold mb-2">Error Loading Product</h2>
                    <p>{error}</p>
                    <button
                        onClick={refetch}
                        className="mt-4 px-4 py-2 bg-red-100 dark:bg-red-800 text-red-700 dark:text-red-300 rounded-md hover:bg-red-200 dark:hover:bg-red-700 transition-colors"
                    >
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    if (!product) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div
                    className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 text-yellow-700 dark:text-yellow-400 px-4 py-3 rounded-lg shadow-sm"
                    role="alert">
                    <h2 className="text-lg font-semibold mb-2">Product Not Found</h2>
                    <p>The product you're looking for doesn't exist or has been removed.</p>
                    <Link
                        href="/products"
                        className="inline-block mt-4 px-4 py-2 bg-primary-50 dark:bg-primary-900/10 text-primary-600 dark:text-primary-400 rounded-md hover:bg-primary-100 dark:hover:bg-primary-900/20 transition-colors"
                    >
                        Back to Products
                    </Link>
                </div>
            </div>
        );
    }

    const imageUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(product.name || '')}&background=0D8ABC&color=fff&size=128&bold=true&format=svg`;

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="mb-4">
                <Link
                    href="/products"
                    className="inline-flex items-center text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 transition-colors"
                >
                    <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                              d="M10 19l-7-7m0 0l7-7m-7 7h18"/>
                    </svg>
                    Back to Products
                </Link>
            </div>

            <div
                className="bg-white dark:bg-secondary-800 rounded-xl shadow-card dark:shadow-secondary-900/20 overflow-hidden">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Product Image */}
                    <div
                        className="relative h-64 sm:h-80 md:h-96 w-full bg-secondary-100 dark:bg-secondary-700/50 flex items-center justify-center">
                        <img
                            src={imageUrl}
                            alt={product.name}
                            className="w-full h-4/5 object-contain"
                            loading="lazy"
                        />

                        {/* Stock badge */}
                        {!product.available ? (
                            <div
                                className="absolute top-4 right-4 bg-danger-500 text-white text-sm font-bold px-3 py-1 rounded-md shadow-sm"
                                aria-label="Product unavailable"
                            >
                                Out of Stock
                            </div>
                        ) : (
                            <div
                                className="absolute top-4 right-4 bg-success-500 text-white text-sm font-bold px-3 py-1 rounded-md shadow-sm"
                                aria-label="Product in stock"
                            >
                                In Stock
                            </div>
                        )}
                    </div>

                    {/* Product Details */}
                    <div className="p-6">
                        <div className="mb-4">
                            <div className="flex items-center">
                <span
                    className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-secondary-100 text-secondary-800 dark:bg-secondary-700 dark:text-secondary-300 transition-colors">
                  {product.category}
                </span>
                            </div>
                            <h1 className="text-2xl sm:text-3xl font-bold text-secondary-900 dark:text-white mt-2">
                                {product.name}
                            </h1>
                            <div className="mt-2 text-2xl font-bold text-primary-600 dark:text-primary-400">
                                <span aria-hidden="true" className="text-secondary-500 dark:text-secondary-400">$</span>
                                {product.price.toFixed(2)}
                            </div>
                        </div>

                        <div className="mb-6">
                            <h2 className="text-lg font-semibold text-secondary-900 dark:text-white mb-2">Description</h2>
                            <p className="text-secondary-500 dark:text-secondary-400">
                                {product.description}
                            </p>
                        </div>

                        {/* Purchase status messages */}
                        {purchaseError && (
                            <div
                                className="mb-4 p-3 text-sm text-red-700 bg-red-100 dark:bg-red-900/20 dark:text-red-400 rounded-md">
                                {purchaseError}
                            </div>
                        )}

                        {purchaseSuccess && (
                            <div
                                className="mb-4 p-3 text-sm text-green-700 bg-green-100 dark:bg-green-900/20 dark:text-green-400 rounded-md">
                                Product purchased successfully!
                            </div>
                        )}

                        {/* Purchase button - only show for authenticated clients and if product is in stock */}
                        {isAuthenticated && isClient(userProfile) && product.available && (
                            <button
                                onClick={handlePurchase}
                                disabled={isPurchasing}
                                className={`inline-flex items-center justify-center w-full px-4 py-3 text-base font-medium rounded-lg 
                  ${isPurchasing
                                    ? 'bg-secondary-200 text-secondary-500 dark:bg-secondary-700 dark:text-secondary-400 cursor-not-allowed'
                                    : 'bg-success-600 text-white hover:bg-success-700 dark:bg-success-600 dark:text-white dark:hover:bg-success-700'} 
                  transition-colors`}
                                aria-label={`Purchase ${product.name}`}
                            >
                                {isPurchasing ? (
                                    <>
                                        <svg
                                            className="animate-spin -ml-1 mr-2 h-5 w-5 text-white"
                                            fill="none" viewBox="0 0 24 24"
                                        >
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor"
                                                    strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor"
                                                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Processing...
                                    </>
                                ) : (
                                    <>
                                        <svg className="mr-2 w-5 h-5" fill="none" viewBox="0 0 24 24"
                                             stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                                  d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"/>
                                        </svg>
                                        Purchase Now
                                    </>
                                )}
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}