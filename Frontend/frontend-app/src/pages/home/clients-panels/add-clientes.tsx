import React from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import axios from "axios"
import { toast } from "sonner"

type Cliente = {
  id: number
  nombre: string
  correo: string
  telefono: string
  direccion: string
  documento: string
  tipoDocumento: string
}

interface Props {
  open: boolean
  onOpenChange: (val: boolean) => void
  onClienteCreado?: (nuevo: Cliente) => void
}

export function ClienteFormDialog({ open, onOpenChange, onClienteCreado }: Props) {
  const API_URL = import.meta.env.VITE_API_URL
  const [formData, setFormData] = React.useState<Cliente>({
    nombre: "",
    correo: "",
    telefono: "",
    direccion: "",
    documento: "",
    tipoDocumento: "DNI",
    id: 0,
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const res = await axios.post(`${API_URL}/clientes`, formData)
      toast.success("Cliente registrado")
      onClienteCreado?.(res.data)
      onOpenChange(false)
    } catch (err) {
      toast.error("Error al registrar clientes")
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Nuevo cliente</SheetTitle>
        </SheetHeader>
        <form onSubmit={handleSubmit} className="grid gap-4 px-4">
          <div className="grid gap-3">
            <Label>Tipo de documento</Label>
            <select
              name="tipoDocumento"
              value={formData.tipoDocumento}
              onChange={handleChange}
              className="border rounded px-2 py-1"
            >              
              <option value="DNI">DNI</option>
              <option value="RUC">RUC</option>
            </select>
          </div>
          <div className="grid gap-3">
            <Label>Número de Documento</Label>
            <Input name="documento" value={formData.documento} onChange={handleChange} />
          </div>
          <div className="grid gap-3">
            <Label>Nombre</Label>
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
  )
}
