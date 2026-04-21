import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { supabase } from '../api/supabase'
import { useAppStore } from '../store/useAppStore'
import { Button } from '../components/ui/button'
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card'
import { Badge } from '../components/ui/badge'
import { Award, Phone, Share2, History, LogOut } from 'lucide-react'
import { AuthForm } from '../features/auth/AuthForm'
import { OrderHistoryDrawer } from '../features/profile/OrderHistoryDrawer'
import { ReferralDrawer } from '../features/profile/ReferralDrawer'

export function ProfilePage() {
  const { t } = useTranslation()
  const { user } = useAppStore()
  
  const [isHistoryOpen, setIsHistoryOpen] = useState(false)
  const [isReferralOpen, setIsReferralOpen] = useState(false)

  const handleLogout = async () => {
    await supabase.auth.signOut()
  }

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh] p-4">
        <AuthForm />
      </div>
    )
  }

  return (
    <div className="p-4 space-y-6 pb-24 animate-in fade-in duration-500">
      <header className="mb-4">
        <h1 className="text-3xl font-bold">{t('profile')}</h1>
      </header>

      <Card className="bg-primary text-primary-foreground border-none overflow-hidden relative">
        <div className="absolute top-0 right-0 p-6 opacity-10">
          <Award className="h-32 w-32" />
        </div>
        <CardHeader className="relative z-10 pb-2">
          <CardTitle className="text-lg font-medium opacity-90">{t('welcome_club')}</CardTitle>
        </CardHeader>
        <CardContent className="relative z-10">
          <div className="text-4xl font-bold mb-1">{user.bonus_points}</div>
          <p className="text-sm opacity-80">{t('points_available')}</p>
        </CardContent>
      </Card>

      <div className="flex items-center gap-4 p-4 rounded-xl border bg-card">
        <div className="h-10 w-10 rounded-full bg-secondary flex items-center justify-center">
          <Phone className="h-5 w-5 text-muted-foreground" />
        </div>
        <div>
          <p className="text-xs text-muted-foreground">{t('phone')}</p>
          <p className="font-medium">{user.phone || t('not_set')}</p>
        </div>
      </div>

      <Button 
        variant="outline" 
        className="w-full h-16 justify-between px-6 rounded-xl"
        onClick={() => setIsHistoryOpen(true)}
      >
        <div className="flex items-center gap-3">
          <History className="h-5 w-5" />
          <span>{t('order_history')}</span>
        </div>
      </Button>

      <Button 
        variant="outline" 
        className="w-full h-16 justify-between px-6 rounded-xl"
        onClick={() => setIsReferralOpen(true)}
      >
        <div className="flex items-center gap-3">
          <Share2 className="h-5 w-5" />
          <span>{t('referral_program')}</span>
        </div>
        <Badge variant="secondary">{user.referral_code}</Badge>
      </Button>

      <Button 
        variant="ghost" 
        className="w-full h-14 justify-center text-destructive hover:bg-destructive/10 hover:text-destructive mt-8"
        onClick={handleLogout}
      >
        <LogOut className="h-5 w-5 mr-2" />
        {t('logout')}
      </Button>

      <OrderHistoryDrawer isOpen={isHistoryOpen} onClose={() => setIsHistoryOpen(false)} />
      <ReferralDrawer isOpen={isReferralOpen} onClose={() => setIsReferralOpen(false)} />
    </div>
  )
}