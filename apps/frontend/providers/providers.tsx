'use client';

import * as React from 'react';
import { ThemeProvider as NextThemesProvider } from 'next-themes';
import { Toaster } from '@workspace/ui/components/sonner';
import { AuthProvider } from '@/contexts/AuthContext';
import { WebSocketProvider } from '@/contexts/WebSocketContext';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <NextThemesProvider
      attribute='class'
      defaultTheme='system'
      enableSystem
      disableTransitionOnChange
      enableColorScheme
    >
      <AuthProvider>
        <WebSocketProvider>
          {children}
          <Toaster position='top-right' richColors />
        </WebSocketProvider>
      </AuthProvider>
    </NextThemesProvider>
  );
}
