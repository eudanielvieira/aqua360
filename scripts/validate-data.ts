/**
 * Validador do acervo: placar e gate da frente de equalizacao de textos
 * (dxspec/specs/0001-equalizacao-de-textos/).
 *
 * Uso:
 *   bun run validate-data                      roda tudo e imprime o placar
 *   bun run validate-data --rule=formato       roda so uma regra (aceita lista com virgula)
 *   bun run validate-data --locale=pt-BR       restringe as regras de idioma
 *   bun run validate-data --lote=3             restringe a regra de voz a um lote
 *   bun run validate-data --full               lista todas as ocorrencias, nao so as primeiras
 *   bun run validate-data --json               saida em JSON, para o CI
 *   bun run validate-data --snapshot           regrava a baseline de campos vazios e sai
 *
 * Sai com codigo 1 se houver qualquer violacao bloqueante, 0 caso contrario.
 * Aviso nunca derruba o gate: serve para o humano olhar.
 */

import { readdirSync, existsSync } from 'node:fs'
import { resolve, join } from 'node:path'
import type { Fish } from '../src/types'

const ROOT = resolve(import.meta.dirname, '..')
const LOCALES_DIR = join(ROOT, 'public/locales')
const BASELINE = join(import.meta.dirname, '.validate-baseline.json')
const LOTES = join(ROOT, 'dxspec/specs/0001-equalizacao-de-textos/lotes.json')

const LOCALES = ['pt-BR', 'en', 'es', 'ja'] as const
type Locale = (typeof LOCALES)[number]

/** Os quatro arquivos de ficha, na chave que tambem prefixa o id nas traducoes. */
const ARQUIVOS = {
  'agua-doce': 'src/data/fish-agua-doce',
  'agua-salgada': 'src/data/fish-agua-salgada',
  'invertebrados-agua-doce': 'src/data/fish-invertebrados-agua-doce',
  'invertebrados-agua-salgada': 'src/data/fish-invertebrados-agua-salgada',
} as const

type Slug = keyof typeof ARQUIVOS

// -- Matriz de obrigatoriedade (spec.md, "Matriz de decisao") --

type Exigencia = 'obrig' | 'opc' | 'na'

const MATRIZ: Record<string, Record<Slug, Exigencia>> = {
  nomePopular: { 'agua-doce': 'obrig', 'agua-salgada': 'obrig', 'invertebrados-agua-doce': 'obrig', 'invertebrados-agua-salgada': 'obrig' },
  nomeCientifico: { 'agua-doce': 'obrig', 'agua-salgada': 'obrig', 'invertebrados-agua-doce': 'obrig', 'invertebrados-agua-salgada': 'obrig' },
  familia: { 'agua-doce': 'obrig', 'agua-salgada': 'obrig', 'invertebrados-agua-doce': 'obrig', 'invertebrados-agua-salgada': 'obrig' },
  origem: { 'agua-doce': 'obrig', 'agua-salgada': 'obrig', 'invertebrados-agua-doce': 'obrig', 'invertebrados-agua-salgada': 'obrig' },
  ph: { 'agua-doce': 'obrig', 'agua-salgada': 'obrig', 'invertebrados-agua-doce': 'obrig', 'invertebrados-agua-salgada': 'obrig' },
  temperatura: { 'agua-doce': 'obrig', 'agua-salgada': 'obrig', 'invertebrados-agua-doce': 'obrig', 'invertebrados-agua-salgada': 'obrig' },
  // Em marinho quem se controla e o sistema, nao a especie: gh e kh por ficha seriam ruido.
  gh: { 'agua-doce': 'obrig', 'agua-salgada': 'na', 'invertebrados-agua-doce': 'obrig', 'invertebrados-agua-salgada': 'na' },
  kh: { 'agua-doce': 'obrig', 'agua-salgada': 'na', 'invertebrados-agua-doce': 'obrig', 'invertebrados-agua-salgada': 'na' },
  tamanhoAdulto: { 'agua-doce': 'obrig', 'agua-salgada': 'obrig', 'invertebrados-agua-doce': 'obrig', 'invertebrados-agua-salgada': 'obrig' },
  posicaoAquario: { 'agua-doce': 'obrig', 'agua-salgada': 'obrig', 'invertebrados-agua-doce': 'obrig', 'invertebrados-agua-salgada': 'obrig' },
  alimentacao: { 'agua-doce': 'obrig', 'agua-salgada': 'obrig', 'invertebrados-agua-doce': 'obrig', 'invertebrados-agua-salgada': 'obrig' },
  comportamento: { 'agua-doce': 'obrig', 'agua-salgada': 'obrig', 'invertebrados-agua-doce': 'obrig', 'invertebrados-agua-salgada': 'obrig' },
  caracteristica: { 'agua-doce': 'obrig', 'agua-salgada': 'obrig', 'invertebrados-agua-doce': 'obrig', 'invertebrados-agua-salgada': 'obrig' },
  reproducao: { 'agua-doce': 'obrig', 'agua-salgada': 'opc', 'invertebrados-agua-doce': 'opc', 'invertebrados-agua-salgada': 'opc' },
  diformismoSexual: { 'agua-doce': 'obrig', 'agua-salgada': 'opc', 'invertebrados-agua-doce': 'opc', 'invertebrados-agua-salgada': 'opc' },
  outrasInformacoes: { 'agua-doce': 'opc', 'agua-salgada': 'opc', 'invertebrados-agua-doce': 'opc', 'invertebrados-agua-salgada': 'opc' },
  outrosNome: { 'agua-doce': 'opc', 'agua-salgada': 'opc', 'invertebrados-agua-doce': 'opc', 'invertebrados-agua-salgada': 'opc' },
}

