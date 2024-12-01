import { Request, Response } from "express";
import ContaService from "@/services/ContaService";
import { ApiError } from "@/utils/ApiError";

class ContaController {
  public static criar = async (req: Request, res: Response) => {
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

  public static listar = async (req: Request, res: Response) => {
    try {
      const contas = await ContaService.listar();

      res.status(200).json(contas);
    } catch (error) {
      if (error instanceof ApiError) {
        res.status(error.statusCode).json({ error: error.message });
      }
      res.status(500).json({ error: "Erro interno do servidor" });
    }
  };

  public static buscarPorId = async (req: Request, res: Response) => {
    const { id } = req.params;

    try {
      const conta = await ContaService.buscarPorId(Number(id));

      res.status(200).json(conta);
    } catch (error) {
      if (error instanceof ApiError) {
        res.status(error.statusCode).json({ error: error.message });
      }
      res.status(500).json({ error: "Erro interno do servidor" });
    }
  };

  public static atualizar = async (req: Request, res: Response) => {
    const { id } = req.params;
    const { nome, tipo, moeda } = req.body;

    try {
      const conta = await ContaService.buscarPorId(Number(id));

      if (!conta) {
        res.status(404).json({ error: "Conta não encontrada" });
        return;
      }

      // Se nenhum campo foi fornecido, usa os valores existentes
      const dadosAtualizacao = {
        nome: nome ?? conta.nome,
        tipo: tipo ?? conta.tipo,
        moeda: moeda ?? conta.moeda,
      };

      // Verifica se há alterações
      if (
        Object.entries(dadosAtualizacao).every(
          ([key, value]) => conta[key as keyof typeof conta] === value
        )
      ) {
        res.status(400).json({ error: "Nenhum campo para atualizar" });
        return;
      }

      const contaAtualizada = await ContaService.atualizar(
        Number(id),
        dadosAtualizacao
      );
      res.status(200).json(contaAtualizada);
    } catch (error) {
      if (error instanceof ApiError) {
        res.status(error.statusCode).json({ error: error.message });
      }
      res.status(500).json({ error: "Erro interno do servidor" });
    }
  };

  public static desativar = async (req: Request, res: Response) => {
    const { id } = req.params;

    try {
      await ContaService.desativar(Number(id));

      res.status(200).json({ message: "Conta desativada com sucesso" });
    } catch (error) {
      if (error instanceof ApiError) {
        res.status(error.statusCode).json({ error: error.message });
      }
      res.status(500).json({ error: "Erro interno do servidor" });
    }
  };

  public static ativar = async (req: Request, res: Response) => {
    const { id } = req.params;

    try {
      await ContaService.ativar(Number(id));

      res.status(200).json({ message: "Conta ativada com sucesso" });
    } catch (error) {
      if (error instanceof ApiError) {
        res.status(error.statusCode).json({ error: error.message });
      }
      res.status(500).json({ error: "Erro interno do servidor" });
    }
  };
}

export default ContaController;
