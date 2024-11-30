import { Model, DataTypes } from 'sequelize';
import sequelize from '../config/database';
import Conta from './Conta';

enum TipoTransacao {
  ENTRADA = 'entrada',
  SAIDA = 'saida'
}

class Transacao extends Model {
  declare id: number;
  declare data: Date;
  declare descricao: string;
  declare valor: number;
  declare tipo: TipoTransacao;
  declare contaId: number;
  declare categoriaId: number;
  declare parcelado: boolean;
  declare numeroParcela?: number;
  declare totalParcelas?: number;
  declare dataVencimento?: Date;
}

Transacao.init({
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
  descricao: {
    type: DataTypes.STRING,
    allowNull: false
  },
  valor: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  tipo: {
    type: DataTypes.ENUM(...Object.values(TipoTransacao)),
    allowNull: false
  },
  parcelado: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  numeroParcela: {
    type: DataTypes.INTEGER
  },
  totalParcelas: {
    type: DataTypes.INTEGER
  },
  dataVencimento: {
    type: DataTypes.DATE
  }
}, {
  sequelize,
  tableName: 'transacoes'
});

Transacao.belongsTo(Conta, { foreignKey: 'contaId' });
Conta.hasMany(Transacao, { foreignKey: 'contaId' });

export default Transacao;