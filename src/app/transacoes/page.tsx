'use client';

import { getAllCategorias } from '@/actions/CategotiasActions';
import { getAllContas } from '@/actions/ContasActions';
import { deleteTransacao, getAllTransacoes, getTransacaoById } from '@/actions/TransacoesActions';
import { ConfirmationDialog } from '@/components/ConfirmationDialog';
import { DataTable } from '@/components/DataTable';
import { Button } from '@/components/ui/button';
import { Categoria, Conta } from '@prisma/client';
import { Plus, Trash2 } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { TransacaoFilters } from './_components/TransacaoFilters';
import { TransacaoForm } from './_components/TransacaoForm';
import { createColumns } from './_lib/columns';

export default function TransacoesPage() {
    const [transacoes, setTransacoes] = useState<any[]>([]);
    const [filteredTransacoes, setFilteredTransacoes] = useState<any[]>([]);
    const [categorias, setCategorias] = useState<Categoria[]>([]);
    const [contas, setContas] = useState<Conta[]>([]);
    const [editingTransacao, setEditingTransacao] = useState<number | null>(null);
    const [selectedTransacao, setSelectedTransacao] = useState<any | null>(null);
    const [showForm, setShowForm] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [transacaoParaExcluir, setTransacaoParaExcluir] = useState<number | null>(null);

    const fetchTransacoes = useCallback(async () => {
        const transacoes = await getAllTransacoes();
        setTransacoes(transacoes);
    }, []);

    const fetchAuxData = useCallback(async () => {
        const [cats, cts] = await Promise.all([getAllCategorias(), getAllContas()]);
        setCategorias(cats);
        setContas(cts.filter((c) => c.ativa));
    }, []);

    useEffect(() => {
        fetchTransacoes();
        fetchAuxData();
    }, [fetchTransacoes, fetchAuxData]);

    const handleFiltersChange = useCallback((filtered: any[]) => {
        setFilteredTransacoes(filtered);
    }, []);

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

    const columns = createColumns({
        onEdit: handleEdit,
        onDelete: handleDelete,
    });

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

            {/* Filtros avançados */}
            <TransacaoFilters
                data={transacoes}
                categorias={categorias}
                contas={contas}
                onFiltersChange={handleFiltersChange}
            />

            {/* Tabela de transações */}
            <DataTable columns={columns} data={filteredTransacoes} defaultPageSize={10} />

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
