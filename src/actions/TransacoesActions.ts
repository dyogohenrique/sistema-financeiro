'use server';

import { prisma } from '@/lib/prisma';
import { TransacaoSchema } from '@/schemas/transacoes';
import { StatusTransacao, TipoTransacao } from '@prisma/client';
import { revalidatePath } from 'next/cache';

export type ActionState = {
    errors?: {
        tipo?: string[];
        valorCentavos?: string[];
        descricao?: string[];
        envolvido?: string[];
        data?: string[];
        status?: string[];
        categoriaIds?: string[];
        contaOrigemId?: string[];
        contaDestinoId?: string[];
        _form?: string[];
    };
    message?: string;
    success?: boolean;
    transacao?: any;
};

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
    prevState: ActionState,
    formData: FormData
): Promise<ActionState> {
    const dados = extractFormData(formData);

    const validatedFields = TransacaoSchema.safeParse(dados);

    if (!validatedFields.success) {
        return {
            errors: validatedFields.error.flatten().fieldErrors,
            message: 'Erro ao criar transação',
            success: false,
        };
    }

    try {
        const contaOrigem = await prisma.conta.findUnique({
            where: { id: dados.contaOrigemId },
        });

        if (!contaOrigem) {
            return {
                errors: { contaOrigemId: ['Conta não encontrada'] },
                message: 'Conta não encontrada',
                success: false,
            };
        }

        // Validações de transferências
        if (dados.tipo === TipoTransacao.TRANSFERENCIA) {
            if (!dados.contaDestinoId) {
                return {
                    errors: {
                        contaDestinoId: ['Conta de destino é obrigatória em transferências'],
                    },
                    message: 'Conta de destino é obrigatória em transferências',
                    success: false,
                };
            }

            const contaDestino = await prisma.conta.findUnique({
                where: { id: dados.contaDestinoId },
            });

            dados.envolvido = 'Eu';

            if (!contaDestino) {
                return {
                    errors: { contaDestinoId: ['Conta de destino não encontrada'] },
                    message: 'Conta de destino não encontrada',
                    success: false,
                };
            }

            if (dados.contaOrigemId === dados.contaDestinoId) {
                return {
                    errors: {
                        contaDestinoId: ['Conta de origem e destino não podem ser iguais'],
                    },
                    message: 'Conta de origem e destino não podem ser iguais',
                    success: false,
                };
            }
        }

        // Verificar se todas as categorias existem
        const categorias = await prisma.categoria.findMany({
            where: { id: { in: dados.categoriaIds } },
        });

        if (categorias.length !== dados.categoriaIds.length) {
            return {
                errors: {
                    categoriaIds: ['Uma ou mais categorias não foram encontradas'],
                },
                message: 'Uma ou mais categorias não foram encontradas',
                success: false,
            };
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
                        if (transacao.contaDestinoId) {
                            await tx.conta.update({
                                where: { id: transacao.contaOrigemId },
                                data: {
                                    saldoCentavos: {
                                        decrement: transacao.valorCentavos,
                                    },
                                },
                            });
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
    } catch (error: any) {
        console.error('Erro ao criar transação:', error);
        return {
            message: 'Erro no sistema. Tente novamente mais tarde.',
            success: false,
        };
    }

    revalidatePath('/transacoes');
    return {
        message: 'Transação criada com sucesso',
        success: true,
    };
}

export async function updateTransacao(
    id: number,
    prevState: ActionState,
    formData: FormData
): Promise<ActionState> {
    const dados = extractFormData(formData);

    const validatedFields = TransacaoSchema.safeParse(dados);

    if (!validatedFields.success) {
        return {
            errors: validatedFields.error.flatten().fieldErrors,
            message: 'Erro ao atualizar transação',
            success: false,
        };
    }

    try {
        const transacao = await prisma.transacao.findUnique({
            where: { id },
        });

        if (!transacao) {
            return {
                errors: { _form: ['Transação não encontrada'] },
                message: 'Transação não encontrada',
                success: false,
            };
        }

        const contaOrigem = await prisma.conta.findUnique({
            where: { id: dados.contaOrigemId },
        });

        if (!contaOrigem) {
            return {
                errors: { contaOrigemId: ['Conta não encontrada'] },
                message: 'Conta não encontrada',
                success: false,
            };
        }

        // Validações de transferências
        if (dados.tipo === TipoTransacao.TRANSFERENCIA) {
            if (!dados.contaDestinoId) {
                return {
                    errors: {
                        contaDestinoId: ['Conta de destino é obrigatória em transferências'],
                    },
                    message: 'Conta de destino é obrigatória em transferências',
                    success: false,
                };
            }

            const contaDestino = await prisma.conta.findUnique({
                where: { id: dados.contaDestinoId },
            });

            dados.envolvido = 'Eu';

            if (!contaDestino) {
                return {
                    errors: { contaDestinoId: ['Conta de destino não encontrada'] },
                    message: 'Conta de destino não encontrada',
                    success: false,
                };
            }

            if (dados.contaOrigemId === dados.contaDestinoId) {
                return {
                    errors: {
                        contaDestinoId: ['Conta de origem e destino não podem ser iguais'],
                    },
                    message: 'Conta de origem e destino não podem ser iguais',
                    success: false,
                };
            }
        }

        // Verificar se todas as categorias existem
        const categorias = await prisma.categoria.findMany({
            where: { id: { in: dados.categoriaIds } },
        });

        if (categorias.length !== dados.categoriaIds.length) {
            return {
                errors: {
                    categoriaIds: ['Uma ou mais categorias não foram encontradas'],
                },
                message: 'Uma ou mais categorias não foram encontradas',
                success: false,
            };
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
                switch (transacaoAntiga.tipo) {
                    case TipoTransacao.ENTRADA:
                        await tx.conta.update({
                            where: { id: transacaoAntiga.contaOrigemId },
                            data: {
                                saldoCentavos: {
                                    decrement: transacaoAntiga.valorCentavos,
                                },
                            },
                        });
                        break;
                    case TipoTransacao.SAIDA:
                        await tx.conta.update({
                            where: { id: transacaoAntiga.contaOrigemId },
                            data: {
                                saldoCentavos: {
                                    increment: transacaoAntiga.valorCentavos,
                                },
                            },
                        });
                        break;
                    case TipoTransacao.TRANSFERENCIA:
                        if (transacaoAntiga.contaDestinoId) {
                            await tx.conta.update({
                                where: { id: transacaoAntiga.contaOrigemId },
                                data: {
                                    saldoCentavos: {
                                        increment: transacaoAntiga.valorCentavos,
                                    },
                                },
                            });
                            await tx.conta.update({
                                where: { id: transacaoAntiga.contaDestinoId },
                                data: {
                                    saldoCentavos: {
                                        decrement: transacaoAntiga.valorCentavos,
                                    },
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
                    categorias: {
                        deleteMany: {},
                        create: dados.categoriaIds.map((categoriaId) => ({
                            categoriaId: categoriaId,
                        })),
                    },
                },
            });

            // 4. Aplica o efeito da transação atualizada, se ela for 'PAGA'
            if (transacaoAtualizada.status === StatusTransacao.PAGO) {
                switch (transacaoAtualizada.tipo) {
                    case TipoTransacao.ENTRADA:
                        await tx.conta.update({
                            where: { id: transacaoAtualizada.contaOrigemId },
                            data: {
                                saldoCentavos: {
                                    increment: transacaoAtualizada.valorCentavos,
                                },
                            },
                        });
                        break;
                    case TipoTransacao.SAIDA:
                        await tx.conta.update({
                            where: { id: transacaoAtualizada.contaOrigemId },
                            data: {
                                saldoCentavos: {
                                    decrement: transacaoAtualizada.valorCentavos,
                                },
                            },
                        });
                        break;
                    case TipoTransacao.TRANSFERENCIA:
                        if (transacaoAtualizada.contaDestinoId) {
                            await tx.conta.update({
                                where: { id: transacaoAtualizada.contaOrigemId },
                                data: {
                                    saldoCentavos: {
                                        decrement: transacaoAtualizada.valorCentavos,
                                    },
                                },
                            });
                            await tx.conta.update({
                                where: { id: transacaoAtualizada.contaDestinoId },
                                data: {
                                    saldoCentavos: {
                                        increment: transacaoAtualizada.valorCentavos,
                                    },
                                },
                            });
                        }
                        break;
                }
            }
        });
    } catch (error: any) {
        console.error('Erro ao atualizar transação:', error);
        return {
            message: 'Erro no sistema. Tente novamente mais tarde.',
            success: false,
        };
    }

    revalidatePath('/transacoes');
    return {
        message: 'Transação atualizada com sucesso',
        success: true,
    };
}

export async function deleteTransacao(id: number): Promise<ActionState> {
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
                            await tx.conta.update({
                                where: { id: transacao.contaOrigemId },
                                data: {
                                    saldoCentavos: {
                                        increment: transacao.valorCentavos,
                                    },
                                },
                            });
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
    } catch (error: any) {
        console.error('Erro ao excluir transação:', error);
        return {
            success: false,
            message: 'Erro ao excluir transação',
        };
    }

    revalidatePath('/transacoes');
    return {
        message: 'Transação excluída com sucesso',
        success: true,
    };
}

export async function getTransacaoById(id: number): Promise<ActionState> {
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
            return {
                errors: { _form: ['Transação não encontrada'] },
                message: 'Transação não encontrada',
                success: false,
            };
        }

        return {
            message: 'Transação encontrada',
            success: true,
            transacao,
        };
    } catch (error) {
        console.error('Erro ao buscar transação:', error);
        return {
            message: 'Erro no sistema. Tente novamente mais tarde.',
            success: false,
        };
    }
}

export async function getAllTransacoes(): Promise<any[]> {
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
}
