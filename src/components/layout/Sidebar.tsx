import React from 'react';

import {RoleBasedNavigation} from './RoleBasedNavigation';

interface SidebarProps {
    className?: string;
    activeSection?: string;
    onNavigate?: (section: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
                                                    className = '',
                                                    activeSection = 'dashboard',
                                                    onNavigate
                                                }) => {
    return (
        <div className={`bg-white dark:bg-secondary-900 h-full flex flex-col ${className}`}>
            <div
                className="lg:hidden flex items-center justify-center py-4 border-b border-secondary-200 dark:border-secondary-800/50">
                <div className="flex items-center space-x-2">
                    <div
                        className="flex items-center justify-center w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-700 rounded-xl shadow-glow dark:shadow-primary-500/20">
                        <svg className="h-5 w-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                  d="M13 10V3L4 14h7v7l9-11h-7z"/>
                        </svg>
                    </div>
                    <h1 className="text-xl font-bold text-secondary-900 dark:text-white">
                        <span
                            className="bg-clip-text text-transparent bg-gradient-to-r from-primary-600 to-primary-500 dark:from-primary-400 dark:to-primary-300">Micro</span>
                        <span>Market</span>
                    </h1>
                </div>
            </div>

            <div
                className="flex-1 overflow-y-auto py-2 sm:py-3 md:py-4 scrollbar-thin scrollbar-thumb-secondary-300 dark:scrollbar-thumb-secondary-700 scrollbar-track-transparent">
                <div className="px-2 sm:px-3 md:px-4 pb-2 sm:pb-3 md:pb-4">
                    <div className="mb-2 sm:mb-3 md:mb-4">
                        <h2 className="px-3 sm:px-4 text-xs font-semibold text-secondary-500 dark:text-secondary-400 uppercase tracking-wider">
                            Main
                        </h2>
                    </div>
                    <RoleBasedNavigation activeSection={activeSection} onNavigate={onNavigate}/>
                </div>
            </div>

        </div>
    );
};
