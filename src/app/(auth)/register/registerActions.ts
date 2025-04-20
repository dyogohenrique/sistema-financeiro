'use server';

import { prisma } from '@/lib/prisma';
import { hashSync } from 'bcrypt-ts';
import { redirect } from 'next/navigation';

type ValidationError = {
    name?: string;
    email?: string;
    password?: string;
    success: boolean;
};

function validatePassword(password: string): string | null {
    if (password.length < 8) {
        return 'A senha deve ter pelo menos 8 caracteres';
    }

    if (!/[A-Z]/.test(password)) {
        return 'A senha deve conter pelo menos uma letra maiúscula';
    }

    if (!/[a-z]/.test(password)) {
        return 'A senha deve conter pelo menos uma letra minúscula';
    }

    if (!/[0-9]/.test(password)) {
        return 'A senha deve conter pelo menos um número';
    }

    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
        return 'A senha deve conter pelo menos um caractere especial (!@#$%^&*(),.?":{}|<>)';
    }

    return null;
}

export default async function registerAction(_prevState: any, formData: FormData) {
    const entries = Array.from(formData.entries());
    const data = Object.fromEntries(entries) as {
        name: string;
        email: string;
        password: string;
    };

    const errors: ValidationError = {
        success: true,
    };

    // Validações para nome
    if (!data.name) {
        errors.name = 'O nome é obrigatório';
        errors.success = false;
    }

    // Validações para email
    if (!data.email) {
        errors.email = 'O email é obrigatório';
        errors.success = false;
    } else {
        const user = await prisma.user.findUnique({
            where: {
                email: data.email,
            },
        });

        if (user) {
            errors.email = 'O email já está em uso';
            errors.success = false;
        }
    }

    // Validações para senha
    if (!data.password) {
        errors.password = 'A senha é obrigatória';
        errors.success = false;
    } else {
        const passwordError = validatePassword(data.password);
        if (passwordError) {
            errors.password = passwordError;
            errors.success = false;
        }
    }

    // Se houver erros, retorna todos eles
    if (!errors.success) {
        return errors;
    }

    await prisma.user.create({
        data: {
            name: data.name,
            email: data.email,
            password: hashSync(data.password, 10),
        },
    });

    redirect('/login');
}
