// path=src/models/FaturaCartao.ts
import { ICartaoCredito } from './CartaoCredito';
import { ITransacao } from './Transacao';

export interface IFaturaCartao {
    id: number;
    mesReferencia: number;
    anoReferencia: number;
    valorTotal: bigint;
    pago: boolean;
    dataPagamento: Date | null;
    createdAt: Date;
    updatedAt: Date;

    cartaoId: number;
    cartao: Partial<ICartaoCredito> | null;
    transacoes: ITransacao[];
}
