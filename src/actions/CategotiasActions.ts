'use server';

import { prisma } from '@/lib/prisma';
import { Categoria } from '@prisma/client';
import { revalidatePath } from 'next/cache';

export async function createCategoria(
    formState: { errors: string; success?: boolean },
    formData: FormData
): Promise<{ errors: string; success?: boolean }> {
    try {
        const name = formData.get('name') as string;
        const color = formData.get('color') as string;

        const existCategoria = await prisma.categoria.findFirst({
            where: {
                name,
            },
        });

        if (existCategoria) {
            return {
                errors: 'Já existe uma categoria com esse nome.',
                success: false,
            };
        }

        if (!name) {
            return { errors: 'Nome é obrigatório', success: false };
        }

        if (!color) {
            return { errors: 'Cor é obrigatório', success: false };
        }

        await prisma.categoria.create({
            data: {
                name,
                color,
            },
        });
        
        revalidatePath('/configuracoes');
        return { errors: '', success: true };
    } catch (error) {
        return { errors: `Erro ao criar categoria: ${error}`, success: false };
    }
}

export async function updateCategoria(
    formState: { errors: string; success?: boolean },
    formData: FormData
): Promise<{ errors: string; success?: boolean }> {
    try {
        const id = parseInt(formData.get('id') as string);
        const name = formData.get('name') as string;
        const color = formData.get('color') as string;

        const categoria = await prisma.categoria.findUnique({
            where: { id },
        });

        if (!categoria) {
            return { errors: 'Categoria não encontrada', success: false };
        }

        if (categoria.name === name && categoria.color === color) {
            return {
                errors: 'Nenhuma alteração foi realizada',
                success: true,
            };
        }

        const existCategoria = await prisma.categoria.findFirst({
            where: {
                name,
            },
        });

        if (existCategoria && existCategoria.id !== id) {
            return {
                errors: 'Já existe uma categoria com esse nome.',
                success: false,
            };
        }

        await prisma.categoria.update({
            where: { id },
            data: {
                name,
                color,
            },
        });

        revalidatePath('/configuracoes');
        return { errors: '', success: true };
    } catch (error) {
        return { errors: `Erro ao criar conta: ${error}`, success: false };
    }
}

export async function getAllCategorias(): Promise<Categoria[]> {
    try {
        const categorias = await prisma.categoria.findMany({
            orderBy: { createdAt: 'desc' },
        });

        return categorias;
    } catch (error) {
        console.error('Erro ao buscar categorias:', error);
        return [];
    }
}