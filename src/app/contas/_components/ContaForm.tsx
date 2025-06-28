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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';

import { createContas, updateConta } from '@/actions/ContasActions';
import { TipoConta } from '@prisma/client';
import { useActionState, useEffect, useState } from 'react';

interface AccountFormProps {
    open: boolean;
    contaId?: number | null;
    contaData?: {
        id: number;
        name: string;
        tipo: TipoConta;
        saldoCentavos: bigint;
        cor: string;
    } | null;
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

export function ContaForm({ open, contaId, contaData, onClose }: AccountFormProps) {
    const isEditing = !!contaId && !!contaData;
    const [state, formAction] = useActionState<{ errors: string; success?: boolean }, FormData>(
        isEditing ? updateConta : createContas,
        { errors: '', success: false }
    );

    const [selectedColor, setSelectedColor] = useState(contaData?.cor || ACCOUNT_COLORS[0]);
    const [formValues, setFormValues] = useState({
        name: contaData?.name || '',
        tipo: contaData?.tipo || TipoConta.CORRENTE,
        saldoCentavos: contaData ? Number(contaData.saldoCentavos) / 100 : 0,
    });

    useEffect(() => {
        if (contaData) {
            setSelectedColor(contaData.cor);
            setFormValues({
                name: contaData.name,
                tipo: contaData.tipo,
                saldoCentavos: Number(contaData.saldoCentavos) / 100,
            });
        }
    }, [contaData]);

    useEffect(() => {
        if (state.success) {
            onClose();
        }
    }, [state.success, onClose]);

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>{isEditing ? 'Editar Conta' : 'Nova Conta'}</DialogTitle>
                    <DialogDescription>
                        {isEditing
                            ? 'Faça alterações nas informações da sua conta bancária.'
                            : 'Adicione uma nova conta bancária ao seu sistema financeiro.'}
                    </DialogDescription>
                </DialogHeader>

                {state.errors && (
                    <div className="rounded bg-red-100 p-3 text-sm text-red-700">
                        {state.errors}
                    </div>
                )}

                <form action={formAction} className="space-y-4">
                    {isEditing && <input type="hidden" name="id" value={contaData?.id} />}

                    <div className="space-y-2">
                        <Label htmlFor="name">Nome da Conta</Label>
                        <Input
                            id="name"
                            name="name"
                            defaultValue={formValues.name}
                            placeholder="Ex: Conta Corrente Banco do Brasil"
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="type">Tipo de Conta</Label>
                        <Select name="tipo" defaultValue={formValues.tipo}>
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value={TipoConta.CORRENTE}>Conta Corrente</SelectItem>
                                <SelectItem value={TipoConta.POUPANCA}>Poupança</SelectItem>
                                <SelectItem value={TipoConta.INVESTIMENTO}>Investimento</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="balance">Saldo {isEditing ? 'Atual' : 'Inicial'}</Label>
                        <Input
                            id="balance"
                            type="number"
                            step="0.01"
                            name="saldoCentavos"
                            defaultValue={formValues.saldoCentavos}
                            placeholder="0,00"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label>Cor da Conta</Label>
                        <input type="hidden" name="cor" value={selectedColor} />
                        <div className="flex flex-wrap gap-2">
                            {ACCOUNT_COLORS.map((color) => (
                                <button
                                    key={color}
                                    type="button"
                                    className={`h-8 w-8 rounded-full border-2 transition-all hover:scale-110 ${
                                        selectedColor === color
                                            ? 'border-gray-800 ring-2 ring-gray-300'
                                            : 'border-gray-300'
                                    }`}
                                    style={{ backgroundColor: color }}
                                    onClick={() => setSelectedColor(color)}
                                />
                            ))}
                        </div>
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={onClose}>
                            Cancelar
                        </Button>
                        <Button type="submit">
                            {isEditing ? 'Salvar Alterações' : 'Criar Conta'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
