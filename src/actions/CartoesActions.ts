'use server';
import { prisma } from '@/lib/prisma';
import { CartaoCredito } from '@prisma/client';

export async function createCartao(
    formState: { errors: string; success?: boolean },
    formData: FormData
): Promise<{ errors: string; success?: boolean }> {
    try {
        const name = formData.get('name') as string;
        const limiteReais = parseFloat((formData.get('limiteCentavos') as string) || '0');
        const limiteCentavos = BigInt(Math.round(limiteReais * 100));

        const diaFechamento = parseInt(formData.get('diaFechamento') as string) || 0;
        const diaVencimento = parseInt(formData.get('diaVencimento') as string) || 0;

        const cor = formData.get('cor') as string;

        const existCartao = await prisma.cartaoCredito.findFirst({
            where: {
                name,
            },
        });

        if (!name) {
            return { errors: 'Nome é obrigatório', success: false };
        }

        if (existCartao) {
            return {
                errors: 'Nome do cartão já existe, por favor, escolha outro nome',
                success: false,
            };
        }

        if (!limiteReais) {
            return { errors: 'Limite é obrigatório', success: false };
        }

        if (!cor) {
            return { errors: 'Cor é obrigatória', success: false };
        }

        await prisma.cartaoCredito.create({
            data: {
                name,
                limiteCentavos,
                cor,
                diaFechamento,
                diaVencimento,
            },
        });

        return { success: true, errors: '' };
    } catch (error) {
        return { errors: 'Erro ao criar cartão', success: false };
    }
}

export async function updateCartao(
    formState: { errors: string; success?: boolean },
    formData: FormData
): Promise<{ errors: string; success?: boolean }> {
    try {
        const id = parseInt(formData.get('id') as string);
        const name = formData.get('name') as string;
        const limiteReais = parseFloat((formData.get('limiteCentavos') as string) || '0');
        const limiteCentavos = BigInt(Math.round(limiteReais * 100));
        const diaFechamento = parseInt(formData.get('diaFechamento') as string) || 0;
        const diaVencimento = parseInt(formData.get('diaVencimento') as string) || 0;
        const cor = formData.get('cor') as string;

        const existCartao = await prisma.cartaoCredito.findFirst({
            where: {
                name,
            },
        });

        if (existCartao) {
            return {
                errors: 'Nome do cartão já existe, por favor, escolha outro nome',
                success: false,
            };
        }

        await prisma.cartaoCredito.update({
            where: { id },
            data: { name, limiteCentavos, diaFechamento, diaVencimento, cor },
        });

        return { success: true, errors: '' };
    } catch (error) {
        return { errors: 'Erro ao atualizar cartão', success: false };
    }
}

export async function getAllCartoes(): Promise<CartaoCredito[]> {
    try {
        const cartoes = await prisma.cartaoCredito.findMany({
            orderBy: { createdAt: 'desc' },
        });

        return cartoes;
    } catch (error) {
        console.error('Erro ao buscar cartões:', error);
        return [];
    }
}

export async function getCartaoById(
    id: number
): Promise<{ errors: string; success?: boolean; cartao?: CartaoCredito }> {
    try {
        const cartao = await prisma.cartaoCredito.findUnique({
            where: { id },
        });
        if (!cartao) {
            return { errors: 'Cartão não encontrado', success: false };
        }
        return { errors: '', success: true, cartao };
    } catch (error) {
        console.error('Erro ao buscar cartão:', error);
        return { errors: `Erro ao buscar cartão: ${error}`, success: false };
    }
}

export async function ativarCartao(id: number): Promise<{ errors: string; success?: boolean }> {
    try {
        const cartao = await prisma.cartaoCredito.findUnique({
            where: { id },
        });
        if (!cartao) {
            return { errors: 'Cartão não encontrado', success: false };
        }
        if (cartao.ativo) {
            return { errors: 'Cartão já está ativo', success: false };
        }
        await prisma.cartaoCredito.update({
            where: { id },
            data: { ativo: true },
        });
        return { errors: '', success: true };
    } catch (error) {
        return { errors: `Erro ao ativar cartão: ${error}`, success: false };
    }
}

export async function desativarCartao(id: number): Promise<{ errors: string; success?: boolean }> {
    try {
        const cartao = await prisma.cartaoCredito.findUnique({
            where: { id },
        });
        if (!cartao) {
            return { errors: 'Cartão não encontrado', success: false };
        }
        if (!cartao.ativo) {
            return { errors: 'Cartão já está desativado', success: false };
        }
        await prisma.cartaoCredito.update({
            where: { id },
            data: { ativo: false },
        });
        return { errors: '', success: true };
    } catch (error) {
        return { errors: `Erro ao desativar cartão: ${error}`, success: false };
    }
}
