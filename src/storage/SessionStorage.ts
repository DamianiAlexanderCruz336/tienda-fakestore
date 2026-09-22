import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

export class SessionStorage {
  private static ROLE_KEY = 'user_role';

  public static async guardarRol(rol: string): Promise<void> {
    if (Platform.OS === 'web') {
      localStorage.setItem(this.ROLE_KEY, rol);
    } else {
      await SecureStore.setItemAsync(this.ROLE_KEY, rol);
    }
  }

  public static async obtenerRol(): Promise<string | null> {
    if (Platform.OS === 'web') {
      return localStorage.getItem(this.ROLE_KEY);
    } else {
      return await SecureStore.getItemAsync(this.ROLE_KEY);
    }
  }

  public static async cerrarSesion(): Promise<void> {
    if (Platform.OS === 'web') {
      localStorage.removeItem(this.ROLE_KEY);
    } else {
      await SecureStore.deleteItemAsync(this.ROLE_KEY);
    }
  }
}