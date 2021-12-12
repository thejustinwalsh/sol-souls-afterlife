import { useTheme } from 'next-themes';
import React, { useCallback, useEffect, useState } from 'react';
import { Box } from './Box';
import { Button } from './Button';

export function ThemeToggleButton() {
  const [mounted, setMounted] = useState(false);
  const { setTheme, resolvedTheme } = useTheme();

  useEffect(() => setMounted(true), []);

  const toggleTheme = useCallback(() => {
    const targetTheme = resolvedTheme === 'light' ? 'dark' : 'light';
    setTheme(targetTheme);
  }, [resolvedTheme, setTheme]);

  if (!mounted) return null;
  return (
    <Button style={{ minHeight: '50px' }} onClick={toggleTheme}>
      <Box css={{ fontSize: '$7' }}>{resolvedTheme === 'dark' ? '🌞' : '🌚'}</Box>
    </Button>
  );
}
