import axios from "axios";
import { Component } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SessionStorage } from "../storage/SessionStorage";

interface Props {
  onLoginSuccess: (userRole: string, username: string) => void;
}

interface State {
  username: string;
  password: string;
  loading: boolean;
  error: boolean;
}

export class LoginScreen extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      username: "",
      password: "",
      loading: false,
      error: false,
    };
  }

  manejarLogin = async () => {
    const { username, password } = this.state;

    if (!username.trim() || !password.trim()) {
      this.setState({ error: true });
      return;
    }

    this.setState({ loading: true, error: false });

    try {
      const response = await axios.get("https://fakestoreapi.com/users");
      const usuarios = response.data;

      // Validación de usuario y contraseña exactos
      const usuarioEncontrado = usuarios.find(
        (u: any) =>
          u.username.toLowerCase() === username.trim().toLowerCase() &&
          u.password === password.trim(),
      );

      if (usuarioEncontrado) {
        const id = usuarioEncontrado.id;
        let rol = "Cliente";

        // Asignación de roles por ID de la API
        if (id === 1 || id === 2) {
          rol = "Administrador";
        } else if (id === 3) {
          rol = "Auditor";
        }

        await SessionStorage.guardarRol(rol);
        this.props.onLoginSuccess(rol, usuarioEncontrado.username);
      } else {
        this.setState({ error: true });
      }
    } catch (err) {
      this.setState({ error: true });
    } finally {
      this.setState({ loading: false });
    }
  };

  render() {
    const { username, password, loading, error } = this.state;

    return (
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.container}
      >
        <View style={styles.card}>
          {/* Logo "FS" */}
          <View style={styles.logoContainer}>
            <View style={styles.logoBadge}>
              <Text style={styles.logoText}>CS</Text>
            </View>
          </View>

          {/* Títulos */}
          <Text style={styles.title}>CHOSTER STORE</Text>
          <Text style={styles.subtitle}>Inicia sesión para continuar</Text>

          {/* Campo Usuario */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Usuario</Text>
            <TextInput
              style={styles.input}
              value={username}
              onChangeText={(text) =>
                this.setState({ username: text, error: false })
              }
              autoCapitalize="none"
              placeholderTextColor="#64748B"
            />
          </View>

          {/* Campo Contraseña */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Contraseña</Text>
            <TextInput
              style={styles.input}
              value={password}
              onChangeText={(text) =>
                this.setState({ password: text, error: false })
              }
              secureTextEntry
              autoCapitalize="none"
              placeholderTextColor="#64748B"
            />
          </View>

          {/* Alerta de Error */}
          {error && (
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>
                Usuario o contraseña incorrectos
              </Text>
            </View>
          )}

          {/* Botón de Acceso */}
          <TouchableOpacity
            style={styles.button}
            onPress={this.manejarLogin}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#FFF" />
            ) : (
              <Text style={styles.buttonText}>Acceder</Text>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#090D16",
    padding: 20,
  },
  card: {
    width: "100%",
    maxWidth: 380,
    backgroundColor: "#111827",
    padding: 28,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#1E293B",
  },
  logoContainer: {
    alignItems: "center",
    marginBottom: 16,
  },
  logoBadge: {
    width: 48,
    height: 48,
    backgroundColor: "#2563EB",
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  logoText: {
    color: "#FFFFFF",
    fontWeight: "bold",
    fontSize: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#FFFFFF",
    textAlign: "center",
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 14,
    color: "#94A3B8",
    textAlign: "center",
    marginBottom: 24,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    color: "#CBD5E1",
    fontSize: 13,
    fontWeight: "600",
    marginBottom: 8,
  },
  input: {
    backgroundColor: "#1E293B",
    borderWidth: 1,
    borderColor: "#334155",
    color: "#F8FAFC",
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 10,
    fontSize: 15,
  },
  errorBox: {
    backgroundColor: "#3B1219",
    borderWidth: 1,
    borderColor: "#7F1D1D",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 10,
    marginBottom: 16,
    alignItems: "center",
  },
  errorText: {
    color: "#FCA5A5",
    fontSize: 13,
    fontWeight: "500",
  },
  button: {
    backgroundColor: "#2563EB",
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 8,
  },
  buttonText: {
    color: "#FFFFFF",
    fontWeight: "bold",
    fontSize: 16,
  },
});
