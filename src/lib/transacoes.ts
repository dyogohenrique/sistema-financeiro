import { ITransacao } from '../../types/Transacao';

// Dados de exemplo para o calendário e gráfico
export const transacoesExemplo: ITransacao[] = [
    // Junho 2025 (mês atual)
    {
        id: 1,
        tipo: 'ENTRADA',
        valorCentavos: BigInt(150000), // R$ 1.500,00
        data: new Date(2025, 5, 15), // Junho é mês 5 (0-indexed)
        descricao: 'Salário',
        parcelas: null,
        numeroParcela: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        categoriaId: 1,
        contaOrigemId: null,
        contaDestinoId: 1,
        cartaoId: null,
        faturaId: null,
    },
    {
        id: 2,
        tipo: 'SAIDA',
        valorCentavos: BigInt(2500), // R$ 25,00
        data: new Date(2025, 5, 15), // Junho é mês 5 (0-indexed)
        descricao: 'Almoço',
        parcelas: null,
        numeroParcela: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        categoriaId: 2,
        contaOrigemId: 1,
        contaDestinoId: null,
        cartaoId: null,
        faturaId: null,
    },
    {
        id: 3,
        tipo: 'SAIDA',
        valorCentavos: BigInt(50000), // R$ 500,00
        data: new Date(2025, 5, 2), // Junho é mês 5 (0-indexed)
        descricao: 'Conta de luz',
        parcelas: null,
        numeroParcela: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        categoriaId: 3,
        contaOrigemId: 1,
        contaDestinoId: null,
        cartaoId: null,
        faturaId: null,
    },
    {
        id: 4,
        tipo: 'ENTRADA',
        valorCentavos: BigInt(30000), // R$ 300,00
        data: new Date(2025, 5, 1), // Junho é mês 5 (0-indexed)
        descricao: 'Freelance',
        parcelas: null,
        numeroParcela: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        categoriaId: 1,
        contaOrigemId: null,
        contaDestinoId: 1,
        cartaoId: null,
        faturaId: null,
    },
    // Maio 2025
    {
        id: 5,
        tipo: 'ENTRADA',
        valorCentavos: BigInt(150000), // R$ 1.500,00
        data: new Date(2025, 4, 15), // Maio é mês 4
        descricao: 'Salário',
        parcelas: null,
        numeroParcela: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        categoriaId: 1,
        contaOrigemId: null,
        contaDestinoId: 1,
        cartaoId: null,
        faturaId: null,
    },
    {
        id: 6,
        tipo: 'SAIDA',
        valorCentavos: BigInt(80000), // R$ 800,00
        data: new Date(2025, 4, 10), // Maio é mês 4
        descricao: 'Aluguel',
        parcelas: null,
        numeroParcela: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        categoriaId: 3,
        contaOrigemId: 1,
        contaDestinoId: null,
        cartaoId: null,
        faturaId: null,
    },
    // Abril 2025
    {
        id: 7,
        tipo: 'ENTRADA',
        valorCentavos: BigInt(150000), // R$ 1.500,00
        data: new Date(2025, 3, 15), // Abril é mês 3
        descricao: 'Salário',
        parcelas: null,
        numeroParcela: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        categoriaId: 1,
        contaOrigemId: null,
        contaDestinoId: 1,
        cartaoId: null,
        faturaId: null,
    },
    {
        id: 8,
        tipo: 'ENTRADA',
        valorCentavos: BigInt(50000), // R$ 500,00
        data: new Date(2025, 3, 20), // Abril é mês 3
        descricao: 'Bônus',
        parcelas: null,
        numeroParcela: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        categoriaId: 1,
        contaOrigemId: null,
        contaDestinoId: 1,
        cartaoId: null,
        faturaId: null,
    },
    // Março 2025
    {
        id: 9,
        tipo: 'ENTRADA',
        valorCentavos: BigInt(150000), // R$ 1.500,00
        data: new Date(2025, 2, 15), // Março é mês 2
        descricao: 'Salário',
        parcelas: null,
        numeroParcela: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        categoriaId: 1,
        contaOrigemId: null,
        contaDestinoId: 1,
        cartaoId: null,
        faturaId: null,
    },
    {
        id: 10,
        tipo: 'SAIDA',
        valorCentavos: BigInt(120000), // R$ 1.200,00
        data: new Date(2025, 2, 5), // Março é mês 2
        descricao: 'Viagem',
        parcelas: null,
        numeroParcela: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        categoriaId: 4,
        contaOrigemId: 1,
        contaDestinoId: null,
        cartaoId: null,
        faturaId: null,
    },
    // Fevereiro 2025
    {
        id: 11,
        tipo: 'ENTRADA',
        valorCentavos: BigInt(150000), // R$ 1.500,00
        data: new Date(2025, 1, 15), // Fevereiro é mês 1
        descricao: 'Salário',
        parcelas: null,
        numeroParcela: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        categoriaId: 1,
        contaOrigemId: null,
        contaDestinoId: 1,
        cartaoId: null,
        faturaId: null,
    },
    // Janeiro 2025
    {
        id: 12,
        tipo: 'ENTRADA',
        valorCentavos: BigInt(150000), // R$ 1.500,00
        data: new Date(2025, 3, 15), // Janeiro é mês 0
        descricao: 'Salário',
        parcelas: null,
        numeroParcela: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        categoriaId: 1,
        contaOrigemId: null,
        contaDestinoId: 1,
        cartaoId: null,
        faturaId: null,
    },
    {
        id: 13,
        tipo: 'SAIDA',
        valorCentavos: BigInt(200000), // R$ 2.000,00
        data: new Date(2025, 4, 10), // Janeiro é mês 0
        descricao: 'Compras de início de ano',
        parcelas: null,
        numeroParcela: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        categoriaId: 5,
        contaOrigemId: 1,
        contaDestinoId: null,
        cartaoId: null,
        faturaId: null,
    },
    {
        id: 14,
        tipo: 'SAIDA',
        valorCentavos: BigInt(200000), // R$ 2.000,00
        data: new Date(2025, 2, 10), // Janeiro é mês 0
        descricao: 'Compras de início de ano',
        parcelas: null,
        numeroParcela: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        categoriaId: 5,
        contaOrigemId: 1,
        contaDestinoId: null,
        cartaoId: null,
        faturaId: null,
    },
    {
        id: 15,
        tipo: 'SAIDA',
        valorCentavos: BigInt(200000), // R$ 2.000,00
        data: new Date(2025, 4, 10), // Janeiro é mês 0
        descricao: 'Compras de início de ano',
        parcelas: null,
        numeroParcela: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        categoriaId: 5,
        contaOrigemId: 1,
        contaDestinoId: null,
        cartaoId: null,
        faturaId: null,
    },
];