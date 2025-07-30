import React, { useState } from "react"
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Image,
} from "@react-pdf/renderer";

const styles = StyleSheet.create({
  page: {
    padding: 18,
    fontSize: 10,
    fontFamily: "Helvetica",
    backgroundColor: "#fff",
  },
  borderBox: {
    border: "1pt solid #000",
    padding: 8,
    margin: 2,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 4,
  },
  logoBox: {
    width: 70,
    height: 30,
    marginRight: 8,
  },
  companyInfo: {
    flex: 1,
    fontSize: 8,
    color: "#000",
    marginBottom: 2,
  },
  rucBox: {
    border: "1pt solid #000",
    padding: 4,
    alignItems: "center",
    backgroundColor: "#fff",
    marginBottom: 2,
    minWidth: 120,
  },
  rucText: {
    color: "#000",
    fontWeight: "bold",
    fontSize: 10,
    textAlign: "center",
  },
  boletaTitle: {
    color: "#000",
    fontWeight: "bold",
    fontSize: 11,
    textAlign: "center",
    marginTop: 2,
  },
  boletaNum: {
    color: "#d00",
    fontWeight: "bold",
    fontSize: 12,
    marginTop: 2,
  },
  section: {
    marginBottom: 6,
  },
  label: {
    fontWeight: "bold",
    fontSize: 9,
    color: "#000",
  },
  table: {
    border: "1pt solid #000",
    marginTop: 4,
    marginBottom: 4,
  },
  tableRow: {
    flexDirection: "row",
    borderBottom: "1pt solid #000",
    alignItems: "center",
    minHeight: 16,
  },
  tableHeader: {
    backgroundColor: "#eee",
    fontWeight: "bold",
    color: "#000",
    fontSize: 9,
  },
  cellCodigo: {
    width: 40,
    padding: 2,
    textAlign: "center",
    color: "#000",
  },
  cellCant: {
    width: 30,
    padding: 2,
    textAlign: "center",
    color: "#000",
  },
  cellDesc: {
    flex: 1,
    padding: 2,
    color: "#000",
  },
  cellPrecioUnit: {
    width: 80, 
    padding: 2,
    textAlign: "right",
    color: "#000",
  },
  cellPrecioVenta: {
    width: 80, 
    padding: 2,
    textAlign: "right",
    color: "#000",
  },
  totalBox: {
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
    marginTop: 8,
    border: "1pt solid #000",
    padding: 4,
    backgroundColor: "#fff",
  },
  totalLabel: {
    fontWeight: "bold",
    color: "#000",
    fontSize: 10,
    marginRight: 8,
  },
  totalValue: {
    fontWeight: "bold",
    fontSize: 12,
    color: "#000",
  },
  footer: {
    marginTop: 16,
    fontSize: 9,
    textAlign: "center",
    color: "#000",
  },
});

type Product = {
  id?: number | string;
  nombre: string;
  cantidad: number;
  precio: number;
  total: number;
};

type Cliente = {
  nombre: string
  documento: string
  tipoDocumento?: string
  direccion?: string
}

type Props = {
  numero: string
  fecha: string
  cliente: Cliente | null
  vendedor: string
  productos: Product[]
  totalGeneral: number
}

export default function VentaBoletaPDF({ numero, fecha, cliente, productos, totalGeneral }: Props) {
  const [tipoDocumento, setTipoDocumento] = useState<string>("")

  
  React.useEffect(() => {
    if (cliente?.documento) {
      const longitud = cliente.documento.length
      if (longitud === 8) {
        setTipoDocumento("DNI")
      } else if (longitud === 10 || longitud === 11) {
        setTipoDocumento("RUC")
      } else {
        setTipoDocumento("DOC")
      }
    }
  }, [cliente?.documento])

  return (
    <Document>
      <Page size="A5" style={styles.page}>
        <View style={styles.borderBox}>
          {/* Encabezado con logo y datos empresa */}
          <View style={styles.headerRow}>
            {/* Logo (cambia la ruta por tu logo real) */}
            <Image src="/logo.png" style={styles.logoBox} />
            <View style={styles.companyInfo}>
              <Text style={{ fontWeight: "bold", fontSize: 12 }}>DISTRIBUCIONES ADISAN</Text>
              <Text>RUC: #########</Text>
              <Text>Av Tacabamba 766 - Chota - Cajamarca</Text>
              <Text>Telefono: 976667504</Text>
            </View>
            <View style={styles.rucBox}>
              <Text style={styles.rucText}>R.U.C. Nº ############</Text>
              <Text style={styles.boletaTitle}>BOLETA DE VENTA</Text>
              <Text style={styles.boletaNum}>N° {numero}</Text>
            </View>
          </View>

          {/* Datos de la venta */}
          <View style={styles.section}>
            <Text>Señor(a): {cliente?.nombre || "-"}</Text>
            <Text>
              {tipoDocumento ? `${tipoDocumento}: ` : ""}
              {cliente?.documento || "-"}
            </Text>
            {cliente?.direccion && <Text>Dirección: {cliente.direccion}</Text>}
            <Text>Fecha: {fecha}</Text>
          </View>

          {/* Tabla de productos */}
          <View style={styles.table}>
            <View style={[styles.tableRow, styles.tableHeader]}>
              <Text style={styles.cellCant}>Cant.</Text>
              <Text style={styles.cellDesc}>DESCRIPCIÓN</Text>
              <Text style={styles.cellPrecioUnit}>Precio Unitario</Text>
              <Text style={styles.cellPrecioVenta}>Precio Venta</Text>
            </View>
            {productos.map((prod, idx) => (
              <View style={styles.tableRow} key={idx}>
                <Text style={styles.cellCant}>{prod.cantidad}</Text>
                <Text style={styles.cellDesc}>{prod.nombre}</Text>
                <Text style={styles.cellPrecioUnit}>S/. {prod.precio.toFixed(2)}</Text>
                <Text style={styles.cellPrecioVenta}>S/. {prod.total.toFixed(2)}</Text>
              </View>
            ))}
          </View>

          {/* Total al pie */}
          <View style={styles.totalBox}>
            <Text style={styles.totalLabel}>TOTAL S/</Text>
            <Text style={styles.totalValue}>{totalGeneral.toFixed(2)}</Text>
          </View>

          {/* Footer */}
          <Text style={styles.footer}>DISTRIBUCIONES ADISAN</Text>
        </View>
      </Page>
    </Document>
  )
}