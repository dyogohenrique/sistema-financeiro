import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import sequelize from "@/config/database";

import contaRoutes from "@/routes/ContaRoute";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Sincroniza os models com o banco de dados
async function initDatabase() {
  try {
    await sequelize.authenticate();
    console.log("Conexão com o banco de dados estabelecida com sucesso.");

  } catch (error) {
    console.error("Erro ao conectar com o banco de dados:", error);
  }
}

initDatabase();

app.use("/contas", contaRoutes);

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
