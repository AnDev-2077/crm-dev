import {BrowserRouter,Route, Routes } from 'react-router-dom';
import LoginPage from '@/pages/auth/auth';
import Home from '@/pages/home/home';
import AddEditProduct from '@/pages/home/products-panels/add-edit-product';
import ViewProduct from '@/pages/home/products-panels/product-details';


export default function Router() {
    return(
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<LoginPage />} />
                <Route path="/home/*" element={<Home />} />
                <Route path="/home/products-panels" element={<AddEditProduct />} />
                <Route path="/home/products-panels/:id" element={<ViewProduct />} />
            </Routes>
        </BrowserRouter>
       
    )
}

