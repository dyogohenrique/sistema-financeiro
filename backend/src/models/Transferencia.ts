import { Model, DataTypes } from 'sequelize';
import sequelize from '../config/database';
import Conta from './Conta';

class Transferencia extends Model {
  declare id: number;
  declare data: Date;
  declare valor: number;
  declare taxa?: number;
  declare contaOrigemId: number;
  declare contaDestinoId: number;
}

Transferencia.init({
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  data: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  valor: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    validate: {
      min: 0.01
    }
  },
  taxa: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0
  }
}, {
  sequelize,
  tableName: 'transferencias',
  validate: {
    contasDiferentes() {
      if (this.contaOrigemId === this.contaDestinoId) {
        throw new Error('A conta de origem e destino não podem ser a mesma');
      }
    }
  }
});

Transferencia.belongsTo(Conta, { as: 'contaOrigem', foreignKey: 'contaOrigemId' });
Transferencia.belongsTo(Conta, { as: 'contaDestino', foreignKey: 'contaDestinoId' });

export default Transferencia;