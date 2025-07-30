import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import axios from "axios";

interface User {
  id: number;
  nombre: string;
  apellidos: string;  
  correo: string;
  rol: string;
  is_active?: boolean; 
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (token: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean; 
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(() => localStorage.getItem("token"));
  const [isLoading, setIsLoading] = useState<boolean>(!!token);
  const API_URL = import.meta.env.VITE_API_URL;

  useEffect(() => {
    if (token) {
      setIsLoading(true);  
      axios.get(`${API_URL}/auth/me`, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'ngrok-skip-browser-warning': 'true' 
        },
      })
        .then(res => {
          setUser(res.data);
          setIsLoading(false);  
        })
        .catch(() => {
          setUser(null);
          setToken(null);
          localStorage.removeItem("token");
          setIsLoading(false);  
        });
    } else {
      setUser(null);
      setIsLoading(false);
    }
  }, [API_URL, token]);

  const login = async (newToken: string) => {
    localStorage.setItem("token", newToken);
    setToken(newToken);
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("token");
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
};