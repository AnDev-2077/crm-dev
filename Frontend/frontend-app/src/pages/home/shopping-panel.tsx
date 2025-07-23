//shopping-panel.tsx
"use client"

import { useState, useEffect } from "react"
import axios from "axios"
import { Trash2, FileText, Building2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useRef } from "react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import BoletaExport from "@/pages/home/templates/boletaExport";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"

interface Product {
  id: string
  nombre: string
  stock: string
  precio_compra: string
  tipoUnidad: string
  descripcion: string
   tUnidad?: TipoUnidad | null
}
type Unidad = {
  id: number
  nombre: string
}
interface Proveedor {
  id: string
  nombre: string
  telefono: string
  documento: string
  correo: string;
}
export interface TipoUnidad {
  id: number;
  nombre: string;
}

export default function SupplierProductManager() {
  const [selectedSupplier, setSelectedSupplier] = useState<string>("")
  const [suppliers, setSuppliers] = useState<Proveedor[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [availableProducts, setAvailableProducts] = useState<Product[]>([])
  const [unidades, setUnidades] = useState<Unidad[]>([])
  const [searchNombre, setSearchNombre] = useState("");
  const [searchStock, setSearchStock] = useState("");
  const [numeroOrden, setNumeroOrden] = useState<string | null>(null);

  const fetchTipoUnidades = async (): Promise<TipoUnidad[]> => {
  try {
    const response = await axios.get(`${import.meta.env.VITE_API_URL}/tipo-unidades`);
    return response.data;
  } catch (error) {
    console.error("Error al obtener tipos de unidad:", error);
    return [];
  }
};

const [supplierProducts, setSupplierProducts] = useState<Product[]>([])
const pdfRef = useRef<HTMLDivElement>(null);

const handleExportarPDF = async () => {
  if (!pdfRef.current) return;

  const canvas = await html2canvas(pdfRef.current, {
    scale: 2,
  });
  const imgData = canvas.toDataURL("image/png");

  const pdf = new jsPDF("p", "mm", "a4");
  const imgProps = pdf.getImageProperties(imgData);
  const pdfWidth = pdf.internal.pageSize.getWidth();
  const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

  pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
  pdf.save(`Orden_Compra_${numeroOrden || "sin_numero"}.pdf`);
};

useEffect(() => {
  const fetchNumeroOrden = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/compras/siguiente-numero`);
      setNumeroOrden(response.data.numero_orden);
    } catch (error) {
      console.error("Error al obtener el número de orden:", error);
    }
  };

  fetchNumeroOrden();
}, [selectedSupplier]);

useEffect(() => {
    const loadSuppliers = async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/proveedores/`)
        setSuppliers(response.data)
      } catch (error) {
        console.error("Error al cargar proveedores", error)
      }
    }
    loadSuppliers()
  }, [])

