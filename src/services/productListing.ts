import { getRequest } from "../utils/api";

export interface ReviewData {
  _id?: string;
  user: string;
  name: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export interface VariantData {
  name: string;
  price: number;
  stock: number;
  sku?: string;
}

export interface ProductData {
  _id: string;
  name: string;
  slug: string;
  sku: string;
  description: string;
  shortDescription: string;
  category: {
    _id: string;
    name: string;
    slug: string;
  };
  material: string;
  purity: string;
  weight: number;
  dimensions?: string;
  gender: "Men" | "Women" | "Unisex";
  occasion?: string;
  price?: number;
  stock?: number;
  status: "Draft" | "Published";
  isFeatured: boolean;
  isTrending: boolean;
  isBestSeller: boolean;
  images: string[];
  thumbnail: string;
  sizes?: string[];
  allowCustomSize?: boolean;
  hasVariants?: boolean;
  variants?: VariantData[];
  reviews?: ReviewData[];
  createdAt: string;
}

export interface CategoryData {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
}

export interface FetchProductsResponse {
  success: boolean;
  page: number;
  pages: number;
  count: number;
  products: ProductData[];
}

export const fetchProducts = async (params: Record<string, any> = {}): Promise<FetchProductsResponse> => {
  const queryParams = new URLSearchParams();
  Object.entries(params).forEach(([key, val]) => {
    if (val !== undefined && val !== null && val !== "") {
      queryParams.append(key, String(val));
    }
  });

  return getRequest<FetchProductsResponse>(`/products?${queryParams.toString()}`);
};

export const fetchCategories = async (): Promise<{ success: boolean; count: number; categories: CategoryData[] }> => {
  return getRequest<{ success: boolean; count: number; categories: CategoryData[] }>("/categories");
};
