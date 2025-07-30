"use client"

import type React from "react"
import { useState } from "react"
import axios from "axios"
import { useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Eye, EyeOff, Mail, Lock } from "lucide-react"

import { useAuth } from "@/context/AuthContext"

export default function LoginPage() {
  const navigate = useNavigate()
  
  
  let authContext;
  try {
    authContext = useAuth()
  } catch (error) {
    console.error("Error accediendo al AuthContext:", error)
    authContext = null
  }
  
  const [showPassword, setShowPassword] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  
  const [isLoading, setIsLoading] = useState(false) 
  const [error, setError] = useState<string | null>(null)
  const [isUserInactive, setIsUserInactive] = useState(false)


  const getCurrentYear = () => {
    return new Date().getFullYear()
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    console.log("Iniciando login...", { email, password: "***" })
    
    setIsLoading(true)
    setError(null)

    try {
      console.log("Haciendo petición POST...")
      
      const response = await axios.post(`http://127.0.0.1:8000/auth/login`, {
        correo: email, 
        contraseña: password
      })

      console.log("Respuesta recibida:", response.data)

      const { access_token } = response.data

      if (!access_token) {
        throw new Error("No se recibió token de acceso")
      }

      console.log("Token recibido, guardando...")

      
      try {
        const userResponse = await axios.get(`http://127.0.0.1:8000/auth/me`, {
          headers: {
            Authorization: `Bearer ${access_token}`,
            'ngrok-skip-browser-warning': 'true'
          }
        })

        const userData = userResponse.data
        console.log("Datos del usuario:", userData)

        
        if (userData.is_active === false) {
          setIsUserInactive(true)
          setError("Tu cuenta está inactiva. Contacta al administrador para activarla.")
          setIsLoading(false)
          return
        }

        
        setIsUserInactive(false)

        
        if (authContext && authContext.login) {
          await authContext.login(access_token)
        } else {
          console.warn("AuthContext no disponible, usando localStorage")
          localStorage.setItem("token", access_token)
        }

        console.log("Login exitoso, navegando a /home")
        navigate("/home")

      } catch (userError) {
        console.error("Error al verificar estado del usuario:", userError)
        
        if (authContext && authContext.login) {
          await authContext.login(access_token)
        } else {
          console.warn("AuthContext no disponible, usando localStorage")
          localStorage.setItem("token", access_token)
        }

        console.log("Login exitoso, navegando a /home")
        navigate("/home")
      }
      
    } catch (error) {
      console.error("Error completo en login:", error)
      
      if (axios.isAxiosError(error)) {
        console.error("Error de Axios:")
        console.error("Status:", error.response?.status)
        console.error("Data:", error.response?.data)
        console.error("Headers:", error.response?.headers)
        
        const errorMessage = error.response?.data?.detail || 
                           error.response?.data?.message || 
                           `Error ${error.response?.status}: Credenciales inválidas`
        setError(errorMessage)
      } else if (error instanceof Error) {
        console.error("Error JS:", error.message)
        setError(error.message)
      } else {
        console.error("Error desconocido:", error)
        setError("Error de conexión. Intenta nuevamente.")
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-24 h-24 mb-4">
            <img 
              src="/logo2.png" 
              alt="Logo Adisan" 
              className="w-24 h-24 object-contain"
            />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Adisan</h1>
          <p className="text-gray-600 mt-2">Venta de articulos al por mayor</p>
        </div>

        <Card className="shadow-xl border-0">
          <CardHeader className="space-y-1 pb-6">
            <CardTitle className="text-2xl font-semibold text-center">Iniciar Sesión</CardTitle>
            <CardDescription className="text-center">Ingresa tus credenciales para acceder al sistema</CardDescription>
          </CardHeader>

          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              
              {error && (
                <div className={`p-3 text-sm border rounded-md ${
                  isUserInactive 
                    ? "text-orange-600 bg-orange-50 border-orange-200" 
                    : "text-red-600 bg-red-50 border-red-200"
                }`}>
                  <div className="flex items-center gap-2">
                    {isUserInactive && (
                      <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                    )}
                    {error}
                  </div>
                  {isUserInactive && (
                    <div className="mt-2 pt-2 border-t border-orange-200">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="text-orange-600 border-orange-300 hover:bg-orange-100"
                        onClick={() => {
                          
                          alert("Para activar tu cuenta, contacta al administrador del sistema.")
                        }}
                      >
                        Contactar Administrador
                      </Button>
                    </div>
                  )}
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium">
                  Correo Electrónico
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="admin@gmail.com" 
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value)
                      
                      setError(null)
                      setIsUserInactive(false)
                    }}
                    className="pl-10"
                    required
                    disabled={isLoading} 
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium">
                  Contraseña
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value)
                      
                      setError(null)
                      setIsUserInactive(false)
                    }}
                    className="pl-10 pr-10"
                    required
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                    disabled={isLoading}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

            </CardContent>
<br></br>
            <CardFooter className="flex flex-col space-y-4">
              <Button 
                type="submit" 
                className="w-full bg-blue-600 hover:bg-blue-700"
                disabled={isLoading}
              >
                {isLoading ? "Iniciando sesión..." : "Iniciar Sesión"}
              </Button>

              <div className="text-center text-sm text-gray-600">

              </div>
            </CardFooter>
          </form>
        </Card>

        
        <div className="text-center mt-8 text-sm text-gray-500">
          <p>© {getCurrentYear()} Adisan. Todos los derechos reservados.</p>
        </div>
      </div>
    </div>
  )
}