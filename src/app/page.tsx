'use client';

import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';

export default function Home() {
    const [mounted, setMounted] = useState(false);
    const { theme, resolvedTheme } = useTheme();

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) {
        return <div>Carregando...</div>;
    }

    return (
        <div>
            <h1 className="text-2xl font-bold">Bem-vindo ao Sistema Financeiro!</h1>
        </div>
    );
}
