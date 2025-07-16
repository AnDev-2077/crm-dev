"use client"

import type React from "react"
import { useState } from "react"
import axios from "axios"
import { Upload, X } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ProveedorCombobox } from "@/components/customice-combobox"

const unitTypes = [
  { value: "unidad", label: "Unidad" },
  { value: "kg", label: "Kilogramo" },
  { value: "litro", label: "Litro" },
  { value: "metro", label: "Metro" },
  { value: "caja", label: "Caja" },
  { value: "paquete", label: "Paquete" },
]

type Proveedor = {
  id: number
  nombre: string
  correo: string
  telefono: string
  direccion: string
  documento: string
  tipoDocumento: string
}

export default function AddProductForm() {
  const [proveedorSeleccionado, setProveedorSeleccionado] = useState<Proveedor | null>(null)
  const [productImage, setProductImage] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    nombre: "",
    stock: "",
    precio: "",
    tUnidad: "",
    descripcion: "",
  })

  const API_URL = import.meta.env.VITE_API_URL

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        setProductImage(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const removeImage = () => {
    setProductImage(null)
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!proveedorSeleccionado) {
      toast.error("Debe seleccionar un proveedor")
      return
    }

    const payload = {
      ...formData,
      proveedor_id: proveedorSeleccionado.id,
      imagen: productImage,
    }

    try {
      await axios.post(`${API_URL}/productos`, payload)
      toast.success("Producto guardado exitosamente")
      // limpiar formulario si deseas
    } catch (error) {
      toast.error("Error al guardar el producto")
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Agregar Producto</h1>
          <p className="text-gray-600 mt-2">Complete la información del nuevo producto</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>Información del Producto</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="nombre">Nombre del Producto *</Label>
                    <Input
                      id="nombre"
                      placeholder="Ingrese el nombre del producto"
                      value={formData.nombre}
                      onChange={(e) => handleInputChange("nombre", e.target.value)}
                      required 
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Proveedor *</Label>
                    <ProveedorCombobox
                      value={proveedorSeleccionado}
                      onChange={setProveedorSeleccionado}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="stock">Stock *</Label>
                      <Input
                        id="stock"
                        type="number"
                        placeholder="0"
                        min="0"
                        value={formData.stock}
                        onChange={(e) => handleInputChange("stock", e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="precio">Precio *</Label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                        <Input
                          id="precio"
                          type="number"
                          placeholder="0.00"
                          min="0"
                          step="0.01"
                          className="pl-8"
                          value={formData.precio}
                          onChange={(e) => handleInputChange("precio", e.target.value)}
                          required
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Tipo de Unidad *</Label>
                    <Select
                      value={formData.tUnidad}
                      onValueChange={(value) => handleInputChange("tUnidad", value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccione el tipo de unidad" />
                      </SelectTrigger>
                      <SelectContent>
                        {unitTypes.map((unit) => (
                          <SelectItem key={unit.value} value={unit.value}>
                            {unit.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="descripcion">Descripción</Label>
                    <Textarea
                      id="descripcion"
                      placeholder="Ingrese una descripción detallada del producto"
                      rows={4}
                      value={formData.descripcion}
                      onChange={(e) => handleInputChange("descripcion", e.target.value)}
                    />
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="lg:col-span-1">
              <Card>
                <CardHeader>
                  <CardTitle>Imagen del Producto</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                    {productImage ? (
                      <div className="relative">
                        <img
                          src={productImage}
                          alt="Vista previa del producto"
                          className="mx-auto rounded-lg object-cover"
                          style={{ width: "200px", height: "200px" }}
                        />
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          className="absolute top-2 right-2"
                          onClick={removeImage}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ) : (
                      <>
                        <Upload className="mx-auto h-12 w-12 text-gray-400" />
                        <div className="text-sm text-gray-600">Haga clic para subir una imagen</div>
                      </>
                    )}
                    <Button
                      type="button"
                      variant="outline"
                      className="mt-4"
                      onClick={() => document.getElementById("image-upload")?.click()}
                    >
                      Subir Imagen
                    </Button>
                    <input
                      type="file"
                      accept="image/*"
                      id="image-upload"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                  </div>

                  <div className="border rounded-lg p-4 bg-white">
                    <h3 className="font-medium text-sm text-gray-700 mb-3">Vista Previa</h3>
                    <div className="space-y-2">
                      <div className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden">
                        {productImage ? (
                          <img
                            src={productImage}
                            alt="Vista previa"
                            className="object-cover w-full h-full"
                            style={{ width: "350px", height: "350px" }}
                          />
                        ) : (
                          <div className="text-gray-400 text-xs text-center">Sin imagen</div>
                        )}
                      </div>
                      <div className="space-y-1">
                        <h4 className="font-medium text-sm truncate">{formData.nombre || "Nombre del producto"}</h4>
                        <p className="text-xs text-gray-600 truncate">
                          {proveedorSeleccionado?.nombre || "Proveedor"}
                        </p>
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-bold text-green-600">${formData.precio || "0.00"}</span>
                          <span className="text-xs text-gray-500">Stock: {formData.stock || "0"}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          <div className="flex justify-end space-x-4 mt-6">
            <Button type="button" variant="outline">
              Cancelar
            </Button>
            <Button type="submit">Guardar Producto</Button>
          </div>
        </form>
      </div>
    </div>
  )
}
