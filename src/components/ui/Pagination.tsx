import React from 'react';
import { Button } from './Button';

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
  // Calculate which page numbers to show
  const getPageNumbers = () => {
    const pageNumbers = [];
    const maxPagesToShow = 5;
    
    if (totalPages <= maxPagesToShow) {
      // Show all pages if there are fewer than maxPagesToShow
      for (let i = 0; i < totalPages; i++) {
        pageNumbers.push(i);
      }
    } else {
      // Always show first page
      pageNumbers.push(0);
      
      // Calculate start and end of page range to show
      let start = Math.max(1, currentPage - 1);
      let end = Math.min(start + 2, totalPages - 1);
      
      // Adjust start if end is maxed out
      if (end === totalPages - 1) {
        start = Math.max(1, end - 2);
      }
      
      // Add ellipsis after first page if needed
      if (start > 1) {
        pageNumbers.push(-1); // -1 represents ellipsis
      }
      
      // Add page numbers in the middle
      for (let i = start; i < end; i++) {
        pageNumbers.push(i);
      }
      
      // Add ellipsis before last page if needed
      if (end < totalPages - 1) {
        pageNumbers.push(-2); // -2 represents ellipsis
      }
      
      // Always show last page
      pageNumbers.push(totalPages - 1);
    }
    
    return pageNumbers;
  };

  if (totalPages <= 1) {
    return null; // Don't show pagination if there's only one page
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
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
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
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
          </svg>
        }
      >
        Prev
      </Button>
      
      <div className="flex space-x-1">
        {getPageNumbers().map((pageNumber, index) => {
          if (pageNumber < 0) {
            // Render ellipsis
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
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
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
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 5l7 7-7 7M5 5l7 7-7 7" />
          </svg>
        }
      >
        Last
      </Button>
    </div>
  );
};