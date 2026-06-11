import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface CartItem {
  ticket_category_id: string;
  match_id: string;
  category_name: string;
  home_team: string;
  away_team: string;
  match_date: string;
  stadium: string;
  price: number;
  quantity: number;
  section: string;
}

interface CartState {
  items: CartItem[];
  addItem: (item: Omit<CartItem, 'quantity'>) => void;
  removeItem: (ticket_category_id: string) => void;
  updateQuantity: (ticket_category_id: string, quantity: number) => void;
  clearCart: () => void;
  total: () => number;
  totalItems: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (newItem) => {
        const existing = get().items.find(i => i.ticket_category_id === newItem.ticket_category_id);
        if (existing) {
          set({ items: get().items.map(i => i.ticket_category_id === newItem.ticket_category_id ? { ...i, quantity: i.quantity + 1 } : i) });
        } else {
          set({ items: [...get().items, { ...newItem, quantity: 1 }] });
        }
      },
      removeItem: (id) => set({ items: get().items.filter(i => i.ticket_category_id !== id) }),
      updateQuantity: (id, qty) => {
        if (qty <= 0) get().removeItem(id);
        else set({ items: get().items.map(i => i.ticket_category_id === id ? { ...i, quantity: qty } : i) });
      },
      clearCart: () => set({ items: [] }),
      total: () => get().items.reduce((sum, i) => sum + i.price * i.quantity, 0),
      totalItems: () => get().items.reduce((sum, i) => sum + i.quantity, 0),
    }),
    { name: 'cart-storage' }
  )
);
