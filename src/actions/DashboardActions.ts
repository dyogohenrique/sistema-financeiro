'use server';

import { prisma } from '@/lib/prisma';

export interface DashboardData {
    saldoAtual: number;
    saldoDoMes: number;
    entradasDoMes: number;
    saidasDoMes: number;
    transacoes: any[];
}

export async function getDashboardData(): Promise<DashboardData> {
    try {
        // Buscar todas as transações pagas
        const transacoes = await prisma.transacao.findMany({
            where: {
                status: 'PAGO'
            },
            include: {
                categorias: {
                    include: {
                        categoria: true,
                    },
                },
                contaOrigem: true,
                contaDestino: true,
            },
            orderBy: { data: 'desc' },
        });

        // Calcular saldo atual (todas as transações)
        const saldoAtual = transacoes.reduce((acc, transaction) => {
            const valor = Number(transaction.valorCentavos) / 100;
            if (transaction.tipo === 'ENTRADA') {
                return acc + valor;
            } else if (transaction.tipo === 'SAIDA') {
                return acc - valor;
            } else if (transaction.tipo === 'TRANSFERENCIA') {
                // Transferências não afetam o saldo total, apenas movem entre contas
                return acc;
            }
            return acc;
        }, 0);

        // Filtrar transações do mês atual
        const agora = new Date();
        const inicioDoMes = new Date(agora.getFullYear(), agora.getMonth(), 1);
        const fimDoMes = new Date(agora.getFullYear(), agora.getMonth() + 1, 0, 23, 59, 59);

        const transacoesDoMes = transacoes.filter(transaction => {
            if (!transaction.data) return false;
            const dataTransacao = new Date(transaction.data);
            return dataTransacao >= inicioDoMes && dataTransacao <= fimDoMes;
        });

        // Calcular saldo do mês
        const saldoDoMes = transacoesDoMes.reduce((acc, transaction) => {
            const valor = Number(transaction.valorCentavos) / 100;
            if (transaction.tipo === 'ENTRADA') {
                return acc + valor;
            } else if (transaction.tipo === 'SAIDA') {
                return acc - valor;
            } else if (transaction.tipo === 'TRANSFERENCIA') {
                // Transferências não afetam o saldo total, apenas movem entre contas
                return acc;
            }
            return acc;
        }, 0);

        // Calcular entradas do mês
        const entradasDoMes = transacoesDoMes.reduce((acc, transaction) => {
            if (transaction.tipo === 'ENTRADA') {
                return acc + Number(transaction.valorCentavos) / 100;
            }
            return acc;
        }, 0);

        // Calcular saídas do mês
        const saidasDoMes = transacoesDoMes.reduce((acc, transaction) => {
            if (transaction.tipo === 'SAIDA') {
                return acc + Number(transaction.valorCentavos) / 100;
            }
            return acc;
        }, 0);

        return {
            saldoAtual,
            saldoDoMes,
            entradasDoMes,
            saidasDoMes,
            transacoes,
        };
    } catch (error) {
        console.error('Erro ao buscar dados do dashboard:', error);
        return {
            saldoAtual: 0,
            saldoDoMes: 0,
            entradasDoMes: 0,
            saidasDoMes: 0,
            transacoes: [],
        };
    }
}