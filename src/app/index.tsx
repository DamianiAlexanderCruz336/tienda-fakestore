import NetInfo from '@react-native-community/netinfo';
import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { Component } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';

// POO: La pantalla ahora es un Objeto que hereda de React.Component
export default class LoginScreen extends Component {
  
  // POO: Constructor para inicializar y encapsular el estado del objeto
  constructor(props: any) {
    super(props);
    this.state = {
      username: '',
      password: '',
      loading: false,
      errorMensaje: '',
      usuarioLogueado: null,
      rolAsignado: ''
    };
  }

  // POO: Método de clase (comportamiento del objeto)
  manejarLogin = async () => {
    this.setState({ errorMensaje: '' });
    const { username, password } = this.state as any;

    if (Platform.OS !== 'web') {
      const state = await NetInfo.fetch();
      if (!state.isConnected) {
        Alert.alert("Sin conexión", "Por favor revisa tu internet e intenta de nuevo.");
        return;
      }
    }

    if (!username || !password) {
      this.setState({ errorMensaje: "Por favor llena todos los campos." });
      return;
    }

    this.setState({ loading: true });

    try {
      const usuariosRespuesta = await axios.get('https://fakestoreapi.com/users');
      const usuarios = usuariosRespuesta.data;
      
      const usuarioEncontrado = usuarios.find(
        (u: any) => u.username === username && u.password === password
      );
      
      if (!usuarioEncontrado) {
        this.setState({ errorMensaje: "Usuario o contraseña incorrectos", loading: false });
        return;
      }

      const id = usuarioEncontrado.id;
      let rol = 'Usuario';
      
      if (id === 1 || id === 2) {
        rol = 'Administrador';
      } else if (id === 3) {
        rol = 'Auditor';
      } else if (id >= 4) {
        rol = 'Usuario';
      }

      const dummyToken = `token_generado_para_id_${id}`;
      if (Platform.OS === 'web') {
        localStorage.setItem('userToken', dummyToken);
        localStorage.setItem('userRole', rol);
      } else {
        await SecureStore.setItemAsync('userToken', dummyToken);
        await SecureStore.setItemAsync('userRole', rol);
      }
      
      // POO: Actualización del estado interno del objeto
      this.setState({
        rolAsignado: rol,
        usuarioLogueado: usuarioEncontrado
      });

    } catch (error: any) {
      this.setState({ errorMensaje: "Error al conectar con la base de datos" });
    } finally {
      this.setState({ loading: false });
    }
  };

  // POO: Método de clase para limpiar la sesión
  cerrarSesion = async () => {
    if (Platform.OS === 'web') {
      localStorage.removeItem('userToken');
      localStorage.removeItem('userRole');
    } else {
      await SecureStore.deleteItemAsync('userToken');
      await SecureStore.deleteItemAsync('userRole');
    }
    
    this.setState({
      usuarioLogueado: null,
      username: '',
      password: ''
    });
  };

