import { useTranslation } from 'react-i18next'
import { MapPin, LogOut } from 'lucide-react'
import { Button } from '../../components/ui/button'

export function StaffTablesTab({ tables, isLoading, clearTableSession }: any) {
  const { t } = useTranslation()

  if (isLoading) return <p className="text-center text-muted-foreground py-8">{t('loading', 'Завантаження...')}</p>

  return (
    <div className="grid grid-cols-2 gap-4">
      {tables?.map((table: any) => (
        <div key={table.id} className="bg-card border-2 border-border/50 rounded-2xl p-4 flex flex-col items-center justify-center gap-3 shadow-sm">
          <div className="flex items-center gap-2">
            <MapPin className="h-6 w-6 text-primary" />
            <span className="text-2xl font-black uppercase text-primary">
              {t('table', 'Стіл')} {table.number}
            </span>
          </div>
          
          <Button 
            variant="outline" 
            className="w-full h-12 mt-2 text-destructive border-destructive/30 hover:bg-destructive hover:text-white font-bold"
            onClick={() => {
              if (window.confirm(t('confirm_clear_table', `Звільнити Стіл {{number}}? Всі гості будуть відключені.`, { number: table.number }))) {
                clearTableSession.mutate(table.number)
              }
            }}
            disabled={clearTableSession.isPending}
          >
            <LogOut className="h-4 w-4 mr-2" />
            {t('clear_table', 'Звільнити')}
          </Button>
        </div>
      ))}
    </div>
  )
}