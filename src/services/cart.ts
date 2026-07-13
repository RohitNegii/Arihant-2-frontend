import { getRequest, postRequest, putRequest, deleteRequest } from "../utils/api";

export interface CartProduct {
  _id: string;
  name: string;
  price: number;
  stock: number;
  images: string[];
  thumbnail: string;
  slug: string;
  sku: string;
  status: "Draft" | "Published" | "Hidden";
  isDeleted: boolean;
}

export interface CartItem {
  product: CartProduct;
  quantity: number;
  _id?: string;
}

export interface CartResponse {
  success: boolean;
  items: CartItem[];
  message?: string;
}

// Fetch user's cart
export const fetchCartApi = async (): Promise<CartResponse> => {
  return getRequest<CartResponse>("/cart");
};

// Add item to cart
export const addToCartApi = async (productId: string, quantity: number): Promise<CartResponse> => {
  return postRequest<CartResponse>("/cart", { productId, quantity });
};

// Update cart item quantity directly
export const updateCartQuantityApi = async (productId: string, quantity: number): Promise<CartResponse> => {
  return putRequest<CartResponse>("/cart/quantity", { productId, quantity });
};

// Remove item from cart
export const removeFromCartApi = async (productId: string): Promise<CartResponse> => {
  return deleteRequest<CartResponse>(`/cart/${productId}`);
};
