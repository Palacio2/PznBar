import { useTranslation } from 'react-i18next'
import { LocalizedString } from '../types/menu'

export function useTranslationHelpers() {
  const { i18n } = useTranslation()
  const currentLang = (i18n.language || 'pl') as keyof LocalizedString

  const getLocalizedText = (textObj: LocalizedString | undefined | null, fallback: string = ''): string => {
    if (!textObj) return fallback
    return textObj[currentLang] || textObj.pl || fallback
  }

  return { currentLang, getLocalizedText }
}