/**
 * Constantes de SEO compartilhadas entre o app e o script de build.
 *
 * O `scripts/generate-seo.ts` importa este arquivo para gerar o HTML de cada
 * rota, e o `components/SEO.tsx` importa para montar o head no cliente. Manter
 * os dois lados na mesma fonte evita que o Google leia um titulo e o usuario
 * veja outro.
 */

/**
 * Origem canonica do site, sem barra no fim (toda rota do app ja comeca com "/").
 *
 * Entra no `<link rel="canonical">`, nas tags `og:` e no sitemap. Se um dominio
 * proprio entrar no ar, e a unica linha que muda.
 */
export const SITE_URL = 'https://aqua360.vercel.app'

export const SITE_NAME = 'Aqua360'

export const DEFAULT_TITLE = 'Aqua360 - O seu guia completo de aquarismo'

export const DEFAULT_DESCRIPTION =
  'Guia de aquarismo com fichas de peixes, plantas, corais e doenças: parâmetros de água, compatibilidade, mapas de distribuição e calculadoras.'

/** Card de compartilhamento padrão, em 1200x630. */
export const DEFAULT_IMAGE = '/og-image.png'

/** Idioma do conteúdo que o build publica. Ver nota sobre os outros três no README. */
export const DEFAULT_LOCALE = 'pt_BR'

/**
 * Diretiva de robots das páginas indexáveis.
 *
 * `max-snippet:160` prende o trecho que o Google exibe ao tamanho de um resumo
 * comum, então o resultado mostra a chamada da ficha e não um bloco inteiro
 * dela. `max-image-preview:large` fica liberado de propósito: numa busca por
 * espécie, a foto grande no resultado é o que traz clique.
 */
export const ROBOTS_INDEX =
  'index, follow, max-snippet:160, max-image-preview:large, max-video-preview:0'

/**
 * Páginas que o Google não deve indexar mas pode percorrer.
 *
 * `follow` importa: a busca interna é um caminho para as fichas, e sem ele o
 * rastreador pararia ali.
 */
export const ROBOTS_NOINDEX = 'noindex, follow'

/** Resolve um caminho do app para URL absoluta. URLs já absolutas passam direto. */
export function absoluteUrl(path: string): string {
  if (/^https?:\/\//i.test(path)) return path
  return `${SITE_URL}${path.startsWith('/') ? path : `/${path}`}`
}
