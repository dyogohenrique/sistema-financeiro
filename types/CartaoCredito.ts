// path=src/models/CartaoCredito.ts
import { FaturaCartao } from './FaturaCartao';
import { Transacao } from './Transacao';

export interface CartaoCredito {
    id: number;
    name: string;
    bancoEmissor: string;
    limiteCentavos: bigint;
    diaFechamento: number;
    diaVencimento: number;

    createdAt: Date;
    updatedAt: Date;

    transacoes: Transacao[];
    faturas: FaturaCartao[];
}
