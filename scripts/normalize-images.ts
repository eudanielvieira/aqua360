/**
 * Normaliza as imagens de source-images/ para o padrao da web:
 * - 760x760, encaixando a ilustracao inteira e preenchendo as sobras
 *   com a propria cor de fundo da imagem (nada de peixe cortado)
 * - marca d'agua Aqua360 em padrao diagonal repetido sobre toda a imagem
 * - saida em JPEG de alta qualidade em public/images
 *
 * Uso:
 *   bun run scripts/normalize-images.ts            processa tudo
 *   bun run scripts/normalize-images.ts --dry      so lista o que faria
 *   bun run scripts/normalize-images.ts <nome>     processa so um arquivo
 */

import sharp from 'sharp'
import { readdir, mkdir, readFile, writeFile } from 'node:fs/promises'
import { existsSync, statSync } from 'node:fs'
import { join, basename, extname, resolve } from 'node:path'

const ROOT = resolve(import.meta.dirname, '..')
// Fica fora de public/ de proposito: qualquer coisa dentro de public/ e
// copiada inteira para dist/ pelo Vite, e os originais nao vao para a web.
const SRC_DIR = join(ROOT, 'source-images')
const DEFAULT_OUT_DIR = join(ROOT, 'public/images')
const MANIFEST = join(ROOT, 'src/data/normalized-images.ts')

const SIZE = 760
const JPEG_QUALITY = 92

/** Slugs que nao seguem a regra padrao (o dado ja aponta para outro nome). */
const SLUG_OVERRIDES: Record<string, string> = {
  symphysodonaequifasciatus: 'symphysodonauequifasciatus',
}

/** Converte o nome do arquivo de origem no slug usado pelo app. */
function toSlug(fileName: string): string {
  const base = basename(fileName, extname(fileName))
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .replace(/[^a-z0-9]/g, '')
  return SLUG_OVERRIDES[base] ?? base
}

/**
 * Descobre a cor de fundo amostrando os quatro cantos da imagem.
 *
 * Os cantos sao usados em vez das bordas inteiras porque em varias
 * ilustracoes o animal encosta nas laterais (o Paracheirodon ocupa quase
 * toda a largura), o que puxaria a media da borda para o tom do peixe e
 * deixaria a barra de preenchimento visivel.
 *
 * Entre os quatro cantos, ficam os dois de menor desvio padrao: canto de
 * fundo puro e liso, canto invadido pelo animal tem variacao alta. A cor
 * sai da media exata desses dois, nao da cor dominante, porque o
 * dominante do sharp quantiza em passos de 16 por canal e esse
 * arredondamento ja e suficiente para a emenda aparecer.
 */
async function detectBackground(input: Buffer) {
  const { width = 0, height = 0 } = await sharp(input).metadata()
  const patch = Math.max(8, Math.round(Math.min(width, height) * 0.06))

  const corners = [
    { left: 0, top: 0 },
    { left: width - patch, top: 0 },
    { left: 0, top: height - patch },
    { left: width - patch, top: height - patch },
  ]

  // Os pixels sao lidos crus porque stats() do sharp roda sobre a imagem
  // de entrada e ignora o extract() do pipeline: pedir stats depois de
  // recortar devolveria a estatistica da imagem inteira.
  const samples = await Promise.all(
    corners.map(async c => {
      const { data, info } = await sharp(input)
        .extract({ ...c, width: patch, height: patch })
        .removeAlpha()
        .raw()
        .toBuffer({ resolveWithObject: true })

      const pixels = info.width * info.height
      const mean = [0, 1, 2].map(ch => {
        let sum = 0
        for (let i = ch; i < data.length; i += 3) sum += data[i]
        return sum / pixels
      })
      const flatness = Math.max(
        ...[0, 1, 2].map(ch => {
          let sum = 0
          for (let i = ch; i < data.length; i += 3) sum += (data[i] - mean[ch]) ** 2
          return Math.sqrt(sum / pixels)
        })
      )

      return { mean, flatness }
    })
  )

  const flattest = samples.sort((a, b) => a.flatness - b.flatness).slice(0, 2)
  const avg = (i: number) =>
    Math.round(flattest.reduce((sum, s) => sum + s.mean[i], 0) / flattest.length)

  return { r: avg(0), g: avg(1), b: avg(2) }
}

/**
 * Ladrilho da marca d'agua: logo Aqua360 (ondas em quadrado arredondado)
 * mais o nome, girado 30 graus e repetido para cobrir a imagem toda.
 */
