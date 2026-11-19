export interface Category { _id: string; name: string; slug: string; image: string; }
export interface Brand { _id: string; name: string; slug: string; image: string; }
export interface SubCategory { _id: string; name: string; slug: string; category: string; }

export interface Product {
  _id: string;
  id: string;
  title: string;
  slug: string;
  description: string;
  quantity: number;
  sold: number;
  price: number;
  priceAfterDiscount?: number;
  imageCover: string;
  images: string[];
  category: Category;
  brand: Brand;
  subcategory: SubCategory[];
  ratingsAverage: number;
  ratingsQuantity: number;
}

export interface Metadata { currentPage: number; numberOfPages: number; limit: number; nextPage?: number; prevPage?: number; }
export interface ListResponse<T> { results: number; metadata: Metadata; data: T[]; }

export interface Review { _id: string; review: string; rating: number; user: { _id: string; name: string }; createdAt: string; }

export interface CartItem { _id: string; count: number; price: number; product: Product; }
export interface CartResponse {
  status: string;
  numOfCartItems: number;
  cartId: string;
  data: { _id: string; cartOwner: string; products: CartItem[]; totalCartPrice: number };
}

export interface ShippingAddress { details: string; phone: string; city: string; }

export interface Order {
  _id: string;
  id: number;
  shippingAddress?: ShippingAddress;
  taxPrice: number;
  shippingPrice: number;
  totalOrderPrice: number;
  paymentMethodType: 'cash' | 'card';
  isPaid: boolean;
  isDelivered: boolean;
  createdAt: string;
  cartItems: { _id: string; count: number; price: number; product: Product }[];
}

export interface Address { _id: string; name: string; details: string; phone: string; city: string; }

export interface AuthUser { id: string; name: string; role: string; email?: string; }
export interface AuthResponse { message: string; token: string; user: { name: string; email: string; role: string }; }
