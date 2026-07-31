/**
 * Aplica no acervo um lote de texto narrativo escrito a mao (AC-8).
 *
 * Separado do `apply-fish-params.ts` de proposito: parametro e valor derivado de
 * fonte por regra, e da para regerar; texto e escrita, revisada por pessoa, e o
 * arquivo do lote e o original. Um nunca deve regravar o outro por engano.
 *
 * So preenche campo VAZIO. Reescrever texto que ja existe e a task 12, que roda
 * com o lote piloto ja aprovado e por isso pede `--reescrever` explicito.
 *
 * Uso:
 *   bun run apply-texts --lote=01              simula
 *   bun run apply-texts --lote=01 --gravar     escreve no arquivo de dados
 *   bun run apply-texts --lote=01 --reescrever tambem substitui texto existente
 */

import { existsSync, readFileSync } from 'node:fs'
import { resolve, join } from 'node:path'
import type { Fish } from '../src/types'

const ROOT = resolve(import.meta.dirname, '..')
const ARQUIVO = join(ROOT, 'src/data/fish-agua-doce.ts')

const CAMPOS = ['caracteristica', 'comportamento', 'alimentacao', 'reproducao', 'diformismoSexual', 'outrasInformacoes']

function argumento(nome: string): string | undefined {
  return process.argv.find((a) => a.startsWith(`--${nome}=`))?.split('=').slice(1).join('=')
}

function temFlag(nome: string): boolean {
  return process.argv.includes(`--${nome}`)
}

const texto = (v: unknown) => (typeof v === 'string' ? v.trim() : '')

function serializar(fichas: Fish[]): string {
  return `import type { Fish } from '../types'\n\nconst data: Fish[] = ${JSON.stringify(fichas, null, 2)}\n\nexport default data\n`
}

async function main(): Promise<void> {
  const numero = argumento('lote')
  if (!numero) {
    console.error('Falta --lote=NN')
    process.exit(2)
  }
  const caminho = join(import.meta.dirname, 'textos-pt', `lote-${numero}.json`)
  if (!existsSync(caminho)) {
    console.error(`Lote nao existe: ${caminho}`)
    process.exit(2)
  }

  const lote = JSON.parse(readFileSync(caminho, 'utf8')) as Record<string, Record<string, string>>
  const fonteDoLote = (lote._fonte as unknown as string) ?? ''

  const fichas: Fish[] = (await import(ARQUIVO)).default
  const porId = new Map(fichas.map((f) => [String(f.id), f as unknown as Record<string, unknown>]))

  let escritos = 0
  let pulados = 0
  const ausentes: string[] = []

  for (const [id, campos] of Object.entries(lote)) {
    if (id.startsWith('_')) continue
    const reg = porId.get(id)
    if (!reg) {
      ausentes.push(id)
      continue
    }
    const mudancas: string[] = []
    for (const [campo, valor] of Object.entries(campos)) {
      if (!CAMPOS.includes(campo)) {
        console.error(`Campo fora do conjunto narrativo em ${id}: ${campo}`)
        process.exit(2)
      }
      if (texto(reg[campo]) && !temFlag('reescrever')) {
        pulados += 1
        continue
      }
      reg[campo] = valor
      mudancas.push(campo)
      escritos += 1
    }
    if (mudancas.length && fonteDoLote && !texto(reg.fonte)) {
      reg.fonte = fonteDoLote
    }
    if (mudancas.length) {
      console.log(`  ${id.padStart(3)} ${String(reg.nomePopular).slice(0, 28).padEnd(28)} ${mudancas.join(', ')}`)
    }
  }

  console.log(`\n${escritos} campos escritos, ${pulados} pulados por ja terem texto.`)
  if (ausentes.length) console.log(`Ids do lote que nao existem no acervo: ${ausentes.join(', ')}`)

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
