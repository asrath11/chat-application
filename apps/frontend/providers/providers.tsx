'use client';

import React, { useState } from 'react';
import { ThemeProvider as NextThemesProvider } from 'next-themes';
import { Toaster } from '@workspace/ui/components/sonner';
import { AuthProvider } from '@/contexts/AuthContext';
import { WebSocketProvider } from '@/contexts/WebSocketContext';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());
  return (
    <QueryClientProvider client={queryClient}>
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
    </QueryClientProvider>
  );
}
