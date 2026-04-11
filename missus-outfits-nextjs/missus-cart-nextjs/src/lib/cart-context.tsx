"use client";

import {
  createContext,
  useContext,
  useReducer,
  useCallback,
  ReactNode,
} from "react";
import type { CartItem, CartState } from "@/types/cart";

// ─── Actions ────────────────────────────────────────────────────────────────

type Action =
  | { type: "ADD_ITEM"; item: CartItem }
  | { type: "REMOVE_ITEM"; id: string }
  | { type: "UPDATE_QTY"; id: string; quantity: number }
  | { type: "APPLY_PROMO"; code: string; discount: number }
  | { type: "REMOVE_PROMO" };

// ─── Reducer ─────────────────────────────────────────────────────────────────

const initialState: CartState = {
  items: [
    {
      id: "1",
      name: "Lorraine Pant Set",
      slug: "lorraine-pant-set",
      price: 59000,
      size: "L",
      color: "Black",
      colorHex: "#1a1a1a",
      quantity: 1,
      bgColor: "#f0e8e4",
    } as CartItem & { bgColor: string },
    {
      id: "2",
      name: "Maybelline Bubble Mini Dress",
      slug: "maybelline-bubble-mini-dress",
      price: 43000,
      originalPrice: 55000,
      size: "S",
      color: "Pink",
      colorHex: "#f4a7b9",
      quantity: 1,
      badge: "SALE",
      bgColor: "#f4e8ec",
    } as CartItem & { bgColor: string },
    {
      id: "3",
      name: "Robin Halter Top",
      slug: "robin-halter-top",
      price: 22000,
      size: "M",
      color: "Olive",
      colorHex: "#6b8e5e",
      quantity: 2,
      badge: "NEW",
      bgColor: "#e8f0e4",
    } as CartItem & { bgColor: string },
  ],
  promoCode: null,
  promoDiscount: 0,
};

function cartReducer(state: CartState, action: Action): CartState {
  switch (action.type) {
    case "ADD_ITEM": {
      const existing = state.items.find((i) => i.id === action.item.id);
      if (existing) {
        return {
          ...state,
          items: state.items.map((i) =>
            i.id === action.item.id
              ? { ...i, quantity: i.quantity + 1 }
              : i
          ),
        };
      }
      return { ...state, items: [...state.items, action.item] };
    }
    case "REMOVE_ITEM":
      return {
        ...state,
        items: state.items.filter((i) => i.id !== action.id),
      };
    case "UPDATE_QTY":
      return {
        ...state,
        items: state.items.map((i) =>
          i.id === action.id
            ? { ...i, quantity: Math.max(1, Math.min(10, action.quantity)) }
            : i
        ),
      };
    case "APPLY_PROMO":
      return { ...state, promoCode: action.code, promoDiscount: action.discount };
    case "REMOVE_PROMO":
      return { ...state, promoCode: null, promoDiscount: 0 };
    default:
      return state;
  }
}

// ─── Context ─────────────────────────────────────────────────────────────────

interface CartContextValue {
  state: CartState;
  removeItem: (id: string) => void;
  updateQty: (id: string, quantity: number) => void;
  applyPromo: (code: string) => void;
  removePromo: () => void;
  subtotal: number;
  discount: number;
  total: number;
  itemCount: number;
  freeShippingThreshold: number;
  freeShippingRemaining: number;
  freeShippingProgress: number;
}

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(cartReducer, initialState);

  const FREE_SHIPPING_THRESHOLD = 150000;

  const subtotal = state.items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
  const discount = state.items.reduce((sum, item) => {
    if (item.originalPrice) {
      return sum + (item.originalPrice - item.price) * item.quantity;
    }
    return sum;
  }, 0) + state.promoDiscount;

  const total = subtotal - state.promoDiscount;
  const itemCount = state.items.reduce((sum, item) => sum + item.quantity, 0);
  const freeShippingRemaining = Math.max(0, FREE_SHIPPING_THRESHOLD - total);
  const freeShippingProgress = Math.min(
    100,
    (total / FREE_SHIPPING_THRESHOLD) * 100
  );

  const removeItem = useCallback(
    (id: string) => dispatch({ type: "REMOVE_ITEM", id }),
    []
  );
  const updateQty = useCallback(
    (id: string, quantity: number) =>
      dispatch({ type: "UPDATE_QTY", id, quantity }),
    []
  );
  const applyPromo = useCallback((code: string) => {
    // Demo: code "MISSUS10" gives 10% off
    if (code.toUpperCase() === "MISSUS10") {
      dispatch({
        type: "APPLY_PROMO",
        code: code.toUpperCase(),
        discount: Math.round(subtotal * 0.1),
      });
    }
  }, [subtotal]);
  const removePromo = useCallback(
    () => dispatch({ type: "REMOVE_PROMO" }),
    []
  );

  return (
    <CartContext.Provider
      value={{
        state,
        removeItem,
        updateQty,
        applyPromo,
        removePromo,
        subtotal,
        discount,
        total,
        itemCount,
        freeShippingThreshold: FREE_SHIPPING_THRESHOLD,
        freeShippingRemaining,
        freeShippingProgress,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside CartProvider");
  return ctx;
}
