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

  useEffect(() => {
    const fetchCounts = async () => {
      try {
        const [productsRes, providersRes] = await Promise.all([
          axios.get("http://127.0.0.1:8000/productos/"),
          axios.get("http://127.0.0.1:8000/proveedores/"),
        ])
        setProductCount(productsRes.data.length)
        setProviderCount(providersRes.data.length)
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
        {
          title: "Analíticas",
          url: "#",
          icon: BarChart3,
          badge: "Pro",
          isActive: false,
        },
        {
          title: "Actividad",
          url: "#",
          icon: Activity,
          isActive: false,
        },
        
      ],
    },
    {
      title: "Gestión",
      items: [
        {
          title: "Clientes",
          url: "/home/clients-panel",
          icon: Users,
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
          title: "Ventas",
          url: "/home/sales-panel",
          icon: BanknoteArrowDown,
          isActive: false,
        },
        {
          title: "Pedidos",
          url: "/home/orders-panel",
          icon: PackageSearch,
          isActive: false,
        },
        {
          title: "Kardex",
          url: "/home/orders-panel",
          icon: PackageSearch,
          isActive: false,
        },
      ],
    },
    {
      title: "Sistema",
      items: [
        {
          title: "Notificaciones",
          url: "#",
          icon: Bell,
          isActive: false,
        },
        {
          title: "Configuración",
          url: "#",
          icon: Settings,
          isActive: false,
        },
      ],
    },  ]
  return (
    <Sidebar side="left" {...props}>
      <SidebarHeader>
        <div className="flex items-center gap-2 px-2 py-2">
          <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
            <TrendingUp className="size-4" />
          </div>
          <div className="flex flex-col gap-0.5 leading-none">
            <span className="font-semibold">Panel Control</span>
            <span className="text-xs text-sidebar-foreground/70">v2.1.0</span>
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
        <div className="flex items-center gap-2 px-2 py-2 text-xs text-sidebar-foreground/70">
          <Clock className="size-3" />
          <span>Última actualización: hace 2 min</span>
        </div>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  )
}
