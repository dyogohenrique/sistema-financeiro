'use server';
import { prisma } from '@/lib/prisma';
import { StatusTransacao, TipoTransacao } from '@prisma/client';

// Função auxiliar para extrair dados do FormData
function extractFormData(formData: FormData) {
    const valorString = formData.get('valorCentavos') as string;
    const valorReais = parseFloat(valorString) || 0;
    const valorCentavos = Math.round(valorReais * 100);
    const dataString = formData.get('data') as string | null;

    // Extrair categorias selecionadas
    const categoriasString = formData.get('categorias') as string;
    const categoriaIds = categoriasString
        ? categoriasString
              .split(',')
              .map((id) => Number(id.trim()))
              .filter((id) => !isNaN(id))
        : [];

    return {
        tipo: formData.get('tipo') as TipoTransacao,
        valorCentavos: valorCentavos,
        descricao: formData.get('descricao') as string | null,
        envolvido: formData.get('envolvido') as string | null,
        data: dataString ? new Date(dataString) : null,
        status: formData.get('status') as StatusTransacao,
        categoriaIds: categoriaIds,
        contaOrigemId: Number(formData.get('contaOrigemId')),
        contaDestinoId: formData.get('contaDestinoId')
            ? Number(formData.get('contaDestinoId'))
            : null,
    };
}

export async function createTransacao(
    formState: { errors: string; success?: boolean },
    formData: FormData
): Promise<{ errors: string; success?: boolean }> {
    try {
        const dados = extractFormData(formData);

        if (!dados.tipo) {
            return { errors: 'Tipo é obrigatório', success: false };
        }

        if (!dados.valorCentavos || dados.valorCentavos <= 0) {
            return { errors: 'Valor deve ser maior que 0', success: false };
        }

        if (!dados.contaOrigemId) {
            return { errors: 'Conta é obrigatória', success: false };
        }

        const contaOrigem = await prisma.conta.findUnique({
            where: {
                id: dados.contaOrigemId,
            },
        });
        if (!contaOrigem) {
            return { errors: 'Conta não encontrada', success: false };
        }

        // Validações de transferências
        if (dados.tipo === TipoTransacao.TRANSFERENCIA) {
            if (!dados.contaDestinoId) {
                return {
                    errors: 'Conta de destino é obrigatória em transferências',
                    success: false,
                };
            }

            const contaDestino = await prisma.conta.findUnique({
                where: {
                    id: dados.contaDestinoId,
                },
            });

            dados.envolvido = 'Eu';

            if (!contaDestino) {
                return { errors: 'Conta de destino não encontrada', success: false };
            }

            if (dados.contaOrigemId === dados.contaDestinoId) {
                return { errors: 'Conta de origem e destino não podem ser iguais', success: false };
            }
        }

        if (!dados.categoriaIds || dados.categoriaIds.length === 0) {
            return { errors: 'Pelo menos uma categoria é obrigatória', success: false };
        }

        // Verificar se todas as categorias existem
        const categorias = await prisma.categoria.findMany({
            where: {
                id: { in: dados.categoriaIds },
            },
        });

        if (categorias.length !== dados.categoriaIds.length) {
            return { errors: 'Uma ou mais categorias não foram encontradas', success: false };
        }

        await prisma.$transaction(async (tx) => {
            // 1. Cria a transação
            const transacao = await tx.transacao.create({
                data: {
                    tipo: dados.tipo,
                    valorCentavos: dados.valorCentavos,
                    descricao: dados.descricao,
                    envolvido: dados.envolvido,
                    data: dados.data,
                    status: dados.status,
                    contaOrigemId: dados.contaOrigemId,
                    contaDestinoId: dados.contaDestinoId,
                    categorias: {
                        create: dados.categoriaIds.map((categoriaId) => ({
                            categoriaId: categoriaId,
                        })),
                    },
                },
            });

            // 2. Se a transação foi paga, atualiza o saldo da(s) conta(s)
            if (transacao.status === StatusTransacao.PAGO) {
                switch (transacao.tipo) {
                    case TipoTransacao.ENTRADA:
                        await tx.conta.update({
                            where: { id: transacao.contaOrigemId },
                            data: {
                                saldoCentavos: {
                                    increment: transacao.valorCentavos,
                                },
                            },
                        });
                        break;
                    case TipoTransacao.SAIDA:
                        await tx.conta.update({
                            where: { id: transacao.contaOrigemId },
                            data: {
                                saldoCentavos: {
                                    decrement: transacao.valorCentavos,
                                },
                            },
                        });
                        break;
                    case TipoTransacao.TRANSFERENCIA:
                        // Garante que contaDestinoId não é nulo
                        if (transacao.contaDestinoId) {
                            // Diminui o saldo da conta de origem
                            await tx.conta.update({
                                where: { id: transacao.contaOrigemId },
                                data: {
                                    saldoCentavos: {
                                        decrement: transacao.valorCentavos,
                                    },
                                },
                            });
                            // Aumenta o saldo da conta de destino
                            await tx.conta.update({
                                where: { id: transacao.contaDestinoId },
                                data: {
                                    saldoCentavos: {
                                        increment: transacao.valorCentavos,
                                    },
                                },
                            });
                        }
                        break;
                }
            }
        });
        return { errors: '', success: true };
    } catch (error) {
        console.error('Erro ao criar transação:', error);
        return {
            errors: `Erro ao criar transação: ${error instanceof Error ? error.message : 'Erro desconhecido'}`,
            success: false,
        };
    }
}

