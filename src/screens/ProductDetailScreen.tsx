import React, { Component } from 'react';
import { View, Text, Image, ScrollView, TouchableOpacity, ActivityIndicator, Alert, StyleSheet } from 'react-native';
import { Product } from '../models/Product';
import { ApiService } from '../services/ApiService';
import { SessionStorage } from '../storage/SessionStorage';

interface Props {
  productId: number;
  onBack: () => void;
  onEdit: (productId: number) => void;
  onDeleteSuccess: () => void;
}

interface State {
  product: Product | null;
  userRole: string | null;
  loading: boolean;
  deleting: boolean;
}

export class ProductDetailScreen extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { product: null, userRole: null, loading: true, deleting: false };
  }

  componentDidMount() {
    this.cargarDetalle();
  }

  cargarDetalle = async () => {
    try {
      const rol = await SessionStorage.obtenerRol();
      const producto = await ApiService.getProductById(this.props.productId);
      this.setState({ product: producto, userRole: rol, loading: false });
    } catch (err) {
      Alert.alert('Producto no disponible', 'No se pudo obtener la información.');
      this.props.onBack();
    }
  };

  confirmarEliminacion = () => {
    Alert.alert(
      '¿Estás seguro de eliminar este producto?',
      'Esta acción removerá el artículo del catálogo.',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Eliminar', style: 'destructive', onPress: this.ejecutarEliminacion }
      ]
    );
  };

  ejecutarEliminacion = async () => {
    this.setState({ deleting: true });
    try {
      await ApiService.deleteProduct(this.props.productId);
      Alert.alert('Éxito', 'El producto ha sido eliminado del sistema.');
      this.props.onDeleteSuccess();
    } catch (err) {
      Alert.alert('Error', 'No se pudo eliminar el producto.');
      this.setState({ deleting: false });
    }
  };

  render() {
    const { product, userRole, loading, deleting } = this.state;

    if (loading) return <View style={styles.centerContainer}><ActivityIndicator size="large" color="#0066CC" /></View>;
    if (!product) return null;

    const esAdmin = userRole === 'Administrador';

    return (
      <ScrollView style={styles.container}>
        <TouchableOpacity style={styles.backButton} onPress={this.props.onBack} disabled={deleting}>
          <Text style={styles.backText}>← Volver al catálogo</Text>
        </TouchableOpacity>

        <Image source={{ uri: product.image }} style={styles.image} resizeMode="contain" />

        <View style={styles.infoContainer}>
          <Text style={styles.category}>{product.category.toUpperCase()}</Text>
          <Text style={styles.title}>{product.title}</Text>
          <Text style={styles.price}>{product.precioFormateado}</Text>
          <Text style={styles.description}>{product.description}</Text>

          {esAdmin && (
            <View style={styles.adminControls}>
              <TouchableOpacity style={[styles.actionButton, styles.editButton]} onPress={() => this.props.onEdit(product.id)} disabled={deleting}>
                <Text style={styles.btnText}>Editar Producto</Text>
              </TouchableOpacity>

              <TouchableOpacity style={[styles.actionButton, styles.deleteButton]} onPress={this.confirmarEliminacion} disabled={deleting}>
                {deleting ? <ActivityIndicator color="#FFF" /> : <Text style={styles.btnText}>Eliminar Producto</Text>}
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