import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import type { Disease, DiseaseCategory } from '../types'
import { getImageUrl } from '../utils/image'
import PageHeader from '../components/PageHeader'
import DetailRow from '../components/DetailRow'
import { Bug, Microscope, Leaf, CircleDot, HelpCircle, Dna } from 'lucide-react'

const categoryConfig: Record<DiseaseCategory, {
  label: string
  icon: typeof Bug
  color: string
  bg: string
}> = {
  protozoario: { label: 'Protozoário', icon: Microscope, color: 'text-purple-500', bg: 'bg-purple-500/10' },
  bacteria: { label: 'Bactéria', icon: Dna, color: 'text-red-500', bg: 'bg-red-500/10' },
  parasita: { label: 'Parasita', icon: Bug, color: 'text-amber-500', bg: 'bg-amber-500/10' },
  fungo: { label: 'Fungo', icon: Leaf, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
  virus: { label: 'Vírus', icon: CircleDot, color: 'text-blue-500', bg: 'bg-blue-500/10' },
  outro: { label: 'Outros', icon: HelpCircle, color: 'text-gray-500', bg: 'bg-gray-500/10' },
}

export default function DiseaseDetailPage() {
  const { id } = useParams<{ id: string }>()
  const [disease, setDisease] = useState<Disease | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    import('../data/diseases').then(mod => {
      setDisease(mod.default.find(d => d.id === Number(id)) || null)
      setLoading(false)
    })
  }, [id])

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="flex items-center justify-center py-20 text-text-secondary">
          Carregando...
        </div>
      </div>
    )
  }

  if (!disease) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-8">
        <PageHeader title="Doença não encontrada" backTo="/doencas" />
      </div>
    )
  }

  const config = categoryConfig[disease.categoria]
  const Icon = config.icon

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <PageHeader title={disease.nome} backTo="/doencas" />

      <div className="bg-card rounded-2xl shadow-sm shadow-black/5 overflow-hidden">
        <div className="p-6 sm:p-8">
          <div className="flex items-center gap-4 mb-6 pb-6 border-b border-border/60">
            <div className={`w-12 h-12 rounded-xl ${config.bg} ${config.color} flex items-center justify-center flex-shrink-0`}>
              <Icon size={24} />
            </div>
            <div>
              <span className={`text-xs font-bold uppercase tracking-wider ${config.color}`}>{config.label}</span>
              {disease.nomeCientifico && (
                <p className="text-sm text-text-secondary italic mt-0.5">{disease.nomeCientifico}</p>
              )}
            </div>
          </div>

          {disease.imagem && (
            <div className="rounded-xl overflow-hidden bg-surface-alt mb-6 max-h-64">
              <img
                src={getImageUrl(disease.imagem)}
                alt={disease.nome}
                className="w-full h-full object-cover"
                onError={e => {
                  const target = e.target as HTMLImageElement
                  target.style.display = 'none'
                }}
              />
            </div>
          )}

          <dl>
            <DetailRow label="Causa" value={disease.causa} />
            <DetailRow label="Sintomas" value={disease.sintoma} />
            <DetailRow label="Tratamento" value={disease.tratamento} />
          </dl>
        </div>
      </div>
    </div>
  )
}
