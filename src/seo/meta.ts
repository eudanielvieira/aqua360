/**
 * Título e descrição de cada rota, derivados dos mesmos dados que a tela usa.
 *
 * É a fonte única do head: o `scripts/generate-seo.ts` chama estas funções no
 * build para escrever o HTML de cada rota, e as páginas chamam as mesmas para
 * atualizar o head no cliente. Só existe uma regra de formatação, então o que
 * o Google lê e o que o usuário vê não divergem.
 *
 * Tudo aqui é função pura sobre os dados em pt-BR. Nada de i18next: o script
 * roda fora do browser, e a decisão de publicar só o português está registrada
 * na seção de SEO do README.
 */

import type { Coral, Disease, Fish, Plant } from '../types'
import { getImageUrl, isNormalized } from '../utils/image'
import { DEFAULT_DESCRIPTION, DEFAULT_TITLE } from './site'

export interface PageMeta {
  /** Título completo, já com o sufixo da marca quando cabe. */
  title: string
  description: string
  /** Caminho local ou URL remota. Vira absoluta na hora de escrever a tag. */
  image?: string
  /** Fora do índice do Google, mas ainda percorrida. */
  noIndex?: boolean
}

/**
 * Teto da descrição.
 *
 * O Google corta o snippet perto dos 160 caracteres no desktop e antes disso
 * no mobile. Mandar mais só desperdiça: a frase é truncada no meio.
 */
const MAX_DESCRIPTION = 160

/** Corta no espaço mais próximo para não deixar palavra pela metade. */
export function truncate(text: string, max = MAX_DESCRIPTION): string {
  const clean = text.replace(/\s+/g, ' ').trim()
  if (clean.length <= max) return clean

  const cut = clean.slice(0, max - 1)
  const lastSpace = cut.lastIndexOf(' ')
  const body = lastSpace > max * 0.6 ? cut.slice(0, lastSpace) : cut

  return `${body.replace(/[\s,;:.]+$/, '')}…`
}

/**
 * Aceita o campo só quando ele é mesmo um parâmetro, e não um parágrafo.
 *
 * Boa parte das fichas antigas traz texto corrido em coluna de parâmetro (o
 * tamanho adulto da Arraia Leopoldi rende dez linhas). O limite de tamanho
 * separa "6.0 a 7.5" de uma explicação inteira sem precisar de lista de
 * exceção, e o campo descartado simplesmente não entra na descrição.
 */
function param(value: string | undefined, max = 40): string | null {
  const clean = value?.replace(/\s+/g, ' ').trim()
  if (!clean || clean.length > max) return null
  return clean
}

/** Primeira frase de um texto corrido, para servir de resumo. */
function firstSentence(text: string | undefined): string {
  const clean = text?.replace(/\s+/g, ' ').trim() ?? ''
  if (!clean) return ''
  const match = clean.match(/^.*?[.!?](?=\s|$)/)
  return (match ? match[0] : clean).trim()
}

/**
 * Monta um fato da descrição a partir de um campo de parâmetro.
 *
 * Devolve `null` quando o campo não passa no filtro do `param`, e aí ele
 * some da lista sem deixar rótulo órfão do tipo "pH ." na frase.
 */
function fact(
  label: string,
  value: string | undefined,
  transform?: (v: string) => string
): string | null {
  const clean = param(value)
  if (!clean) return null
  const shown = transform ? transform(clean) : clean
  return label ? `${label} ${shown}` : shown
}

const lower = (v: string) => v.toLowerCase()

/** Junta as partes não vazias e garante ponto final antes do resumo. */
function compose(lead: string, facts: (string | null)[], summary: string): string {
  const params = facts.filter(Boolean).join(', ')
  const head = params ? `${lead}: ${params}.` : `${lead}.`
  return truncate(summary ? `${head} ${summary}` : head)
}

const SUFFIX = 'Aqua360'

/**
 * Teto do título.
 *
 * O Google corta o título por largura em pixel, o que dá mais ou menos 60
 * caracteres. Passar disso não é erro, só desperdício: o fim some no resultado.
 */
const MAX_TITLE = 60

function withBrand(title: string): string {
  return `${title} - ${SUFFIX}`
}

/**
 * Junta nome popular e científico sem repetir.
 *
 * Muita ficha antiga tem o popular igual ao científico (o Lamprologus
 * ornatipinnis nunca ganhou nome de mercado), e aí o par vira
 * "Lamprologus Ornatipinnis (Lamprologus Ornatipinnis)".
 */
