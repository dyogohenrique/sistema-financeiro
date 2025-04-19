// path=src/models/Categoria.ts
import { User } from './User';
import { Transacao } from './Transacao';

export interface Categoria {
  id: number;
  nome: string;
  tipo: 'ENTRADA' | 'SAIDA' | 'TRANSFERENCIA' | 'CREDITO';
  cor: string;

  createdAt: Date;
  updatedAt: Date;
  
  userId: number;
  user: User;
  transacoes: Transacao[];
}