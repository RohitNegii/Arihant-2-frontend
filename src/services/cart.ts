import { getRequest, postRequest, putRequest, deleteRequest } from "../utils/api";
import { VariantData } from "./productListing";

export interface CartProduct {
  _id: string;
  name: string;
  price: number;
  stock: number;
  images: string[];
  thumbnail: string;
  slug: string;
  sku: string;
  status: "Draft" | "Published";
  isDeleted: boolean;
  sizes?: string[];
  allowCustomSize?: boolean;
  hasVariants?: boolean;
  variants?: VariantData[];
}

export interface CartItem {
  product: CartProduct;
  quantity: number;
  size?: string;
  variant?: string;
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
export const addToCartApi = async (productId: string, quantity: number, size?: string, variant?: string): Promise<CartResponse> => {
  return postRequest<CartResponse>("/cart", { productId, quantity, size, variant });
};

// Update cart item quantity directly
export const updateCartQuantityApi = async (productId: string, quantity: number, size?: string, variant?: string): Promise<CartResponse> => {
  return putRequest<CartResponse>("/cart/quantity", { productId, quantity, size, variant });
};

// Remove item from cart
export const removeFromCartApi = async (productId: string, size?: string, variant?: string): Promise<CartResponse> => {
  const queryParams = [];
  if (size) queryParams.push(`size=${encodeURIComponent(size)}`);
  if (variant) queryParams.push(`variant=${encodeURIComponent(variant)}`);
  const queryString = queryParams.length > 0 ? `?${queryParams.join("&")}` : "";
  return deleteRequest<CartResponse>(`/cart/${productId}${queryString}`);
};
