'use client';

import * as React from 'react';
import { ThemeProvider as NextThemesProvider } from 'next-themes';
import type { ThemeProviderProps } from 'next-themes';

export const themes = [
  {
    value: 'dark',
    label: 'Default',
    color: 'hsl(240 10% 4%)',
    accentColor: 'hsl(252 100% 75%)'
  },
  {
    value: 'purple',
    label: 'Void Eternal',
    color: 'hsl(250 20% 5%)',
    accentColor: 'hsl(252 95% 70%)'
  },
  {
    value: 'blue',
    label: 'Freljord Frost',
    color: 'hsl(215 30% 4%)',
    accentColor: 'hsl(210 100% 65%)'
  },
  {
    value: 'green',
    label: 'Chemtech',
    color: 'hsl(150 25% 5%)',
    accentColor: 'hsl(142 70% 50%)'
  },
  {
    value: 'red',
    label: 'Darkin Blade',
    color: 'hsl(345 25% 5%)',
    accentColor: 'hsl(346 90% 60%)'
  },
  {
    value: 'cyan',
    label: 'Hextech',
    color: 'hsl(185 25% 5%)',
    accentColor: 'hsl(185 90% 50%)'
  },
  {
    value: 'rose',
    label: 'Spirit Bloom',
    color: 'hsl(320 25% 5%)',
    accentColor: 'hsl(320 90% 65%)'
  },
  {
    value: 'orange',
    label: 'Ascended',
    color: 'hsl(20 25% 5%)',
    accentColor: 'hsl(24 95% 60%)'
  },
  {
    value: 'light',
    label: 'Divine',
    color: 'hsl(0 0% 100%)',
    accentColor: 'hsl(252 100% 70%)'
  },
  {
    value: 'system',
    label: 'System',
    color: 'hsl(0 0% 100%)',
    accentColor: 'hsl(252 100% 70%)'
  }
] as const;

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      themes={themes.map(t => t.value)}
      {...props}
    >
      {children}
    </NextThemesProvider>
  );
} 