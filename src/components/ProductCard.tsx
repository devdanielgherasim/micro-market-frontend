import Image from 'next/image';
import Link from 'next/link';
import React, {useState} from 'react';

import {useAuth} from '@/auth/KeycloakProvider';
import {isClient} from '@/auth/roleUtils';
import {purchaseProduct} from '@/services/orderService';
import {Product} from '@/types';

interface ProductCardProps {
    product: Product;
    className?: string;
}

export const ProductCard: React.FC<ProductCardProps> = ({product, className = ''}) => {
    const imageUrl = product.imageUrl || '/placeholder-product.jpg';
    const {userProfile, isAuthenticated} = useAuth();
    const [isPurchasing, setIsPurchasing] = useState(false);
    const [purchaseError, setPurchaseError] = useState<string | null>(null);
    const [purchaseSuccess, setPurchaseSuccess] = useState(false);

    const handlePurchase = async () => {
        if (!isAuthenticated || !userProfile?.id) {
            setPurchaseError('You must be logged in to purchase products');
            return;
        }

        if (!product.available) {
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

    return (
        <article
            className={`group bg-white dark:bg-secondary-800 rounded-xl shadow-card dark:shadow-secondary-900/20 overflow-hidden transition-all duration-300 hover:shadow-card-hover dark:hover:shadow-secondary-900/30 hover:translate-y-[-3px] ${className}`}
        >
            <div
                className="relative h-48 sm:h-52 md:h-56 w-full bg-secondary-100 dark:bg-secondary-700/50 overflow-hidden">
                <Image
                    src={imageUrl}
                    alt={product.name}
                    fill
                    style={{objectFit: 'cover'}}
                    className="transition-all duration-500 opacity-0 group-hover:scale-105"
                    onLoadingComplete={(image) => image.classList.remove('opacity-0')}
                    sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                    priority={false}
                />

                {/* Stock badge */}
                {!product.available ? (
                    <div
                        className="absolute top-2 right-2 bg-danger-500 text-white text-xs font-bold px-2 py-1 rounded-md shadow-sm animate-fade-in"
                        aria-label="Product unavailable">
                        Out of Stock
                    </div>
                ) : (
                    <div
                        className="absolute top-2 right-2 bg-success-500 text-white text-xs font-bold px-2 py-1 rounded-md shadow-sm animate-fade-in"
                        aria-label="Product in stock">
                        In Stock
                    </div>
                )}

                {/* Price tag */}
                <div
                    className="absolute bottom-2 left-2 bg-white/90 dark:bg-secondary-800/90 backdrop-blur-sm text-primary-600 dark:text-primary-400 font-bold px-2 py-1 rounded-md shadow-sm"
                    aria-label={`Price: ${product.price.toFixed(2)} dollars`}>
                    <span aria-hidden="true" className="text-secondary-500 dark:text-secondary-400">$</span>
                    {product.price.toFixed(2)}
                </div>
            </div>

            <div className="p-4 sm:p-5">
                <div className="mb-2">
                    <div className="flex justify-between items-start">
                        <h3 className="text-lg font-semibold text-secondary-900 dark:text-white truncate group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                            {product.name}
                        </h3>
                    </div>

                    <div className="mt-1 flex items-center">
            <span
                className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-secondary-100 text-secondary-800 dark:bg-secondary-700 dark:text-secondary-300 transition-colors">
              {product.category}
            </span>
                    </div>
                </div>

                <p className="text-sm text-secondary-500 dark:text-secondary-400 line-clamp-2 mb-4 h-10">
                    {product.description}
                </p>

                {/* Purchase status messages */}
                {purchaseError && (
                    <div
                        className="mb-3 p-2 text-xs text-red-700 bg-red-100 dark:bg-red-900/20 dark:text-red-400 rounded-md">
                        {purchaseError}
                    </div>
                )}

                {purchaseSuccess && (
                    <div
                        className="mb-3 p-2 text-xs text-green-700 bg-green-100 dark:bg-green-900/20 dark:text-green-400 rounded-md">
                        Product purchased successfully!
                    </div>
                )}

                <div className="flex flex-col space-y-2">
                    <Link
                        href={`/products/${product.id}`}
                        className="inline-flex items-center justify-center w-full px-4 py-2 text-sm font-medium rounded-lg bg-primary-50 dark:bg-primary-900/10 text-primary-600 dark:text-primary-400 hover:bg-primary-100 dark:hover:bg-primary-900/20 transition-colors"
                        aria-label={`View details for ${product.name}`}
                    >
                        View Details
                        <svg className="ml-1 w-4 h-4 transition-transform group-hover:translate-x-1" fill="none"
                             viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                  d="M14 5l7 7m0 0l-7 7m7-7H3"/>
                        </svg>
                    </Link>

                    {/* Purchase button - only show for authenticated clients and if product is in stock */}
                    {isAuthenticated && isClient(userProfile) && product.available && (
                        <button
                            onClick={handlePurchase}
                            disabled={isPurchasing}
                            className={`inline-flex items-center justify-center w-full px-4 py-2 text-sm font-medium rounded-lg 
                ${isPurchasing
                                ? 'bg-secondary-200 text-secondary-500 dark:bg-secondary-700 dark:text-secondary-400 cursor-not-allowed'
                                : 'bg-success-50 text-success-700 hover:bg-success-100 dark:bg-success-900/10 dark:text-success-400 dark:hover:bg-success-900/20'} 
                transition-colors`}
                            aria-label={`Purchase ${product.name}`}
                        >
                            {isPurchasing ? (
                                <>
                                    <svg
                                        className="animate-spin -ml-1 mr-2 h-4 w-4 text-secondary-500 dark:text-secondary-400"
                                        fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor"
                                                strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor"
                                              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Processing...
                                </>
                            ) : (
                                <>
                                    <svg className="mr-1 w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                              d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"/>
                                    </svg>
                                    Purchase
                                </>
                            )}
                        </button>
                    )}
                </div>
            </div>
        </article>
    );
};