useEffect(() => {
  const fetchUnidades = async () => {
    try {
      const response = await axios.get("http://localhost:8000/tipo-unidad/")
      setUnidades(response.data)
    } catch (error) {
      console.error("Error al obtener unidades:", error)
    }
  }

  fetchUnidades()
}, [])
useEffect(() => {
  const loadAvailableProducts = async () => {
    if (!selectedSupplier) return
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/productos/proveedor/${selectedSupplier}`
      )
      const data = response.data.map((p: any) => ({
        id: p.id.toString(),
        nombre: p.nombre,
        stock: "",
        precio_compra: p.precio_compra?.toString() || "",
        tUnidad: p.tipo_unidad ? { id: p.tipo_unidad.id, nombre: p.tipo_unidad.nombre } : null




}))
      setAvailableProducts(data)
      if (data.length > 0) {
        setProducts([{
          id: crypto.randomUUID(),
          nombre: "",
          stock: "",
          precio_compra: "",
          tipoUnidad: "",
          descripcion: "",
        }])
      } else {
        setProducts([])
      }
    } catch (error) {
      console.error("Error al cargar productos disponibles del proveedor:", error)
      setAvailableProducts([])
      setProducts([])
    }
  }

  loadAvailableProducts()
}, [selectedSupplier])

const updateProduct = (id: string, field: keyof Product, value: any) => {
if (field === "nombre") {
  const selectedProduct = availableProducts.find((p) => p.id === value)
  if (selectedProduct) {
    setProducts((prevProducts) =>
      prevProducts.map((product) =>
        product.id === id
          ? {
              ...product,
              nombre: value,
              precio_compra: selectedProduct.precio_compra,
              tipoUnidad: selectedProduct.tUnidad?.nombre || "",
              tUnidad: selectedProduct.tUnidad || null,

            }
          : product
      )
    )
  }
}

 else {
    setProducts((prevProducts) =>
      prevProducts.map((product) =>
        product.id === id ? { ...product, [field]: value } : product
      )
    )
  }
}


    const isProductComplete = (product: Product) => {
  return (
    product.nombre &&
    product.stock &&
    product.precio_compra &&
    product.tUnidad 
  )
}


  const selectedSupplierData = suppliers.find((s) => s.id === selectedSupplier)
  const completeProducts = products.filter(isProductComplete)
const addNewProduct = () => {
  const newProduct: Product = {
    id: crypto.randomUUID(),
    nombre: "",
    stock: "",
    precio_compra: "",
    tipoUnidad: "",
    descripcion: "",
  }
  setProducts((prev) => [...prev, newProduct])
}


const removeProduct = (id: string) => {
  setProducts((prev) => prev.filter((p) => p.id !== id))
}
const handleGuardarCompra = async () => {
  if (!selectedSupplier || completeProducts.length === 0) return;

  try {
    const compraPayload = {
      proveedor_id: Number(selectedSupplier),
      productos: completeProducts.map((p) => ({
        producto_id: Number(p.nombre), 
        cantidad: Number(p.stock),
        precio_unitario: Number(p.precio_compra),
      })),
    };

    await axios.post(`${import.meta.env.VITE_API_URL}/compras/`, compraPayload);

    
    
  } catch (error) {
    console.error("Error al guardar la compra", error);
    alert("Hubo un error al guardar la compra.");
  }
};

 return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Gestión de Compras</h1>
          <p className="text-gray-600">Selecciona un proveedor y agrega los productos correspondientes</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Columna izquierda - Formularios */}
          <div className="lg:col-span-2 space-y-6">
          {/* Selector de Proveedores */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="w-5 h-5" />
                Seleccionar Proveedor
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="w-full">
                  <Label htmlFor="supplier">Proveedor</Label>
                  <Select value={selectedSupplier} onValueChange={setSelectedSupplier}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Selecciona un proveedor" />
                    </SelectTrigger>
                    <SelectContent>
                      {suppliers.map((supplier) => (
                        <SelectItem key={supplier.id} value={supplier.id}>
                          {supplier.nombre}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                {selectedSupplierData && (
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h4 className="font-medium text-blue-900 mb-2">Información del Proveedor</h4>
                    <p className="text-sm text-blue-700">
                      <strong>Teléfono:</strong> {selectedSupplierData.telefono}
                    </p>
                    <p className="text-sm text-blue-700">
                      <strong>DNI / RUC:</strong> {selectedSupplierData.documento}
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
            {/* Formulario de Productos */}
            {selectedSupplier && (
              <Card>
                <CardHeader>
                  <CardTitle>Gestión de Productos</CardTitle>
                  <p className="text-sm text-gray-600">
                    Organiza tus productos usando los acordeones. Los campos se autogeneran cuando completas un
                    producto.
                  </p>
                </CardHeader>
                <CardContent>
                  <Accordion type="single" collapsible defaultValue="productos-main" className="w-full">
                    <AccordionItem value="productos-main">
                      <AccordionTrigger className="text-lg font-semibold">
                        <div className="flex items-center gap-2">
                          <span>Agregar Productos</span>
                          <span className="text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                            {completeProducts.length} completos
                          </span>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent>
                        <div className="space-y-4 pt-4">
                          <Accordion type="multiple" className="w-full space-y-2">
                            {products.map((product, index) => (
                              <AccordionItem
                                key={product.id}
                                value={`product-${product.id}`}
                                className="border rounded-lg"
                              >
                                <div className="flex items-center justify-between w-full mr-4 px-4">
                              <AccordionTrigger className="flex-1 text-left hover:no-underline">
                                <div className="flex items-center gap-3">
                                  <span className="font-medium">
                                    {product.nombre
                                      ? availableProducts.find((p: Product) => p.id === product.nombre)?.nombre || "Producto sin nombre"
                                      : "Selecciona un producto"}
                                  </span>

                                  {isProductComplete(product) && (
                                    <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                                      Completo
                                    </span>
                                  )}
                                  {!isProductComplete(product) && product.nombre && (
                                    <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full">
                                      Incompleto
                                    </span>
                                  )}
                                </div>
                              </AccordionTrigger>

                              <div className="flex items-center gap-2">
                                {product.precio_compra && (
                                  <span className="text-sm text-gray-600 font-medium">S/. {product.precio_compra}</span>
                                )}
                                {products.length > 1 && (
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={(e) => {
                                      e.preventDefault()
                                      e.stopPropagation()
                                      removeProduct(product.id)
                                    }}
                                    className="text-red-600 hover:text-red-700 h-8 w-8 p-0"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </Button>
                                )}
                                </div>
                              </div>
                                <AccordionContent className="px-4 pb-4">
                                <div className="space-y-4">
                                  <div className="grid md:grid-cols-2 gap-4">
                                    <div>
                                      <Label htmlFor={`nombre-${product.id}`}>Nombre del Producto *</Label>
                                      <Select
                                        value={product.nombre}
                                        onValueChange={(value) => updateProduct(product.id, "nombre", value)}
                                        
                                      >
                                        <SelectTrigger id={`nombre-${product.id}`} className="w-full">
                                          <SelectValue placeholder="Selecciona un producto" />
                                        </SelectTrigger>
                                        <SelectContent>
                                        {availableProducts
                                          .filter((p) =>
                                            p.id.toString() === product.nombre || 
                                            !products.some((prod) => prod.nombre === p.id.toString())
                                          )
                                          .map((p) => (
                                            <SelectItem key={p.id } value={p.id.toString()}>
                                              {p.nombre}
                                            </SelectItem>
                                            
                                        ))}
                                        </SelectContent>
                                      </Select>
                                    </div>

                                    <div>
                                      <Label htmlFor={`stock-${product.id}`}>Agregar a Stock *</Label>
                                      <Input
                                        id={`stock-${product.id}`}
                                        type="number"
                                        value={product.stock}
                                        onChange={(e) => updateProduct(product.id, "stock", e.target.value)}
                                        placeholder="Ejemplo: 10"
                                      />
                                    </div>

                                    <div>
                                      <Label htmlFor={`precio-${product.id}`}>Precio de Compra </Label>
                                      <Input
                                        id={`precio-${product.id}`}
                                        type="number"
                                        step="0.01"
                                        value={product.precio_compra}
                                        disabled
                                        onChange={(e) => updateProduct(product.id, "precio_compra", e.target.value)}
                                        placeholder=""
                                      />
                                    </div>                                                                          
                                      <div>
                                        <Label htmlFor={`unidad-${product.id}`}>Unidad</Label>
                                        <Input
                                          id={`unidad-${product.id}`}
                                          value={product.tUnidad?.nombre || "Sin unidad"}
                                          disabled
                                          className="text-gray-600"
                                        />
                                      </div>
                                  </div>
                                  {isProductComplete(product) && (
                                    <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                                      <div className="flex items-center gap-2 text-green-800">
                                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                        <span className="text-sm font-medium">
                                          Producto completado 
                                        </span>
                                      </div>
                                    </div>
                                  )}
                                </div>
                              </AccordionContent>

                              </AccordionItem>
                            ))}
                          </Accordion>

                          {products.length > 0 && (
                            <div className="flex justify-center pt-4">
                              <Button
                                onClick={addNewProduct}
                                variant="outline"
                                className="w-full max-w-md bg-transparent"
                              >
                                + Agregar Producto
                              </Button>
                            </div>
                          )}
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                </CardContent>
              </Card>
            )}
          </div>
            
          {/* Columna derecha - Vista previa PDF */}
          <div className="lg:col-span-1">
            <Card className="sticky top-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Vista Previa del Documento
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-white border-2 border-gray-200 rounded-lg p-4 min-h-[600px] shadow-inner">
                  {selectedSupplierData ? (
                    <div className="space-y-4">
                      {/* Encabezado del documento */}
                      <div className="text-center border-b pb-4">
                        <h2 className="text-lg font-bold">ORDEN DE COMPRA</h2>
                        <p className="text-sm text-gray-600">#{numeroOrden || "Cargando..."}</p>

                        <p className="text-xs text-gray-500">{new Date().toLocaleDateString()}</p>
                      </div>

                      {/* Información del proveedor */}
                      <div className="space-y-2">
                        <h3 className="font-semibold text-sm">PROVEEDOR:</h3>
                        <div className="text-xs space-y-1 bg-gray-50 p-2 rounded">
                          <p className="font-medium">{selectedSupplierData.nombre}</p>
                          <p>Telefono: {selectedSupplierData.telefono}</p>
                          <p>DNI / RUC: {selectedSupplierData.documento}</p>
                        </div>
                      </div>                      
                      {/* Lista de productos */}
                      {completeProducts.length > 0 && (
                        <div className="space-y-2">
                          <h3 className="font-semibold text-sm">PRODUCTOS:</h3>
                          <div className="space-y-2">
                            {completeProducts.map((product, index) => (
                              <div key={product.id} className="text-xs border-b border-gray-100 pb-2">
                                <div className="flex justify-between items-start">
                                  <div className="flex-1">
                                    <p className="font-medium">
                                      {availableProducts.find((p) => p.id === product.nombre)?.nombre || "Producto no encontrado"}
                                    </p>
                                    <p className="text-gray-600">
                                      {product.stock} {product.tipoUnidad}
                                    </p>
                                    {product.descripcion && (
                                      <p className="text-gray-500 text-xs mt-1">{product.descripcion}</p>
                                    )}
                                  </div>
                                  <div className="text-right">
                                    <p className="font-medium">S/. {product.precio_compra}</p>
                                    <p className="text-gray-600">
                                      Total: S/. 
                                      {(Number.parseFloat(product.precio_compra) * Number.parseFloat(product.stock)).toFixed(
                                        2,
                                      )}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>

                          {/* Total general */}
                          <div className="border-t pt-2 mt-4">
                            <div className="flex justify-between font-semibold text-sm">
                              <span>TOTAL GENERAL:</span>
                              <span>
                                S/. 
                                {completeProducts
                                  .reduce(
                                    (total, product) =>
                                      total + Number.parseFloat(product.precio_compra) * Number.parseFloat(product.stock),
                                    0,
                                  )
                                  .toFixed(2)}
                              </span>
                            </div>
                          </div>
                        </div>
                      )}
                      {completeProducts.length === 0 && (
                        <div className="text-center text-gray-400 py-8">
                          <FileText className="w-12 h-12 mx-auto mb-2 opacity-50" />
                          <p className="text-sm">Agrega productos para ver la vista previa</p>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-center text-gray-400 py-8">
                      <Building2 className="w-12 h-12 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">Selecciona un proveedor para comenzar</p>
                    </div>
                  )}
                </div>
                    {/* Botón de acción */}
                    <div className="flex justify-end">
                      <Button
                        onClick={async () => {
                          await handleGuardarCompra();
                          alert(" Compra guardada correctamente. Ahora puedes descargar el PDF.");
                        }}
                      >
                        Guardar Compra
                      </Button>
                    </div>

                    {/* PDF Exportación */}
                    <BoletaExport
                      selectedSupplierData={selectedSupplierData || null}
                      completeProducts={completeProducts.map((p) => ({
                        nombre: availableProducts.find((ap) => ap.id === p.nombre)?.nombre || "N/A",
                        unidad: p.tipoUnidad || "N/A",
                        cantidad: Number(p.stock),
                        precio: Number(p.precio_compra),
                      }))}
                    />
              </CardContent>
            </Card>            
          </div>         
        </div>
      </div>
    </div>
  )
}

