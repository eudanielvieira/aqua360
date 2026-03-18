import { useState } from 'react'

interface Filter {
  key: string
  label: string
  icon?: string
  color: string
  match: (item: any) => boolean
}

interface Props {
  filters: Filter[]
  onFilter: (matchFn: ((item: any) => boolean) | null) => void
}

export default function QuickFilters({ filters, onFilter }: Props) {
  const [active, setActive] = useState<string | null>(null)

  const handleClick = (filter: Filter) => {
    if (active === filter.key) {
      setActive(null)
      onFilter(null)
    } else {
      setActive(filter.key)
      onFilter(filter.match)
    }
  }

  return (
    <div className="flex flex-wrap gap-1.5 mb-4">
      {filters.map(f => (
        <button
          key={f.key}
          onClick={() => handleClick(f)}
          className={`px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all ${
            active === f.key
              ? `${f.color} shadow-sm`
              : 'bg-surface-alt text-text-secondary hover:text-text'
          }`}
        >
          {f.label}
        </button>
      ))}
    </div>
  )
}

// Helpers para parsing
function parsePhRange(ph: string): { min: number; max: number } | null {
  if (!ph) return null
  const m = ph.replace(/,/g, '.').match(/([\d.]+)\s*(?:a|-)\s*([\d.]+)/)
  if (m) return { min: parseFloat(m[1]), max: parseFloat(m[2]) }
  return null
}

function norm(s: string): string {
  return s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
}

// Filtros para Peixes
export const fishFilters: Filter[] = [
  { key: 'pacifico', label: 'Pacificos', color: 'bg-emerald-500/15 text-emerald-600', match: (f) => {
    const c = norm(f.comportamento || '')
    return c.includes('pacif') || c.includes('calmo') || c.includes('tranquil')
  }},
  { key: 'agressivo', label: 'Agressivos', color: 'bg-red-500/15 text-red-600', match: (f) => {
    const c = norm(f.comportamento || '')
    return c.includes('agressiv') || c.includes('territorial')
  }},
  { key: 'cardume', label: 'Cardume', color: 'bg-blue-500/15 text-blue-600', match: (f) => {
    const c = norm(f.comportamento || '' + f.outrasInformacoes || '')
    return c.includes('cardume') || c.includes('grupo')
  }},
  { key: 'nano', label: 'Nano (ate 5cm)', color: 'bg-violet-500/15 text-violet-600', match: (f) => {
    const m = (f.tamanhoAdulto || '').match(/(\d+)\s*cm/)
    return m ? parseInt(m[1]) <= 5 : false
  }},
  { key: 'pequeno', label: 'Pequenos (5-10cm)', color: 'bg-cyan-500/15 text-cyan-600', match: (f) => {
    const m = (f.tamanhoAdulto || '').match(/(\d+)\s*cm/)
    return m ? parseInt(m[1]) > 5 && parseInt(m[1]) <= 10 : false
  }},
  { key: 'medio', label: 'Medios (10-20cm)', color: 'bg-amber-500/15 text-amber-600', match: (f) => {
    const m = (f.tamanhoAdulto || '').match(/(\d+)\s*cm/)
    return m ? parseInt(m[1]) > 10 && parseInt(m[1]) <= 20 : false
  }},
  { key: 'grande', label: 'Grandes (20cm+)', color: 'bg-orange-500/15 text-orange-600', match: (f) => {
    const m = (f.tamanhoAdulto || '').match(/(\d+)\s*cm/)
    return m ? parseInt(m[1]) > 20 : false
  }},
  { key: 'acido', label: 'Agua Acida (pH<7)', color: 'bg-lime-500/15 text-lime-600', match: (f) => {
    const r = parsePhRange(f.ph)
    return r ? r.max < 7.0 : false
  }},
  { key: 'neutro', label: 'Agua Neutra (pH~7)', color: 'bg-gray-500/15 text-gray-600', match: (f) => {
    const r = parsePhRange(f.ph)
    return r ? r.min <= 7.2 && r.max >= 6.8 : false
  }},
  { key: 'alcalino', label: 'Agua Alcalina (pH>7)', color: 'bg-indigo-500/15 text-indigo-600', match: (f) => {
    const r = parsePhRange(f.ph)
    return r ? r.min > 7.0 : false
  }},
  { key: 'carnivoro', label: 'Carnivoros', color: 'bg-red-500/15 text-red-600', match: (f) => {
    const a = norm(f.alimentacao || '')
    return a.includes('carniv') || a.includes('peixes vivos')
  }},
  { key: 'pet', label: 'Pet Fish', color: 'bg-purple-500/15 text-purple-600', match: (f) => {
    const all = norm((f.comportamento || '') + (f.outrasInformacoes || '') + (f.caracteristica || ''))
    return all.includes('pet fish') || all.includes('comer na mao') || all.includes('reconhec') || all.includes('interativ')
  }},
]

