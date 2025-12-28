import { z } from 'zod';

export const ContaSchema = z.object({
    name: z.string().min(3, 'É necessário ao menos 3 caracteres'),
    tipo: z.enum(['CORRENTE', 'POUPANCA', 'INVESTIMENTO', 'SALARIO']),
    cor: z
        .string()
        .min(7, 'Selecione uma cor para a conta!')
        .max(7, 'Selecione uma cor para a conta!')
        .regex(/^#[0-9a-f]{6}$/i, {
            message: 'Cor inválida.',
        }),
});
export type ContaSchema = z.infer<typeof ContaSchema>;
