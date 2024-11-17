import { ThemeProvider } from '@/components/theme-provider';
import './globals.css';

import { Poppins } from 'next/font/google';

const poppinFont = Poppins({
    subsets: ['latin'],
    weight: ['400', '500', '600', '700']
});

export default function RootLayout({
    children
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <body className={poppinFont.className}>
                <ThemeProvider
                    attribute="class"
                    defaultTheme="system"
                    enableSystem
                    disableTransitionOnChange
                >
                    {children}
                </ThemeProvider>
            </body>
        </html>
    );
}