// Filtros para Invertebrados Agua Doce
export const invertFreshFilters: Filter[] = [
  { key: 'camarao', label: 'Camaroes', color: 'bg-orange-500/15 text-orange-600', match: (f) => {
    const n = norm(f.nomePopular || '' + f.nomeCientifico || '')
    return n.includes('camar') || n.includes('shrimp') || n.includes('caridina') || n.includes('neocaridina')
  }},
  { key: 'caracol', label: 'Caracois', color: 'bg-amber-500/15 text-amber-600', match: (f) => {
    const n = norm(f.nomePopular || '' + f.nomeCientifico || '' + f.subTipo || '')
    return n.includes('caracol') || n.includes('caramujo') || n.includes('snail') || n.includes('neritina') || n.includes('pomacea')
  }},
  { key: 'caranguejo', label: 'Caranguejos', color: 'bg-red-500/15 text-red-600', match: (f) => {
    const n = norm(f.nomePopular || '' + f.nomeCientifico || '' + f.subTipo || '')
    return n.includes('caranguejo') || n.includes('crab') || n.includes('trichodactylus') || n.includes('uca ')
  }},
  { key: 'lagosta', label: 'Lagostas', color: 'bg-violet-500/15 text-violet-600', match: (f) => {
    const n = norm(f.nomePopular || '' + f.nomeCientifico || '')
    return n.includes('crayfish') || n.includes('lagosta') || n.includes('procambarus') || n.includes('cambarellus') || n.includes('cherax')
  }},
  { key: 'mexilhao', label: 'Mexilhoes', color: 'bg-blue-500/15 text-blue-600', match: (f) => {
    const n = norm(f.nomePopular || '' + f.nomeCientifico || '' + f.subTipo || '')
    return n.includes('mexilh') || n.includes('mussel') || n.includes('clam') || n.includes('corbicula') || n.includes('anodonta')
  }},
]

