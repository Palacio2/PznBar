import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Plus, Trash2, Edit, X, EyeOff } from 'lucide-react'
import { supabase } from '../../api/supabase'
import { useCategories } from '../../hooks/useMenu'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import { useAppStore } from '../../store/useAppStore'

export function AdminCategories() {
  const { t } = useTranslation()
  const { data: categories, refetch } = useCategories()
  const { showAlert } = useAppStore()
  
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  
  const [formData, setFormData] = useState({
    name_pl: '', name_ua: '', name_en: '', slug: '', sort_order: 0, image_url: '', is_active: true
  })

  const handleOpenAdd = () => {
    setEditingId(null)
    setFormData({ name_pl: '', name_ua: '', name_en: '', slug: '', sort_order: 0, image_url: '', is_active: true })
    setIsFormOpen(true)
  }

  const handleOpenEdit = (cat: any) => {
    setEditingId(cat.id)
    setFormData({
      name_pl: cat.name.pl || '',
      name_ua: cat.name.ua || '',
      name_en: cat.name.en || '',
      slug: cat.slug,
      sort_order: cat.sort_order,
      image_url: cat.image_url || '',
      is_active: cat.is_active
    })
    setIsFormOpen(true)
  }

  const handleSave = async () => {
    if (!formData.name_pl || !formData.slug) {
      showAlert(t('attention'), t('pl_slug_required'))
      return
    }

    const payload = {
      name: { pl: formData.name_pl, ua: formData.name_ua, en: formData.name_en },
      slug: formData.slug,
      sort_order: formData.sort_order,
      image_url: formData.image_url,
      is_active: formData.is_active
    }

    let error;

    if (editingId) {
      const res = await supabase.from('categories').update(payload).eq('id', editingId)
      error = res.error
    } else {
      const res = await supabase.from('categories').insert([payload])
      error = res.error
    }

    if (error) {
      showAlert(t('error'), error.message)
    } else {
      setIsFormOpen(false)
      refetch()
    }
  }

  const handleDeleteClick = (id: string, name: string) => {
    showAlert(
      t('attention'), 
      `${t('delete_category_confirm')} "${name}"?`,
      async () => {
        const { error } = await supabase.from('categories').delete().eq('id', id)
        if (error) showAlert(t('error'), error.message)
        else refetch()
      }
    )
  }

  return (
    <div className="space-y-4 animate-in fade-in">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">{t('admin_categories_title')}</h2>
        {!isFormOpen && (
          <Button onClick={handleOpenAdd}>
            <Plus className="h-4 w-4 mr-2" /> {t('add')}
          </Button>
        )}
      </div>

      {isFormOpen && (
        <div className="bg-card p-5 rounded-2xl border border-border shadow-sm space-y-4 animate-in zoom-in-95">
          <div className="flex justify-between items-center border-b border-border/50 pb-2">
            <h3 className="font-semibold">{editingId ? t('edit_category') : t('new_category')}</h3>
            <Button variant="ghost" size="icon" onClick={() => setIsFormOpen(false)} className="h-8 w-8">
              <X className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="space-y-3">
            <div>
              <label className="text-xs text-muted-foreground ml-1">{t('name_pl_req')}</label>
              <Input value={formData.name_pl} onChange={e => setFormData({...formData, name_pl: e.target.value})} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-muted-foreground ml-1">{t('name_ua')}</label>
                <Input value={formData.name_ua} onChange={e => setFormData({...formData, name_ua: e.target.value})} />
              </div>
              <div>
                <label className="text-xs text-muted-foreground ml-1">{t('name_en')}</label>
                <Input value={formData.name_en} onChange={e => setFormData({...formData, name_en: e.target.value})} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-muted-foreground ml-1">{t('slug_req')}</label>
                <Input value={formData.slug} onChange={e => setFormData({...formData, slug: e.target.value.toLowerCase()})} />
              </div>
              <div>
                <label className="text-xs text-muted-foreground ml-1">{t('sort_order')}</label>
                <Input type="number" value={formData.sort_order} onChange={e => setFormData({...formData, sort_order: parseInt(e.target.value) || 0})} />
              </div>
            </div>
            <div>
              <label className="text-xs text-muted-foreground ml-1">{t('image_url_label')}</label>
              <Input value={formData.image_url} onChange={e => setFormData({...formData, image_url: e.target.value})} />
            </div>
            <div className="flex items-center gap-2 pt-1 pl-1">
              <input 
                type="checkbox" 
                checked={formData.is_active} 
                onChange={e => setFormData({...formData, is_active: e.target.checked})} 
                className="h-4 w-4 rounded border-border text-primary focus:ring-primary"
              />
              <label className="text-sm font-medium cursor-pointer" onClick={() => setFormData({...formData, is_active: !formData.is_active})}>
                {t('is_active_label')}
              </label>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="ghost" onClick={() => setIsFormOpen(false)}>{t('cancel')}</Button>
            <Button onClick={handleSave}>{editingId ? t('save_changes') : t('create')}</Button>
          </div>
        </div>
      )}

      <div className="bg-card rounded-2xl border border-border overflow-hidden shadow-sm">
        {categories?.map((cat) => (
          <div key={cat.id} className={`flex items-center justify-between p-4 border-b border-border/50 last:border-0 hover:bg-secondary/20 transition-colors ${!cat.is_active ? 'opacity-50' : ''}`}>
            <div className="flex items-center gap-4">
              {cat.image_url ? (
                <div className="h-12 w-12 rounded-lg bg-muted overflow-hidden shrink-0">
                  <img src={cat.image_url} alt="" className="h-full w-full object-cover" />
                </div>
              ) : (
                <div className="h-12 w-12 rounded-lg bg-secondary flex items-center justify-center shrink-0">
                  <span className="text-xs text-muted-foreground">No img</span>
                </div>
              )}
              <div>
                <div className="flex items-center gap-2">
                  <p className="font-bold">{cat.name.pl}</p>
                  {!cat.is_active && <EyeOff className="h-3 w-3 text-destructive" />}
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs text-muted-foreground bg-secondary px-2 py-0.5 rounded-md">/{cat.slug}</span>
                  <span className="text-[10px] text-muted-foreground">Sort: {cat.sort_order}</span>
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="icon" onClick={() => handleOpenEdit(cat)}>
                <Edit className="h-4 w-4 text-primary" />
              </Button>
              <Button variant="ghost" size="icon" className="hover:bg-destructive/10 hover:text-destructive" onClick={() => handleDeleteClick(cat.id, cat.name.pl)}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}
        {(!categories || categories.length === 0) && (
          <div className="p-8 text-center text-muted-foreground">
            {t('no_categories')}
          </div>
        )}
      </div>
    </div>
  )
}