import React, { useEffect, useState } from 'react';
import { Sidebar } from './Sidebar';

// Header component
const Header: React.FC<{
  toggleSidebar: () => void;
  scrolled: boolean;
  theme: 'light' | 'dark';
  toggleTheme: () => void;
}> = ({ toggleSidebar, scrolled, theme, toggleTheme }) => (
  <header
    className={`sticky top-0 bg-white/90 dark:bg-secondary-900/95 backdrop-blur-md z-30 transition-all duration-200 ${
      scrolled ? 'shadow-glass dark:shadow-black/40' : 'shadow-soft dark:shadow-black/30'
    }`}
  >
    <div className="container mx-auto px-4 sm:px-6 flex items-center justify-between h-16 sm:h-18 md:h-20">
      <div className="flex items-center">
        <button
          type="button"
          className="text-secondary-500 dark:text-secondary-400 hover:text-secondary-700 dark:hover:text-secondary-200 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500 lg:hidden p-2 rounded-full hover:bg-secondary-100 dark:hover:bg-secondary-800 transition-all duration-200 transform active:scale-95"
          onClick={toggleSidebar}
          aria-label="Open sidebar"
        >
          <svg className="h-5 w-5 sm:h-6 sm:w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        <div className="flex items-center flex-shrink-0 ml-2 sm:ml-4 lg:ml-0">
          <div className="flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-primary-500 to-primary-700 rounded-xl shadow-glow dark:shadow-primary-500/20">
            <svg className="h-5 w-5 sm:h-6 sm:w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <h1 className="ml-3 sm:ml-4 text-lg sm:text-xl md:text-2xl font-bold text-secondary-900 dark:text-white truncate">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary-600 to-primary-500 dark:from-primary-400 dark:to-primary-300">
              Micro
            </span>
            <span>Market</span>
          </h1>
        </div>
      </div>
      <div className="flex items-center space-x-3 sm:space-x-4">
        <HeaderButton
          onClick={toggleTheme}
          ariaLabel="Toggle theme"
        >
          {theme === 'light' ? (
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
              />
            </svg>
          ) : (
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
              />
            </svg>
          )}
        </HeaderButton>
        <HeaderButton
          ariaLabel="View notifications"
          hasNotification
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
            />
          </svg>
        </HeaderButton>
        <div className="relative">
          <button
            type="button"
            className="flex items-center rounded-full bg-gradient-to-r from-primary-500 to-primary-600 p-0.5 sm:p-1 text-sm focus:outline-none focus:ring-2 focus:ring-primary-400 focus:ring-offset-2 transition-all duration-300 hover:scale-105 shadow-glow"
            aria-label="Open user menu"
          >
            <div className="h-7 w-7 sm:h-8 sm:w-8 md:h-9 md:w-9 rounded-full flex items-center justify-center text-white font-medium bg-gradient-to-br from-primary-400/50 to-primary-600/50 shadow-inner overflow-hidden">
              <span className="text-lg sm:text-xl font-bold">M</span>
            </div>
          </button>
        </div>
      </div>
    </div>
  </header>
);

// Header button component
const HeaderButton: React.FC<{
  onClick?: () => void;
  ariaLabel: string;
  hasNotification?: boolean;
  children: React.ReactNode;
}> = ({ onClick, ariaLabel, hasNotification = false, children }) => (
  <button
    type="button"
    className="relative rounded-full bg-white/80 dark:bg-secondary-800/80 p-2.5 text-secondary-500 dark:text-secondary-300 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-white dark:hover:bg-secondary-700 focus:outline-none focus:ring-2 focus:ring-primary-400 transition-all duration-200 shadow-soft dark:shadow-black/20 transform hover:scale-105"
    onClick={onClick}
    aria-label={ariaLabel}
  >
    {hasNotification && (
      <span className="absolute top-0 right-0 h-2.5 w-2.5 bg-primary-500 rounded-full animate-pulse-slow"></span>
    )}
    {children}
  </button>
);

// Mobile sidebar component
const MobileSidebar: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  activeSection: string;
  onNavigate: (section: string) => void;
  isMobile: boolean;
}> = ({ isOpen, onClose, activeSection, onNavigate, isMobile }) => (
  <div
    className={`fixed inset-0 z-40 lg:hidden transition-all duration-300 ease-in-out ${
      isOpen ? 'opacity-100 backdrop-blur-md' : 'opacity-0 pointer-events-none backdrop-blur-none'
    }`}
    role="dialog"
    aria-modal="true"
  >
    <div
      className="fixed inset-0 bg-secondary-600/50 dark:bg-secondary-900/70 transition-opacity"
      aria-hidden="true"
      onClick={onClose}
    ></div>
    <div
      className={`relative flex-1 flex flex-col max-w-xs w-[85%] sm:w-[320px] bg-white dark:bg-secondary-900 shadow-2xl rounded-r-2xl transform transition-all duration-300 ease-in-out ${
        isOpen ? 'translate-x-0 animate-fade-in' : '-translate-x-full'
      }`}
    >
      <div className="absolute top-4 right-4 z-10">
        <button
          type="button"
          className="flex items-center justify-center h-9 w-9 rounded-full bg-white/90 dark:bg-secondary-800/90 shadow-lg dark:shadow-black/30 focus:outline-none focus:ring-2 focus:ring-primary-400 transition-all duration-200 transform hover:scale-105 active:scale-95"
          onClick={onClose}
          aria-label="Close sidebar"
        >
          <span className="sr-only">Close sidebar</span>
          <svg className="h-5 w-5 text-secondary-500 dark:text-secondary-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      <Sidebar
        activeSection={activeSection}
        onNavigate={(section) => {
          onNavigate(section);
          if (isMobile) {
            onClose();
          }
        }}
      />
    </div>
  </div>
);

