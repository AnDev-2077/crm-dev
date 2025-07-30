"use client"

import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import axios from "axios"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ArrowLeft, ShoppingCart, User, FileText, Calendar  } from "lucide-react"
import BoletaExport from "@/pages/home/templates/boletaExport"

interface Compra {
  id: number
  orden_compra?: string
  fecha?: string
  proveedor?: {
    id?: number
    nombre?: string
    documento?: string
    correo?: string
    telefono?: string
  }
  detalles?: DetalleCompra[]
}

interface DetalleCompra {
  id?: number
  producto?: {
    id?: number
    nombre?: string
  }
  cantidad?: number
  precio_unitario?: number
  total?: number
}

export default function ShoppingDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [compra, setCompra] = useState<Compra | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchCompra = async () => {
      try {
        setLoading(true)
        setError(null)
        console.log("Fetching compra with ID:", id)
        console.log("API URL:", `${import.meta.env.VITE_API_URL}/compras/${id}`)
        
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/compras/${id}`)
        console.log("Response received:", response.data)
        setCompra(response.data)
      } catch (error) {
        console.error("Error al cargar la compra:", error)
        if (axios.isAxiosError(error)) {
          console.error("Status:", error.response?.status)
          console.error("Data:", error.response?.data)
          setError(`Error ${error.response?.status}: ${error.response?.data?.detail || error.message}`)
        } else {
          setError("Error desconocido al cargar la compra")
        }
      } finally {
        setLoading(false)
      }
    }

    if (id) {
      fetchCompra()
    }
  }, [id])

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("es-PE", {
      style: "currency",
      currency: "PEN",
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("es-CL", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
            <p className="text-muted-foreground">Cargando detalles de la compra...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4 text-red-600">Error al cargar la compra</h2>
          <p className="text-muted-foreground mb-4">{error}</p>
          <div className="space-x-4">
            <Button onClick={() => window.location.reload()}>
              Reintentar
            </Button>
            <Button variant="outline" onClick={() => navigate("/home/shopping-record-panel")}>
              Volver al historial
            </Button>
          </div>
        </div>
      </div>
    )
  }

  if (!compra) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Compra no encontrada</h2>
          <Button onClick={() => navigate("/home/shopping-record-panel")}>
            Volver al historial
          </Button>
        </div>
      </div>
    )
  }

  const totalCompra = (compra.detalles || []).reduce((sum, detalle) => sum + (detalle.total || 0), 0)
  const totalItems = (compra.detalles || []).reduce((sum, detalle) => sum + (detalle.cantidad || 0), 0)

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <Button variant="outline" onClick={() => navigate("/home/shopping-record-panel")}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Detalle de Compra</h1>
            <p className="text-muted-foreground">Orden: #{compra.orden_compra || "N/A"}</p>
          </div>
        </div>
        <Badge variant="default" className="text-lg px-4 py-2">
          Completada
        </Badge>
      </div>

      <div className="space-y-6">
        {/* Información General */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Información de la Compra */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-xl">
                <FileText className="w-5 h-5 mr-2" />
                Información de la Compra
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between py-2 border-b">
                <span className="text-muted-foreground flex items-center">
                  <FileText className="w-4 h-4 mr-2" />
                  Número de Orden:
                </span>
                <span className="font-semibold text-lg">#{compra.orden_compra || "N/A"}</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b">
                <span className="text-muted-foreground flex items-center">
                  <Calendar className="w-4 h-4 mr-2" />
                  Fecha de Compra:
                </span>
                <span className="font-medium">
                  {compra.fecha ? formatDate(compra.fecha) : "No disponible"}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Información del Proveedor */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-xl">
                <User className="w-5 h-5 mr-2" />
                Información del Proveedor
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between py-2 border-b">
                <span className="text-muted-foreground flex items-center">
                  <User className="w-4 h-4 mr-2" />
                  Proveedor:
                </span>
                <span className="font-semibold text-lg">{compra.proveedor?.nombre || "Sin proveedor"}</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b">
                <span className="text-muted-foreground flex items-center">
                  <FileText className="w-4 h-4 mr-2" />
                  Documento:
                </span>
                <span className="font-medium">{compra.proveedor?.documento || "N/A"}</span>
              </div>
              <div className="flex items-center justify-between py-2">
                <span className="text-muted-foreground">Teléfono:</span>
                <span className="font-medium">{compra.proveedor?.telefono || "N/A"}</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Productos Comprados */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center text-xl">
              <ShoppingCart className="w-5 h-5 mr-2" />
              Productos Comprados ({(compra.detalles || []).length} {(compra.detalles || []).length === 1 ? "producto" : "productos"})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-left">Producto</TableHead>
                    <TableHead className="text-center">Cantidad</TableHead>
                    <TableHead className="text-right">Precio Unitario</TableHead>
                    <TableHead className="text-right">Subtotal</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(compra.detalles || []).map((detalle, index) => (
                    <TableRow key={index} className="hover:bg-muted/50">
                      <TableCell className="font-medium py-4">
                        {detalle.producto?.nombre || "Producto no encontrado"}
                      </TableCell>
                      <TableCell className="text-center py-4">
                        <Badge variant="outline" className="px-3 py-1">
                          {detalle.cantidad || 0}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right py-4 font-medium">
                        {formatCurrency(detalle.precio_unitario || 0)}
                      </TableCell>
                      <TableCell className="text-right py-4 font-semibold">
                        {formatCurrency(detalle.total || 0)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Resumen Total */}
            <div className="mt-6 pt-6 border-t bg-muted/20 rounded-lg p-4">
              <div className="flex flex-col space-y-2">
                <div className="flex justify-between items-center text-sm text-muted-foreground">
                  <span>Subtotal ({totalItems} productos):</span>
                  <span>{formatCurrency(totalCompra)}</span>
                </div>
                <div className="flex justify-between items-center pt-2 border-t">
                  <span className="text-xl font-semibold flex items-center">
                    Total de la Compra:
                  </span>
                  <span className="text-3xl font-bold text-primary">{formatCurrency(totalCompra)}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Acciones */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-wrap gap-3 justify-center">
              {compra && (
                <BoletaExport
                  cliente={{
                    nombre: compra.proveedor?.nombre || "Sin proveedor",
                    documento: compra.proveedor?.documento || "N/A",
                    tipoDocumento: "RUC",
                    correo: compra.proveedor?.correo || "",
                    telefono: compra.proveedor?.telefono || "",
                  }}
                  completeProducts={(compra.detalles || []).map((detalle) => ({
                    nombre: detalle.producto?.nombre || "Producto no encontrado",
                    unidad: "Unidad",
                    cantidad: detalle.cantidad || 0,
                    precio: detalle.precio_unitario || 0,
                  }))}
                  numeroOrden={compra.orden_compra || "N/A"}
                />
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
