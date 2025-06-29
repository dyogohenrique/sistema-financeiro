'use client';

import { ativarConta, desativarConta, getAllContas } from '@/actions/ContasActions';
import { ConfirmationDialog } from '@/components/ConfirmationDialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatCurrency } from '@/lib/utils';
import { Conta, TipoConta } from '@prisma/client';
import { Check, Edit, PiggyBank, Plus, Trash2, TrendingUp, Wallet } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { ContaForm } from './_components/ContaForm';

export default function ContasPage() {
    const [contas, setContas] = useState<Conta[]>([]);

    const [editingAccount, setEditingAccount] = useState<number | null>(null);
    const [selectedAccount, setSelectedAccount] = useState<number | null>(null);

    const [showForm, setShowForm] = useState(false);
    const [showAtivarModal, setShowAtivarModal] = useState(false);
    const [showDesativarModal, setShowDesativarModal] = useState(false);
    const [contaParaAtivar, setContaParaAtivar] = useState<number | null>(null);
    const [contaParaDesativar, setContaParaDesativar] = useState<number | null>(null);

    const fetchContas = useCallback(async () => {
        const contas = await getAllContas();
        setContas(contas);
    }, []);

    useEffect(() => {
        fetchContas();
    }, [fetchContas]);

    const handleCloseForm = useCallback(() => {
        setShowForm(false);
        setEditingAccount(null);
        // Recarregar lista de contas
        fetchContas();
    }, [fetchContas]);

    const handleAtivar = (contaId: number) => {
        setContaParaAtivar(contaId);
        setShowAtivarModal(true);
    };

    const handleDesativar = (contaId: number) => {
        setContaParaDesativar(contaId);
        setShowDesativarModal(true);
    };

    const confirmarAtivar = async () => {
        if (contaParaAtivar) {
            const result = await ativarConta(contaParaAtivar);
            if (result.success) {
                await fetchContas();
            }
        }
        setShowAtivarModal(false);
        setContaParaAtivar(null);
    };

    const confirmarDesativar = async () => {
        if (contaParaDesativar) {
            const result = await desativarConta(contaParaDesativar);
            if (result.success) {
                await fetchContas();
            }
        }
        setShowDesativarModal(false);
        setContaParaDesativar(null);
    };

    const getAccountIcon = (type: string) => {
        switch (type) {
            case TipoConta.CORRENTE:
                return <Wallet className="h-6 w-6" />;
            case TipoConta.POUPANCA:
                return <PiggyBank className="h-6 w-6" />;
            case TipoConta.INVESTIMENTO:
                return <TrendingUp className="h-6 w-6" />;
            default:
                return <Wallet className="h-6 w-6" />;
        }
    };

    const getAccountTypeLabel = (type: string) => {
        switch (type) {
            case TipoConta.CORRENTE:
                return 'Conta Corrente';
            case TipoConta.POUPANCA:
                return 'Poupança';
            case TipoConta.INVESTIMENTO:
                return 'Investimento';
            default:
                return 'Conta';
        }
    };

    return (
        <div className="space-y-6 p-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Contas Bancárias</h1>
                    <p className="text-gray-600">Gerencie suas contas bancárias</p>
                </div>
                <Button
                    onClick={() => {
                        setShowForm(true);
                        setEditingAccount(null);
                    }}
                >
                    <Plus className="mr-2 h-4 w-4" />
                    Nova Conta
                </Button>
            </div>

            {/* Lista de contas */}
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                {contas.map((conta) =>
                    conta.ativa ? (
                        <Card key={conta.id} className="relative">
                            <CardHeader className="pb-3">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-3">
                                        <div
                                            className="rounded-full p-3"
                                            style={{
                                                backgroundColor: `${conta.cor}20`,
                                                color: conta.cor,
                                            }}
                                        >
                                            {getAccountIcon(conta.tipo)}
                                        </div>
                                        <div>
                                            <CardTitle className="text-lg">{conta.name}</CardTitle>
                                            <p className="text-muted-foreground text-sm">
                                                {getAccountTypeLabel(conta.tipo)}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex space-x-3">
                                        <Button
                                            variant="outline"
                                            size="icon"
                                            onClick={() => {
                                                setEditingAccount(conta.id);
                                                setShowForm(true);
                                            }}
                                        >
                                            <Edit className="h-4 w-4" />
                                        </Button>
                                        <Button
                                            variant="outlineDestructive"
                                            size="icon"
                                            onClick={() => handleDesativar(conta.id)}
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    <div>
                                        <p className="text-muted-foreground text-sm">Saldo Atual</p>
                                        <p className="text-2xl font-bold">
                                            {formatCurrency(Number(conta.saldoCentavos))}
                                        </p>
                                    </div>
                                    <Button
                                        variant="outline"
                                        className="w-full"
                                        // Enviar para a página de transações com filtro aplicadoo
                                    >
                                        Ver Transações
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ) : (
                        <Card key={conta.id} className="relative bg-gray-100">
                            <CardHeader className="pb-3">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-3">
                                        <div
                                            className="rounded-full p-3"
                                            style={{
                                                backgroundColor: `${conta.cor}20`,
                                                color: conta.cor,
                                            }}
                                        >
                                            {getAccountIcon(conta.tipo)}
                                        </div>
                                        <div>
                                            <CardTitle className="text-lg">{conta.name}</CardTitle>
                                            <p className="text-muted-foreground text-sm">
                                                {getAccountTypeLabel(conta.tipo)} (Desativada)
                                            </p>
                                        </div>
                                    </div>
                                    <div>
                                        <Button
                                            variant="outline"
                                            onClick={() => handleAtivar(conta.id)}
                                            disabled={conta.ativa}
                                        >
                                            <Check className="h-4 w-4" />
                                            Ativar
                                        </Button>
                                    </div>
                                </div>
                            </CardHeader>
                        </Card>
                    )
                )}
            </div>

            {contas.length === 0 && (
                <Card>
                    <CardContent className="py-12 text-center">
                        <Wallet className="text-muted-foreground mx-auto mb-4 h-16 w-16" />
                        <h3 className="mb-2 text-lg font-medium">Nenhuma conta cadastrada</h3>
                        <p className="text-muted-foreground mb-4">
                            Adicione sua primeira conta bancária para começar a gerenciar suas
                            finanças
                        </p>
                        <Button
                            onClick={() => {
                                setShowForm(true);
                                setEditingAccount(null);
                            }}
                        >
                            <Plus className="mr-2 h-4 w-4" />
                            Adicionar Conta
                        </Button>
                    </CardContent>
                </Card>
            )}

            {/* Modal de formulário */}
            <ContaForm
                open={showForm}
                contaId={editingAccount}
                contaData={contas.find((conta) => conta.id === editingAccount) || null}
                onClose={handleCloseForm}
            />

            {/* Modal de confirmação para ativar conta */}
            <ConfirmationDialog
                open={showAtivarModal}
                onOpenChange={setShowAtivarModal}
                title="Ativar Conta"
                description="Tem certeza que deseja ativar esta conta bancária? Ela ficará disponível para uso em transações."
                confirmText="Ativar Conta"
                confirmVariant="default"
                onConfirm={confirmarAtivar}
                icon={<Check className="h-6 w-6 text-green-600" />}
            />

            {/* Modal de confirmação para desativar conta */}
            <ConfirmationDialog
                open={showDesativarModal}
                onOpenChange={setShowDesativarModal}
                title="Desativar Conta"
                description="Tem certeza que deseja desativar esta conta bancária? Ela não ficará mais disponível para novas transações, mas o histórico será mantido."
                confirmText="Desativar Conta"
                confirmVariant="destructive"
                onConfirm={confirmarDesativar}
                icon={<Trash2 className="h-6 w-6 text-red-600" />}
            />
        </div>
    );
}
