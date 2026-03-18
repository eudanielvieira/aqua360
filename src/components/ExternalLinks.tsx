import { ExternalLink } from 'lucide-react'
import type { EnrichmentData } from '../types'

interface Props {
  enrichment: EnrichmentData
  nomeCientifico: string
}

export default function ExternalLinks({ enrichment, nomeCientifico }: Props) {
  const links: { label: string; url: string }[] = []

  if (enrichment.gbifTaxonKey) {
    links.push({
      label: 'GBIF',
      url: `https://www.gbif.org/species/${enrichment.gbifTaxonKey}`,
    })
  }

  if (enrichment.wormsAphiaId) {
    links.push({
      label: 'WoRMS',
      url: `https://www.marinespecies.org/aphia.php?p=taxdetails&id=${enrichment.wormsAphiaId}`,
    })
  }

  if (nomeCientifico) {
    links.push({
      label: 'iNaturalist',
      url: `https://www.inaturalist.org/taxa/search?q=${encodeURIComponent(nomeCientifico)}`,
    })
  }

  if (links.length === 0) return null

  return (
    <div className="flex flex-wrap gap-2">
      {links.map(link => (
        <a
          key={link.label}
          href={link.url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface-alt text-xs font-medium text-primary hover:bg-primary/10 transition-colors"
        >
          <ExternalLink size={12} />
          {link.label}
        </a>
      ))}
    </div>
  )
}
