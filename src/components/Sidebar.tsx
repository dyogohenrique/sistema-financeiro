'use client';

import { logoutAction } from '@/app/(auth)/(logout)/logoutAction';
import Form from 'next/form';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface SidebarProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
    const pathname = usePathname();

    const menuItems = [
        { href: '/', label: 'Início' },
        { href: '/profile', label: 'Perfil' },
        { href: '/settings', label: 'Configurações' },
    ];

    return (
        <div
            className={`fixed top-0 left-0 h-full w-64 bg-background border-r transition-transform duration-300 ease-in-out z-50 ${
                isOpen ? 'translate-x-0' : '-translate-x-full'
            }`}
        >
            <div className="p-4">
                <div className="flex justify-between items-center mb-8">
                    <h2 className="text-xl font-semibold">Menu</h2>
                    <button onClick={onClose}>✕</button>
                </div>

                <nav className="space-y-2">
                    {menuItems.map((item) => (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`block px-4 py-2 rounded-md transition-colors ${
                                pathname === item.href
                                    ? 'bg-primary text-primary-foreground'
                                    : 'hover:bg-muted'
                            }`}
                        >
                            {item.label}
                        </Link>
                    ))}
                </nav>

                <div className="mt-8">
                    <Form
                        action={logoutAction}
                    >
                        <button className="w-full" type="submit">
                            Sair
                        </button>
                    </Form>
                </div>
            </div>
        </div>
    );
}
