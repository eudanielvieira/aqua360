import { useState, useEffect } from 'react'
import { MapContainer, TileLayer, CircleMarker, Popup, useMap } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import { MapPin } from 'lucide-react'

interface Props {
  taxonKey: number
  speciesName?: string
}

interface Occurrence {
  key: number
  lat: number
  lng: number
  country?: string
  year?: number
  basisOfRecord?: string
}

function FitBounds({ points }: { points: Occurrence[] }) {
  const map = useMap()

  useEffect(() => {
    if (points.length === 0) return
    const lats = points.map(p => p.lat)
    const lngs = points.map(p => p.lng)
    const bounds: [[number, number], [number, number]] = [
      [Math.min(...lats) - 2, Math.min(...lngs) - 2],
      [Math.max(...lats) + 2, Math.max(...lngs) + 2],
    ]
    map.fitBounds(bounds, { padding: [20, 20], maxZoom: 6 })
  }, [points, map])

  return null
}

export default function DistributionMap({ taxonKey, speciesName }: Props) {
  const [occurrences, setOccurrences] = useState<Occurrence[]>([])
  const [loading, setLoading] = useState(true)
  const [total, setTotal] = useState(0)

  useEffect(() => {
    setLoading(true)
    fetch(`https://api.gbif.org/v1/occurrence/search?taxonKey=${taxonKey}&hasCoordinate=true&limit=200&fields=key,decimalLatitude,decimalLongitude,country,year,basisOfRecord`)
      .then(r => r.json())
      .then(data => {
        const points: Occurrence[] = []
        const seen = new Set<string>()
        for (const r of data.results || []) {
          if (!r.decimalLatitude || !r.decimalLongitude) continue
          const roundedKey = `${r.decimalLatitude.toFixed(1)},${r.decimalLongitude.toFixed(1)}`
          if (seen.has(roundedKey)) continue
          seen.add(roundedKey)
          points.push({
            key: r.key,
            lat: r.decimalLatitude,
            lng: r.decimalLongitude,
            country: r.country,
            year: r.year,
            basisOfRecord: r.basisOfRecord,
          })
        }
        setOccurrences(points)
        setTotal(data.count || 0)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [taxonKey])

  return (
    <div>
      <div className="w-full h-72 sm:h-80 rounded-xl overflow-hidden border border-border">
        <MapContainer
          center={[0, 20]}
          zoom={2}
          scrollWheelZoom={false}
          className="w-full h-full"
          attributionControl={true}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
          />
          <TileLayer
            attribution='&copy; <a href="https://www.gbif.org">GBIF</a>'
            url={`https://api.gbif.org/v2/map/occurrence/density/{z}/{x}/{y}@1x.png?taxonKey=${taxonKey}&bin=hex&hexPerTile=30&style=classic.point`}
            opacity={0.4}
          />
          {occurrences.map(occ => (
            <CircleMarker
              key={occ.key}
              center={[occ.lat, occ.lng]}
              radius={5}
              pathOptions={{
                color: '#0F4C75',
                fillColor: '#3282B8',
                fillOpacity: 0.8,
                weight: 1.5,
              }}
            >
              <Popup>
                <div className="text-xs leading-relaxed">
                  <p className="font-bold">{speciesName || 'Ocorrencia'}</p>
                  {occ.country && <p>Pais: {occ.country}</p>}
                  {occ.year && <p>Ano: {occ.year}</p>}
                  <p className="text-[10px] opacity-60 mt-1">
                    {occ.lat.toFixed(4)}, {occ.lng.toFixed(4)}
                  </p>
                </div>
              </Popup>
            </CircleMarker>
          ))}
          {occurrences.length > 0 && <FitBounds points={occurrences} />}
        </MapContainer>
      </div>
      {!loading && (
        <div className="flex items-center gap-2 mt-2">
          <MapPin size={12} className="text-primary" />
          <p className="text-[11px] text-text-secondary">
            {occurrences.length} pontos de ocorrencia exibidos
            {total > 200 && ` de ${total.toLocaleString()} registros no GBIF`}
          </p>
        </div>
      )}
      {loading && (
        <p className="text-[11px] text-text-secondary mt-2">Carregando ocorrencias...</p>
      )}
    </div>
  )
}
