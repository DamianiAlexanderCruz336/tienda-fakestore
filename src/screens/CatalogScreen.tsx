import { Component } from 'react';
import {
    ActivityIndicator,
    FlatList,
    Image,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { Product } from '../models/Product';
import { ApiService } from '../services/ApiService';

interface Props {
  onSelectProduct: (productId: number) => void;
}

interface State {
  products: Product[];
  categories: string[];
  selectedCategory: string | null;
  loading: boolean;
  error: boolean;
}

export class CatalogScreen extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      products: [],
      categories: [],
      selectedCategory: null,
      loading: true,
      error: false,
    };
  }

  componentDidMount() {
    this.cargarDatosIniciales();
  }

  cargarDatosIniciales = async () => {
    this.setState({ loading: true, error: false });
    try {
      const [productos, categorias] = await Promise.all([
        ApiService.getProducts(),
        ApiService.getCategories(),
      ]);
      this.setState({
        products: productos,
        categories: categorias,
        loading: false,
      });
    } catch (err) {
      this.setState({ error: true, loading: false });
    }
  };

  // US04: Cambio de categoría con limpieza previa de estado
  seleccionarCategoria = async (categoria: string | null) => {
    // Se limpia la memoria/arreglo previo antes de la nueva petición
    this.setState({ selectedCategory: categoria, products: [], loading: true, error: false });
    try {
      let productos: Product[];
      if (categoria) {
        productos = await ApiService.getProductsByCategory(categoria);
      } else {
        productos = await ApiService.getProducts();
      }
      this.setState({ products: productos, loading: false });
    } catch (err) {
      this.setState({ error: true, loading: false });
    }
  };

  renderProductItem = ({ item }: { item: Product }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => this.props.onSelectProduct(item.id)}
    >
      <Image source={{ uri: item.image }} style={styles.productImage} resizeMode="contain" />
      <View style={styles.cardInfo}>
        <Text style={styles.productTitle} numberOfLines={2}>
          {item.title}
        </Text>
        <Text style={styles.productPrice}>{item.precioFormateado}</Text>
      </View>
    </TouchableOpacity>
  );

  render() {
    const { products, categories, selectedCategory, loading, error } = this.state;

    // US03: Manejo de error con botón de reintento
    if (error) {
      return (
        <View style={styles.centerContainer}>
          <Text style={styles.errorText}>Ocurrió un problema al cargar el catálogo.</Text>
          <TouchableOpacity style={styles.retryButton} onPress={this.cargarDatosIniciales}>
            <Text style={styles.retryText}>Reintentar</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return (
      <View style={styles.container}>
        {/* US04: Barra horizontal de categorías (Chips) */}
        <View style={styles.categoriesContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <TouchableOpacity
              style={[styles.chip, selectedCategory === null && styles.chipSelected]}
              onPress={() => this.seleccionarCategoria(null)}
            >
              <Text style={selectedCategory === null ? styles.chipTextSelected : styles.chipText}>
                Ver todos
              </Text>
            </TouchableOpacity>
            {categories.map((cat) => (
              <TouchableOpacity
                key={cat}
                style={[styles.chip, selectedCategory === cat && styles.chipSelected]}
                onPress={() => this.seleccionarCategoria(cat)}
              >
                <Text style={selectedCategory === cat ? styles.chipTextSelected : styles.chipText}>
                  {cat}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* US03: Indicador de carga */}
        {loading ? (
          <View style={styles.centerContainer}>
            <ActivityIndicator size="large" color="#0066CC" />
            <Text style={{ marginTop: 10 }}>Cargando productos...</Text>
          </View>
        ) : (
          /* US03: Lista reciclable eficiente */
          <FlatList
            data={products}
            keyExtractor={(item) => item.id.toString()}
            renderItem={this.renderProductItem}
            numColumns={2}
            contentContainerStyle={styles.listContainer}
          />
        )}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F5F5' },
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  categoriesContainer: { paddingVertical: 10, paddingHorizontal: 5, backgroundColor: '#FFF' },
  chip: { paddingHorizontal: 15, paddingVertical: 8, borderRadius: 20, backgroundColor: '#E0E0E0', marginRight: 8 },
  chipSelected: { backgroundColor: '#0066CC' },
  chipText: { color: '#333', fontSize: 13 },
  chipTextSelected: { color: '#FFF', fontWeight: 'bold', fontSize: 13 },
  listContainer: { padding: 8 },
  card: { flex: 1, margin: 6, backgroundColor: '#FFF', borderRadius: 8, padding: 10, alignItems: 'center', elevation: 2 },
  productImage: { width: 100, height: 100, marginBottom: 8 },
  cardInfo: { width: '100%' },
  productTitle: { fontSize: 13, fontWeight: '500', color: '#333' },
  productPrice: { fontSize: 14, fontWeight: 'bold', color: '#2E7D32', marginTop: 4 },
  errorText: { fontSize: 16, color: '#C62828', marginBottom: 15, textAlign: 'center' },
  retryButton: { backgroundColor: '#0066CC', paddingHorizontal: 20, paddingVertical: 10, borderRadius: 5 },
  retryText: { color: '#FFF', fontWeight: 'bold' },
});