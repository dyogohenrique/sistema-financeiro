// path=src/models/Transacao.ts

export interface ITransacao {
    id: number;
    tipo: 'ENTRADA' | 'SAIDA' | 'TRANSFERENCIA' | 'CREDITO';
    valorCentavos: bigint;
    data: Date;
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
