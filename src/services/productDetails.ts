import { getRequest } from "../utils/api";
import { ProductData } from "./productListing";

export const fetchProductBySlug = async (slug: string): Promise<{ success: boolean; product: ProductData }> => {
  return getRequest<{ success: boolean; product: ProductData }>(`/products/${slug}`);
};

export const fetchRelatedProducts = async (id: string): Promise<{ success: boolean; products: ProductData[] }> => {
  return getRequest<{ success: boolean; products: ProductData[] }>(`/products/related/${id}`);
};
