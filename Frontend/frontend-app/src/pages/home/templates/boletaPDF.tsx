// BoletaPDF.tsx
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Font,
} from "@react-pdf/renderer";

// Estilos
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
  separator: {
    marginVertical: 5,
    height: 1,
    backgroundColor: "#000",
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

// Datos de ejemplo tipados
type Product = {
  nombre: string;
  unidad: string;
  cantidad: number;
  precio: number;
  total: number;
};

type Props = {
  numero: string;
  fecha: string;
  proveedor: {
    nombre: string;
    contacto: string;
    telefono: string;
  };
  productos: Product[];
  totalGeneral: number;
};

const BoletaPDF = ({ numero, fecha, proveedor, productos, totalGeneral }: Props) => (
  <Document>
    <Page size="A5" style={styles.page}>
      <View style={styles.header}>
        <Text style={{ fontSize: 14, fontWeight: "bold" }}>BOLETA DE COMPRA</Text>
        <Text>#{numero}</Text>
        <Text>{fecha}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.bold}>PROVEEDOR:</Text>
        <Text>{proveedor.nombre}</Text>
        <Text>Contacto: {proveedor.contacto}</Text>
        <Text>Tel: {proveedor.telefono}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.bold}>PRODUCTOS:</Text>
        {productos.map((prod, index) => (
          <View key={index}>
            <View style={styles.productRow}>
              <Text>{prod.nombre}</Text>
              <Text>s/.{prod.precio}</Text>
            </View>
            <Text>
              {prod.cantidad} {prod.unidad} - Total: S/. {prod.total.toFixed(2)}
            </Text>
          </View>
        ))}
      </View>

      <Text style={styles.total}>TOTAL GENERAL: S/. {totalGeneral.toFixed(2)}</Text>
    </Page>
  </Document>
  
);

export default BoletaPDF;
