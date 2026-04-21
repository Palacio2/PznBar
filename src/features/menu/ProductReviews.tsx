import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Star, ChevronDown, MessageSquarePlus } from 'lucide-react'
import { useAppStore } from '../../store/useAppStore'
import { useProductReviews, useAddReview } from '../../hooks/useReviews'
import { Button } from '../../components/ui/button'
import { maskPhone } from '../../lib/utils'

export function ProductReviews({ productId }: { productId: string }) {
  const { t, i18n } = useTranslation()
  const { user } = useAppStore()
  const { data: reviews, isLoading } = useProductReviews(productId)
  const { mutate: addReview, isPending } = useAddReview()

  const [rating, setRating] = useState(5)
  const [comment, setComment] = useState('')
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [isListOpen, setIsListOpen] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    addReview({ productId, rating, comment }, {
      onSuccess: () => {
        setIsFormOpen(false)
        setComment('')
        setIsListOpen(true)
      }
    })
  }

  const reviewCount = reviews?.length || 0

  return (
    <div className="mt-2 space-y-4">
      <div className="flex justify-between items-center bg-secondary/20 p-2 rounded-lg border border-border/50">
        <button 
          onClick={() => setIsListOpen(!isListOpen)} 
          className="flex-1 flex items-center gap-2 font-bold text-base px-2 py-1 focus:outline-none"
        >
          {t('reviews')} ({reviewCount})
          <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform ${isListOpen ? 'rotate-180' : ''}`} />
        </button>
        
        {user ? (
          <Button variant="ghost" size="sm" onClick={() => setIsFormOpen(!isFormOpen)} className="h-8 px-3 text-xs bg-background shadow-sm">
            <MessageSquarePlus className="h-3.5 w-3.5 mr-1.5" />
            {t('write_review')}
          </Button>
        ) : (
          <span className="text-[10px] text-muted-foreground px-2">{t('auth_required_review')}</span>
        )}
      </div>

      {isFormOpen && user && (
        <form onSubmit={handleSubmit} className="bg-secondary/30 p-3 rounded-xl space-y-3 border border-border animate-in fade-in slide-in-from-top-2">
          <div className="flex justify-between items-center">
            <span className="text-xs font-medium text-muted-foreground">Оцінка:</span>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button key={star} type="button" onClick={() => setRating(star)} className="focus:outline-none transition-transform hover:scale-110">
                  <Star className={`h-6 w-6 ${star <= rating ? 'fill-orange-400 text-orange-400' : 'text-muted-foreground/30'}`} />
                </button>
              ))}
            </div>
          </div>
          <textarea
            className="w-full bg-background border border-input rounded-lg p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary min-h-[60px] resize-none"
            placeholder={t('review_placeholder')}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
          />
          {isPending ? (
            <div className="flex justify-center py-1">
              <span className="text-primary text-xs font-medium">{t('sending')}</span>
            </div>
          ) : (
            <div className="flex justify-end gap-2">
              <Button type="button" variant="ghost" size="sm" onClick={() => setIsFormOpen(false)} className="h-8 text-xs">
                {t('cancel')}
              </Button>
              <Button type="submit" size="sm" disabled={isPending || rating === 0} className="h-8 text-xs">
                {t('send')}
              </Button>
            </div>
          )}
        </form>
      )}

      {isListOpen && (
        <div className="space-y-3 animate-in fade-in slide-in-from-top-2">
          {isLoading ? (
            <p className="text-center text-sm text-muted-foreground py-2">{t('loading')}</p>
          ) : !reviews || reviews.length === 0 ? (
            <p className="text-center text-sm text-muted-foreground py-2">{t('no_reviews')}</p>
          ) : (
            reviews.map((review) => {
              const profile = Array.isArray(review.profiles) ? review.profiles[0] : review.profiles
              const maskedPhone = maskPhone(profile?.phone, t('anonymous'))

              return (
                <div key={review.id} className="bg-card border border-border rounded-lg p-3 space-y-2 shadow-sm">
                  <div className="flex justify-between items-start">
                    <span className="text-xs font-medium text-muted-foreground">
                      {maskedPhone}
                    </span>
                    <div className="flex gap-0.5">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className={`h-3 w-3 ${i < review.rating ? 'fill-orange-400 text-orange-400' : 'text-muted-foreground/20'}`} />
                      ))}
                    </div>
                  </div>
                  {review.comment && <p className="text-sm leading-snug">{review.comment}</p>}
                  <p className="text-[10px] text-muted-foreground/50">
                    {new Date(review.created_at).toLocaleDateString(i18n.language)}
                  </p>
                </div>
              )
            })
          )}
        </div>
      )}
    </div>
  )
}