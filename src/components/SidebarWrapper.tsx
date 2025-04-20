'use client';

import { usePathname } from 'next/navigation';
import { useState } from 'react';
import Sidebar from './Sidebar';

export default function SidebarWrapper() {
    const [isOpen, setIsOpen] = useState(true);

    return <Sidebar isOpen={isOpen} onClose={() => setIsOpen(false)} />;
}
