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
  gradient: string
}> = {
  protozoario: { label: 'Protozoário', icon: Microscope, gradient: 'from-purple-500 to-violet-400' },
  bacteria: { label: 'Bactéria', icon: Dna, gradient: 'from-red-500 to-rose-400' },
  parasita: { label: 'Parasita', icon: Bug, gradient: 'from-amber-500 to-orange-400' },
  fungo: { label: 'Fungo', icon: Leaf, gradient: 'from-emerald-500 to-green-400' },
  virus: { label: 'Vírus', icon: CircleDot, gradient: 'from-blue-500 to-cyan-400' },
  outro: { label: 'Outros', icon: HelpCircle, gradient: 'from-gray-500 to-slate-400' },
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

      <div className="bg-card rounded-3xl shadow-lg shadow-black/5 border border-border overflow-hidden">
        <div className={`bg-gradient-to-r ${config.gradient} p-6 flex items-center gap-4 relative overflow-hidden`}>
          <div className="absolute -right-8 -top-8 opacity-10">
            <Icon size={120} strokeWidth={1} />
          </div>
          <div className="w-14 h-14 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
            <Icon size={28} className="text-white" />
          </div>
          <div>
            <span className="text-xs font-bold text-white/70 uppercase tracking-wider">{config.label}</span>
            <h2 className="text-xl font-bold text-white">{disease.nome}</h2>
            {disease.nomeCientifico && (
              <p className="text-sm text-white/70 italic mt-0.5">{disease.nomeCientifico}</p>
            )}
          </div>
        </div>

        {disease.imagem && (
          <div className="aspect-video max-h-64 overflow-hidden bg-surface-alt">
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

        <div className="p-6 sm:p-8">
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
