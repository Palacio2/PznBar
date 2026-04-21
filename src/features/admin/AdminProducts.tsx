import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Plus, Trash2, Edit, X, ImageIcon, Search } from 'lucide-react'
import { supabase } from '../../api/supabase'
import { useProducts, useCategories } from '../../hooks/useMenu'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import { useAppStore } from '../../store/useAppStore'

export function AdminProducts() {
  const { t, i18n } = useTranslation()
  const { data: products, refetch: refetchProducts } = useProducts()
  const { data: categories } = useCategories()
  const { showAlert } = useAppStore()
  
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')

  const [formData, setFormData] = useState({
    category_id: '',
    name_pl: '', name_ua: '', name_en: '',
    description_pl: '', description_ua: '', description_en: '',
    price: '' as string | number, 
    bonus_reward: '' as string | number, 
    bonus_price: '' as string | number,
    image_url: '', is_available: true, is_constructor: false,
    allergens: '', tags: ''
  })

  const currentLang = (i18n.language || 'pl') as 'pl' | 'ua' | 'en'

  const filteredProducts = products?.filter(p => {
    const matchesSearch = p.name[currentLang]?.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          p.name.pl.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = selectedCategory === 'all' || p.category_id === selectedCategory
    return matchesSearch && matchesCategory
  })

  const handleOpenAdd = () => {
    setEditingId(null)
    setFormData({
      category_id: categories?.[0]?.id || '',
      name_pl: '', name_ua: '', name_en: '',
      description_pl: '', description_ua: '', description_en: '',
      price: '', bonus_reward: '', bonus_price: '',
      image_url: '', is_available: true, is_constructor: false,
      allergens: '', tags: ''
    })
    setIsFormOpen(true)
  }

  const handleOpenEdit = (p: any) => {
    setEditingId(p.id)
    setFormData({
      category_id: p.category_id,
      name_pl: p.name.pl || '', name_ua: p.name.ua || '', name_en: p.name.en || '',
      description_pl: p.description?.pl || '', description_ua: p.description?.ua || '', description_en: p.description?.en || '',
      price: p.price,
      bonus_reward: p.bonus_reward,
      bonus_price: p.bonus_price?.toString() || '',
      image_url: p.image_url || '',
      is_available: p.is_available,
      is_constructor: p.is_constructor,
      allergens: p.allergens?.join(', ') || '',
      tags: p.tags?.join(', ') || ''
    })
    setIsFormOpen(true)
  }

  const handleSave = async () => {
    if (!formData.name_pl || !formData.price || !formData.category_id) {
      showAlert(t('attention'), t('fields_required'))
      return
    }

    // Виправлення помилки TS: String() гарантує, що ми передаємо рядок
    const payload = {
      category_id: formData.category_id,
      name: { pl: formData.name_pl, ua: formData.name_ua, en: formData.name_en },
      description: { pl: formData.description_pl, ua: formData.description_ua, en: formData.description_en },
      price: parseFloat(String(formData.price)),
      bonus_reward: parseInt(String(formData.bonus_reward)) || 0,
      bonus_price: formData.bonus_price ? parseInt(String(formData.bonus_price)) : null,
      image_url: formData.image_url,
      is_available: formData.is_available,
      is_constructor: formData.is_constructor,
      allergens: formData.allergens.split(',').map(s => s.trim()).filter(Boolean),
      tags: formData.tags.split(',').map(s => s.trim()).filter(Boolean)
    }

    const { error } = editingId 
      ? await supabase.from('products').update(payload).eq('id', editingId)
      : await supabase.from('products').insert([payload])

    if (error) showAlert(t('error'), error.message)
    else {
      setIsFormOpen(false)
      refetchProducts()
    }
  }

  const toggleAvailability = async (id: string, currentStatus: boolean) => {
    const { error } = await supabase.from('products').update({ is_available: !currentStatus }).eq('id', id)
    if (error) showAlert(t('error'), error.message)
    else refetchProducts()
  }

  return (
    <div className="space-y-4 animate-in fade-in pb-10">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">{t('admin_products_title')}</h2>
        {!isFormOpen && <Button onClick={handleOpenAdd}><Plus className="h-4 w-4 mr-2" /> {t('add')}</Button>}
      </div>

      {!isFormOpen && (
        <div className="flex flex-col gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input className="pl-9 bg-card" placeholder={t('search_placeholder')} value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
          </div>
          <div className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar">
            <Button variant={selectedCategory === 'all' ? 'default' : 'outline'} size="sm" onClick={() => setSelectedCategory('all')} className="rounded-full shrink-0">
              {t('all')}
            </Button>
            {categories?.map(cat => (
              <Button key={cat.id} variant={selectedCategory === cat.id ? 'default' : 'outline'} size="sm" onClick={() => setSelectedCategory(cat.id)} className="rounded-full shrink-0">
                {cat.name[currentLang] || cat.name.pl}
              </Button>
            ))}
          </div>
        </div>
      )}

      {isFormOpen && (
        <div className="bg-card p-5 rounded-2xl border border-border shadow-sm space-y-4 animate-in zoom-in-95">
          <div className="flex justify-between items-center border-b border-border/50 pb-2">
            <h3 className="font-semibold">{editingId ? t('edit_product') : t('new_product')}</h3>
            <Button variant="ghost" size="icon" onClick={() => setIsFormOpen(false)} className="h-8 w-8"><X className="h-4 w-4" /></Button>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-medium ml-1">{t('category')} *</label>
              <select 
                className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                value={formData.category_id}
                onChange={e => setFormData({...formData, category_id: e.target.value})}
              >
                {categories?.map(cat => <option key={cat.id} value={cat.id}>{cat.name.pl}</option>)}
              </select>
            </div>

            <div className="grid gap-3">
              <label className="text-xs font-medium ml-1">{t('name')} (PL*, UA, EN)</label>
              <Input placeholder="Polski *" value={formData.name_pl} onChange={e => setFormData({...formData, name_pl: e.target.value})} />
              <div className="grid grid-cols-2 gap-3">
                <Input placeholder="Українська" value={formData.name_ua} onChange={e => setFormData({...formData, name_ua: e.target.value})} />
                <Input placeholder="English" value={formData.name_en} onChange={e => setFormData({...formData, name_en: e.target.value})} />
              </div>
            </div>

            <div className="grid gap-2">
              <label className="text-xs font-medium ml-1">{t('price_settings')}</label>
              <div className="grid grid-cols-3 gap-3">
                <Input type="number" placeholder={t('price')} value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} />
                <Input type="number" placeholder={t('bonus_reward')} value={formData.bonus_reward} onChange={e => setFormData({...formData, bonus_reward: e.target.value})} />
                <Input type="number" placeholder={t('bonus_price')} value={formData.bonus_price} onChange={e => setFormData({...formData, bonus_price: e.target.value})} />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-medium ml-1">{t('image_url_label')}</label>
              <Input value={formData.image_url} onChange={e => setFormData({...formData, image_url: e.target.value})} />
            </div>

            <div className="flex gap-4 p-1">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={formData.is_available} onChange={e => setFormData({...formData, is_available: e.target.checked})} className="h-4 w-4 rounded text-primary" />
                <span className="text-sm">{t('is_available_label')}</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={formData.is_constructor} onChange={e => setFormData({...formData, is_constructor: e.target.checked})} className="h-4 w-4 rounded text-primary" />
                <span className="text-sm">{t('is_constructor')}</span>
              </label>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-medium ml-1">{t('allergens')} ({t('comma_separated')})</label>
              <Input value={formData.allergens} onChange={e => setFormData({...formData, allergens: e.target.value})} />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button variant="ghost" onClick={() => setIsFormOpen(false)}>{t('cancel')}</Button>
            <Button onClick={handleSave}>{editingId ? t('save_changes') : t('create')}</Button>
          </div>
        </div>
      )}

      <div className="grid gap-3">
        {filteredProducts?.map((p) => (
          <div key={p.id} className={`bg-card rounded-2xl border border-border overflow-hidden flex flex-col ${!p.is_available ? 'opacity-60' : ''}`}>
            <div className="flex p-3 gap-3">
              <div className="h-20 w-20 rounded-xl bg-muted shrink-0 overflow-hidden relative">
                {p.image_url ? <img src={p.image_url} className="h-full w-full object-cover" /> : <ImageIcon className="h-full w-full p-5 text-muted-foreground/20" />}
              </div>
              <div className="flex-1 min-w-0 flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start">
                    <h4 className="font-bold text-sm truncate">{p.name[currentLang] || p.name.pl}</h4>
                    <span className="font-bold text-primary text-sm">{p.price} zł</span>
                  </div>
                  <p className="text-[10px] text-muted-foreground truncate">{categories?.find(c => c.id === p.category_id)?.name.pl}</p>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="h-8 px-2 text-[10px]" onClick={() => handleOpenEdit(p)}><Edit className="h-3.5 w-3.5 mr-1" /> {t('edit')}</Button>
                  <Button variant={p.is_available ? 'outline' : 'default'} size="sm" className="h-8 px-2 text-[10px]" onClick={() => toggleAvailability(p.id, p.is_available)}>
                    {p.is_available ? t('hide') : t('show')}
                  </Button>
                  <Button variant="ghost" size="sm" className="h-8 px-2 text-[10px] text-destructive ml-auto" onClick={() => showAlert(t('attention'), t('delete_confirm'), async () => { await supabase.from('products').delete().eq('id', p.id); refetchProducts(); })}>
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}