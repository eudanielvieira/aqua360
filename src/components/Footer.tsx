import { Link } from 'react-router-dom'
import { Waves, Heart } from 'lucide-react'
import { useTranslation } from 'react-i18next'

export default function Footer() {
  const { t } = useTranslation('common')

  return (
    <footer className="border-t border-border py-6 px-4 text-xs">
      <div className="max-w-3xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex flex-col items-center sm:items-start gap-1">
          <div className="flex items-center gap-2">
            <Waves size={12} className="text-primary" />
            <span className="font-semibold text-text">Aqua360</span>
          </div>
          <p className="text-text-secondary">{t('footer.tagline')}</p>
        </div>
        <div className="flex flex-col items-center sm:items-end gap-2">
          <div className="flex items-center gap-2">
            <Link to="/sobre" className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-primary/10 text-primary font-semibold hover:bg-primary/20 transition-colors">
              <Waves size={12} />
              {t('footer.about')}
            </Link>
            <Link to="/apoie" className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-rose-500/10 text-rose-500 dark:bg-rose-400/15 dark:text-rose-400 font-semibold hover:bg-rose-500/20 transition-colors">
              <Heart size={12} fill="currentColor" />
              {t('footer.support')}
            </Link>
          </div>
          <p className="text-text-secondary/50 text-[10px]">
            {t('footer.data')}
          </p>
        </div>
      </div>
    </footer>
  )
}
