/**
 * Coleta de parametros de especie em fonte publica, para fechar as lacunas do
 * AC-7 (dxspec/specs/0001-equalizacao-de-textos/).
 *
 * Nao escreve no acervo. Coleta, normaliza e guarda em cache; quem aplica e o
 * `apply-fish-params.ts`. Separado de proposito: coletar depende de rede e e
 * lento, aplicar precisa ser reproduzivel e revisavel no diff.
 *
 * Fontes, nesta ordem de preferencia:
 *   1. Seriously Fish  - parametro de AQUARIO (o que a ficha promete ao leitor)
 *   2. FishBase        - parametro de AMBIENTE, mais cobertura, menos especifico
 *
 * A diferenca importa: FishBase da a faixa em que a especie sobrevive na
 * natureza (Carassius auratus aparece como 0 a 41 graus), nao a faixa em que se
 * mantem no aquario. Por isso Seriously Fish ganha quando as duas respondem.
 *
 * Uso:
 *   bun run harvest-params                        coleta as fichas de agua doce com lacuna
 *   bun run harvest-params --arquivo=agua-salgada outro arquivo do acervo
 *   bun run harvest-params --todas                inclui fichas ja completas
 *   bun run harvest-params --forcar               ignora o cache e busca de novo
 *   bun run harvest-params --limite=5             para depois de N fichas (sonda)
 *   bun run harvest-params --relatorio            so le o cache e imprime a cobertura
 */

import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import { resolve, join } from 'node:path'
import type { Fish } from '../src/types'

const ROOT = resolve(import.meta.dirname, '..')
const CACHE = join(import.meta.dirname, '.params-cache.json')
const PAUSA_MS = 1100
const UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36'

const ARQUIVOS: Record<string, string> = {
  'agua-doce': 'src/data/fish-agua-doce',
  'agua-salgada': 'src/data/fish-agua-salgada',
  'invertebrados-agua-doce': 'src/data/fish-invertebrados-agua-doce',
  'invertebrados-agua-salgada': 'src/data/fish-invertebrados-agua-salgada',
}

/** Uma faixa numerica colhida, com a fonte que a produziu. */
interface Faixa {
  min: number
  max: number
  fonte: 'seriouslyfish' | 'fishbase'
}

interface Colheita {
  nomeCientifico: string
  /** Nome usado na busca: sem `var.`, sem `sp.`, sem autor. */
  buscado: string
  ph?: Faixa
  gh?: Faixa
  temperatura?: Faixa
  /** Em cm. `padrao` distingue comprimento padrao (SL) de total (TL). */
  tamanho?: { cm: number; medida: 'SL' | 'TL'; fonte: Faixa['fonte'] }
  /** Texto cru de distribuicao, em ingles. Vira `origem` na etapa de aplicar. */
  distribuicao?: { texto: string; fonte: Faixa['fonte'] }
  /** `benthopelagic`, `demersal`, `pelagic`... Alimenta `posicaoAquario`. */
  habitat?: string
  urls: string[]
  /** Fontes que responderam 404 ou nao tinham o bloco esperado. */
  faltou: string[]
  coletadoEm: string
}

type Cache = Record<string, Colheita>

// -- Utilitarios --

function carregarCache(): Cache {
  return existsSync(CACHE) ? JSON.parse(readFileSync(CACHE, 'utf8')) : {}
}

function gravarCache(c: Cache): void {
  writeFileSync(CACHE, JSON.stringify(c, null, 2) + '\n')
}

function dormir(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms))
}

function argumento(nome: string): string | undefined {
  return process.argv.find((a) => a.startsWith(`--${nome}=`))?.split('=').slice(1).join('=')
}

function temFlag(nome: string): boolean {
  return process.argv.includes(`--${nome}`)
}

/**
 * Nome binomial pesquisavel.
 *
 * O acervo guarda variedade de aquarismo no proprio campo (`Danio rerio var.
 * gold`, `Corydoras aeneus var. albino`), que nenhuma base taxonomica conhece.
 * Devolve `null` quando nem genero e especie existem: hibrido de aquarismo
 * (`Hybrid (Blood Parrot)`) e genero solto (`Ancistrus sp.`) nao tem pagina.
 */
