import { z } from 'zod';

export const CategoriaSchema = z.object({
    name: z.string().min(2, 'É necessário ao menos 2 caracteres'),
    color: z
        .string()
        .min(7, 'Selecione uma cor para a categoria!')
        .max(7, 'Selecione uma cor para a categoria!')
        .regex(/^#[0-9a-f]{6}$/i, {
            message: 'Cor inválida.',
        }),
});
export type CategoriaSchema = z.infer<typeof CategoriaSchema>;
