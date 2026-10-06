import React, { Component } from 'react';
import { SafeAreaView, View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { LoginScreen } from '../screens/LoginScreen';
import { CatalogScreen } from '../screens/CatalogScreen';
import { ProductDetailScreen } from '../screens/ProductDetailScreen';
import { ProductFormScreen } from '../screens/ProductFormScreen';
import { SessionStorage } from '../storage/SessionStorage';

type ViewState = 'catalog' | 'detail' | 'form';

interface State {
  userRole: string | null;
  username: string | null;
  currentView: ViewState;
  selectedProductId: number | null;
  formMode: 'create' | 'edit';
  loadingSession: boolean;
}

export default class App extends Component<{}, State> {
  constructor(props: {}) {
    super(props);
    this.state = {
      userRole: null, username: null, currentView: 'catalog',
      selectedProductId: null, formMode: 'create', loadingSession: true,
    };
  }

  async componentDidMount() {
    await SessionStorage.cerrarSesion();
    this.setState({ userRole: null, username: null, loadingSession: false });
  }

  handleLoginSuccess = (userRole: string, username: string) => {
    this.setState({ userRole, username });
  };

  handleLogout = async () => {
    try { await SessionStorage.cerrarSesion(); } 
    catch (error) {} 
    finally { this.setState({ userRole: null, username: null, currentView: 'catalog', selectedProductId: null }); }
  };

  navegarACatalogo = () => this.setState({ currentView: 'catalog', selectedProductId: null });
  
  navegarADetalle = (id: number) => this.setState({ currentView: 'detail', selectedProductId: id });

  navegarAFormulario = (mode: 'create' | 'edit', id?: number) => {
    if (this.state.userRole !== 'Administrador') return;
    this.setState({ currentView: 'form', formMode: mode, selectedProductId: id || null });
  };

  renderContent = () => {
    const { currentView, selectedProductId, formMode, userRole } = this.state;
    
    // Regla de negocio: Bloqueo estricto por si un rol menor intenta forzar el acceso
    if (currentView === 'form' && userRole === 'Administrador') {
      return <ProductFormScreen mode={formMode} productId={selectedProductId || undefined} onBack={this.navegarACatalogo} onSuccess={this.navegarACatalogo} />;
    }
    
    if (currentView === 'detail' && selectedProductId) {
      return <ProductDetailScreen productId={selectedProductId} onBack={this.navegarACatalogo} onEdit={(id) => this.navegarAFormulario('edit', id)} onDeleteSuccess={this.navegarACatalogo} />;
    }

    return <CatalogScreen onSelectProduct={this.navegarADetalle} />;
  };

  render() {
    const { userRole, username, loadingSession, currentView } = this.state;

    if (loadingSession) return null;
    if (!userRole) return <SafeAreaView style={styles.container}><LoginScreen onLoginSuccess={this.handleLoginSuccess} /></SafeAreaView>;

    const esAdmin = userRole === 'Administrador';
    let badgeColor = '#0066CC';
    if (esAdmin) badgeColor = '#D32F2F';
    if (userRole === 'Auditor') badgeColor = '#F57C00';

    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <View style={styles.userInfo}>
            <Text style={styles.userText}>{username}</Text>
            <View style={[styles.roleBadge, { backgroundColor: badgeColor }]}><Text style={styles.roleText}>{userRole}</Text></View>
          </View>
          
          <View style={styles.headerActions}>
            {esAdmin && currentView === 'catalog' && (
              <TouchableOpacity style={styles.addButton} onPress={() => this.navegarAFormulario('create')}>
                <Text style={styles.addButtonText}>+ Nuevo</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity style={styles.logoutButton} onPress={this.handleLogout}>
              <Text style={styles.logoutText}>Salir</Text>
            </TouchableOpacity>
          </View>
        </View>

        {this.renderContent()}
      </SafeAreaView>
    );
  }
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 15, paddingVertical: 10, backgroundColor: '#FFF', borderBottomWidth: 1, borderBottomColor: '#EEE', elevation: 10, zIndex: 9999, position: 'relative' },
  userInfo: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  userText: { fontWeight: 'bold', fontSize: 13, color: '#333' },
  roleBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 12 },
  roleText: { color: '#FFF', fontWeight: 'bold', fontSize: 11 },
  headerActions: { flexDirection: 'row', gap: 10, alignItems: 'center' },
  addButton: { paddingHorizontal: 10, paddingVertical: 6, backgroundColor: '#2E7D32', borderRadius: 6 },
  addButtonText: { fontSize: 12, fontWeight: 'bold', color: '#FFF' },
  logoutButton: { paddingHorizontal: 10, paddingVertical: 6, backgroundColor: '#D32F2F', borderRadius: 6 },
  logoutText: { fontSize: 12, fontWeight: 'bold', color: '#FFF' },
});