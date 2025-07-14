import {BrowserRouter,Route, Routes } from 'react-router-dom';
import App from '@/App';
import LoginPage from '@/pages/auth/auth';
import Home from '@/pages/home/home';


export default function Router() {
    return(
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<App />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/home/*" element={<Home />} />
            </Routes>
        </BrowserRouter>
       
    )
}

