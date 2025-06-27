"use client";

import * as React from "react";
import {
	ColumnDef,
	ColumnFiltersState,
	SortingState,
	flexRender,
	getCoreRowModel,
	getFilteredRowModel,
	getPaginationRowModel,
	getSortedRowModel,
	useReactTable,
} from "@tanstack/react-table";

import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";

import { ChevronLeft, ChevronRight } from "lucide-react";

interface DataTableProps<TData, TValue> {
	columns: ColumnDef<TData, TValue>[];
	data: TData[];
	searchKeys?: string[];
	searchPlaceholder?: string;
}

export function DataTable<TData, TValue>({
	columns,
	data,
	searchKeys = [],
	searchPlaceholder = "Pesquisar",
}: DataTableProps<TData, TValue>) {
	const [sorting, setSorting] = React.useState<SortingState>([]);
	const [columnFilters, setColumnFilters] =
		React.useState<ColumnFiltersState>([]);
	const [globalFilter, setGlobalFilter] = React.useState("");

	const filteredData = React.useMemo(() => {
		if (!globalFilter) return data;
		const lower = globalFilter.toLowerCase();
		return data.filter((row) =>
			searchKeys.some((key) =>
				String((row as Record<string, unknown>)[key] ?? "")
					.toLowerCase()
					.includes(lower)
			)
		);
	}, [data, globalFilter, searchKeys]);

	const table = useReactTable({
		data: filteredData,
		columns,
		getCoreRowModel: getCoreRowModel(),
		getPaginationRowModel: getPaginationRowModel(),
		onSortingChange: setSorting,
		getSortedRowModel: getSortedRowModel(),
		onColumnFiltersChange: setColumnFilters,
		getFilteredRowModel: getFilteredRowModel(),
		state: {
			sorting,
			columnFilters,
			globalFilter,
		},
		onGlobalFilterChange: setGlobalFilter,
		globalFilterFn: () => {
			return true;
		},
		initialState: {
			pagination: {
				pageSize: 15,
			},
		},
	});

	const currentPage = table.getState().pagination.pageIndex;
	const totalPages = table.getPageCount();

	// Função para calcular as páginas visíveis no menu de paginação
	const getVisiblePages = () => {
		const pages = [];

		pages.push(0);

		if (currentPage <= 3) {
			for (let i = 1; i <= 4; i++) {
				if (i < totalPages - 1) {
					pages.push(i);
				}
			}
			if (totalPages > 5) {
				pages.push(-1);
			}
		} else if (currentPage >= totalPages - 4) {
			if (totalPages > 5) {
				pages.push(-1);
			}
			for (let i = totalPages - 5; i < totalPages - 1; i++) {
				if (i > 0) {
					pages.push(i);
				}
			}
		} else {
			pages.push(-1);
			for (let i = currentPage - 1; i <= currentPage + 1; i++) {
				pages.push(i);
			}
			pages.push(-1);
		}

		if (totalPages > 1) {
			pages.push(totalPages - 1);
		}

		return pages;
	};

	return (
		<div>
			<div>
				{searchKeys.length > 0 && (
					<div className="flex items-center py-4">
						<Input
							placeholder={searchPlaceholder}
							value={globalFilter}
							onChange={(event) =>
								setGlobalFilter(event.target.value)
							}
							className="max-w-sm"
						/>
					</div>
				)}
				<div className="rounded-md border">
					<Table>
						<TableHeader>
							{table.getHeaderGroups().map((headerGroup) => (
								<TableRow key={headerGroup.id}>
									{headerGroup.headers.map((header) => {
										return (
											<TableHead key={header.id}>
												{header.isPlaceholder
													? null
													: flexRender(
															header.column
																.columnDef
																.header,
															header.getContext()
													  )}
											</TableHead>
										);
									})}
								</TableRow>
							))}
						</TableHeader>
						<TableBody>
							{table.getRowModel().rows?.length ? (
								table.getRowModel().rows.map((row) => (
									<TableRow
										key={row.id}
										data-state={
											row.getIsSelected() && "selected"
										}>
										{row.getVisibleCells().map((cell) => (
											<TableCell key={cell.id}>
												{flexRender(
													cell.column.columnDef.cell,
													cell.getContext()
												)}
											</TableCell>
										))}
									</TableRow>
								))
							) : (
								<TableRow>
									<TableCell
										colSpan={columns.length}
										className="h-24 text-center">
										Nenhum resultado.
									</TableCell>
								</TableRow>
							)}
						</TableBody>
					</Table>
				</div>
			</div>
			<div className="flex flex-col sm:flex-row items-center justify-between space-y-2 sm:space-y-0 sm:space-x-2 py-4 mx-4">
				<div className="flex-1 text-sm text-muted-foreground">
					Página {currentPage + 1} de {totalPages}
				</div>
				<div className="flex items-center space-x-2">
					<Button
						variant="outline"
						size="sm"
						onClick={() => table.previousPage()}
						disabled={!table.getCanPreviousPage()}>
						<ChevronLeft className="w-4 h-4" />
					</Button>
					<div className="hidden sm:flex items-center gap-1">
						{getVisiblePages().map((pageIndex, i) => {
							if (pageIndex === -1) {
								return (
									<Popover key={`ellipsis-${i}`}>
										<PopoverTrigger asChild>
											<Button
												variant="ghost"
												size="sm"
												className="px-2">
												...
											</Button>
										</PopoverTrigger>
										<PopoverContent className="w-40">
											<div className="flex flex-col gap-2">
												<Label>Ir para página</Label>
												<Input
													type="number"
													min={1}
													max={totalPages}
													onChange={(e) => {
														const page =
															Number(
																e.target.value
															) - 1;
														if (
															page >= 0 &&
															page < totalPages
														) {
															table.setPageIndex(
																page
															);
														}
													}}
												/>
											</div>
										</PopoverContent>
									</Popover>
								);
							}

							return (
								<Button
									key={pageIndex}
									variant={
										currentPage === pageIndex
											? "default"
											: "outline"
									}
									size="sm"
									onClick={() =>
										table.setPageIndex(pageIndex)
									}>
									{pageIndex + 1}
								</Button>
							);
						})}
					</div>
					<Button
						variant="outline"
						size="sm"
						onClick={() => table.nextPage()}
						disabled={!table.getCanNextPage()}>
						<ChevronRight className="w-4 h-4" />
					</Button>
				</div>
			</div>
		</div>
	);
}
