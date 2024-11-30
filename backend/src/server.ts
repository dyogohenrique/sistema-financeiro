import express from 'express';
import cors from 'cors';
import sequelize from './config/database';

const app = express();
const port = process.env.PORT || 5000;

// Middlewares
app.use(cors());
app.use(express.json());

// Teste de conexão com o banco
sequelize.authenticate()
  .then(() => {
    console.log('Conexão com o banco de dados estabelecida com sucesso.');
  })
  .catch(err => {
    console.error('Erro ao conectar com o banco de dados:', err);
  });

// Rota básica de teste
app.get('/', (req, res) => {
  res.json({ message: 'API Sistema Financeiro' });
});

app.listen(port, () => {
  console.log(`Servidor rodando na porta ${port}`);
});