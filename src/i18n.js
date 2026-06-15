import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'

import enJSON from './locales/en.json'
import hiJSON from './locales/hi.json'
import mrJSON from './locales/mr.json'
import taJSON from './locales/ta.json'

const savedLanguage = localStorage.getItem('appLanguage') || 'en'

i18n
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: enJSON },
      hi: { translation: hiJSON },
      mr: { translation: mrJSON },
      ta: { translation: taJSON }
    },
    lng: savedLanguage,
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false // React already safes from XSS
    }
  })

export default i18n
