/**
 * Blocos JSON-LD que o Google entende.
 *
 * Só entra aqui o que gera resultado de verdade na Busca. `BreadcrumbList` vira
 * a trilha no lugar da URL crua no resultado, e `Organization` alimenta o painel
 * da marca. Espécie não tem tipo no schema.org core (`Taxon` é do Bioschemas e o
 * Google não lê), então não inventamos marcação que ninguém consome.
 */

import { DEFAULT_DESCRIPTION, SITE_NAME, SITE_URL, absoluteUrl } from './site'

export interface Crumb {
  name: string
  path: string
}

export function breadcrumbList(crumbs: Crumb[]): object {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: crumbs.map((crumb, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: crumb.name,
      item: absoluteUrl(crumb.path),
    })),
  }
}

export function siteOrganization(): object {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: SITE_NAME,
    url: SITE_URL,
    description: DEFAULT_DESCRIPTION,
    inLanguage: 'pt-BR',
  }
}
