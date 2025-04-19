// path=src/models/Transacao.ts
import { Categoria } from './Categoria';
import { Conta } from './Conta';
import { CartaoCredito } from './CartaoCredito';
import { FaturaCartao } from './FaturaCartao';
import { User } from './User';

export interface Transacao {
  id: number;
  tipo: 'ENTRADA' | 'SAIDA' | 'TRANSFERENCIA' | 'CREDITO';
  valorCentavos: bigint;
  data: Date;
  descricao?: string;
  parcelas?: number;
  numeroParcela?: number;
  
  createdAt: Date;
  updatedAt: Date;

  categoriaId?: number;
  categoria?: Categoria;
  contaOrigemId?: number;
  contaOrigem?: Conta;
  contaDestinoId?: number;
  contaDestino?: Conta;
  cartaoId?: number;
  cartao?: CartaoCredito;
  faturaId?: number;
  fatura?: FaturaCartao;
  userId: number;
  user: User;
}