'use client';

import { createCartao, updateCartao } from '@/actions/CartoesActions';
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
import { useActionState, useEffect, useState } from 'react';

interface CreditCardFormProps {
    open: boolean;
    cardId?: string | null;
    cardData?: {
        id: string;
        name: string;
        limite: number;
        currentBalance: number;
        dueDate: number;
        closingDate: number;
        cor: string;
    } | null;
    onClose: () => void;
}

const CARD_COLORS = [
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

export function CartaoForm({ open, cardId, cardData, onClose }: CreditCardFormProps) {
    const isEditing = !!cardId && !!cardData;
    const [state, formAction] = useActionState<{ errors: string; success?: boolean }, FormData>(
        isEditing ? updateCartao : createCartao,
        { errors: '' }
    );

    const [selectedColor, setSelectedColor] = useState(cardData?.cor || CARD_COLORS[0]);
    const [formValues, setFormValues] = useState({
        name: cardData?.name || '',
        limite: cardData?.limite || 0,
        diaFechamento: cardData?.closingDate || '',
        diaVencimento: cardData?.dueDate || '',
        cor: cardData?.cor || CARD_COLORS[0],
    });

    useEffect(() => {
        if (cardData) {
            setSelectedColor(cardData.cor);
            setFormValues({
                name: cardData.name,
                limite: cardData.limite,
                diaFechamento: cardData.closingDate,
                diaVencimento: cardData.dueDate,
                cor: cardData.cor,
            });
        }
    }, [cardData]);

    useEffect(() => {
        if (state.success) {
            onClose();
        }
    }, [state.success, onClose]);

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                    <DialogTitle>{isEditing ? 'Editar Cartão' : 'Novo Cartão'}</DialogTitle>
                    <DialogDescription>
                        {isEditing
                            ? 'Faça alterações nas informações do seu cartão de crédito.'
                            : 'Adicione um novo cartão de crédito ao seu sistema financeiro.'}
                    </DialogDescription>
                </DialogHeader>

                {state.errors && (
                    <div className="rounded bg-red-100 p-3 text-sm text-red-700">
                        {state.errors}
                    </div>
                )}

                <form action={formAction} className="space-y-4">
                    {isEditing && <input type="hidden" name="id" value={cardData?.id} />}

                    <div className="space-y-2">
                        <Label htmlFor="name">Nome do Cartão</Label>
                        <Input
                            id="name"
                            name="name"
                            defaultValue={formValues.name}
                            placeholder="Ex: Cartão de Crédito do Banco do Brasil"
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="limiteCentavos">Limite</Label>
                        <Input
                            id="limiteCentavos"
                            name="limiteCentavos"
                            type="number"
                            step="0.01"
                            defaultValue={formValues.limite}
                            placeholder="Ex: 1000.00"
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="diaFechamento">Dia de Fechamento</Label>
                        <Input
                            id="diaFechamento"
                            name="diaFechamento"
                            type="number"
                            defaultValue={formValues.diaFechamento}
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="diaVencimento">Dia de Vencimento</Label>
                        <Input
                            id="diaVencimento"
                            name="diaVencimento"
                            type="number"
                            defaultValue={formValues.diaVencimento}
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <Label>Cor do Cartão</Label>
                        <input type="hidden" name="cor" value={formValues.cor} />
                        <div className="flex flex-wrap gap-2">
                            {CARD_COLORS.map((color) => (
                                <button
                                    key={color}
                                    type="button"
                                    className={`h-8 w-8 rounded-full border-2 transition-all hover:scale-110 ${
                                        formValues.cor === color
                                            ? 'border-gray-800 ring-2 ring-gray-300'
                                            : 'border-gray-300'
                                    }`}
                                    style={{ backgroundColor: color }}
                                    onClick={() => setFormValues({ ...formValues, cor: color })}
                                />
                            ))}
                        </div>
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={onClose}>
                            Cancelar
                        </Button>
                        <Button type="submit">
                            {isEditing ? 'Salvar Alterações' : 'Criar Cartão'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
