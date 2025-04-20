'use server';

import { signIn } from 'auth';

interface AuthError extends Error {
    type?: string;
}

export async function loginAction(_prevState: any, formData: FormData) {
    try {
        await signIn('credentials', {
            email: formData.get('email'),
            password: formData.get('password'),
        });
        return {
            success: true,
        };
    } catch (error) {
        if (error instanceof Error && (error as AuthError).type === 'CredentialsSignin') {
            return {
                success: false,
                message: 'Email ou senha inválidos',
            };
        }
        return {
            success: false,
            message: 'Erro Interno',
        };
    }
}
