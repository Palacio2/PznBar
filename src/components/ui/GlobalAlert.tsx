import { useTranslation } from 'react-i18next'
import { AlertCircle, X, Trash2 } from 'lucide-react'
import { useAppStore } from '../../store/useAppStore'
import { Button } from './button'

export function GlobalAlert() {
  const { t } = useTranslation()
  const { alertConfig, hideAlert } = useAppStore()

  if (!alertConfig.isOpen) return null

  const isConfirmation = !!alertConfig.onConfirm

  const handleConfirm = () => {
    const action = alertConfig.onConfirm
    hideAlert()
    
    if (action) {
      queueMicrotask(() => action())
    }
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-background/80 backdrop-blur-sm animate-in fade-in duration-200 px-4 pointer-events-auto">
      <div className="relative w-full max-w-sm bg-card border border-border shadow-2xl rounded-2xl p-6 flex flex-col items-center text-center animate-in zoom-in-95 duration-200">
        <button 
          onClick={hideAlert}
          className="absolute top-4 right-4 p-1 rounded-full hover:bg-secondary transition-colors"
        >
          <X className="h-5 w-5 text-muted-foreground" />
        </button>
        
        <div className={`h-12 w-12 rounded-full flex items-center justify-center mb-4 ${isConfirmation ? 'bg-destructive/10' : 'bg-primary/10'}`}>
          {isConfirmation ? (
            <Trash2 className="h-6 w-6 text-destructive" />
          ) : (
            <AlertCircle className="h-6 w-6 text-primary" />
          )}
        </div>
        
        <h3 className="text-xl font-bold mb-2 text-foreground">
          {alertConfig.title}
        </h3>
        
        <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
          {alertConfig.message}
        </p>
        
        {isConfirmation ? (
          <div className="flex w-full gap-3">
            <Button variant="outline" className="flex-1 h-12 rounded-xl" onClick={hideAlert}>
              {t('cancel')}
            </Button>
            <Button variant="destructive" className="flex-1 h-12 rounded-xl" onClick={handleConfirm}>
              {t('confirm')}
            </Button>
          </div>
        ) : (
          <Button className="w-full h-12 text-lg rounded-xl" onClick={hideAlert}>
            {t('ok')}
          </Button>
        )}
      </div>
    </div>
  )
}