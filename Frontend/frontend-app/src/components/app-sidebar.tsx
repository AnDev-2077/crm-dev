import * as React from "react"
import { useState, useEffect } from "react"
import axios from "axios"
import { Link } from "react-router-dom"
import {
  BarChart3,
  Bell,
  ShoppingCart,
  BanknoteArrowDown,
  PackageSearch,
  SquareChartGantt,
  Home, 
  Settings,
  Users,
  User,
  Activity,
  TrendingUp,
  Clock,

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

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const [productCount, setProductCount] = useState<number>(0)
  const [providerCount, setProviderCount] = useState<number>(0)
  const [clienteCount, setClienteCount] = useState<number>(0)

  useEffect(() => {
    const fetchCounts = async () => {
      try {
        const [productsRes, providersRes, clienteRes] = await Promise.all([
          axios.get("http://127.0.0.1:8000/productos/"),
          axios.get("http://127.0.0.1:8000/proveedores/"),
          axios.get("http://127.0.0.1:8000/clientes/"),
        ])
        setProductCount(productsRes.data.length)
        setProviderCount(providersRes.data.length)
        setClienteCount(clienteRes.data.length)
      } catch (error) {
        console.error("Error al obtener los conteos:", error)
      }
    }

    fetchCounts()
  }, [])

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
      title: "Cormercial",
      items: [
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
        
      ],
    },
    {
      title: "Gestion",
      items: [
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
          badge: providerCount || undefined,
          isActive: false,
        },
      ],
    },
      ]
  return (
    <Sidebar side="left" {...props}>
      <SidebarHeader>
        <div className="flex items-center gap-2 px-2 py-2">
          <div className="flex aspect-square size-12 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
            {/* Opción 1: Imagen desde assets */}
            <img 
              src="/logo2.png" 
              alt="Logo" 
              className="size-13 object-contain"
            />
          </div>
          <div className="flex flex-col gap-0.5 leading-none">
            <span className="font-semibold">Adisan</span>
            <span className="text-xs text-sidebar-foreground/70">v1.0.0</span>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        {navigationItems.map((section) => (
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
                          <Badge variant="secondary" className="ml-auto text-xs">
                            {item.badge}
                          </Badge>
                        )}
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>

      <SidebarFooter>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  )
}
