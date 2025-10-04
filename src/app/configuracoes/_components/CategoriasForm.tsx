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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

import { createCategoria, updateCategoria } from '@/actions/CategotiasActions';
import { useActionState, useEffect, useState } from 'react';

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

type ColorName = keyof typeof CATEGORIA_COLORS;
const CATEGORIA_COLORS = {
    blue: '#3B82F6',
    green: '#10B981',
    amber: '#F59E0B',
    red: '#EF4444',
    purple: '#8B5CF6',
    cyan: '#06B6D4',
    lime: '#84CC16',
    orange: '#F97316',
    pink: '#EC4899',
    gray: '#6B7280',
} as const;

export function CategoriaForm({ open, categoriaId, categoriaData, onClose }: CategoriaFormProps) {
    const isEditing = !!categoriaId && !!categoriaData;
    const [state, formAction] = useActionState<{ errors: string; success?: boolean }, FormData>(
        isEditing ? updateCategoria : createCategoria,
        { errors: '', success: false }
    );

    const [selectedColor, setSelectedColor] = useState<ColorName>(
        (categoriaData?.color as ColorName) || 'blue'
    );

    useEffect(() => {
        if (categoriaData) {
            setSelectedColor((categoriaData.color as ColorName) || 'blue');
        } else {
            setSelectedColor('blue');
        }
    }, [categoriaData, open]);

    useEffect(() => {
        if (state.success) {
            onClose();
        }
    }, [state.success, onClose]);

    return (
        <Dialog open={open} onOpenChange={onClose}>
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

                {state.errors && (
                    <div className="rounded bg-red-100 p-3 text-sm text-red-700">
                        {state.errors}
                    </div>
                )}

                <form action={formAction}>
                    <div className="space-y-4 py-4">
                        {isEditing && <input type="hidden" name="id" value={categoriaData?.id} />}

                        <div className="space-y-2">
                            <Label htmlFor="name">Nome da categoria</Label>
                            <Input
                                id="name"
                                name="name"
                                defaultValue={categoriaData?.name || ''}
                                placeholder="Ex: Compras"
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label>Cor da Categoria</Label>
                            <input type="hidden" name="color" value={selectedColor} />
                            <div className="flex flex-wrap gap-2">
                                {(Object.keys(CATEGORIA_COLORS) as ColorName[]).map((colorName) => (
                                    <button
                                        key={colorName}
                                        type="button"
                                        className={`h-8 w-8 rounded-full border-2 transition-all hover:scale-110 ${
                                            selectedColor === colorName
                                                ? 'ring-ring ring-2 ring-offset-2'
                                                : 'border-transparent'
                                        }`}
                                        style={{ backgroundColor: CATEGORIA_COLORS[colorName] }}
                                        onClick={() => setSelectedColor(colorName)}
                                        aria-label={`Selecionar cor ${colorName}`}
                                    />
                                ))}
                            </div>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={onClose}>
                            Cancelar
                        </Button>
                        <Button type="submit">
                            {isEditing ? 'Salvar Alterações' : 'Criar Categoria'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
