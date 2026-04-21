import { useTranslation } from 'react-i18next'
import { Heart } from 'lucide-react'
import { useFavoriteProducts } from '../hooks/useFavorites'
import { ProductCard } from '../features/menu/ProductCard'
import { useAppStore } from '../store/useAppStore'
import { Button } from '../components/ui/button'
import { useNavigate } from 'react-router-dom'

export function FavoritesPage() {
  const { t } = useTranslation()
  const { user } = useAppStore()
  const navigate = useNavigate()
  const { data: products, isLoading } = useFavoriteProducts()

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh] p-4 text-center">
        <Heart className="h-16 w-16 text-muted-foreground/30 mb-4" />
        <h2 className="text-2xl font-bold mb-2">{t('auth_required')}</h2>
        <p className="text-muted-foreground mb-6">
          {t('auth_fav_desc')}
        </p>
        <Button size="lg" onClick={() => navigate('/profile')}>{t('login')}</Button>
      </div>
    )
  }

  return (
    <div className="pb-24 animate-in fade-in duration-300">
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-md border-b border-border p-4 mb-6">
        <h1 className="text-2xl font-bold">{t('favorites')}</h1>
      </header>

      <main className="px-4">
        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {[1, 2].map((i) => (
              <div key={i} className="h-72 bg-muted animate-pulse rounded-xl" />
            ))}
          </div>
        ) : products && products.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 items-stretch">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-muted-foreground">
            <Heart className="h-12 w-12 mx-auto mb-3 opacity-20" />
            <p>{t('no_favorites')}</p>
          </div>
        )}
      </main>
    </div>
  )
}