/** Subconjunto da matriz usado no placar: a "ficha minima" da spec. */
const FICHA_MINIMA = [
  'familia', 'origem', 'ph', 'temperatura', 'tamanhoAdulto',
  'posicaoAquario', 'alimentacao', 'comportamento', 'caracteristica',
]

// -- Formato canonico (ADR 0001) --

const FORMATO: Record<string, { re: RegExp; exemplo: string }> = {
  ph: { re: /^\d+(\.\d+)?(-\d+(\.\d+)?)?$/, exemplo: '6.5-7.5' },
  gh: { re: /^\d+(\.\d+)?(-\d+(\.\d+)?)?$/, exemplo: '4-12' },
  kh: { re: /^\d+(\.\d+)?(-\d+(\.\d+)?)?$/, exemplo: '2-8' },
  temperatura: { re: /^\d+(\.\d+)?(-\d+(\.\d+)?)? °C$/, exemplo: '24-27 °C' },
  tamanhoAdulto: { re: /^\d+(\.\d+)?(-\d+(\.\d+)?)? cm$/, exemplo: '13 cm' },
}

const POSICOES = ['Fundo', 'Meio', 'Topo', 'Todo o aquário', 'Vidros e superfícies']

/** Faixas plausiveis. Fora disso so passa com `fonte` preenchida. */
const ESCALA = {
  ph: [4, 10],
  temperatura: [4, 35],
  tamanhoAdulto: [0.5, 400],
} as const

// -- Vocabulario de acentuacao (AC-9) --

/** Formas corretas. A forma errada e derivada tirando os diacriticos. */
const ACENTUADAS = [
  // Sem "à" e "às": reduzidos viram "a" e "as", que marcariam todo artigo.
  'não', 'água', 'são', 'também', 'você', 'até', 'já',
  'aquário', 'aquários', 'aquarística', 'espécie', 'espécies', 'espécime',
  'alimentação', 'reprodução', 'característica', 'características',
  'informação', 'informações', 'cálculo', 'cálculos', 'calculadoras',
  'manutenção', 'iluminação', 'nutrição', 'fertilização', 'decoração',
  'difícil', 'fácil', 'médio', 'média', 'nível', 'níveis', 'padrão',
  'período', 'mínimo', 'máximo', 'química', 'químico', 'próprio', 'ótimo',
  'único', 'possível', 'disponível', 'útil', 'três', 'próximo', 'último',
  'história', 'referência', 'referências', 'conteúdo', 'número', 'código',
  'família', 'famílias', 'gênero', 'tóxico', 'genérico', 'básico', 'prático',
  'automático', 'orgânico', 'biológico', 'amônia', 'tradução', 'página',
  'páginas', 'seção', 'seções', 'opção', 'opções', 'botão', 'botões',
  'ação', 'ações', 'seleção', 'posição', 'condição', 'condições',
  'doença', 'doenças', 'anúncio', 'anúncios', 'dedicação', 'distribuição',
  'câmara', 'comparação', 'avaliação', 'classificação', 'descrição',
  'dimensão', 'oxigênio', 'hidrogênio', 'nitrogênio', 'calcário',
  'magnésio', 'cálcio', 'potássio', 'sódio', 'território', 'agressão',
  'prevenção', 'glossário', 'início', 'configuração', 'inglês', 'japonês',
  'português', 'espanhol', 'dulcícola', 'dulcícolas', 'ciclídeo', 'ciclídeos',
  'camarão', 'camarões', 'mexilhão', 'mexilhões', 'peixe-palhaço',
  'protozoário', 'vírus', 'bactéria', 'bactérias', 'anêmona', 'anêmonas',
  'emersão', 'submersão', 'fotoperíodo', 'salinização', 'quarentena',
  'observação', 'observações', 'atenção', 'sugestão', 'sugestões',
  'versão', 'exibição', 'ordenação', 'comparações', 'científico',
  'científica', 'variedade', 'coloração', 'compatível', 'incompatível',
]

