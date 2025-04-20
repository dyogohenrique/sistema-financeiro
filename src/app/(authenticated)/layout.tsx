import Sidebar from '@/components/Sidebar';
import { auth } from 'auth';

export default async function AuthenticatedLayout({ children }: { children: React.ReactNode }) {
    const session = await auth();
    const userName = session?.user?.name || '';

    return (
        <div className="flex h-screen">
            <Sidebar userName={userName} />
            <main className="flex-1 p-4 overflow-auto">{children}</main>
        </div>
    );
}