export async function updateTransacao(
    formState: { errors: string; success?: boolean },
    formData: FormData
): Promise<{ errors: string; success?: boolean }> {
    try {
        const id = parseInt(formData.get('id') as string);
        const dados = extractFormData(formData);

        const transacao = await prisma.transacao.findUnique({
            where: { id },
        });

        if (!transacao) {
            return { errors: 'Transação não encontrada', success: false };
        }

        if (!dados.tipo) {
            return { errors: 'Tipo é obrigatório', success: false };
        }

        if (!dados.valorCentavos || dados.valorCentavos <= 0) {
            return { errors: 'Valor deve ser maior que 0', success: false };
        }

        if (!dados.contaOrigemId) {
            return { errors: 'Conta é obrigatória', success: false };
        }

        const contaOrigem = await prisma.conta.findUnique({
            where: {
                id: dados.contaOrigemId,
            },
        });
        if (!contaOrigem) {
            return { errors: 'Conta não encontrada', success: false };
        }

        // Validações de transferências
        if (dados.tipo === TipoTransacao.TRANSFERENCIA) {
            if (!dados.contaDestinoId) {
                return {
                    errors: 'Conta de destino é obrigatória em transferências',
                    success: false,
                };
            }

            const contaDestino = await prisma.conta.findUnique({
                where: {
                    id: dados.contaDestinoId,
                },
            });

            dados.envolvido = 'Eu';

            if (!contaDestino) {
                return { errors: 'Conta de destino não encontrada', success: false };
            }

            if (dados.contaOrigemId === dados.contaDestinoId) {
                return { errors: 'Conta de origem e destino não podem ser iguais', success: false };
            }
        }

        if (!dados.categoriaIds || dados.categoriaIds.length === 0) {
            return { errors: 'Pelo menos uma categoria é obrigatória', success: false };
        }

        // Verificar se todas as categorias existem
        const categorias = await prisma.categoria.findMany({
            where: {
                id: { in: dados.categoriaIds },
            },
        });

        if (categorias.length !== dados.categoriaIds.length) {
            return { errors: 'Uma ou mais categorias não foram encontradas', success: false };
        }

        await prisma.$transaction(async (tx) => {
            // 1. Busca o estado original da transação
            const transacaoAntiga = await tx.transacao.findUnique({
                where: { id },
            });

            if (!transacaoAntiga) {
                throw new Error('Transação não encontrada');
            }

            // 2. Reverte o efeito da transação antiga, se ela estava 'PAGA'
            if (transacaoAntiga.status === StatusTransacao.PAGO) {
                // A lógica é a mesma da função deleteTransacao
                switch (transacaoAntiga.tipo) {
                    case TipoTransacao.ENTRADA:
                        await tx.conta.update({
                            where: { id: transacaoAntiga.contaOrigemId },
                            data: { saldoCentavos: { decrement: transacaoAntiga.valorCentavos } },
                        });
                        break;
                    case TipoTransacao.SAIDA:
                        await tx.conta.update({
                            where: { id: transacaoAntiga.contaOrigemId },
                            data: { saldoCentavos: { increment: transacaoAntiga.valorCentavos } },
                        });
                        break;
                    case TipoTransacao.TRANSFERENCIA:
                        if (transacaoAntiga.contaDestinoId) {
                            await tx.conta.update({
                                where: { id: transacaoAntiga.contaOrigemId },
                                data: {
                                    saldoCentavos: { increment: transacaoAntiga.valorCentavos },
                                },
                            });
                            await tx.conta.update({
                                where: { id: transacaoAntiga.contaDestinoId },
                                data: {
                                    saldoCentavos: { decrement: transacaoAntiga.valorCentavos },
                                },
                            });
                        }
                        break;
                }
            }

            // 3. Atualiza a transação
            const transacaoAtualizada = await tx.transacao.update({
                where: { id },
                data: {
                    tipo: dados.tipo,
                    valorCentavos: dados.valorCentavos,
                    descricao: dados.descricao,
                    envolvido: dados.envolvido,
                    data: dados.data,
                    status: dados.status,
                    contaOrigemId: dados.contaOrigemId,
                    contaDestinoId: dados.contaDestinoId,
                    // Lógica para atualizar categorias
                    categorias: {
                        deleteMany: {}, // Deleta as associações antigas
                        create: dados.categoriaIds.map((categoriaId) => ({
                            // Cria as novas
                            categoriaId: categoriaId,
                        })),
                    },
                },
            });

            // 4. Aplica o efeito da transação atualizada, se ela for 'PAGA'
            if (transacaoAtualizada.status === StatusTransacao.PAGO) {
                // A lógica é a mesma da função createTransacao
                switch (transacaoAtualizada.tipo) {
                    case TipoTransacao.ENTRADA:
                        await tx.conta.update({
                            where: { id: transacaoAtualizada.contaOrigemId },
                            data: {
                                saldoCentavos: { increment: transacaoAtualizada.valorCentavos },
                            },
                        });
                        break;
                    case TipoTransacao.SAIDA:
                        await tx.conta.update({
                            where: { id: transacaoAtualizada.contaOrigemId },
                            data: {
                                saldoCentavos: { decrement: transacaoAtualizada.valorCentavos },
                            },
                        });
                        break;
                    case TipoTransacao.TRANSFERENCIA:
                        if (transacaoAtualizada.contaDestinoId) {
                            await tx.conta.update({
                                where: { id: transacaoAtualizada.contaOrigemId },
                                data: {
                                    saldoCentavos: { decrement: transacaoAtualizada.valorCentavos },
                                },
                            });
                            await tx.conta.update({
                                where: { id: transacaoAtualizada.contaDestinoId },
                                data: {
                                    saldoCentavos: { increment: transacaoAtualizada.valorCentavos },
                                },
                            });
                        }
                        break;
                }
            }
        });
        return { errors: '', success: true };
    } catch (error) {
        console.error('Erro ao atualizar transação:', error);
        return {
            errors: `Erro ao atualizar transação: ${error instanceof Error ? error.message : 'Erro desconhecido'}`,
            success: false,
        };
    }
}

