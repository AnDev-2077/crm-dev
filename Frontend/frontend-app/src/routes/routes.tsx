import {BrowserRouter,Route, Routes } from 'react-router-dom';
import App from '@/App';
import LoginPage from '@/pages/auth/auth';
import Home from '@/pages/home/home';
import AddEditProduct from '@/pages/home/products-panels/add-edit-product';
import ViewProduct from '@/pages/home/products-panels/product-details';
import ViewSales from '@/pages/home/sales-record-panels/view-sales';
import ViewShopping from '@/pages/home/shopping-record-panels/view-shopping';
import EditClient from '@/pages/home/clients-panels/edit-clients';
import EditProvider from '@/pages/home/providers-panels/edit-providers';


export default function Router() {
    return(
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<App />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/home/*" element={<Home />} />
                <Route path="/home/products-panels" element={<AddEditProduct />} />
                <Route path="/home/products-panels/:id" element={<ViewProduct />} />
                <Route path="/home/clients-panels/:id" element={<EditClient />} />
                <Route path="/home/providers-panels/:id" element={<EditProvider />} />
                <Route path="/home/sales-record-panels/view-sales/:id" element={<ViewSales />} />
                <Route path="/home/shopping-record-panels/view-shopping/:id" element={<ViewShopping />} />
            </Routes>
        </BrowserRouter>
       
    )
}

