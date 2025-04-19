// path=src/models/FaturaCartao.ts
import { CartaoCredito } from './CartaoCredito';
import { User } from './User';
import { Transacao } from './Transacao';

export interface FaturaCartao {
  id: number;
  mesReferencia: number;
  anoReferencia: number;
  valorTotal: bigint;
  pago: boolean;
  dataPagamento?: Date;
  
  createdAt: Date;
  updatedAt: Date;
  
  cartaoId: number;
  cartao: CartaoCredito;
  userId: number;
  user: User;
  transacoes: Transacao[];
}