const SEM_ACENTO = new Map<string, string>()
for (const palavra of ACENTUADAS) {
  const chave = tirarAcento(palavra)
  if (chave !== palavra) SEM_ACENTO.set(chave, palavra)
}

/** "e" no lugar de "é". Ambiguo por natureza, entra como aviso. */
const E_VERBO = /\be (um|uma|possivel|possível|importante|necessario|necessário|recomendado|feito|comum|indicado)\b/i

// -- Higiene tipografica (AC-5) --

const TIPOGRAFIA: { tipo: string; re: RegExp; nota: string }[] = [
  { tipo: 'travessao', re: /[—–]/, nota: 'travessão ou meia-risca' },
  { tipo: 'aspas-curvas', re: /[“”‘’]/, nota: 'aspas curvas do dump antigo' },
  { tipo: 'hifen-duplo', re: / -- /, nota: '"--" usado como travessão' },
  { tipo: 'espaco-duplo', re: {} as RegExp, nota: 'espaço duplo' },
  { tipo: 'html', re: /<[^>\s][^>]*>|&[a-z]+;/i, nota: 'tag HTML ou entidade solta' },
  { tipo: 'grau-errado', re: /\dº\s*C|\d\s*oC\b/, nota: 'grau escrito como ordinal masculino ou letra "o"' },
]
TIPOGRAFIA[3].re = / {2,}/

/** Campos de ficha que chegam ao leitor e passam pela higiene. */
const CAMPOS_TEXTO = [
  'nomePopular', 'outrosNome', 'origem', 'familia', 'posicaoAquario', 'fonte',
  'caracteristica', 'comportamento', 'alimentacao', 'reproducao',
  'diformismoSexual', 'outrasInformacoes',
]

/** Campos narrativos: os que ganham voz e exigem pontuacao final. */
const CAMPOS_NARRATIVOS = [
  'caracteristica', 'comportamento', 'alimentacao', 'reproducao',
  'diformismoSexual', 'outrasInformacoes',
]

// -- Voz de aquarista (AC-8) --

const LISTA_NEGRA = [
  'Deve-se', 'É recomendável que se', 'O mesmo', 'Os mesmos', 'A mesma',
  'Faz-se necessário', 'Sendo assim', 'Vale ressaltar', 'Cabe salientar',
]
const MEDIA_PALAVRAS_MAX = 22
const FRASE_PALAVRAS_MAX = 45

// -- Tipos --

type Severidade = 'bloqueante' | 'aviso'

interface Violacao {
  regra: string
  tipo: string
  severidade: Severidade
  alvo: string
  detalhe: string
}

interface Ficha extends Fish {
  __slug: Slug
  __chave: string
}

interface Contexto {
  fichas: Ficha[]
  locales: Record<Locale, Record<string, unknown>>
  baseline: Record<string, string[]>
  lotes: Record<string, { regra: string; chaves: string[] }>
  filtroLocale?: Locale
  filtroLote?: string
}

// -- Utilitarios --

function tirarAcento(s: string): string {
  return s.normalize('NFD').replace(/\p{Diacritic}/gu, '')
}

function texto(v: unknown): string {
  return typeof v === 'string' ? v.trim() : ''
}

function numeros(s: string): number[] {
  return (s.match(/\d+(?:[.,]\d+)?/g) ?? []).map((n) => parseFloat(n.replace(',', '.')))
}

function frases(s: string): string[] {
  return s.split(/(?<=[.!?])\s+/).map((f) => f.trim()).filter(Boolean)
}

function palavras(s: string): number {
  return s.split(/\s+/).filter(Boolean).length
}

/** Percorre um JSON de locale devolvendo pares chave achatada -> string. */
function achatar(obj: unknown, prefixo = ''): [string, string][] {
  const saida: [string, string][] = []
  if (!obj || typeof obj !== 'object') return saida
  for (const [k, v] of Object.entries(obj as Record<string, unknown>)) {
    if (typeof v === 'string') saida.push([prefixo + k, v])
    else if (v && typeof v === 'object') saida.push(...achatar(v, `${prefixo}${k}.`))
  }
  return saida
}

