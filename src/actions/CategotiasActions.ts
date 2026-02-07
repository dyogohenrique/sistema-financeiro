'use server';

import { prisma } from '@/lib/prisma';
import { CategoriaSchema } from '@/schemas/categorias';
import { Categoria } from '@prisma/client';
import { revalidatePath } from 'next/cache';

export type ActionState = {
    errors?: {
        name?: string[];
        color?: string[];
        _form?: string[];
    };
    message?: string;
    success?: boolean;
};

export async function createCategoria(
    prevState: ActionState,
    formData: FormData
): Promise<ActionState> {
    const validatedFields = CategoriaSchema.safeParse({
        name: formData.get('name'),
        color: formData.get('color'),
    });

    if (!validatedFields.success) {
        return {
            errors: validatedFields.error.flatten().fieldErrors,
            message: 'Erro ao criar categoria',
            success: false,
        };
    }

    const { data } = validatedFields;

    try {
        await prisma.$transaction(async (tx) => {
            await tx.categoria.create({
                data: {
                    name: data.name,
                    color: data.color,
                },
            });
        });
    } catch (error: any) {
        if (error.code === 'P2002') {
            const target = error.meta?.target as string[];
            let fieldError = {};
            if (target.includes('name')) {
                fieldError = {
                    name: ['Categoria já existe'],
                };
            }
            return {
                errors: fieldError,
                message: 'Categorias duplicadas encontradas',
                success: false,
            };
        }
        return {
            message: 'Erro no sistema. Tente novamente mais tarde.',
            success: false,
        };
    }

    revalidatePath('/configuracoes');
    return {
        message: 'Categoria criada com sucesso',
        success: true,
    };
}

export async function updateCategoria(
    id: number,
    prevState: ActionState,
    formData: FormData
): Promise<ActionState> {
    const validatedFields = CategoriaSchema.safeParse({
        name: formData.get('name'),
        color: formData.get('color'),
    });

    if (!validatedFields.success) {
        return {
            errors: validatedFields.error.flatten().fieldErrors,
            message: 'Erro ao atualizar categoria',
            success: false,
        };
    }

    const { data } = validatedFields;

    try {
        await prisma.$transaction(async (tx) => {
            await tx.categoria.update({
                where: { id },
                data: { ...data },
            });
        });
    } catch (error: any) {
        if (error.code === 'P2002') {
            return {
                success: false,
                message: 'Categoria já existe',
            };
        }
        return {
            success: false,
            message: 'Erro no sistema. Tente novamente mais tarde.',
        };
    }

    revalidatePath('/configuracoes');
    return {
        message: 'Categoria atualizada com sucesso',
        success: true,
    };
}

export async function deleteCategoria(id: number): Promise<ActionState> {
    try {
        await prisma.$transaction(async (tx) => {
            await tx.categoria.delete({
                where: { id },
            });
        });
    } catch (error: any) {
        return {
            success: false,
            message: 'Erro ao excluir categoria',
        };
    }
    revalidatePath('/configuracoes');
    return {
        message: 'Categoria excluída com sucesso',
        success: true,
    };
}

export async function getCategoria(id: number): Promise<Categoria | null> {
    const categoria = await prisma.categoria.findUnique({
        where: { id },
    });
    return categoria;
}

export async function getAllCategorias(): Promise<Categoria[]> {
    const categorias = await prisma.categoria.findMany({
        orderBy: { createdAt: 'desc' },
    });
    return categorias;
}
