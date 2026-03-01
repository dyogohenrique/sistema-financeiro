'use client';

import { getAllCategorias, quickCreateCategoria } from '@/actions/CategotiasActions';
import { getAllContas } from '@/actions/ContasActions';
import { createTransacao, updateTransacao } from '@/actions/TransacoesActions';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { zodResolver } from '@hookform/resolvers/zod';
import { Categoria, Conta, StatusTransacao, TipoTransacao } from '@prisma/client';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { CalendarIcon } from 'lucide-react';
import { useEffect, useState, useTransition } from 'react';
import { useForm } from 'react-hook-form';
import ReactSelect, { MultiValue, StylesConfig } from 'react-select';
import CreatableSelect from 'react-select/creatable';
import { z } from 'zod';

// --- react-select types & styles ---

interface CategoriaOption {
    value: number;
    label: string;
    color: string;
}

const categoriaSelectStyles: StylesConfig<CategoriaOption, true> = {
    control: (base, state) => ({
        ...base,
        minHeight: '36px',
        fontSize: '14px',
        borderColor: state.isFocused ? 'hsl(var(--ring))' : 'hsl(var(--border))',
        backgroundColor: 'hsl(var(--background))',
        boxShadow: state.isFocused ? '0 0 0 2px hsl(var(--ring) / 0.2)' : 'none',
        borderRadius: 'calc(var(--radius) - 2px)',
        '&:hover': { borderColor: 'hsl(var(--ring))' },
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
        '&:active': { backgroundColor: 'hsl(var(--accent))' },
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
        '&:hover': { backgroundColor: 'hsl(var(--destructive))', color: 'white' },
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
        '&:hover': { color: 'hsl(var(--destructive))' },
    }),
};

const formatCategoriaOptionLabel = (option: CategoriaOption) => (
    <div className="flex items-center gap-2">
        <span
            className="inline-block h-2.5 w-2.5 shrink-0 rounded-full"
            style={{ backgroundColor: option.color }}
        />
        <span>{option.label}</span>
    </div>
);

interface TransacaoFormProps {
    open: boolean;
    transacaoId?: number | null;
    transacaoData?: any | null;
    onClose: () => void;
}

// Schema adaptado para o formulário (valor em reais, não centavos)
const TransacaoFormSchema = z.object({
    tipo: z.enum(['ENTRADA', 'SAIDA', 'TRANSFERENCIA'], {
        message: 'Tipo de transação inválido',
    }),
    valorReais: z.number().positive('Valor deve ser maior que 0'),
    descricao: z.string().optional(),
    envolvido: z.string().optional(),
    data: z.string().optional(),
    status: z.enum(['PAGO', 'PENDENTE', 'CANCELADO'], {
        message: 'Status de transação inválido',
    }),
    categoriaIds: z.array(z.number()).min(1, 'Pelo menos uma categoria é obrigatória'),
    contaOrigemId: z.string().min(1, 'Conta de origem é obrigatória'),
    contaDestinoId: z.string().optional(),
});

type TransacaoFormData = z.infer<typeof TransacaoFormSchema>;