function arquivosDeLocale(locale: Locale): string[] {
  return readdirSync(join(LOCALES_DIR, locale)).filter((f) => f.endsWith('.json')).sort()
}

// -- Carga --

async function carregar(filtroLocale?: Locale, filtroLote?: string): Promise<Contexto> {
  const fichas: Ficha[] = []
  for (const [slug, caminho] of Object.entries(ARQUIVOS)) {
    const mod = (await import(join(ROOT, caminho))) as { default: Fish[] }
    for (const f of mod.default) {
      fichas.push({ ...f, __slug: slug as Slug, __chave: `${slug}:${f.id}` })
    }
  }

  const locales = {} as Record<Locale, Record<string, unknown>>
  for (const locale of LOCALES) {
    const arquivos: Record<string, unknown> = {}
    for (const nome of arquivosDeLocale(locale)) {
      arquivos[nome] = await Bun.file(join(LOCALES_DIR, locale, nome)).json()
    }
    locales[locale] = arquivos
  }

  const baseline = existsSync(BASELINE) ? await Bun.file(BASELINE).json() : {}
  const lotes = existsSync(LOTES) ? await Bun.file(LOTES).json() : {}

  return { fichas, locales, baseline, lotes, filtroLocale, filtroLote }
}

// -- Regras --

type Regra = (ctx: Contexto) => Violacao[]

/** AC-2: uma chave por ficha, no formato <tipo>:<id>, sem sobrescrita. */
const regraChaves: Regra = (ctx) => {
  const v: Violacao[] = []
  const esperadas = new Set(ctx.fichas.map((f) => f.__chave))

  const vistas = new Map<string, string>()
  for (const f of ctx.fichas) {
    const anterior = vistas.get(f.__chave)
    if (anterior) {
      v.push({ regra: 'chaves', tipo: 'colisao-na-origem', severidade: 'bloqueante', alvo: f.__chave, detalhe: `id repetido dentro do mesmo arquivo: ${anterior} e ${f.nomePopular}` })
    }
    vistas.set(f.__chave, f.nomePopular)
  }

  for (const locale of LOCALES) {
    if (ctx.filtroLocale && locale !== ctx.filtroLocale) continue
    const dados = ctx.locales[locale]['data-fish.json'] as Record<string, unknown> | undefined
    if (!dados) {
      v.push({ regra: 'chaves', tipo: 'arquivo-ausente', severidade: 'bloqueante', alvo: locale, detalhe: 'data-fish.json nao existe' })
      continue
    }
    const presentes = new Set(Object.keys(dados))
    for (const chave of presentes) {
      if (!esperadas.has(chave)) {
        v.push({ regra: 'chaves', tipo: 'chave-fora-do-padrao', severidade: 'bloqueante', alvo: `${locale}/${chave}`, detalhe: 'nao corresponde a nenhuma ficha no formato <tipo>:<id>' })
      }
    }
    for (const chave of esperadas) {
      if (!presentes.has(chave)) {
        v.push({ regra: 'chaves', tipo: 'ficha-sem-traducao', severidade: 'bloqueante', alvo: `${locale}/${chave}`, detalhe: 'ficha do acervo sem entrada neste idioma' })
      }
    }
  }
  return v
}

/** AC-3: formato canonico dos parametros. */
const regraFormato: Regra = (ctx) => {
  const v: Violacao[] = []
  for (const f of ctx.fichas) {
    for (const [campo, { re, exemplo }] of Object.entries(FORMATO)) {
      const valor = texto((f as unknown as Record<string, unknown>)[campo])
      if (!valor) continue
      if (!re.test(valor)) {
        v.push({ regra: 'formato', tipo: campo, severidade: 'bloqueante', alvo: f.__chave, detalhe: `${campo}="${valor}", esperado como "${exemplo}"` })
      }
    }
    const posicao = texto(f.posicaoAquario)
    if (posicao && !POSICOES.includes(posicao)) {
      v.push({ regra: 'formato', tipo: 'posicaoAquario', severidade: 'bloqueante', alvo: f.__chave, detalhe: `posicaoAquario="${posicao}", fora do vocabulario ${POSICOES.join(' / ')}` })
    }
  }
  return v
}

