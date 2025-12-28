'use server';

import { prisma } from '@/lib/prisma';

import { ContaSchema } from '@/schemas/contas';
import { Conta } from '@prisma/client';
import { revalidatePath } from 'next/cache';

export type ActionState = {
    errors?: {
        name?: string[];
        _form?: string[];
    };
    message?: string;
    success?: boolean;
};

export async function createConta(
    prevState: ActionState,
    formData: FormData
): Promise<ActionState> {
    const validatedFields = ContaSchema.safeParse({
        name: formData.get('name'),
        tipo: formData.get('tipo'),
        cor: formData.get('cor'),
    });

    if (!validatedFields.success) {
        return {
            errors: validatedFields.error.flatten().fieldErrors,
            message: 'Erro ao criar conta',
            success: false,
        };
    }

    const { data } = validatedFields;

    try {
        await prisma.$transaction(async (tx) => {
            const novaConta = await tx.conta.create({
                data: {
                    ...data,
                    saldoCentavos: BigInt(0),
                    ativa: true,
                },
            });
        });
    } catch (error: any) {
        if (error.code === 'P2002') {
            const target = error.meta?.target as string[];
            let fieldError = {};
            if (target.includes('name')) {
                fieldError = {
                    name: ['Conta já existe'],
                };
            }
            return {
                errors: fieldError,
                message: 'Contas duplicadas encontradas',
                success: false,
            };
        }
        return {
            message: 'Erro no sistema. Tente novamente mais tarde.',
            success: false,
        };
    }

    revalidatePath('/contas');
    return {
        message: 'Conta criada com sucesso',
        success: true,
    };
}

export async function updateConta(
    id: number,
    prevState: ActionState,
    formData: FormData
): Promise<ActionState> {
    const validatedFields = ContaSchema.safeParse({
        name: formData.get('name'),
        tipo: formData.get('tipo'),
        cor: formData.get('cor'),
    });

    if (!validatedFields.success) {
        return {
            errors: validatedFields.error.flatten().fieldErrors,
            message: 'Erro ao atualizar conta',
            success: false,
        };
    }

    const { data } = validatedFields;

    try {
        await prisma.$transaction(async (tx) => {
            const contaAtualizada = await tx.conta.update({
                where: { id },
                data: { ...data },
            });
        });
    } catch (error: any) {
        if (error.code === 'P2002') {
            return {
                success: false,
                message: 'Conta já existe',
            };
        }
        return {
            success: false,
            message: 'Erro no sistema. Tente novamente mais tarde.',
        };
    }

    revalidatePath('/contas');
    return {
        message: 'Conta atualizada com sucesso',
        success: true,
    };
}

export async function desativarConta(id: number): Promise<ActionState> {
    try {
        await prisma.$transaction(async (tx) => {
            const contaDesativada = await tx.conta.update({
                where: { id },
                data: { ativa: false },
            });
        });
    } catch (error: any) {
        return {
            success: false,
            message: 'Erro ao desativar conta',
        };
    }
    revalidatePath('/contas');
    return {
        message: 'Conta Desativada com sucesso',
        success: true,
    };
}

export async function ativarConta(id: number): Promise<ActionState> {
    try {
        await prisma.$transaction(async (tx) => {
            const contaAtivada = await tx.conta.update({
                where: { id },
                data: { ativa: true },
            });
        });
    } catch (error: any) {
        return {
            success: false,
            message: 'Erro ao ativar conta',
        };
    }
    revalidatePath('/contas');
    return {
        message: 'Conta Ativada com sucesso',
        success: true,
    };
}

export async function getConta(id: number): Promise<Conta | null> {
    const conta = await prisma.conta.findUnique({
        where: { id },
    });
    return conta;
}

export async function getAllContas(): Promise<Conta[]> {
    const contas = await prisma.conta.findMany();
    return contas;
}
