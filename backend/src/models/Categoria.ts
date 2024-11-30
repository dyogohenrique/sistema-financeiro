import { Model, DataTypes } from 'sequelize';
import sequelize from '../config/database';

class Categoria extends Model {
  declare id: number;
  declare nome: string;
  declare descricao?: string;
}

Categoria.init({
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
  descricao: {
    type: DataTypes.STRING
  }
}, {
  sequelize,
  tableName: 'categorias'
});

export default Categoria;