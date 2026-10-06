import React, { Component } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, ScrollView,
  ActivityIndicator, Alert, StyleSheet
} from 'react-native';
import { ApiService } from '../services/ApiService';
import { Product } from '../models/Product';

interface Props {
  mode: 'create' | 'edit';
  productId?: number;
  onBack: () => void;
  onSuccess: () => void;
}

interface State {
  title: string;
  price: string;
  description: string;
  category: string;
  image: string;
  loading: boolean;
  fetching: boolean;
  errors: { [key: string]: boolean };
}

export class ProductFormScreen extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      title: '', price: '', description: '', category: '', image: '',
      loading: false, fetching: props.mode === 'edit', errors: {}
    };
  }

  async componentDidMount() {
    if (this.props.mode === 'edit' && this.props.productId) {
      try {
        const product = await ApiService.getProductById(this.props.productId);
        this.setState({
          title: product.title,
          price: product.price.toString(),
          description: product.description,
          category: product.category,
          image: product.image,
          fetching: false
        });
      } catch (err) {
        Alert.alert('Error', 'No se pudo cargar el producto para editar.');
        this.props.onBack();
      }
    }
  }

  validarCampos = (): boolean => {
    const { title, price, description, category, image } = this.state;
    const errors: any = {};
    
    if (!title.trim()) errors.title = true;
    if (!description.trim()) errors.description = true;
    if (!category.trim()) errors.category = true;
    if (!image.trim()) errors.image = true;
    
    // Validación estricta de precio numérico
    if (!price.trim() || isNaN(Number(price))) errors.price = true;

    this.setState({ errors });
    return Object.keys(errors).length === 0;
  };

  guardarProducto = async () => {
    if (!this.validarCampos()) {
      Alert.alert('Datos incorrectos', 'Revisa los campos marcados en rojo. El precio debe ser numérico.');
      return;
    }

    this.setState({ loading: true });
    const { title, price, description, category, image } = this.state;
    const payload = { title, price: Number(price), description, category, image };

    try {
      if (this.props.mode === 'create') {
        const result = await ApiService.createProduct(payload);
        Alert.alert('Éxito', `Producto registrado correctamente con ID: ${result.id}`, [{ text: 'OK', onPress: this.props.onSuccess }]);
      } else {
        await ApiService.updateProduct(this.props.productId!, payload);
        Alert.alert('Éxito', 'Producto actualizado (Simulación)', [{ text: 'OK', onPress: this.props.onSuccess }]);
      }
    } catch (err) {
      Alert.alert('Error', 'Hubo un problema al comunicarse con el servidor.');
      this.setState({ loading: false });
    }
  };

  render() {
    const { mode } = this.props;
    const { title, price, description, category, image, loading, fetching, errors } = this.state;

    if (fetching) {
      return (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#0066CC" />
        </View>
      );
    }

    return (
      <ScrollView style={styles.container}>
        <TouchableOpacity style={styles.backButton} onPress={this.props.onBack} disabled={loading}>
          <Text style={styles.backText}>← Cancelar</Text>
        </TouchableOpacity>

        <Text style={styles.headerTitle}>
          {mode === 'create' ? 'Agregar Nuevo Producto' : 'Editar Producto'}
        </Text>

        <View style={styles.form}>
          <Text style={styles.label}>Título</Text>
          <TextInput style={[styles.input, errors.title && styles.inputError]} value={title} onChangeText={(t) => this.setState({ title: t, errors: { ...errors, title: false } })} />

          <Text style={styles.label}>Precio ($)</Text>
          <TextInput style={[styles.input, errors.price && styles.inputError]} value={price} keyboardType="numeric" onChangeText={(t) => this.setState({ price: t, errors: { ...errors, price: false } })} />

          <Text style={styles.label}>Categoría</Text>
          <TextInput style={[styles.input, errors.category && styles.inputError]} value={category} autoCapitalize="none" onChangeText={(t) => this.setState({ category: t, errors: { ...errors, category: false } })} />

          <Text style={styles.label}>URL de Imagen</Text>
          <TextInput style={[styles.input, errors.image && styles.inputError]} value={image} autoCapitalize="none" onChangeText={(t) => this.setState({ image: t, errors: { ...errors, image: false } })} />

          <Text style={styles.label}>Descripción</Text>
          <TextInput style={[styles.input, styles.textArea, errors.description && styles.inputError]} value={description} multiline numberOfLines={4} onChangeText={(t) => this.setState({ description: t, errors: { ...errors, description: false } })} />

          <TouchableOpacity style={[styles.saveButton, loading && styles.disabledButton]} onPress={this.guardarProducto} disabled={loading}>
            {loading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.saveBtnText}>Guardar Producto</Text>}
          </TouchableOpacity>
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
  headerTitle: { fontSize: 22, fontWeight: 'bold', paddingHorizontal: 15, marginBottom: 15, color: '#333' },
  form: { paddingHorizontal: 15, paddingBottom: 30 },
  label: { fontSize: 14, fontWeight: '600', color: '#555', marginBottom: 5 },
  input: { borderWidth: 1, borderColor: '#CCC', borderRadius: 8, padding: 12, marginBottom: 15, fontSize: 15, backgroundColor: '#FAFAFA' },
  inputError: { borderColor: '#D32F2F', borderWidth: 1.5 },
  textArea: { height: 100, textAlignVertical: 'top' },
  saveButton: { backgroundColor: '#2E7D32', padding: 15, borderRadius: 8, alignItems: 'center', marginTop: 10 },
  disabledButton: { backgroundColor: '#A5D6A7' },
  saveBtnText: { color: '#FFF', fontWeight: 'bold', fontSize: 16 },
});