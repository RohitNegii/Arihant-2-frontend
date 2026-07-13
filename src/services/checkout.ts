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
    taxAmount: number;
    shippingAmount: number;
  };
  razorpayOrder: {
    id: string;
    amount: number;
    currency: string;
  };
  razorpayKeyId: string;
}

export interface VerifyPaymentPayload {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

export interface VerifyPaymentResponse {
  success: boolean;
  message: string;
  orderNumber: string;
  orderId: string;
}

export const createCheckoutOrderApi = async (shippingAddress: AddressDetails): Promise<CheckoutResponse> => {
  return await postRequest("/checkout/create-order", { shippingAddress });
};

export const verifyCheckoutPaymentApi = async (payload: VerifyPaymentPayload): Promise<VerifyPaymentResponse> => {
  return await postRequest("/checkout/verify-payment", payload);
};

export const getMyOrdersApi = async (): Promise<any> => {
  return await getRequest("/orders/my-orders");
};

export const getOrderDetailsApi = async (id: string): Promise<any> => {
  return await getRequest(`/orders/${id}`);
};
