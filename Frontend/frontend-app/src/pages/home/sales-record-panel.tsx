"use client"

import { useState, useEffect } from "react"
import axios from "axios"
import { useNavigate } from "react-router-dom"
import ExcelJS from "exceljs"

import { ChevronLeft, ChevronRight, Search, Filter, Download, Eye } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"


interface Venta {
  id: number
  orden_venta: string
  fecha: string
  cliente: {
    id: number
    nombre: string
    documento: string
  }
  vendedor: {
    id: number
    nombre: string
    rol: string
  }
  detalles: DetalleVenta[]
}

interface DetalleVenta {
  id: number
  producto: {
    id: number
    nombre: string
  }
  cantidad: number
  precio_unitario: number
  total: number
}

export default function SalesHistory() {
  const navigate = useNavigate()
  const [ventas, setVentas] = useState<Venta[]>([])
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [searchTerm, setSearchTerm] = useState("")
  const [clienteFilter, setClienteFilter] = useState("all")

  const itemsPerPage = 15

  const handleViewVenta = (ventaId: number) => {
    navigate(`/home/sales-record-panels/view-sales/${ventaId}`)
  }

  useEffect(() => {
    const fetchVentas = async () => {
      try {
        setLoading(true)
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/ventas/`)
        setVentas(response.data)
      } catch (error) {
        console.error("Error al cargar ventas:", error)
        setVentas([])
      } finally {
        setLoading(false)
      }
    }

    fetchVentas()
  }, [])

  
  const filteredData = ventas.filter((venta) => {
    const matchesSearch =
      venta.cliente.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      venta.orden_venta.toLowerCase().includes(searchTerm.toLowerCase()) ||
      venta.detalles.some(detalle => 
        detalle.producto.nombre.toLowerCase().includes(searchTerm.toLowerCase())
      )
    const matchesCliente = clienteFilter === "all" || 
      venta.cliente.nombre === clienteFilter
    return matchesSearch && matchesCliente
  })

  
  const totalPages = Math.ceil(filteredData.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentData = filteredData.slice(startIndex, endIndex)

  
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

  
  const handleSearchChange = (value: string) => {
    setSearchTerm(value)
    setCurrentPage(1)
  }

  const handleClienteChange = (value: string) => {
    setClienteFilter(value)
    setCurrentPage(1)
  }

  
  const clientesUnicos = [...new Set(ventas.map(venta => venta.cliente.nombre))]

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-PE', {
      style: 'currency',
      currency: 'PEN'
    }).format(amount)
  }

  const exportToExcel = async () => {
    
    const workbook = new ExcelJS.Workbook()
    const worksheet = workbook.addWorksheet('Ventas')

    
    worksheet.columns = [
      { header: 'Orden de Venta', key: 'orden', width: 15 },
      { header: 'Fecha', key: 'fecha', width: 12 },
      { header: 'Cliente', key: 'cliente', width: 25 },
      { header: 'Documento', key: 'documento', width: 15 },
      { header: 'Vendedor', key: 'vendedor', width: 20 },
      { header: 'Productos', key: 'productos', width: 10 },
      { header: 'Total', key: 'total', width: 15 },
      { header: 'Estado', key: 'estado', width: 12 }
    ]

    
    ventas.forEach((venta: any) => {
      worksheet.addRow({
        orden: venta.orden_venta || 'N/A',
        fecha: venta.fecha ? new Date(venta.fecha).toLocaleDateString('es-ES') : 'N/A',
        cliente: venta.cliente?.nombre || 'Sin cliente',
        documento: venta.cliente?.documento || 'N/A',
        vendedor: venta.vendedor?.nombre || 'Sin vendedor',
        productos: venta.detalles?.length || 0,
        total: formatCurrency(venta.detalles?.reduce((sum: number, det: any) => sum + det.total, 0) || 0),
        estado: 'Completada'
      })
    })

    
    worksheet.getRow(1).font = { bold: true }
    worksheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFE0E0E0' }
    }

    
    const fecha = new Date().toISOString().split('T')[0]
    const fileName = `ventas_${fecha}.xlsx`

    
    const buffer = await workbook.xlsx.writeBuffer()
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = fileName
    link.click()
    window.URL.revokeObjectURL(url)
  }

  if (loading) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
            <p className="text-muted-foreground">Cargando historial de ventas...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Historial de Ventas</h1>
          <p className="text-muted-foreground">Gestiona y revisa todas tus transacciones de ventas</p>
        </div>
        <Button className="flex items-center gap-2" onClick={exportToExcel}>
          <Download className="h-4 w-4" />
          Exportar
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Ventas Registradas</CardTitle>
          <CardDescription>
            Mostrando {startIndex + 1}-{Math.min(endIndex, filteredData.length)} de {filteredData.length} ventas
          </CardDescription>
        </CardHeader>
        <CardContent>

          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Buscar por cliente, orden o producto..."
                value={searchTerm}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={clienteFilter} onValueChange={handleClienteChange}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Cliente" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los clientes</SelectItem>
                {clientesUnicos.map((cliente) => (
                  <SelectItem key={cliente} value={cliente}>
                    {cliente}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Orden Venta</TableHead>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Documento</TableHead>
                  <TableHead>Vendedor</TableHead>
                  <TableHead>Productos</TableHead>
                  <TableHead className="text-center">Total Items</TableHead>
                  <TableHead className="text-right">Total Venta</TableHead>
                  <TableHead className="text-center">Ver Orden</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {currentData.length > 0 ? (
                  currentData.map((venta) => {
                    const totalVenta = venta.detalles.reduce((sum, detalle) => sum + detalle.total, 0)
                    const totalItems = venta.detalles.reduce((sum, detalle) => sum + detalle.cantidad, 0)
                    
                    return (
                      <TableRow key={venta.id} className="hover:bg-muted/50">
                        <TableCell className="font-medium cursor-pointer hover:text-primary" onClick={() => handleViewVenta(venta.id)}>
                          #{venta.orden_venta || "N/A"}
                        </TableCell>
                        <TableCell>{new Date(venta.fecha).toLocaleDateString('es-ES')}</TableCell>
                        <TableCell>{venta.cliente.nombre}</TableCell>
                        <TableCell>{venta.cliente.documento}</TableCell>
                        <TableCell>{venta.vendedor?.nombre || 'N/A'}</TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <Badge variant="outline" className="text-xs">
                              {venta.detalles?.length || 0} productos diferentes
                            </Badge>
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge variant="secondary">{totalItems}</Badge>
                        </TableCell>
                        <TableCell className="text-right font-semibold">
                          S/. {totalVenta.toFixed(2)}
                        </TableCell>
                        <TableCell className="text-center">
                          <Button 
                            variant="default" 
                            size="sm" 
                            onClick={() => handleViewVenta(venta.id)}
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
                      {ventas.length === 0 ? "No hay ventas registradas" : "No se encontraron ventas que coincidan con los filtros"}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          
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
