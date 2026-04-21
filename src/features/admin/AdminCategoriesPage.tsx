import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ChevronLeft, Plus, Trash2, LayoutGrid, Edit2, ArrowUp, ArrowDown } from 'lucide-react'
import { useCategories } from '../../hooks/useMenu'
import { useAdminMenu } from '../../hooks/useAdminMenu'
import { useTranslationHelpers } from '../../hooks/useTranslationHelpers'
import { Category } from '../../types/menu'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerFooter } from '../../components/ui/drawer'

export function AdminCategoriesPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { getLocalizedText } = useTranslationHelpers()
  const { data: categories, isLoading } = useCategories()
  const { createCategory, updateCategory, deleteCategory } = useAdminMenu()

  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  
  const [formData, setFormData] = useState({
    namePl: '', nameUa: '', nameEn: '', slug: '', imageUrl: ''
  })

  const sortedCategories = [...(categories || [])].sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0))

  const handleOpenCreate = () => {
    setEditingId(null)
    setFormData({ namePl: '', nameUa: '', nameEn: '', slug: '', imageUrl: '' })
    setIsDrawerOpen(true)
  }

  const handleOpenEdit = (category: Category) => {
    setEditingId(category.id)
    setFormData({
      namePl: category.name?.pl || '',
      nameUa: category.name?.ua || '',
      nameEn: category.name?.en || '',
      slug: category.slug || '',
      imageUrl: category.image_url || ''
    })
    setIsDrawerOpen(true)
  }

  const handleSubmit = () => {
    const payload = {
      name: { pl: formData.namePl, ua: formData.nameUa, en: formData.nameEn || formData.namePl },
      slug: formData.slug,
      image_url: formData.imageUrl || undefined,
      is_active: true
    }

    if (editingId) {
      updateCategory.mutate({ id: editingId, updates: payload }, {
        onSuccess: () => setIsDrawerOpen(false)
      })
    } else {
      const nextSortOrder = sortedCategories.length > 0 
        ? Math.max(...sortedCategories.map(c => c.sort_order || 0)) + 1 
        : 0

      createCategory.mutate({ ...payload, sort_order: nextSortOrder }, {
        onSuccess: () => setIsDrawerOpen(false)
      })
    }
  }

  const handleMove = (index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index === 0) return
    if (direction === 'down' && index === sortedCategories.length - 1) return

    const newIndex = direction === 'up' ? index - 1 : index + 1
    const currentCat = sortedCategories[index]
    const targetCat = sortedCategories[newIndex]

    const currentSort = currentCat.sort_order || 0
    const targetSort = targetCat.sort_order || 0

    updateCategory.mutate({ id: currentCat.id, updates: { sort_order: targetSort } })
    updateCategory.mutate({ id: targetCat.id, updates: { sort_order: currentSort } })
  }

  return (
    <div className="pb-24 animate-in fade-in duration-300">
      <header className="sticky top-0 z-40 bg-background/90 backdrop-blur-md border-b border-border p-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="shrink-0">
            <ChevronLeft className="h-6 w-6" />
          </Button>
          <h1 className="text-xl font-bold uppercase">{t('admin_categories', 'Категорії')}</h1>
        </div>
        <Button size="sm" onClick={handleOpenCreate}>
          <Plus className="h-4 w-4 mr-2" /> {t('add', 'Додати')}
        </Button>
      </header>

      <main className="p-4 space-y-4">
        {isLoading ? (
          <p className="text-muted-foreground text-center py-8">{t('loading', 'Завантаження...')}</p>
        ) : sortedCategories.length === 0 ? (
          <p className="text-muted-foreground text-center py-8">{t('no_data', 'Немає даних')}</p>
        ) : (
          sortedCategories.map((category, index) => (
            <div key={category.id} className="flex items-center justify-between p-4 bg-card border rounded-2xl shadow-sm">
              <div className="flex items-center gap-4 flex-1 overflow-hidden">
                <div className="h-12 w-12 bg-secondary rounded-lg overflow-hidden flex items-center justify-center shrink-0">
                  {category.image_url ? (
                    <img src={category.image_url} alt="img" className="h-full w-full object-cover" />
                  ) : (
                    <LayoutGrid className="h-6 w-6 text-muted-foreground" />
                  )}
                </div>
                <div className="overflow-hidden">
                  <h3 className="font-bold truncate">{getLocalizedText(category.name)}</h3>
                  <p className="text-xs text-muted-foreground truncate">/{category.slug}</p>
                </div>
              </div>

              <div className="flex items-center gap-1 shrink-0 ml-2">
                <div className="flex flex-col border-r border-border pr-2 mr-1">
                  <Button variant="ghost" size="icon" className="h-6 w-6" disabled={index === 0} onClick={() => handleMove(index, 'up')}>
                    <ArrowUp className="h-4 w-4 text-muted-foreground" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-6 w-6" disabled={index === sortedCategories.length - 1} onClick={() => handleMove(index, 'down')}>
                    <ArrowDown className="h-4 w-4 text-muted-foreground" />
                  </Button>
                </div>

                <Button variant="ghost" size="icon" onClick={() => handleOpenEdit(category)}>
                  <Edit2 className="h-4 w-4 text-primary" />
                </Button>
                <Button variant="ghost" size="icon" className="text-destructive hover:bg-destructive/10" onClick={() => deleteCategory.mutate(category.id)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))
        )}
      </main>

      <Drawer open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>
              {editingId ? t('edit_category', 'Редагувати категорію') : t('new_category', 'Нова категорія')}
            </DrawerTitle>
          </DrawerHeader>
          <div className="p-4 space-y-4 max-h-[60vh] overflow-y-auto">
            <div className="space-y-2">
              <label className="text-xs font-semibold text-muted-foreground">{t('slug_label', 'Slug (URL, англ)')}</label>
              <Input value={formData.slug} onChange={e => setFormData({ ...formData, slug: e.target.value })} placeholder="napoi" />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-semibold text-muted-foreground">{t('name_pl', 'Назва (PL)')}</label>
              <Input value={formData.namePl} onChange={e => setFormData({ ...formData, namePl: e.target.value })} />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-semibold text-muted-foreground">{t('name_ua', 'Назва (UA)')}</label>
              <Input value={formData.nameUa} onChange={e => setFormData({ ...formData, nameUa: e.target.value })} />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-semibold text-muted-foreground">{t('name_en', 'Назва (EN)')}</label>
              <Input value={formData.nameEn} onChange={e => setFormData({ ...formData, nameEn: e.target.value })} />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-semibold text-muted-foreground">{t('image_url', 'URL Зображення')}</label>
              <Input value={formData.imageUrl} onChange={e => setFormData({ ...formData, imageUrl: e.target.value })} placeholder="https://..." />
            </div>
          </div>
          <DrawerFooter>
            <Button 
              onClick={handleSubmit} 
              disabled={!formData.slug || !formData.namePl || createCategory.isPending || updateCategory.isPending}
            >
              {editingId ? t('save_changes', 'Зберегти зміни') : t('create_category', 'Створити категорію')}
            </Button>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </div>
  )
}