// Filtros para Invertebrados Agua Salgada
export const invertSaltFilters: Filter[] = [
  { key: 'camarao', label: 'Camaroes', color: 'bg-orange-500/15 text-orange-600', match: (f) => {
    const n = norm((f.nomePopular || '') + (f.nomeCientifico || '') + (f.familia || ''))
    return n.includes('camar') || n.includes('shrimp') || n.includes('lysmata') || n.includes('stenopus') || n.includes('thor ') || n.includes('alpheus') || n.includes('hymenocera')
  }},
  { key: 'caranguejo', label: 'Caranguejos', color: 'bg-red-500/15 text-red-600', match: (f) => {
    const n = norm((f.nomePopular || '') + (f.nomeCientifico || ''))
    return n.includes('caranguejo') || n.includes('ermit') || n.includes('crab') || n.includes('lybia') || n.includes('mithraculus') || n.includes('stenorhynchus')
  }},
  { key: 'estrela', label: 'Estrelas', color: 'bg-yellow-500/15 text-yellow-600', match: (f) => {
    const n = norm((f.nomePopular || '') + (f.nomeCientifico || ''))
    return n.includes('estrela') || n.includes('star') || n.includes('ophio') || n.includes('fromia') || n.includes('linckia') || n.includes('astropecten')
  }},
  { key: 'ourico', label: 'Ouricos', color: 'bg-emerald-500/15 text-emerald-600', match: (f) => {
    const n = norm((f.nomePopular || '') + (f.nomeCientifico || ''))
    return n.includes('ourico') || n.includes('urchin') || n.includes('diadema') || n.includes('eucidaris') || n.includes('mespilia')
  }},
  { key: 'caracol', label: 'Caracois', color: 'bg-amber-500/15 text-amber-600', match: (f) => {
    const n = norm((f.nomePopular || '') + (f.nomeCientifico || ''))
    return n.includes('caracol') || n.includes('snail') || n.includes('turbo') || n.includes('nassarius') || n.includes('cerith') || n.includes('trochus') || n.includes('strombus')
  }},
  { key: 'molusco', label: 'Moluscos', color: 'bg-blue-500/15 text-blue-600', match: (f) => {
    const n = norm((f.nomePopular || '') + (f.nomeCientifico || ''))
    return n.includes('tridacna') || n.includes('polvo') || n.includes('octopus') || n.includes('pepino') || n.includes('holothuria') || n.includes('agua-viva') || n.includes('aurelia') || n.includes('nudibr')
  }},
]

// Filtros para Plantas
export const plantFilters: Filter[] = [
  { key: 'facil', label: 'Facil', color: 'bg-emerald-500/15 text-emerald-600', match: (p) => {
    const d = norm(p.dificuldade || '')
    return d.includes('facil') || d.includes('muito facil')
  }},
  { key: 'moderada', label: 'Moderada', color: 'bg-amber-500/15 text-amber-600', match: (p) => {
    return norm(p.dificuldade || '').includes('moderada')
  }},
  { key: 'dificil', label: 'Dificil', color: 'bg-red-500/15 text-red-600', match: (p) => {
    return norm(p.dificuldade || '').includes('dificil')
  }},
  { key: 'frente', label: 'Frente (carpete)', color: 'bg-lime-500/15 text-lime-600', match: (p) => {
    return norm(p.posicao || '').includes('frente') || norm(p.posicao || '').includes('carpete')
  }},
  { key: 'meio', label: 'Meio', color: 'bg-cyan-500/15 text-cyan-600', match: (p) => {
    return norm(p.posicao || '').includes('meio')
  }},
  { key: 'fundo', label: 'Fundo', color: 'bg-blue-500/15 text-blue-600', match: (p) => {
    return norm(p.posicao || '').includes('fundo')
  }},
  { key: 'flutuante', label: 'Flutuante', color: 'bg-teal-500/15 text-teal-600', match: (p) => {
    return norm(p.posicao || '').includes('superficie') || norm(p.posicao || '').includes('flutuante')
  }},
  { key: 'rapido', label: 'Crescimento rapido', color: 'bg-green-500/15 text-green-600', match: (p) => {
    const c = norm(p.crescimento || '')
    return c.includes('rapido') || c.includes('muito rapido') || c.includes('explosivo')
  }},
  { key: 'semco2', label: 'Sem CO2', color: 'bg-gray-500/15 text-gray-600', match: (p) => {
    const c = norm(p.co2 || '')
    return c.includes('nao necessario') || c.includes('nao') || !c
  }},
  { key: 'musgo', label: 'Musgos', color: 'bg-emerald-500/15 text-emerald-600', match: (p) => {
    const n = norm((p.nomePopular || '') + (p.nomeCientifico || ''))
    return n.includes('moss') || n.includes('musgo') || n.includes('vesicularia') || n.includes('taxiphyllum') || n.includes('fissidens')
  }},
]
