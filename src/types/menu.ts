export interface LocalizedString {
  pl: string
  ua: string
  en: string
}

export interface Category {
  id: string
  name: LocalizedString
  slug: string
  image_url: string
  sort_order: number
  is_active: boolean
}

export interface Product {
  id: string
  category_id: string
  name: LocalizedString
  description: LocalizedString
  price: number
  bonus_reward: number
  bonus_price: number | null
  image_url: string
  allergens: string[]
  is_available: boolean
  is_constructor: boolean
  tags: string[]
}

export interface Ingredient {
  id: string
  name: LocalizedString
  type: string
  price_extra: number
  is_free_selection: boolean
  is_available: boolean
}

export interface UserProfile {
  id: string
  phone: string | null
  bonus_points: number
  referral_code: string
  role: 'user' | 'admin' | 'staff' | 'super_admin' // Додали super_admin
  email?: string
}

export type OrderStatus = 'pending' | 'new' | 'preparing' | 'served' | 'completed' | 'cancelled'

export type PaymentMethod = 'card' | 'cash' | 'points' | 'mixed'

export interface OrderItemIngredient {
  id: string
  name: LocalizedString
  type: string
  price_extra: number
}

export interface OrderItem {
  product_id: string
  name: LocalizedString
  quantity: number
  price: number
  pay_with_points: boolean
  is_custom: boolean
  selected_ingredients?: OrderItemIngredient[]
}

export interface Order {
  id: string
  user_id: string | null
  table_id: string
  total_price: number
  tip_amount: number
  points_used: number
  points_earned: number
  status: OrderStatus
  payment_method: PaymentMethod | null
  is_paid: boolean
  assigned_staff_id: string | null
  items: OrderItem[]
  created_at: string
  updated_at: string
}