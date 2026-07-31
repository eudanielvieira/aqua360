/**
 * Aplica no acervo o que o `harvest-fish-params.ts` colheu, no formato canonico
 * do ADR 0001. Fecha as lacunas parametricas do AC-7.
 *
 * So preenche campo VAZIO: nunca sobrescreve valor que ja existe. O acervo tem
 * dado escrito a mao que vale mais que a coleta automatica, e a frente e sobre
 * padronizar o que falta, nao sobre trocar o que ja esta la.
 *
 * Uso:
 *   bun run apply-params                   simula e imprime a tabela de mudancas
 *   bun run apply-params --gravar          escreve no arquivo de dados
 *   bun run apply-params --campo=ph,gh     restringe a alguns campos
 *
 * Padrao e simular. Escrever exige `--gravar`.
 */

import { existsSync, readFileSync } from 'node:fs'
import { resolve, join } from 'node:path'
import type { Fish } from '../src/types'

const ROOT = resolve(import.meta.dirname, '..')
const CACHE = join(import.meta.dirname, '.params-cache.json')
const ORIGENS = join(import.meta.dirname, 'origens-pt.json')
const ARQUIVO = join(ROOT, 'src/data/fish-agua-doce.ts')

interface Faixa { min: number; max: number; fonte: 'seriouslyfish' | 'fishbase' }
interface Colheita {
  nomeCientifico: string
  ph?: Faixa
  gh?: Faixa
  temperatura?: Faixa
  tamanho?: { cm: number; medida: 'SL' | 'TL'; fonte: Faixa['fonte'] }
  distribuicao?: { texto: string; fonte: Faixa['fonte'] }
  habitat?: string
  urls: string[]
}

const NOME_FONTE: Record<string, string> = {
  seriouslyfish: 'Seriously Fish',
  fishbase: 'FishBase',
}

// -- Formatacao canonica (ADR 0001) --

/** Corta zero a direita: 6.0 vira 6, 7.50 vira 7.5. */
function num(n: number): string {
  return String(Math.round(n * 10) / 10)
}

function faixa(f: { min: number; max: number }, sufixo = ''): string {
  return (f.min === f.max ? num(f.min) : `${num(f.min)}-${num(f.max)}`) + sufixo
}

// -- Plausibilidade de aquario --

/**
 * A faixa de temperatura serve para manter o peixe, nao para ele sobreviver.
 *
 * O FishBase publica a faixa climatica do habitat, que e outra coisa: o Kinguio
 * aparece la como 0 a 41 graus, verdade sobre o lago e conselho pessimo sobre o
 * aquario. Faixa larga demais ou fria demais e sinal de que veio dali, entao
 * fica de fora e a ficha espera pesquisa a mao.
 */
function temperaturaPlausivel(f: Faixa): boolean {
  if (f.fonte === 'seriouslyfish') return f.min >= 4 && f.max <= 35
  return f.min >= 15 && f.max <= 32 && f.max - f.min <= 12
}

/** Le uma faixa ja gravada na ficha, no formato canonico ("4-12" ou "8"). */
function faixaDoTexto(valor: string | undefined): Faixa | null {
  const bruto = typeof valor === 'string' ? valor.trim() : ''
  if (!bruto) return null
  const m = bruto.match(/^(\d+(?:\.\d+)?)(?:-(\d+(?:\.\d+)?))?$/)
  if (!m) return null
  const min = parseFloat(m[1])
  const max = m[2] ? parseFloat(m[2]) : min
  return { min, max, fonte: 'fishbase' }
}

/**
 * KH derivado da dureza, e nao de medida por especie.
 *
 * Nenhuma das duas bases publica KH: o Seriously Fish da dureza geral e o
 * FishBase da dH. Em agua natural o carbonato acompanha a dureza geral do
 * biotopo, entao a banda larga abaixo e conselho correto, so nao e medida da
 * especie. A `fonte` da ficha cita a referencia de onde veio a dureza que
 * originou o valor, e a derivacao em si fica no relatorio. A alternativa,
 * registrada no handoff, e tornar `kh` opcional em agua doce pelo mesmo
 * argumento que ja tirou o campo do marinho.
 */
function khDeGh(gh: Faixa): { valor: string; nota: string } {
  if (gh.max <= 8) return { valor: '1-5', nota: 'agua mole' }
  if (gh.min >= 10) return { valor: '10-18', nota: 'agua dura' }
  return { valor: '3-10', nota: 'faixa de comunidade' }
}

// -- Posicao no aquario --

/**
 * Familia mais habitat do FishBase, na convencao que o proprio acervo ja usa.
 *
 * A tabela sai da contagem das 181 fichas que ja tinham o campo: Callichthyidae
 * e Fundo nas sete, Cichlidae e "Todo o aquario" em sessenta das noventa,
 * Osphronemidae e "Todo o aquario" nas sete. Onde o acervo nunca opinou, vale a
 * biologia do grupo.
 */
