'use server';
import { prisma } from '@/lib/prisma';
import { StatusTransacao, TipoTransacao } from '@prisma/client';

// Função auxiliar para extrair dados do FormData
function extractFormData(formData: FormData) {
    return {
        tipo: formData.get('tipo') as TipoTransacao,
        valorCentavos: Number(formData.get('valorCentavos')),
        descricao: formData.get('descricao') as string | null,
        envolvido: formData.get('envolvido') as string | null,
        data: formData.get('data') as string | null,
        status: formData.get('status') as StatusTransacao,
        categoriaId: Number(formData.get('categoriaId')),
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

        if (!dados.valorCentavos) {
            return { errors: 'Valor é obrigatório', success: false };
        }

        if (Number(dados.valorCentavos) <= 0) {
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

            dados.envolvido = 'Eu -';

            if (!contaDestino) {
                return { errors: 'Conta de destino não encontrada', success: false };
            }

            if (dados.contaOrigemId === dados.contaDestinoId) {
                return { errors: 'Conta de origem e destino não podem ser iguais', success: false };
            }
        }

        if (!dados.categoriaId) {
            return { errors: 'Categoria é obrigatória', success: false };
        }

        const categoria = await prisma.categoria.findUnique({
            where: {
                id: dados.categoriaId,
            },
        });
        if (!categoria) {
            return { errors: 'Categoria não encontrada', success: false };
        }

        // Criar a transação
        await prisma.transacao.create({
            data: {
                ...dados,
            },
        });

        return { errors: '', success: true };
    } catch (error) {
        return { errors: 'Erro ao criar transação', success: false };
    }
}
