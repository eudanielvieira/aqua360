/**
 * Escreve o head de SEO de cada rota direto no HTML publicado, mais o sitemap.
 *
 * Roda depois do `vite build`, sobre o que ja esta em dist/. Para cada rota do
 * app grava um `dist/<rota>/index.html` com titulo, description, canonical,
 * tags og: e JSON-LD proprios daquela pagina. O corpo continua vazio: quem
 * monta a tela e o React, como antes. O que muda e o head, que agora chega
 * pronto no HTML servido pelo CDN.
 *
 * Por que nao deixar so o react-helmet resolver: o Googlebot ate roda
 * JavaScript, mas numa segunda passada que pode demorar dias, e os
 * rastreadores de rede social (WhatsApp, Facebook, LinkedIn, Slack) nao rodam
 * JavaScript nenhum. Sem isso, todo link compartilhado do site mostrava o card
 * generico da home, qualquer que fosse a ficha.
 *
 * A Vercel resolve arquivo estatico antes de aplicar o rewrite do
 * vercel.json, entao `/peixes/agua-doce/21` acha o arquivo gerado aqui; rota
 * sem arquivo (id inexistente) continua caindo no fallback do SPA.
 *
 *   bun run scripts/generate-seo.ts
 */

import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'

import { fishCategories, loadFishByType } from '../src/data/fish-index'
import { breadcrumbList, siteOrganization, type Crumb } from '../src/seo/jsonld'
import {
  coralMeta,
  diseaseMeta,
  fishCategoryPages,
  fishMeta,
  plantMeta,
  staticPages,
  type PageMeta,
} from '../src/seo/meta'
import {
  DEFAULT_IMAGE,
  DEFAULT_LOCALE,
  ROBOTS_INDEX,
  ROBOTS_NOINDEX,
  SITE_NAME,
  absoluteUrl,
} from '../src/seo/site'

const DIST = join(import.meta.dirname, '..', 'dist')

/** Delimitadores do bloco reescrito. Precisam bater com os do index.html. */
const SEO_START = '<!--seo-->'
const SEO_END = '<!--/seo-->'

/** Grava em lotes para nao abrir 900 descritores de arquivo de uma vez. */
const WRITE_BATCH = 64

interface Route {
  path: string
  meta: PageMeta
  type: 'website' | 'article'
  jsonLd: object[]
}

const HOME: Crumb = { name: 'Início', path: '/' }

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

function metaTag(attr: 'name' | 'property', key: string, content: string): string {
  return `<meta ${attr}="${key}" content="${escapeHtml(content)}" />`
}

function renderHead(route: Route): string {
  const url = absoluteUrl(route.path)
  const { title, description, image, noIndex } = route.meta
  const ogImage = absoluteUrl(image || DEFAULT_IMAGE)

  const tags = [
    `<title>${escapeHtml(title)}</title>`,
    metaTag('name', 'description', description),
    metaTag('name', 'robots', noIndex ? ROBOTS_NOINDEX : ROBOTS_INDEX),
    `<link rel="canonical" href="${escapeHtml(url)}" />`,
    metaTag('property', 'og:site_name', SITE_NAME),
    metaTag('property', 'og:type', route.type),
    metaTag('property', 'og:url', url),
    metaTag('property', 'og:title', title),
    metaTag('property', 'og:description', description),
    metaTag('property', 'og:image', ogImage),
    metaTag('property', 'og:locale', DEFAULT_LOCALE),
    metaTag('name', 'twitter:card', 'summary_large_image'),
    metaTag('name', 'twitter:title', title),
    metaTag('name', 'twitter:description', description),
    metaTag('name', 'twitter:image', ogImage),
  ]

  for (const block of route.jsonLd) {
    // O < evita que um "<" dentro de um nome feche o script antes da hora.
    const json = JSON.stringify(block).replace(/</g, '\\u003c')
    tags.push(`<script type="application/ld+json">${json}</script>`)
  }

  return tags.map(tag => `    ${tag}`).join('\n')
}