export async function getAllTransacoes(): Promise<any[]> {
    try {
        const transacoes = await prisma.transacao.findMany({
            include: {
                categorias: {
                    include: {
                        categoria: true,
                    },
                },
                contaOrigem: true,
                contaDestino: true,
            },
            orderBy: { createdAt: 'desc' },
        });
        return transacoes;
    } catch (error) {
        console.error('Erro ao buscar transações:', error);
        return [];
    }
}

export async function getTransacaoById(
    id: number
): Promise<{ errors: string; success?: boolean; transacao?: any }> {
    try {
        const transacao = await prisma.transacao.findUnique({
            where: { id },
            include: {
                categorias: {
                    include: {
                        categoria: true,
                    },
                },
                contaOrigem: true,
                contaDestino: true,
            },
        });

        if (!transacao) {
            return { errors: 'Transação não encontrada', success: false };
        }
        return { errors: '', success: true, transacao };
    } catch (error) {
        console.error('Erro ao buscar transação:', error);
        return { errors: `Erro ao buscar transação: ${error}`, success: false };
    }
}

export async function deleteTransacao(id: number): Promise<{ errors: string; success?: boolean }> {
    try {
        await prisma.$transaction(async (tx) => {
            const transacao = await tx.transacao.findUnique({
                where: { id },
            });

            if (!transacao) {
                throw new Error('Transação não encontrada');
            }

            // Se a transação era 'PAGA', reverta o efeito no saldo
            if (transacao.status === StatusTransacao.PAGO) {
                switch (transacao.tipo) {
                    case TipoTransacao.ENTRADA:
                        // Se era uma entrada, agora vira uma saída (decrementa)
                        await tx.conta.update({
                            where: { id: transacao.contaOrigemId },
                            data: {
                                saldoCentavos: {
                                    decrement: transacao.valorCentavos,
                                },
                            },
                        });
                        break;
                    case TipoTransacao.SAIDA:
                        // Se era uma saída, agora vira uma entrada (incrementa)
                        await tx.conta.update({
                            where: { id: transacao.contaOrigemId },
                            data: {
                                saldoCentavos: {
                                    increment: transacao.valorCentavos,
                                },
                            },
                        });
                        break;
                    case TipoTransacao.TRANSFERENCIA:
                        if (transacao.contaDestinoId) {
                            // Reverte a saída da conta de origem (soma de volta)
                            await tx.conta.update({
                                where: { id: transacao.contaOrigemId },
                                data: {
                                    saldoCentavos: {
                                        increment: transacao.valorCentavos,
                                    },
                                },
                            });
                            // Reverte a entrada na conta de destino (subtrai)
                            await tx.conta.update({
                                where: { id: transacao.contaDestinoId },
                                data: {
                                    saldoCentavos: {
                                        decrement: transacao.valorCentavos,
                                    },
                                },
                            });
                        }
                        break;
                }
            }

            // Finalmente, deleta a transação
            await tx.transacao.delete({
                where: { id },
            });
        });

        return { errors: '', success: true };
    } catch (error) {
        console.error('Erro ao excluir transação:', error);
        return {
            errors: `Erro ao excluir transação: ${error instanceof Error ? error.message : 'Erro desconhecido'}`,
            success: false,
        };
    }
}
