import Conta from "@/models/Conta";

import { ApiError } from "@/utils/ApiError";

class ContaService {
  async criar(dados: {
    nome: string;
    tipo: string;
    moeda: string;
    saldo: number;
  }) {
    try {
      const contaExistente = await Conta.findOne({
        where: { nome: dados.nome },
      });
      if (contaExistente) {
        throw new ApiError("Conta já existe", 400);
      }

      if (dados.saldo < 0) {
        throw new ApiError("Saldo não pode ser negativo", 400);
      }

      if (
        dados.tipo !== "corrente" &&
        dados.tipo !== "poupanca" &&
        dados.tipo !== "investimento"
      ) {
        throw new ApiError("Tipo de conta inválido", 400);
      }

      if (
        dados.moeda !== "BRL" &&
        dados.moeda !== "USD" &&
        dados.moeda !== "EUR"
      ) {
        throw new ApiError("Moeda inválida", 400);
      }

      const novaConta = await Conta.create(dados);
      return novaConta;
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError(`Erro ao criar conta: ${error}`, 500);
    }
  }

  async listar() {
    const contas = await Conta.findAll();
    return contas;
  }

  async buscarPorId(id: number) {
    const conta = await Conta.findByPk(id);
    return conta;
  }

  async atualizar(id: number, dados: Partial<Conta>) {
    const conta = await Conta.findByPk(id);

    if (!conta) {
      throw new ApiError("Conta não encontrada", 404);
    }

    if (dados.saldo !== undefined) {
      throw new ApiError("Não é possível atualizar o saldo diretamente", 400);
    }

    await conta.update(dados);
    return conta;
  }

  async ativar(id: number) {
    const conta = await Conta.findByPk(id);
    if (!conta) {
      throw new ApiError("Conta não encontrada", 404);
    }

    if (conta.status) {
      throw new ApiError("Conta já está ativa", 400);
    }

    await conta.update({ status: true });
    return conta;
  }

  async desativar(id: number) {
    const conta = await Conta.findByPk(id);
    if (!conta) {
      throw new ApiError("Conta não encontrada", 404);
    }

    if (!conta.status) {
      throw new ApiError("Conta já está desativada", 400);
    }

    await conta.update({ status: false });
    return conta;
  }
}

export default new ContaService();
