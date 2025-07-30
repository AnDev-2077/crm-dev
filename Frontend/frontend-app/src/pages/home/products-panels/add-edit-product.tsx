"use client"
import * as React from "react"

import { useState } from "react"
import { useEffect } from "react"
import axios from "axios"
import { Upload, X } from "lucide-react"
import { toast } from "sonner"
import { useRef } from "react";
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ProveedorCombobox } from "@/components/customice-combobox"

import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"

import { Toaster } from "sonner"

type Proveedor = {
  id: number
  nombre: string
  correo: string
  telefono: string
  direccion: string
  documento: string
  tipoDocumento: string
}
type tUnidad = {
  id: number
  nombre: string
}
export default function AddProductForm() {
  const [unitTypes, setUnitTypes] = useState<tUnidad[]>([])
  const [proveedorSeleccionado, setProveedorSeleccionado] = useState<Proveedor | null>(null)
  const [productImage, setProductImage] = useState<File | null>(null) 
  const [imagePreview, setImagePreview] = useState<string | null>(null)   
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [nombreUnidad, setNombreUnidad] = useState("")
  const [loadingUnidad, setLoadingUnidad] = useState(false)
  const [openDialog, setOpenDialog] = useState(false)
  const [busquedaUnidad, setBusquedaUnidad] = useState("");

  const [formData, setFormData] = useState({
    nombre: "",
    stock: "",
    precio_compra: "",
    precio_venta: "",
    tUnidad: "",
    descripcion: "",
  })

  const API_URL = import.meta.env.VITE_API_URL

  const fetchUnitTypes = async () => {
    try {
      const response = await axios.get(`${API_URL}/tipo-unidad/`)
      setUnitTypes(response.data)
    } catch (error) {
      console.error("Error al cargar tipos de unidad:", error)
      toast.error("Error al cargar unidades")
    }
  }

  useEffect(() => {
    fetchUnitTypes()
  }, [API_URL])

  const handleAgregarUnidad = async () => {
    if (!nombreUnidad.trim()) {
      toast.error("El nombre no puede estar vacío.")
      return
    }

    try {
      setLoadingUnidad(true)
      await axios.post("http://127.0.0.1:8000/tipo-unidad/", {
        nombre: nombreUnidad,
      })
      toast.success("Unidad registrada correctamente.")
      setNombreUnidad("")
      await fetchUnitTypes()
      setOpenDialog(false)
    } catch (error) {
      console.error("Error al registrar tipo de unidad:", error)
      toast.error("No se pudo registrar la unidad.")
    } finally {
      setLoadingUnidad(false)
    }
  }

  const handleEliminarUnidad = async (id: number) => {
    try {
      await axios.delete(`${API_URL}/tipo-unidad/${id}`);
      setUnitTypes(unitTypes.filter(u => u.id !== id));
      toast.success("Unidad eliminada");
    } catch (error) {
      toast.error("No se pudo eliminar la unidad");
    }
  };


  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setProductImage(file) 
      const reader = new FileReader()
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const removeImage = () => {
    setProductImage(null)
    setImagePreview(null)
      if (fileInputRef.current) {
    fileInputRef.current.value = ""; 
  }
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

    const formDataToSend = new FormData()

    formDataToSend.append('nombre', formData.nombre)
    formDataToSend.append('descripcion', formData.descripcion)
    formDataToSend.append('precio_compra', formData.precio_compra)
    formDataToSend.append('precio_venta', formData.precio_venta)
    formDataToSend.append('stock', formData.stock)
    formDataToSend.append('tUnidad', formData.tUnidad)
    formDataToSend.append('proveedor_id', proveedorSeleccionado.id.toString())
    if (productImage) {
      formDataToSend.append('imagen', productImage)
    }

    if (productImage) {
      formDataToSend.append('file', productImage)
    }

    try {
      await axios.post(`${API_URL}/productos/`, formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })
      toast.success("Producto guardado exitosamente")
      

      setFormData({
        nombre: "",
        stock: "",
        precio_compra: "",
        precio_venta: "",
        tUnidad: "",
        descripcion: "",
        
      })
      setProveedorSeleccionado(null)
      setProductImage(null)
      setImagePreview(null)
    } catch (error) {
      toast.error("Error al guardar el producto")
    }

  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <Toaster /> {}
    <div className="max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Agregar Producto</h1>
        <p className="text-gray-600 mt-2">Complete la información del nuevo producto</p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Columna 1 y 2: Formulario */}
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
                    <Label htmlFor="precio_compra">Precio de Compra*</Label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">S/.</span>
                      <Input
                        id="precio_compra"
                        type="number"
                        placeholder="0.00"
                        min="0"
                        step="0.01"
                        className="pl-8"
                        value={formData.precio_compra}
                        onChange={(e) => handleInputChange("precio_compra", e.target.value)}
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="precio_venta">Precio de Venta*</Label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">S/.</span>
                      <Input
                        id="precio_venta"
                        type="number"
                        placeholder="0.00"
                        min="0"
                        step="0.01"
                        className="pl-8"
                        value={formData.precio_venta}
                        onChange={(e) => handleInputChange("precio_venta", e.target.value)}
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Tipo de Unidad *</Label>
                  <div className="flex items-end gap-2">
                    <Select
                      value={formData.tUnidad}
                      onValueChange={(value) => handleInputChange("tUnidad", value)}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Seleccione el tipo de unidad" />
                      </SelectTrigger>
                      <SelectContent className="max-h-60 overflow-y-auto">
                        <div className="p-2">
                          <Input
                            placeholder="Buscar unidad..."
                            value={busquedaUnidad}
                            onChange={e => setBusquedaUnidad(e.target.value)}
                            onKeyDown={e => e.stopPropagation()}
                            className="mb-2"
                          />
                          {unitTypes
                            .filter(u => u.nombre.toLowerCase().includes(busquedaUnidad.toLowerCase()))
                            .map(unidad => (
                              <div key={unidad.id} className="flex items-center justify-between">
                                <SelectItem value={unidad.id.toString()}>{unidad.nombre}</SelectItem>
                                <Button
                                  type="button"
                                  size="icon"
                                  variant="ghost"
                                  className="text-red-500"
                                  onClick={e => {
                                    e.stopPropagation();
                                    handleEliminarUnidad(unidad.id);
                                  }}
                                >
                                  <X className="w-4 h-4" />
                                </Button>
                              </div>
                            ))}
                        </div>
                      </SelectContent>
                    </Select>

                    <Dialog open={openDialog} onOpenChange={setOpenDialog}>
                      <DialogTrigger asChild>
                        <Button type="button" variant="outline">
                          +
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Agregar Tipo de Unidad</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div className="space-y-4">
                            <Label htmlFor="nombre-unidad">Nombre</Label>
                            <Input
                              id="nombre-unidad"
                              value={nombreUnidad}
                              onChange={(e) => setNombreUnidad(e.target.value)}
                              placeholder="Escriba el tipo de unidad"
                            />
                          </div>
                        </div>
                        <DialogFooter>
                          <Button onClick={handleAgregarUnidad} disabled={loadingUnidad}>
                            {loadingUnidad ? "Guardando..." : "Guardar"}
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </div>
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

          {/* Columna 3: Imagen */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>Imagen del Producto</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
              <div
                className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center relative flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 transition"
                onClick={() => {
                  if (!imagePreview) fileInputRef.current?.click();
                }}
              >
                {imagePreview ? (
                  <div className="relative">
                    <img
                      src={imagePreview}
                      alt="Vista previa del producto"
                      className="mx-auto rounded-lg object-cover"
                      style={{ width: "200px", height: "200px" }}
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      className="absolute top-2 right-2 z-10"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeImage();
                      }}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Upload className="mx-auto h-12 w-12 text-gray-400" />
                    <div className="text-sm text-gray-600">Haga clic para subir una imagen</div>
                  </div>
                )}

                <input
                  type="file"
                  accept="image/*"
                  id="image-upload"
                  onChange={handleImageUpload}
                  ref={fileInputRef}
                  className="hidden"
                />
              </div>

              <div className="border rounded-lg p-4 bg-white">
                <h3 className="font-medium text-sm text-gray-700 mb-3">Vista Previa</h3>
                <div className="space-y-2">
                  <div className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden">
                    {imagePreview ? (
                      <img
                        src={imagePreview}
                        alt="Vista previa"
                        className="max-h-full max-w-full object-contain"
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
                      <span className="text-sm font-bold text-green-600">S/.{formData.precio_compra || "0.00"}</span>
                      <span className="text-sm font-bold text-yellow-600">S/.{formData.precio_venta || "0.00"}</span>
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
          <Button type="button" variant="outline" >
            <a href="/home/products-panel">Volver</a>
          </Button>
          <Button type="submit" >
            Guardar Producto
            </Button>
        </div>
      </form>
    </div>
  </div>
  )
}
