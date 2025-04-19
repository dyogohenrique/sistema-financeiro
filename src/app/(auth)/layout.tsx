import { ThemeController } from '@/components/ThemeController';
import { ReactNode } from 'react';

export default function AuthLayout({ children }: Readonly<{ children: ReactNode }>) {
    return (
        <>
            <ThemeController />
            <main className="h-screen flex justify-center items-center">
                <div className="border border-slate-600 rounded-lg p-10 bg-base-100 shadow-lg w-[450px] min-h-[350px]">
                    {children}
                </div>
            </main>
        </>
    );
}
