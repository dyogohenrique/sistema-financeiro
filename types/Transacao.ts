import { TipoTransacao } from '@prisma/client';

export interface ITransacao {
    id: number;
    tipo: TipoTransacao | 'ENTRADA' | 'SAIDA' | 'TRANSFERENCIA';
    valorCentavos: bigint;
    data: Date | null;
    descricao: string | null;
    parcelas: number | null;
    numeroParcela: number | null;
    createdAt: Date;
    updatedAt: Date;
    categoriaId: number | null;
    contaOrigemId: number | null;
    contaDestinoId: number | null;
    cartaoId: number | null;
    faturaId: number | null;
}
