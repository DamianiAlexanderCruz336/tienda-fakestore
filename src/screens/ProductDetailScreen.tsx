import { Component } from 'react';
import {
    ActivityIndicator,
    Alert,
    Image,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { Product } from '../models/Product';
import { ApiService } from '../services/ApiService';
import { SessionStorage } from '../storage/SessionStorage';

interface Props {
  productId: number;
  onBack: () => void;
}

interface State {
  product: Product | null;
  userRole: string | null;
  loading: boolean;
}

export class ProductDetailScreen extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      product: null,
      userRole: null,
      loading: true,
    };
  }

  componentDidMount() {
    this.cargarDetalle();
  }

  cargarDetalle = async () => {
    try {
      // Lectura estricta del rol almacenado localmente
      const rol = await SessionStorage.obtenerRol();
      const producto = await ApiService.getProductById(this.props.productId);

      this.setState({
        product: producto,
        userRole: rol,
        loading: false,
      });
    } catch (err) {
      // US05 Escenario 3: Error de consulta
      Alert.alert('Producto no disponible', 'No se pudo obtener la información del producto.', [
        { text: 'Aceptar', onPress: () => this.props.onBack() },
      ]);
    }
  };

  render() {
    const { product, userRole, loading } = this.state;

    if (loading) {
      return (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#0066CC" />
        </View>
      );
    }

    if (!product) return null;

    // US05: Verificación de permisos de administración
    const esAdmin = userRole === 'Administrador';

    return (
      <ScrollView style={styles.container}>
        <TouchableOpacity style={styles.backButton} onPress={this.props.onBack}>
          <Text style={styles.backText}>← Volver al catálogo</Text>
        </TouchableOpacity>

        <Image source={{ uri: product.image }} style={styles.image} resizeMode="contain" />

        <View style={styles.infoContainer}>
          <Text style={styles.category}>{product.category.toUpperCase()}</Text>
          <Text style={styles.title}>{product.title}</Text>
          <Text style={styles.price}>{product.precioFormateado}</Text>
          <Text style={styles.description}>{product.description}</Text>

          {/* US05 Escenario 2: Los componentes de gestión no se ocultan mediante CSS, 
              sino que se excluyen directamente del árbol de renderizado si no es Admin */}
          {esAdmin && (
            <View style={styles.adminControls}>
              <TouchableOpacity
                style={[styles.actionButton, styles.editButton]}
                onPress={() => Alert.alert('Editar', 'Navegando a formulario de edición...')}
              >
                <Text style={styles.btnText}>Editar Producto</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.actionButton, styles.deleteButton]}
                onPress={() => Alert.alert('Eliminar', '¿Confirmar eliminación del producto?')}
              >
                <Text style={styles.btnText}>Eliminar Producto</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </ScrollView>
    );
  }
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF' },
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  backButton: { padding: 15 },
  backText: { color: '#0066CC', fontWeight: 'bold' },
  image: { width: '100%', height: 250 },
  infoContainer: { padding: 20 },
  category: { color: '#888', fontSize: 12, fontWeight: 'bold' },
  title: { fontSize: 20, fontWeight: 'bold', marginVertical: 8, color: '#333' },
  price: { fontSize: 22, color: '#2E7D32', fontWeight: 'bold', marginBottom: 12 },
  description: { fontSize: 14, color: '#666', lineHeight: 20, marginBottom: 20 },
  adminControls: { marginTop: 20, borderTopWidth: 1, borderTopColor: '#EEE', paddingTop: 15 },
  actionButton: { padding: 12, borderRadius: 6, alignItems: 'center', marginBottom: 10 },
  editButton: { backgroundColor: '#F57C00' },
  deleteButton: { backgroundColor: '#D32F2F' },
  btnText: { color: '#FFF', fontWeight: 'bold' },
});