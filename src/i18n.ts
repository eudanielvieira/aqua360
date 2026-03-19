import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import LanguageDetector from 'i18next-browser-languagedetector'
import HttpBackend from 'i18next-http-backend'

const namespaces = [
  'common',
  'home',
  'fish',
  'plants',
  'corals',
  'diseases',
  'calculators',
  'compatibility',
  'glossary',
  'guides',
  'filters',
  'builder',
  'support',
  'search',
  'about',
]

i18n
  .use(HttpBackend)
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    fallbackLng: 'pt-BR',
    defaultNS: 'common',
    ns: namespaces,
    supportedLngs: ['pt-BR', 'en', 'es', 'ja'],
    interpolation: {
      escapeValue: false,
    },
    detection: {
      order: ['localStorage', 'navigator'],
      lookupLocalStorage: 'aqua360-lang',
      caches: ['localStorage'],
    },
    backend: {
      loadPath: '/locales/{{lng}}/{{ns}}.json',
    },
    react: {
      useSuspense: true,
    },
  })

export default i18n
