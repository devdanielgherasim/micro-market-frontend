import Image from 'next/image';
import Link from 'next/link';
import React, {useState} from 'react';

import {Product} from '@/types';

import {Button} from '../../ui/Button';

interface AdminProductCardProps {
    product: Product;
    className?: string;
    onDelete?: (productId: string) => void;
    onEdit?: (product: Product) => void;
}

/**
 * Component for displaying a single product with admin actions
 */
export const AdminProductCard: React.FC<AdminProductCardProps> = ({
                                                                      product,
                                                                      className = '',
                                                                      onDelete,
                                                                      onEdit
                                                                  }) => {
    const [isDeleting, setIsDeleting] = useState(false);

    const imageUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(product.name)}&background=0D8ABC&color=fff&size=128&bold=true&format=svg`;

    const handleDelete = async () => {
        if (!onDelete) return;

        if (window.confirm(`Are you sure you want to delete ${product.name}?`)) {
            setIsDeleting(true);
            try {
                await onDelete(product.id);
            } finally {
                setIsDeleting(false);
            }
        }
    };

    const handleEdit = () => {
        if (onEdit) {
            onEdit(product);
        }
    };

    return (
        <div
            className={`border border-gray-200 dark:border-gray-700 rounded-xl p-3 sm:p-4 md:p-5 laptop:p-4 shadow-md hover:shadow-lg transition-all duration-300 dark:bg-gray-800 hover:translate-y-[-2px] flex flex-col ${className}`}>
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3 sm:mb-4 laptop:mb-3">
                <div className="flex items-start w-full">
                    <div
                        className="flex-shrink-0 mr-3 bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900/30 dark:to-blue-800/30 rounded-lg p-1.5 sm:p-2 w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 laptop:w-14 laptop:h-14 flex items-center justify-center shadow-sm">
                        <Image
                            src={imageUrl}
                            alt={product.name}
                            width={48}
                            height={48}
                            className="w-9 h-9 sm:w-10 sm:h-10 md:w-12 md:h-12 laptop:w-10 laptop:h-10 object-contain"
                        />
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start">
                            <h3 className="text-base sm:text-lg laptop:text-base font-semibold text-gray-900 dark:text-white truncate">{product.name}</h3>
                            <span
                                className="inline-flex items-center px-2 py-0.5 mt-1 sm:mt-0 rounded-full text-xs font-medium bg-gradient-to-r from-blue-100 to-blue-50 text-blue-800 dark:from-blue-900/50 dark:to-blue-800/50 dark:text-blue-200 border border-blue-200 dark:border-blue-800 whitespace-nowrap shadow-sm">
                                {product.category}
                            </span>
                        </div>
                        <p className="mt-1 text-xs sm:text-sm laptop:text-xs text-gray-600 dark:text-gray-300 line-clamp-2">{product.description}</p>
                    </div>
                </div>
            </div>

            <div
                className="flex flex-col gap-3 mt-3 pt-3 border-t border-gray-100 dark:border-gray-700 mt-auto">
                <div className="flex flex-row items-baseline gap-2">
                    <span
                        className="text-lg sm:text-xl laptop:text-lg font-bold text-gray-900 dark:text-white">${product.price.toFixed(2)}</span>
                    <span className={`text-xs sm:text-sm laptop:text-xs font-medium ${
                        product.isAvailable
                            ? 'text-green-600 dark:text-green-400'
                            : 'text-red-600 dark:text-red-400'
                    }`}>
                        {product.isAvailable ? (
                            <span className="flex items-center">
                                <svg className="w-3 h-3 sm:w-4 sm:h-4 laptop:w-3.5 laptop:h-3.5 mr-0.5 sm:mr-1" fill="currentColor"
                                     viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                                    <path fillRule="evenodd"
                                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                          clipRule="evenodd"/>
                                </svg>
                                In Stock
                            </span>
                        ) : (
                            <span className="flex items-center">
                                <svg className="w-3 h-3 sm:w-4 sm:h-4 laptop:w-3.5 laptop:h-3.5 mr-0.5 sm:mr-1" fill="currentColor"
                                     viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                                    <path fillRule="evenodd"
                                          d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                                          clipRule="evenodd"/>
                                </svg>
                                Out of Stock
                            </span>
                        )}
                    </span>
                </div>
                <div className="flex space-x-2 sm:space-x-3 laptop:space-x-2 mt-2">
                    <Link href={`/products/${product.id}`}>
                        <Button
                            variant="outline"
                            size="xs"
                            rounded="md"
                            className="transition-all duration-300 hover:scale-105 laptop:text-xs"
                            icon={
                                <svg className="w-3.5 h-3.5 laptop:w-3 laptop:h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                          d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                                </svg>
                            }
                        >
                            View
                        </Button>
                    </Link>

                    <Button
                        variant="primary"
                        size="xs"
                        rounded="md"
                        onClick={handleEdit}
                        className="transition-all duration-300 hover:scale-105 laptop:text-xs"
                        icon={
                            <svg className="w-3.5 h-3.5 laptop:w-3 laptop:h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                      d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"/>
                            </svg>
                        }
                    >
                        Edit
                    </Button>

                    <Button
                        variant="danger"
                        size="xs"
                        rounded="md"
                        isLoading={isDeleting}
                        onClick={handleDelete}
                        className="transition-all duration-300 hover:scale-105 laptop:text-xs"
                        icon={
                            <svg className="w-3.5 h-3.5 laptop:w-3 laptop:h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                            </svg>
                        }
                    >
                        Delete
                    </Button>
                </div>
            </div>
        </div>
    );
};
