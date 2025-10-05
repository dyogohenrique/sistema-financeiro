'use client';

import { getDashboardData } from '@/actions/DashboardActions';
import { MonthlyChart } from '@/components/MonthlyChart';
import { TransactionCalendar } from '@/components/TransactionCalendar';
import { Button } from '@/components/ui/button';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useThemeClient } from '@/hooks/useThemeClient';
import { RefreshCw } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function Home() {
    const { mounted } = useThemeClient();
    const [dashboardData, setDashboardData] = useState({
        saldoAtual: 0,
        saldoDoMes: 0,
        entradasDoMes: 0,
        saidasDoMes: 0,
        transacoes: [] as any[],
    });
    const [loading, setLoading] = useState(true);

    const fetchDashboardData = async () => {
        try {
            setLoading(true);
            const data = await getDashboardData();
            setDashboardData(data);
        } catch (error) {
            console.error('Erro ao carregar dados do dashboard:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (mounted) {
            fetchDashboardData();
        }
    }, [mounted]);

    if (!mounted || loading) {
        return (
            <div className="flex min-h-[400px] items-center justify-center">
                <div className="text-center">
                    <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-b-2 border-gray-900"></div>
                    <p>Carregando dados do dashboard...</p>
                </div>
            </div>
        );
    }

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
                <div className="flex items-center gap-2">
                    <Button variant="outline" onClick={fetchDashboardData} disabled={loading}>
                        <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                        Atualizar
                    </Button>
                </div>
            </div>

            <section className="flex gap-4">
                <Card className="flex-1">
                    <CardHeader>
                        <CardTitle>R$ {trataValor(dashboardData.saldoAtual)}</CardTitle>
                        <CardDescription>Saldo Atual</CardDescription>
                    </CardHeader>
                </Card>
                <Card
                    className={`flex-1 ${dashboardData.saldoDoMes > 0 ? 'text-green-500' : 'text-red-500'}`}
                >
                    <CardHeader>
                        <CardTitle>R$ {trataValor(dashboardData.saldoDoMes)}</CardTitle>
                        <CardDescription>Saldo do Mês (Atual)</CardDescription>
                    </CardHeader>
                </Card>
                <Card className="flex-1 text-green-500">
                    <CardHeader>
                        <CardTitle>R$ {trataValor(dashboardData.entradasDoMes)}</CardTitle>
                        <CardDescription>Entradas do Mês (Atual)</CardDescription>
                    </CardHeader>
                </Card>
                <Card className="flex-1 text-red-500">
                    <CardHeader>
                        <CardTitle>R$ {trataValor(dashboardData.saidasDoMes)}</CardTitle>
                        <CardDescription>Saídas do Mês (Atual)</CardDescription>
                    </CardHeader>
                </Card>
            </section>

            <section className="bg-card text-card-foreground flex flex-col gap-6 rounded-xl border p-6 shadow-sm">
                <h2 className="mb-4 text-2xl font-bold">Calendário de Transações</h2>
                <TransactionCalendar transactions={dashboardData.transacoes} />
            </section>

            <section className="bg-card text-card-foreground flex flex-col gap-6 rounded-xl border p-6 shadow-sm">
                <h2 className="mb-4 text-2xl font-bold">Análise Mensal</h2>
                <MonthlyChart transactions={dashboardData.transacoes} />
            </section>
        </div>
    );
}
