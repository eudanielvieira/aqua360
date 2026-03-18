import { useState } from 'react'
import PageHeader from '../components/PageHeader'
import { Search } from 'lucide-react'

const terms = [
  { term: 'Alevino', def: 'Filhote de peixe recem-nascido, ainda em fase larval ou juvenil.' },
  { term: 'Aquario comunitario', def: 'Aquario que abriga diferentes especies de peixes e plantas convivendo juntas.' },
  { term: 'Aquario hospital', def: 'Aquario separado utilizado para tratar peixes doentes ou em quarentena.' },
  { term: 'Aquascaping', def: 'Arte de criar paisagens aquaticas dentro do aquario, combinando plantas, pedras e troncos.' },
  { term: 'Briofita', def: 'Grupo de plantas que inclui os musgos aquaticos (ex: musgo de Java).' },
  { term: 'Cardume', def: 'Grupo de peixes da mesma especie nadando juntos. Muitas especies precisam de cardume para se sentirem seguras.' },
  { term: 'Ciclagem', def: 'Processo de maturacao do filtro biologico do aquario, onde bacterias beneficas colonizam a midia filtrante para converter amonia em nitrito e depois em nitrato.' },
  { term: 'Ciclideos', def: 'Familia de peixes (Cichlidae) que inclui Acara, Oscar, Disco, Ciclideo Africano, entre outros.' },
  { term: 'CO2', def: 'Dioxido de carbono injetado no aquario plantado para acelerar o crescimento das plantas.' },
  { term: 'Coralimorfo', def: 'Grupo de invertebrados marinhos semelhantes a corais, como Discosoma e Ricordea.' },
  { term: 'dGH (GH)', def: 'Dureza geral da agua, mede a concentracao de calcio e magnesio. Importante para peixes de agua doce.' },
  { term: 'dKH (KH)', def: 'Dureza de carbonatos, mede a capacidade tamponante da agua (estabilidade do pH).' },
  { term: 'Dimorfismo sexual', def: 'Diferencas fisicas visiveis entre macho e femea da mesma especie.' },
  { term: 'Ectoparasita', def: 'Parasita que vive na superficie externa do peixe (pele, branquias, nadadeiras).' },
  { term: 'Filtro biologico', def: 'Sistema de filtragem que usa bacterias beneficas para converter substancias toxicas (amonia, nitrito) em menos toxicas (nitrato).' },
  { term: 'Filtro canister', def: 'Filtro externo pressurizado com grande capacidade de midia filtrante.' },
  { term: 'Hang-on (HOB)', def: 'Filtro que pendura na borda do aquario, com a agua sendo puxada e devolvida por cima.' },
  { term: 'Hardscape', def: 'Elementos nao vivos na decoracao do aquario: pedras, troncos, substrato.' },
  { term: 'Incubador bocal', def: 'Metodo de reproducao onde o peixe (geralmente a femea) carrega os ovos na boca ate a eclosao.' },
  { term: 'Invertebrado', def: 'Animal sem coluna vertebral, como camaroes, caracois, caranguejos e corais.' },
  { term: 'LPS', def: 'Large Polyp Stony - corais duros com polipos grandes (ex: Euphyllia, Favia).' },
  { term: 'Midia filtrante', def: 'Material colocado no filtro para filtragem mecanica, biologica ou quimica (ceramica, espuma, carvao).' },
  { term: 'Nadadeira', def: 'Estrutura em formato de barbatana usada pelos peixes para nadar, equilibrar e direcionar.' },
  { term: 'Nitrato (NO3)', def: 'Produto final do ciclo do nitrogenio. Menos toxico que amonia e nitrito, mas em excesso causa algas e estresse.' },
  { term: 'Nitrito (NO2)', def: 'Substancia toxica intermediaria no ciclo do nitrogenio. Niveis devem ser zero em aquario ciclado.' },
  { term: 'Operculo', def: 'Placa ossea que cobre as branquias do peixe.' },
  { term: 'Osmoregulacao', def: 'Processo pelo qual o peixe controla o equilibrio de sal e agua em seu corpo.' },
  { term: 'Oviparo', def: 'Especie que se reproduz por ovos depositados externamente.' },
  { term: 'pH', def: 'Escala de 0 a 14 que mede a acidez ou alcalinidade da agua. pH 7 e neutro, abaixo e acido, acima e alcalino.' },
  { term: 'Pet fish', def: 'Peixe que interage com o dono, reconhece quem o alimenta e permite contato. Ex: Oscar, Flowerhorn, Kinguio.' },
  { term: 'Quarentena', def: 'Periodo de isolamento de novos peixes antes de introduzi-los no aquario principal, para evitar doencas.' },
  { term: 'Reef (Recife)', def: 'Aquario marinho focado em corais e invertebrados, com iluminacao e parametros especificos.' },
  { term: 'Sump', def: 'Aquario auxiliar abaixo do principal usado para filtragem, aquecimento e equipamentos.' },
  { term: 'SPS', def: 'Small Polyp Stony - corais duros com polipos pequenos (ex: Acropora, Montipora). Exigem parametros estaveis.' },
  { term: 'Substrato', def: 'Material que cobre o fundo do aquario (areia, cascalho, substrato fertil). Serve de base para plantas.' },
  { term: 'Substrato fertil', def: 'Substrato rico em nutrientes colocado sob o cascalho para alimentar as raizes das plantas.' },
  { term: 'Termostato', def: 'Aquecedor com controle automatico de temperatura para manter a agua na faixa ideal.' },
  { term: 'TPA', def: 'Troca Parcial de Agua - procedimento regular de trocar parte da agua do aquario para manter a qualidade.' },
  { term: 'Viviparo', def: 'Especie que da a luz filhotes vivos (sem botar ovos). Ex: Guppy, Plati, Molinesia.' },
  { term: 'Zooxantela', def: 'Alga microscopica que vive dentro dos tecidos dos corais, fornecendo energia via fotossintese.' },
]

function normalize(s: string): string {
  return s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
}

export default function GlossaryPage() {
  const [query, setQuery] = useState('')

  const filtered = query.trim().length > 0
    ? terms.filter(t => normalize(t.term).includes(normalize(query)) || normalize(t.def).includes(normalize(query)))
    : terms

  const grouped = filtered.reduce<Record<string, typeof terms>>((acc, t) => {
    const letter = t.term[0].toUpperCase()
    if (!acc[letter]) acc[letter] = []
    acc[letter].push(t)
    return acc
  }, {})

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <PageHeader title="Glossario" subtitle={`${terms.length} termos de aquarismo`} />

      <div className="relative mb-6">
        <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary" />
        <input
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Buscar termo..."
          className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-border bg-card text-sm shadow-sm shadow-black/5 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
        />
      </div>

      <div className="space-y-6">
        {Object.entries(grouped).sort(([a], [b]) => a.localeCompare(b)).map(([letter, items]) => (
          <div key={letter}>
            <div className="sticky top-14 z-10 bg-surface py-1">
              <span className="text-xs font-bold text-primary bg-primary/10 px-2.5 py-1 rounded-lg">{letter}</span>
            </div>
            <div className="space-y-2 mt-2">
              {items.map(t => (
                <div key={t.term} className="p-4 bg-card rounded-xl shadow-sm shadow-black/5">
                  <p className="text-sm font-bold text-text">{t.term}</p>
                  <p className="text-xs text-text-secondary mt-1 leading-relaxed">{t.def}</p>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <p className="text-center text-text-secondary py-12">Nenhum termo encontrado</p>
      )}
    </div>
  )
}
