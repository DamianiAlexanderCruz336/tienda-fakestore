import axios from 'axios';
import { Product } from '../models/Product';

export class ApiService {
  private static BASE_URL = 'https://fakestoreapi.com';

  // US03: Obtener catálogo general
  public static async getProducts(): Promise<Product[]> {
    const response = await axios.get(`${this.BASE_URL}/products`);
    return response.data.map((item: any) => new Product(item));
  }

  // US04: Obtener categorías disponibles
  public static async getCategories(): Promise<string[]> {
    const response = await axios.get(`${this.BASE_URL}/products/categories`);
    return response.data;
  }

  // US04: Filtrar productos por categoría
  public static async getProductsByCategory(category: string): Promise<Product[]> {
    const response = await axios.get(
      `${this.BASE_URL}/products/category/${encodeURIComponent(category)}`
    );
    return response.data.map((item: any) => new Product(item));
  }

  // US05: Obtener detalle de un producto por ID
  public static async getProductById(id: number): Promise<Product> {
    const response = await axios.get(`${this.BASE_URL}/products/${id}`);
    return new Product(response.data);
  }
}