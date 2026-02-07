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

import { createCategoria, updateCategoria } from '@/actions/CategotiasActions';
import { CategoriaSchema } from '@/schemas/categorias';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useState, useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

interface CategoriaFormProps {
    open: boolean;
    categoriaId?: number | null;
    categoriaData?: {
        id: number;
        name: string;
        color: string;
    } | null;
    onClose: () => void;
}

const CATEGORIA_COLORS = [
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

export function CategoriaForm({ open, categoriaId, categoriaData, onClose }: CategoriaFormProps) {
    const isEditing = !!categoriaId && !!categoriaData;
    const [isPending, startTransition] = useTransition();
    const [serverError, setServerError] = useState<string | null>(null);

    const form = useForm<z.infer<typeof CategoriaSchema>>({
        resolver: zodResolver(CategoriaSchema),
        defaultValues: {
            name: categoriaData?.name || '',
            color: categoriaData?.color || CATEGORIA_COLORS[0],
        },
    });

    // Reset form quando categoriaData muda
    useEffect(() => {
        if (categoriaData) {
            form.reset({
                name: categoriaData.name,
                color: categoriaData.color,
            });
        } else {
            form.reset({
                name: '',
                color: CATEGORIA_COLORS[0],
            });
        }
    }, [categoriaData, form]);

    const onSubmit = (data: z.infer<typeof CategoriaSchema>) => {
        setServerError(null);

        const formData = new FormData();
        formData.append('name', data.name);
        formData.append('color', data.color);

        startTransition(async () => {
            const result = isEditing
                ? await updateCategoria(categoriaId, { success: false }, formData)
                : await createCategoria({ success: false }, formData);

            if (result.success) {
                form.reset();
                onClose();
            } else {
                if (result.errors?.name) {
                    form.setError('name', { message: result.errors.name[0] });
                }
                if (result.errors?.color) {
                    form.setError('color', { message: result.errors.color[0] });
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
                    <DialogTitle>
                        {isEditing ? 'Editar Categoria' : 'Adicionar Categoria'}
                    </DialogTitle>
                    <DialogDescription>
                        {isEditing
                            ? 'Faça alterações na categoria.'
                            : 'Adicione uma nova categoria'}
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
                                    <FormLabel>Nome da Categoria</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Ex: Compras" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="color"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Cor da Categoria</FormLabel>
                                    <FormControl>
                                        <div className="flex flex-wrap gap-2">
                                            {CATEGORIA_COLORS.map((color) => (
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
                                      : 'Criar Categoria'}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
