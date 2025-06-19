// path=src/models/Categoria.ts
import { ITransacao } from './Transacao';

export interface ICategoria {
    id: number;
    name: string;
    tipo: 'ENTRADA' | 'SAIDA' | 'TRANSFERENCIA' | 'CREDITO';
    cor: string;

    createdAt: Date;
    updatedAt: Date;

    transacoes: ITransacao[];
}
