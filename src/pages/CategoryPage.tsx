import { useParams, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ChevronLeft } from 'lucide-react'
import { useProducts, useCategories } from '../hooks/useMenu'
import { ProductCard } from '../features/menu/ProductCard'
import { Button } from '../components/ui/button'

export function CategoryPage() {
  const { slug } = useParams<{ slug: string }>()
  const navigate = useNavigate()
  const { t, i18n } = useTranslation()
  const currentLang = i18n.language as 'pl' | 'ua' | 'en'

  const { data: categories } = useCategories()
  const category = categories?.find(c => c.slug === slug)
  const { data: products, isLoading } = useProducts(category?.id)

  return (
    <div className="pb-24 animate-in fade-in duration-300">
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-md border-b border-border p-4 mb-6 flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="shrink-0">
          <ChevronLeft className="h-6 w-6" />
        </Button>
        <h1 className="text-xl font-bold uppercase tracking-wider line-clamp-1">
          {category ? (category.name[currentLang] || category.name.pl) : t('loading')}
        </h1>
      </header>

      <main className="px-4">
        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
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
            <p>{t('no_products_found')}</p>
          </div>
        )}
      </main>
    </div>
  )
}