export function nomeBuscavel(nomeCientifico: string): string | null {
  const limpo = nomeCientifico
    .replace(/\s+var\..*$/i, '')
    .replace(/\s*\(.*?\)\s*/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
  const partes = limpo.split(' ')
  if (partes.length < 2) return null
  const genero = partes[0]
  // O acervo tem epiteto com maiuscula ("Hyphessobrycon Amandae"), que e erro de
  // nomenclatura. Normalizar aqui evita perder a coleta por causa dele.
  const especie = partes[1].toLowerCase()
  if (!/^[A-Z][a-z]+$/.test(genero)) return null
  if (!/^[a-z]+$/.test(especie) || ['sp', 'spp', 'cf'].includes(especie)) return null
  return `${genero} ${especie}`
}

/** HTML para texto corrido, preservando as quebras que separam os rotulos. */
function aTexto(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/(p|div|li|h\d|tr)>/gi, '\n')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&#8211;|&ndash;/g, '-')
    .replace(/&#8217;|&rsquo;/g, "'")
    .replace(/&deg;/g, '°')
    .replace(/&[a-z]+;/gi, ' ')
    .replace(/[ \t]+/g, ' ')
    .replace(/\n\s*\n+/g, '\n')
}

async function buscar(url: string): Promise<string | null> {
  try {
    const r = await fetch(url, { headers: { 'User-Agent': UA, Accept: 'text/html' } })
    if (!r.ok) return null
    return await r.text()
  } catch {
    return null
  }
}

/** Aceita "23-26", "23 - 26", "23 a 26" e valor unico ("24"). */
function faixaDe(bruto: string): { min: number; max: number } | null {
  const par = bruto.match(/(-?\d+(?:\.\d+)?)\s*(?:-|–|—|to|a)\s*(-?\d+(?:\.\d+)?)/i)
  if (par) {
    const min = parseFloat(par[1])
    const max = parseFloat(par[2])
    if (Number.isFinite(min) && Number.isFinite(max) && min <= max) return { min, max }
  }
  const unico = bruto.match(/(-?\d+(?:\.\d+)?)/)
  if (unico) {
    const n = parseFloat(unico[1])
    if (Number.isFinite(n)) return { min: n, max: n }
  }
  return null
}

// -- Seriously Fish --

/**
 * Slug da especie no Seriously Fish.
 *
 * O site publica em `/species/genero-especie/`. Sinonimo antigo continua no ar
 * como redirecionamento, entao vale tentar o nome do acervo mesmo quando a
 * taxonomia ja mudou.
 */
function slugSF(nome: string): string {
  return nome.toLowerCase().replace(/\s+/g, '-')
}

/**
 * Nome que o Seriously Fish usa quando difere do que o acervo guarda.
 *
 * O site publica sob a combinacao aceita hoje; o acervo veio de um dump que
 * ainda usa o sinonimo. Sem isso a pagina responde 404 e a especie parece nao
 * existir, quando na verdade tem ficha completa la.
 */
const SINONIMOS_SF: Record<string, string> = {
  'Puntius sachsii': 'Barbodes semifasciolatus',
  'Metriaclima estherae': 'Maylandia estherae',
  'Celestichthys margaritatus': 'Danio margaritatus',
  'Macrotocinclus affinis': 'Otocinclus affinis',
  'Trichogaster leerii': 'Trichopodus leeri',
}

/**
 * O valor de um rotulo do bloco de agua, so quando ele e um numero.
 *
 * O Seriously Fish as vezes escreve prosa no lugar da faixa, e a prosa fala de
 * outra coisa: em Apistogramma cacatuoides o rotulo pH diz que populacoes
 * selvagens "may require values of 5.0 - 6.0 in order to breed", que e faixa de
 * reproducao de peixe selvagem, nao de manutencao. Ler o numero dali daria uma
 * ficha errada com cara de precisa. Exigir que a linha comece em digito separa
 * um caso do outro e joga o resto para o FishBase.
 */
function valorNumerico(bloco: string, rotulo: string): string | null {
  const linha = bloco.match(new RegExp(`\\b${rotulo}\\s*:?\\s*([^\\n]*)`, 'i'))?.[1]
  if (!linha) return null
  return /^[^\p{L}\n]{0,3}\d/u.test(linha.trim()) ? linha : null
}

function lerSeriouslyFish(texto: string, c: Colheita): boolean {
  // O bloco de agua vem como rotulos em linhas proprias, sob "Water Conditions".
  const agua = texto.match(/Water Conditions([\s\S]{0,700})/i)?.[1] ?? ''
  let achou = false

  const temp = valorNumerico(agua, 'Temperature')
  if (temp) {
    /*
     * Duas gravacoes convivem no site: a nova escreve "23 - 26 °C (74 - 79 °F)"
     * e a antiga inverte, "68-78°F (20-26°C)". Ler o primeiro par daria 68 a 78
     * na ficha antiga, que o corte de plausibilidade descartaria, e a especie
     * ficaria sem temperatura tendo o dado publicado. Quando existe um par
     * seguido de °C, ele manda.
     */
    const emCelsius = temp.match(/(\d+(?:\.\d+)?)\s*(?:-|–|—|to)\s*(\d+(?:\.\d+)?)\s*°?\s*C\b/i)
    const f = emCelsius
      ? { min: parseFloat(emCelsius[1]), max: parseFloat(emCelsius[2]) }
      : faixaDe(temp)
    if (f && f.min <= f.max && f.max <= 40) {
      c.temperatura = { ...f, fonte: 'seriouslyfish' }
      achou = true
    }
  }

  const ph = valorNumerico(agua, 'pH')
  if (ph) {
    const f = faixaDe(ph)
    if (f && f.min >= 3 && f.max <= 10) {
      c.ph = { ...f, fonte: 'seriouslyfish' }
      achou = true
    }
  }

  /*
   * "Hardness: 2-15°H" e o padrao, e muitas fichas usam ppm ("90 - 447 ppm").
   *
   * Aqui a prosa vale, ao contrario do pH: quando o texto explica que a dureza
   * nao e critica, ele diz a faixa aceitavel logo em seguida ("anywhere in the
   * range 2 to 20°H", "Up to 30°H"), que e exatamente o que a ficha quer. Sao
   * dezesseis especies em que so isso separa o campo cheio do campo vazio.
   */
  const linhaDureza = agua.match(/\bHardness\s*:?\s*([^\n]*)/i)?.[1] ?? ''
  const dureza = valorNumerico(agua, 'Hardness')
    ?? (/\brange\s+[\d.]+\s*(?:-|–|to)\s*[\d.]+/i.test(linhaDureza)
      ? linhaDureza.slice(linhaDureza.search(/\brange\s+[\d.]/i))
      : /\bUp to\s+[\d.]+/i.test(linhaDureza)
        ? '0 - ' + linhaDureza.match(/\bUp to\s+([\d.]+)/i)![1] + (/ppm|mg\/l/i.test(linhaDureza) ? ' ppm' : '')
        : null)
  if (dureza) {
    const f = faixaDe(dureza)
    if (f) {
      const emPpm = /ppm|mg\/l/i.test(dureza)
      const min = emPpm ? f.min / 17.9 : f.min
      const max = emPpm ? f.max / 17.9 : f.max
      if (max <= 40) {
        c.gh = { min: Math.round(min), max: Math.round(max), fonte: 'seriouslyfish' }
        achou = true
      }
    }
  }

  /*
   * O tamanho vem em tres formatos e o bloco termina em "Aquarium Size":
   *   "300 - 350 mm."                       faixa
   *   "Male: 7.5 cm  Female: 5 cm"          por sexo
   *   "2\" (5cm)."                          polegada mais centimetro
   * Vale o maior valor, que e o tamanho adulto que o aquario precisa comportar.
   * Cortar em "Aquarium Size" e o que impede a medida do movel de entrar como
   * tamanho do peixe: a frase seguinte fala em "base measurements of 150 cm".
   */
  const tam = texto.match(/Maximum Standard Length([\s\S]{0,300}?)(?:Aquarium Size|$)/i)?.[1]
  if (tam) {
    const valores = [
      ...[...tam.matchAll(/(\d+(?:\.\d+)?)\s*cm/gi)].map((m) => parseFloat(m[1])),
      ...[...tam.matchAll(/(\d+(?:\.\d+)?)\s*mm/gi)].map((m) => parseFloat(m[1]) / 10),
    ].filter((n) => n > 0 && n < 500)
    if (valores.length) {
      c.tamanho = { cm: Math.max(...valores), medida: 'SL', fonte: 'seriouslyfish' }
      achou = true
    }
  }

  const dist = texto.match(/\nDistribution\s*\n([\s\S]{0,400}?)\n(?:Habitat|Maximum Standard)/i)?.[1]
  if (dist && dist.trim().length > 8) {
    c.distribuicao = { texto: dist.replace(/\s+/g, ' ').trim().slice(0, 320), fonte: 'seriouslyfish' }
    achou = true
  }

  return achou
}

// -- FishBase --

function lerFishBase(texto: string, c: Colheita): boolean {
  let achou = false

  // Linha unica: "Freshwater; benthopelagic; pH range: 6.0 - 8.0; dH range: 5 - 19; ..."
  const eco = texto.match(/Environment:[\s\S]{0,600}/i)?.[0] ?? texto
  const numa = eco.replace(/\s+/g, ' ')

  if (!c.ph) {
    const ph = numa.match(/pH range:\s*([\d.]+\s*-\s*[\d.]+)/i)?.[1]
    const f = ph ? faixaDe(ph) : null
    if (f && f.min >= 3 && f.max <= 10) {
      c.ph = { ...f, fonte: 'fishbase' }
      achou = true
    }
  }

  if (!c.gh) {
    const dh = numa.match(/dH range:\s*([\d.]+\s*-\s*[\d.]+)/i)?.[1]
    const f = dh ? faixaDe(dh) : null
    if (f && f.max <= 40) {
      c.gh = { ...f, fonte: 'fishbase' }
      achou = true
    }
  }

  if (!c.temperatura) {
    // Faixa de clima, nao de aquario. Entra so como ultimo recurso e ainda
    // passa pelo corte de plausibilidade na etapa de aplicar.
    const t = numa.match(/(\d+(?:\.\d+)?)\s*°C\s*-\s*(\d+(?:\.\d+)?)\s*°C/i)
    if (t) {
      const min = parseFloat(t[1])
      const max = parseFloat(t[2])
      if (max <= 40 && min >= 0) {
        c.temperatura = { min, max, fonte: 'fishbase' }
        achou = true
      }
    }
  }

  const hab = numa.match(/\b(benthopelagic|bathydemersal|demersal|pelagic-neritic|pelagic|reef-associated)\b/i)?.[1]
  if (hab && !c.habitat) {
    c.habitat = hab.toLowerCase()
    achou = true
  }

  if (!c.tamanho) {
    const max = numa.match(/Max length\s*:\s*([\d.]+)\s*cm\s*(TL|SL|FL|WD)?/i)
    if (max) {
      const cm = parseFloat(max[1])
      if (cm > 0 && cm < 500) {
        c.tamanho = { cm, medida: max[2]?.toUpperCase() === 'SL' ? 'SL' : 'TL', fonte: 'fishbase' }
        achou = true
      }
    }
  }

  if (!c.distribuicao) {
    const dist = numa.match(/Faunafri\s*(.{20,400}?)\s*Size \/ Weight \/ Age/i)?.[1]
    if (dist) {
      c.distribuicao = { texto: dist.replace(/\(Ref\.\s*\d+\s*\)/g, '').replace(/\s+/g, ' ').trim().slice(0, 320), fonte: 'fishbase' }
      achou = true
    }
  }

  return achou
}

// -- Coleta de uma ficha --

async function colher(nomeCientifico: string): Promise<Colheita> {
  const buscado = nomeBuscavel(nomeCientifico)
  const c: Colheita = {
    nomeCientifico,
    buscado: buscado ?? '',
    urls: [],
    faltou: [],
    coletadoEm: new Date().toISOString(),
  }
  if (!buscado) {
    c.faltou.push('sem-binomial')
    return c
  }

  const urlSF = `https://www.seriouslyfish.com/species/${slugSF(SINONIMOS_SF[buscado] ?? buscado)}/`
  const htmlSF = await buscar(urlSF)
  if (htmlSF && /Water Conditions|Maximum Standard Length/i.test(htmlSF)) {
    if (lerSeriouslyFish(aTexto(htmlSF), c)) c.urls.push(urlSF)
    else c.faltou.push('seriouslyfish-sem-bloco')
  } else {
    c.faltou.push('seriouslyfish-404')
  }

  await dormir(PAUSA_MS)

  const urlFB = `https://www.fishbase.se/summary/${buscado.replace(' ', '-')}.html`
  const htmlFB = await buscar(urlFB)
  if (htmlFB && /Environment:/i.test(htmlFB)) {
    if (lerFishBase(aTexto(htmlFB), c)) c.urls.push(urlFB)
    else c.faltou.push('fishbase-sem-bloco')
  } else {
    c.faltou.push('fishbase-404')
  }

  return c
}

// -- Relatorio --

const CAMPOS_COLHIDOS = ['ph', 'gh', 'temperatura', 'tamanho', 'distribuicao', 'habitat'] as const

function relatorio(fichas: Fish[], cache: Cache): void {
  const colhidas = fichas.map((f) => cache[f.nomeCientifico]).filter(Boolean)
  console.log(`\n--- Cobertura da coleta (${colhidas.length}/${fichas.length} fichas no cache) ---`)
  for (const campo of CAMPOS_COLHIDOS) {
    const n = colhidas.filter((c) => c[campo] !== undefined).length
    const sf = colhidas.filter((c) => (c[campo] as { fonte?: string } | undefined)?.fonte === 'seriouslyfish').length
    console.log(`  ${campo.padEnd(14)} ${String(n).padStart(4)}  (seriouslyfish: ${sf})`)
  }
  const semNada = colhidas.filter((c) => CAMPOS_COLHIDOS.every((k) => c[k] === undefined))
  console.log(`\n  ${semNada.length} fichas sem nenhum dado colhido:`)
  for (const c of semNada.slice(0, 30)) {
    console.log(`      ${c.nomeCientifico.padEnd(40)} ${c.faltou.join(', ')}`)
  }
  if (semNada.length > 30) console.log(`      ... mais ${semNada.length - 30}`)
}

// -- Main --

/** Campos parametricos que a coleta consegue preencher. */
const ALVOS = ['ph', 'gh', 'temperatura', 'tamanhoAdulto', 'origem', 'posicaoAquario']

async function main(): Promise<void> {
  const arquivo = argumento('arquivo') ?? 'agua-doce'
  if (!ARQUIVOS[arquivo]) {
    console.error(`Arquivo desconhecido: ${arquivo}`)
    console.error(`Disponiveis: ${Object.keys(ARQUIVOS).join(', ')}`)
    process.exit(2)
  }

  const fichas: Fish[] = (await import(join(ROOT, ARQUIVOS[arquivo]))).default
  const cache = carregarCache()

  if (temFlag('relatorio')) {
    relatorio(fichas, cache)
    return
  }

  const texto = (v: unknown) => (typeof v === 'string' ? v.trim() : '')
  let fila = temFlag('todas')
    ? fichas
    : fichas.filter((f) => ALVOS.some((c) => !texto((f as unknown as Record<string, unknown>)[c])))

  if (!temFlag('forcar')) {
    fila = fila.filter((f) => !cache[f.nomeCientifico])
  }

  const limite = parseInt(argumento('limite') ?? '0', 10)
  if (limite > 0) fila = fila.slice(0, limite)

  console.log(`Arquivo ${arquivo}: ${fichas.length} fichas, ${fila.length} na fila de coleta.`)
  if (fila.length === 0) {
    relatorio(fichas, cache)
    return
  }

  let i = 0
  for (const f of fila) {
    i += 1
    const c = await colher(f.nomeCientifico)
    cache[f.nomeCientifico] = c
    const achados = CAMPOS_COLHIDOS.filter((k) => c[k] !== undefined)
    const marca = achados.length ? achados.join(',') : `NADA (${c.faltou.join(', ')})`
    console.log(`  [${String(i).padStart(3)}/${fila.length}] ${f.nomeCientifico.padEnd(40)} ${marca}`)
    if (i % 10 === 0) gravarCache(cache)
    await dormir(PAUSA_MS)
  }

  gravarCache(cache)
  relatorio(fichas, cache)
}

main().catch((err) => {
  console.error('Erro fatal:', err)
  process.exit(1)
})
