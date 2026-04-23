import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ChevronLeft, Plus, Trash2, Edit2, Power, Grape } from 'lucide-react'
import { useAdminIngredients, Ingredient } from '../../hooks/useAdminIngredients'
import { useTranslationHelpers } from '../../hooks/useTranslationHelpers'
import { formatPrice } from '../../lib/utils'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerFooter } from '../../components/ui/drawer'

export function AdminIngredientsPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { getLocalizedText } = useTranslationHelpers()
  const { useIngredientsList, createIngredient, updateIngredient, deleteIngredient } = useAdminIngredients()
  const { data: ingredients, isLoading } = useIngredientsList()

  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  
  const [formData, setFormData] = useState({
    namePl: '', nameUa: '', nameEn: '', type: 'tobacco', price_extra: 0, 
    category_constraint: '', is_free_selection: false, is_available: true
  })

  const handleOpenCreate = () => {
    setEditingId(null)
    setFormData({ namePl: '', nameUa: '', nameEn: '', type: 'tobacco', price_extra: 0, category_constraint: '', is_free_selection: false, is_available: true })
    setIsDrawerOpen(true)
  }

  const handleOpenEdit = (item: Ingredient) => {
    setEditingId(item.id)
    setFormData({
      namePl: item.name?.pl || '', nameUa: item.name?.ua || '', nameEn: item.name?.en || '',
      type: item.type, price_extra: item.price_extra || 0, category_constraint: item.category_constraint || '',
      is_free_selection: item.is_free_selection, is_available: item.is_available
    })
    setIsDrawerOpen(true)
  }

  const handleSubmit = () => {
    const payload = {
      name: { pl: formData.namePl, ua: formData.nameUa, en: formData.nameEn || formData.namePl },
      type: formData.type, price_extra: formData.price_extra,
      category_constraint: formData.category_constraint || null,
      is_free_selection: formData.is_free_selection, is_available: formData.is_available
    }

    if (editingId) {
      updateIngredient.mutate({ id: editingId, updates: payload }, { onSuccess: () => setIsDrawerOpen(false) })
    } else {
      createIngredient.mutate(payload, { onSuccess: () => setIsDrawerOpen(false) })
    }
  }

  const toggleAvailability = (id: string, currentStatus: boolean) => {
    updateIngredient.mutate({ id, updates: { is_available: !currentStatus } })
  }

  return (
    <div className="pb-24 animate-in fade-in duration-300">
      <header className="sticky top-0 z-40 bg-background/90 backdrop-blur-md border-b border-border p-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="shrink-0">
            <ChevronLeft className="h-6 w-6" />
          </Button>
          <h1 className="text-xl font-bold uppercase tracking-tight">{t('admin_ingredients', 'Інгредієнти')}</h1>
        </div>
        <Button size="sm" onClick={handleOpenCreate}>
          <Plus className="h-4 w-4 mr-2" /> {t('add', 'Додати')}
        </Button>
      </header>

      <main className="p-4 space-y-3">
        {isLoading ? (
          <p className="text-muted-foreground text-center py-8">{t('loading', 'Завантаження...')}</p>
        ) : ingredients?.length === 0 ? (
          <p className="text-muted-foreground text-center py-8">{t('no_data', 'Немає даних')}</p>
        ) : (
          ingredients?.map(item => (
            <div key={item.id} className={`flex flex-col p-4 bg-card border rounded-2xl shadow-sm transition-all ${item.is_available ? 'opacity-100' : 'opacity-50 grayscale-[50%]'}`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 overflow-hidden">
                  <div className="h-10 w-10 bg-secondary rounded-lg flex items-center justify-center shrink-0">
                    <Grape className="h-5 w-5 text-primary" />
                  </div>
                  <div className="overflow-hidden">
                    <h3 className="font-bold leading-tight truncate">{getLocalizedText(item.name)}</h3>
                    <div className="flex gap-2 items-center mt-1">
                      <span className="text-[10px] font-bold uppercase bg-background border border-border px-2 py-0.5 rounded-md text-muted-foreground">{item.type}</span>
                      {item.price_extra > 0 && <span className="text-xs font-semibold text-primary">+{formatPrice(item.price_extra)}</span>}
                    </div>
                  </div>
                </div>
                <div className="flex gap-1 shrink-0 ml-2">
                  <Button variant="ghost" size="icon" onClick={() => toggleAvailability(item.id, item.is_available)}>
                    <Power className={`h-4 w-4 ${item.is_available ? 'text-green-500' : 'text-muted-foreground'}`} />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => handleOpenEdit(item)}>
                    <Edit2 className="h-4 w-4 text-primary" />
                  </Button>
                  <Button variant="ghost" size="icon" className="text-destructive hover:bg-destructive/10" onClick={() => deleteIngredient.mutate(item.id)}>
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
            <DrawerTitle>{editingId ? t('edit_ingredient', 'Редагувати') : t('new_ingredient', 'Новий інгредієнт')}</DrawerTitle>
          </DrawerHeader>
          <div className="p-4 space-y-4 max-h-[60vh] overflow-y-auto">
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-semibold text-muted-foreground">Тип</label>
                <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={formData.type} onChange={e => setFormData({ ...formData, type: e.target.value })}>
                  <option value="tobacco">Тютюн</option>
                  <option value="bowl">Чаша</option>
                  <option value="base">Колба</option>
                  <option value="alcohol">Алкоголь</option>
                  <option value="mixer">Міксер</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-semibold text-muted-foreground">Доплата (PLN)</label>
                <Input type="number" value={formData.price_extra} onChange={e => setFormData({ ...formData, price_extra: Number(e.target.value) })} />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-muted-foreground">Обмеження категорії (category_constraint)</label>
              <Input value={formData.category_constraint} onChange={e => setFormData({ ...formData, category_constraint: e.target.value })} placeholder="Напр. hookahs (опціонально)" />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-muted-foreground">Назва (PL)</label>
              <Input value={formData.namePl} onChange={e => setFormData({ ...formData, namePl: e.target.value })} />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-semibold text-muted-foreground">Назва (UA)</label>
              <Input value={formData.nameUa} onChange={e => setFormData({ ...formData, nameUa: e.target.value })} />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-semibold text-muted-foreground">Назва (EN)</label>
              <Input value={formData.nameEn} onChange={e => setFormData({ ...formData, nameEn: e.target.value })} />
            </div>

            <div className="flex items-center gap-2 mt-4 p-3 bg-secondary/50 rounded-xl border border-border">
              <input type="checkbox" id="free_selection" checked={formData.is_free_selection} onChange={e => setFormData({ ...formData, is_free_selection: e.target.checked })} className="h-4 w-4" />
              <label htmlFor="free_selection" className="text-sm font-semibold">Вільний вибір (is_free_selection)</label>
            </div>

          </div>
          <DrawerFooter>
            <Button onClick={handleSubmit} disabled={!formData.namePl || createIngredient.isPending}>
              {editingId ? t('save_changes', 'Зберегти') : t('add', 'Додати')}
            </Button>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </div>
  )
}