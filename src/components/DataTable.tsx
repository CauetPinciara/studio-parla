import type { ReactNode } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export interface DataTableColumn<T> { key: string; header: string; cell: (row: T) => ReactNode; className?: string }
interface DataTableProps<T> { columns: DataTableColumn<T>[]; rows: T[]; getRowKey: (row: T) => string; emptyMessage?: string }

export function DataTable<T>({ columns, rows, getRowKey, emptyMessage = "Nenhum registro." }: DataTableProps<T>) {
  return <div className="overflow-hidden rounded-xl border bg-card"><Table><TableHeader><TableRow>{columns.map((column) => <TableHead key={column.key} className={column.className}>{column.header}</TableHead>)}</TableRow></TableHeader><TableBody>{rows.length === 0 ? <TableRow><TableCell colSpan={columns.length} className="py-10 text-center text-muted-foreground">{emptyMessage}</TableCell></TableRow> : rows.map((row) => <TableRow key={getRowKey(row)}>{columns.map((column) => <TableCell key={column.key} className={column.className}>{column.cell(row)}</TableCell>)}</TableRow>)}</TableBody></Table></div>;
}
