/**
 * Gera o card de compartilhamento padrao em public/og-image.png.
 *
 * E o que aparece quando alguem cola um link do Aqua360 no WhatsApp, no
 * Facebook ou no LinkedIn e a pagina nao tem imagem propria. O favicon nao
 * servia: SVG nao e aceito como og:image e 48x48 fica ilegivel no card.
 *
 * Roda sob demanda, nao no build: a saida e um PNG versionado. So precisa
 * rodar de novo se a marca mudar.
 *
 *   node scripts/generate-og-image.ts
 *
 * Em node, nao em bun, pelo mesmo motivo do normalize-images: o alocador do
 * bun quebra nas chamadas nativas do sharp.
 */

import { writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import sharp from 'sharp'

const WIDTH = 1200
const HEIGHT = 630
const OUTPUT = join(import.meta.dirname, '..', 'public', 'og-image.png')

/** Onda do favicon repetida na largura do card, como marca d'agua de fundo. */
function waveRow(y: number, opacity: number): string {
  const step = 96
  const segments: string[] = [`M-40 ${y}`]
  for (let x = -40; x < WIDTH + 80; x += step) {
    segments.push(`c ${step / 4} -22, ${(step * 3) / 4} -22, ${step} 0`)
    segments.push(`s ${(step * 3) / 4} 22, ${step} 0`)
  }
  return `<path d="${segments.join(' ')}" stroke="#90E0EF" stroke-width="6" stroke-linecap="round" fill="none" opacity="${opacity}"/>`
}

const svg = `
<svg xmlns="http://www.w3.org/2000/svg" width="${WIDTH}" height="${HEIGHT}" viewBox="0 0 ${WIDTH} ${HEIGHT}">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="${WIDTH}" y2="${HEIGHT}" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#0B3954"/>
      <stop offset="100%" stop-color="#3282B8"/>
    </linearGradient>
    <linearGradient id="mark" x1="0" y1="0" x2="140" y2="140" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#0B3954"/>
      <stop offset="100%" stop-color="#3282B8"/>
    </linearGradient>
    <linearGradient id="wave" x1="30" y1="46" x2="116" y2="104" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#FFFFFF"/>
      <stop offset="100%" stop-color="#90E0EF"/>
    </linearGradient>
  </defs>

  <rect width="${WIDTH}" height="${HEIGHT}" fill="url(#bg)"/>

  <g>
    ${waveRow(470, 0.16)}
    ${waveRow(540, 0.11)}
    ${waveRow(610, 0.07)}
  </g>

  <g transform="translate(96, 150)">
    <rect width="140" height="140" rx="35" fill="url(#mark)" stroke="#90E0EF" stroke-width="2" stroke-opacity="0.35"/>
    <g stroke="url(#wave)" stroke-width="9" stroke-linecap="round" fill="none">
      <path d="M29 52c9-9 17-9 26 0s17 9 26 0 17-9 26 0"/>
      <path d="M29 75c9-9 17-9 26 0s17 9 26 0 17-9 26 0" opacity="0.7"/>
      <path d="M29 98c9-9 17-9 26 0s17 9 26 0 17-9 26 0" opacity="0.4"/>
    </g>
  </g>

  <text x="278" y="232" font-family="Helvetica Neue, Helvetica, Arial, sans-serif"
        font-size="96" font-weight="800" fill="#FFFFFF" letter-spacing="-2">Aqua360</text>

  <text x="282" y="286" font-family="Helvetica Neue, Helvetica, Arial, sans-serif"
        font-size="34" font-weight="500" fill="#90E0EF">O seu guia completo de aquarismo</text>

  <text x="96" y="404" font-family="Helvetica Neue, Helvetica, Arial, sans-serif"
        font-size="30" font-weight="400" fill="#FFFFFF" opacity="0.85">Peixes · Plantas · Corais · Doenças · Compatibilidade · Calculadoras</text>
</svg>
`

const png = await sharp(Buffer.from(svg)).png({ compressionLevel: 9 }).toBuffer()
await writeFile(OUTPUT, png)

console.log(`og-image.png gerado: ${WIDTH}x${HEIGHT}, ${(png.length / 1024).toFixed(0)} KB`)
