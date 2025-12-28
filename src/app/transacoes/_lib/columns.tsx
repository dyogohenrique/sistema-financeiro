'use client';

import { ColumnDef } from '@tanstack/react-table';
import { formatInTimeZone } from 'date-fns-tz';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowDown01, ArrowDown10, Edit, Trash2 } from 'lucide-react';

interface ColumnsProps {
    onEdit: (id: number) => void;
    onDelete: (id: number) => void;
}

export const createColumns = ({ onEdit, onDelete }: ColumnsProps): ColumnDef<any>[] => [
    {
        accessorKey: 'data',
        header: ({ column }) => {
            return (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
                    className="flex w-full justify-between"
                >
                    Data
                    {column.getIsSorted() === 'asc' ? (
                        <ArrowDown01 className="ml-2 h-4 w-4" />
                    ) : column.getIsSorted() === 'desc' ? (
                        <ArrowDown10 className="ml-2 h-4 w-4" />
                    ) : (
                        <ArrowDown01 className="ml-2 h-4 w-4 opacity-30" />
                    )}
                </Button>
            );
        },
        cell: ({ row }) => {
            const data = row.original.data;
            // 2. Formate a data em UTC para evitar a conversão de fuso horário
            const dataFormatada = formatInTimeZone(data, 'Etc/UTC', 'dd/MM/yyyy');
            return <span>{dataFormatada}</span>;
        },
    },
    {
        accessorKey: 'descricao',
        header: 'Descrição',
        cell: ({ row }) => {
            const descricao = row.original.descricao;
            return (
                <span>
                    {descricao
                        ? descricao.length > 30
                            ? descricao.substring(0, 30) + '...'
                            : descricao
                        : '-'}
                </span>
            );
        },
    },
    {
        accessorKey: 'tipo',
        header: 'Tipo',
        cell: ({ row }) => {
            const tipo = row.original.tipo;
            const getTipoLabel = (tipo: string) => {
                switch (tipo) {
                    case 'ENTRADA':
                        return 'Entrada';
                    case 'SAIDA':
                        return 'Saída';
                    case 'TRANSFERENCIA':
                        return 'Transferência';
                    default:
                        return tipo;
                }
            };
            return (
                <Badge
                    variant={
                        tipo === 'ENTRADA'
                            ? 'success'
                            : tipo === 'SAIDA'
                              ? 'destructive'
                              : tipo === 'TRANSFERENCIA'
                                ? 'outline'
                                : 'default'
                    }
                >
                    {getTipoLabel(tipo)}
                </Badge>
            );
        },
    },
    {
        accessorKey: 'status',
        header: 'Status',
        cell: ({ row }) => {
            const status = row.original.status;
            const getStatusLabel = (status: string) => {
                switch (status) {
                    case 'PAGO':
                        return 'Pago';
                    case 'PENDENTE':
                        return 'Pendente';
                    case 'CANCELADO':
                        return 'Cancelado';
                    default:
                        return status;
                }
            };
            return (
                <Badge
                    variant={
                        status === 'PAGO'
                            ? 'success'
                            : status === 'PENDENTE'
                              ? 'secondary'
                              : status === 'CANCELADO'
                                ? 'destructive'
                                : 'default'
                    }
                >
                    {getStatusLabel(status)}
                </Badge>
            );
        },
    },
    {
        accessorKey: 'categorias',
        header: 'Categorias',
        cell: ({ row }) => {
            const categorias = row.original.categorias;
            if (!categorias || categorias.length === 0) {
                return <span>-</span>;
            }

            return (
                <div className="flex flex-wrap gap-1">
                    {categorias.map((tc: any, index: number) => (
                        <div
                            key={index}
                            className="flex items-center gap-1 rounded-full bg-gray-100 px-2 py-1 text-xs"
                        >
                            <div
                                className="h-2 w-2 rounded-full"
                                style={{ backgroundColor: tc.categoria?.color || '#gray' }}
                            />
                            <span>{tc.categoria?.name || '-'}</span>
                        </div>
                    ))}
                </div>
            );
        },
    },
    {
        accessorKey: 'contaOrigem',
        header: 'Conta',
        cell: ({ row }) => {
            const contaOrigem = row.original.contaOrigem;
            const contaDestino = row.original.contaDestino;
            const tipo = row.original.tipo;

            if (tipo === 'TRANSFERENCIA' && contaDestino) {
                return (
                    <div className="text-sm">
                        <div className="flex items-center gap-1">
                            <div
                                className="h-2 w-2 rounded-full"
                                style={{ backgroundColor: contaOrigem?.cor || '#gray' }}
                            />
                            {contaOrigem?.name || '-'}
                        </div>
                        <div className="text-xs text-gray-500">→</div>
                        <div className="flex items-center gap-1">
                            <div
                                className="h-2 w-2 rounded-full"
                                style={{ backgroundColor: contaDestino?.cor || '#gray' }}
                            />
                            {contaDestino?.name || '-'}
                        </div>
                    </div>
                );
            }

            return (
                <div className="flex items-center gap-2">
                    <div
                        className="h-3 w-3 rounded-full"
                        style={{ backgroundColor: contaOrigem?.cor || '#gray' }}
                    />
                    <span>{contaOrigem?.name || '-'}</span>
                </div>
            );
        },
    },
    {
        accessorKey: 'valorCentavos',
        header: 'Valor',
        cell: ({ row }) => {
            const valor = Number(row.original.valorCentavos) / 100;
            return (
                <span>{valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
            );
        },
    },
    {
        accessorKey: 'actions',
        header: '',
        cell: ({ row }) => {
            const transacao = row.original;
            return (
                <div className="flex justify-end gap-2">
                    <Button variant="ghost" size="sm" onClick={() => onEdit(transacao.id)}>
                        <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => onDelete(transacao.id)}>
                        <Trash2 className="h-4 w-4" />
                    </Button>
                </div>
            );
        },
    },
];
