import React, { Component } from 'react';
import { SafeAreaView, View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { LoginScreen } from '../screens/LoginScreen';
import { CatalogScreen } from '../screens/CatalogScreen';
import { ProductDetailScreen } from '../screens/ProductDetailScreen';
import { SessionStorage } from '../storage/SessionStorage';

interface State {
  userRole: string | null;
  username: string | null;
  selectedProductId: number | null;
  loadingSession: boolean;
}

export default class App extends Component<{}, State> {
  constructor(props: {}) {
    super(props);
    this.state = {
      userRole: null,
      username: null,
      selectedProductId: null,
      loadingSession: true,
    };
  }

  async componentDidMount() {
    // Se fuerza el cierre de sesión al iniciar la app para mostrar siempre el Login
    await SessionStorage.cerrarSesion();
    this.setState({ userRole: null, username: null, loadingSession: false });
  }

  handleLoginSuccess = (userRole: string, username: string) => {
    this.setState({ userRole, username });
  };

  handleLogout = async () => {
    try {
      // Intentamos borrar el registro de la memoria local
      await SessionStorage.cerrarSesion();
    } catch (error) {
      console.log('Error menor al limpiar el almacenamiento', error);
    } finally {
      // El bloque finally asegura que, haya fallado o no lo anterior, 
      // el estado de la app se limpie y te expulse al Login de inmediato.
      this.setState({ 
        userRole: null, 
        username: null, 
        selectedProductId: null 
      });
    }
  };

  handleSelectProduct = (productId: number) => {
    this.setState({ selectedProductId: productId });
  };

  handleBackToCatalog = () => {
    this.setState({ selectedProductId: null });
  };

  render() {
    const { userRole, username, selectedProductId, loadingSession } = this.state;

    if (loadingSession) return null;

    // 1. Muestra la pantalla de Login si no hay rol activo
    if (!userRole) {
      return (
        <SafeAreaView style={styles.container}>
          <LoginScreen onLoginSuccess={this.handleLoginSuccess} />
        </SafeAreaView>
      );
    }

    // Color del distintivo de rol
    let badgeColor = '#0066CC'; // Cliente
    if (userRole === 'Administrador') badgeColor = '#D32F2F'; // Admin
    if (userRole === 'Auditor') badgeColor = '#F57C00'; // Auditor

    return (
      <SafeAreaView style={styles.container}>
        {/* Barra superior con datos del usuario y rol */}
        <View style={styles.header}>
          <View style={styles.userInfo}>
            <Text style={styles.userText}>{username ? `Usuario: ${username}` : 'Sesión Activa'}</Text>
            <View style={[styles.roleBadge, { backgroundColor: badgeColor }]}>
              <Text style={styles.roleText}>{userRole}</Text>
            </View>
          </View>
          <TouchableOpacity style={styles.logoutButton} onPress={this.handleLogout}>
            <Text style={styles.logoutText}>Cerrar Sesión</Text>
          </TouchableOpacity>
        </View>

        {/* 2. Muestra Detalle o Catálogo */}
        {selectedProductId ? (
          <ProductDetailScreen
            productId={selectedProductId}
            onBack={this.handleBackToCatalog}
          />
        ) : (
          <CatalogScreen onSelectProduct={this.handleSelectProduct} />
        )}
      </SafeAreaView>
    );
  }
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF' },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 10,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#EEE',
    elevation: 2,
  },
  userInfo: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  userText: { fontWeight: 'bold', fontSize: 13, color: '#333' },
  roleBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 12 },
  roleText: { color: '#FFF', fontWeight: 'bold', fontSize: 11 },
  logoutButton: { paddingHorizontal: 10, paddingVertical: 5, backgroundColor: '#EEEEEE', borderRadius: 6 },
  logoutText: { fontSize: 12, fontWeight: 'bold', color: '#555' },
});