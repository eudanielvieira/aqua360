import { ArrowLeft, Home, Waves } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import SEO from '../components/SEO'
import { notFoundMeta } from '../seo/meta'

export default function NotFoundPage() {
  const { t } = useTranslation('common')

  return (
    <div className="max-w-3xl mx-auto px-4 py-16 sm:py-24">
      <SEO {...notFoundMeta} />
      <div className="max-w-lg mx-auto text-center">
        <div className="w-16 h-16 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mx-auto mb-6">
          <Waves size={30} aria-hidden="true" />
        </div>
        <p className="text-sm font-bold text-primary uppercase tracking-[0.2em] mb-3">404</p>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-text tracking-tight">
          {t('error.notFound.title')}
        </h1>
        <p className="text-sm sm:text-base text-text-secondary leading-relaxed mt-4">
          {t('error.notFound.description')}
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-8">
          <Link
            to="/"
            className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary/90 transition-colors"
          >
            <Home size={17} aria-hidden="true" />
            {t('error.notFound.home')}
          </Link>
          <button
            type="button"
            onClick={() => window.history.back()}
            className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-card border border-border text-text-secondary text-sm font-semibold hover:text-text hover:bg-surface-alt transition-colors"
          >
            <ArrowLeft size={17} aria-hidden="true" />
            {t('back')}
          </button>
        </div>
      </div>
    </div>
  )
}
