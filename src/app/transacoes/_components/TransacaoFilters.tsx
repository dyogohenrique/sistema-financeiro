'use client';

import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { Categoria, Conta } from '@prisma/client';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { CalendarIcon, Filter, Search, X } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import Select, { MultiValue, StylesConfig } from 'react-select';

// --- Types ---

interface TransacaoFiltersProps {
    data: any[];
    categorias: Categoria[];
    contas: Conta[];
    onFiltersChange: (filtered: any[]) => void;
}

interface Filters {
    search: string;
    dateFrom: Date | undefined;
    dateTo: Date | undefined;
    tipos: string[];
    statuses: string[];
    categoriaIds: number[];
    contaIds: number[];
    valorMin: string;
    valorMax: string;
}

const initialFilters: Filters = {
    search: '',
    dateFrom: undefined,
    dateTo: undefined,
    tipos: [],
    statuses: [],
    categoriaIds: [],
    contaIds: [],
    valorMin: '',
    valorMax: '',
};

interface SelectOption {
    value: string | number;
    label: string;
    color?: string;
}

// --- Label helpers ---

const tipoOptions: SelectOption[] = [
    { value: 'ENTRADA', label: 'Entrada' },
    { value: 'SAIDA', label: 'Saída' },
    { value: 'TRANSFERENCIA', label: 'Transferência' },
];

const statusOptions: SelectOption[] = [
    { value: 'PAGO', label: 'Pago' },
    { value: 'PENDENTE', label: 'Pendente' },
    { value: 'CANCELADO', label: 'Cancelado' },
];

const tipoLabels: Record<string, string> = Object.fromEntries(
    tipoOptions.map((o) => [o.value, o.label])
);
const statusLabels: Record<string, string> = Object.fromEntries(
    statusOptions.map((o) => [o.value, o.label])
);

// --- react-select styles ---

const selectStyles: StylesConfig<SelectOption, true> = {
    control: (base, state) => ({
        ...base,
        minHeight: '36px',
        fontSize: '14px',
        borderColor: state.isFocused ? 'hsl(var(--ring))' : 'hsl(var(--border))',
        backgroundColor: 'hsl(var(--background))',
        boxShadow: state.isFocused ? '0 0 0 2px hsl(var(--ring) / 0.2)' : 'none',
        borderRadius: 'calc(var(--radius) - 2px)',
        '&:hover': {
            borderColor: 'hsl(var(--ring))',
        },
    }),
    menu: (base) => ({
        ...base,
        backgroundColor: 'hsl(var(--popover))',
        border: '1px solid hsl(var(--border))',
        borderRadius: 'calc(var(--radius) - 2px)',
        boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
        zIndex: 50,
    }),
    option: (base, state) => ({
        ...base,
        fontSize: '14px',
        backgroundColor: state.isFocused ? 'hsl(var(--accent))' : 'transparent',
        color: 'hsl(var(--popover-foreground))',
        cursor: 'pointer',
        '&:active': {
            backgroundColor: 'hsl(var(--accent))',
        },
    }),
    multiValue: (base) => ({
        ...base,
        backgroundColor: 'hsl(var(--secondary))',
        borderRadius: 'calc(var(--radius) - 4px)',
    }),
    multiValueLabel: (base) => ({
        ...base,
        color: 'hsl(var(--secondary-foreground))',
        fontSize: '12px',
        padding: '1px 4px',
    }),
    multiValueRemove: (base) => ({
        ...base,
        color: 'hsl(var(--muted-foreground))',
        borderRadius: '0 calc(var(--radius) - 4px) calc(var(--radius) - 4px) 0',
        '&:hover': {
            backgroundColor: 'hsl(var(--destructive))',
            color: 'white',
        },
    }),
    placeholder: (base) => ({
        ...base,
        color: 'hsl(var(--muted-foreground))',
        fontSize: '14px',
    }),
    input: (base) => ({
        ...base,
        color: 'hsl(var(--foreground))',
    }),
    indicatorSeparator: () => ({ display: 'none' }),
    dropdownIndicator: (base) => ({
        ...base,
        padding: '4px',
        color: 'hsl(var(--muted-foreground))',
    }),
    clearIndicator: (base) => ({
        ...base,
        padding: '4px',
        color: 'hsl(var(--muted-foreground))',
        '&:hover': {
            color: 'hsl(var(--destructive))',
        },
    }),
};

