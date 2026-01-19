import "./globals.css";
import '@mantine/core/styles.css';
import '@mantine/dates/styles.css';
import '@mantine/notifications/styles.css';

import { ColorSchemeScript, MantineProvider } from '@mantine/core';
import { Notifications } from '@mantine/notifications';
import { theme } from '../theme';
import { AuthProvider } from '@/context/AuthContext';

export const metadata = {
  title: 'CoreTime - Pilates Studio Management',
  description: 'Smart studio management for owners and instructors',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <ColorSchemeScript />
        <link rel="stylesheet" as="style" crossOrigin="anonymous" href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/static/pretendard.min.css" />
      </head>
      <body>
        <MantineProvider theme={theme}>
          <Notifications />
          <AuthProvider>
            {children}
          </AuthProvider>
        </MantineProvider>
      </body>
    </html>
  );
}