const POSICAO_POR_FAMILIA: Record<string, string> = {
  Callichthyidae: 'Fundo',
  Loricariidae: 'Fundo',
  Cobitidae: 'Fundo',
  Balitoridae: 'Fundo',
  Clariidae: 'Fundo',
  Pimelodidae: 'Fundo',
  Mormyridae: 'Fundo',
  Apteronotidae: 'Fundo',
  Eleotridae: 'Fundo',
  Gobiidae: 'Fundo',
  Gyrinocheilidae: 'Vidros e superfícies',
  Cichlidae: 'Todo o aquário',
  Osphronemidae: 'Todo o aquário',
  Poeciliidae: 'Todo o aquário',
  Cyprinidae: 'Meio',
  Characidae: 'Meio',
  Lebiasinidae: 'Meio',
  Pseudomugilidae: 'Meio',
  Sternopygidae: 'Meio',
  Siluridae: 'Meio',
  Notopteridae: 'Meio',
  Pantodontidae: 'Topo',
}

/** Especies em que a familia erraria. Cada uma com o porque. */
const POSICAO_POR_ESPECIE: Record<string, string> = {
  'Carassius auratus': 'Todo o aquário', // ciprinideo grande, nada em toda a coluna
  'Crossocheilus oblongus': 'Fundo', // raspa alga no substrato e na folha
  'Pantodon buchholzi': 'Topo', // cacador de superficie, salta fora da agua
  'Chitala ornata': 'Fundo', // faca grande, vive rente ao fundo
  'Kryptopterus vitreolus': 'Meio', // cardume parado no meio da coluna
  'Sewellia lineolata': 'Fundo', // preso a rocha em correnteza
  'Misgurnus anguillicaudatus': 'Fundo',
  'Pangio kuhlii': 'Fundo',
}

const HABITAT_PARA_POSICAO: Record<string, string> = {
  demersal: 'Fundo',
  bathydemersal: 'Fundo',
  benthopelagic: 'Todo o aquário',
  pelagic: 'Meio',
  'pelagic-neritic': 'Meio',
}

function posicaoDe(f: Fish, c: Colheita | undefined): { valor: string; nota: string } | null {
  const porEspecie = POSICAO_POR_ESPECIE[f.nomeCientifico]
  if (porEspecie) return { valor: porEspecie, nota: 'especie' }
  const porFamilia = POSICAO_POR_FAMILIA[f.familia]
  if (porFamilia) return { valor: porFamilia, nota: `familia ${f.familia}` }
  const porHabitat = c?.habitat ? HABITAT_PARA_POSICAO[c.habitat] : undefined
  if (porHabitat) return { valor: porHabitat, nota: `habitat ${c!.habitat}` }
  return null
}

/** Todas as fichas do arquivo, para as regras que olham de uma para a outra. */
let acervo: Fish[] = []

type CampoHerdavel = 'ph' | 'gh' | 'temperatura' | 'tamanhoAdulto'

/** Primeira ficha do mesmo genero que tenha o campo preenchido. */
function congenereCom(f: Fish, campo: CampoHerdavel): Fish | null {
  const genero = f.nomeCientifico.trim().split(' ')[0]
  if (!genero) return null
  return acervo.find(
    (o) => o.id !== f.id && o.nomeCientifico.startsWith(`${genero} `) && texto(o[campo]),
  ) ?? null
}

/** Herda do congenere e ja monta a proposta, com o irmao citado na fonte. */
function herdar(f: Fish, campo: CampoHerdavel): Proposta | null {
  const irmao = congenereCom(f, campo)
  if (!irmao) return null
  return { valor: irmao[campo], fonte: '', nota: `congênere ${irmao.nomeCientifico}` }
}

/**
 * Dureza deduzida do perfil de pH, quando nenhuma das bases publica a medida.
 *
 * Sao dez especies, quase todas de biotopo bem marcado: ciclideo de lago
 * africano vive em agua dura e alcalina, Pangio de igarape de agua preta vive em
 * agua mole e acida. O pH ja registrado na ficha diz de qual dos dois se trata,
 * e a banda sai larga de proposito. Se um dia a medida por especie aparecer numa
 * das bases, ela substitui.
 */
function ghDePh(ph: Faixa): { valor: string; nota: string } | null {
  if (ph.min >= 7.2 && ph.max >= 8) return { valor: '10-20', nota: 'perfil alcalino' }
  if (ph.max <= 7) return { valor: '2-10', nota: 'perfil ácido' }
  if (ph.min >= 6) return { valor: '4-15', nota: 'perfil neutro' }
  return null
}

// -- Regras de preenchimento --

