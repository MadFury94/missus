"use client";

import {
  createContext,
  useContext,
  useReducer,
  useCallback,
  ReactNode,
} from "react";

export interface WishlistItem {
  id: string;
  name: string;
  slug: string;
  price: number;
  originalPrice?: number;
  color: string;
  colorHex: string;
  size?: string;
  bgColor: string;
  badge?: "NEW" | "SALE" | "DEAL";
  inStock: boolean;
  addedAt: string; // ISO date string
}

interface WishlistState {
  items: WishlistItem[];
}

type Action =
  | { type: "ADD_ITEM"; item: WishlistItem }
  | { type: "REMOVE_ITEM"; id: string }
  | { type: "CLEAR" };

const DEMO_ITEMS: WishlistItem[] = [
  {
    id: "w1",
    name: "Maybelline Bubble Mini Dress",
    slug: "maybelline-bubble-mini-dress",
    price: 43000,
    originalPrice: 55000,
    color: "Pink",
    colorHex: "#f4a7b9",
    bgColor: "#fce8ec",
    badge: "SALE",
    inStock: true,
    addedAt: "2026-04-08T10:00:00Z",
  },
  {
    id: "w2",
    name: "Stella Satin Wrap Maxi Dress",
    slug: "stella-satin-wrap-dress",
    price: 48000,
    color: "Blush",
    colorHex: "#c8a4a4",
    bgColor: "#f4ecec",
    badge: "NEW",
    inStock: true,
    addedAt: "2026-04-07T14:30:00Z",
  },
  {
    id: "w3",
    name: "Zara Crochet Co-ord Set",
    slug: "zara-crochet-coord-set",
    price: 65000,
    color: "Cream",
    colorHex: "#f5f0e8",
    bgColor: "#f8f4ec",
    inStock: false,
    addedAt: "2026-04-06T09:15:00Z",
  },
  {
    id: "w4",
    name: "Gemma Pinstripe Top",
    slug: "gemma-pinstripe-top",
    price: 35000,
    color: "Black",
    colorHex: "#1a1a1a",
    bgColor: "#f0ece8",
    badge: "NEW",
    inStock: true,
    addedAt: "2026-04-05T16:00:00Z",
  },
];

const initialState: WishlistState = { items: DEMO_ITEMS };

function reducer(state: WishlistState, action: Action): WishlistState {
  switch (action.type) {
    case "ADD_ITEM":
      if (state.items.find((i) => i.id === action.item.id)) return state;
      return { items: [action.item, ...state.items] };
    case "REMOVE_ITEM":
      return { items: state.items.filter((i) => i.id !== action.id) };
    case "CLEAR":
      return { items: [] };
    default:
      return state;
  }
}

interface WishlistContextValue {
  state: WishlistState;
  addItem: (item: WishlistItem) => void;
  removeItem: (id: string) => void;
  clear: () => void;
  count: number;
}

const WishlistContext = createContext<WishlistContextValue | null>(null);

export function WishlistProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  const addItem = useCallback(
    (item: WishlistItem) => dispatch({ type: "ADD_ITEM", item }),
    []
  );
  const removeItem = useCallback(
    (id: string) => dispatch({ type: "REMOVE_ITEM", id }),
    []
  );
  const clear = useCallback(() => dispatch({ type: "CLEAR" }), []);

  return (
    <WishlistContext.Provider
      value={{ state, addItem, removeItem, clear, count: state.items.length }}
    >
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const ctx = useContext(WishlistContext);
  if (!ctx) throw new Error("useWishlist must be used inside WishlistProvider");
  return ctx;
}
