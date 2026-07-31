import { fishCategories } from './data/fish-index'

/**
 * Fonte unica dos campos que passam pela camada de traducao e da chave que
 * indexa cada ficha nos arquivos `data-*.json`.
 *
 * Antes esta lista existia copiada em tres lugares (o hook, o gerador do pt-BR
 * e o validador) e sair de sincronia ali significava ficha servindo texto de
 * outra especie.
 */

export type TranslatableType = 'fish' | 'plant' | 'coral' | 'disease'

export const translatableFields: Record<TranslatableType, string[]> = {
  fish: [
    'nomePopular',
    'alimentacao',
    'caracteristica',
    'comportamento',
    'diformismoSexual',
    'origem',
    'outrasInformacoes',
    'outrosNome',
    'posicaoAquario',
    'reproducao',
  ],
  plant: [
    'nomePopular',
    'outrosNome',
    'origem',
    'reproducao',
    'co2',
    'crescimento',
    'dificuldade',
    'estrutura',
    'plantio',
    'porte',
    'posicao',
    'substratoFertil',
    'suportaEmersao',
  ],
  coral: [
    'nomePopular',
    'outrosNome',
    'origem',
    'alimentacao',
    'compatibilidade',
    'descricao',
    'coloracao',
    'iluminacao',
    'fluxoAgua',
    'dificuldade',
    'crescimento',
  ],
  disease: ['nome', 'causa', 'tratamento', 'sintoma'],
}

export const namespaceMap: Record<TranslatableType, string> = {
  fish: 'data-fish',
  plant: 'data-plants',
  coral: 'data-corals',
  disease: 'data-diseases',
}

/** Mapa do campo `tipo` da ficha para o slug da categoria (PEIXESMARINHOS -> agua-salgada). */
const slugPorTipo = new Map(fishCategories.map((c) => [c.key, c.slug]))

/**
 * Chave da ficha dentro do seu namespace de traducao.
 *
 * Peixes moram em quatro arquivos com numeracao propria: so o id colide (92
 * ids existem em mais de um arquivo), entao a chave leva o slug junto. Plantas,
 * corais e doencas vivem num arquivo so cada um, onde o id ja e unico.
 */
export function speciesKey(
  species: { id: number; tipo?: string },
  type: TranslatableType,
): string {
  if (type !== 'fish') return String(species.id)
  const slug = slugPorTipo.get(species.tipo ?? '')
  return slug ? `${slug}:${species.id}` : String(species.id)
}
