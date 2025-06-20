'use client';

import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';

export function useThemeClient() {
    const [mounted, setMounted] = useState(false);
    const theme = useTheme();

    useEffect(() => {
        setMounted(true);
    }, []);

    return {
        ...theme,
        mounted
    };
} 