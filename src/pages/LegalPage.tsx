import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { ChevronLeft, FileText, ShieldCheck } from 'lucide-react'
import { Button } from '../components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs'

export function LegalPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()

  return (
    <div className="pb-24 animate-in fade-in duration-300">
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-md border-b border-border p-4 mb-4 flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="shrink-0">
          <ChevronLeft className="h-6 w-6" />
        </Button>
        <h1 className="text-xl font-bold uppercase tracking-wider line-clamp-1">
          {t('legal_info')}
        </h1>
      </header>

      <main className="px-4">
        <Tabs defaultValue="terms" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="terms" className="gap-2">
              <FileText className="h-4 w-4" />
              <span className="hidden sm:inline">{t('terms_short')}</span>
            </TabsTrigger>
            <TabsTrigger value="privacy" className="gap-2">
              <ShieldCheck className="h-4 w-4" />
              <span className="hidden sm:inline">{t('privacy_short')}</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="terms" className="space-y-4 text-sm text-muted-foreground leading-relaxed">
            <h2 className="text-lg font-bold text-foreground">{t('terms_of_service')}</h2>
            <p>1. Lokal jest przeznaczony dla osób pełnoletnich (18+).</p>
            <p>2. Zastrzegamy sobie prawo do odmowy obsługi osób nietrzeźwych lub agresywnych bez podania przyczyny.</p>
            <p>3. Na terenie lokalu obowiązuje całkowity zakaz wnoszenia własnego alkoholu i jedzenia.</p>
            <p>4. Program lojalnościowy i punkty bonusowe nie podlegają wymianie na gotówkę.</p>
            <p>5. Rezerwacje stolików są trzymane do 15 minut od ustalonej godziny. Po tym czasie rezerwacja może zostać anulowana.</p>
          </TabsContent>

          <TabsContent value="privacy" className="space-y-4 text-sm text-muted-foreground leading-relaxed">
            <h2 className="text-lg font-bold text-foreground">{t('privacy_policy')}</h2>
            <p>1. Administrator Danych: Administratorem Twoich danych osobowych jest Bar Poznan z siedzibą przy ul. Półwiejska 42.</p>
            <p>2. Zbierane dane: Gromadzimy jedynie numer telefonu oraz adres e-mail w celu obsługi programu lojalnościowego (w przypadku rejestracji konta).</p>
            <p>3. Płatności: Nie przechowujemy danych kart płatniczych. Płatności realizowane są na miejscu w lokalu.</p>
            <p>4. Prawa Użytkownika: Masz prawo do wglądu, edycji oraz całkowitego usunięcia swojego konta w każdej chwili.</p>
            <p>5. Ciasteczka (Cookies): Aplikacja korzysta z pamięci lokalnej (Local Storage) wyłącznie w celu zapamiętania Twojego koszyka, motywu i wybranego języka.</p>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}