/** AC-4: faixa coerente e dentro da escala plausivel. */
const regraFaixas: Regra = (ctx) => {
  const v: Violacao[] = []
  for (const f of ctx.fichas) {
    const temFonte = texto(f.fonte).length > 0
    for (const campo of ['ph', 'temperatura', 'tamanhoAdulto', 'gh', 'kh']) {
      const valor = texto((f as unknown as Record<string, unknown>)[campo])
      if (!valor) continue
      const n = numeros(valor)
      if (n.length === 0) {
        v.push({ regra: 'faixas', tipo: 'sem-numero', severidade: 'bloqueante', alvo: f.__chave, detalhe: `${campo}="${valor}" nao tem numero` })
        continue
      }
      if (n.length >= 2 && n[0] > n[1]) {
        v.push({ regra: 'faixas', tipo: 'invertida', severidade: 'bloqueante', alvo: f.__chave, detalhe: `${campo}="${valor}": minimo maior que o maximo` })
      }
      const escala = ESCALA[campo as keyof typeof ESCALA]
      if (escala && !temFonte) {
        const fora = n.filter((x) => x < escala[0] || x > escala[1])
        if (fora.length) {
          v.push({ regra: 'faixas', tipo: 'fora-da-escala', severidade: 'bloqueante', alvo: f.__chave, detalhe: `${campo}="${valor}" sai de ${escala[0]}-${escala[1]} e a ficha nao tem fonte` })
        }
      }
    }
  }
  return v
}

/** AC-5: higiene tipografica no dado e nos locales. */
const regraTipografia: Regra = (ctx) => {
  const v: Violacao[] = []

  const checar = (alvo: string, valor: string, narrativo: boolean) => {
    for (const { tipo, re, nota } of TIPOGRAFIA) {
      if (re.test(valor)) {
        v.push({ regra: 'tipografia', tipo, severidade: 'bloqueante', alvo, detalhe: `${nota}: "${trecho(valor, re)}"` })
      }
    }
    if (narrativo && valor.length > 40 && !/[.!?)"]$/.test(valor)) {
      v.push({ regra: 'tipografia', tipo: 'sem-pontuacao-final', severidade: 'bloqueante', alvo, detalhe: `termina em "...${valor.slice(-32)}"` })
    }
  }

  for (const f of ctx.fichas) {
    for (const campo of CAMPOS_TEXTO) {
      const valor = texto((f as unknown as Record<string, unknown>)[campo])
      if (valor) checar(`${f.__chave}.${campo}`, valor, CAMPOS_NARRATIVOS.includes(campo))
    }
  }

  for (const locale of LOCALES) {
    if (ctx.filtroLocale && locale !== ctx.filtroLocale) continue
    for (const [nome, conteudo] of Object.entries(ctx.locales[locale])) {
      // pt-BR/data-*.json e espelho gerado de src/data: contar la seria duplicar.
      if (locale === 'pt-BR' && nome.startsWith('data-')) continue
      for (const [chave, valor] of achatar(conteudo)) {
        checar(`${locale}/${nome}:${chave}`, valor, false)
      }
    }
  }
  return v
}

/** Devolve um pedaco do texto ao redor da primeira ocorrencia, para a mensagem. */
function trecho(valor: string, re: RegExp): string {
  const m = valor.match(re)
  if (!m || m.index === undefined) return valor.slice(0, 40)
  const ini = Math.max(0, m.index - 18)
  return valor.slice(ini, m.index + m[0].length + 18).replace(/\s+/g, ' ')
}

/** AC-6: familia bate com a taxonomia enriquecida. */
const regraTaxonomia: Regra = (ctx) => {
  const v: Violacao[] = []
  for (const f of ctx.fichas) {
    const gbif = texto(f.enrichment?.taxonomia?.familia)
    const campo = texto(f.familia)
    if (!gbif) {
      if (campo) {
        v.push({ regra: 'taxonomia', tipo: 'sem-taxonomia', severidade: 'aviso', alvo: f.__chave, detalhe: `familia="${campo}" sem taxonomia enriquecida para conferir` })
      }
      continue
    }
    if (campo && campo !== gbif) {
      v.push({ regra: 'taxonomia', tipo: 'divergente', severidade: 'bloqueante', alvo: f.__chave, detalhe: `familia="${campo}" contra "${gbif}" no GBIF` })
    }
  }
  return v
}