export function TransacaoForm({ open, transacaoId, transacaoData, onClose }: TransacaoFormProps) {
    const [categorias, setCategorias] = useState<Categoria[]>([]);
    const [contas, setContas] = useState<Conta[]>([]);
    const [isPending, startTransition] = useTransition();
    const [serverError, setServerError] = useState<string | null>(null);
    const isEditing = !!transacaoId && !!transacaoData;

    const form = useForm<TransacaoFormData>({
        resolver: zodResolver(TransacaoFormSchema),
        defaultValues: {
            tipo: 'ENTRADA',
            valorReais: 0,
            descricao: '',
            envolvido: '',
            data: '',
            status: 'PAGO',
            categoriaIds: [],
            contaOrigemId: '',
            contaDestinoId: '',
        },
    });

    const tipoAtual = form.watch('tipo');
    const categoriasSelecionadas = form.watch('categoriaIds');
    const mostrarContaDestino = tipoAtual === 'TRANSFERENCIA';

    useEffect(() => {
        if (open) {
            fetchCategorias();
            fetchContas();
        }
    }, [open]);

    useEffect(() => {
        if (transacaoData) {
            const categoriasIds = transacaoData.categorias?.map((tc: any) => tc.categoria.id) || [];
            form.reset({
                tipo: transacaoData.tipo,
                valorReais: Number(transacaoData.valorCentavos) / 100,
                descricao: transacaoData.descricao || '',
                envolvido: transacaoData.envolvido || '',
                data: formatarData(transacaoData.data),
                status: transacaoData.status,
                categoriaIds: categoriasIds,
                contaOrigemId: transacaoData.contaOrigemId?.toString() || '',
                contaDestinoId: transacaoData.contaDestinoId?.toString() || '',
            });
        } else {
            form.reset({
                tipo: 'ENTRADA',
                valorReais: 0,
                descricao: '',
                envolvido: '',
                data: '',
                status: 'PAGO',
                categoriaIds: [],
                contaOrigemId: '',
                contaDestinoId: '',
            });
        }
    }, [transacaoData, form]);

    const fetchCategorias = async () => {
        const result = await getAllCategorias();
        setCategorias(result);
    };

    const fetchContas = async () => {
        const result = await getAllContas();
        setContas(result.filter((conta) => conta.ativa));
    };

    const formatarData = (data: string | Date | null) => {
        if (!data) return '';
        const date = new Date(data);
        return date.toISOString().split('T')[0];
    };

    // Build options for react-select
    const categoriaOptions: CategoriaOption[] = categorias.map((c) => ({
        value: c.id,
        label: c.name,
        color: c.color,
    }));
    const categoriaValue = categoriaOptions.filter((o) => categoriasSelecionadas.includes(o.value));

    const onSubmit = (data: TransacaoFormData) => {
        setServerError(null);

        const formData = new FormData();
        formData.append('tipo', data.tipo);
        formData.append('valorCentavos', data.valorReais.toString());
        formData.append('descricao', data.descricao || '');
        formData.append('envolvido', data.envolvido || '');
        formData.append('data', data.data || '');
        formData.append('status', data.status);
        formData.append('categorias', data.categoriaIds.join(','));
        formData.append('contaOrigemId', data.contaOrigemId);
        if (data.contaDestinoId) {
            formData.append('contaDestinoId', data.contaDestinoId);
        }

        startTransition(async () => {
            const result = isEditing
                ? await updateTransacao(transacaoId, { success: false }, formData)
                : await createTransacao({ success: false }, formData);

            if (result.success) {
                form.reset();
                onClose();
            } else {
                if (result.errors?.tipo) {
                    form.setError('tipo', { message: result.errors.tipo[0] });
                }
                if (result.errors?.valorCentavos) {
                    form.setError('valorReais', { message: result.errors.valorCentavos[0] });
                }
                if (result.errors?.categoriaIds) {
                    form.setError('categoriaIds', { message: result.errors.categoriaIds[0] });
                }
                if (result.errors?.contaOrigemId) {
                    form.setError('contaOrigemId', { message: result.errors.contaOrigemId[0] });
                }
                if (result.errors?.contaDestinoId) {
                    form.setError('contaDestinoId', { message: result.errors.contaDestinoId[0] });
                }
                if (result.message) {
                    setServerError(result.message);
                }
            }
        });
    };

    const handleOpenChange = (isOpen: boolean) => {
        if (!isOpen) {
            form.reset();
            setServerError(null);
            onClose();
        }
    };

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogContent className="sm:max-w-[900px]">
                <DialogHeader>
                    <DialogTitle>{isEditing ? 'Editar Transação' : 'Nova Transação'}</DialogTitle>
                </DialogHeader>

                {serverError && (
                    <div className="rounded bg-red-100 p-3 text-sm text-red-700">{serverError}</div>
                )}

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                            <FormField
                                control={form.control}
                                name="tipo"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Tipo *</FormLabel>
                                        <Select onValueChange={field.onChange} value={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Selecione o tipo" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value={TipoTransacao.ENTRADA}>
                                                    Entrada
                                                </SelectItem>
                                                <SelectItem value={TipoTransacao.SAIDA}>
                                                    Saída
                                                </SelectItem>
                                                <SelectItem value={TipoTransacao.TRANSFERENCIA}>
                                                    Transferência
                                                </SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="status"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Status *</FormLabel>
                                        <Select onValueChange={field.onChange} value={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Selecione o status" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value={StatusTransacao.PENDENTE}>
                                                    Pendente
                                                </SelectItem>
                                                <SelectItem value={StatusTransacao.PAGO}>
                                                    Pago
                                                </SelectItem>
                                                <SelectItem value={StatusTransacao.CANCELADO}>
                                                    Cancelado
                                                </SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                            <FormField
                                control={form.control}
                                name="valorReais"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Valor (R$) *</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="number"
                                                step="0.01"
                                                min="0.01"
                                                placeholder="0,00"
                                                {...field}
                                                onChange={(e) =>
                                                    field.onChange(parseFloat(e.target.value) || 0)
                                                }
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="data"
                                render={({ field }) => (
                                    <FormItem className="flex flex-col">
                                        <FormLabel>Data</FormLabel>
                                        <Popover>
                                            <PopoverTrigger asChild>
                                                <FormControl>
                                                    <Button
                                                        variant="outline"
                                                        className={cn(
                                                            'w-full pl-3 text-left font-normal',
                                                            !field.value && 'text-muted-foreground'
                                                        )}
                                                    >
                                                        {field.value ? (
                                                            format(
                                                                new Date(field.value + 'T00:00:00'),
                                                                'dd/MM/yyyy'
                                                            )
                                                        ) : (
                                                            <span>Selecione uma data</span>
                                                        )}
                                                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                                    </Button>
                                                </FormControl>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-auto p-0" align="start">
                                                <Calendar
                                                    mode="single"
                                                    selected={
                                                        field.value
                                                            ? new Date(field.value + 'T00:00:00')
                                                            : undefined
                                                    }
                                                    onSelect={(date) =>
                                                        field.onChange(
                                                            date ? format(date, 'yyyy-MM-dd') : ''
                                                        )
                                                    }
                                                    locale={ptBR}
                                                />
                                            </PopoverContent>
                                        </Popover>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <FormField
                            control={form.control}
                            name="descricao"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Descrição</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Descrição da transação" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="envolvido"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Envolvido</FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder="Pessoa ou empresa envolvida"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="categoriaIds"
                            render={() => (
                                <FormItem>
                                    <FormLabel>Categorias *</FormLabel>
                                    <FormControl>
                                        <CreatableSelect<CategoriaOption, true>
                                            isMulti
                                            options={categoriaOptions}
                                            value={categoriaValue}
                                            onChange={(selected: MultiValue<CategoriaOption>) =>
                                                form.setValue(
                                                    'categoriaIds',
                                                    selected.map((s) => s.value),
                                                    { shouldValidate: true }
                                                )
                                            }
                                            onCreateOption={async (inputValue: string) => {
                                                try {
                                                    const newCat =
                                                        await quickCreateCategoria(inputValue);
                                                    setCategorias((prev) => [newCat, ...prev]);
                                                    const currentIds =
                                                        form.getValues('categoriaIds');
                                                    form.setValue(
                                                        'categoriaIds',
                                                        [...currentIds, newCat.id],
                                                        { shouldValidate: true }
                                                    );
                                                } catch (e) {
                                                    console.error('Erro ao criar categoria:', e);
                                                }
                                            }}
                                            formatCreateLabel={(inputValue: string) =>
                                                `Criar "${inputValue}"`
                                            }
                                            placeholder="Selecione ou crie categorias"
                                            noOptionsMessage={() =>
                                                'Digite para criar uma categoria'
                                            }
                                            formatOptionLabel={formatCategoriaOptionLabel}
                                            styles={categoriaSelectStyles}
                                            isClearable
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                            <FormField
                                control={form.control}
                                name="contaOrigemId"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Conta de Origem *</FormLabel>
                                        <Select onValueChange={field.onChange} value={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Selecione a conta" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {contas.map((conta) => (
                                                    <SelectItem
                                                        key={conta.id}
                                                        value={conta.id.toString()}
                                                    >
                                                        <div className="flex items-center gap-2">
                                                            <div
                                                                className="h-3 w-3 rounded-full"
                                                                style={{
                                                                    backgroundColor: conta.cor,
                                                                }}
                                                            />
                                                            {conta.name} - {conta.tipo}
                                                        </div>
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {mostrarContaDestino && (
                                <FormField
                                    control={form.control}
                                    name="contaDestinoId"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Conta de Destino *</FormLabel>
                                            <Select
                                                onValueChange={field.onChange}
                                                value={field.value}
                                            >
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Selecione a conta de destino" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    {contas.map((conta) => (
                                                        <SelectItem
                                                            key={conta.id}
                                                            value={conta.id.toString()}
                                                        >
                                                            <div className="flex items-center gap-2">
                                                                <div
                                                                    className="h-3 w-3 rounded-full"
                                                                    style={{
                                                                        backgroundColor: conta.cor,
                                                                    }}
                                                                />
                                                                {conta.name} - {conta.tipo}
                                                            </div>
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            )}
                        </div>

                        <DialogFooter>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => handleOpenChange(false)}
                                disabled={isPending}
                            >
                                Cancelar
                            </Button>
                            <Button type="submit" disabled={isPending}>
                                {isPending
                                    ? 'Salvando...'
                                    : isEditing
                                      ? 'Atualizar Transação'
                                      : 'Criar Transação'}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
