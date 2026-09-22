export class Product {
  id: number;
  title: string;
  price: number;
  description: string;
  category: string;
  image: string;

  constructor(data: any) {
    this.id = data.id;
    this.title = data.title;
    this.price = Number(data.price);
    this.description = data.description;
    this.category = data.category;
    this.image = data.image;
  }

  // Getter formateador de precio
  get precioFormateado(): string {
    return `$${this.price.toFixed(2)}`;
  }
}