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
        console.log('Dados extraídos:', dados);

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

        // Criar a transação com as categorias
        await prisma.transacao.create({
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

        // Atualizar a transação e suas categorias
        await prisma.$transaction(async (tx) => {
            // Remover categorias existentes
            await tx.transacaoCategoria.deleteMany({
                where: { transacaoId: id },
            });

            // Atualizar a transação
            await tx.transacao.update({
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
                },
            });

            // Adicionar novas categorias
            await tx.transacaoCategoria.createMany({
                data: dados.categoriaIds.map((categoriaId) => ({
                    transacaoId: id,
                    categoriaId: categoriaId,
                })),
            });
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
        const transacao = await prisma.transacao.findUnique({
            where: { id },
        });

        if (!transacao) {
            return { errors: 'Transação não encontrada', success: false };
        }

        await prisma.transacao.delete({
            where: { id },
        });

        return { errors: '', success: true };
    } catch (error) {
        return { errors: `Erro ao excluir transação: ${error}`, success: false };
    }
}
