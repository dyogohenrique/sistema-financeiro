import { Model, DataTypes } from 'sequelize';
import sequelize from '../config/database';

enum TipoConta {
  CORRENTE = 'corrente',
  POUPANCA = 'poupanca',
  INVESTIMENTO = 'investimento'
}

enum Moeda {
  BRL = 'BRL',
  USD = 'USD',
  EUR = 'EUR'
}

class Conta extends Model {
  declare id: number;
  declare nome: string;
  declare tipo: TipoConta;
  declare moeda: Moeda;
  declare saldo: number;
  declare status: boolean;
}

Conta.init({
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  nome: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  tipo: {
    type: DataTypes.ENUM(...Object.values(TipoConta)),
    allowNull: false
  },
  moeda: {
    type: DataTypes.ENUM(...Object.values(Moeda)),
    allowNull: false,
    defaultValue: Moeda.BRL
  },
  saldo: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0,
    validate: {
      min: 0
    }
  },
  status: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true
  }
}, {
  sequelize,
  tableName: 'contas'
});

export default Conta;