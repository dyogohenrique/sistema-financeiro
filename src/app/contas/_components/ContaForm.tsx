'use client';

import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
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

import { createConta, updateConta } from '@/actions/ContasActions';
import { ContaSchema } from '@/schemas/contas';
import { zodResolver } from '@hookform/resolvers/zod';
import { Conta, TipoConta } from '@prisma/client';
import { useEffect, useState, useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

interface ContaFormProps {
    open: boolean;
    contaId?: number | null;
    contaData?: Conta | null;
    onClose: () => void;
}

const ACCOUNT_COLORS = [
    '#3B82F6',
    '#10B981',
    '#F59E0B',
    '#EF4444',
    '#8B5CF6',
    '#06B6D4',
    '#84CC16',
    '#F97316',
    '#EC4899',
    '#6B7280',
];

export function ContaForm({ open, contaId, contaData, onClose }: ContaFormProps) {
    const isEditing = !!contaId && !!contaData;
    const [isPending, startTransition] = useTransition();
    const [serverError, setServerError] = useState<string | null>(null);

    const form = useForm<z.infer<typeof ContaSchema>>({
        resolver: zodResolver(ContaSchema),
        defaultValues: {
            name: contaData?.name || '',
            tipo: contaData?.tipo || TipoConta.CORRENTE,
            cor: contaData?.cor || ACCOUNT_COLORS[0],
        },
    });

    // Reset form quando contaData muda
    useEffect(() => {
        if (contaData) {
            form.reset({
                name: contaData.name,
                tipo: contaData.tipo,
                cor: contaData.cor,
            });
        } else {
            form.reset({
                name: '',
                tipo: TipoConta.CORRENTE,
                cor: ACCOUNT_COLORS[0],
            });
        }
    }, [contaData, form]);

    const onSubmit = (data: z.infer<typeof ContaSchema>) => {
        setServerError(null);

        const formData = new FormData();
        formData.append('name', data.name);
        formData.append('tipo', data.tipo);
        formData.append('cor', data.cor);

        startTransition(async () => {
            const result = isEditing
                ? await updateConta(contaId, { success: false }, formData)
                : await createConta({ success: false }, formData);

            if (result.success) {
                form.reset();
                onClose();
            } else {
                if (result.errors?.name) {
                    form.setError('name', { message: result.errors.name[0] });
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
            <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                    <DialogTitle>{isEditing ? 'Editar Conta' : 'Nova Conta'}</DialogTitle>
                    <DialogDescription>
                        {isEditing
                            ? 'Faça alterações nas informações da sua conta bancária.'
                            : 'Adicione uma nova conta bancária ao seu sistema financeiro.'}
                    </DialogDescription>
                </DialogHeader>

                {serverError && (
                    <div className="rounded bg-red-100 p-3 text-sm text-red-700">{serverError}</div>
                )}

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Nome da Conta</FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder="Ex: Conta Corrente Banco do Brasil"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="tipo"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Tipo de Conta</FormLabel>
                                    <Select
                                        onValueChange={field.onChange}
                                        defaultValue={field.value}
                                        value={field.value}
                                    >
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            <SelectItem value={TipoConta.CORRENTE}>
                                                Conta Corrente
                                            </SelectItem>
                                            <SelectItem value={TipoConta.POUPANCA}>
                                                Poupança
                                            </SelectItem>
                                            <SelectItem value={TipoConta.INVESTIMENTO}>
                                                Investimento
                                            </SelectItem>
                                            <SelectItem value={TipoConta.SALARIO}>
                                                Conta Salário
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="cor"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Cor da Conta</FormLabel>
                                    <FormControl>
                                        <div className="flex flex-wrap gap-2">
                                            {ACCOUNT_COLORS.map((color) => (
                                                <button
                                                    key={color}
                                                    type="button"
                                                    className={`h-8 w-8 rounded-full border-2 transition-all hover:scale-110 ${
                                                        field.value === color
                                                            ? 'border-gray-800 ring-2 ring-gray-300'
                                                            : 'border-gray-300'
                                                    }`}
                                                    style={{ backgroundColor: color }}
                                                    onClick={() => field.onChange(color)}
                                                />
                                            ))}
                                        </div>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

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
                                      ? 'Salvar Alterações'
                                      : 'Criar Conta'}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
