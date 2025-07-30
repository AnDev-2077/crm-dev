
import { PDFDownloadLink } from "@react-pdf/renderer";
import BoletaPDF from "@/pages/home/templates/boletaPDF";
import { Button } from "@/components/ui/button";

type Product = {
  nombre: string;
  unidad: string;
  cantidad: number;
  precio: number;
};

type Props = {
  cliente?: {
    nombre: string;
    documento: string;
    tipoDocumento?: string;
    correo?: string;
    telefono?: string;
  };
  completeProducts: Product[];
  numeroOrden: string | null;
};

const BoletaExport = ({ cliente, completeProducts, numeroOrden }: Props) => {

  const canGenerate =
    cliente && completeProducts && completeProducts.length > 0;

  const fecha = new Date().toLocaleDateString();

  const totalGeneral = completeProducts.reduce(
    (acc, p) => acc + Number(p.precio) * Number(p.cantidad),
    0
  );

  const pdfData = {
    numero: numeroOrden || "N/A",
    fecha,
    cliente: cliente || undefined,
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
    <div className="w-full mt-0">
      {canGenerate && (
        <div className="flex justify-end w-full">
          <PDFDownloadLink
            document={<BoletaPDF {...pdfData} />}
            fileName={`orden_compra_${cliente?.nombre}_${numeroOrden}.pdf`}
          >
            {({ loading }) => (
              <Button
                className="sm:w-auto"
                disabled={loading}
                variant="default"
              >
                {loading ? "Generando PDF..." : "Exportar como PDF"}
              </Button>
            )}
          </PDFDownloadLink>
        </div>
      )}
    </div>
  );
};

export default BoletaExport;