/** AC-7: obrigatoriedade pela matriz, procedencia e duplicatas. */
const regraCompletude: Regra = (ctx) => {
  const v: Violacao[] = []

  for (const f of ctx.fichas) {
    const registro = f as unknown as Record<string, unknown>
    for (const [campo, porTipo] of Object.entries(MATRIZ)) {
      if (porTipo[f.__slug] !== 'obrig') continue
      if (!texto(registro[campo])) {
        v.push({ regra: 'completude', tipo: `vazio:${campo}`, severidade: 'bloqueante', alvo: f.__chave, detalhe: `${campo} e obrigatorio em ${f.__slug}` })
      }
    }

    // Procedencia: campo que estava vazio na baseline e hoje esta preenchido exige fonte.
    const vaziosAntes = ctx.baseline[f.__chave] ?? []
    const preenchidosAgora = vaziosAntes.filter((campo) => texto(registro[campo]))
    if (preenchidosAgora.length > 0 && !texto(f.fonte)) {
      v.push({ regra: 'completude', tipo: 'sem-fonte', severidade: 'bloqueante', alvo: f.__chave, detalhe: `recebeu ${preenchidosAgora.join(', ')} nesta frente e esta sem fonte` })
    }
  }

  const porCientifico = new Map<string, Ficha[]>()
  const porPopular = new Map<string, Ficha[]>()
  for (const f of ctx.fichas) {
    const sci = texto(f.nomeCientifico).toLowerCase()
    const pop = texto(f.nomePopular).toLowerCase()
    if (sci) porCientifico.set(sci, [...(porCientifico.get(sci) ?? []), f])
    if (pop) porPopular.set(pop, [...(porPopular.get(pop) ?? []), f])
  }
  for (const [nome, grupo] of porCientifico) {
    if (grupo.length > 1) {
      v.push({ regra: 'completude', tipo: 'duplicata', severidade: 'bloqueante', alvo: grupo.map((f) => f.__chave).join(' + '), detalhe: `mesmo nome cientifico "${nome}"` })
    }
  }
  for (const [nome, grupo] of porPopular) {
    if (grupo.length > 1) {
      v.push({ regra: 'completude', tipo: 'nome-popular-repetido', severidade: 'aviso', alvo: grupo.map((f) => f.__chave).join(' + '), detalhe: `mesmo nome popular "${nome}" em especies diferentes` })
    }
  }
  return v
}

/** AC-8: voz de aquarista, so nos lotes ja processados. */
const regraVoz: Regra = (ctx) => {
  const v: Violacao[] = []
  const lotes = Object.entries(ctx.lotes).filter(([n, l]) => l.regra === 'voz' && (!ctx.filtroLote || n === ctx.filtroLote))
  if (lotes.length === 0) return v

  const porChave = new Map(ctx.fichas.map((f) => [f.__chave, f]))
  for (const [numero, lote] of lotes) {
    let totalPalavras = 0
    let totalFrases = 0
    for (const chave of lote.chaves) {
      const f = porChave.get(chave)
      if (!f) {
        v.push({ regra: 'voz', tipo: 'lote-desatualizado', severidade: 'bloqueante', alvo: `lote ${numero}`, detalhe: `chave ${chave} nao existe mais no acervo` })
        continue
      }
      const registro = f as unknown as Record<string, unknown>
      for (const campo of CAMPOS_NARRATIVOS) {
        const valor = texto(registro[campo])
        if (!valor) continue
        for (const expressao of LISTA_NEGRA) {
          if (new RegExp(`\\b${expressao}\\b`, 'i').test(valor)) {
            v.push({ regra: 'voz', tipo: 'lista-negra', severidade: 'bloqueante', alvo: `${chave}.${campo}`, detalhe: `construcao de laudo: "${expressao}"` })
          }
        }
        for (const frase of frases(valor)) {
          const n = palavras(frase)
          totalPalavras += n
          totalFrases += 1
          if (n > FRASE_PALAVRAS_MAX) {
            v.push({ regra: 'voz', tipo: 'frase-longa', severidade: 'bloqueante', alvo: `${chave}.${campo}`, detalhe: `frase de ${n} palavras (maximo ${FRASE_PALAVRAS_MAX})` })
          }
        }
      }
    }
    const media = totalFrases ? totalPalavras / totalFrases : 0
    if (totalFrases && media > MEDIA_PALAVRAS_MAX) {
      v.push({ regra: 'voz', tipo: 'media-alta', severidade: 'bloqueante', alvo: `lote ${numero}`, detalhe: `media de ${media.toFixed(1)} palavras por frase (maximo ${MEDIA_PALAVRAS_MAX})` })
    }
  }
  return v
}

/** AC-9: UI em portugues acentuada. */
const regraAcentuacao: Regra = (ctx) => {
  const v: Violacao[] = []
  for (const [nome, conteudo] of Object.entries(ctx.locales['pt-BR'])) {
    if (nome.startsWith('data-')) continue
    for (const [chave, valor] of achatar(conteudo)) {
      const alvo = `pt-BR/${nome}:${chave}`
      const encontradas = new Set<string>()
      for (const token of valor.split(/[^\p{L}\p{M}-]+/u)) {
        if (!token) continue
        const correta = SEM_ACENTO.get(token.toLowerCase())
        if (correta && tirarAcento(token) === token) encontradas.add(`${token} -> ${correta}`)
      }
      if (encontradas.size) {
        v.push({ regra: 'acentuacao', tipo: 'sem-acento', severidade: 'bloqueante', alvo, detalhe: [...encontradas].join(', ') })
      }
      if (E_VERBO.test(valor)) {
        v.push({ regra: 'acentuacao', tipo: 'e-sem-acento', severidade: 'aviso', alvo, detalhe: `possivel "e" no lugar de "é": "${trecho(valor, E_VERBO)}"` })
      }
    }
  }
  return v
}

