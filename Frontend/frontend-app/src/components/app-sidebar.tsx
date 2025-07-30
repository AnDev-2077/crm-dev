import * as React from "react"
import { useState, useEffect } from "react"
import axios from "axios"
import { Link, useNavigate } from "react-router-dom"
import { useAuth } from "@/context/AuthContext"
import {
  ShoppingCart,
  BanknoteArrowDown,
  PackageSearch,
  SquareChartGantt,
  Home, 
  Settings,
  Users,
  User,
  Loader2,
  LogOut,
} from "lucide-react"

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
  SidebarRail,
} from "@/components/ui/sidebar"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const [productCount, setProductCount] = useState<number>(0)
  const [providerCount, setProviderCount] = useState<number>(0)
  const [userCount, setUserCount] = useState<number>(0)
  const [clienteCount, setClienteCount] = useState<number>(0)
  const { user, isLoading, logout, token } = useAuth()
  const navigate = useNavigate()


  console.log("Usuario actual:", user?.nombre, "Rol:", user?.rol, "Cargando:", isLoading)

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  useEffect(() => {
    const fetchCounts = async () => {
      if (!token) {
        console.log("No hay token disponible, saltando fetch de conteos")
        return
      }

      try {
        const [productsRes, providersRes, clienteRes, usersRes] = await Promise.all([
          axios.get("http://127.0.0.1:8000/productos/", { headers: { Authorization: `Bearer ${token}` } }),
          axios.get("http://127.0.0.1:8000/proveedores/", { headers: { Authorization: `Bearer ${token}` } }),
          axios.get("http://127.0.0.1:8000/clientes/", { headers: { Authorization: `Bearer ${token}` } }),
          axios.get("http://127.0.0.1:8000/users/", { headers: { Authorization: `Bearer ${token}` } }),
        ])
        setProductCount(productsRes.data.length)
        setUserCount(usersRes.data.length)
        setProviderCount(providersRes.data.length)
        setClienteCount(clienteRes.data.length)
        
        console.log("Conteos obtenidos:", {
          productos: productsRes.data.length,
          usuarios: usersRes.data.length,
          proveedores: providersRes.data.length,
          clientes: clienteRes.data.length
        })
      } catch (error) {
        console.error("Error al obtener los conteos:", error)

        try {
          const productsRes = await axios.get("http://127.0.0.1:8000/productos/", { headers: { Authorization: `Bearer ${token}` } })
          setProductCount(productsRes.data.length)
        } catch (e) {
          console.error("Error obteniendo productos:", e)
        }
        
        try {
          const providersRes = await axios.get("http://127.0.0.1:8000/proveedores/", { headers: { Authorization: `Bearer ${token}` } })
          setProviderCount(providersRes.data.length)
        } catch (e) {
          console.error("Error obteniendo proveedores:", e)
        }
        
        try {
          const clienteRes = await axios.get("http://127.0.0.1:8000/clientes/", { headers: { Authorization: `Bearer ${token}` } })
          setClienteCount(clienteRes.data.length)
        } catch (e) {
          console.error("Error obteniendo clientes:", e)
        }
        
        try {
          const usersRes = await axios.get("http://127.0.0.1:8000/users/", { headers: { Authorization: `Bearer ${token}` } })
          setUserCount(usersRes.data.length)
        } catch (e) {
          console.error("Error obteniendo usuarios:", e)
        }
      }
    }

    fetchCounts()
  }, [token])


  const filterItemsByRole = (items: any[]) => {

    if (isLoading) {
      return []
    }

    if (!user) {
      return []
    }

    if (user.rol === "administrador") {
      return items
    }

    if (user.rol === "trabajador") {
      return items.filter(item => {
        const allowedForTrabajador = [
          "Dashboard",
          "Productos",
          "Ventas", 
          "Historial de Ventas",
          "Clientes",
          "Proveedores"
        ]
        return allowedForTrabajador.includes(item.title)
      })
    }

    
    return []
  }

  const navigationItems = [
    {
      title: "Principal",
      items: [
        {
          title: "Dashboard",
          url: "/home",
          icon: Home,
          isActive: true,
        },        
      ],
    },
    {
      title: "Comercial",
      items: filterItemsByRole([
        {
          title: "Productos",
          url: "/home/products-panel",
          icon: SquareChartGantt,
          badge: productCount || undefined,
          isActive: false,
        }, 
        {
          title: "Compras",
          url: "/home/shopping-panel",
          icon: ShoppingCart,
          isActive: false,
        },
        {
          title: "Historial de Compras",
          url: "/home/shopping-record-panel",
          icon: PackageSearch,
          isActive: false,
        },
        {
          title: "Ventas",
          url: "/home/sales-panel",
          icon: BanknoteArrowDown,
          isActive: false,
        },
        {
          title: "Historial de Ventas",
          url: "/home/sales-record-panel",
          icon: PackageSearch,
          isActive: false,
        },
      ]),
    },
    {
      title: "Gestión",
      items: filterItemsByRole([
        {
          title: "Clientes",
          url: "/home/clients-panel",
          icon: Users,
          badge: clienteCount || undefined,
          isActive: false,
        },
        {
          title: "Proveedores",
          url: "/home/providers-panel",
          icon: Users,
          badge: providerCount || undefined,
          isActive: false,
        },
        {
          title: "Usuarios",
          url: "/home/users-panel",
          icon: User,
          badge: userCount || undefined,
          isActive: false,
        },
      ]),
    },
  ]


  const filteredNavigationItems = navigationItems.filter(section => 
    section.items.length > 0
  )

  return (
    <Sidebar side="left" {...props}>
      <SidebarHeader>
        <div className="flex items-center gap-2 px-2 py-2">
          <div className="flex size-12 items-center justify-center rounded-full bg-sidebar-primary text-sidebar-primary-foreground">
            <img 
              src="/logo2.png" 
              alt="Logo" 
              className="size-13 object-contain"
            />
          </div>
          <div className="flex flex-col gap-0.5 leading-none">
            <span className="font-semibold">Distribuidora Adisan</span>
            <span className="text-xs text-sidebar-foreground/70">v1.0.0</span>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        {isLoading ? (
          
          <div className="flex items-center justify-center p-8">
            <div className="flex flex-col items-center gap-2">
              <Loader2 className="h-6 w-6 animate-spin text-blue-500" />
              <span className="text-sm text-muted-foreground">Cargando...</span>
            </div>
          </div>
        ) : !user ? (
          
          <div className="flex items-center justify-center p-8">
            <div className="flex flex-col items-center gap-2">
              <User className="h-6 w-6 text-gray-400" />
              <span className="text-sm text-muted-foreground">No autenticado</span>
            </div>
          </div>
        ) : (
          
          filteredNavigationItems.length > 0 ? (
            filteredNavigationItems.map((section) => (
              <SidebarGroup key={section.title}>
                <SidebarGroupLabel>{section.title}</SidebarGroupLabel>
                <SidebarGroupContent>
                  <SidebarMenu>
                    {section.items.map((item) => (
                      <SidebarMenuItem key={item.title}>
                        <SidebarMenuButton asChild isActive={!!item.isActive}>
                          <Link to={item.url} className="flex items-center gap-2">
                            <item.icon className="size-4" />
                            <span>{item.title}</span>
                            {item.badge && (
                              <>
                                {console.log(`Badge para ${item.title}:`, item.badge)}
                                <Badge variant="secondary" className="ml-auto text-xs">
                                  {item.badge}
                                </Badge>
                              </>
                            )}
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    ))}
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>
            ))
          ) : (
            
            <div className="flex items-center justify-center p-8">
              <div className="flex flex-col items-center gap-2">
                <Settings className="h-6 w-6 text-gray-400" />
                <span className="text-sm text-muted-foreground">Sin permisos</span>
              </div>
            </div>
          )
        )}
      </SidebarContent>

      <SidebarFooter>
        {isLoading ? (
          
          <div className="flex items-center justify-center p-4">
            <div className="flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
              <span className="text-xs text-muted-foreground">Cargando usuario...</span>
            </div>
          </div>
        ) : user ? (
          <SidebarMenu>
            <SidebarMenuItem>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <SidebarMenuButton className="hover:bg-slate-100 h-12">
                    <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                      <Users className="w-4 h-4 text-gray-600" />
                    </div>
                    <div className="flex flex-col gap-0.5 leading-none text-left">
                      <span className="font-medium text-sm text-slate-900">
                        {user.nombre} {user.apellidos}
                      </span>
                      <span className="text-xs text-slate-500">{user.correo}</span>
                    </div>
                  </SidebarMenuButton>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56 bg-white border border-slate-200" side="top" align="end">
                  <div className="px-2 py-1.5 text-sm font-medium text-slate-900">Mi Cuenta</div>
                  <DropdownMenuSeparator />

                  <DropdownMenuItem className="gap-2 text-slate-700 hover:bg-slate-50" onClick={handleLogout}>
                    <LogOut className="size-4" />
                    <span>Cerrar sesión</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </SidebarMenuItem>
          </SidebarMenu>
        ) : (
          
          <div className="flex items-center justify-center p-4">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-gray-400" />
              <span className="text-xs text-muted-foreground">No autenticado</span>
            </div>
          </div>
        )}
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  )
}