  // POO: Método render() obligatorio en clases para dibujar la interfaz
  render() {
    // Desestructuramos el estado encapsulado para usarlo en la vista
    const { username, password, loading, errorMensaje, usuarioLogueado, rolAsignado } = this.state as any;

    if (usuarioLogueado) {
      let badgeColor = '#1E40AF';
      let textColor = '#93C5FD';

      if (rolAsignado === 'Administrador') {
        badgeColor = '#7F1D1D';
        textColor = '#FCA5A5';
      } else if (rolAsignado === 'Auditor') {
        badgeColor = '#9A3412';
        textColor = '#FDBA74';
      }

      return (
        <ScrollView contentContainerStyle={styles.dashboardContainer}>
          <View style={styles.cardDashboard}>
            
            <View style={[styles.badgeRol, { backgroundColor: badgeColor }]}>
              <Text style={[styles.textoBadge, { color: textColor }]}>{rolAsignado}</Text>
            </View>
            
            <Text style={styles.dashTitulo}>
              ¡Bienvenido, {usuarioLogueado.name.firstname}!
            </Text>
            <Text style={styles.dashSub}>Panel de información de cuenta</Text>

            <View style={styles.seccionDatos}>
              <Text style={styles.etiquetaDato}>ID de Usuario:</Text>
              <Text style={styles.valorDato}>{usuarioLogueado.id}</Text>

              <Text style={styles.etiquetaDato}>Nombre Completo:</Text>
              <Text style={[styles.valorDato, {textTransform: 'capitalize', color: '#F3F4F6', fontSize: 15, marginBottom: 8, fontWeight: '500'}]}>
                {usuarioLogueado.name.firstname} {usuarioLogueado.name.lastname}
              </Text>

              <Text style={styles.etiquetaDato}>Usuario (Username):</Text>
              <Text style={styles.valorDato}>{usuarioLogueado.username}</Text>

              <Text style={styles.etiquetaDato}>Correo Electrónico:</Text>
              <Text style={styles.valorDato}>{usuarioLogueado.email}</Text>

              <Text style={styles.etiquetaDato}>Teléfono:</Text>
              <Text style={styles.valorDato}>{usuarioLogueado.phone}</Text>

              <Text style={styles.etiquetaDato}>Dirección:</Text>
              <Text style={[styles.valorDato, {textTransform: 'capitalize', color: '#F3F4F6', fontSize: 15, marginBottom: 4, fontWeight: '500'}]}>
                {usuarioLogueado.address.street} {usuarioLogueado.address.number}, {usuarioLogueado.address.city}
              </Text>
            </View>

            {/* Invocamos el método del objeto usando this */}
            <TouchableOpacity style={styles.botonSalir} onPress={this.cerrarSesion} activeOpacity={0.8}>
              <Text style={styles.textoBotonSalir}>Cerrar Sesión / Salir</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      );
    }

    return (
      <KeyboardAvoidingView 
        style={styles.container} 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <StatusBar barStyle="light-content" />

        <View style={styles.card}>
          <View style={styles.headerContainer}>
            <View style={styles.logoBadge}>
              <Text style={styles.logoText}>CA</Text>
            </View>
            <Text style={styles.titulo}>Choster App</Text>
            <Text style={styles.subtitulo}>Inicia sesión para continuar</Text>
          </View>
          
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Usuario</Text>
            <TextInput
              style={styles.input}
              placeholder="Usuario"
              placeholderTextColor="#94A3B8" 
              value={username}
              onChangeText={(text) => this.setState({ username: text })}
              autoCapitalize="none"
            />
          </View>
          
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Contraseña</Text>
            <TextInput
              style={styles.input}
              placeholder="Contraseña"
              placeholderTextColor="#94A3B8"
              value={password}
              onChangeText={(text) => this.setState({ password: text })}
              secureTextEntry
            />
          </View>

          {errorMensaje !== '' && (
            <View style={styles.alertaRoja}>
              <Text style={styles.textoAlerta}>{errorMensaje}</Text>
            </View>
          )}

          <TouchableOpacity 
            style={styles.boton} 
            onPress={this.manejarLogin}
            disabled={loading}
            activeOpacity={0.8}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.textoBoton}>Acceder</Text>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    );
  }
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20, backgroundColor: '#090D16' },
  card: { width: '100%', maxWidth: 400, backgroundColor: '#111827', borderRadius: 24, padding: 28, borderWidth: 1, borderColor: '#1F2937', shadowColor: '#000', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.5, shadowRadius: 20, elevation: 10 },
  headerContainer: { alignItems: 'center', marginBottom: 30 },
  logoBadge: { width: 56, height: 56, borderRadius: 16, backgroundColor: '#3B82F6', justifyContent: 'center', alignItems: 'center', marginBottom: 16 },
  logoText: { color: '#FFF', fontSize: 20, fontWeight: '900', letterSpacing: 1 },
  titulo: { fontSize: 26, fontWeight: '800', color: '#F9FAFB', marginBottom: 6 },
  subtitulo: { fontSize: 14, color: '#9CA3AF' },
  inputContainer: { marginBottom: 16 },
  label: { color: '#D1D5DB', fontSize: 13, fontWeight: '600', marginBottom: 8, marginLeft: 4 },
  input: { backgroundColor: '#1F2937', color: '#F9FAFC', paddingHorizontal: 16, paddingVertical: 14, borderRadius: 12, fontSize: 15, borderWidth: 1, borderColor: '#374151' },
  boton: { backgroundColor: '#2563EB', paddingVertical: 16, borderRadius: 12, alignItems: 'center', marginTop: 10 },
  textoBoton: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
  alertaRoja: { backgroundColor: 'rgba(239, 68, 68, 0.15)', padding: 12, borderRadius: 10, borderWidth: 1, borderColor: 'rgba(239, 68, 68, 0.4)', marginBottom: 16 },
  textoAlerta: { color: '#FCA5A5', fontWeight: '600', fontSize: 13, textAlign: 'center' },
  
  // Dashboard Estilos
  dashboardContainer: { flexGrow: 1, justifyContent: 'center', padding: 20, backgroundColor: '#090D16' },
  cardDashboard: { backgroundColor: '#111827', borderRadius: 24, padding: 24, borderWidth: 1, borderColor: '#1F2937', maxWidth: 450, alignSelf: 'center', width: '100%' },
  badgeRol: { alignSelf: 'flex-start', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, marginBottom: 12 },
  textoBadge: { fontWeight: 'bold', fontSize: 12, textTransform: 'uppercase' },
  dashTitulo: { fontSize: 22, fontWeight: 'bold', color: '#F9FAFB', marginBottom: 4, textTransform: 'capitalize' },
  dashSub: { fontSize: 14, color: '#9CA3AF', marginBottom: 20 },
  seccionDatos: { backgroundColor: '#1F2937', borderRadius: 16, padding: 16, marginBottom: 24, borderWidth: 1, borderColor: '#374151' },
  etiquetaDato: { color: '#9CA3AF', fontSize: 12, fontWeight: '600', marginTop: 8 },
  valorDato: { color: '#9CA3AF', fontSize: 15, fontWeight: '400', marginBottom: 8 },
  botonSalir: { backgroundColor: '#DC2626', paddingVertical: 14, borderRadius: 12, alignItems: 'center' },
  textoBotonSalir: { color: '#FFFFFF', fontWeight: 'bold', fontSize: 15 }
});