async function collectRoutes(): Promise<Route[]> {
  const routes: Route[] = []

  for (const [path, meta] of Object.entries(staticPages)) {
    routes.push({
      path,
      meta,
      type: 'website',
      jsonLd: path === '/' ? [siteOrganization()] : [],
    })
  }

  for (const category of fishCategories) {
    const categoryMeta = fishCategoryPages[category.slug]
    if (!categoryMeta) {
      console.warn(`  aviso: categoria "${category.slug}" sem metadados em seo/meta.ts, pulada`)
      continue
    }

    const categoryPath = `/peixes/${category.slug}`
    const trail: Crumb[] = [HOME, { name: 'Peixes', path: '/peixes' }]

    routes.push({
      path: categoryPath,
      meta: categoryMeta,
      type: 'website',
      jsonLd: [breadcrumbList([...trail, { name: category.label, path: categoryPath }])],
    })

    for (const fish of await loadFishByType(category.slug)) {
      const path = `${categoryPath}/${fish.id}`
      routes.push({
        path,
        meta: fishMeta(fish),
        type: 'article',
        jsonLd: [
          breadcrumbList([
            ...trail,
            { name: category.label, path: categoryPath },
            { name: fish.nomePopular, path },
          ]),
        ],
      })
    }
  }

  const [plants, corals, diseases] = await Promise.all([
    import('../src/data/plants').then(m => m.default),
    import('../src/data/corals').then(m => m.default),
    import('../src/data/diseases').then(m => m.default),
  ])

  for (const plant of plants) {
    const path = `/plantas/${plant.id}`
    routes.push({
      path,
      meta: plantMeta(plant),
      type: 'article',
      jsonLd: [
        breadcrumbList([
          HOME,
          { name: 'Plantas', path: '/plantas' },
          { name: plant.nomePopular, path },
        ]),
      ],
    })
  }

  for (const coral of corals) {
    const path = `/corais/${coral.id}`
    routes.push({
      path,
      meta: coralMeta(coral),
      type: 'article',
      jsonLd: [
        breadcrumbList([
          HOME,
          { name: 'Corais', path: '/corais' },
          { name: coral.nomePopular, path },
        ]),
      ],
    })
  }

  for (const disease of diseases) {
    const path = `/doencas/${disease.id}`
    routes.push({
      path,
      meta: diseaseMeta(disease),
      type: 'article',
      jsonLd: [
        breadcrumbList([HOME, { name: 'Doenças', path: '/doencas' }, { name: disease.nome, path }]),
      ],
    })
  }

  return routes
}

function buildSitemap(routes: Route[]): string {
  // So <loc>. O Google ignora <priority> e <changefreq> ha anos, e <lastmod>
  // ele so respeita quando confia: como nao guardamos data de alteracao por
  // ficha, carimbar a data do build em tudo seria mentira que ele desconta.
  const urls = routes
    .filter(route => !route.meta.noIndex)
    .map(route => `  <url><loc>${escapeHtml(absoluteUrl(route.path))}</loc></url>`)

  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...urls,
    '</urlset>',
    '',
  ].join('\n')
}

/** Avisa sobre head que o Google vai cortar. Nao derruba o build. */
function report(routes: Route[]): void {
  const longTitles = routes.filter(r => r.meta.title.length > 60)
  const longDescriptions = routes.filter(r => r.meta.description.length > 160)
  const shortDescriptions = routes.filter(r => r.meta.description.length < 70)

  if (longTitles.length > 0) {
    console.log(`  ${longTitles.length} titulos acima de 60 caracteres (o Google corta no resultado)`)
    console.log(`    ex.: ${longTitles[0].path} -> "${longTitles[0].meta.title}"`)
  }
  if (longDescriptions.length > 0) {
    console.log(`  ${longDescriptions.length} descriptions acima de 160 caracteres`)
  }
  if (shortDescriptions.length > 0) {
    console.log(`  ${shortDescriptions.length} descriptions abaixo de 70 caracteres (ficha magra)`)
    console.log(`    ex.: ${shortDescriptions[0].path}`)
  }
}

async function main(): Promise<void> {
  const templatePath = join(DIST, 'index.html')
  let template: string

  try {
    template = await readFile(templatePath, 'utf8')
  } catch {
    console.error('dist/index.html nao encontrado. Rode o vite build antes deste script.')
    process.exit(1)
  }

  const startAt = template.indexOf(SEO_START)
  const endAt = template.indexOf(SEO_END)

  if (startAt === -1 || endAt === -1) {
    console.error(
      `Marcadores ${SEO_START} / ${SEO_END} nao encontrados em dist/index.html.\n` +
        'Eles vem do index.html da raiz; se sairam de la, o head por rota nao tem onde entrar.'
    )
    process.exit(1)
  }

  const before = template.slice(0, startAt + SEO_START.length)
  const after = template.slice(endAt)

  const routes = await collectRoutes()

  for (let i = 0; i < routes.length; i += WRITE_BATCH) {
    await Promise.all(
      routes.slice(i, i + WRITE_BATCH).map(async route => {
        const html = `${before}\n${renderHead(route)}\n    ${after}`
        const outPath =
          route.path === '/' ? templatePath : join(DIST, route.path, 'index.html')

        await mkdir(dirname(outPath), { recursive: true })
        await writeFile(outPath, html, 'utf8')
      })
    )
  }

  const indexable = routes.filter(route => !route.meta.noIndex)
  await writeFile(join(DIST, 'sitemap.xml'), buildSitemap(routes), 'utf8')

  console.log(`SEO: ${routes.length} paginas geradas, ${indexable.length} no sitemap.`)
  report(routes)
}

await main()
