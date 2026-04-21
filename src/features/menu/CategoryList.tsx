import { useTranslation } from 'react-i18next'
import { useCategories } from '../../hooks/useMenu'
import { Button } from '../../components/ui/button'

interface CategoryListProps {
  selectedCategoryId: string | null
  onSelectCategory: (id: string | null) => void
}

export function CategoryList({ selectedCategoryId, onSelectCategory }: CategoryListProps) {
  const { t, i18n } = useTranslation()
  const { data: categories, isLoading, error } = useCategories()

  const currentLang = (i18n.language || 'pl') as 'pl' | 'ua' | 'en'

  if (isLoading) {
    return (
      <div className="flex gap-2 overflow-x-auto pb-4 px-4 hide-scrollbar">
        {[1, 2, 3, 4].map((skeleton) => (
          <div 
            key={skeleton} 
            className="h-10 w-24 bg-muted animate-pulse rounded-full shrink-0" 
          />
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-destructive px-4 text-sm font-medium">
        {t('error_loading_categories')}
      </div>
    )
  }

  return (
    <div className="flex gap-2 overflow-x-auto pb-4 px-4 hide-scrollbar">
      <Button
        variant={selectedCategoryId === null ? 'default' : 'outline'}
        className="rounded-full whitespace-nowrap shrink-0"
        onClick={() => onSelectCategory(null)}
      >
        {t('all_categories')}
      </Button>
      
      {categories?.map((category) => (
        <Button
          key={category.id}
          variant={selectedCategoryId === category.id ? 'default' : 'outline'}
          className="rounded-full whitespace-nowrap shrink-0"
          onClick={() => onSelectCategory(category.id)}
        >
          {category.name[currentLang] || category.name.pl}
        </Button>
      ))}
    </div>
  )
}