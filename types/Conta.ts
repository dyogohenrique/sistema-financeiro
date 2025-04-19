// path=src/models/Conta.ts
import { User } from './User';
import { Transacao } from './Transacao';

export interface Conta {
  id: number;
  nome: string;
  tipo: 'CORRENTE' | 'POUPANCA' | 'INVESTIMENTO';
  saldoInicial: bigint;
  ativa: boolean;

  createdAt: Date;
  updatedAt: Date;
  
  userId: number;
  user: User;
  transacoes: Transacao[];
  transferenciasRecebidas: Transacao[];
}