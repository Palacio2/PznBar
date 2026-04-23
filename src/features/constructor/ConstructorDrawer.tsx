import { useState, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { useAppStore } from '../../store/useAppStore'
import { useIngredients } from '../../hooks/useIngredients'
import { useCategories } from '../../hooks/useMenu'
import { Ingredient } from '../../types/menu'
import { Button } from '../../components/ui/button'
import { Badge } from '../../components/ui/badge'
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerFooter } from '../../components/ui/drawer'
import { formatPrice } from '../../lib/utils'
import { useTranslationHelpers } from '../../hooks/useTranslationHelpers'
import { CATEGORY_SLUGS, INGREDIENT_TYPES } from '../../lib/constants'

export function ConstructorDrawer() {
  const { t } = useTranslation()
  const { getLocalizedText } = useTranslationHelpers()
  const { activeConstructorProduct, setActiveConstructorProduct, addToCart } = useAppStore()
  
  const { data: categories } = useCategories()
  const { data: ingredients } = useIngredients()
  const [selectedIngredients, setSelectedIngredients] = useState<Ingredient[]>([])

const groupedIngredients = useMemo(() => {
    if (!ingredients || !activeConstructorProduct || !categories) return {}
    
    const category = categories.find(c => c.id === activeConstructorProduct.category_id)
    if (!category) return {}

    // Додаємо (as readonly string[]) щоб TypeScript не сварився на .includes()
    const isHookah = (CATEGORY_SLUGS.HOOKAH as readonly string[]).includes(category.slug)
    const isCocktail = (CATEGORY_SLUGS.COCKTAIL as readonly string[]).includes(category.slug)

    // Додаємо readonly сюди
    let allowedTypes: readonly string[] = []
    if (isHookah) allowedTypes = INGREDIENT_TYPES.HOOKAH
    if (isCocktail) allowedTypes = INGREDIENT_TYPES.COCKTAIL

    return ingredients
      .filter(ing => allowedTypes.includes(ing.type))
      .filter(ing => !ing.category_constraint || ing.category_constraint === category.slug)
      .reduce((acc, curr) => {
        if (!acc[curr.type]) acc[curr.type] = []
        acc[curr.type].push(curr)
        return acc
      }, {} as Record<string, Ingredient[]>)
  }, [ingredients, activeConstructorProduct, categories])

  const totalPrice = useMemo(() => {
    if (!activeConstructorProduct) return 0
    const extras = selectedIngredients.reduce((sum, item) => sum + (item.price_extra || 0), 0)
    return activeConstructorProduct.price + extras
  }, [activeConstructorProduct, selectedIngredients])

  const handleToggle = (ing: Ingredient) => {
    setSelectedIngredients(prev => 
      prev.find(i => i.id === ing.id) ? prev.filter(i => i.id !== ing.id) : [...prev, ing]
    )
  }

  const handleAdd = () => {
    if (activeConstructorProduct) {
      addToCart(activeConstructorProduct, selectedIngredients)
      handleClose()
    }
  }

  const handleClose = () => {
    setActiveConstructorProduct(null)
    setTimeout(() => setSelectedIngredients([]), 300)
  }

  if (!activeConstructorProduct) return null

  return (
    <Drawer open={!!activeConstructorProduct} onOpenChange={(open) => !open && handleClose()}>
      <DrawerContent className="max-h-[85vh]">
        <DrawerHeader>
          <DrawerTitle className="text-xl">
            {getLocalizedText(activeConstructorProduct.name, t('custom_product', 'Свій продукт'))}
          </DrawerTitle>
        </DrawerHeader>
        <div className="p-4 overflow-y-auto space-y-6 pb-24">
          {Object.entries(groupedIngredients).map(([type, items]) => (
            <div key={type} className="space-y-3">
              <h3 className="font-semibold text-sm uppercase text-primary tracking-widest">{t(`type_${type}`)}</h3>
              <div className="flex flex-wrap gap-2">
                {items.map((ing) => {
                  const isSelected = selectedIngredients.some(i => i.id === ing.id)
                  return (
                    <button
                      key={ing.id}
                      onClick={() => handleToggle(ing)}
                      className={`flex items-center gap-2 rounded-xl border px-4 py-2 transition-all ${
                        isSelected ? 'border-primary bg-primary/10 text-primary' : 'border-border bg-card'
                      }`}
                    >
                      <span className="text-sm font-medium">{getLocalizedText(ing.name, t('ingredient'))}</span>
                      {ing.price_extra > 0 && <Badge variant="secondary" className="text-[10px]">+{formatPrice(ing.price_extra)}</Badge>}
                    </button>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
        <DrawerFooter className="absolute bottom-0 w-full bg-background/95 backdrop-blur-md border-t p-4">
          <Button className="w-full h-14 text-lg font-bold" onClick={handleAdd}>
            {t('add_for', 'Додати за')} {formatPrice(totalPrice)}
          </Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  )
}