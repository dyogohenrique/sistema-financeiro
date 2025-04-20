import SidebarWrapper from '@/components/SidebarWrapper';
import { ReactNode } from 'react';

export default function AuthenticateLayout({ children }: Readonly<{ children: ReactNode }>) {
    return (
        <>
            <SidebarWrapper />
            <main>
                {children}
            </main>
        </>
    );
}
