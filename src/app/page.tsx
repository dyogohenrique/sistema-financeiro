'use client';

import { MonthlyChart } from '@/components/MonthlyChart';
import { TransactionCalendar } from '@/components/TransactionCalendar';
import { Button } from '@/components/ui/button';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useThemeClient } from '@/hooks/useThemeClient';
import { PlusIcon } from 'lucide-react';
import { ITransacao } from '../../types/Transacao';

export default function Home() {
    const { mounted } = useThemeClient();

    if (!mounted) {
        return <div>Carregando...</div>;
    }

    // Dados de exemplo para o calendário e gráfico
    const transacoesExemplo: ITransacao[] = [
        // Junho 2025 (mês atual)
        {
            id: 1,
            tipo: 'ENTRADA',
            valorCentavos: BigInt(150000), // R$ 1.500,00
            data: new Date(2025, 5, 15), // Junho é mês 5 (0-indexed)
            descricao: 'Salário',
            parcelas: null,
            numeroParcela: null,
            createdAt: new Date(),
            updatedAt: new Date(),
            categoriaId: 1,
            contaOrigemId: null,
            contaDestinoId: 1,
            cartaoId: null,
            faturaId: null,
        },
        {
            id: 2,
            tipo: 'SAIDA',
            valorCentavos: BigInt(2500), // R$ 25,00
            data: new Date(2025, 5, 15), // Junho é mês 5 (0-indexed)
            descricao: 'Almoço',
            parcelas: null,
            numeroParcela: null,
            createdAt: new Date(),
            updatedAt: new Date(),
            categoriaId: 2,
            contaOrigemId: 1,
            contaDestinoId: null,
            cartaoId: null,
            faturaId: null,
        },
        {
            id: 3,
            tipo: 'SAIDA',
            valorCentavos: BigInt(50000), // R$ 500,00
            data: new Date(2025, 5, 2), // Junho é mês 5 (0-indexed)
            descricao: 'Conta de luz',
            parcelas: null,
            numeroParcela: null,
            createdAt: new Date(),
            updatedAt: new Date(),
            categoriaId: 3,
            contaOrigemId: 1,
            contaDestinoId: null,
            cartaoId: null,
            faturaId: null,
        },
        {
            id: 4,
            tipo: 'ENTRADA',
            valorCentavos: BigInt(30000), // R$ 300,00
            data: new Date(2025, 5, 1), // Junho é mês 5 (0-indexed)
            descricao: 'Freelance',
            parcelas: null,
            numeroParcela: null,
            createdAt: new Date(),
            updatedAt: new Date(),
            categoriaId: 1,
            contaOrigemId: null,
            contaDestinoId: 1,
            cartaoId: null,
            faturaId: null,
        },
        // Maio 2025
        {
            id: 5,
            tipo: 'ENTRADA',
            valorCentavos: BigInt(150000), // R$ 1.500,00
            data: new Date(2025, 4, 15), // Maio é mês 4
            descricao: 'Salário',
            parcelas: null,
            numeroParcela: null,
            createdAt: new Date(),
            updatedAt: new Date(),
            categoriaId: 1,
            contaOrigemId: null,
            contaDestinoId: 1,
            cartaoId: null,
            faturaId: null,
        },
        {
            id: 6,
            tipo: 'SAIDA',
            valorCentavos: BigInt(80000), // R$ 800,00
            data: new Date(2025, 4, 10), // Maio é mês 4
            descricao: 'Aluguel',
            parcelas: null,
            numeroParcela: null,
            createdAt: new Date(),
            updatedAt: new Date(),
            categoriaId: 3,
            contaOrigemId: 1,
            contaDestinoId: null,
            cartaoId: null,
            faturaId: null,
        },
        // Abril 2025
        {
            id: 7,
            tipo: 'ENTRADA',
            valorCentavos: BigInt(150000), // R$ 1.500,00
            data: new Date(2025, 3, 15), // Abril é mês 3
            descricao: 'Salário',
            parcelas: null,
            numeroParcela: null,
            createdAt: new Date(),
            updatedAt: new Date(),
            categoriaId: 1,
            contaOrigemId: null,
            contaDestinoId: 1,
            cartaoId: null,
            faturaId: null,
        },
        {
            id: 8,
            tipo: 'ENTRADA',
            valorCentavos: BigInt(50000), // R$ 500,00
            data: new Date(2025, 3, 20), // Abril é mês 3
            descricao: 'Bônus',
            parcelas: null,
            numeroParcela: null,
            createdAt: new Date(),
            updatedAt: new Date(),
            categoriaId: 1,
            contaOrigemId: null,
            contaDestinoId: 1,
            cartaoId: null,
            faturaId: null,
        },
        // Março 2025
        {
            id: 9,
            tipo: 'ENTRADA',
            valorCentavos: BigInt(150000), // R$ 1.500,00
            data: new Date(2025, 2, 15), // Março é mês 2
            descricao: 'Salário',
            parcelas: null,
            numeroParcela: null,
            createdAt: new Date(),
            updatedAt: new Date(),
            categoriaId: 1,
            contaOrigemId: null,
            contaDestinoId: 1,
            cartaoId: null,
            faturaId: null,
        },
        {
            id: 10,
            tipo: 'SAIDA',
            valorCentavos: BigInt(120000), // R$ 1.200,00
            data: new Date(2025, 2, 5), // Março é mês 2
            descricao: 'Viagem',
            parcelas: null,
            numeroParcela: null,
            createdAt: new Date(),
            updatedAt: new Date(),
            categoriaId: 4,
            contaOrigemId: 1,
            contaDestinoId: null,
            cartaoId: null,
            faturaId: null,
        },
        // Fevereiro 2025
        {
            id: 11,
            tipo: 'ENTRADA',
            valorCentavos: BigInt(150000), // R$ 1.500,00
            data: new Date(2025, 1, 15), // Fevereiro é mês 1
            descricao: 'Salário',
            parcelas: null,
            numeroParcela: null,
            createdAt: new Date(),
            updatedAt: new Date(),
            categoriaId: 1,
            contaOrigemId: null,
            contaDestinoId: 1,
            cartaoId: null,
            faturaId: null,
        },
        // Janeiro 2025
        {
            id: 12,
            tipo: 'ENTRADA',
            valorCentavos: BigInt(150000), // R$ 1.500,00
            data: new Date(2025, 0, 15), // Janeiro é mês 0
            descricao: 'Salário',
            parcelas: null,
            numeroParcela: null,
            createdAt: new Date(),
            updatedAt: new Date(),
            categoriaId: 1,
            contaOrigemId: null,
            contaDestinoId: 1,
            cartaoId: null,
            faturaId: null,
        },
        {
            id: 13,
            tipo: 'SAIDA',
            valorCentavos: BigInt(200000), // R$ 2.000,00
            data: new Date(2025, 0, 10), // Janeiro é mês 0
            descricao: 'Compras de início de ano',
            parcelas: null,
            numeroParcela: null,
            createdAt: new Date(),
            updatedAt: new Date(),
            categoriaId: 5,
            contaOrigemId: 1,
            contaDestinoId: null,
            cartaoId: null,
            faturaId: null,
        },
    ];

    const saldoAtual = transacoesExemplo.reduce((acc, transaction) => {
        const valor = Number(transaction.valorCentavos) / 100;
        if (transaction.tipo === 'ENTRADA') {
            return acc + valor;
        } else if (transaction.tipo === 'SAIDA') {
            return acc - valor;
        }
        return acc;
    }, 0);

    const saldoDoMes = transacoesExemplo.reduce((acc, transaction) => {
        const valor = Number(transaction.valorCentavos) / 100;
        if (transaction.tipo === 'ENTRADA') {
            return acc + valor;
        } else if (transaction.tipo === 'SAIDA') {
            return acc - valor;
        }
        return acc;
    }, 0);

    const entradasDoMes = transacoesExemplo.reduce((acc, transaction) => {
        if (transaction.tipo === 'ENTRADA') {
            return acc + Number(transaction.valorCentavos) / 100;
        }
        return acc;
    }, 0);

    const saidasDoMes = transacoesExemplo.reduce((acc, transaction) => {
        if (transaction.tipo === 'SAIDA') {
            return acc + Number(transaction.valorCentavos) / 100;
        }
        return acc;
    }, 0);

    const trataValor = (valor: number) => {
        return valor.toLocaleString('pt-BR', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        });
    };

    return (
        <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold">Bem-vindo ao Sistema Financeiro!</h1>
                <div className="flex items-center">
                    <Button variant="outline">
                        <PlusIcon className="h-4 w-4" />
                        Adicionar Transação
                    </Button>
                </div>
            </div>

            <section className="flex gap-4">
                <Card className="flex-1">
                    <CardHeader>
                        <CardTitle>R$ {trataValor(saldoAtual)}</CardTitle>
                        <CardDescription>Saldo Atual</CardDescription>
                    </CardHeader>
                </Card>
                <Card className={`flex-1 ${saldoDoMes > 0 ? 'text-green-500' : 'text-red-500'}`}>
                    <CardHeader>
                        <CardTitle>R$ {trataValor(saldoDoMes)}</CardTitle>
                        <CardDescription>Saldo do Mês (Atual)</CardDescription>
                    </CardHeader>
                </Card>
                <Card className="flex-1 text-green-500">
                    <CardHeader>
                        <CardTitle>R$ {trataValor(entradasDoMes)}</CardTitle>
                        <CardDescription>Entradas do Mês (Atual)</CardDescription>
                    </CardHeader>
                </Card>
                <Card className="flex-1 text-red-500">
                    <CardHeader>
                        <CardTitle>R$ {trataValor(saidasDoMes)}</CardTitle>
                        <CardDescription>Saídas do Mês (Atual)</CardDescription>
                    </CardHeader>
                </Card>
            </section>

            <section className="bg-card text-card-foreground flex flex-col gap-6 rounded-xl border p-6 shadow-sm">
                <h2 className="mb-4 text-2xl font-bold">Calendário de Transações</h2>
                <TransactionCalendar transactions={transacoesExemplo} />
            </section>

            <section className="bg-card text-card-foreground flex flex-col gap-6 rounded-xl border p-6 shadow-sm">
                <h2 className="mb-4 text-2xl font-bold">Análise Mensal</h2>
                <MonthlyChart transactions={transacoesExemplo} />
            </section>
        </div>
    );
}
