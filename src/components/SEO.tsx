import { Helmet } from 'react-helmet-async'

interface Props {
  title?: string
  description?: string
  image?: string
}

export default function SEO({ title, description, image }: Props) {
  const fullTitle = title ? `${title} - Aqua360` : 'Aqua360 - O seu guia completo de aquarismo'
  const desc = description || 'Guia completo de aquarismo com dados cientificos de mais de 788 especies, mapas de distribuicao, compatibilidade e muito mais.'
  const img = image || '/favicon.svg'

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={desc} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={desc} />
      <meta property="og:image" content={img} />
      <meta property="og:type" content="website" />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={desc} />
    </Helmet>
  )
}