/** AC-10: paridade de chaves de UI entre os quatro idiomas. */
const regraParidade: Regra = (ctx) => {
  const v: Violacao[] = []
  const uiPt = Object.entries(ctx.locales['pt-BR']).filter(([n]) => !n.startsWith('data-'))

  for (const [nome, conteudo] of uiPt) {
    const referencia = new Set(achatar(conteudo).map(([k]) => k))
    for (const locale of LOCALES) {
      if (locale === 'pt-BR') continue
      if (ctx.filtroLocale && locale !== ctx.filtroLocale) continue
      const outro = ctx.locales[locale][nome]
      if (!outro) {
        v.push({ regra: 'paridade', tipo: 'namespace-ausente', severidade: 'bloqueante', alvo: `${locale}/${nome}`, detalhe: 'namespace nao existe neste idioma' })
        continue
      }
      const chaves = new Set(achatar(outro).map(([k]) => k))
      for (const k of referencia) {
        if (!chaves.has(k)) {
          v.push({ regra: 'paridade', tipo: 'chave-ausente', severidade: 'bloqueante', alvo: `${locale}/${nome}:${k}`, detalhe: 'cai no fallback pt-BR' })
        }
      }
      for (const k of chaves) {
        if (!referencia.has(k)) {
          v.push({ regra: 'paridade', tipo: 'chave-orfa', severidade: 'bloqueante', alvo: `${locale}/${nome}:${k}`, detalhe: 'chave que o codigo nao pede' })
        }
      }
    }
  }
  return v
}

const REGRAS: Record<string, { descricao: string; ac: string; run: Regra }> = {
  chaves: { descricao: 'uma chave por ficha, no formato <tipo>:<id>', ac: 'AC-2', run: regraChaves },
  formato: { descricao: 'formato canonico dos parametros', ac: 'AC-3', run: regraFormato },
  faixas: { descricao: 'faixas coerentes e dentro da escala', ac: 'AC-4', run: regraFaixas },
  tipografia: { descricao: 'higiene tipografica em todos os idiomas', ac: 'AC-5', run: regraTipografia },
  taxonomia: { descricao: 'familia bate com a taxonomia do GBIF', ac: 'AC-6', run: regraTaxonomia },
  completude: { descricao: 'obrigatoriedade pela matriz e procedencia', ac: 'AC-7', run: regraCompletude },
  voz: { descricao: 'voz de aquarista nos lotes processados', ac: 'AC-8', run: regraVoz },
  acentuacao: { descricao: 'UI em portugues acentuada', ac: 'AC-9', run: regraAcentuacao },
  paridade: { descricao: 'paridade de chaves entre os idiomas', ac: 'AC-10', run: regraParidade },
}

// -- Placar --

function placar(fichas: Ficha[]): { linhas: string[]; completas: number; total: number } {
  const linhas: string[] = []
  let completas = 0
  for (const slug of Object.keys(ARQUIVOS) as Slug[]) {
    const grupo = fichas.filter((f) => f.__slug === slug)
    const exigidos = FICHA_MINIMA.filter((c) => MATRIZ[c]?.[slug] === 'obrig')
    const ok = grupo.filter((f) => exigidos.every((c) => texto((f as unknown as Record<string, unknown>)[c])))
    completas += ok.length
    const lacunas = grupo.reduce((a, f) => a + exigidos.filter((c) => !texto((f as unknown as Record<string, unknown>)[c])).length, 0)
    const pct = grupo.length ? Math.round((ok.length / grupo.length) * 100) : 0
    linhas.push(`  ${slug.padEnd(28)} ${String(ok.length).padStart(4)}/${String(grupo.length).padEnd(4)} completas (${String(pct).padStart(3)}%)  ${String(lacunas).padStart(4)} lacunas`)
  }
  return { linhas, completas, total: fichas.length }
}

// -- Baseline --

