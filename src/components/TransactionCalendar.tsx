'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { eachDayOfInterval, endOfMonth, format, isSameDay, startOfMonth } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useState } from 'react';
import { ITransacao } from '../../types/Transacao';

interface TransactionCalendarProps {
    transactions: ITransacao[];
}

export function TransactionCalendar({ transactions }: TransactionCalendarProps) {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);
    const [showDialog, setShowDialog] = useState(false);

    // Obter o primeiro e último dia do mês atual
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(currentDate);
    const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

    // Função para obter transações de um dia específico
    const getTransactionsForDay = (date: Date) => {
        return transactions.filter((transaction) => {
            // Garantir que a data da transação seja tratada como data local
            const transactionDate = new Date(transaction.data);
            const transactionDateOnly = new Date(
                transactionDate.getFullYear(),
                transactionDate.getMonth(),
                transactionDate.getDate()
            );
            const compareDateOnly = new Date(date.getFullYear(), date.getMonth(), date.getDate());

            return transactionDateOnly.getTime() === compareDateOnly.getTime();
        });
    };

    // Função para calcular o total de entradas e saídas de um dia
    const getDayTotals = (date: Date) => {
        const dayTransactions = getTransactionsForDay(date);
        let entradas = 0;
        let saidas = 0;

        dayTransactions.forEach((transaction) => {
            const valor = Number(transaction.valorCentavos) / 100;
            if (transaction.tipo === 'ENTRADA') {
                entradas += valor;
            } else if (transaction.tipo === 'SAIDA') {
                saidas += valor;
            }
        });

        return { entradas, saidas };
    };

    // Função para lidar com o clique em um dia
    const handleDayClick = (date: Date) => {
        const dayTransactions = getTransactionsForDay(date);
        if (dayTransactions.length > 0) {
            setSelectedDate(date);
            setShowDialog(true);
        }
    };

    // Navegar para o mês anterior
    const goToPreviousMonth = () => {
        setCurrentDate((prev) => {
            const newDate = new Date(prev);
            newDate.setMonth(prev.getMonth() - 1);
            return newDate;
        });
    };

    // Navegar para o próximo mês
    const goToNextMonth = () => {
        setCurrentDate((prev) => {
            const newDate = new Date(prev);
            newDate.setMonth(prev.getMonth() + 1);
            return newDate;
        });
    };

    return (
        <>
            <div className="flex items-center justify-between mb-4">
                <button
                    onClick={goToPreviousMonth}
                    className="rounded p-2 hover:bg-gray-100 dark:hover:bg-gray-800"
                >
                    ←
                </button>
                <span className="text-lg font-semibold">
                    {format(currentDate, 'MMMM yyyy', { locale: ptBR })}
                </span>
                <button
                    onClick={goToNextMonth}
                    className="rounded p-2 hover:bg-gray-100 dark:hover:bg-gray-800"
                >
                    →
                </button>
            </div>

            <div>
                <div className="mb-2 grid grid-cols-7 gap-1">
                    {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map((day) => (
                        <div
                            key={day}
                            className="p-2 text-center text-sm font-medium text-gray-500"
                        >
                            {day}
                        </div>
                    ))}
                </div>
                <div className="grid grid-cols-7 gap-1">
                    {daysInMonth.map((day, index) => {
                        const dayTransactions = getTransactionsForDay(day);
                        const { entradas, saidas } = getDayTotals(day);
                        const isToday = isSameDay(day, new Date());
                        const isCurrentMonth = day.getMonth() === currentDate.getMonth();

                        return (
                            <div
                                key={index}
                                onClick={() => handleDayClick(day)}
                                className={`min-h-[80px] border border-gray-200 p-1 dark:border-gray-700 ${isCurrentMonth ? 'bg-white dark:bg-gray-900' : 'bg-gray-50 dark:bg-gray-800'} ${isToday ? 'ring-2 ring-blue-500' : ''} ${dayTransactions.length > 0 ? 'cursor-pointer bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/20 dark:hover:bg-blue-900/40' : ''} ${dayTransactions.length > 0 ? 'transition-colors duration-200' : ''} `}
                            >
                                <div className="mb-1 text-xs text-gray-500">{format(day, 'd')}</div>
                                {dayTransactions.length > 0 && (
                                    <div className="space-y-1">
                                        {entradas > 0 && (
                                            <div className="text-xs font-medium text-green-600 dark:text-green-400">
                                                +R$ {entradas.toFixed(2)}
                                            </div>
                                        )}
                                        {saidas > 0 && (
                                            <div className="text-xs font-medium text-red-600 dark:text-red-400">
                                                -R$ {saidas.toFixed(2)}
                                            </div>
                                        )}
                                        {dayTransactions.length > 2 && (
                                            <div className="text-xs text-gray-500">
                                                +{dayTransactions.length - 2} mais
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Dialog de Transações */}
            <Dialog open={showDialog} onOpenChange={setShowDialog}>
                <DialogContent className="max-h-[80vh] max-w-md overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>
                            Transações de{' '}
                            {selectedDate
                                ? format(selectedDate, 'dd/MM/yyyy', { locale: ptBR })
                                : ''}
                        </DialogTitle>
                    </DialogHeader>

                    <div className="space-y-3">
                        {selectedDate &&
                            getTransactionsForDay(selectedDate).map((transaction) => {
                                const valor = Number(transaction.valorCentavos) / 100;
                                const isEntrada = transaction.tipo === 'ENTRADA';

                                return (
                                    <div
                                        key={transaction.id}
                                        className={`rounded-lg border p-3 ${
                                            isEntrada
                                                ? 'border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/20'
                                                : 'border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20'
                                        }`}
                                    >
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                <p className="text-sm font-medium">
                                                    {transaction.descricao || 'Sem descrição'}
                                                </p>
                                                <p className="mt-1 text-xs text-gray-500">
                                                    {transaction.tipo}
                                                </p>
                                            </div>
                                            <div
                                                className={`font-semibold ${
                                                    isEntrada
                                                        ? 'text-green-600 dark:text-green-400'
                                                        : 'text-red-600 dark:text-red-400'
                                                }`}
                                            >
                                                {isEntrada ? '+' : '-'}R$ {valor.toFixed(2)}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                    </div>

                    {selectedDate && (
                        <div className="mt-4 border-t border-gray-200 pt-4 dark:border-gray-700">
                            <div className="flex justify-between text-sm">
                                <span className="font-medium text-green-600 dark:text-green-400">
                                    Total Entradas: +R${' '}
                                    {getDayTotals(selectedDate).entradas.toFixed(2)}
                                </span>
                                <span className="font-medium text-red-600 dark:text-red-400">
                                    Total Saídas: -R$ {getDayTotals(selectedDate).saidas.toFixed(2)}
                                </span>
                            </div>
                            <div className="mt-2 text-center font-semibold">
                                Saldo do dia: R${' '}
                                {(
                                    getDayTotals(selectedDate).entradas -
                                    getDayTotals(selectedDate).saidas
                                ).toFixed(2)}
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </>
    );
}
