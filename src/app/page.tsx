'use client';

import { MonthlyChart } from '@/components/MonthlyChart';
import { TransactionCalendar } from '@/components/TransactionCalendar';
import { Button } from '@/components/ui/button';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useThemeClient } from '@/hooks/useThemeClient';
import { PlusIcon } from 'lucide-react';
import { transacoesExemplo } from '@/lib/transacoes';   

export default function Home() {
    const { mounted } = useThemeClient();

    if (!mounted) {
        return <div>Carregando...</div>;    
    }

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
        <div className="flex flex-col gap-4">
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
