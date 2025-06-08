import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'success' | 'danger' | 'outline' | 'glass';
  size?: 'xs' | 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  fullWidth?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  rounded?: 'none' | 'sm' | 'md' | 'lg' | 'full';
}

/**
 * Enhanced Button component with different variants, sizes, and responsive design
 */
export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  fullWidth = false,
  icon,
  iconPosition = 'left',
  rounded = 'md',
  disabled,
  className = '',
  ...props
}) => {
  // Base classes
  const baseClasses = 'inline-flex items-center justify-center font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-gray-900 shadow-sm hover:shadow';

  // Size classes - adjusted for better touch targets on mobile
  const sizeClasses = {
    xs: 'px-2.5 py-1.5 text-xs sm:px-2 sm:py-1',
    sm: 'px-3.5 py-2 text-sm sm:px-3 sm:py-1.5',
    md: 'px-4.5 py-2.5 text-base sm:px-4 sm:py-2',
    lg: 'px-6.5 py-3.5 text-lg sm:px-6 sm:py-3',
  };

  // Rounded corner classes
  const roundedClasses = {
    none: 'rounded-none',
    sm: 'rounded-sm',
    md: 'rounded-md',
    lg: 'rounded-lg',
    full: 'rounded-full',
  };

  // Variant classes with improved hover and active states
  const variantClasses = {
    primary: 'bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700 hover:translate-y-[-1px] active:translate-y-[0px] focus:ring-blue-500 disabled:opacity-70 disabled:from-blue-400 disabled:to-blue-500 dark:from-blue-600 dark:to-blue-700 dark:hover:from-blue-700 dark:hover:to-blue-800 dark:disabled:from-blue-700/60 dark:disabled:to-blue-800/60',
    secondary: 'bg-gray-200 text-gray-800 hover:bg-gray-300 hover:translate-y-[-1px] active:translate-y-[0px] focus:ring-gray-500 disabled:opacity-70 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600 dark:focus:ring-gray-400 dark:disabled:bg-gray-800/70',
    success: 'bg-gradient-to-r from-green-500 to-green-600 text-white hover:from-green-600 hover:to-green-700 hover:translate-y-[-1px] active:translate-y-[0px] focus:ring-green-500 disabled:opacity-70 dark:from-green-600 dark:to-green-700 dark:hover:from-green-700 dark:hover:to-green-800 dark:disabled:from-green-700/60 dark:disabled:to-green-800/60',
    danger: 'bg-gradient-to-r from-red-500 to-red-600 text-white hover:from-red-600 hover:to-red-700 hover:translate-y-[-1px] active:translate-y-[0px] focus:ring-red-500 disabled:opacity-70 dark:from-red-600 dark:to-red-700 dark:hover:from-red-700 dark:hover:to-red-800 dark:disabled:from-red-700/60 dark:disabled:to-red-800/60',
    outline: 'bg-transparent border border-gray-300 text-gray-700 hover:bg-gray-50 hover:translate-y-[-1px] active:translate-y-[0px] focus:ring-gray-500 disabled:opacity-70 disabled:text-gray-400 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800 dark:focus:ring-gray-500 dark:disabled:bg-transparent dark:disabled:text-gray-600',
    glass: 'bg-white/80 backdrop-blur-sm border border-white/20 text-gray-800 hover:bg-white/90 hover:translate-y-[-1px] active:translate-y-[0px] focus:ring-gray-300 disabled:opacity-70 dark:bg-gray-800/80 dark:border-gray-700/30 dark:text-gray-200 dark:hover:bg-gray-800/90 dark:focus:ring-gray-600 dark:disabled:bg-gray-800/50 dark:disabled:text-gray-500',
  };

  // Width classes
  const widthClasses = fullWidth ? 'w-full' : '';

  // Loading spinner size based on button size
  const spinnerSize = {
    xs: 'h-3 w-3',
    sm: 'h-3.5 w-3.5',
    md: 'h-4 w-4',
    lg: 'h-5 w-5',
  };

  // Combine classes
  const buttonClasses = `
    ${baseClasses}
    ${sizeClasses[size]}
    ${roundedClasses[rounded]}
    ${variantClasses[variant]}
    ${isLoading || disabled ? 'cursor-not-allowed transform-none' : ''}
    ${widthClasses}
    ${className}
  `;

  return (
    <button
      className={buttonClasses}
      disabled={isLoading || disabled}
      {...props}
    >
      {isLoading ? (
        <div className="flex items-center justify-center">
          <svg 
            className={`animate-spin ${iconPosition === 'left' ? '-ml-1 mr-2' : 'ml-2 -mr-1 order-2'} ${spinnerSize[size]} text-current`} 
            xmlns="http://www.w3.org/2000/svg" 
            fill="none" 
            viewBox="0 0 24 24"
          >
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span className={iconPosition === 'right' ? 'order-1' : ''}>Loading...</span>
        </div>
      ) : (
        <>
          {icon && iconPosition === 'left' && <span className="mr-2 flex-shrink-0">{icon}</span>}
          <span className="flex-1 truncate">{children}</span>
          {icon && iconPosition === 'right' && <span className="ml-2 flex-shrink-0">{icon}</span>}
        </>
      )}
    </button>
  );
};
