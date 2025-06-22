"use client";

import Link from 'next/link';
import React from 'react';

import {useAuth} from '@/auth/KeycloakProvider';
import {AdminOnly, AuthenticatedOnly, GuestOnly} from '@/components/auth/RoleBasedAccess';


interface NavItemProps {
    href: string;
    icon: React.ReactNode;
    label: string;
    isActive?: boolean;
    onClick?: () => void;
}

const NavItem: React.FC<NavItemProps> = ({href, icon, label, isActive = false, onClick}) => {
    const baseClasses = "group flex items-center w-full px-4 py-2.5 text-sm font-medium rounded-lg transition-all duration-200";
    const activeClasses = "bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300 shadow-sm";
    const inactiveClasses = "text-secondary-700 dark:text-secondary-300 hover:bg-secondary-100 dark:hover:bg-secondary-800/70 hover:text-primary-600 dark:hover:text-primary-400";

    return (
        <Link
            href={href}
            className={`${baseClasses} ${isActive ? activeClasses : inactiveClasses}`}
            onClick={onClick}
        >
      <span
          className={`flex items-center transition-transform duration-200 ${isActive ? 'text-primary-600 dark:text-primary-400' : 'text-secondary-500 dark:text-secondary-400 group-hover:text-primary-500 dark:group-hover:text-primary-400'}`}>
        {icon}
          <span className="ml-3">{label}</span>
      </span>
            {isActive && (
                <span className="ml-auto h-2 w-2 rounded-full bg-primary-500 dark:bg-primary-400"></span>
            )}
        </Link>
    );
};

interface RoleBasedNavigationProps {
    activeSection?: string;
    onNavigate?: (section: string) => void;
}

export const RoleBasedNavigation: React.FC<RoleBasedNavigationProps> = ({
                                                                            activeSection = 'dashboard',
                                                                            onNavigate
                                                                        }) => {
    const {isAuthenticated, login, logout} = useAuth();

    const handleNavigation = (section: string) => {
        if (onNavigate) {
            onNavigate(section);
        }
    };

    return (
        <nav className="flex flex-col space-y-1.5 w-full">
            <NavItem
                href="/products"
                icon={
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                              d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"></path>
                    </svg>
                }
                label="Products"
                isActive={activeSection === 'products'}
                onClick={() => handleNavigation('products')}
            />

            <AuthenticatedOnly>
                <NavItem
                    href="/orders"
                    icon={
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
                        </svg>
                    }
                    label="Orders"
                    isActive={activeSection === 'orders'}
                    onClick={() => handleNavigation('orders')}
                />
            </AuthenticatedOnly>

            <AdminOnly>
                <div className="mt-6 mb-2">
                    <h2 className="px-4 text-xs font-semibold text-secondary-500 dark:text-secondary-400 uppercase tracking-wider">
                        Administration
                    </h2>
                </div>

                <NavItem
                    href="/admin/products"
                    icon={
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                  d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                        </svg>
                    }
                    label="Manage Products"
                    isActive={activeSection === 'admin-products'}
                    onClick={() => handleNavigation('admin-products')}
                />

                <NavItem
                    href="/admin/audit"
                    icon={
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                        </svg>
                    }
                    label="Audit Logs"
                    isActive={activeSection === 'audit'}
                    onClick={() => handleNavigation('audit')}
                />
            </AdminOnly>

            <div className="mt-6 mb-2">
                <h2 className="px-4 mt-6 text-xs font-semibold text-secondary-500 dark:text-secondary-400 uppercase tracking-wider">
                    Account
                </h2>
            </div>

            {isAuthenticated ? (
                <button
                    onClick={() => logout()}
                    className="group flex items-center w-full px-4 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 text-secondary-700 dark:text-secondary-300 hover:bg-secondary-100 dark:hover:bg-secondary-800/70 hover:text-danger-600 dark:hover:text-danger-400"
                >
          <span
              className="flex items-center text-secondary-500 dark:text-secondary-400 group-hover:text-danger-500 dark:group-hover:text-danger-400">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                    d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path>
            </svg>
            <span className="ml-3">Logout</span>
          </span>
                </button>
            ) : (
                <GuestOnly>
                    <button
                        onClick={() => login()}
                        className="group flex items-center w-full px-4 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 text-secondary-700 dark:text-secondary-300 hover:bg-secondary-100 dark:hover:bg-secondary-800/70 hover:text-primary-600 dark:hover:text-primary-400"
                    >
            <span
                className="flex items-center text-secondary-500 dark:text-secondary-400 group-hover:text-primary-500 dark:group-hover:text-primary-400">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                      d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"></path>
              </svg>
              <span className="ml-3">Login</span>
            </span>
                    </button>
                </GuestOnly>
            )}
        </nav>
    );
};
