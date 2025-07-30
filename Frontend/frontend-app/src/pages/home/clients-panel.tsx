"use client"

import * as React from "react"
import axios from "axios"
import { useNavigate } from "react-router-dom"
import type {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
} from "@tanstack/react-table"
import { ClienteFormDialog } from "./clients-panels/add-clientes"
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table"
import { ArrowUpDown, ChevronDown, MoreHorizontal } from "lucide-react"

import { Button } from "@/components/ui/button"

import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

export type Provider = {
  id: number
  nombre: string
  correo: string
  telefono: string
  direccion: string
}

export default function DataTableDemo() {
  const navigate = useNavigate()
  const [providers, setProviders] = React.useState<Provider[]>([])
  const [loading, setLoading] = React.useState(true)

  const [dialogOpen, setDialogOpen] = React.useState(false)

  const [sorting, setSorting] = React.useState<SortingState>([])
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  )
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({})
  const [rowSelection, setRowSelection] = React.useState({})
  const [globalFilter, setGlobalFilter] = React.useState("")
  
  const handleClienteCreado = (nuevo: Provider) => {
    setProviders((prev) => [...prev, nuevo])
  }

  const columns: ColumnDef<Provider>[] = [
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
      accessorKey: "documento",
      header: "Documento",
      cell: ({ row }) => (
        <div className="lowercase">{row.getValue("documento")}</div>
      ),
    },
    {
      accessorKey: "tipoDocumento",
      header: "Tipo de Documento",
      cell: ({ row }) => (
        <div className="lowercase">{row.getValue("tipoDocumento")}</div>
      ),
    },
    {
      accessorKey: "telefono",
      header: "Teléfono",
      cell: ({ row }) => <div>{row.getValue("telefono")}</div>,
    },
    {
      accessorKey: "correo",
      header: "Correo",
      cell: ({ row }) => (
        <div className="lowercase">{row.getValue("correo")}</div>
      ),
    },  
    {
      accessorKey: "direccion",
      header: "Dirección",
      cell: ({ row }) => <div>{row.getValue("direccion")}</div>,
    },
    {
      id: "actions",
      enableHiding: false,
      cell: ({ row }) => {
        const clienteId = row.original.id.toString()
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
              <DropdownMenuItem onClick={() => navigate(`/home/clients-panels/${clienteId}`)}>
                Ver cliente
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )
      },
    },
  ]

  React.useEffect(() => {
    const fetchProviders = async () => {
      try {
        const response = await axios.get("http://127.0.0.1:8000/clientes/")
        setProviders(response.data)
      } catch (error) {
        console.error("Error fetching providers:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchProviders()
  }, [])

  const table = useReactTable({
    data: providers,
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
      const nombre = row.original.nombre?.toLowerCase() || ""
      const telefono = row.original.telefono?.toLowerCase() || ""
      const val = filterValue.toLowerCase()
      return nombre.includes(val) || telefono.includes(val)
    },
  })

  if (loading) return <div className="p-4">Cargando Clientes...</div>

  return (
   <div className="w-full">
    <div className="flex items-center py-4">
      <Input
        placeholder="Buscar por nombre o teléfono..."
        value={globalFilter}
        onChange={(e) => setGlobalFilter(e.target.value)}
        className="max-w-sm"
      />

      <div className="ml-auto flex items-center gap-x-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline">
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
                  onCheckedChange={(value) =>
                    column.toggleVisibility(!!value)
                  }
                >
                  {column.id}
                </DropdownMenuCheckboxItem>
              ))}
          </DropdownMenuContent>
        </DropdownMenu>

        <Button onClick={() => setDialogOpen(true)}>+ Nuevo cliente</Button>
      </div>
    </div>

      <ClienteFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onClienteCreado={handleClienteCreado}
      />



      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
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
          
          {table.getFilteredRowModel().rows.length} clientes registrados.
        </div>
        <div className="space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Anterior
          </Button>
          <Button
            variant="outline" 
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Siguiente
          </Button>
        </div>
      </div>
    </div>
  )
}
