import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { fishCategories } from '../data/fish-index'
import PageHeader from '../components/PageHeader'

const categoryImages: Record<string, string> = {
  'agua-doce': '/images/altolamprologuscalvus.jpg',
  'agua-salgada': '/images/acanthurusachillesshaw.jpg',
  'invertebrados-agua-doce': '/images/neritina.jpg',
  'invertebrados-agua-salgada': '/images/ermitaopataspurpuras.jpg',
}

export default function FishListPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <PageHeader title="Peixes" subtitle="Selecione uma categoria para explorar" />

      <div className="grid gap-4 sm:grid-cols-2">
        {fishCategories.map(cat => (
          <Link
            key={cat.slug}
            to={`/peixes/${cat.slug}`}
            className="group relative bg-card rounded-2xl shadow-md shadow-black/5 border border-border overflow-hidden hover:shadow-xl hover:shadow-black/10 hover:-translate-y-1 transition-all duration-300"
          >
            <div className="h-40 overflow-hidden">
              <img
                src={categoryImages[cat.slug] || '/images/avatar.jpg'}
                alt={cat.label}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
            </div>
            <div className="absolute bottom-0 left-0 right-0 p-5">
              <h3 className="font-bold text-white text-lg">{cat.label}</h3>
              <div className="flex items-center justify-between mt-1">
                <p className="text-sm text-white/70">{cat.count} espécies</p>
                <span className="inline-flex items-center gap-1 text-xs font-semibold text-white/80 group-hover:text-white group-hover:gap-2 transition-all">
                  Ver todas <ArrowRight size={14} />
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
