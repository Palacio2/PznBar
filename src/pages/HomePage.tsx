import { useState, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { Search, Flame } from 'lucide-react'
import { useAppStore } from '../store/useAppStore'
import { useCategories, useProducts } from '../hooks/useMenu'
import { ProductCard } from '../features/menu/ProductCard'
import { Input } from '../components/ui/input'
import { useTranslationHelpers } from '../hooks/useTranslationHelpers'
import { PRODUCT_TAGS } from '../lib/constants'

export function HomePage() {
  const { t } = useTranslation()
  const { getLocalizedText } = useTranslationHelpers()
  
  const { tableId } = useAppStore()
  const [searchQuery, setSearchQuery] = useState('')
  
  const { data: categories } = useCategories()
  const { data: allProducts } = useProducts(null)

  const bestsellers = useMemo(() => {
    return allProducts?.filter(p => p.tags?.includes(PRODUCT_TAGS.BESTSELLER)) || []
  }, [allProducts])

  const filteredProducts = useMemo(() => {
    if (!allProducts || !searchQuery.trim()) return []
    const query = searchQuery.toLowerCase().trim()
    return allProducts.filter((product) => {
      const matchPl = product.name?.pl?.toLowerCase().includes(query)
      const matchUa = product.name?.ua?.toLowerCase().includes(query)
      const matchEn = product.name?.en?.toLowerCase().includes(query)
      return matchPl || matchUa || matchEn
    })
  }, [allProducts, searchQuery])

  return (
    <div className="pb-24 animate-in fade-in duration-500">
      <header className="pt-8 pb-6 px-4 bg-background sticky top-0 z-30 shadow-sm border-b border-border">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight uppercase">Bar Poznan</h1>
            {tableId && (
              <p className="text-sm font-medium text-primary mt-1">{t('table')} #{tableId}</p>
            )}
          </div>
        </div>
        
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input 
            className="pl-10 bg-secondary border-none h-12 rounded-2xl w-full text-base" 
            placeholder={t('search_placeholder')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </header>

      <main className="px-4 mt-6 space-y-8">
        {searchQuery.trim() ? (
          <section className="space-y-4">
            {filteredProducts.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 items-stretch">
                {filteredProducts.map(product => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <p className="text-lg">{t('no_search_results')}</p>
              </div>
            )}
          </section>
        ) : (
          <>
            {bestsellers.length > 0 && (
              <section>
                <div className="flex items-center gap-2 mb-4">
                  <Flame className="h-5 w-5 text-orange-500" />
                  <h2 className="text-xl font-bold">{t('top_sales')}</h2>
                </div>
                <div className="flex gap-4 overflow-x-auto pb-4 hide-scrollbar snap-x">
                  {bestsellers.map((product) => (
                    <div key={product.id} className="w-64 shrink-0 snap-start">
                      <ProductCard product={product} />
                    </div>
                  ))}
                </div>
              </section>
            )}

            <section>
              <h2 className="text-xl font-bold mb-4">{t('menu_categories')}</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {categories?.map((category) => (
                  <Link key={category.id} to={`/category/${category.slug}`}>
                    <div className="bg-muted rounded-2xl aspect-[4/3] relative overflow-hidden flex items-center justify-center group border border-border/50">
                      {category.image_url && (
                        <img 
                          src={category.image_url} 
                          alt={getLocalizedText(category.name)} 
                          className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:scale-105 transition-transform duration-500" 
                        />
                      )}
                      <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors" />
                      <h3 className="relative z-10 text-xl font-bold text-white uppercase tracking-wider drop-shadow-lg text-center px-2">
                        {getLocalizedText(category.name, '...')}
                      </h3>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          </>
        )}
      </main>
    </div>
  )
}