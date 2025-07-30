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
import { useAuth } from "@/context/AuthContext"

import DashboardPanel from "@/pages/home/dashboard-panels"
import ProvidersPanel from "@/pages/home/providers-panel"
import ClientsPanel from "@/pages/home/clients-panel"
import UsersPanel from "@/pages/home/users-panel"
import ProductsPanel from "@/pages/home/products-panel"
import ShoppingPanel from "@/pages/home/shopping-panel"
import SalesPanel from "@/pages/home/sales-panel"
import OrdersPanel from "@/pages/home/sales-record-panel"
import ShoppingRecordPanel from "@/pages/home/shopping-record-panel"


function RoleBasedComponent({ 
  children, 
  allowedRoles 
}: { 
  children: React.ReactNode;
  allowedRoles: string[];
}) {
  const { user } = useAuth();
  
  if (!user || !allowedRoles.includes(user.rol)) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="text-red-500 mb-4">
            <svg className="h-12 w-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Acceso Denegado</h2>
          <p className="text-gray-600">No tienes permisos para acceder a esta página.</p>
        </div>
      </div>
    );
  }
  
  return <>{children}</>;
}

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
            
            {/* Rutas para administradores y trabajadores */}
            <Route path="providers-panel" element={
              <RoleBasedComponent allowedRoles={["administrador", "trabajador"]}>
                <ProvidersPanel/>
              </RoleBasedComponent>
            }></Route>
            
            <Route path="clients-panel" element={
              <RoleBasedComponent allowedRoles={["administrador", "trabajador"]}>
                <ClientsPanel/>
              </RoleBasedComponent>
            }></Route>
            
            <Route path="sales-panel" element={
              <RoleBasedComponent allowedRoles={["administrador", "trabajador"]}>
                <SalesPanel/>
              </RoleBasedComponent>
            }></Route>
            
            <Route path="sales-record-panel" element={
              <RoleBasedComponent allowedRoles={["administrador", "trabajador"]}>
                <OrdersPanel/>
              </RoleBasedComponent>
            }></Route>
            
            
            <Route path="products-panel" element={
              <RoleBasedComponent allowedRoles={["administrador", "trabajador"]}>
                <ProductsPanel/>
              </RoleBasedComponent>
            }></Route>
            {/* Rutas solo para administradores */}
            <Route path="users-panel" element={
              <RoleBasedComponent allowedRoles={["administrador"]}>
                <UsersPanel/>
              </RoleBasedComponent>
            }></Route>
            
            <Route path="shopping-panel" element={
              <RoleBasedComponent allowedRoles={["administrador"]}>
                <ShoppingPanel/>
              </RoleBasedComponent>
            }></Route>
            
            <Route path="shopping-record-panel" element={
              <RoleBasedComponent allowedRoles={["administrador"]}>
                <ShoppingRecordPanel/>
              </RoleBasedComponent>
            }></Route>

          </Routes>

        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
