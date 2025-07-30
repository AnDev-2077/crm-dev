  
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
    header: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "flex-start",
      marginBottom: 4,
    },
    logoBox: {
      width: 90,
      height: 40,
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
    },
    rucText: {
      color: "#000",
      fontWeight: "bold",
      fontSize: 10,
    },
    boletaBox: {
      border: "1pt solid #000",
      padding: 4,
      alignItems: "center",
      backgroundColor: "#fff",
      marginBottom: 2,
    },
    boletaTitle: {
      color: "#000",
      fontWeight: "bold",
      fontSize: 10,
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
    cellCant: {
      width: 40,
      padding: 2,
      textAlign: "center",
      color: "#000",
    },
    cellDesc: {
      flex: 1,
      padding: 2,
      color: "#000",
    },
    cellImporte: {
      width: 60,
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
  });

  type Product = {
    nombre: string;
    unidad?: string;
    cantidad: number;
    precio: number;
    total: number;
  };

  type Props = {
    numero: string;
    fecha: string;
    proveedor?: {
      nombre: string;
      contacto?: string;
      telefono?: string;
    };
    cliente?: {
      nombre: string;
      documento: string;
      tipoDocumento?: string;
      direccion?: string;
    };
    productos: Product[];
    totalGeneral: number;
  };

  const BoletaPDF = ({
    numero,
    fecha,
    proveedor,
    cliente,
    productos,
    totalGeneral,
  }: Props) => (
    <Document>
      <Page size="A5" style={styles.page}>
        {/* Encabezado con logo y datos empresa */}
        <View style={styles.header}>
          {/* Logo en la parte superior izquierda (cambia la ruta por tu logo real) */}
          <Image src="/logo.png" style={styles.logoBox} />
          <View style={styles.companyInfo}>
            <Text style={{ fontWeight: "bold", color: "#000", fontSize: 12 }}>DISTRIBUCIONES ADISAN</Text>
            <Text style={{ color: "#000" }}>Av Tacabamba 766 - Chota - Cajamarca</Text>
            <Text style={{ color: "#000" }}>Telefono: 976667504</Text>
            <Text style={{ color: "#000" }}>Email: distribucionesadisan@gmail.com</Text>
          </View>
          <View>
            <View style={styles.rucBox}>
              <Text style={styles.rucText}>R.U.C. 10421785185</Text>
            </View>
            <View style={styles.boletaBox}>
              <Text style={styles.boletaTitle}>BOLETA DE COMPRA</Text>
              <Text style={styles.boletaNum}>N° {numero}</Text> {/* Solo este en rojo */}
            </View>
          </View>
        </View>

        {/* Datos de la venta */}
        <View style={styles.section}>
          <Text>Fecha: {fecha}</Text>
          <Text>Proveedor: {cliente?.nombre || proveedor?.nombre || "-"}</Text>
          <Text>
            {cliente?.tipoDocumento ? `${cliente.tipoDocumento}: ` : ""}
            {cliente?.documento || "-"}
          </Text>
          {cliente?.direccion && <Text>Dirección: {cliente.direccion}</Text>}
        </View>

        {/* Tabla de productos */}
        <View style={styles.table}>
          <View style={[styles.tableRow, styles.tableHeader]}>
            <Text style={styles.cellCant}>CANT.</Text>
            <Text style={styles.cellDesc}>DESCRIPCIÓN</Text>
            <Text style={styles.cellImporte}>IMPORTE</Text>
          </View>
          {productos.map((prod, idx) => (
            <View style={styles.tableRow} key={idx}>
              <Text style={styles.cellCant}>{prod.cantidad}</Text>
              <Text style={styles.cellDesc}>{prod.nombre}</Text>
              <Text style={styles.cellImporte}>S/. {prod.total.toFixed(2)}</Text>
            </View>
          ))}
        </View>

        {/* Total al pie */}
        <View style={styles.totalBox}>
          <Text style={styles.totalLabel}>TOTAL S/.</Text>
          <Text style={styles.totalValue}>{totalGeneral.toFixed(2)}</Text>
        </View>
      </Page>
    </Document>
  );

  export default BoletaPDF;