function speciesNames(popular: string, scientific: string): string {
  const left = popular?.trim() ?? ''
  const right = scientific?.trim() ?? ''

  if (!right || left.toLowerCase() === right.toLowerCase()) return left || right
  if (!left) return right
  return `${left} (${right})`
}

/**
 * Título de ficha, com a marca no fim só quando ela cabe.
 *
 * Entre perder o nome científico e perder o " - Aqua360", perder o sufixo custa
 * menos: quem busca digita o nome da espécie, não o da marca.
 */
function speciesTitle(popular: string, scientific: string): string {
  const base = speciesNames(popular, scientific)
  const branded = withBrand(base)
  return branded.length <= MAX_TITLE ? branded : base
}

/** Abre a descrição pelos dois nomes, na forma "Popular, Scientificus". */
function speciesLead(popular: string, scientific: string): string {
  const left = popular?.trim() ?? ''
  const right = scientific?.trim() ?? ''

  if (!right || left.toLowerCase() === right.toLowerCase()) return left || right
  if (!left) return right
  return `${left}, ${right}`
}

/** Escolhe a melhor imagem disponível: arte própria, depois foto remota. */
function speciesImage(
  imagem: string | undefined,
  enrichment: { wikiPhotoUrl?: string; inatPhotoUrls?: string[] } | undefined
): string | undefined {
  if (imagem && isNormalized(imagem)) return getImageUrl(imagem)
  if (enrichment?.wikiPhotoUrl) return enrichment.wikiPhotoUrl
  const inat = enrichment?.inatPhotoUrls?.[0]
  if (inat) return inat
  return undefined
}

// --- Fichas ---------------------------------------------------------------

export function fishMeta(fish: Fish): PageMeta {
  const facts = [
    fact('pH', fish.ph),
    fact('', fish.temperatura),
    fact('', fish.tamanhoAdulto, v => `${v} adulto`),
  ]
  const summary = firstSentence(fish.comportamento) || firstSentence(fish.caracteristica)

  return {
    title: speciesTitle(fish.nomePopular, fish.nomeCientifico),
    description: compose(speciesLead(fish.nomePopular, fish.nomeCientifico), facts, summary),
    image: speciesImage(fish.imagem, fish.enrichment),
  }
}

export function plantMeta(plant: Plant): PageMeta {
  const facts = [
    fact('pH', plant.ph),
    fact('', plant.temperatura),
    fact('luz', plant.iluminacao),
    fact('dificuldade', plant.dificuldade, lower),
  ]
  const summary = [
    fact('Fica no', plant.posicao, v => `${lower(v)} do aquário.`),
    fact('CO2:', plant.co2, v => `${lower(v)}.`),
  ]
    .filter(Boolean)
    .join(' ')

  return {
    title: speciesTitle(plant.nomePopular, plant.nomeCientifico),
    description: compose(speciesLead(plant.nomePopular, plant.nomeCientifico), facts, summary),
    image: speciesImage(plant.imagem, plant.enrichment),
  }
}

export function coralMeta(coral: Coral): PageMeta {
  const facts = [
    fact('dificuldade', coral.dificuldade, lower),
    fact('iluminação', coral.iluminacao, lower),
    fact('fluxo', coral.fluxoAgua, lower),
  ]

  return {
    title: speciesTitle(coral.nomePopular, coral.nomeCientifico),
    description: compose(
      speciesLead(coral.nomePopular, coral.nomeCientifico),
      facts,
      firstSentence(coral.descricao)
    ),
    image: speciesImage(undefined, coral.enrichment),
  }
}

export function diseaseMeta(disease: Disease): PageMeta {
  const summary = firstSentence(disease.sintoma) || firstSentence(disease.causa)
  const lead = speciesLead(disease.nome, disease.nomeCientifico)
  const base = `${disease.nome} - sintomas e tratamento`

  return {
    title: withBrand(base).length <= MAX_TITLE ? withBrand(base) : base,
    description: truncate(
      summary
        ? `${lead}. ${summary}`
        : `${lead}: sintomas, causa e tratamento da doença em peixes de aquário.`
    ),
    image: disease.imagem ? getImageUrl(disease.imagem) : undefined,
  }
}

// --- Páginas fixas --------------------------------------------------------

/**
 * Metadados das rotas sem parâmetro.
 *
 * A chave é o caminho exato, do jeito que aparece no `App.tsx`. O script de
 * build percorre este objeto para saber o que gerar, então uma rota nova só
 * entra no sitemap depois de ganhar uma linha aqui, de propósito: obriga a
 * escrever a descrição em vez de publicar a genérica.
 */
