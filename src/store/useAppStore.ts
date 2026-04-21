import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { Product, Ingredient, UserProfile } from '../types/menu'

export interface CartItem {
  id: string
  product: Product
  quantity: number
  selectedIngredients?: Ingredient[]
  payWithPoints: boolean
}

interface AlertConfig {
  isOpen: boolean
  title: string
  message: string
  onConfirm?: () => void
}

interface AppState {
  tableId: string | null
  isAgeVerified: boolean
  user: UserProfile | null
  isAuthLoading: boolean
  cart: CartItem[]
  activeConstructorProduct: Product | null
  referralCodeToApply: string | null
  theme: 'dark' | 'light'
  language: 'pl' | 'ua' | 'en'
  lastServiceCallTime: number | null
  alertConfig: AlertConfig
  
  setAuthLoading: (loading: boolean) => void
  setLastServiceCallTime: (time: number) => void
  setLanguage: (lang: 'pl' | 'ua' | 'en') => void
  setTheme: (theme: 'dark' | 'light') => void
  setTableId: (id: string | null) => void
  setUser: (user: UserProfile | null) => void
  verifyAge: () => void
  setActiveConstructorProduct: (product: Product | null) => void
  setReferralCodeToApply: (code: string | null) => void
  addToCart: (product: Product, ingredients?: Ingredient[], payWithPoints?: boolean) => void
  removeFromCart: (id: string) => void
  updateQuantity: (id: string, quantity: number) => void
  toggleItemPaymentMode: (id: string) => void
  clearCart: () => void
  
  showAlert: (title: string, message: string, onConfirm?: () => void) => void
  hideAlert: () => void
}

const getDefaultLanguage = (): 'pl' | 'ua' | 'en' => {
  if (typeof window === 'undefined') return 'pl'
  const browserLang = navigator.language.toLowerCase()
  if (browserLang.startsWith('uk') || browserLang.startsWith('ru')) return 'ua'
  if (browserLang.startsWith('en')) return 'en'
  return 'pl'
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      tableId: null,
      isAgeVerified: false,
      user: null,
      isAuthLoading: true,
      cart: [],
      activeConstructorProduct: null,
      referralCodeToApply: null,
      theme: 'dark',
      language: getDefaultLanguage(),
      lastServiceCallTime: null,
      alertConfig: { isOpen: false, title: '', message: '' },
      
      setAuthLoading: (loading) => set({ isAuthLoading: loading }),
      setLastServiceCallTime: (time) => set({ lastServiceCallTime: time }),
      setLanguage: (language) => set({ language }),
      setTheme: (theme) => set({ theme }),
      setTableId: (id) => set({ tableId: id }),
      setUser: (user) => set({ user }),
      verifyAge: () => set({ isAgeVerified: true }),
      setActiveConstructorProduct: (product) => set({ activeConstructorProduct: product }),
      setReferralCodeToApply: (code) => set({ referralCodeToApply: code }),
      
      addToCart: (product, ingredients, payWithPoints = false) =>
        set((state) => {
          const existingItem = state.cart.find(
            (item) => 
              item.product.id === product.id && 
              item.payWithPoints === payWithPoints &&
              JSON.stringify(item.selectedIngredients) === JSON.stringify(ingredients)
          )

          if (existingItem) {
            return {
              cart: state.cart.map((item) =>
                item.id === existingItem.id ? { ...item, quantity: item.quantity + 1 } : item
              ),
            }
          }

          return {
            cart: [
              ...state.cart,
              { id: crypto.randomUUID(), product, quantity: 1, selectedIngredients: ingredients, payWithPoints },
            ],
          }
        }),
        
      removeFromCart: (id) =>
        set((state) => ({
          cart: state.cart.filter((item) => item.id !== id),
        })),
        
      updateQuantity: (id, quantity) =>
        set((state) => ({
          cart: state.cart.map((item) => (item.id === id ? { ...item, quantity } : item)),
        })),
        
      toggleItemPaymentMode: (id) =>
        set((state) => ({
          cart: state.cart.map((item) => 
            item.id === id && item.product.bonus_price 
              ? { ...item, payWithPoints: !item.payWithPoints } 
              : item
          ),
        })),
        
      clearCart: () => set({ cart: [] }),
      
      showAlert: (title, message, onConfirm) => set({ alertConfig: { isOpen: true, title, message, onConfirm } }),
      hideAlert: () => set((state) => ({ alertConfig: { ...state.alertConfig, isOpen: false, onConfirm: undefined } })),
    }),
    {
      name: 'bar-poznan-storage',
      partialize: (state) => ({ 
        isAgeVerified: state.isAgeVerified,
        theme: state.theme,
        cart: state.cart,
        tableId: state.tableId,
        referralCodeToApply: state.referralCodeToApply,
        language: state.language,
        lastServiceCallTime: state.lastServiceCallTime
      }),
    }
  )
)