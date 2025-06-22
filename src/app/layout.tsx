import {KeycloakProvider} from '@/auth/KeycloakProvider';
import {Inter} from 'next/font/google';
import '../styles/globals.css';
import {ScrollToTop} from '@/components/utils/ScrollToTop';

const inter = Inter({
    subsets: ['latin'],
    display: 'swap',
    variable: '--font-inter',
});

export const metadata = {
    title: {
        template: '%s | Micro Market',
        default: 'Micro Market - Professional Marketplace',
    },
    description: 'A professional marketplace for micro products and services',
    keywords: ['marketplace', 'micro products', 'ecommerce', 'online shopping'],
    authors: [{name: 'Micro Market Team'}],
    creator: 'Micro Market',
    publisher: 'Micro Market',
    formatDetection: {
        email: false,
        address: false,
        telephone: false,
    },
    metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'),
    openGraph: {
        type: 'website',
        locale: 'en_US',
        url: '/',
        title: 'Micro Market - Professional Marketplace',
        description: 'A professional marketplace for micro products and services',
        siteName: 'Micro Market',
    },
    twitter: {
        card: 'summary_large_image',
        title: 'Micro Market - Professional Marketplace',
        description: 'A professional marketplace for micro products and services',
    },
    icons: {
        icon: '/favicon.ico',
        shortcut: '/favicon-16x16.png',
        apple: '/apple-touch-icon.png',
    },
    manifest: '/site.webmanifest',
};

export default function RootLayout({
                                       children,
                                   }: Readonly<{
    children: React.ReactNode
}>) {
    return (
        <html lang="en" className={`${inter.variable}`} suppressHydrationWarning>
        <head>
            <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=5.0"/>
            <meta name="theme-color" content="#0ea5e9"/>
            <link rel="apple-touch-icon" sizes="180x180" href="/globe-blue.svg"/>
            <link rel="icon" type="image/svg+xml" sizes="32x32" href="/globe-blue.svg"/>
            <link rel="icon" type="image/svg+xml" sizes="16x16" href="/globe-blue.svg"/>
            <link rel="manifest" href="/site.webmanifest"/>
            <title>Micro Market</title>
        </head>
        <body className="min-h-screen bg-secondary-50 dark:bg-secondary-950 font-sans antialiased">
        <KeycloakProvider>
            <ScrollToTop/>
            {children}
        </KeycloakProvider>
        </body>
        </html>
    )
}
