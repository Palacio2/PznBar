import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'

import pl from './locales/pl.json'
import ua from './locales/ua.json'
import en from './locales/en.json'

i18n.use(initReactI18next).init({
  fallbackLng: 'pl', // Якщо мова невідома, показуватиме польську
  lng: 'pl',         // Початкова мова за замовчуванням
  resources: {
    pl,
    ua,
    en
  },
  interpolation: {
    escapeValue: false, // React вже захищає від XSS
  },
})

export default i18n