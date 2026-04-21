import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ChevronLeft, Plus, Trash2, QrCode, Download, Copy, CheckCircle2, Edit2 } from 'lucide-react'
import { useAdminTables, RestaurantTable } from '../../hooks/useAdminTables'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerFooter } from '../../components/ui/drawer'

export function AdminTablesPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { useTablesList, createTable, updateTable, deleteTable } = useAdminTables()
  const { data: tables, isLoading } = useTablesList()

  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const [isQrDrawerOpen, setIsQrDrawerOpen] = useState(false)
  
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState({ number: '', pinCode: '' })
  const [formError, setFormError] = useState<string | null>(null)
  
  const [selectedTable, setSelectedTable] = useState<RestaurantTable | null>(null)
  const [copied, setCopied] = useState(false)

  // Встановлюємо ваш фінальний домен для QR-кодів
  const baseUrl = 'https://pzn-bar.vercel.app'
  const tableLink = selectedTable ? `${baseUrl}/?table=${encodeURIComponent(selectedTable.number)}` : ''
  const qrImageUrl = tableLink ? `https://api.qrserver.com/v1/create-qr-code/?size=500x500&data=${encodeURIComponent(tableLink)}` : ''

  const handleOpenCreate = () => {
    setEditingId(null)
    setFormData({ number: '', pinCode: '' })
    setFormError(null)
    setIsDrawerOpen(true)
  }

  const handleOpenEdit = (table: RestaurantTable) => {
    setEditingId(table.id)
    setFormData({ number: table.number, pinCode: table.pin_code || '' })
    setFormError(null)
    setIsDrawerOpen(true)
  }

  const handleSubmit = () => {
    setFormError(null)
    const payload = {
      number: formData.number.trim(),
      pin_code: formData.pinCode.trim() || '0000'
    }

    if (editingId) {
      updateTable.mutate({ id: editingId, updates: payload }, {
        onSuccess: () => setIsDrawerOpen(false),
        onError: (error: any) => setFormError(error.message || t('error_saving', 'Помилка збереження'))
      })
    } else {
      createTable.mutate(payload, {
        onSuccess: () => setIsDrawerOpen(false),
        onError: (error: any) => setFormError(error.message || t('error_creating', 'Помилка створення'))
      })
    }
  }

  const openQrCode = (table: RestaurantTable) => {
    setSelectedTable(table)
    setIsQrDrawerOpen(true)
    setCopied(false)
  }

  const copyToClipboard = () => {
    if (tableLink) {
      navigator.clipboard.writeText(tableLink)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const downloadQR = async () => {
    if (!qrImageUrl || !selectedTable) return
    try {
      const response = await fetch(qrImageUrl)
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `table-${selectedTable.number}-qr.png`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
    } catch (err) {
      console.error('Download failed', err)
    }
  }

  return (
    <div className="pb-24 animate-in fade-in duration-300">
      <header className="sticky top-0 z-40 bg-background/90 backdrop-blur-md border-b border-border p-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="shrink-0">
            <ChevronLeft className="h-6 w-6" />
          </Button>
          <h1 className="text-xl font-bold uppercase tracking-tight">{t('admin_tables', 'Столики та QR')}</h1>
        </div>
        <Button size="sm" onClick={handleOpenCreate}>
          <Plus className="h-4 w-4 mr-2" /> {t('add', 'Додати')}
        </Button>
      </header>

      <main className="p-4 space-y-4">
        {isLoading ? (
          <p className="text-muted-foreground text-center py-8 animate-pulse">{t('loading', 'Завантаження...')}</p>
        ) : tables?.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground flex flex-col items-center">
            <QrCode className="h-16 w-16 mb-4 opacity-20" />
            <p>{t('no_tables', 'Столики ще не створені')}</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            {tables?.map(table => (
              <div key={table.id} className="flex flex-col bg-card border-2 border-border/50 rounded-3xl shadow-sm overflow-hidden transition-all hover:border-primary/50">
                <div 
                  className="p-6 flex flex-col items-center justify-center gap-1 bg-secondary/30 cursor-pointer hover:bg-secondary/50 transition-colors"
                  onClick={() => openQrCode(table)}
                >
                  <QrCode className="h-10 w-10 text-primary mb-1" />
                  <h3 className="font-black text-2xl tracking-tighter">{table.number}</h3>
                  <span className="text-[10px] font-bold text-muted-foreground bg-background px-2.5 py-1 rounded-full border border-border/50 shadow-sm uppercase tracking-widest">
                    PIN: {table.pin_code || '0000'}
                  </span>
                </div>
                <div className="flex border-t border-border/50 divide-x divide-border/50">
                  <Button 
                    variant="ghost" 
                    className="flex-1 rounded-none h-12 text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:text-foreground"
                    onClick={() => openQrCode(table)}
                  >
                    QR Код
                  </Button>
                  <Button 
                    variant="ghost" 
                    className="flex-[0.5] rounded-none h-12 hover:bg-secondary/50"
                    onClick={() => handleOpenEdit(table)}
                  >
                    <Edit2 className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    className="flex-[0.5] rounded-none h-12 text-destructive hover:bg-destructive/10"
                    onClick={() => deleteTable.mutate(table.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      <Drawer open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle className="text-center font-black uppercase tracking-widest">
              {editingId ? t('edit_table', 'Редагувати столик') : t('new_table', 'Новий столик')}
            </DrawerTitle>
          </DrawerHeader>
          <div className="p-4 space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                  {t('table_number_label', 'Номер столика')}
                </label>
                <Input 
                  value={formData.number} 
                  onChange={e => setFormData({ ...formData, number: e.target.value })} 
                  placeholder="Наприклад: 12" 
                  className="h-12 rounded-xl font-bold"
                  autoFocus={!editingId}
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                  {t('pin_code_label', 'ПІН-код (4 цифри)')}
                </label>
                <Input 
                  value={formData.pinCode} 
                  onChange={e => setFormData({ ...formData, pinCode: e.target.value.replace(/\D/g, '').slice(0, 4) })} 
                  placeholder="1234"
                  maxLength={4}
                  type="text"
                  pattern="\d*"
                  className="h-12 rounded-xl font-bold text-center tracking-[0.5em]"
                />
              </div>
            </div>
            {formError && <p className="text-xs font-bold text-destructive text-center animate-in fade-in">{formError}</p>}
          </div>
          <DrawerFooter>
            <Button 
              onClick={handleSubmit} 
              disabled={!formData.number.trim() || createTable.isPending || updateTable.isPending}
              className="h-14 rounded-2xl text-lg font-black shadow-lg"
            >
              {editingId ? t('save_changes', 'Зберегти зміни') : t('create_table', 'Створити столик')}
            </Button>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>

      <Drawer open={isQrDrawerOpen} onOpenChange={setIsQrDrawerOpen}>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle className="text-center text-3xl font-black uppercase tracking-tighter mb-2">
              {t('table', 'Стіл')} {selectedTable?.number}
            </DrawerTitle>
          </DrawerHeader>
          <div className="p-4 flex flex-col items-center space-y-6">
            
            <div className="bg-white p-6 rounded-[2.5rem] shadow-2xl border-4 border-primary/10 max-w-[300px] w-full aspect-square relative mb-4">
              {qrImageUrl && (
                <img src={qrImageUrl} alt="QR Code" className="w-full h-full object-contain" />
              )}
              <div className="absolute -bottom-5 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground px-8 py-2.5 rounded-full text-xl font-black shadow-xl border-4 border-background whitespace-nowrap tracking-widest">
                PIN: {selectedTable?.pin_code || '0000'}
              </div>
            </div>

            <div className="w-full space-y-3 mt-4">
              <div className="flex items-center gap-2 p-3.5 bg-secondary/50 rounded-2xl border border-border/50">
                <span className="text-[10px] text-muted-foreground truncate flex-1 font-mono font-bold uppercase tracking-tight">
                  {tableLink}
                </span>
                <Button variant="outline" size="icon" className="shrink-0 h-10 w-10 rounded-xl" onClick={copyToClipboard}>
                  {copied ? <CheckCircle2 className="h-5 w-5 text-green-500" /> : <Copy className="h-5 w-5" />}
                </Button>
              </div>

              <Button className="w-full h-14 gap-3 text-lg font-black rounded-2xl shadow-xl" onClick={downloadQR}>
                <Download className="h-6 w-6" />
                {t('download_qr', 'Завантажити QR-код')}
              </Button>
            </div>

          </div>
        </DrawerContent>
      </Drawer>
    </div>
  )
}