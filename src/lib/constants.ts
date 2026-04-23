export const APP_CONFIG = {
  NAME: 'Bar Poznan',
  SUPPORT_EMAIL: 'support@barpoznan.pl',
  PHONE: '+48 123 456 789',
  DEFAULT_LANGUAGE: 'pl',
  TIP_OPTIONS: [0, 5, 10, 15], 
  BONUS_AWARD_PERCENT: 5, 
  REFERRAL_BONUS: 50, 
} as const;

export const PRODUCT_TAGS = {
  BESTSELLER: 'Bestseller',
} as const;

export const ORDER_STATUSES = {
  PENDING: 'pending',
  PREPARING: 'preparing',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
} as const;

export const CALL_STATUSES = {
  NEW: 'new',
  COMPLETED: 'completed',
} as const;

export const USER_ROLES = {
  CLIENT: 'client',
  STAFF: 'staff',
  ADMIN: 'admin',
  SUPER_ADMIN: 'super_admin',
} as const;

export const STORAGE_KEYS = {
  TABLE_ID: 'pzn_table_id',
  THEME: 'pzn_theme',
  LANGUAGE: 'pzn_lang',
} as const;

export const INGREDIENT_TYPES = {
  HOOKAH: ['tobacco', 'bowl', 'base'],
  COCKTAIL: ['alcohol', 'mixer', 'syrup'],
} as const;

export const CATEGORY_SLUGS = {
  HOOKAH: ['hookahs', 'shisha'],
  COCKTAIL: ['cocktails', 'drinks'],
} as const;