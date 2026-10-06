import axios from 'axios';
import { Product } from '../models/Product';

export class ApiService {
  private static BASE_URL = 'https://fakestoreapi.com';

  public static async getProducts(): Promise<Product[]> {
    const response = await axios.get(`${this.BASE_URL}/products`);
    return response.data.map((item: any) => new Product(item));
  }

  public static async getCategories(): Promise<string[]> {
    const response = await axios.get(`${this.BASE_URL}/products/categories`);
    return response.data;
  }

  public static async getProductsByCategory(category: string): Promise<Product[]> {
    const response = await axios.get(`${this.BASE_URL}/products/category/${encodeURIComponent(category)}`);
    return response.data.map((item: any) => new Product(item));
  }

  public static async getProductById(id: number): Promise<Product> {
    const response = await axios.get(`${this.BASE_URL}/products/${id}`);
    return new Product(response.data);
  }

  // --- NUEVOS MÉTODOS PARA US06, US07 Y US08 ---

  public static async createProduct(data: Partial<Product>): Promise<any> {
    const response = await axios.post(`${this.BASE_URL}/products`, data);
    return response.data;
  }

  public static async updateProduct(id: number, data: Partial<Product>): Promise<any> {
    const response = await axios.put(`${this.BASE_URL}/products/${id}`, data);
    return response.data;
  }

  public static async deleteProduct(id: number): Promise<any> {
    const response = await axios.delete(`${this.BASE_URL}/products/${id}`);
    return response.data;
  }
}