interface Proposta {
  valor: string
  /**
   * Nome da fonte citavel, ou vazio quando o valor foi derivado.
   *
   * A `fonte` da ficha aparece na pagina, com o rotulo "Fonte". Ela e uma lista
   * de referencias e nada mais: nota de derivacao ali dentro vira frase torta na
   * cara do leitor ("Seriously Fish e derivado da dureza (Seriously Fish)").
   * Quando a derivacao parte de um valor publicado, quem entra aqui e a fonte
   * desse valor, que e a referencia real por tras do numero.
   */
  fonte: string
  /** Como o valor foi obtido. So aparece no relatorio, nunca na ficha. */
  nota: string
}

/** Ordem de citacao, para a lista sair sempre igual. */
const ORDEM_FONTES = ['Seriously Fish', 'FishBase', 'GBIF', 'Wikipedia']

/** Texto da `fonte` quando tudo na ficha saiu de derivacao, sem referencia externa. */
export const SEM_FONTE_EXTERNA = 'Derivado dos parâmetros da própria ficha'

/** Lista de referencias em portugues: "A, B e C". */
export function citar(fontes: Iterable<string>): string {
  const nomes = [...new Set(fontes)].filter(Boolean)
    .sort((a, b) => {
      const ia = ORDEM_FONTES.indexOf(a)
      const ib = ORDEM_FONTES.indexOf(b)
      return (ia < 0 ? 99 : ia) - (ib < 0 ? 99 : ib) || a.localeCompare(b)
    })
  if (nomes.length === 0) return ''
  if (nomes.length === 1) return nomes[0]
  return `${nomes.slice(0, -1).join(', ')} e ${nomes[nomes.length - 1]}`
}

type Regra = (f: Fish, c: Colheita | undefined) => Proposta | null

const REGRAS: Record<string, Regra> = {
  ph: (f, c) => (c?.ph ? { valor: faixa(c.ph), fonte: NOME_FONTE[c.ph.fonte], nota: '' } : herdar(f, 'ph')),

  /*
   * Sem dureza publicada, vale a de um congenere do proprio acervo.
   *
   * Cinco fichas sao entrada de comercio no nivel do genero ("Corydoras spp.",
   * "Otocinclus spp.") e nenhuma base tem pagina para elas. A agua que um
   * Corydoras spp. quer e a mesma que o acervo ja registra para o Corydoras
   * aeneus, entao herdar do congenere e mais correto do que deixar em branco e
   * mais honesto do que inventar faixa.
   */
  gh: (f, c) => {
    if (c?.gh) return { valor: faixa(c.gh), fonte: NOME_FONTE[c.gh.fonte], nota: '' }
    const doIrmao = herdar(f, 'gh')
    if (doIrmao) return doIrmao
    const ph = c?.ph ?? faixaDoTexto(f.ph)
    const deduzida = ph ? ghDePh(ph) : null
    return deduzida ? { valor: deduzida.valor, fonte: '', nota: `deduzido do pH, ${deduzida.nota}` } : null
  },

  /*
   * A dureza da colheita vem primeiro, mas a que ja esta na ficha tambem serve:
   * dezesseis fichas tinham `gh` escrito a mao e so faltava `kh`, e como elas
   * nao tinham lacuna nos campos que a coleta busca, nunca entraram na fila.
   */
  kh: (f, c) => {
    const gh = c?.gh ?? faixaDoTexto(f.gh)
    if (!gh) return null
    const { valor, nota } = khDeGh(gh)
    return { valor, fonte: c?.gh ? NOME_FONTE[c.gh.fonte] : '', nota: `derivado da dureza, ${nota}` }
  },

  temperatura: (f, c) => {
    if (!c?.temperatura || !temperaturaPlausivel(c.temperatura)) return herdar(f, 'temperatura')
    return { valor: faixa(c.temperatura, ' °C'), fonte: NOME_FONTE[c.temperatura.fonte], nota: '' }
  },

  tamanhoAdulto: (f, c) => {
    if (!c?.tamanho) return herdar(f, 'tamanhoAdulto')
    return {
      valor: `${num(c.tamanho.cm)} cm`,
      fonte: NOME_FONTE[c.tamanho.fonte],
      nota: c.tamanho.medida === 'SL' ? 'comprimento padrao' : 'comprimento total',
    }
  },

  posicaoAquario: (f, c) => {
    const p = posicaoDe(f, c)
    return p ? { valor: p.valor, fonte: '', nota: `derivado da ${p.nota}` } : null
  },

  /*
   * Variedade de aquarismo herda a origem da especie. "Danio rerio var. gold" e
   * um Danio rerio selecionado em cativeiro: a distribuicao natural e a mesma, e
   * repetir a entrada so para a variedade seria dado duplicado que sai do lugar
   * quando um dos dois for corrigido.
   */
  origem: (f) => {
    const base = f.nomeCientifico.replace(/\s+var\..*$/i, '').trim()
    const curada = origensPt[f.nomeCientifico] ?? origensPt[base]
    return curada ? { valor: curada.texto, fonte: curada.fonte, nota: '' } : null
  },
}

