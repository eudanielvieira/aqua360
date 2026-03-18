export interface Taxonomia {
  reino: string
  filo: string
  classe: string
  ordem: string
  familia: string
  genero: string
  especie: string
}

export interface EnrichmentData {
  gbifTaxonKey?: number
  wormsAphiaId?: number
  taxonomia?: Taxonomia
  inatPhotoUrls?: string[]
  inatObservationCount?: number
  gbifOccurrenceCount?: number
  enrichedAt?: string
}

export interface Fish {
  id: number
  alimentacao: string
  caracteristica: string
  comportamento: string
  diformismoSexual: string
  familia: string
  gh: string
  imagem: string
  kh: string
  nomeCientifico: string
  nomePopular: string
  origem: string
  outrasInformacoes: string
  outrosNome: string
  ph: string
  posicaoAquario: string
  reproducao: string
  tamanhoAdulto: string
  temperatura: string
  tipo: string
  subTipo: string
  fonte: string
  enrichment?: EnrichmentData
}

export interface Plant {
  id: number
  co2: string
  crescimento: string
  dificuldade: string
  estrutura: string
  familia: string
  iluminacao: string
  imagem: string
  nomeCientifico: string
  nomePopular: string
  origem: string
  outrosNome: string
  ph: string
  plantio: string
  porte: string
  posicao: string
  reproducao: string
  substratoFertil: string
  suportaEmersao: string
  tamanho: string
  temperatura: string
  fonte: string
  enrichment?: EnrichmentData
}

export type DiseaseCategory = 'parasita' | 'bacteria' | 'fungo' | 'virus' | 'protozoario' | 'outro'

export interface Disease {
  id: number
  nome: string
  nomeCientifico: string
  causa: string
  tratamento: string
  sintoma: string
  imagem: string
  categoria: DiseaseCategory
}

export interface Calculator {
  id: number
  nome: string
  descricao: string
  icon: string
}
