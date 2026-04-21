import { useTranslation } from 'react-i18next'
import { Bell, Wind, Martini, CheckCircle2 } from 'lucide-react'
import { Button } from '../../components/ui/button'
import { Badge } from '../../components/ui/badge'
import { useResolveServiceCall, useClearTable } from '../../hooks/useStaffData'

interface StaffHallProps {
  tables: any[]
  orders: any[]
  serviceCalls: any[]
}

export function StaffHall({ tables, orders, serviceCalls }: StaffHallProps) {
  const { t } = useTranslation()
  const { mutate: resolveCall } = useResolveServiceCall()
  const { mutate: clearTable, isPending: isClearing } = useClearTable()

  const getTableStatus = (tableId: string) => {
    // Зверни увагу: тут використовується tableId (який насправді є table.number)
    const tableOrders = orders.filter(o => o.table_id === tableId && ['new', 'preparing', 'served'].includes(o.status))
    const tableCalls = serviceCalls.filter(c => c.table_id === tableId)
    
    return {
      isOccupied: tableOrders.length > 0,
      calls: tableCalls,
      activeOrdersCount: tableOrders.length
    }
  }

  const getServiceIcon = (type: string) => {
    switch (type) {
      case 'shisha': return <Wind className="h-5 w-5" />
      case 'bartender': return <Martini className="h-5 w-5" />
      default: return <Bell className="h-5 w-5" />
    }
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 animate-in fade-in">
      {tables.map(table => {
        // Використовуємо table.number для перевірки статусу (виправлення, яке ми робили раніше)
        const status = getTableStatus(table.number) 
        
        return (
          <div 
            key={table.id} 
            className={`relative p-4 rounded-2xl border-2 transition-all flex flex-col items-center justify-center min-h-[120px] shadow-sm
              ${status.calls.length > 0 ? 'border-destructive bg-destructive/10 animate-pulse' : 
                status.isOccupied ? 'border-orange-500/50 bg-orange-500/10' : 'border-green-500/50 bg-green-500/5'}
            `}
          >
            <span className="text-2xl font-bold mb-1">#{table.number || table.id}</span>
            
            {status.calls.length > 0 ? (
              <div className="flex flex-col items-center gap-2 mt-2 w-full">
                <div className="flex gap-1 text-destructive">
                  {status.calls.map((call: any) => (
                    <div key={call.id} className="bg-destructive/20 p-1.5 rounded-full" title={call.type}>
                      {getServiceIcon(call.type)}
                    </div>
                  ))}
                </div>
                <Button 
                  size="sm" 
                  variant="destructive" 
                  className="w-full text-xs h-8"
                  onClick={() => status.calls.forEach((call: any) => resolveCall(call.id))}
                >
                  <CheckCircle2 className="h-3 w-3 mr-1" /> Виконано
                </Button>
              </div>
            ) : status.isOccupied ? (
              <div className="flex flex-col items-center gap-2 mt-2 w-full">
                <Badge variant="outline" className="border-orange-500 text-orange-600 bg-background">
                  Активних: {status.activeOrdersCount}
                </Badge>
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="w-full text-xs h-8 text-orange-600 border-orange-500 hover:bg-orange-500/10"
                  onClick={() => clearTable(table.number)}
                  disabled={isClearing}
                >
                  Звільнити стіл
                </Button>
              </div>
            ) : (
              <Badge variant="outline" className="border-green-500 text-green-600 bg-background">
                Вільний
              </Badge>
            )}
          </div>
        )
      })}
    </div>
  )
}