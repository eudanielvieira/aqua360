import { useState } from 'react'
import { Link } from 'react-router-dom'
import PageHeader from '../components/PageHeader'
import { Fish, Leaf, Gem, ArrowRight, Clock, Droplets, Thermometer, Filter, FlaskConical, CheckCircle } from 'lucide-react'

const aquariumTypes = [
  {
    id: 'comunitario',
    title: 'Comunitario de Agua Doce',
    desc: 'Aquario com diversas especies pacificas convivendo juntas.',
    icon: Fish,
    color: 'text-blue-500',
    bg: 'bg-blue-500/10',
    params: { ph: '6.5 a 7.5', temp: '24 a 28', gh: '4 a 12' },
    steps: [
      'Escolha um aquario de pelo menos 60 litros',
      'Adicione substrato inerte (cascalho ou areia) de 3-5cm',
      'Instale o filtro (minimo 5x o volume por hora) e aquecedor',
      'Decore com troncos e pedras (crie esconderijos)',
      'Encha com agua desclorada e ligue os equipamentos',
      'Aguarde a ciclagem completa (4-6 semanas)',
      'Comece com peixes resistentes como Danio ou Corydoras',
      'Adicione novas especies gradualmente (2-3 por semana)',
    ],
    fishSuggestions: 'Neon, Corydoras, Betta (sozinho), Rasbora, Guppy, Plati',
  },
  {
    id: 'plantado',
    title: 'Aquario Plantado',
    desc: 'Foco em plantas aquaticas com iluminacao e CO2.',
    icon: Leaf,
    color: 'text-emerald-500',
    bg: 'bg-emerald-500/10',
    params: { ph: '6.0 a 7.0', temp: '22 a 26', gh: '3 a 8' },
    steps: [
      'Escolha um aquario com boa area de superficie (baixo e largo)',
      'Coloque substrato fertil na base coberto por cascalho fino',
      'Instale iluminacao adequada (0.5-1W por litro ou LED equivalente)',
      'Configure sistema de CO2 (pressurizado ou DIY)',
      'Plante primeiro as plantas de fundo, depois meio e frente',
      'Inicie com iluminacao reduzida (6h/dia) e aumente gradualmente',
      'Aguarde a ciclagem e as plantas se estabelecerem (3-4 semanas)',
      'Adicione peixes pacificos e pequenos que nao danifiquem plantas',
    ],
    fishSuggestions: 'Neon, Rasbora, Otocinclus, Corydoras, Camarao Amano',
  },
  {
    id: 'ciclideos',
    title: 'Ciclideos Africanos',
    desc: 'Aquario com ciclideos do Lago Malawi ou Tanganyika.',
    icon: Fish,
    color: 'text-amber-500',
    bg: 'bg-amber-500/10',
    params: { ph: '7.5 a 8.5', temp: '24 a 28', gh: '10 a 20' },
    steps: [
      'Aquario de pelo menos 200 litros (ciclideos sao territoriais)',
      'Substrato de areia de aragonita ou cascalho calcario (eleva pH)',
      'Monte muitas rochas criando tocas e territorios',
      'Filtragem potente (8-10x o volume por hora)',
      'Nao use plantas (a maioria sera destruida)',
      'Aguarde a ciclagem completa',
      'Adicione varios peixes de uma vez para diluir agressividade',
      'Mantenha superlotacao controlada para reduzir territorios',
    ],
    fishSuggestions: 'Labidochromis, Pseudotropheus, Aulonocara, Neolamprologus',
  },
  {
    id: 'marinho',
    title: 'Aquario Marinho / Reef',
    desc: 'Aquario de agua salgada com peixes, corais e invertebrados.',
    icon: Gem,
    color: 'text-violet-500',
    bg: 'bg-violet-500/10',
    params: { ph: '8.1 a 8.4', temp: '24 a 27', salinidade: '1.023 a 1.025' },
    steps: [
      'Aquario de pelo menos 150 litros com sump',
      'Adicione rocha viva (1kg para cada 5 litros)',
      'Instale skimmer, bomba de circulacao e iluminacao LED marinha',
      'Prepare agua com sal sintetico proprio para aquario marinho',
      'Aguarde ciclagem com rocha viva (4-8 semanas)',
      'Teste parametros: amonia 0, nitrito 0, nitrato < 10',
      'Comece com peixes resistentes (Clownfish, Chromis)',
      'Adicione corais moles primeiro, depois LPS e por fim SPS',
    ],
    fishSuggestions: 'Amphiprion, Chromis, Gramma loreto, Gobiodon, Nemateleotris',
  },
]

