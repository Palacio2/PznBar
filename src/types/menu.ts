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
}