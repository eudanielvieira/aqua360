import { Heart, Skull, Droplets, Waves, Beef, Salad, Cookie, HandHeart } from 'lucide-react'

interface Props {
  comportamento?: string
  alimentacao?: string
  tipo?: string
  outrasInformacoes?: string
  caracteristica?: string
}

function normalize(s: string): string {
  return s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
}

function isPetFish(comportamento: string, outrasInfo: string, caracteristica: string): boolean {
  const all = normalize(comportamento + ' ' + outrasInfo + ' ' + caracteristica)
  return all.includes('comer na mao') || all.includes('come na mao')
    || all.includes('reconhec') && all.includes('dono')
    || all.includes('pet fish') || all.includes('petfish')
    || all.includes('interativ') || all.includes('interage')
    || all.includes('interacao') || all.includes('contato fisico')
    || all.includes('alimentar na mao') || all.includes('brincadeira')
}

export default function SpeciesBadges({ comportamento, alimentacao, tipo, outrasInformacoes, caracteristica }: Props) {
  const badges: { icon: typeof Heart; label: string; color: string }[] = []

  const comp = normalize(comportamento || '')
  const food = normalize(alimentacao || '')
  const t = tipo || ''

  // Tipo de agua
  if (t.includes('DULCI')) {
    badges.push({ icon: Droplets, label: 'Agua Doce', color: 'bg-cyan-500/10 text-cyan-600' })
  } else if (t.includes('MARINHO')) {
    badges.push({ icon: Waves, label: 'Agua Salgada', color: 'bg-blue-500/10 text-blue-600' })
  }

  // Temperamento
  if (comp.includes('agressiv') || comp.includes('territorial')) {
    badges.push({ icon: Skull, label: 'Agressivo', color: 'bg-red-500/10 text-red-600' })
  } else if (comp.includes('pacif') || comp.includes('calmo') || comp.includes('tranquil')) {
    badges.push({ icon: Heart, label: 'Pacifico', color: 'bg-emerald-500/10 text-emerald-600' })
  }

  // Dieta
  if (food.includes('carniv') || food.includes('peixes vivos')) {
    badges.push({ icon: Beef, label: 'Carnivoro', color: 'bg-red-500/10 text-red-600' })
  } else if (food.includes('herbivor') || food.includes('vegeta')) {
    badges.push({ icon: Salad, label: 'Herbivoro', color: 'bg-emerald-500/10 text-emerald-600' })
  } else if (food.includes('onivor')) {
    badges.push({ icon: Cookie, label: 'Onivoro', color: 'bg-amber-500/10 text-amber-600' })
  }

  // Pet fish
  if (isPetFish(comportamento || '', outrasInformacoes || '', caracteristica || '')) {
    badges.push({ icon: HandHeart, label: 'Pet Fish', color: 'bg-purple-500/10 text-purple-600' })
  }

  if (badges.length === 0) return null

  return (
    <div className="flex flex-wrap gap-1.5">
      {badges.map((badge, i) => {
        const Icon = badge.icon
        return (
          <span
            key={i}
            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-bold ${badge.color}`}
          >
            <Icon size={11} />
            {badge.label}
          </span>
        )
      })}
    </div>
  )
}