async function gravarBaseline(fichas: Ficha[]): Promise<void> {
  const mapa: Record<string, string[]> = {}
  for (const f of fichas) {
    const registro = f as unknown as Record<string, unknown>
    const vazios = Object.keys(MATRIZ).filter((c) => !texto(registro[c]))
    if (vazios.length) mapa[f.__chave] = vazios
  }
  await Bun.write(BASELINE, JSON.stringify(mapa, null, 2) + '\n')
  const celulas = Object.values(mapa).reduce((a, l) => a + l.length, 0)
  console.log(`Baseline gravada: ${Object.keys(mapa).length} fichas com lacuna, ${celulas} celulas vazias.`)
  console.log(`Arquivo: ${BASELINE}`)
}

// -- CLI --

function argumento(nome: string): string | undefined {
  const arg = process.argv.find((a) => a.startsWith(`--${nome}=`))
  return arg?.split('=').slice(1).join('=')
}

function temFlag(nome: string): boolean {
  return process.argv.includes(`--${nome}`)
}

async function main(): Promise<void> {
  const filtroLocale = argumento('locale') as Locale | undefined
  const filtroLote = argumento('lote')
  const ctx = await carregar(filtroLocale, filtroLote)

  if (temFlag('snapshot')) {
    await gravarBaseline(ctx.fichas)
    return
  }

  const pedidas = argumento('rule')?.split(',').map((r) => r.trim()).filter(Boolean) ?? Object.keys(REGRAS)
  const desconhecidas = pedidas.filter((r) => !REGRAS[r])
  if (desconhecidas.length) {
    console.error(`Regra desconhecida: ${desconhecidas.join(', ')}`)
    console.error(`Disponiveis: ${Object.keys(REGRAS).join(', ')}`)
    process.exit(2)
  }

  const todas: Violacao[] = []
  const resumo: { regra: string; ac: string; bloqueantes: number; avisos: number }[] = []

  for (const nome of pedidas) {
    const { run, ac } = REGRAS[nome]
    const encontradas = run(ctx)
    todas.push(...encontradas)
    resumo.push({
      regra: nome,
      ac,
      bloqueantes: encontradas.filter((x) => x.severidade === 'bloqueante').length,
      avisos: encontradas.filter((x) => x.severidade === 'aviso').length,
    })
  }

  const bloqueantes = todas.filter((x) => x.severidade === 'bloqueante')

  if (temFlag('json')) {
    console.log(JSON.stringify({ resumo, violacoes: todas }, null, 2))
    process.exit(bloqueantes.length ? 1 : 0)
  }

  const limite = temFlag('full') ? Infinity : 6

  for (const nome of pedidas) {
    const daRegra = todas.filter((x) => x.regra === nome)
    const { descricao, ac } = REGRAS[nome]
    const b = daRegra.filter((x) => x.severidade === 'bloqueante').length
    const a = daRegra.filter((x) => x.severidade === 'aviso').length
    const marca = b === 0 ? 'ok  ' : 'FALHA'
    console.log(`\n[${marca}] ${nome} (${ac}) - ${descricao}`)
    if (daRegra.length === 0) {
      console.log('       nenhuma ocorrencia')
      continue
    }
    console.log(`       ${b} bloqueantes, ${a} avisos`)
    const porTipo = new Map<string, Violacao[]>()
    for (const x of daRegra) porTipo.set(x.tipo, [...(porTipo.get(x.tipo) ?? []), x])
    for (const [tipo, lista] of [...porTipo.entries()].sort((x, y) => y[1].length - x[1].length)) {
      const sev = lista[0].severidade === 'aviso' ? 'aviso' : 'bloq.'
      console.log(`       ${sev} ${tipo}: ${lista.length}`)
      for (const x of lista.slice(0, limite)) {
        console.log(`             ${x.alvo} - ${x.detalhe}`)
      }
      if (lista.length > limite) console.log(`             ... mais ${lista.length - limite} (use --full)`)
    }
  }

  const p = placar(ctx.fichas)
  console.log('\n--- Placar da ficha minima ---')
  for (const linha of p.linhas) console.log(linha)
  console.log(`  ${'TOTAL'.padEnd(28)} ${String(p.completas).padStart(4)}/${String(p.total).padEnd(4)} completas (${Math.round((p.completas / p.total) * 100)}%)`)

  console.log('\n--- Resultado ---')
  for (const r of resumo) {
    console.log(`  ${r.regra.padEnd(12)} ${r.ac.padEnd(6)} ${String(r.bloqueantes).padStart(5)} bloqueantes  ${String(r.avisos).padStart(4)} avisos`)
  }
  console.log(`\n  ${bloqueantes.length} violacoes bloqueantes no total.`)

  process.exit(bloqueantes.length ? 1 : 0)
}

main().catch((err) => {
  console.error('Erro fatal:', err)
  process.exit(2)
})
