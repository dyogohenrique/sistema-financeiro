import { Model, DataTypes } from 'sequelize';
import sequelize from '../config/database';
import Conta from './Conta';

class CartaoCredito extends Model {
  declare id: number;
  declare nome: string;
  declare limiteTotal: number;
  declare limiteDisponivel: number;
  declare diaFechamento: number;
  declare diaVencimento: number;
  declare contaId: number;
}

CartaoCredito.init({
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  nome: {
    type: DataTypes.STRING,
    allowNull: false
  },
  limiteTotal: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  limiteDisponivel: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  diaFechamento: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      min: 1,
      max: 31
    }
  },
  diaVencimento: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      min: 1,
      max: 31
    }
  }
}, {
  sequelize,
  tableName: 'cartoes_credito'
});

CartaoCredito.belongsTo(Conta, { foreignKey: 'contaId' });
Conta.hasMany(CartaoCredito, { foreignKey: 'contaId' });

export default CartaoCredito;