// Custom option with color dot
const formatOptionLabel = (option: SelectOption) => (
    <div className="flex items-center gap-2">
        {option.color && (
            <span
                className="inline-block h-2.5 w-2.5 shrink-0 rounded-full"
                style={{ backgroundColor: option.color }}
            />
        )}
        <span>{option.label}</span>
    </div>
);

// --- Component ---

export function TransacaoFilters({
    data,
    categorias,
    contas,
    onFiltersChange,
}: TransacaoFiltersProps) {
    const [filters, setFilters] = useState<Filters>(initialFilters);
    const [showFilters, setShowFilters] = useState(false);

    // Apply all filters
    const filteredData = useMemo(() => {
        let result = data;

        if (filters.search) {
            const lower = filters.search.toLowerCase();
            result = result.filter((row) =>
                String(row.descricao ?? '')
                    .toLowerCase()
                    .includes(lower)
            );
        }

        if (filters.dateFrom || filters.dateTo) {
            result = result.filter((row) => {
                if (!row.data) return false;
                const d = new Date(row.data);
                const rowDate = new Date(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate());
                if (filters.dateFrom) {
                    const from = new Date(
                        filters.dateFrom.getFullYear(),
                        filters.dateFrom.getMonth(),
                        filters.dateFrom.getDate()
                    );
                    if (rowDate < from) return false;
                }
                if (filters.dateTo) {
                    const to = new Date(
                        filters.dateTo.getFullYear(),
                        filters.dateTo.getMonth(),
                        filters.dateTo.getDate()
                    );
                    if (rowDate > to) return false;
                }
                return true;
            });
        }

        if (filters.tipos.length > 0) {
            result = result.filter((row) => filters.tipos.includes(row.tipo));
        }

        if (filters.statuses.length > 0) {
            result = result.filter((row) => filters.statuses.includes(row.status));
        }

        if (filters.categoriaIds.length > 0) {
            result = result.filter((row) => {
                const rowCatIds = (row.categorias ?? []).map((tc: any) => tc.categoria?.id);
                return filters.categoriaIds.some((id) => rowCatIds.includes(id));
            });
        }

        if (filters.contaIds.length > 0) {
            result = result.filter(
                (row) =>
                    filters.contaIds.includes(row.contaOrigemId) ||
                    (row.contaDestinoId && filters.contaIds.includes(row.contaDestinoId))
            );
        }

        if (filters.valorMin) {
            const min = parseFloat(filters.valorMin) * 100;
            result = result.filter((row) => Number(row.valorCentavos) >= min);
        }
        if (filters.valorMax) {
            const max = parseFloat(filters.valorMax) * 100;
            result = result.filter((row) => Number(row.valorCentavos) <= max);
        }

        return result;
    }, [data, filters]);

    useEffect(() => {
        onFiltersChange(filteredData);
    }, [filteredData, onFiltersChange]);

    const updateFilter = useCallback(<K extends keyof Filters>(key: K, value: Filters[K]) => {
        setFilters((prev) => ({ ...prev, [key]: value }));
    }, []);

    const clearFilters = useCallback(() => {
        setFilters(initialFilters);
    }, []);

    const hasActiveFilters = useMemo(() => {
        return (
            filters.dateFrom !== undefined ||
            filters.dateTo !== undefined ||
            filters.tipos.length > 0 ||
            filters.statuses.length > 0 ||
            filters.categoriaIds.length > 0 ||
            filters.contaIds.length > 0 ||
            filters.valorMin !== '' ||
            filters.valorMax !== ''
        );
    }, [filters]);

    const activeFilterBadges = useMemo(() => {
        const badges: { label: string; onRemove: () => void }[] = [];

        if (filters.dateFrom) {
            badges.push({
                label: `De: ${format(filters.dateFrom, 'dd/MM/yyyy')}`,
                onRemove: () => updateFilter('dateFrom', undefined),
            });
        }
        if (filters.dateTo) {
            badges.push({
                label: `Até: ${format(filters.dateTo, 'dd/MM/yyyy')}`,
                onRemove: () => updateFilter('dateTo', undefined),
            });
        }
        filters.tipos.forEach((t) => {
            badges.push({
                label: tipoLabels[t] || t,
                onRemove: () =>
                    updateFilter(
                        'tipos',
                        filters.tipos.filter((v) => v !== t)
                    ),
            });
        });
        filters.statuses.forEach((s) => {
            badges.push({
                label: statusLabels[s] || s,
                onRemove: () =>
                    updateFilter(
                        'statuses',
                        filters.statuses.filter((v) => v !== s)
                    ),
            });
        });
        filters.categoriaIds.forEach((id) => {
            const cat = categorias.find((c) => c.id === id);
            badges.push({
                label: cat?.name || `Cat #${id}`,
                onRemove: () =>
                    updateFilter(
                        'categoriaIds',
                        filters.categoriaIds.filter((v) => v !== id)
                    ),
            });
        });
        filters.contaIds.forEach((id) => {
            const conta = contas.find((c) => c.id === id);
            badges.push({
                label: conta?.name || `Conta #${id}`,
                onRemove: () =>
                    updateFilter(
                        'contaIds',
                        filters.contaIds.filter((v) => v !== id)
                    ),
            });
        });
        if (filters.valorMin) {
            badges.push({
                label: `Min: R$ ${filters.valorMin}`,
                onRemove: () => updateFilter('valorMin', ''),
            });
        }
        if (filters.valorMax) {
            badges.push({
                label: `Max: R$ ${filters.valorMax}`,
                onRemove: () => updateFilter('valorMax', ''),
            });
        }

        return badges;
    }, [filters, categorias, contas, updateFilter]);

    // Build react-select options
    const categoriaSelectOptions: SelectOption[] = useMemo(
        () => categorias.map((c) => ({ value: c.id, label: c.name, color: c.color })),
        [categorias]
    );
    const contaSelectOptions: SelectOption[] = useMemo(
        () => contas.map((c) => ({ value: c.id, label: c.name, color: c.cor })),
        [contas]
    );

    // Current selections as react-select values
    const tipoValue = tipoOptions.filter((o) => filters.tipos.includes(o.value as string));
    const statusValue = statusOptions.filter((o) => filters.statuses.includes(o.value as string));
    const categoriaValue = categoriaSelectOptions.filter((o) =>
        filters.categoriaIds.includes(o.value as number)
    );
    const contaValue = contaSelectOptions.filter((o) =>
        filters.contaIds.includes(o.value as number)
    );

    return (
        <div className="space-y-3">
            {/* Top bar: search + filter toggle */}
            <div className="flex items-center gap-2">
                <div className="relative max-w-sm flex-1">
                    <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
                    <Input
                        placeholder="Pesquisar transação..."
                        value={filters.search}
                        onChange={(e) => updateFilter('search', e.target.value)}
                        className="pl-9"
                    />
                </div>
                <Button
                    variant={showFilters || hasActiveFilters ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setShowFilters(!showFilters)}
                    className="gap-2"
                >
                    <Filter className="h-4 w-4" />
                    Filtros
                    {hasActiveFilters && (
                        <span className="bg-primary-foreground text-primary flex h-5 w-5 items-center justify-center rounded-full text-xs font-bold">
                            {activeFilterBadges.length}
                        </span>
                    )}
                </Button>
                {hasActiveFilters && (
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={clearFilters}
                        className="text-muted-foreground gap-1"
                    >
                        Limpar
                        <X className="h-3 w-3" />
                    </Button>
                )}
            </div>

            {/* Filter panel */}
            {showFilters && (
                <div className="animate-in fade-in-0 slide-in-from-top-2 bg-card space-y-4 rounded-lg border p-4 shadow-sm duration-200">
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {/* Date range */}
                        <div className="min-w-0 space-y-2">
                            <label className="text-sm font-medium">Período</label>
                            <div className="flex items-center gap-2">
                                <div className="min-w-0 flex-1">
                                    <DatePickerButton
                                        date={filters.dateFrom}
                                        onSelect={(d) => updateFilter('dateFrom', d)}
                                        placeholder="De"
                                    />
                                </div>
                                <span className="text-muted-foreground shrink-0 text-sm">→</span>
                                <div className="min-w-0 flex-1">
                                    <DatePickerButton
                                        date={filters.dateTo}
                                        onSelect={(d) => updateFilter('dateTo', d)}
                                        placeholder="Até"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Valor range */}
                        <div className="min-w-0 space-y-2">
                            <label className="text-sm font-medium">Valor (R$)</label>
                            <div className="flex items-center gap-2">
                                <div className="min-w-0 flex-1">
                                    <Input
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        placeholder="Mín"
                                        value={filters.valorMin}
                                        onChange={(e) => updateFilter('valorMin', e.target.value)}
                                    />
                                </div>
                                <span className="text-muted-foreground shrink-0 text-sm">→</span>
                                <div className="min-w-0 flex-1">
                                    <Input
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        placeholder="Máx"
                                        value={filters.valorMax}
                                        onChange={(e) => updateFilter('valorMax', e.target.value)}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Tipo */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Tipo</label>
                            <Select<SelectOption, true>
                                isMulti
                                options={tipoOptions}
                                value={tipoValue}
                                onChange={(selected: MultiValue<SelectOption>) =>
                                    updateFilter(
                                        'tipos',
                                        selected.map((s) => s.value as string)
                                    )
                                }
                                placeholder="Todos os tipos"
                                noOptionsMessage={() => 'Nenhuma opção'}
                                styles={selectStyles}
                                isClearable
                            />
                        </div>

                        {/* Status */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Status</label>
                            <Select<SelectOption, true>
                                isMulti
                                options={statusOptions}
                                value={statusValue}
                                onChange={(selected: MultiValue<SelectOption>) =>
                                    updateFilter(
                                        'statuses',
                                        selected.map((s) => s.value as string)
                                    )
                                }
                                placeholder="Todos os status"
                                noOptionsMessage={() => 'Nenhuma opção'}
                                styles={selectStyles}
                                isClearable
                            />
                        </div>

                        {/* Categorias */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Categorias</label>
                            <Select<SelectOption, true>
                                isMulti
                                options={categoriaSelectOptions}
                                value={categoriaValue}
                                onChange={(selected: MultiValue<SelectOption>) =>
                                    updateFilter(
                                        'categoriaIds',
                                        selected.map((s) => s.value as number)
                                    )
                                }
                                placeholder="Todas as categorias"
                                noOptionsMessage={() => 'Nenhuma categoria'}
                                formatOptionLabel={formatOptionLabel}
                                styles={selectStyles}
                                isClearable
                            />
                        </div>

                        {/* Contas */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Contas</label>
                            <Select<SelectOption, true>
                                isMulti
                                options={contaSelectOptions}
                                value={contaValue}
                                onChange={(selected: MultiValue<SelectOption>) =>
                                    updateFilter(
                                        'contaIds',
                                        selected.map((s) => s.value as number)
                                    )
                                }
                                placeholder="Todas as contas"
                                noOptionsMessage={() => 'Nenhuma conta'}
                                formatOptionLabel={formatOptionLabel}
                                styles={selectStyles}
                                isClearable
                            />
                        </div>
                    </div>
                </div>
            )}

            {/* Active filter badges */}
            {activeFilterBadges.length > 0 && !showFilters && (
                <div className="flex flex-wrap items-center gap-1.5">
                    <span className="text-muted-foreground text-xs">Filtros:</span>
                    {activeFilterBadges.map((badge, i) => (
                        <Badge
                            key={i}
                            variant="secondary"
                            className="cursor-pointer gap-1 pr-1 text-xs"
                            onClick={badge.onRemove}
                        >
                            {badge.label}
                            <X className="h-3 w-3" />
                        </Badge>
                    ))}
                </div>
            )}
        </div>
    );
}

// --- Date picker sub-component ---

function DatePickerButton({
    date,
    onSelect,
    placeholder,
}: {
    date: Date | undefined;
    onSelect: (date: Date | undefined) => void;
    placeholder: string;
}) {
    return (
        <Popover>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    size="sm"
                    className={cn(
                        'w-full justify-start text-left font-normal',
                        !date && 'text-muted-foreground'
                    )}
                >
                    <CalendarIcon className="mr-2 h-3.5 w-3.5" />
                    {date ? format(date, 'dd/MM/yy') : placeholder}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
                <Calendar mode="single" selected={date} onSelect={onSelect} locale={ptBR} />
            </PopoverContent>
        </Popover>
    );
}
