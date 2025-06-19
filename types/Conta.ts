// path=src/models/Conta.ts
import { ITransacao } from './Transacao';

export interface IConta {
    id: number;
    name: string;
    tipo: 'CORRENTE' | 'POUPANCA' | 'INVESTIMENTO';
    saldoInicial: bigint;
    ativa: boolean;

    createdAt: Date;
    updatedAt: Date;

    transacoes?: ITransacao[];
    transferenciasRecebidas?: ITransacao[];
}
