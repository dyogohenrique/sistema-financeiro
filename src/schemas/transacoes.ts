import { z } from 'zod';

export const TransacaoSchema = z.object({
    tipo: z.enum(['ENTRADA', 'SAIDA', 'TRANSFERENCIA'], {
        message: 'Tipo de transação inválido',
    }),
    valorCentavos: z.number().positive('Valor deve ser maior que 0'),
    descricao: z.string().nullable().optional(),
    envolvido: z.string().nullable().optional(),
    data: z.date().nullable().optional(),
    status: z.enum(['PAGO', 'PENDENTE', 'CANCELADO'], {
        message: 'Status de transação inválido',
    }),
    categoriaIds: z.array(z.number()).min(1, 'Pelo menos uma categoria é obrigatória'),
    contaOrigemId: z.number().positive('Conta de origem é obrigatória'),
    contaDestinoId: z.number().nullable().optional(),
});

export type TransacaoSchema = z.infer<typeof TransacaoSchema>;
