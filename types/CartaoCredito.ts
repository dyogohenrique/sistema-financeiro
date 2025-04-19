// path=src/models/CartaoCredito.ts
import { User } from './User';
import { Transacao } from './Transacao';
import { FaturaCartao } from './FaturaCartao';

export interface CartaoCredito {
  id: number;
  nome: string;
  bancoEmissor: string;
  limiteCentavos: bigint;
  diaFechamento: number;
  diaVencimento: number;
  
  createdAt: Date;
  updatedAt: Date;

  userId: number;
  user: User;
  transacoes: Transacao[];
  faturas: FaturaCartao[];
}