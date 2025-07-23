"use client"

import { useEffect, useState } from "react"
import { useParams } from "react-router-dom"
import axios from "axios"
import { Edit, Save, X, Upload } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"

interface Product {
  id: number
  nombre: string
  stock: number
  precio_compra: number
  precio_venta: number
  tipo_unidad: { id: number; nombre: string } | null
  descripcion: string
  imagen: string | null
  proveedores: {
    id: number
    nombre: string
  }[]
}

interface TipoUnidad {
  id: number
  nombre: string
}

export default function ProductDetails() {
  const { id } = useParams<{ id: string }>()
  const [product, setProduct] = useState<Product | null>(null)
  const [editedProduct, setEditedProduct] = useState<Product | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null)
  const [previewImage, setPreviewImage] = useState<string | null>(null)
  const [proveedoresList, setProveedoresList] = useState<{ id: number; nombre: string }[]>([])
  const [unidadList, setUnidadList] = useState<TipoUnidad[]>([])

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [productoRes, proveedoresRes, unidadRes] = await Promise.all([
          axios.get(`http://localhost:8000/productos/${id}`),
          axios.get("http://localhost:8000/proveedores/"),
          axios.get("http://localhost:8000/tipo-unidad/"),
        ])
        setProduct(productoRes.data)
        setEditedProduct(productoRes.data)
        setProveedoresList(proveedoresRes.data)
        setUnidadList(unidadRes.data)
      } catch (error) {
        console.error("Error al cargar datos", error)
      }
    }
    fetchData()
  }, [id])

  const handleEdit = () => setIsEditing(true)

  const handleCancel = () => {
    setIsEditing(false)
    setEditedProduct(product)
    setSelectedImageFile(null)
    setPreviewImage(null)
  }

  const handleInputChange = (field: keyof Product, value: any) => {
    if (!editedProduct) return
    setEditedProduct({ ...editedProduct, [field]: value })
  }

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setSelectedImageFile(file)
      setPreviewImage(URL.createObjectURL(file))
      event.target.value = ""
    }
  }

  const handleSave = async () => {
    if (!editedProduct) return

    try {
      const formData = new FormData()
      formData.append("nombre", editedProduct.nombre)
      formData.append("stock", editedProduct.stock.toString())
      formData.append("precio_compra", editedProduct.precio_compra.toString())
      formData.append("precio_venta", editedProduct.precio_venta.toString())
      formData.append("descripcion", editedProduct.descripcion || "")
      formData.append("tUnidad", editedProduct.tipo_unidad?.id.toString() || "")

      if (editedProduct.proveedores?.[0]?.id) {
        formData.append("proveedor_id", editedProduct.proveedores[0].id.toString())
      }

      if (selectedImageFile) {
        formData.append("imagen", selectedImageFile)
      }

      await axios.put(
        `http://localhost:8000/productos/${editedProduct.id}`,
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      )

      const updated = await axios.get(`http://localhost:8000/productos/${id}`)
      setProduct(updated.data)
      setEditedProduct(updated.data)
      setIsEditing(false)
      setSelectedImageFile(null)
      setPreviewImage(null)
    } catch (error) {
      console.error(" Error al guardar el producto", error)
    }
  }

  if (!product || !editedProduct) {
    return <div className="p-6 text-center">Cargando producto...</div>
  }

  const current = isEditing ? editedProduct : product
  const imageSrc = previewImage
    ? previewImage
    : current.imagen
    ? `http://localhost:8000${current.imagen.startsWith("/") ? current.imagen : "/" + current.imagen}`
    : ""

  return (
    <div className="container mx-auto px-4 py-6 max-w-4xl">
      <Card>
        <CardHeader className="flex justify-between items-center pb-6">
          <CardTitle className="text-2xl">Detalles del Producto</CardTitle>
          <div className="flex gap-2">
            {!isEditing && (
              <Button type="button" variant="outline">
                <a href="/home/products-panel">Volver</a>
              </Button>
            )}

            {!isEditing ? (
              <Button onClick={handleEdit}>
                <Edit className="w-4 h-4 mr-1" /> Editar
              </Button>
            ) : (
              <>
                <Button onClick={handleSave}>
                  <Save className="w-4 h-4 mr-1" /> Guardar
                </Button>
                <Button onClick={handleCancel} variant="outline">
                  <X className="w-4 h-4 mr-1" /> Cancelar
                </Button>
              </>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            {/* Imagen */}
            <div className="space-y-4">
              <Label>Imagen del Producto</Label>
              <div className="relative group">
                {imageSrc ? (
                  <img src={imageSrc} alt={current.nombre} className="max-h-full max-w-full object-contain center mx-auto rounded-lg" />
                ) : (
                  <div className="w-full h-64 bg-gray-200 rounded-lg flex items-center justify-center text-gray-500">
                    Sin imagen
                  </div>
                )}
                {isEditing && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity">
                    <label htmlFor="image-upload" className="text-white cursor-pointer text-center">
                      <Upload className="h-6 w-6 mx-auto mb-1" />
                      Cambiar imagen
                    </label>
                  </div>
                )}
              </div>
              {isEditing && (
                <input id="image-upload" type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
              )}
            </div>

            {/* Datos del producto */}
            <div className="space-y-4">
              {/* Nombre */}
              <div className="space-y-2">
                <Label>Nombre del Producto</Label>
                {isEditing ? (
                  <Input value={editedProduct.nombre} onChange={(e) => handleInputChange("nombre", e.target.value)} />
                ) : (
                  <div className="p-3 bg-muted rounded-md">{product.nombre}</div>
                )}
              </div>

              {/* Proveedor */}
              <div className="space-y-2">
                <Label>Proveedor</Label>
                {isEditing ? (
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" role="combobox" className="w-full justify-between">
                        {editedProduct.proveedores?.[0]?.nombre || "Seleccionar proveedor"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-full p-0">
                      <Command>
                        <CommandInput placeholder="Buscar proveedor..." />
                        <CommandEmpty>No se encontró proveedor</CommandEmpty>
                        <CommandGroup>
                          {proveedoresList.map((proveedor) => (
                            <CommandItem
                              key={proveedor.id}
                              value={proveedor.nombre}
                              onSelect={() => {
                                setEditedProduct((prev) =>
                                  prev
                                    ? {
                                        ...prev,
                                        proveedores: [{ id: proveedor.id, nombre: proveedor.nombre }],
                                      }
                                    : null
                                )
                              }}
                            >
                              {proveedor.nombre}
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </Command>
                    </PopoverContent>
                  </Popover>
                ) : (
                  <div className="p-3 bg-muted rounded-md">
                    {product.proveedores?.[0]?.nombre || "Sin proveedor"}
                  </div>
                )}
              </div>

              {/* Stock y Precio */}
              <div className="grid grid-cols-2 gap-4 ">
                <div className="space-y-2">
                  <Label>Stock</Label>
                  {isEditing ? (
                    <Input
                      type="number"
                      value={editedProduct.stock}
                      onChange={(e) => handleInputChange("stock", parseInt(e.target.value))}
                    />
                  ) : (
                    <div className="p-3 bg-muted rounded-md">{product.stock}</div>
                  )}
                </div>
                <div className="space-y-2">
                  <Label>Precio Compra</Label>
                  {isEditing ? (
                    <Input
                      type="number"
                      step="0.01"
                      value={editedProduct.precio_compra}
                      onChange={(e) => handleInputChange("precio_compra", parseFloat(e.target.value))}
                    />
                  ) : (
                    <div className="p-3 bg-muted rounded-md">S/.{product.precio_compra.toFixed(2)}</div>
                  )}
                </div>
                <div className="space-y-2">
                  <Label>Precio Venta</Label>
                  {isEditing ? (
                    <Input
                      type="number"
                      step="0.01"
                      value={editedProduct.precio_venta}
                      onChange={(e) => handleInputChange("precio_venta", parseFloat(e.target.value))}
                    />
                  ) : (
                    <div className="p-3 bg-muted rounded-md">S/.{product.precio_venta.toFixed(2)}</div>
                  )}
                </div>
              </div>

              {/* Tipo de unidad */}
              <div className="space-y-2">
                <Label>Tipo de Unidad</Label>
                {isEditing ? (
                  <Select
                    value={editedProduct.tipo_unidad?.id.toString()}
                    onValueChange={(value) => {
                      const selected = unidadList.find((u) => u.id === parseInt(value))
                      if (selected) {
                        setEditedProduct((prev) =>
                          prev ? { ...prev, tipo_unidad: selected } : null
                        )
                      }
                    }}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Seleccionar unidad" />
                    </SelectTrigger>
                    <SelectContent>
                      {unidadList.map((unidad) => (
                        <SelectItem key={unidad.id} value={unidad.id.toString()}>
                          {unidad.nombre}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <div className="p-3 bg-muted rounded-md">
                    {product.tipo_unidad?.nombre || "Sin unidad"}
                  </div>
                )}
              </div>
            </div>
          </div>

          <Separator />

          {/* Descripción */}
          <div className="space-y-2">
            <Label>Descripción</Label>
            {isEditing ? (
              <Textarea
                value={editedProduct.descripcion}
                onChange={(e) => handleInputChange("descripcion", e.target.value)}
              />
            ) : (
              <div className="p-3 bg-muted rounded-md min-h-[100px]">{product.descripcion}</div>
            )}
          </div>
          {/* Información adicional */}
          {!isEditing && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-6">
              <div className="text-center p-4 bg-muted/50 rounded-lg">
                <div className="text-2xl font-bold text-primary">{product.stock}</div>
                <div className="text-sm text-muted-foreground">Unidades en Stock</div>
              </div>

              <div className="text-center p-4 bg-muted/50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">
                  S/.{product.precio_compra.toFixed(2)}
                </div>
                <div className="text-sm text-muted-foreground">
                  Precio por compra de {product.tipo_unidad?.nombre.toLowerCase() || "unidad"} 
                </div>
              </div>

              <div className="text-center p-4 bg-muted/50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">
                  S/.{product.precio_venta.toFixed(2)}
                </div>
                <div className="text-sm text-muted-foreground">
                  Precio por venta de {product.tipo_unidad?.nombre.toLowerCase() || "unidad"}
                </div>
              </div>

              <div className="text-center p-4 bg-muted/50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">#{product.id}</div>
                <div className="text-sm text-muted-foreground">ID del Producto</div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
