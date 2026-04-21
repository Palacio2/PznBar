import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { Moon, Sun, Globe, Scale } from 'lucide-react'
import { useAppStore } from '../store/useAppStore'
import { Button } from '../components/ui/button'

export function SettingsPage() {
  const { t } = useTranslation()
  const { theme, setTheme, language, setLanguage } = useAppStore()
  const navigate = useNavigate()

  return (
    <div className="p-4 space-y-8 pb-24 animate-in fade-in duration-500">
      <header className="mb-8">
        <h1 className="text-3xl font-bold">{t('settings')}</h1>
      </header>

      <section className="space-y-4">
        <div className="flex items-center gap-2 text-muted-foreground mb-2">
          <Globe className="h-5 w-5" />
          <h2 className="text-lg font-semibold uppercase tracking-wider">{t('language')}</h2>
        </div>
        <div className="grid grid-cols-3 gap-3">
          <Button 
            variant={language === 'pl' ? 'default' : 'outline'} 
            onClick={() => setLanguage('pl')}
            className="h-14"
          >
            Polski
          </Button>
          <Button 
            variant={language === 'ua' ? 'default' : 'outline'} 
            onClick={() => setLanguage('ua')}
            className="h-14"
          >
            Українська
          </Button>
          <Button 
            variant={language === 'en' ? 'default' : 'outline'} 
            onClick={() => setLanguage('en')}
            className="h-14"
          >
            English
          </Button>
        </div>
      </section>

      <section className="space-y-4 pt-6 border-t border-border">
        <div className="flex items-center gap-2 text-muted-foreground mb-2">
          {theme === 'dark' ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
          <h2 className="text-lg font-semibold uppercase tracking-wider">{t('theme')}</h2>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Button 
            variant={theme === 'light' ? 'default' : 'outline'} 
            onClick={() => setTheme('light')}
            className="h-14 gap-2"
          >
            <Sun className="h-5 w-5" />
            {t('light_mode')}
          </Button>
          <Button 
            variant={theme === 'dark' ? 'default' : 'outline'} 
            onClick={() => setTheme('dark')}
            className="h-14 gap-2"
          >
            <Moon className="h-5 w-5" />
            {t('dark_mode')}
          </Button>
        </div>
      </section>

      <section className="space-y-3 pt-6 border-t border-border">
        <Button 
          variant="outline" 
          className="w-full h-14 justify-start text-lg"
          onClick={() => navigate('/about')}
        >
          {t('about_us')}
        </Button>
        
        <Button 
          variant="ghost" 
          className="w-full h-14 justify-start text-base text-muted-foreground"
          onClick={() => navigate('/legal')}
        >
          <Scale className="h-5 w-5 mr-3" />
          {t('legal_info')}
        </Button>
      </section>
      
      <div className="text-center mt-8">
        <p className="text-xs text-muted-foreground/50 font-mono">App Version 1.0.0 (PWA)</p>
      </div>
    </div>
  )
}