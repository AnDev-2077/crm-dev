"use client"
import { useEffect, useState } from "react"
import axios from "axios"
import { Check, ChevronsUpDown, Plus, Minus, User, ShoppingCart, FileText, Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import BoletaVentaExport from "@/pages/home/templates/ventaBoletaExport";
import VentaBoletaExport from "@/pages/home/templates/ventaBoletaExport"
import { PDFDownloadLink } from "@react-pdf/renderer";

interface Cliente {
  id: number
  nombre: string
  correo?: string
  telefono?: string
  direccion?: string
  documento?: string
  tipoDocumento?: string
}
export interface ProductoBackend {
  id: number
  nombre: string
  descripcion?: string
  precio_venta: number
  stock: number
  imagen?: string
  tipo_unidad?: {
    id: number
    nombre: string
  }
}
interface ProductoVenta {
  id: number
  nombre: string
  precio: number
  cantidad: number
}

export default function SalesView() {
  const [clienteSeleccionado, setClienteSeleccionado] = useState("")
  const [openCombobox, setOpenCombobox] = useState(false)
  const [productosVenta, setProductosVenta] = useState<ProductoVenta[]>([])
  const [busquedaProducto, setBusquedaProducto] = useState("")
  const [productos, setProductos] = useState<ProductoBackend[]>([])
  const [loadingProductos, setLoadingProductos] = useState(true)
  const [clientes, setClientes] = useState<Cliente[]>([])
  const nombreTrabajador = "Trabajador 1"
  const [loadingVenta, setLoadingVenta] = useState(false)
  const [numeroOrden, setNumeroOrden] = useState<string | null>(null);
  const [selectedSupplier, setSelectedSupplier] = useState<string>("")
  // Agregar estados para controlar la venta guardada y la carga
  const [ventaGuardada, setVentaGuardada] = useState(false);
  // Estado para los datos de la venta registrada
  const [ventaParaPDF, setVentaParaPDF] = useState<{
    cliente: { nombre: string; documento: string };
    vendedor: string;
    productos: { nombre: string; cantidad: number; precio: number }[];
    numeroOrden: string | null;
  } | null>(null);

useEffect(() => {
  const fetchNumeroOrden = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/ventas/siguiente-numero`);
      setNumeroOrden(response.data.numero_orden);
    } catch (error) {
      console.error("Error al obtener el número de orden:", error);
    }
  };

  fetchNumeroOrden();
}, []);


  const generarVenta = async (e?: React.MouseEvent) => {
  e?.preventDefault();
  if (!clienteSeleccionado || productosVenta.length === 0) return;

  setLoadingVenta(true);
  setVentaGuardada(false);
  try {
    const payload = {
      cliente_id: parseInt(clienteSeleccionado),
      detalles: productosVenta.map(p => ({
        producto_id: p.id,
        cantidad: p.cantidad,
        precio_unitario: p.precio
      }))
    };

    const res = await axios.post("http://localhost:8000/ventas/", payload);
    console.log("Venta creada:", res.data);

    // Guardar datos para el PDF antes de limpiar
    setVentaParaPDF({
      cliente: {
        nombre: clienteSeleccionadoData?.nombre || "N/A",
        documento: clienteSeleccionadoData?.documento || "00000000",
      },
      vendedor: "Trabajador 1",
      productos: productosVenta
        .filter((p) => p.cantidad > 0)
        .map((p) => {
          const prod = productos.find((prod) => prod.id === p.id);
          if (!prod) return null;
          return {
            nombre: prod.nombre,
            cantidad: p.cantidad,
            precio: p.precio,
          };
        })
        .filter((p): p is { nombre: string; cantidad: number; precio: number } => p !== null),
      numeroOrden: numeroOrden,
    });

    await fetchProductos();
    await fetchNumeroOrden();

    setVentaGuardada(true);
    // No vaciar los campos aquí
    // setProductosVenta([]);
    // setClienteSeleccionado("");
  } catch (err) {
    console.error(" Error al registrar la venta:", err);
    alert(" Error al registrar la venta");
  } finally {
    setLoadingVenta(false);
  }
};

const fetchNumeroOrden = async () => {
  try {
    const response = await axios.get(`${import.meta.env.VITE_API_URL}/ventas/siguiente-numero`);
    setNumeroOrden(response.data.numero_orden);
  } catch (error) {
    console.error("Error al obtener el número de orden:", error);
  }
};

useEffect(() => {
  fetchNumeroOrden();
}, []);

const fetchProductos = async () => {
  try {
    const res = await axios.get("http://localhost:8000/productos/");
    setProductos(res.data);
  } catch (err) {
    console.error("Error al cargar productos:", err);
  } finally {
    setLoadingProductos(false);
  }
};

useEffect(() => {
  fetchProductos();
}, []);


  useEffect(() => {
    const fetchProductos = async () => {
      try {
        const res = await axios.get("http://localhost:8000/productos/")
        setProductos(res.data)
      } catch (err) {
        console.error("Error al cargar productos:", err)
      } finally {
        setLoadingProductos(false)
      }
    }
    fetchProductos()
  }, [])

  useEffect(() => {
    const fetchClientes = async () => {
      try {
        const res = await axios.get("http://localhost:8000/clientes/")
        setClientes(res.data)
      } catch (err) {
        console.error("Error al cargar clientes:", err)
      }
    }
    fetchClientes()
  }, [])

  const agregarProducto = (producto: ProductoBackend) => {
    setProductosVenta((prev) => {
      const existente = prev.find((p) => p.id === producto.id)
      if (existente) {
        return prev.map((p) => (p.id === producto.id ? { ...p, cantidad: p.cantidad + 1 } : p))
      } else {
        return [...prev, { id: producto.id, nombre: producto.nombre, precio: producto.precio_venta, cantidad: 1 }]
      }
    })
  }

  const quitarProducto = (id: number) => {
    setProductosVenta((prev) =>
      prev.map((p) => (p.id === id ? { ...p, cantidad: p.cantidad - 1 } : p)).filter((p) => p.cantidad > 0)
    )
  }

  const eliminarProducto = (id: number) => {
    setProductosVenta((prev) => prev.filter((p) => p.id !== id))
  }

  const actualizarCantidad = (id: number, nuevaCantidad: number) => {
    if (nuevaCantidad <= 0) {
      eliminarProducto(id)
      return
    }

    setProductosVenta((prev) => {
      const existente = prev.find((p) => p.id === id)
      if (existente) {
        return prev.map((p) => (p.id === id ? { ...p, cantidad: nuevaCantidad } : p))
      } else {
        const producto = productos.find((p) => p.id === id)
        if (producto) {
          return [...prev, { id: producto.id, nombre: producto.nombre, precio: producto.precio_venta, cantidad: nuevaCantidad }]
        }
        return prev
      }
    })
  }

  const calcularTotal = () =>
    productosVenta.reduce((total, producto) => total + producto.precio * producto.cantidad, 0).toFixed(2)

  const productosFiltrados = productos.filter(
    (producto) =>
      producto.nombre.toLowerCase().includes(busquedaProducto.toLowerCase()) ||
      producto.tipo_unidad?.nombre?.toLowerCase().includes(busquedaProducto.toLowerCase())
  )

  const clienteSeleccionadoData = clientes.find((c) => c.id.toString() === clienteSeleccionado)

  // En el handler de selección de cliente, limpia ventaParaPDF
  const handleSeleccionarCliente = (currentValue: string) => {
    setClienteSeleccionado(currentValue === clienteSeleccionado ? "" : currentValue);
    setVentaParaPDF(null); // Oculta el botón de exportar PDF al iniciar nueva venta
    setOpenCombobox(false);
  };


  return (
    <div className="container mx-auto p-6 max-w-7xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <User className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-2xl font-bold">Sistema de Ventas</h1>
            <p className="text-muted-foreground">Vendedor: {nombreTrabajador}</p>
          </div>
        </div>
        <Badge variant="outline" className="text-sm">
          <ShoppingCart className="h-4 w-4 mr-1" />
          {productosVenta.length} productos en venta
        </Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Panel izquierdo */}
        <div className="lg:col-span-2 space-y-6">
          {/* Selector de cliente */}
          <Card>
            <CardHeader>
              <CardTitle>Seleccionar Cliente</CardTitle>
              <CardDescription>Busca y selecciona el cliente para esta venta</CardDescription>
              
            </CardHeader>
            <CardContent>
              <Popover open={openCombobox} onOpenChange={setOpenCombobox}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={openCombobox}
                    className="w-full justify-between bg-transparent"
                  >
                    {clienteSeleccionado
                    ? clientes.find((cliente) => cliente.id.toString() === clienteSeleccionado)?.nombre + 
                      " - " + 
                      clientes.find((cliente) => cliente.id.toString() === clienteSeleccionado)?.documento
                    : "Seleccionar cliente..."}

                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[500px] max-h-[400px] overflow-y-auto p-0">
              <Command>
                <CommandInput
                  placeholder="Buscar cliente..."
                  className="h-10 text-base px-3"
                />
                <CommandList className="max-h-[300px] overflow-y-auto">
                  <CommandEmpty>No se encontró el cliente.</CommandEmpty>
                  <CommandGroup>
                    {clientes.map((cliente) => (
                      <CommandItem
                        key={cliente.id}
                        value={cliente.id.toString()}
                        onSelect={(currentValue) => handleSeleccionarCliente(currentValue)}
                        className="py-2 text-base"
                      >
                        <Check
                          className={cn(
                            "mr-2 h-4 w-4",
                            clienteSeleccionado === cliente.id.toString()
                              ? "opacity-100"
                              : "opacity-0"
                          )}
                        />
                        <div className="flex flex-col">
                          <span className="font-medium">{cliente.nombre}</span>
                          <span className="text-sm text-muted-foreground">
                            {cliente.tipoDocumento}: {cliente.documento}
                          </span>
                        </div>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
              </Popover>
            </CardContent>
          </Card>

          {/* Lista de productos */}
          <Card>
            <CardHeader>
              <CardTitle>Productos Disponibles</CardTitle>
              <CardDescription>Busca y selecciona los productos para agregar a la venta</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Buscar productos por nombre o tipo de unidad..."
                  value={busquedaProducto}
                  onChange={(e) => setBusquedaProducto(e.target.value)}
                  className="pl-10"
                />
              </div>

              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Producto</TableHead>
                      <TableHead>Tipo de unidad</TableHead>
                      <TableHead>Precio</TableHead>
                      <TableHead>Stock</TableHead>
                      <TableHead className="text-center">Cantidad</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loadingProductos ? (
                      <TableRow>
                        <TableCell colSpan={5} className="h-24 text-center">
                          Cargando productos...
                        </TableCell>
                      </TableRow>
                    ) : productosFiltrados.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                          No se encontraron productos.
                        </TableCell>
                      </TableRow>
                    ) : (
                      productosFiltrados.map((producto) => {
                        const enVenta = productosVenta.find((p) => p.id === producto.id)
                        return (
                          <TableRow key={`${producto.id}-${producto.stock}`}>

                            <TableCell className="font-medium">{producto.nombre}</TableCell>
                            <TableCell>
                              <Badge variant="secondary">
                                {producto.tipo_unidad?.nombre || "Sin unidad"}
                              </Badge>
                            </TableCell>
                            <TableCell>S/. {producto.precio_venta.toFixed(2)}</TableCell>
                            <TableCell>
                              <Badge variant={producto.stock > 10 ? "default" : "destructive"}>
                                {producto.stock} unidades
                              </Badge>
                            </TableCell>
                            <TableCell className="text-center">
                              <div className="flex items-center justify-center gap-2">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => enVenta && enVenta.cantidad > 0 && quitarProducto(producto.id)}
                                  disabled={!enVenta || enVenta.cantidad === 0}
                                >
                                  <Minus className="h-3 w-3" />
                                </Button>
                                <Input
                                  type="number"
                                  min="0"
                                  max={producto.stock}
                                  value={enVenta ? enVenta.cantidad.toString() : "0"}
                                  onChange={(e) => {
                                    const valor = e.target.value;
                                    if (valor === "") {
                                      actualizarCantidad(producto.id, 0); // Si está vacío, pon 0
                                      return;
                                    }
                                    let num = parseInt(valor, 10);
                                    if (isNaN(num) || num < 0) num = 0;
                                    if (num > producto.stock) num = producto.stock;
                                    actualizarCantidad(producto.id, num);
                                  }}
                                  className="w-16 text-center"
                                />
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => agregarProducto(producto)}
                                  disabled={producto.stock === 0 || (enVenta?.cantidad || 0) >= producto.stock}
                                >
                                  <Plus className="h-3 w-3" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        )
                      })
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Panel derecho - Factura */}
        <div className="lg:col-span-1">
          <Card className="sticky top-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Vista Previa Documento
              </CardTitle>
              <CardDescription>Previsualización del documento de venta</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-white border-2 border-gray-200 rounded-lg p-4 min-h-[600px] shadow-inner space-y-4">
              {/* Encabezado de la orden */}
              <div className="text-center border-b pb-4">
                <h2 className="text-lg font-bold">ORDEN DE VENTA</h2>
                <p className="text-sm text-gray-600">#{numeroOrden || "Cargando..."}</p>
                <p className="text-xs text-gray-500">{new Date().toLocaleDateString()}</p>
              </div>
              <div className="space-y-2">
                <h4 className="font-semibold text-sm">Cliente:</h4>
                <p className="text-sm text-muted-foreground">
                {clienteSeleccionadoData
                  ? `${clienteSeleccionadoData.nombre} (${clienteSeleccionadoData.tipoDocumento}: ${clienteSeleccionadoData.documento})`
                  : "Sin cliente seleccionado"}
              </p>
              </div>
              <Separator />

              <div className="space-y-2">
                <h4 className="font-semibold text-sm">Vendedor:</h4>
                <p className="text-sm text-muted-foreground">{nombreTrabajador}</p>
              </div>

              <Separator />

              <div className="space-y-2">
                <h4 className="font-semibold text-sm">Productos:</h4>
                {productosVenta.length === 0 ? (
                  <p className="text-sm text-muted-foreground italic">No hay productos seleccionados</p>
                ) : (
                  <div className="space-y-2">
                    {productosVenta.map((producto) => (
                      <div key={producto.id} className="flex justify-between items-center text-sm">
                        <div className="flex-1">
                          <p className="font-medium">{producto.nombre}</p>
                          <p className="text-muted-foreground">
                            {producto.cantidad} x S/. {producto.precio.toFixed(2)}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">S/. {(producto.precio * producto.cantidad).toFixed(2)}</span>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => eliminarProducto(producto.id)}
                            className="h-6 w-6 p-0 text-destructive hover:text-destructive"
                            disabled={productosVenta.find((p) => p.id === producto.id) === undefined}
                          >
                            ×
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {productosVenta.length > 0 && (
                <>
                  <Separator />
                  <div className="flex justify-between items-center font-semibold">
                    <span>Total:</span>
                    <span className="text-lg">S/. {calcularTotal()}</span>
                  </div>
                  <Separator />
                  {!ventaParaPDF ? (
                    <Button
                      className="w-full"
                      onClick={generarVenta}
                      disabled={!clienteSeleccionado || productosVenta.length === 0 || loadingVenta}
                    >
                      {loadingVenta ? "Registrando..." : "Generar Venta"}
                    </Button>
                  ) : (
                    <VentaBoletaExport
                      key={ventaParaPDF.productos.map(p => p.nombre).join('-') + ventaParaPDF.productos.length}
                      cliente={ventaParaPDF.cliente}
                      vendedor={ventaParaPDF.vendedor}
                      productos={ventaParaPDF.productos}
                      numeroOrden={ventaParaPDF.numeroOrden}
                    />
                  )}
                </>
              )}
              {ventaParaPDF && (
                <Button
                  className="w-full mt-2"
                  onClick={() => {
                    setProductosVenta([]);
                    setClienteSeleccionado("");
                    setVentaParaPDF(null);
                  }}
                >
                  Nueva venta
                </Button>
              )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
