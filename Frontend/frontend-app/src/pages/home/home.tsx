import { Routes, Route } from "react-router-dom"
import { AppSidebar } from "@/components/app-sidebar"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
  } from "@/components/ui/breadcrumb"
import { Separator } from "@/components/ui/separator"
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"

import DashboardPanel from "@/pages/home/dashboard-panels"
import ProvidersPanel from "@/pages/home/providers-panel"
import ClientsPanel from "@/pages/home/clients-panel"
import ProductsPanel from "@/pages/home/products-panel"
import ShoppingPanel from "@/pages/home/shopping-panel"
import SalesPanel from "@/pages/home/sales-panel"
import OrdersPanel from "@/pages/home/orders-panel"


export default function HomePage() {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <div className="flex items-center gap-2">
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink href="/">Inicio</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage>Dashboard</BreadcrumbPage>    
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4">         
          <Routes>
            <Route index element={<DashboardPanel/>}></Route>
            <Route path="providers-panel" element={<ProvidersPanel/>}></Route>
            <Route path="clients-panel" element={<ClientsPanel/>}></Route>
            <Route path="products-panel" element={<ProductsPanel/>}></Route>
            <Route path="shopping-panel" element={<ShoppingPanel/>}></Route>
            <Route path="sales-panel" element={<SalesPanel/>}></Route>
            <Route path="orders-panel" element={<OrdersPanel/>}></Route>
          </Routes>

        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
