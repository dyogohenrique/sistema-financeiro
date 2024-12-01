import { Request, Response } from "express";
import ContaService from "@/services/ContaService";
import { ApiError } from "@/utils/ApiError";

class ContaController {
  public static criar = async (req: Request, res: Response): Promise<void> => {
    const { nome, tipo, moeda } = req.body;
    
    if (!nome) {
      res.status(400).json({ error: "Nome é obrigatório" });
      return;
    }
    if (!tipo) {
      res.status(400).json({ error: "Tipo é obrigatório" });
      return;
    }
    if (!moeda) {
      res.status(400).json({ error: "Moeda é obrigatória" });
      return;
    }

    const saldo = 0;
    
    try {

      const conta = await ContaService.criar({ nome, tipo, moeda, saldo });

      res.status(201).json(conta);

    } catch (error) {
      if (error instanceof ApiError) {
        res.status(error.statusCode).json({ error: error.message });
      }
      res.status(500).json({ error: "Erro interno do servidor" });
    }
  };
}

export default ContaController;
