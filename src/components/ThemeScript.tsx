"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export function ThemeScript() {
  const [mounted, setMounted] = useState(false);
  const { resolvedTheme } = useTheme();

  useEffect(() => {
    setMounted(true);
  }, []);

  // Only render script after mounted on client
  if (!mounted) return null;

  // Add/remove dark class based on theme
  if (typeof window !== "undefined") {
    const root = window.document.documentElement;
    root.classList.remove("light", "dark");
    if (resolvedTheme) {
      root.classList.add(resolvedTheme);
    }
  }

  return null;
} 