import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import type { Disease } from '../types'
import { getImageUrl } from '../utils/image'
import PageHeader from '../components/PageHeader'
import DetailRow from '../components/DetailRow'

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
      <div className="max-w-3xl mx-auto px-4 py-6">
        <div className="flex items-center justify-center py-20 text-text-secondary">
          Carregando...
        </div>
      </div>
    )
  }

  if (!disease) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-6">
        <PageHeader title="Doença não encontrada" backTo="/doencas" />
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-6">
      <PageHeader title={disease.nome} backTo="/doencas" />

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {disease.imagem && (
          <div className="aspect-video max-h-80 overflow-hidden bg-gray-100">
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

        <div className="p-5">
          <dl>
            <DetailRow label="Nome" value={disease.nome} />
            <DetailRow label="Nome Científico" value={disease.nomeCientifico} />
            <DetailRow label="Causa" value={disease.causa} />
            <DetailRow label="Sintomas" value={disease.sintoma} />
            <DetailRow label="Tratamento" value={disease.tratamento} />
          </dl>
        </div>
      </div>
    </div>
  )
}
