import {BrowserRouter, Route, Routes, Navigate } from 'react-router-dom';
import LoginPage from '@/pages/auth/auth';
import Home from '@/pages/home/home';
import AddEditProduct from '@/pages/home/products-panels/add-edit-product';
import ViewProduct from '@/pages/home/products-panels/product-details';
import ViewSales from '@/pages/home/sales-record-panels/view-sales';
import ViewShopping from '@/pages/home/shopping-record-panels/view-shopping';
import EditClient from '@/pages/home/clients-panels/edit-clients';
import EditProvider from '@/pages/home/providers-panels/edit-providers';
import { useAuth } from '@/context/AuthContext';
import { Loader2 } from 'lucide-react';


function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { token, isLoading } = useAuth();
  

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-500" />
          <p className="text-gray-600">Verificando autenticación...</p>
        </div>
      </div>
    );
  }
  
  
  if (!token) {
    return <Navigate to="/" replace />;
  }
  
  return <>{children}</>;
}


function RoleBasedRoute({ 
  children, 
  allowedRoles 
}: { 
  children: React.ReactNode;
  allowedRoles: string[];
}) {
  const { token, isLoading, user } = useAuth();
  
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-500" />
          <p className="text-gray-600">Verificando permisos...</p>
        </div>
      </div>
    );
  }
  
  
  if (!token) {
    return <Navigate to="/" replace />;
  }
  
  
  if (!user || !allowedRoles.includes(user.rol)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 mb-4">
            <svg className="h-12 w-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Acceso Denegado</h2>
          <p className="text-gray-600 mb-4">No tienes permisos para acceder a esta página.</p>
          <button 
            onClick={() => window.history.back()}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Volver
          </button>
        </div>
      </div>
    );
  }
  
  return <>{children}</>;
}

export default function Router() {
  const { user, token } = useAuth();
  
  console.log('Usuario:', user);
  console.log('Token:', token);

  return(
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        
        
        <Route
          path="/home/*"
          element={
            <PrivateRoute>
              <Home />
            </PrivateRoute>
          }
        />
        
        
        <Route
          path="/home/products-panels"
          element={
            <RoleBasedRoute allowedRoles={["administrador"]}>
              <AddEditProduct />
            </RoleBasedRoute>
          }
        />
        
        <Route
          path="/home/products-panels/:id"
          element={
            <RoleBasedRoute allowedRoles={["administrador","trabajador"]}>
              <ViewProduct />
            </RoleBasedRoute>
          }
        />
        
        <Route
          path="/home/shopping-record-panels/view-shopping/:id"
          element={
            <RoleBasedRoute allowedRoles={["administrador"]}>
              <ViewShopping />
            </RoleBasedRoute>
          }
        />
        
        
        <Route
          path="/home/clients-panels/:id"
          element={
            <RoleBasedRoute allowedRoles={["administrador"]}>
              <EditClient />
            </RoleBasedRoute>
          }
        />
        
        <Route
          path="/home/providers-panels/:id"
          element={
            <RoleBasedRoute allowedRoles={["administrador"]}>
              <EditProvider />
            </RoleBasedRoute>
          }
        />
        
        <Route
          path="/home/sales-record-panels/view-sales/:id"
          element={
            <RoleBasedRoute allowedRoles={["administrador", "trabajador"]}>
              <ViewSales />
            </RoleBasedRoute>
          }
        />
        
        
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

