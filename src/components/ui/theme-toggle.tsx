'use client';

import React, { useEffect, useState } from 'react';
import { Moon, Sun } from 'lucide-react';
import { Button } from './button';

type ThemeMode = 'light' | 'dark' | 'system';

function getSystemPrefersDark(): boolean {
  if (typeof window === 'undefined') return false;
  return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
}

function applyThemeClass(theme: ThemeMode) {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;
  const body = document.body;
  const isDark = theme === 'dark' || (theme === 'system' && getSystemPrefersDark());
  
  // Apply to both document element and body
  root.classList.toggle('dark', isDark);
  body.classList.toggle('dark', isDark);
  
  // Set theme ready flag
  root.setAttribute('data-theme-ready', 'true');
  
  console.log('Theme applied:', { theme, isDark, rootClasses: root.className, bodyClasses: body.className });
}

export default function ThemeToggle() {
  const [theme, setTheme] = useState<ThemeMode>('system');
  const [mounted, setMounted] = useState(false);
  const [dataReady, setDataReady] = useState(false);

  useEffect(() => {
    const saved = (typeof window !== 'undefined' && (localStorage.getItem('theme') as ThemeMode)) || 'system';
    setTheme(saved);
    setMounted(true);
    
    // Wait a bit for theme to be loaded
    const timer = setTimeout(() => {
      setDataReady(true);
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    applyThemeClass(theme);
    if (typeof window !== 'undefined') {
      localStorage.setItem('theme', theme);
    }
  }, [theme, mounted]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const media = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = () => {
      if (theme === 'system') applyThemeClass('system');
    };
    media.addEventListener('change', handler);
    return () => media.removeEventListener('change', handler);
  }, [theme]);

  // Return a placeholder during SSR to prevent hydration mismatch
  if (!mounted || !dataReady) {
    return (
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          aria-label="Toggle theme"
          className="h-9 w-9"
          disabled
        >
          <div className="h-4 w-4" />
        </Button>
      </div>
    );
  }

  const isDark = theme === 'dark' || (theme === 'system' && getSystemPrefersDark());

  return (
    <div className="flex items-center gap-2">
      <Button
        variant="ghost"
        size="icon"
        aria-label="Toggle theme"
        onClick={() => setTheme(isDark ? 'light' : 'dark')}
        className="h-9 w-9"
      >
        {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
      </Button>
    </div>
  );
}


