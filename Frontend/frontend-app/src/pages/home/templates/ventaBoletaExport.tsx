
import { PDFDownloadLink } from "@react-pdf/renderer";
import VentaBoletaPDF from "@/pages/home/templates/ventaBoletaPDF";
import { Button } from "@/components/ui/button";

type Product = {
  nombre: string;
  cantidad: number;
  precio: number;
};

type Cliente = {
  nombre: string;
  documento: string;
};

type Props = {
  cliente: Cliente | null;
  vendedor: string;
  productos: Product[];
  numeroOrden: string | null;
};

const VentaBoletaExport = ({ cliente, vendedor, productos, numeroOrden }: Props) => {
  const fecha = new Date().toLocaleDateString();

  const totalGeneral = productos.reduce(
    (acc, p) => acc + p.precio * p.cantidad,
    0
  );

  const pdfData = {
    numero: numeroOrden || "N/A",
    fecha,
    cliente: {
      nombre: cliente?.nombre || "N/A",
      documento: cliente?.documento || "N/A",
    },
    vendedor,
    productos: productos.map((p) => ({
      ...p,
      total: p.precio * p.cantidad,
    })),
    totalGeneral,
  };

  const canGenerate = cliente && productos.length > 0;

  return (
    <div className="w-full flex justify-end mt-4">
      {canGenerate && (
        <PDFDownloadLink
          document={<VentaBoletaPDF {...pdfData} />}
          fileName={`orden_venta_${cliente.nombre}_${numeroOrden}.pdf`}
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

export default VentaBoletaExport;