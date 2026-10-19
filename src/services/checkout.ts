import { getRequest, postRequest } from "../utils/api";

export interface AddressDetails {
  name: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phone: string;
}

export interface CheckoutResponse {
  success: boolean;
  order: {
    id: string;
    orderNumber: string;
    grandTotal: number;
    subtotal: number;
    discountAmount: number;
    orderStatus: string;
    items: any[];
    shippingAddress: AddressDetails;
    createdAt?: string;
  };
  whatsappNumber: string;
  whatsappUrl: string;
  messageText: string;
}

export const createCheckoutOrderApi = async (shippingAddress: AddressDetails): Promise<CheckoutResponse> => {
  return await postRequest("/checkout/create-order", { shippingAddress });
};

export const getMyOrdersApi = async (): Promise<any> => {
  return await getRequest("/orders/my-orders");
};

export const getOrderDetailsApi = async (id: string): Promise<any> => {
  return await getRequest(`/orders/${id}`);
};
