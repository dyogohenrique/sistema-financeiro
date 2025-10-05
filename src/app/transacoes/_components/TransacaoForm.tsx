'use client';

import { getAllCategorias } from '@/actions/CategotiasActions';
import { getAllContas } from '@/actions/ContasActions';
import { createTransacao, updateTransacao } from '@/actions/TransacoesActions';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Categoria, Conta, StatusTransacao, TipoTransacao } from '@prisma/client';
import { useActionState, useEffect, useState } from 'react';

interface TransacaoFormProps {
    open: boolean;
    transacaoId?: number | null;
    transacaoData?: any | null;
    onClose: () => void;
}

export function TransacaoForm({ open, transacaoId, transacaoData, onClose }: TransacaoFormProps) {
    const [categorias, setCategorias] = useState<Categoria[]>([]);
    const [contas, setContas] = useState<Conta[]>([]);
    const [tipo, setTipo] = useState<TipoTransacao>(TipoTransacao.ENTRADA);
    const [mostrarContaDestino, setMostrarContaDestino] = useState(false);
    const [categoriasSelecionadas, setCategoriasSelecionadas] = useState<number[]>([]);

    const [state, formAction] = useActionState(transacaoId ? updateTransacao : createTransacao, {
        errors: '',
        success: false,
    });

    useEffect(() => {
        if (open) {
            fetchCategorias();
            fetchContas();
        }
    }, [open]);

    useEffect(() => {
        if (transacaoData) {
            setTipo(transacaoData.tipo);
            setMostrarContaDestino(transacaoData.tipo === TipoTransacao.TRANSFERENCIA);
            // Carregar categorias selecionadas
            if (transacaoData.categorias) {
                const ids = transacaoData.categorias.map((tc: any) => tc.categoria.id);
                setCategoriasSelecionadas(ids);
            }
        } else {
            setTipo(TipoTransacao.ENTRADA);
            setMostrarContaDestino(false);
            setCategoriasSelecionadas([]);
        }
    }, [transacaoData]);

    useEffect(() => {
        if (state.success) {
            onClose();
        }
    }, [state.success, onClose]);

    const fetchCategorias = async () => {
        const categorias = await getAllCategorias();
        setCategorias(categorias);
    };

    const fetchContas = async () => {
        const contas = await getAllContas();
        setContas(contas.filter((conta) => conta.ativa));
    };

    const handleTipoChange = (novoTipo: TipoTransacao) => {
        setTipo(novoTipo);
        setMostrarContaDestino(novoTipo === TipoTransacao.TRANSFERENCIA);
    };

    const handleCategoriaToggle = (categoriaId: number) => {
        setCategoriasSelecionadas((prev) => {
            if (prev.includes(categoriaId)) {
                return prev.filter((id) => id !== categoriaId);
            } else {
                return [...prev, categoriaId];
            }
        });
    };

    const formatarData = (data: string | Date | null) => {
        if (!data) return '';
        const date = new Date(data);
        return date.toISOString().split('T')[0];
    };

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[900px]">
                <DialogHeader>
                    <DialogTitle>{transacaoId ? 'Editar Transação' : 'Nova Transação'}</DialogTitle>
                </DialogHeader>

                <form action={formAction} className="space-y-4">
                    {transacaoId && <input type="hidden" name="id" value={transacaoId} />}

                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                            <Label htmlFor="tipo">Tipo *</Label>
                            <Select
                                name="tipo"
                                value={tipo}
                                onValueChange={(value) => handleTipoChange(value as TipoTransacao)}
                                required
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Selecione o tipo" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value={TipoTransacao.ENTRADA}>Entrada</SelectItem>
                                    <SelectItem value={TipoTransacao.SAIDA}>Saída</SelectItem>
                                    <SelectItem value={TipoTransacao.TRANSFERENCIA}>
                                        Transferência
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="status">Status *</Label>
                            <Select
                                name="status"
                                defaultValue={transacaoData?.status || StatusTransacao.PAGO}
                                required
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Selecione o status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value={StatusTransacao.PENDENTE}>
                                        Pendente
                                    </SelectItem>
                                    <SelectItem value={StatusTransacao.PAGO}>Pago</SelectItem>
                                    <SelectItem value={StatusTransacao.CANCELADO}>
                                        Cancelado
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                            <Label htmlFor="valorCentavos">Valor (R$) *</Label>
                            <Input
                                type="number"
                                name="valorCentavos"
                                step="0.01"
                                min="0.01"
                                placeholder="0,00"
                                defaultValue={
                                    transacaoData
                                        ? (Number(transacaoData.valorCentavos) / 100).toFixed(2)
                                        : ''
                                }
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="data">Data</Label>
                            <Input
                                type="date"
                                name="data"
                                defaultValue={formatarData(transacaoData?.data)}
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="descricao">Descrição</Label>
                        <Input
                            name="descricao"
                            placeholder="Descrição da transação"
                            defaultValue={transacaoData?.descricao || ''}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="envolvido">Envolvido</Label>
                        <Input
                            name="envolvido"
                            placeholder="Pessoa ou empresa envolvida"
                            defaultValue={transacaoData?.envolvido || ''}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label>Categorias *</Label>
                        <div className="grid max-h-40 grid-cols-2 gap-2 overflow-y-auto rounded-md border p-2">
                            {categorias.map((categoria) => (
                                <div
                                    key={categoria.id}
                                    className={`flex cursor-pointer items-center gap-2 rounded p-2 transition-colors ${
                                        categoriasSelecionadas.includes(categoria.id)
                                            ? 'border-blue-300 bg-blue-100'
                                            : 'hover:bg-gray-50'
                                    }`}
                                    onClick={() => handleCategoriaToggle(categoria.id)}
                                >
                                    <input
                                        type="checkbox"
                                        checked={categoriasSelecionadas.includes(categoria.id)}
                                        onChange={() => handleCategoriaToggle(categoria.id)}
                                        className="rounded"
                                    />
                                    <div
                                        className="h-3 w-3 rounded-full"
                                        style={{ backgroundColor: categoria.color }}
                                    />
                                    <span className="text-sm">{categoria.name}</span>
                                </div>
                            ))}
                        </div>
                        <input
                            type="hidden"
                            name="categorias"
                            value={categoriasSelecionadas.join(',')}
                        />
                        {categoriasSelecionadas.length === 0 && (
                            <p className="text-sm text-red-600">
                                Selecione pelo menos uma categoria
                            </p>
                        )}
                    </div>

                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                            <Label htmlFor="contaOrigemId">Conta de Origem *</Label>
                            <Select
                                name="contaOrigemId"
                                defaultValue={transacaoData?.contaOrigemId?.toString() || ''}
                                required
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Selecione a conta" />
                                </SelectTrigger>
                                <SelectContent>
                                    {contas.map((conta) => (
                                        <SelectItem key={conta.id} value={conta.id.toString()}>
                                            <div className="flex items-center gap-2">
                                                <div
                                                    className="h-3 w-3 rounded-full"
                                                    style={{ backgroundColor: conta.cor }}
                                                />
                                                {conta.name} - {conta.tipo}
                                            </div>
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {mostrarContaDestino && (
                        <div className="space-y-2">
                            <Label htmlFor="contaDestinoId">Conta de Destino *</Label>
                            <Select
                                name="contaDestinoId"
                                defaultValue={transacaoData?.contaDestinoId?.toString() || ''}
                                required={mostrarContaDestino}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Selecione a conta de destino" />
                                </SelectTrigger>
                                <SelectContent>
                                    {contas.map((conta) => (
                                        <SelectItem key={conta.id} value={conta.id.toString()}>
                                            <div className="flex items-center gap-2">
                                                <div
                                                    className="h-3 w-3 rounded-full"
                                                    style={{ backgroundColor: conta.cor }}
                                                />
                                                {conta.name} - {conta.tipo}
                                            </div>
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    )}

                    {state.errors && <div className="text-sm text-red-600">{state.errors}</div>}

                    <div className="flex justify-end gap-2">
                        <Button type="button" variant="outline" onClick={onClose}>
                            Cancelar
                        </Button>
                        <Button type="submit">
                            {transacaoId ? 'Atualizar' : 'Criar'} Transação
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
