'use client';

import * as React from 'react';
import {
    ColumnDef,
    ColumnFiltersState,
    SortingState,
    flexRender,
    getCoreRowModel,
    getFilteredRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    useReactTable,
} from '@tanstack/react-table';

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';

import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

import { ChevronLeft, ChevronRight, CalendarIcon, X } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';

interface DataTableProps<TData, TValue> {
    columns: ColumnDef<TData, TValue>[];
    data: TData[];
    searchKeys?: string[];
    searchPlaceholder?: string;
    onRowClick?: (row: TData) => void;
    dateFilterKey?: string;
    pageSizeOptions?: number[];
    defaultPageSize?: number;
}

export function DataTable<TData, TValue>({
    columns,
    data,
    searchKeys = [],
    searchPlaceholder = 'Pesquisar',
    onRowClick,
    dateFilterKey,
    pageSizeOptions = [5, 10, 20, 50],
    defaultPageSize = 5,
}: DataTableProps<TData, TValue>) {
    const [dateFilter, setDateFilter] = React.useState<Date | undefined>();
    const [sorting, setSorting] = React.useState<SortingState>([]);
    const isMobile = useIsMobile();
    const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
    const [globalFilter, setGlobalFilter] = React.useState('');

    const filteredData = React.useMemo(() => {
        let result = data;

        // Filter by Date
        if (dateFilter && dateFilterKey) {
            result = result.filter((row) => {
                const value = (row as any)[dateFilterKey];
                if (!value) return false;
                const date = new Date(value);
                // Use UTC methods to avoid timezone offset shifting the day
                return (
                    date.getUTCDate() === dateFilter.getDate() &&
                    date.getUTCMonth() === dateFilter.getMonth() &&
                    date.getUTCFullYear() === dateFilter.getFullYear()
                );
            });
        }

        if (!globalFilter) return result;
        const lower = globalFilter.toLowerCase();
        return result.filter((row) =>
            searchKeys.some((key) => {
                const value = key.split('.').reduce((o, i) => (o as any)?.[i], row);
                const stringValue = String(value ?? '').toLowerCase();

                // Try to handle date formatting
                if (
                    value instanceof Date ||
                    (typeof value === 'string' && !isNaN(Date.parse(value)))
                ) {
                    const date = new Date(value);
                    const formattedDate = date.toLocaleDateString('pt-BR');
                    if (formattedDate.includes(lower)) return true;
                }

                return stringValue.includes(lower);
            })
        );
    }, [data, globalFilter, searchKeys, dateFilter, dateFilterKey]);

    const table = useReactTable({
        data: filteredData,
        columns,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        onSortingChange: setSorting,
        getSortedRowModel: getSortedRowModel(),
        onColumnFiltersChange: setColumnFilters,
        getFilteredRowModel: getFilteredRowModel(),
        state: {
            sorting,
            columnFilters,
            globalFilter,
        },
        onGlobalFilterChange: setGlobalFilter,
        globalFilterFn: () => {
            return true;
        },
        initialState: {
            pagination: {
                pageSize: defaultPageSize,
            },
        },
    });

    const currentPage = table.getState().pagination.pageIndex;
    const totalPages = table.getPageCount();

    // Função para calcular as páginas visíveis no menu de paginação
    const getVisiblePages = () => {
        const pages = [];

        pages.push(0);

        if (currentPage <= 3) {
            for (let i = 1; i <= 4; i++) {
                if (i < totalPages - 1) {
                    pages.push(i);
                }
            }
            if (totalPages > 5) {
                pages.push(-1);
            }
        } else if (currentPage >= totalPages - 4) {
            if (totalPages > 5) {
                pages.push(-1);
            }
            for (let i = totalPages - 5; i < totalPages - 1; i++) {
                if (i > 0) {
                    pages.push(i);
                }
            }
        } else {
            pages.push(-1);
            for (let i = currentPage - 1; i <= currentPage + 1; i++) {
                pages.push(i);
            }
            pages.push(-1);
        }

        if (totalPages > 1) {
            pages.push(totalPages - 1);
        }

        return pages;
    };

    return (
        <div>
            <div>
                {searchKeys.length > 0 && (
                    <div className="flex items-center py-4">
                        <Input
                            placeholder={searchPlaceholder}
                            value={globalFilter}
                            onChange={(event) => setGlobalFilter(event.target.value)}
                            className="max-w-sm"
                        />
                        {dateFilterKey && (
                            <div className="ml-2 flex items-center gap-2">
                                {isMobile ? (
                                    <Input
                                        type="date"
                                        value={dateFilter ? format(dateFilter, 'yyyy-MM-dd') : ''}
                                        onChange={(e) => {
                                            const dateString = e.target.value;
                                            if (!dateString) {
                                                setDateFilter(undefined);
                                                return;
                                            }
                                            const [year, month, day] = dateString
                                                .split('-')
                                                .map(Number);
                                            const date = new Date(year, month - 1, day);
                                            setDateFilter(date);
                                        }}
                                        className="w-[150px]"
                                    />
                                ) : (
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <Button
                                                variant={'outline'}
                                                className={cn(
                                                    'w-[240px] justify-start text-left font-normal',
                                                    !dateFilter && 'text-muted-foreground'
                                                )}
                                            >
                                                <CalendarIcon className="mr-2 h-4 w-4" />
                                                {dateFilter ? (
                                                    format(dateFilter, 'PPP', { locale: ptBR })
                                                ) : (
                                                    <span>Filtrar por data</span>
                                                )}
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-auto p-0" align="start">
                                            <Calendar
                                                mode="single"
                                                selected={dateFilter}
                                                onSelect={setDateFilter}
                                                initialFocus
                                                locale={ptBR}
                                            />
                                        </PopoverContent>
                                    </Popover>
                                )}
                                {dateFilter && (
                                    <Button
                                        variant="ghost"
                                        onClick={() => setDateFilter(undefined)}
                                        className="h-8 px-2 lg:px-3"
                                    >
                                        Limpar
                                        <X className="ml-2 h-4 w-4" />
                                    </Button>
                                )}
                            </div>
                        )}
                    </div>
                )}
                <div className="rounded-md border">
                    <Table>
                        <TableHeader>
                            {table.getHeaderGroups().map((headerGroup) => (
                                <TableRow key={headerGroup.id}>
                                    {headerGroup.headers.map((header) => {
                                        return (
                                            <TableHead key={header.id}>
                                                {header.isPlaceholder
                                                    ? null
                                                    : flexRender(
                                                          header.column.columnDef.header,
                                                          header.getContext()
                                                      )}
                                            </TableHead>
                                        );
                                    })}
                                </TableRow>
                            ))}
                        </TableHeader>
                        <TableBody>
                            {table.getRowModel().rows?.length ? (
                                table.getRowModel().rows.map((row) => (
                                    <TableRow
                                        key={row.id}
                                        data-state={row.getIsSelected() && 'selected'}
                                        onClick={
                                            onRowClick ? () => onRowClick(row.original) : undefined
                                        }
                                        className={
                                            onRowClick ? 'hover:bg-muted/50 cursor-pointer' : ''
                                        }
                                    >
                                        {row.getVisibleCells().map((cell) => (
                                            <TableCell key={cell.id}>
                                                {flexRender(
                                                    cell.column.columnDef.cell,
                                                    cell.getContext()
                                                )}
                                            </TableCell>
                                        ))}
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell
                                        colSpan={columns.length}
                                        className="h-24 text-center"
                                    >
                                        Nenhum resultado.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
            </div>
            <div className="mx-4 flex flex-col items-center justify-between space-y-2 py-4 sm:flex-row sm:space-y-0 sm:space-x-2">
                <div className="text-muted-foreground flex items-center gap-2 text-sm">
                    <span>Itens por página:</span>
                    <Select
                        value={String(table.getState().pagination.pageSize)}
                        onValueChange={(value) => table.setPageSize(Number(value))}
                    >
                        <SelectTrigger className="h-8 w-[70px]">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            {pageSizeOptions.map((size) => (
                                <SelectItem key={size} value={String(size)}>
                                    {size}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <span className="hidden sm:inline">
                        | Página {currentPage + 1} de {totalPages || 1}
                    </span>
                </div>
                <div className="flex items-center space-x-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => table.previousPage()}
                        disabled={!table.getCanPreviousPage()}
                    >
                        <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <div className="hidden items-center gap-1 sm:flex">
                        {getVisiblePages().map((pageIndex, i) => {
                            if (pageIndex === -1) {
                                return (
                                    <Popover key={`ellipsis-${i}`}>
                                        <PopoverTrigger asChild>
                                            <Button variant="ghost" size="sm" className="px-2">
                                                ...
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-40">
                                            <div className="flex flex-col gap-2">
                                                <Label>Ir para página</Label>
                                                <Input
                                                    type="number"
                                                    min={1}
                                                    max={totalPages}
                                                    onChange={(e) => {
                                                        const page = Number(e.target.value) - 1;
                                                        if (page >= 0 && page < totalPages) {
                                                            table.setPageIndex(page);
                                                        }
                                                    }}
                                                />
                                            </div>
                                        </PopoverContent>
                                    </Popover>
                                );
                            }

                            return (
                                <Button
                                    key={pageIndex}
                                    variant={currentPage === pageIndex ? 'default' : 'outline'}
                                    size="sm"
                                    onClick={() => table.setPageIndex(pageIndex)}
                                >
                                    {pageIndex + 1}
                                </Button>
                            );
                        })}
                    </div>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => table.nextPage()}
                        disabled={!table.getCanNextPage()}
                    >
                        <ChevronRight className="h-4 w-4" />
                    </Button>
                </div>
            </div>
        </div>
    );
}