/** Origem escrita a mao em portugues, a partir da distribuicao colhida. */
let origensPt: Record<string, { texto: string; fonte: string }> = {}

// -- Serializacao --

/**
 * Regrava o arquivo de dados preservando a ordem das chaves.
 *
 * Objeto em JS mantem a ordem de insercao das chaves de texto, entao importar,
 * mexer no valor e reserializar da diff so onde o valor mudou.
 */
function serializar(fichas: Fish[]): string {
  return `import type { Fish } from '../types'\n\nconst data: Fish[] = ${JSON.stringify(fichas, null, 2)}\n\nexport default data\n`
}

// -- CLI --

function temFlag(nome: string): boolean {
  return process.argv.includes(`--${nome}`)
}

function argumento(nome: string): string | undefined {
  return process.argv.find((a) => a.startsWith(`--${nome}=`))?.split('=').slice(1).join('=')
}

const texto = (v: unknown) => (typeof v === 'string' ? v.trim() : '')

async function main(): Promise<void> {
  if (!existsSync(CACHE)) {
    console.error('Cache de coleta nao existe. Rode: bun run harvest-params')
    process.exit(2)
  }
  const cache: Record<string, Colheita> = JSON.parse(readFileSync(CACHE, 'utf8'))
  origensPt = existsSync(ORIGENS) ? JSON.parse(readFileSync(ORIGENS, 'utf8')) : {}

  const campos = argumento('campo')?.split(',').map((s) => s.trim()) ?? Object.keys(REGRAS)
  const desconhecidos = campos.filter((c) => !REGRAS[c])
  if (desconhecidos.length) {
    console.error(`Campo desconhecido: ${desconhecidos.join(', ')}`)
    console.error(`Disponiveis: ${Object.keys(REGRAS).join(', ')}`)
    process.exit(2)
  }

  const fichas: Fish[] = (await import(ARQUIVO)).default
  const registros = fichas as unknown as Record<string, unknown>[]
  acervo = fichas

  let preenchidos = 0
  const porCampo = new Map<string, number>()
  const semProposta = new Map<string, string[]>()
  const linhas: string[] = []

  for (let i = 0; i < fichas.length; i += 1) {
    const f = fichas[i]
    const reg = registros[i]
    const c = cache[f.nomeCientifico]
    const mudancas: string[] = []
    const fontes = new Set<string>()

    for (const campo of campos) {
      if (texto(reg[campo])) continue
      const p = REGRAS[campo](f, c)
      if (!p) {
        semProposta.set(campo, [...(semProposta.get(campo) ?? []), f.nomePopular])
        continue
      }
      reg[campo] = p.valor
      mudancas.push(`${campo}=${p.valor}${p.nota ? ` (${p.nota})` : ''}`)
      fontes.add(p.fonte)
      preenchidos += 1
      porCampo.set(campo, (porCampo.get(campo) ?? 0) + 1)
    }

    if (mudancas.length) {
      // O validador exige `fonte` em ficha que recebeu campo antes vazio.
      if (!texto(reg.fonte)) {
        reg.fonte = citar(fontes) || SEM_FONTE_EXTERNA
      }
      linhas.push(`  ${String(f.id).padStart(3)} ${f.nomePopular.slice(0, 26).padEnd(26)} ${mudancas.join('  ')}`)
    }
  }

  console.log(`--- Preenchimento proposto (${preenchidos} celulas em ${linhas.length} fichas) ---`)
  for (const l of linhas) console.log(l)

  console.log('\n--- Por campo ---')
  for (const campo of campos) {
    const feitos = porCampo.get(campo) ?? 0
    const faltando = semProposta.get(campo)?.length ?? 0
    console.log(`  ${campo.padEnd(16)} ${String(feitos).padStart(4)} preenchidos  ${String(faltando).padStart(4)} sem proposta`)
  }

  console.log('\n--- Ficaram sem proposta ---')
  for (const [campo, nomes] of semProposta) {
    console.log(`  ${campo}: ${nomes.slice(0, 12).join(', ')}${nomes.length > 12 ? ` ... mais ${nomes.length - 12}` : ''}`)
  }

  if (!temFlag('gravar')) {
    console.log('\nSimulacao. Nada foi escrito. Use --gravar para aplicar.')
    return
  }

  await Bun.write(ARQUIVO, serializar(fichas))
  console.log(`\nGravado em ${ARQUIVO}`)
}

main().catch((err) => {
  console.error('Erro fatal:', err)
  process.exit(1)
})
