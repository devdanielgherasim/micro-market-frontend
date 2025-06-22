import React from 'react';

import {Button} from './Button';

interface PaginationProps {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
    isLoading?: boolean;
    className?: string;
}

/**
 * Pagination component for navigating between pages
 */
export const Pagination: React.FC<PaginationProps> = ({
                                                          currentPage,
                                                          totalPages,
                                                          onPageChange,
                                                          isLoading = false,
                                                          className = '',
                                                      }) => {
    const getPageNumbers = () => {
        const pageNumbers = [];
        const maxPagesToShow = 5;

        if (totalPages <= maxPagesToShow) {
            for (let i = 0; i < totalPages; i++) {
                pageNumbers.push(i);
            }
        } else {
            pageNumbers.push(0);

            let start = Math.max(1, currentPage - 1);
            const end = Math.min(start + 2, totalPages - 1);

            if (end === totalPages - 1) {
                start = Math.max(1, end - 2);
            }

            if (start > 1) {
                pageNumbers.push(-1);
            }

            for (let i = start; i < end; i++) {
                pageNumbers.push(i);
            }

            if (end < totalPages - 1) {
                pageNumbers.push(-2);
            }

            pageNumbers.push(totalPages - 1);
        }

        return pageNumbers;
    };

    if (totalPages <= 1) {
        return null;
    }

    return (
        <div className={`flex items-center justify-center space-x-2 ${className}`}>
            <Button
                variant="outline"
                size="xs"
                rounded="md"
                disabled={currentPage === 0 || isLoading}
                onClick={() => onPageChange(0)}
                className="hidden sm:flex"
                icon={
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                              d="M11 19l-7-7 7-7m8 14l-7-7 7-7"/>
                    </svg>
                }
            >
                First
            </Button>

            <Button
                variant="outline"
                size="xs"
                rounded="md"
                disabled={currentPage === 0 || isLoading}
                onClick={() => onPageChange(currentPage - 1)}
                icon={
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"/>
                    </svg>
                }
            >
                Prev
            </Button>

            <div className="flex space-x-1">
                {getPageNumbers().map((pageNumber, index) => {
                    if (pageNumber < 0) {
                        return (
                            <span key={`ellipsis-${index}`} className="px-2 py-1 text-gray-500">
                ...
              </span>
                        );
                    }

                    return (
                        <Button
                            key={`page-${pageNumber}`}
                            variant={pageNumber === currentPage ? "primary" : "outline"}
                            size="xs"
                            rounded="md"
                            disabled={isLoading}
                            onClick={() => onPageChange(pageNumber)}
                            className="min-w-[32px]"
                        >
                            {pageNumber + 1}
                        </Button>
                    );
                })}
            </div>

            <Button
                variant="outline"
                size="xs"
                rounded="md"
                disabled={currentPage === totalPages - 1 || isLoading}
                onClick={() => onPageChange(currentPage + 1)}
                icon={
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"/>
                    </svg>
                }
            >
                Next
            </Button>

            <Button
                variant="outline"
                size="xs"
                rounded="md"
                disabled={currentPage === totalPages - 1 || isLoading}
                onClick={() => onPageChange(totalPages - 1)}
                className="hidden sm:flex"
                icon={
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                              d="M13 5l7 7-7 7M5 5l7 7-7 7"/>
                    </svg>
                }
            >
                Last
            </Button>
        </div>
    );
};