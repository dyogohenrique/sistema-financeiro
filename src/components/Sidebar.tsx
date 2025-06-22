'use client';

import { cn } from '@/lib/utils';
import { ChevronLeft, ChevronRight, Home, Landmark, Receipt, Settings } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function Sidebar() {
    const pathname = usePathname();
    const [isCollapsed, setIsCollapsed] = useState(false);

    const menuItems = [
        { href: '/', label: 'Início', icon: Home },
        { href: '/transacoes', label: 'Transações', icon: Receipt },
        { href: '/contas', label: 'contas', icon: Landmark },
        { href: '/configuracoes', label: 'Configurações', icon: Settings },
    ];

    // Atualizar o layout quando o sidebar mudar
    useEffect(() => {
        const root = document.documentElement;
        if (isCollapsed) {
            root.style.setProperty('--sidebar-width', '4rem');
        } else {
            root.style.setProperty('--sidebar-width', '16rem');
        }
    }, [isCollapsed]);

    return (
        <div
            className={`bg-background fixed top-0 left-0 z-50 h-full border-r shadow-md transition-all duration-300 ease-in-out ${
                isCollapsed ? 'w-16' : 'w-64'
            }`}
        >
            <div className="flex h-full flex-col">
                {/* Header */}
                <div className="flex items-center justify-between border-b p-4">
                    {!isCollapsed && <h2 className="text-xl font-semibold">Sistema Financeiro</h2>}
                    <button
                        onClick={() => setIsCollapsed(!isCollapsed)}
                        className="hover:bg-muted rounded-md p-1 transition-colors"
                        title={isCollapsed ? 'Expandir menu' : 'Encolher menu'}
                    >
                        {isCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
                    </button>
                </div>

                {/* Navigation */}
                <nav className="flex-1">
                    {menuItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = pathname === item.href;

                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={cn(
                                    'flex w-full items-center px-3 py-5 transition-colors',
                                    isActive && 'bg-primary text-primary-foreground',
                                    !isActive && 'hover:bg-muted',
                                    isCollapsed && 'justify-center'
                                )}
                                title={isCollapsed ? item.label : undefined}
                            >
                                <Icon size={20} className="flex-shrink-0" />
                                {!isCollapsed && <span className="ml-3">{item.label}</span>}
                            </Link>
                        );
                    })}
                </nav>
            </div>
        </div>
    );
}
