import { useState, useEffect, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { Plus, Trash2, Edit, X } from 'lucide-react'
import { supabase } from '../../api/supabase'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import { useAppStore } from '../../store/useAppStore'

export function AdminIngredients() {
  const { t, i18n } = useTranslation()
  const { showAlert } = useAppStore()
  
  const [ingredients, setIngredients] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  
  const [formData, setFormData] = useState({
    name_pl: '', name_ua: '', name_en: '',
    type: '',
    price_extra: '' as string | number,
    is_free_selection: false,
    is_available: true
  })

  const currentLang = (i18n.language || 'pl') as 'pl' | 'ua' | 'en'

  const fetchIngredients = useCallback(async () => {
    setLoading(true)
    const { data, error } = await supabase.from('ingredients').select('*').order('type')
    if (!error && data) setIngredients(data)
    setLoading(false)
  }, [])

  useEffect(() => {
    fetchIngredients()
  }, [fetchIngredients])

  const handleOpenAdd = () => {
    setEditingId(null)
    setFormData({
      name_pl: '', name_ua: '', name_en: '',
      type: '', price_extra: '',
      is_free_selection: false, is_available: true
    })
    setIsFormOpen(true)
  }

  const handleOpenEdit = (ing: any) => {
    setEditingId(ing.id)
    setFormData({
      name_pl: ing.name.pl || '', name_ua: ing.name.ua || '', name_en: ing.name.en || '',
      type: ing.type || '',
      price_extra: ing.price_extra || 0,
      is_free_selection: ing.is_free_selection,
      is_available: ing.is_available
    })
    setIsFormOpen(true)
  }

  const handleSave = async () => {
    if (!formData.name_pl || !formData.type) {
      showAlert(t('attention'), t('ing_fields_required'))
      return
    }

    const payload = {
      name: { pl: formData.name_pl, ua: formData.name_ua, en: formData.name_en },
      type: formData.type.toLowerCase(),
      price_extra: parseFloat(formData.price_extra.toString()) || 0,
      is_free_selection: formData.is_free_selection,
      is_available: formData.is_available
    }

    const { error } = editingId 
      ? await supabase.from('ingredients').update(payload).eq('id', editingId)
      : await supabase.from('ingredients').insert([payload])

    if (error) {
      showAlert(t('error'), error.message)
    } else {
      setIsFormOpen(false)
      fetchIngredients()
    }
  }

  const handleDelete = (id: string, name: string) => {
    showAlert(t('attention'), `${t('delete_confirm')} "${name}"?`, async () => {
      const { error } = await supabase.from('ingredients').delete().eq('id', id)
      if (error) showAlert(t('error'), error.message)
      else fetchIngredients()
    })
  }

  const toggleAvailability = async (id: string, currentStatus: boolean) => {
    const { error } = await supabase.from('ingredients').update({ is_available: !currentStatus }).eq('id', id)
    if (error) showAlert(t('error'), error.message)
    else fetchIngredients()
  }

  return (
    <div className="space-y-4 animate-in fade-in pb-10">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">{t('admin_ingredients_title')}</h2>
        {!isFormOpen && <Button onClick={handleOpenAdd}><Plus className="h-4 w-4 mr-2" /> {t('add')}</Button>}
      </div>

      {isFormOpen && (
        <div className="bg-card p-5 rounded-2xl border border-border shadow-sm space-y-4 animate-in zoom-in-95">
          <div className="flex justify-between items-center border-b border-border/50 pb-2">
            <h3 className="font-semibold">{editingId ? t('edit') : t('new_ingredient')}</h3>
            <Button variant="ghost" size="icon" onClick={() => setIsFormOpen(false)} className="h-8 w-8"><X className="h-4 w-4" /></Button>
          </div>

          <div className="space-y-4">
            <div className="grid gap-3">
              <label className="text-xs font-medium ml-1">{t('name')} (PL*, UA, EN)</label>
              <Input placeholder="Polski *" value={formData.name_pl} onChange={e => setFormData({...formData, name_pl: e.target.value})} />
              <div className="grid grid-cols-2 gap-3">
                <Input placeholder="Українська" value={formData.name_ua} onChange={e => setFormData({...formData, name_ua: e.target.value})} />
                <Input placeholder="English" value={formData.name_en} onChange={e => setFormData({...formData, name_en: e.target.value})} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <label className="text-xs font-medium ml-1">{t('ing_type')} *</label>
                <Input placeholder="milk, syrup, alcohol..." value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})} />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-medium ml-1">{t('price_extra')}</label>
                <Input type="number" placeholder="0.00" value={formData.price_extra} onChange={e => setFormData({...formData, price_extra: e.target.value})} />
              </div>
            </div>

            <div className="flex flex-col gap-3 p-1">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={formData.is_available} onChange={e => setFormData({...formData, is_available: e.target.checked})} className="h-4 w-4 rounded text-primary" />
                <span className="text-sm">{t('is_available_label')}</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={formData.is_free_selection} onChange={e => setFormData({...formData, is_free_selection: e.target.checked})} className="h-4 w-4 rounded text-primary" />
                <div>
                  <span className="text-sm block">{t('is_free_selection')}</span>
                  <span className="text-[10px] text-muted-foreground">{t('is_free_desc')}</span>
                </div>
              </label>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button variant="ghost" onClick={() => setIsFormOpen(false)}>{t('cancel')}</Button>
            <Button onClick={handleSave}>{editingId ? t('save_changes') : t('create')}</Button>
          </div>
        </div>
      )}

      {!loading && !isFormOpen && (
        <div className="grid gap-3">
          {ingredients?.map((ing) => (
            <div key={ing.id} className={`bg-card p-4 rounded-2xl border border-border flex items-center justify-between ${!ing.is_available ? 'opacity-60' : ''}`}>
              <div>
                <div className="flex items-center gap-2">
                  <p className="font-bold">{ing.name[currentLang] || ing.name.pl}</p>
                  <span className="font-bold text-primary text-sm">+{ing.price_extra} zł</span>
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-[10px] uppercase font-bold text-muted-foreground bg-secondary px-2 py-0.5 rounded-md">{ing.type}</span>
                  {ing.is_free_selection && <span className="text-[10px] text-green-500 bg-green-500/10 px-2 py-0.5 rounded-md">{t('free_selection_badge')}</span>}
                </div>
              </div>
              
              <div className="flex items-center gap-1">
                <Button variant={ing.is_available ? 'ghost' : 'default'} size="sm" className="h-8 px-2 text-[10px]" onClick={() => toggleAvailability(ing.id, ing.is_available)}>
                  {ing.is_available ? t('hide') : t('show')}
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-primary" onClick={() => handleOpenEdit(ing)}>
                  <Edit className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => handleDelete(ing.id, ing.name.pl)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
          {ingredients.length === 0 && <p className="text-center text-muted-foreground p-4">{t('no_ingredients')}</p>}
        </div>
      )}
    </div>
  )
}