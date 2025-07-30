"use client"

import * as React from "react"
import axios from "axios"
import type {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
} from "@tanstack/react-table"
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
import { Badge } from "@/components/ui/badge"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

import { useAuth } from "@/context/AuthContext"

interface User {
  id: number;
  nombre: string;
  apellidos: string;  
  correo: string;
  contraseña: string; 
  rol: string;
  is_active?: boolean; 
}

export default function DataTableDemo() {
  const [users, setUsers] = React.useState<User[]>([])
  const [loading, setLoading] = React.useState(true)
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({})
  const [rowSelection, setRowSelection] = React.useState({})
  const [globalFilter, setGlobalFilter] = React.useState("")
  const [dialogOpen, setDialogOpen] = React.useState(false)
  const [isEditMode, setIsEditMode] = React.useState(false)
  const [editingUser, setEditingUser] = React.useState<User | null>(null)
  const [statusFilter, setStatusFilter] = React.useState<string>("all")
  const [formData, setFormData] = React.useState({
    nombre: "",
    apellidos: "",
    correo: "",
    rol: "",
    contraseña: "",
  })

  const { token } = useAuth()
  
  const getBadgeColor = (role: string) => {
    switch (role) {
      case "administrador":
        return "bg-red-100 text-red-800 hover:bg-red-100"
      case "trabajador":
        return "bg-blue-100 text-blue-800 hover:bg-blue-100"
      default:
        return "bg-gray-100 text-gray-800 hover:bg-gray-100"
    }
  }

  const handleDialogClose = (open: boolean) => {
    if (!open) {
      setFormData({
        nombre: "",
        apellidos: "",
        correo: "",
        rol: "",
        contraseña: "",
      })
      setIsEditMode(false)
      setEditingUser(null)
    }
    setDialogOpen(open)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleCreateUser = () => {
    setFormData({
        nombre: "",
        apellidos: "",
        correo: "",
        rol: "",
        contraseña: "",
    });
    setEditingUser(null);
    setIsEditMode(false);
    setDialogOpen(true);
  };

  const handleEditUser = (user: User) => {
    setFormData({
      nombre: user.nombre,
      apellidos: user.apellidos,
      correo: user.correo,
      rol: user.rol,
      contraseña: user.contraseña,
    })
    setEditingUser(user)
    setIsEditMode(true)
    setDialogOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    
    if (!formData.nombre || !formData.apellidos || !formData.correo || !formData.contraseña || !formData.rol) {
        toast.error("Por favor complete todos los campos obligatorios");
        return;
    }

    try {
        if (isEditMode && editingUser) {
        
        const response = await axios.put(
            `http://127.0.0.1:8000/users/${editingUser.id}/`,
            formData,
            {
            headers: {
                Authorization: `Bearer ${token}`,
                "ngrok-skip-browser-warning": "true",
            },
            }
        );
        setUsers((prev) =>
            prev.map((user) => (user.id === editingUser.id ? response.data : user))
        );
        toast.success("Usuario actualizado correctamente");
        } else {
        
        const response = await axios.post(
            "http://127.0.0.1:8000/auth/registro",
            {
            nombre: formData.nombre,
            apellidos: formData.apellidos,
            correo: formData.correo,
            contraseña: formData.contraseña,
            rol: formData.rol,
            },
            {
            headers: {
                Authorization: `Bearer ${token}`,
                "ngrok-skip-browser-warning": "true",
            },
            }
        );
        setUsers((prev) => [...prev, response.data]);
        toast.success("Usuario creado correctamente");
        }
    } catch (error) {
        console.error("Error al guardar usuario:", error);
        if (axios.isAxiosError(error) && error.response?.data) {
        toast.error(`Error: ${error.response.data.message || "Error al guardar usuario"}`);
        } else {
        toast.error("Error al guardar usuario");
        }
    } finally {
        handleDialogClose(false);
    }
  };

  const handleDeleteUser = async (user: User) => {
    try {
      
      if (!window.confirm(`¿Está seguro de que desea ${user.is_active ? 'desactivar' : 'activar'} al usuario ${user.nombre} ${user.apellidos}?`)) {
        return;
      }

      const response = await axios.patch(
        `http://127.0.0.1:8000/users/${user.id}/toggle-status`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "ngrok-skip-browser-warning": "true",
          },
        }
      );

      
      setUsers((prev) =>
        prev.map((u) => (u.id === user.id ? response.data : u))
      );

      const action = response.data.is_active ? 'activado' : 'desactivado';
      toast.success(`Usuario ${action} correctamente`);
    } catch (error) {
      console.error("Error al cambiar estado del usuario:", error);
      if (axios.isAxiosError(error) && error.response?.data) {
        toast.error(`Error: ${error.response.data.detail || "Error al cambiar estado del usuario"}`);
      } else {
        toast.error("Error al cambiar estado del usuario");
      }
    }
  };

  const columns: ColumnDef<User>[] = [
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
      accessorKey: "apellidos",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Apellidos
          <ArrowUpDown />
        </Button>
      ),
      cell: ({ row }) => <div>{row.getValue("apellidos")}</div>,
    },
    {
      accessorKey: "correo",
      header: "Correo",
      cell: ({ row }) => (
        <div className="lowercase">{row.getValue("correo")}</div>
      ),
    },
    {
      accessorKey: "rol",
      header: "Rol",
      cell: ({ row }) => (
        <Badge className={getBadgeColor(row.getValue("rol"))}>
            <div className="capitalize">{row.getValue("rol")}</div>
        </Badge>
        
      ),
    },
    {
      accessorKey: "is_active",
      header: "Estado",
      cell: ({ row }) => {
        const isActive = row.getValue("is_active");
        return (
          <Badge className={isActive ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}>
            {isActive ? "Activo" : "Inactivo"}
          </Badge>
        );
      },
    },
    {
      accessorKey: "Acciones",
      id: "actions",
      enableHiding: false,
      cell: ({ row }) => {
        const user = row.original;
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
              <DropdownMenuItem onClick={() => handleEditUser(user)}>
                Editar
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => handleDeleteUser(user)}
                className={user.is_active ? "text-red-600" : "text-green-600"}
              >
                {user.is_active ? "Desactivar" : "Activar"}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )
      },
    },
  ]

  React.useEffect(() => {
    const fetchUsers = async () => {
      if (!token) {
        setLoading(false)
        return
      }

      try {
        const response = await axios.get("http://127.0.0.1:8000/users/", {
          headers: {
            Authorization: `Bearer ${token}`, 
            'ngrok-skip-browser-warning': 'true'
          }
        })
        console.log("Datos recibidos del servidor:", response.data)
        setUsers(response.data)
      } catch (error) {
        console.error("Error fetching users:", error)
        if (axios.isAxiosError(error) && error.response?.status === 401) {
          console.error("Token inválido o expirado")
        }
      } finally {
        setLoading(false)
      }
    }

    fetchUsers()
  }, [token])

  const table = useReactTable({
    data: users,
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
      const apellidos = row.original.apellidos?.toLowerCase() || ""
      const correo = row.original.correo?.toLowerCase() || ""
      const rol = row.original.rol?.toLowerCase() || ""
      const val = filterValue.toLowerCase()
      
      
      const textMatch = nombre.includes(val) || apellidos.includes(val) || correo.includes(val) || rol.includes(val)
      
      
      let statusMatch = true;
      if (statusFilter === "active") {
        statusMatch = row.original.is_active === true;
      } else if (statusFilter === "inactive") {
        statusMatch = row.original.is_active === false;
      }
      
      return textMatch && statusMatch;
    },
  })

  if (loading) return <div className="p-4">Cargando usuarios...</div>

  return (
   <div className="w-full">
    <div className="flex items-center py-4">
      <Input
        placeholder="Buscar por nombre, apellidos, correo o rol..."
        value={globalFilter}
        onChange={(e) => setGlobalFilter(e.target.value)}
        className="max-w-sm"
      />

      <div className="ml-4">
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filtrar por estado" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos los usuarios</SelectItem>
            <SelectItem value="active">Solo activos</SelectItem>
            <SelectItem value="inactive">Solo inactivos</SelectItem>
          </SelectContent>
        </Select>
      </div>

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

        <Button onClick={handleCreateUser}>+ Nuevo usuario</Button>
      </div>
    </div>
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
          {table.getFilteredRowModel().rows.length} de {users.length} usuarios
          {statusFilter !== "all" && (
            <span className="ml-1">
              ({statusFilter === "active" ? "activos" : "inactivos"})
            </span>
          )}
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
      <Dialog open={dialogOpen} onOpenChange={handleDialogClose}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{isEditMode ? "Editar Usuario" : "Agregar Usuario"}</DialogTitle>
            <DialogDescription>
              {isEditMode
                ? "Modifique los campos necesarios para actualizar la información del usuario."
                : "Complete el formulario para agregar un nuevo usuario."}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="nombre">Nombre</Label>
              <Input
                id="nombre"
                name="nombre"
                value={formData.nombre}
                onChange={handleChange}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="apellidos">Apellidos</Label>
              <Input
                id="apellidos"
                name="apellidos"
                value={formData.apellidos}
                onChange={handleChange}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="correo">Correo</Label>
              <Input
                id="correo"
                name="correo"
                type="email"
                value={formData.correo}
                onChange={handleChange}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="contraseña">Contraseña</Label>
              <Input
                id="contraseña"
                name="contraseña"
                value={formData.contraseña}
                onChange={handleChange}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="rol">Rol</Label>
              <Select
                value={formData.rol}
                onValueChange={(value) => setFormData((prev) => ({ ...prev, rol: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccione un rol" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="administrador">Administrador</SelectItem>
                  <SelectItem value="trabajador">Trabajador</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => handleDialogClose(false)}>
                Cancelar
              </Button>
              <Button type="submit" className="bg-blue-600">
                {isEditMode ? "Actualizar" : "Crear"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}