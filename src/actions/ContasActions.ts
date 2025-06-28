'use server';

import { prisma } from '@/lib/prisma';
import { Conta, TipoConta } from '@prisma/client';

export async function createContas(
    formState: { errors: string; success?: boolean },
    formData: FormData
): Promise<{ errors: string; success?: boolean }> {
    try {
        const name = formData.get('name') as string;
        const tipo = formData.get('tipo') as TipoConta;
        const saldoReais = parseFloat((formData.get('saldoCentavos') as string) || '0');
        const saldoCentavos = BigInt(Math.round(saldoReais * 100));
        const cor = formData.get('cor') as string;

        const existAccount = await prisma.conta.findFirst({
            where: {
                name,
            },
        });

        if (existAccount) {
            return {
                errors: 'Nome da conta já existe, por favor, escolha outro nome',
                success: false,
            };
        }

        if (!name) {
            return { errors: 'Nome é obrigatório', success: false };
        }

        if (!tipo) {
            return { errors: 'Tipo é obrigatório', success: false };
        }

        if (
            tipo !== TipoConta.CORRENTE &&
            tipo !== TipoConta.POUPANCA &&
            tipo !== TipoConta.INVESTIMENTO
        ) {
            return { errors: 'Tipo de conta inválido', success: false };
        }

        if (saldoCentavos < 0) {
            return { errors: 'Saldo não pode ser negativo', success: false };
        }

        if (!cor) {
            return { errors: 'Selecione uma cor para a conta!', success: false };
        }

        await prisma.conta.create({
            data: {
                name,
                tipo,
                saldoCentavos,
                cor,
            },
        });

        return { errors: '', success: true };
    } catch (error) {
        return { errors: `Erro ao criar conta: ${error}`, success: false };
    }
}

export async function updateConta(
    formState: { errors: string; success?: boolean },
    formData: FormData
): Promise<{ errors: string; success?: boolean }> {
    try {
        const id = parseInt(formData.get('id') as string);
        const name = formData.get('name') as string;
        const tipo = formData.get('tipo') as TipoConta;
        const saldoReais = parseFloat((formData.get('saldoCentavos') as string) || '0');
        const saldoCentavos = BigInt(Math.round(saldoReais * 100));
        const cor = formData.get('cor') as string;

        await prisma.conta.update({
            where: { id },
            data: {
                name,
                tipo,
                saldoCentavos,
                cor,
            },
        });

        return { errors: '', success: true };
    } catch (error) {
        return { errors: `Erro ao atualizar conta: ${error}`, success: false };
    }
}

export async function getAllContas(): Promise<Conta[]> {
    try {
        const contas = await prisma.conta.findMany({
            orderBy: { createdAt: 'desc' },
        });
        return contas;
    } catch (error) {
        console.error('Erro ao buscar contas:', error);
        return [];
    }
}

export async function getContaById(
    id: number
): Promise<{ errors: string; success?: boolean; conta?: Conta }> {
    try {
        const conta = await prisma.conta.findUnique({
            where: { id },
        });

        if (!conta) {
            return { errors: 'Conta não encontrada', success: false };
        }
        return { errors: '', success: true, conta };
    } catch (error) {
        console.error('Erro ao buscar conta:', error);
        return { errors: `Erro ao buscar conta: ${error}`, success: false };
    }
}

export async function ativarConta(id: number): Promise<{ errors: string; success?: boolean }> {
    try {
        const conta = await prisma.conta.findUnique({
            where: { id },
        });
        if (!conta) {
            return { errors: 'Conta não encontrada', success: false };
        }

        if (conta.ativa) {
            return { errors: 'Conta já está ativa', success: false };
        }

        await prisma.conta.update({
            where: { id },
            data: {
                ativa: true,
            },
        });

        return { errors: '', success: true };
    } catch (error) {
        return { errors: `Erro ao ativar conta: ${error}`, success: false };
    }
}

export async function desativarConta(id: number): Promise<{ errors: string; success?: boolean }> {
    try {
        const conta = await prisma.conta.findUnique({
            where: { id },
        });

        if (!conta) {
            return { errors: 'Conta não encontrada', success: false };
        }

        if (!conta.ativa) {
            return { errors: 'Conta já está desativada', success: false };
        }

        await prisma.conta.update({
            where: { id },
            data: {
                ativa: false,
            },
        });

        return { errors: '', success: true };
    } catch (error) {
        return { errors: `Erro ao desativar conta: ${error}`, success: false };
    }
}
