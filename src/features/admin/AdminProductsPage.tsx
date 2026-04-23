import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ChevronLeft, Plus, Coffee, Trash2, Power, Edit2, ImageIcon } from 'lucide-react'
import { useCategories } from '../../hooks/useMenu'
import { useAdminMenu } from '../../hooks/useAdminMenu'
import { useTranslationHelpers } from '../../hooks/useTranslationHelpers'
import { useImageUpload } from '../../hooks/useImageUpload' // ДОДАНО
import { Product } from '../../types/menu'
import { formatPrice } from '../../lib/utils'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerFooter } from '../../components/ui/drawer'

export function AdminProductsPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { getLocalizedText } = useTranslationHelpers()
  const { data: categories } = useCategories()
  
  const { useAdminProducts, createProduct, updateProduct, deleteProduct } = useAdminMenu()
  const { data: products, isLoading } = useAdminProducts()

  // ДОДАНО ХУК ЗАВАНТАЖЕННЯ
  const { uploadImage, isUploading, uploadError } = useImageUpload()

  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  
  const [formData, setFormData] = useState({
    categoryId: '', 
    namePl: '', 
    nameUa: '', 
    nameEn: '', 
    price: 0, 
    isAvailable: true,
    imageUrl: ''
  })

  const handleOpenCreate = () => {
    setEditingId(null)
    setFormData({ 
      categoryId: '', 
      namePl: '', 
      nameUa: '', 
      nameEn: '', 
      price: 0, 
      isAvailable: true,
      imageUrl: '' 
    })
    setIsDrawerOpen(true)
  }

  const handleOpenEdit = (product: Product) => {
    setEditingId(product.id)
    setFormData({
      categoryId: product.category_id || '',
      namePl: product.name?.pl || '',
      nameUa: product.name?.ua || '',
      nameEn: product.name?.en || '',
      price: product.price || 0,
      isAvailable: product.is_available ?? true,
      imageUrl: product.image_url || ''
    })
    setIsDrawerOpen(true)
  }

  const handleSubmit = () => {
    const payload = {
      category_id: formData.categoryId,
      name: { pl: formData.namePl, ua: formData.nameUa, en: formData.nameEn || formData.namePl },
      price: formData.price,
      is_available: formData.isAvailable,
      image_url: formData.imageUrl || undefined
    }

    if (editingId) {
      updateProduct.mutate({ id: editingId, updates: payload }, {
        onSuccess: () => setIsDrawerOpen(false)
      })
    } else {
      createProduct.mutate({
        ...payload,
        description: { pl: '', ua: '', en: '' },
        allergens: [],
        tags: [],
        is_constructor: false,
        bonus_reward: 0
      }, {
        onSuccess: () => setIsDrawerOpen(false)
      })
    }
  }

  const toggleAvailability = (id: string, currentStatus: boolean) => {
    updateProduct.mutate({ id, updates: { is_available: !currentStatus } })
  }

  return (
    <div className="pb-24 animate-in fade-in duration-300">
      <header className="sticky top-0 z-40 bg-background/90 backdrop-blur-md border-b border-border p-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="shrink-0">
            <ChevronLeft className="h-6 w-6" />
          </Button>
          <h1 className="text-xl font-bold uppercase">{t('admin_products', 'Продукти')}</h1>
        </div>
        <Button size="sm" onClick={handleOpenCreate}>
          <Plus className="h-4 w-4 mr-2" /> {t('add', 'Додати')}
        </Button>
      </header>

      <main className="p-4 space-y-3">
        {isLoading ? (
          <p className="text-muted-foreground text-center py-8">{t('loading', 'Завантаження...')}</p>
        ) : products?.length === 0 ? (
          <p className="text-muted-foreground text-center py-8">{t('no_data', 'Немає даних')}</p>
        ) : (
          products?.map(product => (
            <div key={product.id} className={`flex flex-col p-4 bg-card border rounded-2xl shadow-sm transition-all ${product.is_available ? 'opacity-100' : 'opacity-50 grayscale-[50%]'}`}>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3 overflow-hidden">
                  <div className="h-12 w-12 bg-secondary rounded-lg flex items-center justify-center shrink-0 overflow-hidden border border-border/50">
                    {product.image_url ? (
                      <img src={product.image_url} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <Coffee className="h-5 w-5 text-muted-foreground" />
                    )}
                  </div>
                  <div className="overflow-hidden">
                    <h3 className="font-bold leading-tight truncate">{getLocalizedText(product.name)}</h3>
                    <p className="text-sm font-semibold text-primary">{formatPrice(product.price)}</p>
                  </div>
                </div>
                <div className="flex gap-1 shrink-0 ml-2">
                  <Button variant="ghost" size="icon" onClick={() => toggleAvailability(product.id, product.is_available)}>
                    <Power className={`h-4 w-4 ${product.is_available ? 'text-green-500' : 'text-muted-foreground'}`} />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => handleOpenEdit(product)}>
                    <Edit2 className="h-4 w-4 text-primary" />
                  </Button>
                  <Button variant="ghost" size="icon" className="text-destructive hover:bg-destructive/10" onClick={() => deleteProduct.mutate(product.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))
        )}
      </main>

      <Drawer open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>
              {editingId ? t('edit_product', 'Редагувати продукт') : t('new_product', 'Новий продукт')}
            </DrawerTitle>
          </DrawerHeader>
          <div className="p-4 space-y-4 max-h-[60vh] overflow-y-auto">
            
            {/* ОНОВЛЕНО: Блок завантаження картинки */}
            <div className="flex flex-col items-center justify-center space-y-2 mb-2">
              <div className="h-32 w-32 bg-muted rounded-3xl overflow-hidden border-2 border-dashed border-border flex items-center justify-center relative group cursor-pointer hover:border-primary transition-colors">
                {formData.imageUrl ? (
                  <img src={formData.imageUrl} alt="Preview" className="w-full h-full object-cover group-hover:opacity-50 transition-opacity" />
                ) : (
                  <ImageIcon className="h-10 w-10 text-muted-foreground/30 group-hover:scale-110 transition-transform" />
                )}
                
                {isUploading && (
                  <div className="absolute inset-0 bg-background/50 backdrop-blur-sm flex items-center justify-center z-10">
                    <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
                  </div>
                )}
                
                <input 
                  type="file" 
                  accept="image/*" 
                  className="absolute inset-0 opacity-0 cursor-pointer z-20 w-full h-full"
                  disabled={isUploading}
                  onChange={async (e) => {
                    const file = e.target.files?.[0]
                    if (file) {
                      const url = await uploadImage(file)
                      if (url) setFormData({ ...formData, imageUrl: url })
                    }
                  }}
                />
              </div>
              <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest text-center">
                {t('preview', 'Натисніть щоб завантажити')}
              </p>
              {uploadError && <p className="text-xs text-destructive">{uploadError}</p>}
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-muted-foreground">{t('image_url', 'URL Зображення (Або завантажте вище)')}</label>
              <Input 
                value={formData.imageUrl} 
                onChange={e => setFormData({ ...formData, imageUrl: e.target.value })} 
                placeholder="https://..." 
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-muted-foreground">{t('category_label', 'Категорія')}</label>
              <select 
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                value={formData.categoryId} 
                onChange={e => setFormData({ ...formData, categoryId: e.target.value })}
              >
                <option value="">{t('choose_category', 'Оберіть категорію...')}</option>
                {categories?.map(c => (
                  <option key={c.id} value={c.id}>{getLocalizedText(c.name)}</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 gap-4">
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
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-muted-foreground">{t('price_pln', 'Ціна (PLN)')}</label>
              <Input type="number" value={formData.price || ''} onChange={e => setFormData({ ...formData, price: Number(e.target.value) })} />
            </div>
          </div>
          <DrawerFooter>
            <Button 
              onClick={handleSubmit} 
              disabled={!formData.categoryId || !formData.namePl || formData.price < 0 || createProduct.isPending || updateProduct.isPending || isUploading}
            >
              {editingId ? t('save_changes', 'Зберегти зміни') : t('create_product', 'Створити продукт')}
            </Button>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </div>
  )
}