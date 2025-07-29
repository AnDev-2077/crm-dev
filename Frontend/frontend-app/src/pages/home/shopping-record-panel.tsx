"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import axios from "axios"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { ChevronLeft, ChevronRight, Search, Filter, Download, Eye } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface Compra {
  id: number
  orden_compra?: string
  fecha?: string
  proveedor?: {
    id?: number
    nombre?: string
    documento?: string
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

export default function ShoppingHistory() {
  const navigate = useNavigate()
  const [compras, setCompras] = useState<Compra[]>([])
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [searchTerm, setSearchTerm] = useState("")
  const [proveedorFilter, setProveedorFilter] = useState("all")

  const itemsPerPage = 15

  const handleViewCompra = (compraId: number) => {
    navigate(`/home/shopping-record-panels/view-shopping/${compraId}`)
  }

  useEffect(() => {
    const fetchCompras = async () => {
      try {
        setLoading(true)
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/compras/`)
        setCompras(response.data)
      } catch (error) {
        console.error("Error al cargar compras:", error)
        setCompras([])
      } finally {
        setLoading(false)
      }
    }

    fetchCompras()
  }, [])

  // Filtrar datos
  const filteredData = compras.filter((compra) => {
    const matchesSearch =
      (compra.proveedor?.nombre || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (compra.orden_compra || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (compra.detalles || []).some(detalle => 
        (detalle.producto?.nombre || "").toLowerCase().includes(searchTerm.toLowerCase())
      )
    const matchesProveedor = proveedorFilter === "all" || 
      (compra.proveedor?.nombre || "") === proveedorFilter
    return matchesSearch && matchesProveedor
  })

  // Calcular paginación
  const totalPages = Math.ceil(filteredData.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentData = filteredData.slice(startIndex, endIndex)

  // Funciones de navegación
  const goToPage = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)))
  }

  const goToPrevious = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1)
    }
  }

  const goToNext = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1)
    }
  }

  // Reset página cuando cambian los filtros
  const handleSearchChange = (value: string) => {
    setSearchTerm(value)
    setCurrentPage(1)
  }

  const handleProveedorChange = (value: string) => {
    setProveedorFilter(value)
    setCurrentPage(1)
  }

  // Obtener proveedores únicos para el filtro
  const proveedoresUnicos = [...new Set(compras.map(compra => compra.proveedor?.nombre || "Sin proveedor").filter(nombre => nombre !== "Sin proveedor"))]

  if (loading) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
            <p className="text-muted-foreground">Cargando historial de compras...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Historial de Compras</h1>
          <p className="text-muted-foreground">Gestiona y revisa todas tus transacciones de compras</p>
        </div>
        <Button className="flex items-center gap-2">
          <Download className="h-4 w-4" />
          Exportar
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Compras Registradas</CardTitle>
          <CardDescription>
            Mostrando {startIndex + 1}-{Math.min(endIndex, filteredData.length)} de {filteredData.length} compras
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Filtros */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Buscar por proveedor, orden o producto..."
                value={searchTerm}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={proveedorFilter} onValueChange={handleProveedorChange}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Proveedor" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los proveedores</SelectItem>
                {proveedoresUnicos.map((proveedor) => (
                  <SelectItem key={proveedor} value={proveedor}>
                    {proveedor}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Tabla */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Orden Compra</TableHead>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Proveedor</TableHead>
                  <TableHead>Documento</TableHead>
                  <TableHead>Productos</TableHead>
                  <TableHead className="text-center">Total Items</TableHead>
                  <TableHead className="text-right">Total Compra</TableHead>
                  <TableHead className="text-center">Ver Orden</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {currentData.length > 0 ? (
                  currentData.map((compra) => {
                    const totalCompra = (compra.detalles || []).reduce((sum, detalle) => sum + (detalle.total || 0), 0)
                    const totalItems = (compra.detalles || []).reduce((sum, detalle) => sum + (detalle.cantidad || 0), 0)
                    
                    return (
                      <TableRow key={compra.id} className="hover:bg-muted/50">
                        <TableCell className="font-medium cursor-pointer hover:text-primary" onClick={() => handleViewCompra(compra.id)}>
                          #{compra.orden_compra || "N/A"}
                        </TableCell>
                        <TableCell>{compra.fecha ? new Date(compra.fecha).toLocaleDateString('es-ES') : "N/A"}</TableCell>
                        <TableCell>{compra.proveedor?.nombre || "Sin proveedor"}</TableCell>
                        <TableCell>{compra.proveedor?.documento || "N/A"}</TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <Badge variant="outline" className="text-xs">
                              {compra.detalles?.length || 0} productos diferentes
                            </Badge>
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge variant="secondary">{totalItems}</Badge>
                        </TableCell>
                        <TableCell className="text-right font-semibold">
                          S/. {totalCompra.toFixed(2)}
                        </TableCell>
                        <TableCell className="text-center">
                          <Button 
                            variant="default" 
                            size="sm" 
                            onClick={() => handleViewCompra(compra.id)}
                            className="ml-2"
                          >
                            <Eye className="mr-2 h-4 w-4" />
                            Ver Orden
                          </Button>
                        </TableCell>
                      </TableRow>
                    )
                  })
                ) : (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                      {compras.length === 0 ? "No hay compras registradas" : "No se encontraron compras que coincidan con los filtros"}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          {/* Paginación */}
          {totalPages > 1 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6">
              <div className="text-sm text-muted-foreground">
                Página {currentPage} de {totalPages}
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={goToPrevious}
                  disabled={currentPage === 1}
                  className="flex items-center gap-1 bg-transparent"
                >
                  <ChevronLeft className="h-4 w-4" />
                  Anterior
                </Button>

                {/* Números de página */}
                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNumber
                    if (totalPages <= 5) {
                      pageNumber = i + 1
                    } else if (currentPage <= 3) {
                      pageNumber = i + 1
                    } else if (currentPage >= totalPages - 2) {
                      pageNumber = totalPages - 4 + i
                    } else {
                      pageNumber = currentPage - 2 + i
                    }

                    return (
                      <Button
                        key={pageNumber}
                        variant={currentPage === pageNumber ? "default" : "outline"}
                        size="sm"
                        onClick={() => goToPage(pageNumber)}
                        className="w-8 h-8 p-0"
                      >
                        {pageNumber}
                      </Button>
                    )
                  })}
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={goToNext}
                  disabled={currentPage === totalPages}
                  className="flex items-center gap-1 bg-transparent"
                >
                  Siguiente
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
