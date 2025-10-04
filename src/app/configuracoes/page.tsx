'use client';

import { getAllCategorias } from '@/actions/CategotiasActions';
import { ThemeController } from '@/components/ThemeController';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Categoria } from '@prisma/client';
import { Edit, Plus, Tag } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { CategoriaForm } from './_components/CategoriasForm';

type BadgeColor =
    | 'blue'
    | 'purple'
    | 'green'
    | 'amber'
    | 'red'
    | 'cyan'
    | 'lime'
    | 'orange'
    | 'pink'
    | 'gray';

export default function ConfiguracoesPage() {
    const [categorias, setCategorias] = useState<Categoria[]>([]);
    const [editingCategoria, setEditingCategoria] = useState<number | null>(null);
    const [showForm, setShowForm] = useState(false);

    const fetchCategorias = useCallback(async () => {
        const data = await getAllCategorias();
        setCategorias(data);
    }, []);

    useEffect(() => {
        fetchCategorias();
    }, [fetchCategorias]);

    const handleCloseForm = useCallback(() => {
        setShowForm(false);
        setEditingCategoria(null);
        // O revalidatePath nas actions cuidará da atualização dos dados.
        // Mas, podemos manter o fetch aqui por garantia caso o revalidate falhe ou seja removido.
        fetchCategorias();
    }, [fetchCategorias]);

    return (
        <div className="space-y-6 p-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold">Configurações</h1>
                <ThemeController />
            </div>

            <div className='space-y-2'>
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-semibold">Categorias</h2>
                        <p className="text-muted-foreground">
                            Gerencie as categorias para suas transações.
                        </p>
                    </div>
                    <Button
                        onClick={() => {
                            setShowForm(true);
                            setEditingCategoria(null);
                        }}
                        variant="outline"
                    >
                        <Plus className="mr-2 h-4 w-4" />
                        Nova Categoria
                    </Button>
                </div>
                <Card>
                    <CardContent>
                        <div className="flex flex-wrap gap-4">
                            {categorias.map((categoria) => (
                                <div
                                    key={categoria.id}
                                    className="flex items-center gap-2 rounded-lg border p-3"
                                >
                                    <Badge color={categoria.color as BadgeColor}>
                                        {categoria.name}
                                    </Badge>
                                    {/* O único botão de ação agora é o de editar */}
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-7 w-7"
                                        onClick={() => {
                                            setEditingCategoria(categoria.id);
                                            setShowForm(true);
                                        }}
                                    >
                                        <Edit className="h-4 w-4" />
                                    </Button>
                                </div>
                            ))}
                            {categorias.length === 0 && (
                                <div className="text-muted-foreground flex w-full flex-col items-center justify-center rounded-md border-2 border-dashed py-12">
                                    <Tag className="mb-4 h-16 w-16" />
                                    <h3 className="mb-2 text-lg font-medium">
                                        Nenhuma categoria cadastrada
                                    </h3>
                                    <p className="mb-4">
                                        Adicione sua primeira categoria para começar.
                                    </p>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>
                <CategoriaForm
                    open={showForm}
                    categoriaId={editingCategoria}
                    categoriaData={categorias.find((c) => c.id === editingCategoria) || null}
                    onClose={handleCloseForm}
                />
            </div>
        </div>
    );
}
