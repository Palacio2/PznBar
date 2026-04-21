import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Plus, Trash2, Copy, ExternalLink, QrCode } from 'lucide-react'
import { supabase } from '../../api/supabase'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import { useAppStore } from '../../store/useAppStore'

export function AdminTables() {
  const { t } = useTranslation()
  const { showAlert } = useAppStore()
  const [tables, setTables] = useState<any[]>([])
  const [newTableNumber, setNewTableNumber] = useState('')

  const fetchTables = async () => {
    const { data } = await supabase.from('tables').select('*').order('number')
    if (data) setTables(data)
  }

  useEffect(() => { fetchTables() }, [])

  const handleAddTable = async () => {
    if (!newTableNumber) return
    const { error } = await supabase.from('tables').insert([{ number: newTableNumber }])
    if (error) showAlert(t('error'), error.message)
    else {
      setNewTableNumber('')
      fetchTables()
    }
  }

  const handleDelete = async (id: string) => {
    showAlert(t('attention'), t('delete_table_confirm'), async () => {
      await supabase.from('tables').delete().eq('id', id)
      fetchTables()
    })
  }

  const getTableUrl = (num: string) => `${window.location.origin}/?table=${num}`

  const copyToClipboard = (num: string) => {
    navigator.clipboard.writeText(getTableUrl(num))
    showAlert(t('success'), t('link_copied'))
  }

  return (
    <div className="space-y-6 animate-in fade-in">
      <div className="flex flex-col gap-2">
        <h2 className="text-xl font-bold">{t('admin_tables_title')}</h2>
        <div className="flex gap-2">
          <Input 
            placeholder={t('table_number_placeholder')} 
            value={newTableNumber} 
            onChange={(e) => setNewTableNumber(e.target.value)}
          />
          <Button onClick={handleAddTable}><Plus className="h-4 w-4 mr-2" /> {t('add')}</Button>
        </div>
      </div>

      <div className="grid gap-3">
        {tables.map((table) => (
          <div key={table.id} className="bg-card p-4 rounded-2xl border border-border space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-500/10 rounded-lg text-blue-500">
                  <QrCode className="h-6 w-6" />
                </div>
                <span className="text-lg font-bold">{t('table')} №{table.number}</span>
              </div>
              <Button variant="ghost" size="icon" className="text-destructive" onClick={() => handleDelete(table.id)}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="flex gap-2">
              <Input readOnly value={getTableUrl(table.number)} className="text-[10px] h-8 bg-muted" />
              <Button size="icon" variant="outline" className="h-8 w-8 shrink-0" onClick={() => copyToClipboard(table.number)}>
                <Copy className="h-3.5 w-3.5" />
              </Button>
              <Button size="icon" variant="outline" className="h-8 w-8 shrink-0" onClick={() => window.open(getTableUrl(table.number), '_blank')}>
                <ExternalLink className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}