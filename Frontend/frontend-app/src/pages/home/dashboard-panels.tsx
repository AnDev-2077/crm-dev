import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  BarChart3, 
  Users, 
  Activity, 
  ShoppingCart,
  Package,
  TrendingUp,
  Truck,
} from "lucide-react"
import axios from "axios"
import { useAuth } from "@/context/AuthContext"

interface DashboardStats {
  totalVentas: number
  totalCompras: number
  totalProductos: number
  totalClientes: number
  totalProveedores: number
  ventasRecientes: any[]
  comprasRecientes: any[]
  productosBajoStock: any[]
  topProductos: any[]
}

export default function DashboardPanel() {
  const { user } = useAuth()
  const [stats, setStats] = useState<DashboardStats>({
    totalVentas: 0,
    totalCompras: 0,
    totalProductos: 0,
    totalClientes: 0,
    totalProveedores: 0,
    ventasRecientes: [],
    comprasRecientes: [],
    productosBajoStock: [],
    topProductos: []
  })
  const [loading, setLoading] = useState(true)

  
  const isAdmin = user?.rol === "administrador"

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true)
        
        
        const [ventasRes, comprasRes, productosRes, clientesRes, proveedoresRes] = await Promise.all([
          axios.get(`${import.meta.env.VITE_API_URL}/ventas/`),
          axios.get(`${import.meta.env.VITE_API_URL}/compras/`),
          axios.get(`${import.meta.env.VITE_API_URL}/productos/`),
          axios.get(`${import.meta.env.VITE_API_URL}/clientes/`),
          axios.get(`${import.meta.env.VITE_API_URL}/proveedores/`)
        ])

        const ventas = ventasRes.data || []
        const compras = comprasRes.data || []
        const productos = productosRes.data || []
        const clientes = clientesRes.data || []
        const proveedores = proveedoresRes.data || []

        
        const totalVentas = ventas.reduce((sum: number, venta: any) => {
          return sum + (venta.detalles?.reduce((detSum: number, det: any) => detSum + det.total, 0) || 0)
        }, 0)

        const totalCompras = compras.reduce((sum: number, compra: any) => {
          return sum + (compra.detalles?.reduce((detSum: number, det: any) => detSum + det.total, 0) || 0)
        }, 0)

        
        const productosBajoStock = productos.filter((p: any) => p.stock < 10)

        
        const topProductos = productos
          .sort((a: any, b: any) => b.stock - a.stock)
          .slice(0, 5)

        setStats({
          totalVentas,
          totalCompras,
          totalProductos: productos.length,
          totalClientes: clientes.length,
          totalProveedores: proveedores.length,
          ventasRecientes: ventas
            .sort((a: any, b: any) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime())
            .slice(0, 5),
          comprasRecientes: compras
            .sort((a: any, b: any) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime())
            .slice(0, 5),
          productosBajoStock,
          topProductos
        })
      } catch (error) {
        console.error("Error al cargar datos del dashboard:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchDashboardData()
  }, [])

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-PE', {
      style: 'currency',
      currency: 'PEN'
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const dashboardStats = [
    {
      title: "Ventas Totales",
      value: formatCurrency(stats.totalVentas),
      change: "total",
      icon: TrendingUp,
      color: "text-green-600",
      bgColor: "bg-green-50",
      adminOnly: true
    },
    {
      title: "Compras Totales",
      value: formatCurrency(stats.totalCompras),
      change: "total",
      icon: ShoppingCart,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      adminOnly: true
    },
    {
      title: "Productos",
      value: stats.totalProductos.toString(),
      change: `${stats.productosBajoStock.length} bajo stock`,
      icon: Package,
      color: "text-orange-600",
      bgColor: "bg-orange-50",
      adminOnly: false
    },
    {
      title: "Clientes",
      value: stats.totalClientes.toString(),
      change: "activos",
      icon: Users,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
      adminOnly: false
    },
    {
      title: "Proveedores",
      value: stats.totalProveedores.toString(),
      change: "registrados",
      icon: Truck,
      color: "text-indigo-600",
      bgColor: "bg-indigo-50",
      adminOnly: false
    }
  ]

  
  const filteredStats = isAdmin ? dashboardStats : dashboardStats.filter(stat => !stat.adminOnly)

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-2">Cargando dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-1 flex-col gap-4 p-4">

      
      {isAdmin && (
        <div className="grid gap-4 md:grid-cols-1">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                Resumen Financiero
              </CardTitle>
              <CardDescription>Análisis de ingresos y gastos</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-green-600" />
                    <span className="text-sm font-medium">Ingresos (Ventas)</span>
                  </div>
                  <p className="text-2xl font-bold text-green-600">
                    {formatCurrency(stats.totalVentas)}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Total de ventas realizadas
                  </p>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <ShoppingCart className="h-4 w-4 text-blue-600" />
                    <span className="text-sm font-medium">Gastos (Compras)</span>
                  </div>
                  <p className="text-2xl font-bold text-blue-600">
                    {formatCurrency(stats.totalCompras)}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Total de compras realizadas
                  </p>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <BarChart3 className="h-4 w-4 text-purple-600" />
                    <span className="text-sm font-medium">Balance</span>
                  </div>
                  <p className={`text-2xl font-bold ${stats.totalVentas - stats.totalCompras >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {formatCurrency(stats.totalVentas - stats.totalCompras)}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {stats.totalVentas - stats.totalCompras >= 0 ? 'Ganancia neta' : 'Pérdida neta'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        {filteredStats.map((stat, index) => (
          <Card key={index} className={`${stat.bgColor}`}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">
                <span className={stat.color}>{stat.change}</span>
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      
      <div className="grid gap-4 md:grid-cols-3">
        
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-green-600" />
              Ventas Recientes
            </CardTitle>
            <CardDescription>Últimas ventas registradas</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats.ventasRecientes.length > 0 ? (
                stats.ventasRecientes.map((venta, index) => (
                  <div key={index} className="flex items-center justify-between p-3 rounded-lg border">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">#{venta.orden_venta}</Badge>
                        <span className="text-sm font-medium">
                          {venta.cliente?.nombre || "Cliente no especificado"}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {venta.detalles?.length || 0} productos
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">
                        {formatCurrency(venta.detalles?.reduce((sum: number, det: any) => sum + det.total, 0) || 0)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatDate(venta.fecha)}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-center text-muted-foreground py-4">
                  No hay ventas recientes
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        
        {isAdmin && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShoppingCart className="h-5 w-5 text-blue-600" />
                Compras
              </CardTitle>
              <CardDescription>Últimas compras registradas</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {stats.comprasRecientes.length > 0 ? (
                  stats.comprasRecientes.map((compra, index) => (
                    <div key={index} className="flex items-center justify-between p-3 rounded-lg border">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">#{compra.orden_compra}</Badge>
                          <span className="text-sm font-medium">
                            {compra.proveedor?.nombre || "Proveedor no especificado"}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {compra.detalles?.length || 0} productos
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium">
                          {formatCurrency(compra.detalles?.reduce((sum: number, det: any) => sum + det.total, 0) || 0)}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {formatDate(compra.fecha)}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-center text-muted-foreground py-4">
                    No hay compras recientes
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-red-600" />
              Notificaciones
            </CardTitle>
            <CardDescription>Alertas del sistema</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats.productosBajoStock.length > 0 ? (
                stats.productosBajoStock.map((producto, index) => (
                  <div key={index} className="flex items-center gap-3 p-3 rounded-lg border border-red-200 bg-red-50">
                    <div className="h-8 w-8 rounded-full bg-red-100 flex items-center justify-center">
                      <Package className="h-4 w-4 text-red-600" />
                    </div>
                    <div className="flex-1 space-y-1">
                      <p className="text-sm font-medium">{producto.nombre}</p>
                      <p className="text-xs text-red-600">
                        Solo {producto.stock} unidades restantes
                      </p>
                    </div>
                    <Badge variant="destructive">{producto.stock}</Badge>
                  </div>
                ))
              ) : (
                <div className="text-center py-4">
                  <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-2">
                    <Package className="h-4 w-4 text-green-600" />
                  </div>
                  <p className="text-sm font-medium text-green-600">Sin alertas</p>
                  <p className="text-xs text-muted-foreground">
                    Todo funcionando correctamente
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
      
    </div>
  )
}
