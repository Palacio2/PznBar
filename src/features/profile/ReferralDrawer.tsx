import { useTranslation } from 'react-i18next'
import { useAppStore } from '../../store/useAppStore'
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerDescription } from '../../components/ui/drawer'
import { Button } from '../../components/ui/button'
import { Copy, Share2, Check } from 'lucide-react'
import { useState } from 'react'

interface ReferralDrawerProps {
  isOpen: boolean
  onClose: () => void
}

export function ReferralDrawer({ isOpen, onClose }: ReferralDrawerProps) {
  const { t } = useTranslation()
  const { user } = useAppStore()
  const [copied, setCopied] = useState(false)

  if (!user) return null

  const referralLink = `${window.location.origin}?ref=${user.referral_code}`

  const handleCopy = () => {
    navigator.clipboard.writeText(referralLink)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: t('share_title'),
          text: t('share_desc'),
          url: referralLink,
        })
      } catch (error) {
        console.log(error)
      }
    } else {
      handleCopy()
    }
  }

  return (
    <Drawer open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DrawerContent>
        <DrawerHeader className="text-center">
          <DrawerTitle>{t('referral_program')}</DrawerTitle>
          <DrawerDescription>
            {t('referral_rules')}
          </DrawerDescription>
        </DrawerHeader>
        
        <div className="p-6 space-y-6">
          <div className="bg-muted p-4 rounded-xl text-center font-mono text-lg tracking-widest text-primary border border-primary/20">
            {user.referral_code}
          </div>

          <div className="flex gap-3">
            <Button variant="outline" className="flex-1" onClick={handleCopy}>
              {copied ? <Check className="h-4 w-4 mr-2 text-green-500" /> : <Copy className="h-4 w-4 mr-2" />}
              {copied ? t('copied') : t('copy_link')}
            </Button>
            <Button className="flex-1" onClick={handleShare}>
              <Share2 className="h-4 w-4 mr-2" />
              {t('share')}
            </Button>
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  )
}