export const staticPages: Record<string, PageMeta> = {
  '/': {
    title: DEFAULT_TITLE,
    description: DEFAULT_DESCRIPTION,
  },
  '/peixes': {
    title: withBrand('Peixes de aquário'),
    description:
      'Fichas de peixes e invertebrados de água doce e salgada com pH, temperatura, porte adulto, alimentação, comportamento e reprodução.',
  },
  '/plantas': {
    title: withBrand('Plantas de aquário'),
    description:
      'Plantas aquáticas com exigência de luz, CO2, substrato fértil, pH, temperatura e posição no layout. Do iniciante ao aquário plantado.',
  },
  '/corais': {
    title: withBrand('Corais e anêmonas'),
    description:
      'Corais moles, LPS, SPS e anêmonas para aquário marinho: iluminação, fluxo de água, dificuldade, alimentação e compatibilidade.',
  },
  '/doencas': {
    title: withBrand('Doenças de peixes e tratamentos'),
    description:
      'Doenças de peixes de aquário com sintoma, causa e tratamento. Identifique parasitas, bactérias e fungos antes de perder o cardume.',
  },
  '/calculadoras': {
    title: withBrand('Calculadoras para aquário'),
    description:
      'Calcule volume do aquário, dosagem de fertilizante, quantidade de substrato e outras contas do dia a dia sem sair da página.',
  },
  '/compatibilidade': {
    title: withBrand('Compatibilidade entre peixes'),
    description:
      'Verifique se as espécies podem dividir o mesmo aquário antes de comprar. Cruzamos temperamento, porte, parâmetros de água e origem.',
  },
  '/montar-aquario': {
    title: withBrand('Montador de aquário'),
    description:
      'Escolha o peixe principal e descubra quais companheiros combinam com ele em temperamento, porte e parâmetros de água.',
  },
  '/glossario': {
    title: withBrand('Glossário de aquarismo'),
    description:
      'Os termos do aquarismo explicados em português claro: ciclagem, biofiltração, KH, GH, TDS, sump, refúgio e o resto do vocabulário.',
  },
  '/guias': {
    title: withBrand('Guias de aquarismo'),
    description:
      'Guias passo a passo para montar e manter o aquário: ciclagem, escolha do filtro, manutenção semanal e os erros mais comuns.',
  },
  '/apoie': {
    title: withBrand('Apoie o projeto'),
    description:
      'O Aqua360 é um projeto independente de catalogação de espécies para a comunidade de aquarismo. Veja como ajudar a mantê-lo de pé.',
  },
  '/sobre': {
    title: withBrand('Sobre o projeto'),
    description:
      'Informação de verdade para quem cuida de aquário. Como o Aqua360 reúne, checa e publica os dados das espécies que cataloga.',
  },
  '/busca': {
    title: withBrand('Busca'),
    description: 'Pesquise espécies, plantas, corais e doenças em todo o acervo do Aqua360.',
    // Página de resultado de busca interna. O Google pede explicitamente para
    // não indexar essas: geram URL infinita por query e não são um destino.
    noIndex: true,
  },
}

/**
 * Metadados das quatro categorias de `/peixes/:slug`.
 *
 * Ficam separados de `staticPages` porque o script precisa cruzar cada slug com
 * as fichas daquela categoria para montar o sitemap.
 */
export const fishCategoryPages: Record<string, PageMeta> = {
  'agua-doce': {
    title: withBrand('Peixes de água doce'),
    description:
      'Peixes de água doce para aquário com pH, temperatura, porte adulto, comportamento e alimentação. Tetras, ciclídeos, bettas e mais.',
  },
  'agua-salgada': {
    title: withBrand('Peixes de água salgada'),
    description:
      'Peixes marinhos para aquário de recife com parâmetros de água, porte adulto, alimentação e convivência. Palhaços, cirurgiões e mais.',
  },
  'invertebrados-agua-doce': {
    title: withBrand('Invertebrados de água doce'),
    description:
      'Camarões, caramujos e outros invertebrados de água doce: parâmetros, alimentação, reprodução e convivência com peixes.',
  },
  'invertebrados-agua-salgada': {
    title: withBrand('Invertebrados de água salgada'),
    description:
      'Camarões, caranguejos, estrelas e outros invertebrados marinhos para aquário de recife: parâmetros, papel na limpeza e convivência.',
  },
}
