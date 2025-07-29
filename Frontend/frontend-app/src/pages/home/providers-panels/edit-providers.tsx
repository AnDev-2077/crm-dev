import React, { useEffect, useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { ArrowLeft, Save, X } from "lucide-react"
import axios from "axios"
import { toast } from "sonner"

type Proveedor = {
  id: number
  nombre: string
  correo: string
  telefono: string
  direccion: string
  documento: string
  tipoDocumento: string
}

export default function EditProvider() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState<Proveedor>({
    id: 0,
    nombre: "",
    correo: "",
    telefono: "",
    direccion: "",
    documento: "",
    tipoDocumento: "RUC",
  })

  useEffect(() => {
    const fetchProveedor = async () => {
      try {
        setLoading(true)
        setError(null)
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/proveedores/${id}`)
        setFormData(response.data)
      } catch (error) {
        console.error("Error al cargar el proveedor:", error)
        if (axios.isAxiosError(error)) {
          setError(`Error ${error.response?.status}: ${error.response?.data?.detail || error.message}`)
        } else {
          setError("Error desconocido al cargar el proveedor")
        }
      } finally {
        setLoading(false)
      }
    }

    if (id) {
      fetchProveedor()
    }
  }, [id])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (value: string) => {
    setFormData((prev) => ({ ...prev, tipoDocumento: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await axios.put(`${import.meta.env.VITE_API_URL}/proveedores/${id}`, formData)
      toast.success("Proveedor actualizado correctamente")
      navigate("/home/providers-panel")
    } catch (error) {
      toast.error("Error al actualizar el proveedor")
    }
  }

  const handleCancel = () => {
    navigate("/home/providers-panel")
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-2">Cargando proveedor...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-red-600 mb-4">{error}</p>
              <Button onClick={() => navigate("/home")} variant="outline">
                Volver al inicio
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="mx-auto max-w-2xl">
        {/* Header */}
        <div className="mb-6 flex items-center gap-4">
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={handleCancel}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Editar Proveedor</h1>
            <p className="text-sm text-gray-600">Actualiza la información del proveedor</p>
          </div>
        </div>

        {/* Form Card */}
        <form onSubmit={handleSubmit}>
          <Card>
            <CardHeader>
              <CardTitle>Información del Proveedor</CardTitle>
              <CardDescription>
                Completa todos los campos requeridos para actualizar los datos del proveedor.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Nombre */}
              <div className="space-y-2">
                <Label htmlFor="nombre">Nombre *</Label>
                <Input 
                  id="nombre" 
                  name="nombre"
                  placeholder="Ingresa el nombre del proveedor" 
                  value={formData.nombre}
                  onChange={handleChange}
                  required
                />
              </div>

              {/* Documento y Tipo de Documento */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="tipo-documento">Tipo de Documento *</Label>
                  <Select value={formData.tipoDocumento} onValueChange={handleSelectChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona el tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="RUC">RUC</SelectItem>
                      <SelectItem value="DNI">DNI</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="documento">Número de Documento *</Label>
                  <Input 
                    id="documento" 
                    name="documento"
                    placeholder="Número de documento" 
                    value={formData.documento}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              {/* Teléfono y Correo */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="telefono">Teléfono *</Label>
                  <Input 
                    id="telefono" 
                    name="telefono"
                    type="tel" 
                    placeholder="Número de teléfono" 
                    value={formData.telefono}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="correo">Correo Electrónico *</Label>
                  <Input
                    id="correo"
                    name="correo"
                    type="email"
                    placeholder="correo@ejemplo.com"
                    value={formData.correo}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              {/* Dirección */}
              <div className="space-y-2">
                <Label htmlFor="direccion">Dirección *</Label>
                <Textarea
                  id="direccion"
                  name="direccion"
                  placeholder="Dirección completa del proveedor"
                  className="min-h-[80px]"
                  value={formData.direccion}
                  onChange={handleChange}
                  required
                />
              </div>

            </CardContent>

            <CardFooter className="flex flex-col gap-3 sm:flex-row sm:justify-end">
              <Button type="button" variant="outline" className="w-full sm:w-auto bg-transparent" onClick={handleCancel}>
                <X className="mr-2 h-4 w-4" />
                Cancelar
              </Button>
              <Button type="submit" className="w-full sm:w-auto">
                <Save className="mr-2 h-4 w-4" />
                Guardar Cambios
              </Button>
            </CardFooter>
          </Card>
        </form>       
      </div>
    </div>
  )
}
