import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Product } from '../../types/menu'
import { Card, CardContent, CardFooter, CardHeader } from '../../components/ui/card'
import { Badge } from '../../components/ui/badge'
import { Button } from '../../components/ui/button'
import { Info, Plus, Settings2, Award, Heart, Tag, ImageIcon, MessageSquare, ChevronDown } from 'lucide-react'
import { useAppStore } from '../../store/useAppStore'
import { useFavorites, useToggleFavorite } from '../../hooks/useFavorites'
import { useProductStats } from '../../hooks/useProductStats'
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerFooter } from '../../components/ui/drawer'
import { ProductReviews } from './ProductReviews'

interface ProductCardProps {
  product: Product
}

export function ProductCard({ product }: ProductCardProps) {
  const { t, i18n } = useTranslation()
  const { user, addToCart, setActiveConstructorProduct, showAlert } = useAppStore()
  const { data: favorites } = useFavorites()
  const { mutate: toggleFavorite } = useToggleFavorite()
  const { data: stats } = useProductStats(product.id)
  
  const [isDetailsOpen, setIsDetailsOpen] = useState(false)
  const [imageLoaded, setImageLoaded] = useState(false)
  const [showAllergens, setShowAllergens] = useState(false)
  
  const currentLang = (i18n.language || 'pl') as 'pl' | 'ua' | 'en'

  const name = product.name?.[currentLang] || product.name?.pl || t('unknown_product')
  const description = product.description?.[currentLang] || product.description?.pl || ''
  const isFavorite = favorites?.includes(product.id)
  const hasAllergens = product.allergens && product.allergens.length > 0
  
  const formattedPrice = new Intl.NumberFormat('pl-PL', { style: 'currency', currency: 'PLN' }).format(product.price || 0)

  const handleAction = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation()
    if (product.is_constructor) {
      setActiveConstructorProduct(product)
      setIsDetailsOpen(false)
    } else {
      addToCart(product)
      setIsDetailsOpen(false)
    }
  }

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (!user) {
      showAlert(t('attention'), t('auth_required_fav'))
      return
    }
    toggleFavorite({ productId: product.id, isFavorite: !!isFavorite })
  }

  return (
    <>
      <Card className="flex flex-col h-full overflow-hidden transition-all hover:border-primary/50 cursor-pointer relative" onClick={() => setIsDetailsOpen(true)}>
        <button onClick={handleFavoriteClick} className="absolute top-2 right-2 z-20 p-2 bg-background/80 backdrop-blur-md rounded-full shadow-sm">
          <Heart className={`h-4 w-4 transition-colors ${isFavorite ? 'fill-red-500 text-red-500' : 'text-foreground'}`} />
        </button>

        <div className="relative aspect-square w-full bg-muted shrink-0 overflow-hidden">
          {product.image_url ? (
            <>
              {!imageLoaded && (
                <div className="absolute inset-0 flex items-center justify-center bg-secondary animate-pulse">
                  <ImageIcon className="h-8 w-8 text-muted-foreground/30" />
                </div>
              )}
              <img 
                src={product.image_url} 
                alt={name} 
                onLoad={() => setImageLoaded(true)}
                className={`h-full w-full object-cover transition-opacity duration-300 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`} 
              />
            </>
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-secondary">
              <span className="text-muted-foreground text-[10px] uppercase tracking-widest">Bar Poznan</span>
            </div>
          )}
        </div>

        <CardHeader className="p-4 pb-2">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-semibold text-lg leading-tight line-clamp-2">{name}</h3>
            <span className="font-bold text-primary whitespace-nowrap">{formattedPrice}</span>
          </div>
        </CardHeader>

        <CardContent className="p-4 pt-0 flex-grow flex flex-col">
          <p className="text-sm text-muted-foreground line-clamp-2 flex-grow">{description}</p>
          
          <div className="flex items-center gap-3 mt-3 pt-3 border-t border-border/50 text-muted-foreground">
            <div className="flex items-center gap-1 text-xs font-medium">
              <Heart className="h-3.5 w-3.5" /> 
              {stats?.likesCount || 0}
            </div>
            <div className="flex items-center gap-1 text-xs font-medium">
              <MessageSquare className="h-3.5 w-3.5" /> 
              {stats?.reviewsCount || 0}
            </div>
          </div>
        </CardContent>

        <CardFooter className="p-4 pt-0 mt-auto shrink-0">
          <Button className="w-full gap-2" disabled={!product.is_available} onClick={handleAction}>
            {product.is_constructor ? <Settings2 className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
            {product.is_available ? (product.is_constructor ? t('customize') : t('add_to_order')) : t('out_of_stock')}
          </Button>
        </CardFooter>
      </Card>

      <Drawer open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DrawerContent className="max-h-[90vh] flex flex-col p-0 overflow-hidden">
          {/* Статичне фото зверху */}
          {product.image_url && (
            <div className="w-full h-56 bg-muted relative shrink-0">
              <img src={product.image_url} alt={name} className="w-full h-full object-cover" />
            </div>
          )}
          
          {/* Контент, що скролиться */}
          <div className="flex-1 overflow-y-auto p-4 space-y-5">
            <DrawerHeader className="p-0 text-left">
              <div className="flex justify-between items-start mb-2 gap-4">
                <DrawerTitle className="text-2xl">{name}</DrawerTitle>
                <span className="text-2xl font-bold text-primary shrink-0">{formattedPrice}</span>
              </div>
              <p className="text-muted-foreground leading-relaxed">{description}</p>
            </DrawerHeader>

            <div className="flex items-center gap-4 text-muted-foreground bg-secondary/30 p-3 rounded-lg">
              <div className="flex items-center gap-1.5 text-sm font-medium">
                <Heart className="h-4 w-4 text-red-500" /> 
                {stats?.likesCount || 0}
              </div>
              <div className="flex items-center gap-1.5 text-sm font-medium">
                <MessageSquare className="h-4 w-4 text-primary" /> 
                {stats?.reviewsCount || 0}
              </div>
            </div>

            {product.tags && product.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {product.tags.map((tag) => (
                  <Badge key={tag} variant="outline" className="bg-primary/5 text-primary border-primary/20 gap-1.5 py-1">
                    <Tag className="h-3 w-3" />
                    {tag}
                  </Badge>
                ))}
              </div>
            )}

            {/* Алергени як випадаюче меню */}
            <div className="bg-secondary/50 rounded-lg overflow-hidden transition-all">
              <button 
                onClick={() => setShowAllergens(!showAllergens)}
                className="w-full flex items-center justify-between p-3 focus:outline-none hover:bg-secondary/70 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Info className="h-5 w-5 text-muted-foreground shrink-0" />
                  <span className="font-semibold text-sm">{t('allergens', 'Інформація про алергени')}</span>
                </div>
                <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform duration-200 ${showAllergens ? 'rotate-180' : ''}`} />
              </button>
              {showAllergens && (
                <div className="p-3 pt-0 border-t border-border/50 text-sm text-muted-foreground animate-in fade-in slide-in-from-top-2">
                  {hasAllergens ? product.allergens.join(', ') : t('no_allergens', 'Алергени відсутні')}
                </div>
              )}
            </div>

            {product.bonus_price && (
              <div className="flex items-center justify-between bg-primary/10 border border-primary/20 p-3 rounded-lg">
                <div className="flex items-center gap-2">
                  <Award className="h-5 w-5 text-primary" />
                  <span className="font-medium text-sm">{t('available_for_points')}</span>
                </div>
                <span className="font-bold text-primary">{product.bonus_price} б.</span>
              </div>
            )}
            
            <ProductReviews productId={product.id} />
          </div>

          {/* Статична кнопка знизу */}
          <DrawerFooter className="border-t border-border p-4 shrink-0 bg-background">
            <Button className="w-full h-14 text-lg gap-2" disabled={!product.is_available} onClick={handleAction}>
              {product.is_constructor ? <Settings2 className="h-5 w-5" /> : <Plus className="h-5 w-5" />}
              {product.is_available ? (product.is_constructor ? t('customize') : t('add_to_order')) : t('out_of_stock')}
            </Button>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </>
  )
}