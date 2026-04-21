import { useTranslation } from 'react-i18next'
import { AlertCircle, X } from 'lucide-react'
import { useAppStore } from '../../store/useAppStore'
import { Button } from './button'

export function GlobalAlert() {
  const { t } = useTranslation()
  const { alertConfig, hideAlert } = useAppStore()

  if (!alertConfig.isOpen) return null

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-background/80 backdrop-blur-sm animate-in fade-in duration-200 px-4">
      <div className="relative w-full max-w-sm bg-card border border-border shadow-2xl rounded-2xl p-6 flex flex-col items-center text-center animate-in zoom-in-95 duration-200">
        <button 
          onClick={hideAlert}
          className="absolute top-4 right-4 p-1 rounded-full hover:bg-secondary transition-colors"
        >
          <X className="h-5 w-5 text-muted-foreground" />
        </button>
        
        <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
          <AlertCircle className="h-6 w-6 text-primary" />
        </div>
        
        <h3 className="text-xl font-bold mb-2 text-foreground">
          {alertConfig.title}
        </h3>
        
        <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
          {alertConfig.message}
        </p>
        
        <Button className="w-full h-12 text-lg rounded-xl" onClick={hideAlert}>
          {t('ok')}
        </Button>
      </div>
    </div>
  )
}