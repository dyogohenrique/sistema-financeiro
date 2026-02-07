'use client';

import { getAllCategorias } from '@/actions/CategotiasActions';
import { getAllContas } from '@/actions/ContasActions';
import { createTransacao, updateTransacao } from '@/actions/TransacoesActions';
import { Button } from '@/components/ui/button';
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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { zodResolver } from '@hookform/resolvers/zod';
import { Categoria, Conta, StatusTransacao, TipoTransacao } from '@prisma/client';
import { useEffect, useState, useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

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

    const handleCategoriaToggle = (categoriaId: number) => {
        const current = form.getValues('categoriaIds');
        if (current.includes(categoriaId)) {
            form.setValue(
                'categoriaIds',
                current.filter((id) => id !== categoriaId)
            );
        } else {
            form.setValue('categoriaIds', [...current, categoriaId]);
        }
    };

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
                                    <FormItem>
                                        <FormLabel>Data</FormLabel>
                                        <FormControl>
                                            <Input type="date" {...field} />
                                        </FormControl>
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
                                        <div className="grid max-h-40 grid-cols-2 gap-2 overflow-y-auto rounded-md border p-2">
                                            {categorias.map((categoria) => (
                                                <div
                                                    key={categoria.id}
                                                    className={`flex cursor-pointer items-center gap-2 rounded p-2 transition-colors ${
                                                        categoriasSelecionadas.includes(
                                                            categoria.id
                                                        )
                                                            ? 'border-blue-300 bg-blue-100'
                                                            : 'hover:bg-gray-50'
                                                    }`}
                                                    onClick={() =>
                                                        handleCategoriaToggle(categoria.id)
                                                    }
                                                >
                                                    <input
                                                        type="checkbox"
                                                        checked={categoriasSelecionadas.includes(
                                                            categoria.id
                                                        )}
                                                        onChange={() =>
                                                            handleCategoriaToggle(categoria.id)
                                                        }
                                                        className="rounded"
                                                    />
                                                    <div
                                                        className="h-3 w-3 rounded-full"
                                                        style={{ backgroundColor: categoria.color }}
                                                    />
                                                    <span className="text-sm">
                                                        {categoria.name}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
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
