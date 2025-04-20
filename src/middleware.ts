import { NextRequest, NextResponse } from 'next/server';
import { auth } from 'auth';

export async function middleware(request: NextRequest) {
    const session = await auth();

    // Lista de rotas públicas que não precisam de autenticação
    const publicRoutes = ['/login', '/register'];
    const isPublicRoute = publicRoutes.some((route) => request.nextUrl.pathname.startsWith(route));

    // Se o usuário não estiver autenticado e tentar acessar uma rota protegida
    if (!session && !isPublicRoute) {
        return NextResponse.redirect(new URL('/login', request.url));
    }

    // Se o usuário estiver autenticado e tentar acessar uma rota pública
    if (session && isPublicRoute) {
        return NextResponse.redirect(new URL('/', request.url));
    }

    return NextResponse.next();
}

// Configurar quais rotas o middleware deve verificar
export const config = {
    matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
