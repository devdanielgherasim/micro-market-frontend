import { apiService } from './api';

// Types
export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  imageUrl?: string;
  available: boolean;
}

export interface Order {
  id: string;
  userId: string;
  items: OrderItem[];
  totalAmount: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  createdAt: string;
  updatedAt: string;
}

export interface OrderItem {
  productId: string;
  productName: string;
  quantity: number;
  pricePerUnit: number;
}

// Product service
export const productService = {
  getProducts: () => {
    return apiService.get<Product[]>('/products');
  },
  getProduct: (id: string) => {
    return apiService.get<Product>(`/products/${id}`);
  },
  createProduct: (product: Omit<Product, 'id'>) => {
    return apiService.post<Product>('/products', product);
  },
  updateProduct: (id: string, product: Partial<Product>) => {
    return apiService.put<Product>(`/products/${id}`, product);
  },
  deleteProduct: (id: string) => {
    return apiService.delete<void>(`/products/${id}`);
  }
};

// Order service
export const orderService = {
  getOrders: () => {
    return apiService.get<Order[]>('/orders');
  },
  getOrder: (id: string) => {
    return apiService.get<Order>(`/orders/${id}`);
  },
  createOrder: (order: Omit<Order, 'id' | 'createdAt' | 'updatedAt'>) => {
    return apiService.post<Order>('/orders', order);
  },
  updateOrderStatus: (id: string, status: Order['status']) => {
    return apiService.patch<Order>(`/orders/${id}`, { status });
  },
  cancelOrder: (id: string) => {
    return apiService.patch<Order>(`/orders/${id}`, { status: 'cancelled' });
  }
};

// User profile service
export const userService = {
  getProfile: () => {
    return apiService.get<any>('/users/profile');
  },
  updateProfile: (profile: any) => {
    return apiService.put<any>('/users/profile', profile);
  }
};
