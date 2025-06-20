'use client';

import { endOfMonth, format, startOfMonth, subMonths } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
    CartesianGrid,
    Line,
    LineChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from 'recharts';
import { ITransacao } from '../../types/Transacao';

interface MonthlyChartProps {
    transactions: ITransacao[];
}

export function MonthlyChart({ transactions }: MonthlyChartProps) {
    // Gerar dados dos últimos 6 meses
    const generateMonthlyData = () => {
        const data = [];
        const currentDate = new Date();

        for (let i = 5; i >= 0; i--) {
            const monthDate = subMonths(currentDate, i);
            const monthStart = startOfMonth(monthDate);
            const monthEnd = endOfMonth(monthDate);

            // Filtrar transações do mês
            const monthTransactions = transactions.filter((transaction) => {
                const transactionDate = new Date(transaction.data);
                return transactionDate >= monthStart && transactionDate <= monthEnd;
            });

            // Calcular total do mês
            const total = monthTransactions.reduce((acc, transaction) => {
                const valor = Number(transaction.valorCentavos) / 100;
                if (transaction.tipo === 'ENTRADA') {
                    return acc + valor;
                } else if (transaction.tipo === 'SAIDA') {
                    return acc - valor;
                }
                return acc;
            }, 0);

            data.push({
                month: format(monthDate, 'MMM', { locale: ptBR }),
                total: total,
                monthNumber: monthDate.getMonth(),
                year: monthDate.getFullYear(),
            });
        }

        return data;
    };

    const chartData = generateMonthlyData();

    // Função para formatar valores no tooltip
    const formatValue = (value: number) => {
        return `R$ ${value.toLocaleString('pt-BR', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        })}`;
    };

    // Função para formatar valores no eixo Y
    const formatYAxis = (tickItem: number) => {
        if (tickItem >= 1000) {
            return `R$ ${(tickItem / 1000).toFixed(0)}k`;
        }
        return `R$ ${tickItem.toFixed(0)}`;
    };

    // Cores baseadas no tema
    const lineColor = '#0066a1'; // Cor primária do tema
    const gridColor = '#e2e8f0'; // Cor do grid

    return (
        <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <XAxis
                    dataKey="month"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12, fill: '#64748b' }}
                />
                <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12, fill: '#64748b' }}
                    tickFormatter={formatYAxis}
                />
                <Tooltip
                    contentStyle={{
                        backgroundColor: 'white',
                        border: '1px solid #e2e8f0',
                        borderRadius: '8px',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                    }}
                    formatter={(value: number) => [formatValue(value), 'Total']}
                    labelFormatter={(label) => `${label}`}
                />
                <CartesianGrid stroke="#e2e8f0" strokeDasharray="3 3" />
                <Line
                    type="monotone"
                    dataKey="total"
                    stroke={lineColor}
                    strokeWidth={3}
                    dot={{
                        fill: lineColor,
                        strokeWidth: 2,
                        r: 4,
                    }}
                    activeDot={{
                        r: 6,
                        stroke: lineColor,
                        strokeWidth: 2,
                    }}
                    label={({ x, y, value }) => {
                        return (
                            <text
                                x={x}
                                y={y}
                                dy={24}
                                textAnchor="middle"
                                fill="#64748b"
                                fontSize={12}
                            >
                                {value}
                            </text>
                        );
                    }}
                />
            </LineChart>
        </ResponsiveContainer>
    );
}
