'use client';

import { ColumnDef } from '@tanstack/react-table';

import { ITransacao } from '@tipos/Transacao';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowDown01, ArrowDown10, MoreHorizontal } from 'lucide-react';

export const columns: ColumnDef<ITransacao>[] = [
    {
        accessorKey: 'id',
        header: ({ column }) => {
            return (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
                    className="flex w-full justify-between"
                >
                    ID
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
            const id = row.original.id;
            return <span className="float-end">{id}</span>;
        },
    },
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
            return (
                <span>
                    {data.toLocaleDateString('pt-BR', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                    })}
                </span>
            );
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
            return (
                <Badge
                    variant={
                        tipo === 'ENTRADA'
                            ? 'success'
                            : tipo === 'SAIDA'
                              ? 'destructive'
                              : tipo === 'TRANSFERENCIA'
                                ? 'outline'
                                : tipo === 'CREDITO'
                                  ? 'success'
                                  : 'default'
                    }
                >
                    {tipo}
                </Badge>
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
            return (
                <div className="flex justify-end">
                    <Button variant="ghost" size="sm">
                        <MoreHorizontal className="h-4 w-4" />
                    </Button>
                </div>
            );
        },
    },
];
