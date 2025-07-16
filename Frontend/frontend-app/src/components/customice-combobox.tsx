"use client"

import * as React from "react"
import { CheckIcon, ChevronsUpDownIcon } from "lucide-react"
import axios from "axios"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"

import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"

import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

type Proveedor = {
  id: number
  nombre: string
  correo: string
  telefono: string
  direccion: string
  documento: string
  tipoDocumento: string
}

interface ProveedorComboboxProps {
  value?: Proveedor | null
  onChange?: (proveedor: Proveedor) => void
}

export function ProveedorCombobox({ value, onChange }: ProveedorComboboxProps) {
  const [open, setOpen] = React.useState(false)
  const [proveedores, setProveedores] = React.useState<Proveedor[]>([])
  const [selectedId, setSelectedId] = React.useState<number | null>(null)

    React.useEffect(() => {
    if (value?.id) {
      setSelectedId(value.id)
    }
  }, [value])
  
  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
  const { name, value } = e.target;
  setFormData(prev => ({ ...prev, [name]: value }));
}

  const API_URL = import.meta.env.VITE_API_URL

  const [formData, setFormData] = React.useState({
    nombre: "",
    correo: "",
    telefono: "",
    direccion: "",
    documento: "",
    tipoDocumento: "RUC",
  })

React.useEffect(() => {
    const fetchProveedores = async () => {
      try {
        const response = await axios.get(`${API_URL}/proveedores/`)
        setProveedores(response.data)
      } catch (error) {
        console.error("Error fetching proveedores:", error)
      }
    }

    fetchProveedores()
  }, [API_URL])


  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.nombre || !formData.documento) {
      toast.error("Faltan campos obligatorios")
      return
    }

    try {
      const res = await axios.post(`${API_URL}/proveedores`, formData, {

      })

      toast("Proveedor registrado")
      setProveedores(prev => [...prev, res.data])
      setFormData({
        nombre: "",
        correo: "",
        telefono: "",
        direccion: "",
        documento: "",
        tipoDocumento: "RUC"
      })
    } catch (err) {
      toast.error("Error al registrar proveedor")
    }
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-[580px] justify-between"
        >
          {selectedId
            ? (() => {
                const proveedor = proveedores.find(p => p.id === selectedId)
                return proveedor ? proveedor.nombre : "Seleccione proveedor..."
              })()
            : "Seleccione proveedor..."}
          <ChevronsUpDownIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[580px] p-0">
        <Command>
          <CommandInput placeholder="Buscar proveedor..." />
          <div className="max-h-72 overflow-y-auto">
            <CommandList>
              <CommandEmpty>No se encontró proveedor</CommandEmpty>
              <CommandGroup>
                {proveedores.map((proveedor) => (
                  <CommandItem
                    key={proveedor.id}
                    value={`${proveedor.nombre} ${proveedor.documento}`.toLowerCase()}
                    onSelect={() => {
                      setSelectedId(proveedor.id)
                      setOpen(false)
                      if (onChange) onChange(proveedor)
                    }}
                  >
                    <CheckIcon
                      className={cn(
                        "mr-2 h-4 w-4",
                        selectedId === proveedor.id ? "opacity-100" : "opacity-0"
                      )}
                    />
                    <div>
                      <div className="font-medium">{proveedor.nombre}</div>
                      <div className="text-xs text-gray-500">{proveedor.documento}</div>
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </div>
        </Command>
        <div className="border-t mt-1 sticky bottom-0">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" className="text-blue-600 w-full justify-start">
                + Agregar nuevo proveedor
              </Button>
            </SheetTrigger>
            <SheetContent>
              <SheetHeader>
                <SheetTitle>Nuevo proveedor</SheetTitle>
              </SheetHeader>
              <form onSubmit={handleSubmit} className="grid gap-4 px-4">
                <div className="grid gap-3">
                  <Label>Tipo de documento</Label>
                  <select
                    name="tipoDocumento"
                    value={formData.tipoDocumento}
                    onChange={handleSelectChange}
                    className="border rounded px-2 py-1"
                    >
                    <option value="RUC">RUC</option>
                    <option value="DNI">DNI</option>
                    </select>
                </div>
                <div className="grid gap-3">
                  <Label>Documento</Label>
                  <Input name="documento" value={formData.documento} onChange={handleChange} />
                </div>
                <div className="grid gap-3">
                  <Label>Nombre o Razón social</Label>
                  <Input name="nombre" value={formData.nombre} onChange={handleChange} />
                </div>
                <div className="grid gap-3">
                  <Label>Correo</Label>
                  <Input name="correo" value={formData.correo} onChange={handleChange} />
                </div>
                <div className="grid gap-3">
                  <Label>Teléfono</Label>
                  <Input name="telefono" value={formData.telefono} onChange={handleChange} />
                </div>
                <div className="grid gap-3">
                  <Label>Dirección</Label>
                  <Input name="direccion" value={formData.direccion} onChange={handleChange} />
                </div>
                <SheetFooter>
                  <Button type="submit">Guardar</Button>
                  <SheetClose asChild>
                    <Button variant="outline">Cerrar</Button>
                  </SheetClose>
                </SheetFooter>
              </form>
            </SheetContent>
          </Sheet>
        </div>
      </PopoverContent>
    </Popover>
  )
}
