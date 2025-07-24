//ventaBoletaPDF.tsx
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
} from "@react-pdf/renderer";

const styles = StyleSheet.create({
  page: {
    padding: 20,
    fontSize: 10,
    fontFamily: "Helvetica",
  },
  header: {
    textAlign: "center",
    marginBottom: 10,
  },
  section: {
    marginBottom: 10,
  },
  bold: {
    fontWeight: "bold",
  },
  // Corregido: estilos válidos para react-pdf
  line: {
    borderBottomWidth: 1,
    borderBottomColor: "#000",
    marginTop: 5,
    marginBottom: 5,
  },
  productRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 3,
  },
  total: {
    textAlign: "right",
    marginTop: 10,
    fontSize: 12,
    fontWeight: "bold",
  },
});

type Product = {
  nombre: string;
  cantidad: number;
  precio: number;
  total: number;
};

type Props = {
  numero: string;
  fecha: string;
  cliente: {
    nombre: string;
    documento: string;
  };
  vendedor: string;
  productos: Product[];
  totalGeneral: number;
};

const VentaBoletaPDF = ({
  numero,
  fecha,
  cliente,
  vendedor,
  productos,
  totalGeneral,
}: Props) => {
  // Validaciones defensivas
  const productosValidos = Array.isArray(productos) ? productos : [];
  const clienteValido = cliente || { nombre: "N/A", documento: "N/A" };

  return (
    <Document>
      <Page size="A5" style={styles.page}>
        <View style={styles.header}>
          <Text style={{ fontSize: 14, fontWeight: "bold" }}>ORDEN DE VENTA</Text>
          <Text>#{numero}</Text>
          <Text>{fecha}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.bold}>CLIENTE:</Text>
          <Text>{clienteValido.nombre} (DNI: {clienteValido.documento})</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.bold}>VENDEDOR:</Text>
          <Text>{vendedor}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.bold}>PRODUCTOS:</Text>
          {productosValidos.length === 0 ? (
            <Text>No hay productos.</Text>
          ) : (
            productosValidos.map((prod, index) => (
              <View key={index}>
                <View style={styles.productRow}>
                  <Text>{prod.nombre}</Text>
                  <Text>S/. {prod.precio}</Text>
                </View>
                <Text>
                  {prod.cantidad} x S/. {prod.precio} - Total: S/. {prod.total?.toFixed ? prod.total.toFixed(2) : "0.00"}
                </Text>
              </View>
            ))
          )}
        </View>

        <Text style={styles.total}>TOTAL: S/. {typeof totalGeneral === "number" ? totalGeneral.toFixed(2) : "0.00"}</Text>
      </Page>
    </Document>
  );
};

export default VentaBoletaPDF;