function watermarkTile(): string {
  // O ladrilho precisa ser mais largo que a marca (~140px), senao o
  // pattern corta o texto no limite do tile.
  const tile = 300
  const opacity = 0.11

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${SIZE}" height="${SIZE}" viewBox="0 0 ${SIZE} ${SIZE}">
  <defs>
    <g id="mark">
      <rect width="34" height="34" rx="8.5" fill="#0B3954"/>
      <g stroke="#FFFFFF" stroke-width="2.2" stroke-linecap="round" fill="none">
        <path d="M7 12.75c2.1-2.1 4.3-2.1 6.4 0s4.3 2.1 6.4 0 4.3-2.1 6.4 0"/>
        <path d="M7 18.4c2.1-2.1 4.3-2.1 6.4 0s4.3 2.1 6.4 0 4.3-2.1 6.4 0" opacity="0.7"/>
        <path d="M7 24.1c2.1-2.1 4.3-2.1 6.4 0s4.3 2.1 6.4 0 4.3-2.1 6.4 0" opacity="0.45"/>
      </g>
      <text x="42" y="24.5" font-family="Helvetica, Arial, sans-serif" font-size="23" font-weight="700" fill="#0B3954" letter-spacing="0.5">Aqua360</text>
    </g>
    <pattern id="wm" width="${tile}" height="${tile}" patternUnits="userSpaceOnUse" patternTransform="rotate(-30)">
      <use href="#mark" x="0" y="40"/>
      <use href="#mark" x="${tile / 2}" y="${tile / 2 + 40}"/>
    </pattern>
  </defs>
  <rect width="${SIZE}" height="${SIZE}" fill="url(#wm)" opacity="${opacity}"/>
</svg>`
}

async function normalize(fileName: string, outDir: string) {
  const slug = toSlug(fileName)
  const input = await sharp(join(SRC_DIR, fileName)).toBuffer()
  const bg = await detectBackground(input)

  const fitted = await sharp(input)
    .resize(SIZE, SIZE, {
      fit: 'contain',
      background: bg,
      kernel: 'lanczos3',
      withoutEnlargement: false,
    })
    .flatten({ background: bg })
    .toBuffer()

  const output = join(outDir, `${slug}.jpg`)
  await sharp(fitted)
    .composite([{ input: Buffer.from(watermarkTile()), top: 0, left: 0 }])
    .jpeg({ quality: JPEG_QUALITY, chromaSubsampling: '4:4:4', mozjpeg: true })
    .toFile(output)

  return { slug, output, bg }
}

/**
 * Regrava src/data/normalized-images.ts com os slugs ja tratados.
 *
 * O app usa essa lista para colocar a imagem local na frente das fotos
 * do Wikipedia e do iNaturalist. Sem ela, a arte normalizada nunca
 * apareceria, porque as fotos remotas vem primeiro para as centenas de
 * especies que ainda usam os arquivos antigos de 180x135.
 *
 * A lista e a uniao com o que ja estava la, para que rodar o script em
 * um subconjunto de imagens nao derrube as normalizadas anteriores.
 */
async function updateManifest(slugs: string[]) {
  const anteriores = existsSync(MANIFEST)
    ? [...(await readFile(MANIFEST, 'utf8')).matchAll(/^\s*'([^']+)',$/gm)].map(m => m[1])
    : []

  const todos = [...new Set([...anteriores, ...slugs])].sort()

  const conteudo = `// Gerado por scripts/normalize-images.ts. Nao editar a mao.
//
// Imagens ja normalizadas em 760x760 com a marca dagua do Aqua360.
// Sao a arte oficial do projeto, entao tem prioridade sobre as fotos
// remotas em src/utils/image.ts. Os demais arquivos de public/images
// continuam sendo os antigos de 180x135 e seguem como ultimo recurso.
export const NORMALIZED_IMAGES: ReadonlySet<string> = new Set([
${todos.map(s => `  '${s}',`).join('\n')}
])
`

  await writeFile(MANIFEST, conteudo)
  return todos.length
}

async function main() {
  const args = process.argv.slice(2)
  const dryRun = args.includes('--dry')
  const outFlag = args.indexOf('--out')
  const outDir = outFlag >= 0 ? resolve(args[outFlag + 1]) : DEFAULT_OUT_DIR
  const only = args.filter((a, i) => !a.startsWith('--') && i !== outFlag + 1)

  if (!existsSync(SRC_DIR)) {
    console.error(`Pasta de origem nao encontrada: ${SRC_DIR}`)
    process.exit(1)
  }
  await mkdir(outDir, { recursive: true })

  const all = (await readdir(SRC_DIR)).filter(f => /\.(png|jpe?g|webp)$/i.test(f)).sort()
  const files = only.length ? all.filter(f => only.some(o => f.includes(o))) : all

  if (!files.length) {
    console.error('Nenhuma imagem encontrada para processar.')
    process.exit(1)
  }

  const processados: string[] = []

  for (const file of files) {
    if (dryRun) {
      const existe = existsSync(join(outDir, `${toSlug(file)}.jpg`))
      console.log(`${file}  ->  ${toSlug(file)}.jpg  ${existe ? '(substitui)' : '(novo)'}`)
      continue
    }
    const { slug, bg } = await normalize(file, outDir)
    const { size } = statSync(join(outDir, `${slug}.jpg`))
    processados.push(slug)
    console.log(
      `${slug}.jpg  ${SIZE}x${SIZE}  ${(size / 1024).toFixed(0)} KB  fundo rgb(${bg.r},${bg.g},${bg.b})`
    )
  }

  console.log(`\n${files.length} imagem(ns) ${dryRun ? 'a processar' : 'processada(s)'}.`)

  // So atualiza o manifesto quando a saida e a pasta real do app: uma
  // amostra em diretorio temporario nao deve mudar o que o site usa.
  if (!dryRun && outDir === DEFAULT_OUT_DIR) {
    const total = await updateManifest(processados)
    console.log(`Manifesto src/data/normalized-images.ts: ${total} slug(s).`)
  }
}

main()
