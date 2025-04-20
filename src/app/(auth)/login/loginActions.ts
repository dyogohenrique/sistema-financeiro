'use server';

import { signIn } from 'auth';

export async function loginAction(_prevState: any, formData: FormData) {
    try {
        const result = await signIn('credentials', {
            email: formData.get('email'),
            password: formData.get('password'),
            redirect: false,
        });

        if (result?.error) {
            return {
                success: false,
                message: 'Email ou senha inválidos',
            };
        }

        return {
            success: true,
            url: '/',
        };
    } catch (error) {
        console.error('Erro durante login:', error);
        return {
            success: false,
            message: 'Erro interno do servidor',
        };
    }
}
