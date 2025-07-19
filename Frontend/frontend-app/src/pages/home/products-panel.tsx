"use client"

import * as React from "react"
import axios from "axios"
import { useNavigate } from "react-router-dom"
import { Plus } from "lucide-react"

import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table"
import type {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
} from "@tanstack/react-table"

import { ArrowUpDown, ChevronDown, MoreHorizontal } from "lucide-react"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu"

export type Productos = {
  id: number
  nombre: string
  descripcion: string
  precio: number
  stock: number
  tipo_unidad: { id: number; nombre: string } | null
  fechaIngreso: string
  proveedores?: {
    nombre: string
  }
}

export default function DataTableDemo() {
  const navigate = useNavigate()

  const [productos, setProductos] = React.useState<Productos[]>([])
  const [loading, setLoading] = React.useState(true)

  const [sorting, setSorting] = React.useState<SortingState>([])
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({})
  const [rowSelection, setRowSelection] = React.useState({})
  const [globalFilter, setGlobalFilter] = React.useState("")


  const columns: ColumnDef<Productos>[] = [
    {
      accessorKey: "id",
      header: "ID",
      cell: ({ row }) => <div>{row.getValue("id")}</div>,
    },
    {
      accessorKey: "nombre",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Nombre
          <ArrowUpDown />
        </Button>
      ),
      cell: ({ row }) => <div>{row.getValue("nombre")}</div>,
    },
    {
      accessorKey: "descripcion",
      header: "Descripción",
      cell: ({ row }) => <div className="lowercase">{row.getValue("descripcion")}</div>,
    },
    {
      accessorKey: "precio",
      header: "Precio",
      cell: ({ row }) => <div>S/. {row.getValue("precio")}</div>,
    },
    {
      accessorKey: "stock",
      header: "Stock",
      cell: ({ row }) => <div>{row.getValue("stock")}</div>,
    },
    {
      accessorKey: "tipo_unidad",
      header: "Tipo de Unidad",
      cell: ({ row }) => {
        const unidad = row.getValue("tipo_unidad") as { nombre: string } | null
        return <div>{unidad?.nombre ?? "—"}</div>
      },
    },
    {
      accessorKey: "proveedores",
      header: "Proveedor",
      cell: ({ row }) => {
        const proveedores = row.getValue("proveedores") as { nombre: string }[] | undefined
        const nombres = proveedores?.map((p) => p.nombre).join(", ")
        return <div>{nombres || "—"}</div>
      },
    },
    {
      accessorKey: "fechaIngreso",
      header: "Fecha de Ingreso",
      cell: ({ row }) => {
        const rawDate = row.getValue("fechaIngreso") as string
        if (!rawDate || isNaN(Date.parse(rawDate))) return <div>—</div>
        const formatted = new Date(rawDate).toLocaleDateString("es-ES", {
          year: "numeric",
          month: "long",
          day: "numeric",
        })
        return <div>{formatted}</div>
      },
    },
    {
      id: "actions",
      enableHiding: false,
      cell: ({ row }) => {
        const productId = row.original.id.toString()
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Acciones</DropdownMenuLabel>
              <DropdownMenuItem onClick={() => navigate(`/home/products-panels/${productId}`)}>
                Ver producto
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )
      },
    },
  ]

  React.useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await axios.get("http://127.0.0.1:8000/productos/")
        setProductos(response.data)
      } catch (error) {
        console.error("Error fetching productos:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchProducts()
  }, [])

  const table = useReactTable({
    data: productos,
    columns,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
      globalFilter,
    },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    globalFilterFn: (row, _, filterValue) => {
      const nombre = row.original.nombre?.toLowerCase() ?? ""
      const descripcion = row.original.descripcion?.toLowerCase() ?? ""
      const term = filterValue.toLowerCase()
      return nombre.includes(term) || descripcion.includes(term)
    },
  })

  if (loading) return <div className="p-4">Cargando productos...</div>

  return (
    <div className="w-full">

      <div className="flex items-center py-4">
        <Input
          placeholder="Buscar producto por nombre..."
          value={globalFilter}
          onChange={(e) => setGlobalFilter(e.target.value)}
          className="max-w-sm"
        />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="ml-auto">
              Columnas <ChevronDown />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {table
              .getAllColumns()
              .filter((column) => column.getCanHide())
              .map((column) => (
                <DropdownMenuCheckboxItem
                  key={column.id}
                  className="capitalize"
                  checked={column.getIsVisible()}
                  onCheckedChange={(value) => column.toggleVisibility(!!value)}
                >
                  {column.id}
                </DropdownMenuCheckboxItem>
              ))}
          </DropdownMenuContent>
        </DropdownMenu>

        <Button
          variant="default" // estilo negro por defecto
          className="ml-2"
          onClick={() => navigate(`/home/products-panels`)}
        >
          <Plus className="mr-2 h-4 w-4" />
          Agregar Producto
        </Button>

      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id} data-state={row.getIsSelected() && "selected"}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  Sin resultados.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-end space-x-2 py-4">
        <div className="text-muted-foreground flex-1 text-sm">
          {table.getFilteredSelectedRowModel().rows.length} de{" "}
          {table.getFilteredRowModel().rows.length} seleccionados.
        </div>
        <div className="space-x-2">
          <Button variant="outline" size="sm" onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()}>
            Anterior
          </Button>
          <Button variant="outline" size="sm" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>
            Siguiente
          </Button>
        </div>
      </div>
    </div>
  )
}
