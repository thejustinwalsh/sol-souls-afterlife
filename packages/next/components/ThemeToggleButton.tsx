import { useTheme } from 'next-themes';
import React, { useCallback, useEffect, useState } from 'react';
import { Box } from './radix/Box';
import { Button } from './radix/Button';
import { SunIcon, MoonIcon } from '@radix-ui/react-icons';

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
    <Button style={{ minHeight: '50px', minWidth: '50px' }} onClick={toggleTheme}>
      <Box css={{ fontSize: '$7' }}>
        {resolvedTheme === 'dark' ? (
          <MoonIcon style={{ width: '20px', height: '20px' }} />
        ) : (
          <SunIcon style={{ width: '20px', height: '20px' }} />
        )}
      </Box>
    </Button>
  );
}
