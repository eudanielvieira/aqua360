import { useEffect } from 'react'
import { Helmet } from 'react-helmet-async'
import { useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import type { PageMeta } from '../seo/meta'
import { releasePrerenderedHead } from '../seo/prerendered'
import {
  DEFAULT_DESCRIPTION,
  DEFAULT_IMAGE,
  DEFAULT_TITLE,
  ROBOTS_INDEX,
  ROBOTS_NOINDEX,
  SITE_NAME,
  absoluteUrl,
} from '../seo/site'

interface Props extends Partial<PageMeta> {
  /** `article` nas fichas de espécie, `website` no resto. */
  type?: 'website' | 'article'
  /** Blocos JSON-LD da página (trilha, marca). */
  jsonLd?: object[]
}

/** `og:locale` no formato que o Facebook espera, por idioma do i18next. */
const OG_LOCALE: Record<string, string> = {
  'pt-BR': 'pt_BR',
  en: 'en_US',
  es: 'es_ES',
  ja: 'ja_JP',
}

/**
 * Head da página.
 *
 * O `scripts/generate-seo.ts` grava essas mesmas tags no HTML servido pelo CDN,
 * que é o que rastreador sem JavaScript (WhatsApp, Facebook, LinkedIn) lê. Este
 * componente cobre o outro lado: quando o usuário navega dentro do app, ou troca
 * de idioma, o head acompanha em vez de congelar no da primeira rota aberta.
 *
 * O `title` chega pronto, com a marca já no fim. Quem monta é o `seo/meta.ts`,
 * para o build e o cliente não escreverem títulos diferentes da mesma ficha.
 */
export default function SEO({
  title = DEFAULT_TITLE,
  description = DEFAULT_DESCRIPTION,
  image,
  noIndex = false,
  type = 'website',
  jsonLd,
}: Props) {
  const { pathname } = useLocation()
  const { i18n } = useTranslation()

  // Assumido o head, o bloco que veio no HTML vira duplicata. Roda uma vez por
  // carga de pagina; a propria funcao segura as chamadas seguintes.
  useEffect(releasePrerenderedHead, [])

  // O titulo fica fora do Helmet de proposito. Passando por ele, o React 19
  // acrescenta um <title> proprio e o pre-renderizado continua no head, e a
  // pagina termina com dois. Escrever em document.title mexe no elemento que ja
  // existe, entao sobra um so, sem depender de como o React hospeda a tag.
  useEffect(() => {
    document.title = title
  }, [title])

  // Sem query string: `/busca?q=betta` e `/busca?q=neon` são a mesma página
  // para o Google, e o canonical é justamente o que diz isso a ele.
  const canonical = absoluteUrl(pathname)
  const ogImage = absoluteUrl(image || DEFAULT_IMAGE)
  const lang = i18n.language || 'pt-BR'

  return (
    <Helmet htmlAttributes={{ lang }}>
      <meta name="description" content={description} />
      <meta name="robots" content={noIndex ? ROBOTS_NOINDEX : ROBOTS_INDEX} />
      <link rel="canonical" href={canonical} />

      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:type" content={type} />
      <meta property="og:url" content={canonical} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:locale" content={OG_LOCALE[lang] ?? 'pt_BR'} />

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={ogImage} />

      {jsonLd?.map((block, index) => (
        <script key={index} type="application/ld+json">
          {JSON.stringify(block)}
        </script>
      ))}
    </Helmet>
  )
}
