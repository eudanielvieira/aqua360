import { Link } from 'react-router-dom'
import { ChevronRight } from 'lucide-react'
import { fishCategories } from '../data/fish-index'
import PageHeader from '../components/PageHeader'

const categoryIcons: Record<string, string> = {
  'agua-doce': '/images/altolamprologuscalvus.jpg',
  'agua-salgada': '/images/acanthurusachillesshaw.jpg',
  'invertebrados-agua-doce': '/images/neritina.jpg',
  'invertebrados-agua-salgada': '/images/ermitaopataspurpuras.jpg',
}

export default function FishListPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      <PageHeader title="Peixes" subtitle="Selecione uma categoria" />

      <div className="grid gap-3">
        {fishCategories.map(cat => (
          <Link
            key={cat.slug}
            to={`/peixes/${cat.slug}`}
            className="group flex items-center gap-4 p-4 bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md hover:border-primary/20 transition-all"
          >
            <div className="w-14 h-14 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
              <img
                src={categoryIcons[cat.slug] || '/images/avatar.jpg'}
                alt={cat.label}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-text">{cat.label}</h3>
              <p className="text-xs text-text-secondary mt-0.5">{cat.count} espécies</p>
            </div>
            <ChevronRight size={18} className="text-gray-300 group-hover:text-primary transition-colors" />
          </Link>
        ))}
      </div>
    </div>
  )
}
