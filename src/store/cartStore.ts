import { create } from "zustand";
import {
  CartItem,
  fetchCartApi,
  addToCartApi,
  updateCartQuantityApi,
  removeFromCartApi,
} from "../services/cart";
import { useAuthStore } from "./authStore";

interface CartState {
  cartItems: CartItem[];
  isLoading: boolean;
  error: string | null;
  isCartOpen: boolean;
  cartCount: number;
  cartTotal: number;
}

interface CartActions {
  fetchCart: () => Promise<void>;
  addToCart: (productId: string, quantity: number) => Promise<boolean>;
  updateCartQuantity: (productId: string, quantity: number) => Promise<boolean>;
  removeFromCart: (productId: string) => Promise<boolean>;
  setCartOpen: (open: boolean) => void;
  clearCart: () => void;
}

export type CartStore = CartState & CartActions;

const calculateTotals = (items: CartItem[]) => {
  const cartCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const cartTotal = items.reduce(
    (sum, item) => sum + (item.product?.price || 0) * item.quantity,
    0
  );
  return { cartCount, cartTotal };
};

export const useCartStore = create<CartStore>((set, get) => ({
  cartItems: [],
  isLoading: false,
  error: null,
  isCartOpen: false,
  cartCount: 0,
  cartTotal: 0,

  setCartOpen: (open) => {
    set({ isCartOpen: open });
  },

  clearCart: () => {
    set({
      cartItems: [],
      cartCount: 0,
      cartTotal: 0,
      error: null,
    });
  },

  fetchCart: async () => {
    const isAuthenticated = useAuthStore.getState().isAuthenticated;
    if (!isAuthenticated) {
      get().clearCart();
      return;
    }

    set({ isLoading: true, error: null });
    try {
      const res = await fetchCartApi();
      if (res.success) {
        const items = res.items || [];
        set({
          cartItems: items,
          ...calculateTotals(items),
        });
      } else {
        set({ error: res.message || "Failed to load cart" });
      }
    } catch (err: any) {
      console.error("Fetch cart error:", err);
      set({
        error: err.response?.data?.message || err.message || "An error occurred while loading your cart",
      });
    } finally {
      set({ isLoading: false });
    }
  },

  addToCart: async (productId, quantity) => {
    const isAuthenticated = useAuthStore.getState().isAuthenticated;
    if (!isAuthenticated) return false;

    set({ isLoading: true, error: null });
    try {
      const res = await addToCartApi(productId, quantity);
      if (res.success) {
        const items = res.items || [];
        set({
          cartItems: items,
          ...calculateTotals(items),
        });
        return true;
      } else {
        set({ error: res.message || "Failed to add item to cart" });
        return false;
      }
    } catch (err: any) {
      console.error("Add to cart error:", err);
      set({
        error: err.response?.data?.message || err.message || "Could not add item to bag. Please try again.",
      });
      return false;
    } finally {
      set({ isLoading: false });
    }
  },

  updateCartQuantity: async (productId, quantity) => {
    const isAuthenticated = useAuthStore.getState().isAuthenticated;
    if (!isAuthenticated) return false;

    set({ isLoading: true, error: null });
    try {
      const res = await updateCartQuantityApi(productId, quantity);
      if (res.success) {
        const items = res.items || [];
        set({
          cartItems: items,
          ...calculateTotals(items),
        });
        return true;
      } else {
        set({ error: res.message || "Failed to update item quantity" });
        return false;
      }
    } catch (err: any) {
      console.error("Update cart quantity error:", err);
      set({
        error: err.response?.data?.message || err.message || "Could not update quantity. Please try again.",
      });
      return false;
    } finally {
      set({ isLoading: false });
    }
  },

  removeFromCart: async (productId) => {
    const isAuthenticated = useAuthStore.getState().isAuthenticated;
    if (!isAuthenticated) return false;

    set({ isLoading: true, error: null });
    try {
      const res = await removeFromCartApi(productId);
      if (res.success) {
        const items = res.items || [];
        set({
          cartItems: items,
          ...calculateTotals(items),
        });
        return true;
      } else {
        set({ error: res.message || "Failed to remove item from cart" });
        return false;
      }
    } catch (err: any) {
      console.error("Remove from cart error:", err);
      set({
        error: err.response?.data?.message || err.message || "Could not remove item from bag. Please try again.",
      });
      return false;
    } finally {
      set({ isLoading: false });
    }
  },
}));

// Subscribe to auth changes to fetch or clear cart automatically
if (typeof window !== "undefined") {
  let prevToken = useAuthStore.getState().token;
  useAuthStore.subscribe((state) => {
    const currentToken = state.token;
    if (currentToken !== prevToken) {
      prevToken = currentToken;
      if (currentToken) {
        useCartStore.getState().fetchCart();
      } else {
        useCartStore.getState().clearCart();
      }
    }
  });
}