const cyclingSteps = [
  { day: 'Dia 1', title: 'Montagem', desc: 'Monte o aquario com substrato, decoracao, filtro e aquecedor. Encha com agua desclorada e ligue tudo.', icon: Filter },
  { day: 'Dia 2-3', title: 'Fonte de amonia', desc: 'Adicione uma fonte de amonia: racao de peixe, camarao morto ou amonia pura (2-4 ppm).', icon: FlaskConical },
  { day: 'Semana 1-2', title: 'Pico de amonia', desc: 'Amonia sobe. Bacterias Nitrosomonas comecam a colonizar o filtro. Teste amonia a cada 2 dias.', icon: Droplets },
  { day: 'Semana 2-3', title: 'Aparece nitrito', desc: 'Amonia comeca a cair e nitrito sobe. Bacterias Nitrospira estao se estabelecendo.', icon: Thermometer },
  { day: 'Semana 3-4', title: 'Nitrito cai', desc: 'Nitrito comeca a cair e nitrato aparece. O ciclo esta quase completo.', icon: Clock },
  { day: 'Semana 4-6', title: 'Ciclo completo', desc: 'Amonia 0, Nitrito 0, Nitrato presente. Faca uma TPA de 50% e adicione os primeiros peixes!', icon: CheckCircle },
]

export default function GuidesPage() {
  const [activeType, setActiveType] = useState<string | null>(null)

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <PageHeader title="Guias" subtitle="Aprenda a montar e manter seu aquario" />

      <div className="mb-10">
        <h2 className="text-lg font-bold text-text mb-4">Tipos de Aquario</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          {aquariumTypes.map(type => {
            const Icon = type.icon
            const isActive = activeType === type.id
            return (
              <div key={type.id}>
                <button
                  onClick={() => setActiveType(isActive ? null : type.id)}
                  className={`w-full text-left p-5 bg-card rounded-2xl shadow-sm shadow-black/5 hover:shadow-md transition-all ${isActive ? 'ring-2 ring-primary' : ''}`}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <div className={`w-10 h-10 rounded-xl ${type.bg} ${type.color} flex items-center justify-center`}>
                      <Icon size={20} />
                    </div>
                    <div>
                      <p className="font-bold text-text text-sm">{type.title}</p>
                      <p className="text-[11px] text-text-secondary">{type.desc}</p>
                    </div>
                  </div>
                  <div className="flex gap-2 mt-3">
                    {Object.entries(type.params).map(([k, v]) => (
                      <span key={k} className="text-[10px] px-2 py-0.5 rounded-md bg-surface-alt font-medium text-text-secondary">
                        {k.toUpperCase()} {v}
                      </span>
                    ))}
                  </div>
                </button>

                {isActive && (
                  <div className="mt-2 p-5 bg-card rounded-2xl shadow-sm shadow-black/5">
                    <p className="text-xs font-bold text-text-secondary uppercase tracking-wider mb-3">Passo a passo</p>
                    <div className="space-y-2">
                      {type.steps.map((step, i) => (
                        <div key={i} className="flex items-start gap-3">
                          <span className="w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                            {i + 1}
                          </span>
                          <p className="text-sm text-text leading-relaxed">{step}</p>
                        </div>
                      ))}
                    </div>
                    <div className="mt-4 p-3 rounded-xl bg-surface-alt/50">
                      <p className="text-[10px] font-bold text-text-secondary uppercase tracking-wider mb-1">Peixes sugeridos</p>
                      <p className="text-xs text-text">{type.fishSuggestions}</p>
                    </div>
                    <Link
                      to="/montar-aquario"
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary mt-3 hover:underline"
                    >
                      Montar aquario inteligente <ArrowRight size={12} />
                    </Link>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      <div>
        <h2 className="text-lg font-bold text-text mb-4">Guia de Ciclagem</h2>
        <p className="text-sm text-text-secondary mb-6">
          A ciclagem e o processo mais importante antes de colocar peixes no aquario.
          Leva de 4 a 6 semanas para as bacterias beneficas se estabelecerem.
        </p>
        <div className="space-y-3">
          {cyclingSteps.map((step, i) => {
            const Icon = step.icon
            const isLast = i === cyclingSteps.length - 1
            return (
              <div key={i} className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${isLast ? 'bg-emerald-500/10 text-emerald-500' : 'bg-primary/10 text-primary'}`}>
                    <Icon size={18} />
                  </div>
                  {!isLast && <div className="w-0.5 flex-1 bg-border mt-2" />}
                </div>
                <div className="pb-6">
                  <p className="text-[10px] font-bold text-primary uppercase tracking-wider">{step.day}</p>
                  <p className="text-sm font-bold text-text mt-0.5">{step.title}</p>
                  <p className="text-xs text-text-secondary mt-1 leading-relaxed">{step.desc}</p>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
