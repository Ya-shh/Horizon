"use client";

import { SessionProvider } from "next-auth/react";
import { Toaster } from 'react-hot-toast';
import ParallaxProvider from "./ParallaxProvider";
import { AnimatePresence } from "framer-motion";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <ParallaxProvider>
        <AnimatePresence mode="wait">
          <div key="main-content">{children}</div>
          <Toaster 
            position="bottom-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: 'var(--background)',
                color: 'var(--foreground)',
                border: '1px solid var(--border)',
              },
              success: {
                icon: '🎉',
                style: {
                  borderLeft: '4px solid var(--primary)',
                },
              },
              error: {
                icon: '❌',
                style: {
                  borderLeft: '4px solid var(--destructive)',
                },
              },
            }}
          />
        </AnimatePresence>
      </ParallaxProvider>
    </SessionProvider>
  );
} 