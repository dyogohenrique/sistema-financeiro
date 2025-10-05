'use client';

import { deleteTransacao, getAllTransacoes, getTransacaoById } from '@/actions/TransacoesActions';
import { ConfirmationDialog } from '@/components/ConfirmationDialog';
import { DataTable } from '@/components/DataTable';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatCurrency } from '@/lib/utils';
import { ArrowDownCircle, ArrowLeftRight, ArrowUpCircle, Plus, Trash2 } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { TransacaoForm } from './_components/TransacaoForm';
import { createColumns } from './_lib/columns';

export default function TransacoesPage() {
    const [transacoes, setTransacoes] = useState<any[]>([]);
    const [editingTransacao, setEditingTransacao] = useState<number | null>(null);
    const [selectedTransacao, setSelectedTransacao] = useState<any | null>(null);
    const [showForm, setShowForm] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [transacaoParaExcluir, setTransacaoParaExcluir] = useState<number | null>(null);

    const fetchTransacoes = useCallback(async () => {
        const transacoes = await getAllTransacoes();
        setTransacoes(transacoes);
    }, []);

    useEffect(() => {
        fetchTransacoes();
    }, [fetchTransacoes]);

    const handleCloseForm = useCallback(() => {
        setShowForm(false);
        setEditingTransacao(null);
        setSelectedTransacao(null);
        fetchTransacoes();
    }, [fetchTransacoes]);

    const handleEdit = async (transacaoId: number) => {
        const result = await getTransacaoById(transacaoId);
        if (result.success && result.transacao) {
            setSelectedTransacao(result.transacao);
            setEditingTransacao(transacaoId);
            setShowForm(true);
        }
    };

    const handleDelete = (transacaoId: number) => {
        setTransacaoParaExcluir(transacaoId);
        setShowDeleteModal(true);
    };

    const confirmarExclusao = async () => {
        if (transacaoParaExcluir) {
            const result = await deleteTransacao(transacaoParaExcluir);
            if (result.success) {
                await fetchTransacoes();
            }
        }
        setShowDeleteModal(false);
        setTransacaoParaExcluir(null);
    };

    const getTipoIcon = (tipo: string) => {
        switch (tipo) {
            case 'ENTRADA':
                return <ArrowUpCircle className="h-4 w-4 text-green-600" />;
            case 'SAIDA':
                return <ArrowDownCircle className="h-4 w-4 text-red-600" />;
            case 'TRANSFERENCIA':
                return <ArrowLeftRight className="h-4 w-4 text-blue-600" />;
            default:
                return <ArrowUpCircle className="h-4 w-4" />;
        }
    };

    const getTipoLabel = (tipo: string) => {
        switch (tipo) {
            case 'ENTRADA':
                return 'Entrada';
            case 'SAIDA':
                return 'Saída';
            case 'TRANSFERENCIA':
                return 'Transferência';
            default:
                return tipo;
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'PAGO':
                return 'bg-green-100 text-green-800';
            case 'PENDENTE':
                return 'bg-yellow-100 text-yellow-800';
            case 'CANCELADO':
                return 'bg-red-100 text-red-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const columns = createColumns({
        onEdit: handleEdit,
        onDelete: handleDelete,
    });

    // Calcular totais
    const totalEntradas = transacoes
        .filter((t) => t.tipo === 'ENTRADA' && t.status === 'PAGO')
        .reduce((sum, t) => sum + Number(t.valorCentavos), 0);

    const totalSaidas = transacoes
        .filter((t) => t.tipo === 'SAIDA' && t.status === 'PAGO')
        .reduce((sum, t) => sum + Number(t.valorCentavos), 0);

    const saldo = totalEntradas - totalSaidas;

    return (
        <div className="space-y-6 p-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Transações</h1>
                    <p className="text-gray-600">Gerencie suas transações financeiras</p>
                </div>
                <Button
                    onClick={() => {
                        setShowForm(true);
                        setEditingTransacao(null);
                        setSelectedTransacao(null);
                    }}
                    variant="outline"
                >
                    <Plus className="mr-2 h-4 w-4" />
                    Nova Transação
                </Button>
            </div>

            {/* Cards de resumo */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total de Entradas</CardTitle>
                        <ArrowUpCircle className="h-4 w-4 text-green-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-600">
                            {formatCurrency(totalEntradas)}
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total de Saídas</CardTitle>
                        <ArrowDownCircle className="h-4 w-4 text-red-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-red-600">
                            {formatCurrency(totalSaidas)}
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Saldo</CardTitle>
                        <ArrowLeftRight className="h-4 w-4 text-blue-600" />
                    </CardHeader>
                    <CardContent>
                        <div
                            className={`text-2xl font-bold ${saldo >= 0 ? 'text-green-600' : 'text-red-600'}`}
                        >
                            {formatCurrency(saldo)}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Tabela de transações */}
            <Card>
                <CardHeader>
                    <CardTitle>Lista de Transações</CardTitle>
                </CardHeader>
                <CardContent>
                    <DataTable
                        columns={columns}
                        data={transacoes}
                        searchKeys={['descricao', 'envolvido']}
                        searchPlaceholder="Pesquisar transação..."
                    />
                </CardContent>
            </Card>

            {/* Modal de formulário */}
            <TransacaoForm
                open={showForm}
                transacaoId={editingTransacao}
                transacaoData={selectedTransacao}
                onClose={handleCloseForm}
            />

            {/* Modal de confirmação para exclusão */}
            <ConfirmationDialog
                open={showDeleteModal}
                onOpenChange={setShowDeleteModal}
                title="Excluir Transação"
                description="Tem certeza que deseja excluir esta transação? Esta ação não pode ser desfeita."
                confirmText="Excluir"
                confirmVariant="destructive"
                onConfirm={confirmarExclusao}
                icon={<Trash2 className="h-6 w-6 text-red-600" />}
            />
        </div>
    );
}
