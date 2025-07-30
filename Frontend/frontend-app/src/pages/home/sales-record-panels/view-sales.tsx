"use client"

import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import axios from "axios"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ArrowLeft, ShoppingCart, User, FileText, Calendar, DollarSign } from "lucide-react"
import VentaBoletaExport from "@/pages/home/templates/ventaBoletaExport"

interface Venta {
  id: number
  orden_venta?: string
  fecha?: string
  cliente?: {
    id?: number
    nombre?: string
    documento?: string
    correo?: string
    telefono?: string
  }
  detalles?: DetalleVenta[]
}

interface DetalleVenta {
  id?: number
  producto?: {
    id?: number
    nombre?: string
  }
  cantidad?: number
  precio_unitario?: number
  total?: number
}

export default function SaleDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [venta, setVenta] = useState<Venta | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchVenta = async () => {
      try {
        setLoading(true)
        setError(null)
        console.log("Fetching venta with ID:", id)
        console.log("API URL:", `${import.meta.env.VITE_API_URL}/ventas/${id}`)
        
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/ventas/${id}`)
        console.log("Response received:", response.data)
        setVenta(response.data)
      } catch (error) {
        console.error("Error al cargar la venta:", error)
        if (axios.isAxiosError(error)) {
          console.error("Status:", error.response?.status)
          console.error("Data:", error.response?.data)
          setError(`Error ${error.response?.status}: ${error.response?.data?.detail || error.message}`)
        } else {
          setError("Error desconocido al cargar la venta")
        }
      } finally {
        setLoading(false)
      }
    }

    if (id) {
      fetchVenta()
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
            <p className="text-muted-foreground">Cargando detalles de la venta...</p>
          </div>
        </div>
      </div>
    )
  }

  if (!venta) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Venta no encontrada</h2>
          <Button onClick={() => navigate("/home/sales-record-panel")}>
            Volver al historial
          </Button>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4 text-red-600">Error al cargar la venta</h2>
          <p className="text-muted-foreground mb-4">{error}</p>
          <div className="space-x-4">
            <Button onClick={() => window.location.reload()}>
              Reintentar
            </Button>
            <Button variant="outline" onClick={() => navigate("/home/sales-record-panel")}>
              Volver al historial
            </Button>
          </div>
        </div>
      </div>
    )
  }

  const totalVenta = (venta.detalles || []).reduce((sum, detalle) => sum + (detalle.total || 0), 0)
  const totalItems = (venta.detalles || []).reduce((sum, detalle) => sum + (detalle.cantidad || 0), 0)

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <Button variant="outline" onClick={() => navigate("/home/sales-record-panel")}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Detalle de Venta</h1>
            <p className="text-muted-foreground">Orden: #{venta.orden_venta || "N/A"}</p>
          </div>
        </div>
        <Badge variant="default" className="text-lg px-4 py-2">
          Completada
        </Badge>
      </div>

      <div className="space-y-6">
        {/* Información General */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Información de la Venta */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-xl">
                <FileText className="w-5 h-5 mr-2" />
                Información de la Venta
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between py-2 border-b">
                <span className="text-muted-foreground flex items-center">
                  <FileText className="w-4 h-4 mr-2" />
                  Número de Orden:
                </span>
                <span className="font-semibold text-lg">#{venta.orden_venta || "N/A"}</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b">
                <span className="text-muted-foreground flex items-center">
                  <Calendar className="w-4 h-4 mr-2" />
                  Fecha de Venta:
                </span>
                <span className="font-medium">
                  {venta.fecha ? formatDate(venta.fecha) : "No disponible"}
                </span>
              </div>
              
            </CardContent>
          </Card>

          {/* Información del Cliente */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-xl">
                <User className="w-5 h-5 mr-2" />
                Información del Cliente
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between py-2 border-b">
                <span className="text-muted-foreground flex items-center">
                  <User className="w-4 h-4 mr-2" />
                  Cliente:
                </span>
                <span className="font-semibold text-lg">{venta.cliente?.nombre || "Sin cliente"}</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b">
                <span className="text-muted-foreground flex items-center">
                  <FileText className="w-4 h-4 mr-2" />
                  Documento:
                </span>
                <span className="font-medium">{venta.cliente?.documento || "N/A"}</span>
              </div>
              <div className="flex items-center justify-between py-2">
                <span className="text-muted-foreground">Vendedor:</span>
                <span className="font-medium">Carlos Ruiz</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Productos Vendidos */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center text-xl">
              <ShoppingCart className="w-5 h-5 mr-2" />
              Productos Vendidos ({(venta.detalles || []).length} {(venta.detalles || []).length === 1 ? "producto" : "productos"})
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
                  {(venta.detalles || []).map((detalle, index) => (
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
                  <span>{formatCurrency(totalVenta)}</span>
                </div>
                <div className="flex justify-between items-center pt-2 border-t">
                  <span className="text-xl font-semibold flex items-center">
                   
                    Total de la Venta:
                  </span>
                  <span className="text-3xl font-bold text-primary">{formatCurrency(totalVenta)}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Acciones */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-wrap gap-3 justify-center">
              {venta && (
                <VentaBoletaExport
                  cliente={{
                    nombre: venta.cliente?.nombre || "Sin cliente",
                    documento: venta.cliente?.documento || "N/A",
                  }}
                  vendedor="Carlos Ruiz"
                  productos={(venta.detalles || []).map((detalle) => ({
                    nombre: detalle.producto?.nombre || "Producto no encontrado",
                    cantidad: detalle.cantidad || 0,
                    precio: detalle.precio_unitario || 0,
                  }))}
                  numeroOrden={venta.orden_venta || "N/A"}
                />
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
