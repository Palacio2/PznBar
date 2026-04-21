import { useTranslation } from 'react-i18next'
import { Bell, CheckCircle2, Coffee, GlassWater, Wind } from 'lucide-react'
import { Button } from '../../components/ui/button'

export function ActiveCallsTab({ calls, isLoading, resolveCall }: any) {
  const { t } = useTranslation()

  if (isLoading) return <p className="text-center text-muted-foreground py-8">{t('loading', 'Завантаження...')}</p>

  if (!calls || calls.length === 0) {
    return (
      <div className="text-center py-16 text-muted-foreground">
        <Bell className="h-16 w-16 mx-auto mb-4 opacity-20" />
        <p className="text-lg">{t('no_active_calls', 'Немає викликів')}</p>
        <p className="text-sm opacity-50 mt-2">Персонал може відпочивати</p>
      </div>
    )
  }

  const getCallIcon = (type: string) => {
    switch (type) {
      case 'waiter': return <Coffee className="h-8 w-8 text-primary" />
      case 'barman': return <GlassWater className="h-8 w-8 text-blue-500" />
      case 'shisha': return <Wind className="h-8 w-8 text-purple-500" />
      default: return <Bell className="h-8 w-8 text-primary" />
    }
  }

  const getCallTitle = (type: string) => {
    switch (type) {
      case 'waiter': return t('waiter', 'Кличе Офіціанта')
      case 'barman': return t('bartender', 'Кличе Бармена')
      case 'shisha': return t('shisha_master', 'Кличе Кальянника')
      default: return t('staff', 'Кличе Персонал')
    }
  }

  return (
    <div className="space-y-4">
      {calls.map((call: any) => (
        <div key={call.id} className="flex items-center justify-between p-4 bg-card border-2 border-border/50 rounded-2xl shadow-sm">
          <div className="flex items-center gap-5">
            <div className="h-16 w-16 bg-secondary rounded-2xl flex items-center justify-center shrink-0 shadow-inner">
              {getCallIcon(call.type)}
            </div>
            <div>
              <h3 className="font-black text-2xl uppercase text-primary leading-tight">
                {t('table', 'Стіл')} {call.table_id}
              </h3>
              <div className="flex flex-col mt-1">
                <span className="text-sm font-bold">{getCallTitle(call.type)}</span>
                <span className="text-xs font-semibold text-muted-foreground mt-1">
                  ⏱ {new Date(call.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </div>
          </div>
          <Button 
            size="icon" 
            className="h-14 w-14 rounded-full bg-green-500 hover:bg-green-600 text-white shadow-lg transition-transform active:scale-95 shrink-0"
            onClick={() => resolveCall.mutate(call.id)}
            disabled={resolveCall.isPending}
          >
            <CheckCircle2 className="h-7 w-7" />
          </Button>
        </div>
      ))}
    </div>
  )
}