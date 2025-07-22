// BoletaExport.tsx
import React from "react";
import { PDFDownloadLink } from "@react-pdf/renderer";
import BoletaPDF from "@/pages/home/templates/boletaPDF";
import { Button } from "@/components/ui/button";

// Tipos de props
type Product = {
  nombre: string;
  unidad: string;
  cantidad: number;
  precio: number;
};

type Proveedor = {
  nombre: string;
  correo: string;
  telefono: string;
};

type Props = {
  selectedSupplierData: Proveedor | null;
  completeProducts: Product[];
};

const BoletaExport = ({ selectedSupplierData, completeProducts }: Props) => {
  // Verificar que haya datos
  const canGenerate =
    selectedSupplierData && completeProducts && completeProducts.length > 0;

  // Generar número y fecha
  const numero = Date.now().toString().slice(-6);
  const fecha = new Date().toLocaleDateString();

  // Calcular total general
  const totalGeneral = completeProducts.reduce(
    (acc, p) => acc + Number(p.precio) * Number(p.cantidad),
    0
  );

  // Construir props para el PDF
  const pdfData = {
    numero,
    fecha,
    proveedor: {
      nombre: selectedSupplierData?.nombre || "N/A",
      contacto: selectedSupplierData?.correo || "N/A",
      telefono: selectedSupplierData?.telefono || "N/A",
    },
    productos: completeProducts.map((p) => ({
      nombre: p.nombre,
      unidad: p.unidad,
      cantidad: Number(p.cantidad),
      precio: Number(p.precio),
      total: Number(p.precio) * Number(p.cantidad),
    })),
    totalGeneral,
  };

  return (
    <div className="w-full flex justify-end mt-4">
      {canGenerate && (
        <PDFDownloadLink
          document={<BoletaPDF {...pdfData} />}
          fileName={`orden_compra_${selectedSupplierData.nombre}_${numero}.pdf`}
        >
          {({ loading }) => (
            <Button
              className="w-full sm:w-auto"
              disabled={loading}
              variant="default"
            >
              {loading ? "Generando PDF..." : "Exportar como PDF"}
            </Button>
          )}
        </PDFDownloadLink>
      )}
    </div>
  );
};

export default BoletaExport;
