import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { MapPin, Clock, Camera, Phone, ChevronLeft } from 'lucide-react'
import { Card, CardContent } from '../components/ui/card'
import { Button } from '../components/ui/button'

export function AboutPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()

  return (
    <div className="pb-24 animate-in fade-in duration-300">
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-md border-b border-border p-4 mb-4 flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="shrink-0">
          <ChevronLeft className="h-6 w-6" />
        </Button>
        <h1 className="text-xl font-bold uppercase tracking-wider line-clamp-1">{t('about_us')}</h1>
      </header>

      <main className="px-4 space-y-6">
        <div className="w-full h-48 sm:h-64 bg-muted rounded-2xl overflow-hidden relative">
          <img 
            src="https://images.unsplash.com/photo-1514933651103-005eec06c04b?q=80&w=1000" 
            alt="Bar interior" 
            className="w-full h-full object-cover" 
          />
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
            <h2 className="text-3xl font-bold text-white tracking-widest uppercase">Bar Poznan</h2>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Card>
            <CardContent className="p-4 flex items-center gap-4">
              <div className="bg-primary/10 p-3 rounded-full shrink-0">
                <MapPin className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="font-semibold text-base sm:text-lg">{t('address_title')}</p>
                <p className="text-sm sm:text-base text-muted-foreground">ul. Półwiejska 42, Poznań</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 flex items-center gap-4">
              <div className="bg-orange-500/10 p-3 rounded-full shrink-0">
                <Clock className="h-6 w-6 text-orange-500" />
              </div>
              <div>
                <p className="font-semibold text-base sm:text-lg">{t('hours_title')}</p>
                <p className="text-sm sm:text-base text-muted-foreground">16:00 - 02:00</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 flex items-center gap-4">
              <div className="bg-pink-500/10 p-3 rounded-full shrink-0">
                <Camera className="h-6 w-6 text-pink-500" />
              </div>
              <div>
                <p className="font-semibold text-base sm:text-lg">Instagram</p>
                <p className="text-sm sm:text-base text-muted-foreground break-words">@bar_poznan</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 flex items-center gap-4">
              <div className="bg-green-500/10 p-3 rounded-full shrink-0">
                <Phone className="h-6 w-6 text-green-500" />
              </div>
              <div>
                <p className="font-semibold text-base sm:text-lg">{t('phone')}</p>
                <p className="text-sm sm:text-base text-muted-foreground break-words">+48 123 456 789</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="w-full h-64 sm:h-80 bg-muted rounded-2xl overflow-hidden relative border border-border">
          <iframe 
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2434.34964645063!2d16.92728281580295!3d52.40058897979339!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x47045b387e68d011%3A0x6b8bc210041d1a8e!2zUMOzxYJ3aWVqc2thIDQyLCA2MS04ODggUG96bmHFhQ!5e0!3m2!1sen!2spl!4v1680000000000!5m2!1sen!2spl" 
            width="100%" 
            height="100%" 
            style={{ border: 0 }} 
            allowFullScreen 
            loading="lazy" 
            referrerPolicy="no-referrer-when-downgrade"
          />
        </div>
      </main>
    </div>
  )
}