// Footer component
const Footer: React.FC = () => (
  <footer className="bg-white/90 dark:bg-secondary-900/90 backdrop-blur-sm border-t border-secondary-200/70 dark:border-secondary-800/30 mt-auto">
    <div className="container mx-auto py-3 sm:py-4 md:py-5 px-4 sm:px-6">
      <div className="flex flex-col sm:flex-row items-center justify-between">
        <p className="text-center text-sm text-secondary-500 dark:text-secondary-400">
          &copy; {new Date().getFullYear()}{' '}
          <span className="text-primary-600 dark:text-primary-400 font-medium">Micro Market</span>. All rights reserved.
        </p>
        <div className="mt-2 sm:mt-0 flex space-x-4">
          <a
            href="#"
            className="text-secondary-400 hover:text-primary-500 dark:text-secondary-500 dark:hover:text-primary-400 transition-colors"
          >
            <span className="sr-only">Privacy Policy</span>
            <span className="text-xs">Privacy</span>
          </a>
          <a
            href="#"
            className="text-secondary-400 hover:text-primary-500 dark:text-secondary-500 dark:hover:text-primary-400 transition-colors"
          >
            <span className="sr-only">Terms of Service</span>
            <span className="text-xs">Terms</span>
          </a>
        </div>
      </div>
    </div>
  </footer>
);

// Main DashboardLayout component
interface DashboardLayoutProps {
  children: React.ReactNode;
  activeSection?: string;
  onNavigate?: (section: string) => void;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({
  children,
  activeSection = 'dashboard',
  onNavigate,
}) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    // Check if mobile
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };

    // Handle scroll
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };

    // Check theme preference
    const checkTheme = () => {
      if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        setTheme('dark');
        document.documentElement.classList.add('dark');
      } else {
        setTheme('light');
        document.documentElement.classList.remove('dark');
      }
    };

    // Initial checks
    checkIfMobile();
    handleScroll();
    checkTheme();

    // Debounced resize handler
    let resizeTimer: NodeJS.Timeout;
    const handleResize = () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(checkIfMobile, 100);
    };

    // Debounced scroll handler
    let scrollTimer: NodeJS.Timeout;
    const handleScrollDebounced = () => {
      clearTimeout(scrollTimer);
      scrollTimer = setTimeout(handleScroll, 50);
    };

    // Add event listeners
    window.addEventListener('resize', handleResize);
    window.addEventListener('scroll', handleScrollDebounced);

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('scroll', handleScrollDebounced);
      clearTimeout(resizeTimer);
      clearTimeout(scrollTimer);
    };
  }, []);

  // Toggle sidebar
  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  // Toggle theme
  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  // Handle navigation
  const handleNavigate = (section: string) => {
    if (onNavigate) {
      onNavigate(section);
    }
  };

  return (
    <div className="min-h-screen bg-secondary-50 dark:bg-secondary-950 flex flex-col">
      {/* Header */}
      <Header
        toggleSidebar={toggleSidebar}
        scrolled={scrolled}
        theme={theme}
        toggleTheme={toggleTheme}
      />

      {/* Main content */}
      <div className="flex flex-1">
        {/* Mobile sidebar */}
        <MobileSidebar
          isOpen={sidebarOpen}
          onClose={toggleSidebar}
          activeSection={activeSection}
          onNavigate={handleNavigate}
          isMobile={isMobile}
        />

        {/* Static sidebar for desktop */}
        <div className="hidden lg:flex lg:flex-shrink-0">
          <div className="flex flex-col w-64 xl:w-72 2xl:w-80">
            <div className="flex flex-col flex-grow border-r border-secondary-200 dark:border-secondary-800/50 pt-4 pb-4 overflow-y-auto bg-white/95 dark:bg-secondary-900/95 backdrop-blur-sm shadow-soft dark:shadow-black/20">
              <Sidebar activeSection={activeSection} onNavigate={handleNavigate} />
            </div>
          </div>
        </div>

        {/* Main content area */}
        <div className="flex flex-col flex-1">
          <main className="flex-1 relative overflow-y-auto focus:outline-none">
            <div className="py-4 sm:py-6 md:py-8">
              <div className="container mx-auto px-4 sm:px-6">
                {children}
              </div>
            </div>
          </main>

          {/* Footer */}
          <Footer />
        </div>
      </div>
    </div>
  );
};
