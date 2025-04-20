import { CartaoCredito } from './CartaoCredito';
import { Categoria } from './Categoria';
import { Conta } from './Conta';
import { FaturaCartao } from './FaturaCartao';
import { Transacao } from './Transacao';

export interface User {
    id: number;
    name: string;
    email: string;
    password: string;
    role: 'ADMIN' | 'USER';
    ativo: boolean;

    createdAt: Date;
    updatedAt: Date;

    contas: Conta[];
    cartoes: CartaoCredito[];
    categorias: Categoria[];
    transacoes: Transacao[];
    faturas: FaturaCartao[];
}
