import { DataTable } from "@/components/DataTable";
import { columns } from "./_lib/columns";
import { transacoesExemplo } from "@/lib/transacoes";

export default function TransacoesPage() {
    return <DataTable columns={columns} data={transacoesExemplo} searchKeys={["descricao"]} searchPlaceholder="Pesquisar transação" />;
}
