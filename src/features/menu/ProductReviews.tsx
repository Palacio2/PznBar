import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Star } from 'lucide-react'
import { useAppStore } from '../../store/useAppStore'
import { useProductReviews, useAddReview } from '../../hooks/useReviews'
import { Button } from '../../components/ui/button'
import i18n from '@/i18n/config'

export function ProductReviews({ productId }: { productId: string }) {
  const { t } = useTranslation()
  const { user } = useAppStore()
  const { data: reviews, isLoading } = useProductReviews(productId)
  const { mutate: addReview, isPending } = useAddReview()

  const [rating, setRating] = useState(5)
  const [comment, setComment] = useState('')
  const [isFormOpen, setIsFormOpen] = useState(false)

  const maskPhone = (phone?: string | null) => {
    if (!phone) return t('anonymous')
    return phone.replace(/(\d{3})\d{3}(\d{3})/, '$1***$2')
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    addReview({ productId, rating, comment }, {
      onSuccess: () => {
        setIsFormOpen(false)
        setComment('')
      }
    })
  }

  return (
    <div className="mt-6 space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="font-bold text-lg">{t('reviews')}</h3>
        {user ? (
          <Button variant="outline" size="sm" onClick={() => setIsFormOpen(!isFormOpen)}>
            {t('write_review')}
          </Button>
        ) : (
          <span className="text-xs text-muted-foreground">{t('auth_required_review')}</span>
        )}
      </div>

      {isFormOpen && user && (
        <form onSubmit={handleSubmit} className="bg-secondary/20 p-4 rounded-xl space-y-3 border border-border animate-in fade-in slide-in-from-top-4">
          <div className="flex justify-center gap-2 mb-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button key={star} type="button" onClick={() => setRating(star)} className="focus:outline-none transition-transform hover:scale-110">
                <Star className={`h-8 w-8 ${star <= rating ? 'fill-orange-400 text-orange-400' : 'text-muted-foreground/30'}`} />
              </button>
            ))}
          </div>
          <textarea
            className="w-full bg-background border border-input rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary min-h-[80px]"
            placeholder={t('review_placeholder')}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
          />
          {isPending ? (
            <div className="flex justify-center">
              <span className="text-primary text-sm font-medium">{t('sending')}</span>
            </div>
          ) : (
            <div className="flex justify-end gap-2">
              <Button type="button" variant="ghost" onClick={() => setIsFormOpen(false)}>
                {t('cancel')}
              </Button>
              <Button type="submit" disabled={isPending || rating === 0}>
                {t('send')}
              </Button>
            </div>
          )}
        </form>
      )}

      <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
        {isLoading ? (
          <p className="text-center text-sm text-muted-foreground">{t('loading')}</p>
        ) : !reviews?.length ? (
          <p className="text-center text-sm text-muted-foreground py-4">{t('no_reviews')}</p>
        ) : (
          reviews.map((review) => (
            <div key={review.id} className="bg-card border border-border rounded-lg p-3 space-y-2">
              <div className="flex justify-between items-start">
                <span className="text-xs font-medium text-muted-foreground">
                  {maskPhone(review.profiles?.phone)}
                </span>
                <div className="flex gap-0.5">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className={`h-3 w-3 ${i < review.rating ? 'fill-orange-400 text-orange-400' : 'text-muted-foreground/30'}`} />
                  ))}
                </div>
              </div>
              <p className="text-sm">{review.comment}</p>
              <p className="text-[10px] text-muted-foreground/50">
                {new Date(review.created_at).toLocaleDateString(i18n.language)}
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  )
}