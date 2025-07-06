'use client';

import { ativarCartao, desativarCartao, getAllCartoes } from '@/actions/CartoesActions';
import { ConfirmationDialog } from '@/components/ConfirmationDialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatCurrency } from '@/lib/utils';
import { CartaoCredito } from '@prisma/client';
import { Calendar, Check, CreditCard, DollarSign, Edit, Plus, Trash2 } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { CartaoForm } from './_components/CartoesForm';

export default function CartoesPage() {
    const [cartoes, setCartoes] = useState<CartaoCredito[]>([]);

    const [showForm, setShowForm] = useState(false);
    const [editingCard, setEditingCard] = useState<number | null>(null);
    const [selectedCard, setSelectedCard] = useState<number | null>(null);

    const [showAtivarModal, setShowAtivarModal] = useState(false);
    const [showDesativarModal, setShowDesativarModal] = useState(false);
    const [cardParaAtivar, setCardParaAtivar] = useState<number | null>(null);
    const [cardParaDesativar, setCardParaDesativar] = useState<number | null>(null);

    const fetchCartoes = useCallback(async () => {
        const cartoes = await getAllCartoes();
        setCartoes(cartoes);
    }, []);

    useEffect(() => {
        fetchCartoes();
    }, [fetchCartoes]);

    const handleCloseForm = useCallback(() => {
        setShowForm(false);
        setEditingCard(null);
        // Recarregar lista de cartões
        fetchCartoes();
    }, [fetchCartoes]);

    const handleAtivar = (cardId: number) => {
        setCardParaAtivar(cardId);
        setShowAtivarModal(true);
    };

    const handleDesativar = (cardId: number) => {
        setCardParaDesativar(cardId);
        setShowDesativarModal(true);
    };

    const confirmarAtivar = async () => {
        if (cardParaAtivar) {
            const result = await ativarCartao(cardParaAtivar);
            if (result.success) {
                await fetchCartoes();
            }
        }
        setShowAtivarModal(false);
        setCardParaAtivar(null);
    };

    const confirmarDesativar = async () => {
        if (cardParaDesativar) {
            const result = await desativarCartao(cardParaDesativar);
            if (result.success) {
                await fetchCartoes();
            }
        }
        setShowDesativarModal(false);
        setCardParaDesativar(null);
    };

    const getUsagePercentage = (used: number, limit: number) => {
        return limit > 0 ? (used / limit) * 100 : 0;
    };

    const getUsageColor = (percentage: number) => {
        if (percentage >= 80) return 'bg-red-500';
        if (percentage >= 60) return 'bg-orange-500';
        return 'bg-blue-500';
    };

    return (
        <div className="space-y-6 p-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Cartões de Crédito</h1>
                    <p className="text-gray-600">Gerencie seus cartões de crédito e faturas</p>
                </div>
                <Button
                    onClick={() => {
                        setShowForm(true);
                        setEditingCard(null);
                    }}
                    variant="outline"
                >
                    <Plus className="mr-2 h-4 w-4" />
                    Novo Cartão
                </Button>
            </div>

            {/* Lista de cartões */}
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                {cartoes.map((card) => {
                    const usagePercentage = getUsagePercentage(
                        Number(card.limiteCentavos),
                        Number(card.limiteCentavos)
                    );
                    const availableLimit = card.limiteCentavos - card.limiteCentavos;

                    return card.ativo ? (
                        <Card key={card.id} className="relative overflow-hidden">
                            <div
                                className="absolute top-0 right-0 left-0 h-1"
                                style={{ backgroundColor: card.cor }}
                            />
                            <CardHeader className="pb-3">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-3">
                                        <div
                                            className="rounded-full p-3"
                                            style={{
                                                backgroundColor: `${card.cor}20`,
                                                color: card.cor,
                                            }}
                                        >
                                            <CreditCard className="h-6 w-6" />
                                        </div>
                                        <div>
                                            <CardTitle className="text-lg">{card.name}</CardTitle>
                                            <p className="text-muted-foreground text-sm">
                                                Vencimento: dia {card.diaVencimento}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex space-x-3">
                                        <Button
                                            variant="outline"
                                            size="icon"
                                            onClick={() => {
                                                setEditingCard(card.id);
                                                setShowForm(true);
                                            }}
                                        >
                                            <Edit className="h-4 w-4" />
                                        </Button>
                                        <Button
                                            variant="outlineDestructive"
                                            size="icon"
                                            onClick={() => handleDesativar(card.id)}
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-muted-foreground text-sm">Limite</p>
                                        <p className="font-bold">
                                            {formatCurrency(Number(card.limiteCentavos))}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-muted-foreground text-sm">Usado</p>
                                        <p className="font-bold text-orange-600">
                                            {formatCurrency(Number(card.limiteCentavos))}
                                        </p>
                                    </div>
                                </div>

                                <div>
                                    <div className="mb-2 flex justify-between text-sm">
                                        <span>Disponível</span>
                                        <span>{formatCurrency(Number(availableLimit))}</span>
                                    </div>
                                    <div className="h-2 w-full rounded-full bg-gray-200">
                                        <div
                                            className={`h-2 rounded-full transition-all ${getUsageColor(usagePercentage)}`}
                                            style={{ width: `${Math.min(usagePercentage, 100)}%` }}
                                        />
                                    </div>
                                    <p className="text-muted-foreground mt-1 text-xs">
                                        {usagePercentage.toFixed(1)}% utilizado
                                    </p>
                                </div>

                                <div className="grid grid-cols-2 gap-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        // onClick={() => setSelectedCard(card.id)}
                                    >
                                        <Calendar className="mr-1 h-4 w-4" />
                                        Fatura
                                    </Button>
                                    <Button variant="outline" size="sm">
                                        <DollarSign className="mr-1 h-4 w-4" />
                                        Compras
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ) : (
                        <Card key={card.id} className="relative bg-gray-100">
                            <CardHeader className="pb-3">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-3">
                                        <div
                                            className="rounded-full p-3"
                                            style={{
                                                backgroundColor: `${card.cor}20`,
                                                color: card.cor,
                                            }}
                                        >
                                            <CreditCard className="h-6 w-6" />
                                        </div>
                                        <div>
                                            <CardTitle className="text-lg">{card.name}</CardTitle>
                                            <p className="text-muted-foreground text-sm">
                                                (Desativada)
                                            </p>
                                        </div>
                                    </div>
                                    <div>
                                        <Button
                                            variant="outline"
                                            onClick={() => handleAtivar(card.id)}
                                            disabled={card.ativo}
                                        >
                                            <Check className="h-4 w-4" />
                                            Ativar
                                        </Button>
                                    </div>
                                </div>
                            </CardHeader>
                        </Card>
                    );
                })}
            </div>

            {cartoes.length === 0 && (
                <Card>
                    <CardContent className="py-12 text-center">
                        <CreditCard className="text-muted-foreground mx-auto mb-4 h-16 w-16" />
                        <h3 className="mb-2 text-lg font-medium">Nenhum cartão cadastrado</h3>
                        <p className="text-muted-foreground mb-4">
                            Adicione seu primeiro cartão de crédito para controlar suas faturas
                        </p>
                        <Button
                            onClick={() => {
                                setShowForm(true);
                                setEditingCard(null);
                            }}
                            variant="outline"
                        >
                            <Plus className="mr-2 h-4 w-4" />
                            Adicionar Cartão
                        </Button>
                    </CardContent>
                </Card>
            )}

            {/* Modal de formulário */}
            {showForm && (
                <CartaoForm
                    open={showForm}
                    cardId={editingCard?.toString() || null}
                    cardData={
                        editingCard
                            ? (() => {
                                  const card = cartoes.find((card) => card.id === editingCard);
                                  return card
                                      ? {
                                            id: card.id.toString(),
                                            name: card.name,
                                            limite: Number(card.limiteCentavos) / 100,
                                            currentBalance: 0, // Será calculado posteriormente
                                            dueDate: card.diaVencimento,
                                            closingDate: card.diaFechamento,
                                            cor: card.cor,
                                        }
                                      : null;
                              })()
                            : null
                    }
                    onClose={() => {
                        setShowForm(false);
                        setEditingCard(null);
                        fetchCartoes();
                    }}
                />
            )}
            {/* Modal de confirmação para ativar cartão */}
            <ConfirmationDialog
                open={showAtivarModal}
                onOpenChange={setShowAtivarModal}
                title="Ativar Cartão"
                description="Tem certeza que deseja ativar este cartão? Ele ficará disponível para uso em transações."
                confirmText="Ativar Cartão"
                confirmVariant="default"
                onConfirm={confirmarAtivar}
                icon={<Check className="h-6 w-6 text-green-600" />}
            />

            {/* Modal de confirmação para desativar cartão */}
            <ConfirmationDialog
                open={showDesativarModal}
                onOpenChange={setShowDesativarModal}
                title="Desativar Cartão"
                description="Tem certeza que deseja desativar este cartão? Ele não ficará mais disponível para novas transações, mas o histórico será mantido."
                confirmText="Desativar Cartão"
                confirmVariant="destructive"
                onConfirm={confirmarDesativar}
                icon={<Trash2 className="h-6 w-6 text-red-600" />}
            />

            {/* Modal de fatura */}
            {selectedCard && (
                // <CreditCardInvoice cardId={selectedCard} onClose={() => setSelectedCard(null)} />
                <div></div>
            )}
        </div>
    );
}
