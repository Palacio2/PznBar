import { useMemo } from 'react'
import { CartItem } from '../store/useAppStore'

export function useCartCalculations(cart: CartItem[], tipPercent: number) {
  const getItemPrice = (item: CartItem) => {
    if (item.payWithPoints) return 0
    const extras = item.selectedIngredients?.reduce((sum, ing) => sum + (ing.price_extra || 0), 0) || 0
    return (item.product.price + extras) * item.quantity
  }

  const calculations = useMemo(() => {
    const rawBaseTotalCash = cart.reduce((sum, item) => sum + getItemPrice(item), 0)
    const baseTotalCash = Math.round(rawBaseTotalCash * 100) / 100

    const totalPointsUsed = cart.reduce((sum, item) => sum + (item.payWithPoints && item.product.bonus_price ? item.product.bonus_price * item.quantity : 0), 0)
    
    const pointsToEarn = cart.reduce((sum, item) => 
      item.payWithPoints ? sum : sum + (item.product.bonus_reward * item.quantity), 0
    )

    const rawTipAmount = baseTotalCash * (tipPercent / 100)
    const tipAmount = Math.round(rawTipAmount * 100) / 100

    const finalTotalCash = Math.round((baseTotalCash + tipAmount) * 100) / 100
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0)

    return {
      baseTotalCash,
      totalPointsUsed,
      pointsToEarn,
      tipAmount,
      finalTotalCash,
      totalItems
    }
  }, [cart, tipPercent])

  return { ...calculations, getItemPrice }
}