import { readFileSync, writeFileSync } from 'fs'
import { join } from 'path'

const DATA_FILE = join(__dirname, '../src/data/fish-invertebrados-agua-salgada.ts')
const DELAY_MS = 400

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

async function fetchJSON(url: string): Promise<any> {
  try {
    const r = await fetch(url, { headers: { Accept: 'application/json' } })
    if (!r.ok) return null
    return r.json()
  } catch { return null }
}

async function getEnrichment(name: string) {
  const gbif = await fetchJSON(`https://api.gbif.org/v1/species/match?name=${encodeURIComponent(name)}&strict=true`)
  await sleep(DELAY_MS)
  const inat = await fetchJSON(`https://api.inaturalist.org/v1/observations?taxon_name=${encodeURIComponent(name)}&per_page=3&quality_grade=research&photos=true&order=desc&order_by=votes`)
  await sleep(DELAY_MS)
  const enrichment: any = { enrichedAt: new Date().toISOString() }
  if (gbif?.usageKey) {
    enrichment.gbifTaxonKey = gbif.usageKey
    enrichment.taxonomia = { reino: gbif.kingdom || '', filo: gbif.phylum || '', classe: gbif.class || '', ordem: gbif.order || '', familia: gbif.family || '', genero: gbif.genus || '', especie: gbif.species || '' }
  }
  const photos: string[] = []
  if (inat?.results) for (const obs of inat.results) if (obs.photos?.[0]?.url) photos.push(obs.photos[0].url.replace('square', 'medium'))
  if (photos.length > 0) enrichment.inatPhotoUrls = photos.slice(0, 3)
  return Object.keys(enrichment).length > 1 ? enrichment : undefined
}

const inverts: [string, string, string, string, string, string, string, string][] = [
  // [nomePopular, nomeCientifico, familia, tamanho, ph, temp, comportamento, info]
  // Camaroes
  ['Camarão Limpador Escarlate', 'Lysmata amboinensis', 'Lysmatidae', '6 cm', '8.0 a 8.4', '24 a 28 ºC', 'Pacífico, limpa parasitas de peixes. Vive em pares ou grupos.', 'Aquário mínimo: 40 litros. Um dos invertebrados mais úteis no reef.'],
  ['Camarão Pistola', 'Alpheus randalli', 'Alpheidae', '4 cm', '8.0 a 8.4', '24 a 28 ºC', 'Pacífico, vive em simbiose com gobies watchman. Produz estalo com a garra.', 'Aquário mínimo: 40 litros. Forma dupla fascinante com gobi.'],
  ['Camarão Sexy', 'Thor amboinensis', 'Thoridae', '2 cm', '8.0 a 8.4', '24 a 28 ºC', 'Pacífico, dança balançando o corpo. Vive em anêmonas.', 'Aquário mínimo: 20 litros. Um dos menores camarões marinhos.'],
  ['Camarão Mantis (Esquila)', 'Odontodactylus scyllarus', 'Odontodactylidae', '18 cm', '8.0 a 8.4', '24 a 28 ºC', 'Predador extremamente agressivo. Soco mais rápido do reino animal. Quebra vidro.', 'Aquário mínimo: 80 litros. APENAS aquário dedicado. Pode quebrar aquários finos.'],
  ['Camarão Camelo', 'Rhynchocinetes durbanensis', 'Rhynchocinetidae', '4 cm', '8.0 a 8.4', '24 a 28 ºC', 'Pacífico com peixes, pode beliscar corais moles e zoanthus.', 'Aquário mínimo: 40 litros. NÃO reef safe.'],
  ['Camarão Arlequim', 'Hymenocera picta', 'Hymenoceridae', '5 cm', '8.0 a 8.4', '24 a 28 ºC', 'Pacífico mas alimentação difícil. Se alimenta exclusivamente de estrelas do mar.', 'Aquário mínimo: 40 litros.'],
  ['Camarão Blood Red Fire', 'Lysmata debelius', 'Lysmatidae', '5 cm', '8.0 a 8.4', '24 a 28 ºC', 'Pacífico, vermelho intenso, tímido, noturno.', 'Aquário mínimo: 40 litros.'],
  // Caranguejos
  ['Ermitão Patas Azuis', 'Clibanarius tricolor', 'Diogenidae', '3 cm', '8.0 a 8.4', '24 a 28 ºC', 'Pacífico, excelente comedor de algas. Parte da equipe de limpeza.', 'Aquário mínimo: 20 litros. Manter conchas extras disponíveis.'],
  ['Ermitão Patas Vermelhas', 'Paguristes cadenati', 'Diogenidae', '3 cm', '8.0 a 8.4', '24 a 28 ºC', 'Pacífico, come algas e detritos.', 'Aquário mínimo: 20 litros.'],
  ['Ermitão Patas Elétricas', 'Calcinus elegans', 'Diogenidae', '3 cm', '8.0 a 8.4', '24 a 28 ºC', 'Pacífico, patas azul elétrico, come algas.', 'Aquário mínimo: 20 litros. Um dos ermitões mais bonitos.'],
  ['Caranguejo Esmeralda', 'Mithraculus sculptus', 'Majidae', '5 cm', '8.0 a 8.4', '24 a 28 ºC', 'Pacífico, excelente para controle de algas bolha (Valonia).', 'Aquário mínimo: 40 litros. Reef safe.'],
  ['Caranguejo Porcelana', 'Neopetrolisthes maculatus', 'Porcellanidae', '2 cm', '8.0 a 8.4', '24 a 28 ºC', 'Pacífico, filtra alimento da água. Vive em anêmonas.', 'Aquário mínimo: 20 litros.'],
  ['Caranguejo Boxeador (Pom Pom)', 'Lybia tessellata', 'Xanthidae', '2 cm', '8.0 a 8.4', '24 a 28 ºC', 'Pacífico, carrega anêmonas nas garras como "luvas de boxe".', 'Aquário mínimo: 20 litros. Um dos invertebrados mais curiosos.'],
  ['Caranguejo Flecha', 'Stenorhynchus seticornis', 'Majidae', '10 cm', '8.0 a 8.4', '24 a 28 ºC', 'Semi-agressivo com outros caranguejos. Come vermes de fogo.', 'Aquário mínimo: 60 litros.'],
  ['Caranguejo Decorador', 'Camposcia retusa', 'Majidae', '8 cm', '8.0 a 8.4', '24 a 28 ºC', 'Pacífico, cola pedaços de coral e algas no corpo como camuflagem.', 'Aquário mínimo: 60 litros.'],
  // Estrelas do Mar
  ['Estrela Serpente', 'Ophiocoma wendtii', 'Ophiocomidae', '15 cm', '8.0 a 8.4', '24 a 28 ºC', 'Pacífico, noturno, come detritos. Equipe de limpeza.', 'Aquário mínimo: 60 litros.'],
  ['Estrela Vermelha (Fromia)', 'Fromia milleporella', 'Goniasteridae', '12 cm', '8.0 a 8.4', '24 a 28 ºC', 'Pacífico, ornamental, sensível à aclimatação.', 'Aquário mínimo: 80 litros. Reef safe.'],
  ['Estrela Azul (Linckia)', 'Linckia laevigata', 'Ophidiasteridae', '25 cm', '8.0 a 8.4', '24 a 28 ºC', 'Pacífico, difícil de manter, precisa de aquário maduro.', 'Aquário mínimo: 200 litros. Aclimatação de 3+ horas.'],
  ['Estrela Areia (Sand Sifting)', 'Astropecten polycanthus', 'Astropectinidae', '15 cm', '8.0 a 8.4', '24 a 28 ºC', 'Pacífico, enterra-se na areia e limpa o substrato.', 'Aquário mínimo: 150 litros.'],
  ['Estrela Coroa de Espinhos', 'Acanthaster planci', 'Acanthasteridae', '40 cm', '8.0 a 8.4', '24 a 28 ºC', 'Predador de corais! NÃO manter em reef. Espinhos venenosos.', 'NÃO recomendado para aquários. Praga de recifes naturais.'],
  // Ouriços
  ['Ouriço Diadema', 'Diadema setosum', 'Diadematidae', '20 cm', '8.0 a 8.4', '24 a 28 ºC', 'Pacífico, excelente comedor de algas. Espinhos longos e finos.', 'Aquário mínimo: 100 litros. Espinhos podem perfurar pele.'],
  ['Ouriço Pencil (Lápis)', 'Eucidaris tribuloides', 'Cidaridae', '10 cm', '8.0 a 8.4', '24 a 28 ºC', 'Pacífico, espinhos grossos como lápis. Come algas e detritos.', 'Aquário mínimo: 60 litros.'],
  ['Ouriço Tuxedo (Pincushion)', 'Mespilia globulus', 'Temnopleuridae', '8 cm', '8.0 a 8.4', '24 a 28 ºC', 'Pacífico, listrado azul e preto. Come algas. Reef safe.', 'Aquário mínimo: 60 litros. Um dos ouriços mais seguros para reef.'],
  // Caracóis
  ['Caracol Turbo', 'Turbo fluctuosa', 'Turbinidae', '5 cm', '8.0 a 8.4', '24 a 28 ºC', 'Pacífico, devora algas rapidamente. Equipe de limpeza essencial.', 'Aquário mínimo: 20 litros.'],
  ['Caracol Astrea', 'Lithopoma tectum', 'Turbinidae', '3 cm', '8.0 a 8.4', '24 a 28 ºC', 'Pacífico, come algas em vidros e rochas. Não consegue se virar sozinho.', 'Aquário mínimo: 20 litros.'],
  ['Caracol Nassarius', 'Nassarius vibex', 'Nassariidae', '2 cm', '8.0 a 8.4', '24 a 28 ºC', 'Pacífico, vive enterrado na areia, emerge para comer restos.', 'Aquário mínimo: 20 litros. Limpa substrato.'],
  ['Caracol Cerith', 'Cerithium atratum', 'Cerithiidae', '3 cm', '8.0 a 8.4', '24 a 28 ºC', 'Pacífico, come algas e detrito no substrato arenoso.', 'Aquário mínimo: 20 litros.'],
  ['Caracol Trochus', 'Trochus niloticus', 'Trochidae', '5 cm', '8.0 a 8.4', '24 a 28 ºC', 'Pacífico, come algas inclusive diatomáceas. Consegue se virar sozinho.', 'Aquário mínimo: 30 litros. Superior ao Astrea.'],
  ['Caracol Concha Lutador', 'Strombus alatus', 'Strombidae', '8 cm', '8.0 a 8.4', '24 a 28 ºC', 'Pacífico, come algas e cianobactérias no substrato. Olhos expressivos.', 'Aquário mínimo: 60 litros.'],
  // Moluscos e Outros
  ['Tridacna (Béjula Gigante)', 'Tridacna crocea', 'Cardiidae', '15 cm', '8.0 a 8.4', '24 a 28 ºC', 'Pacífico, fotossintético. Cores incríveis sob luz actínica.', 'Aquário mínimo: 100 litros. Iluminação forte obrigatória.'],
  ['Tridacna Maxima', 'Tridacna maxima', 'Cardiidae', '30 cm', '8.0 a 8.4', '24 a 28 ºC', 'Pacífico, fotossintético. Maior e mais colorida que a crocea.', 'Aquário mínimo: 200 litros.'],
  ['Polvo Anão', 'Octopus joubini', 'Octopodidae', '15 cm', '8.0 a 8.4', '22 a 26 ºC', 'Inteligente, escapista, predador. Aquário dedicado com tampa segura.', 'Aquário mínimo: 80 litros. Pet invertebrado, interage com o dono.'],
  ['Pepino do Mar', 'Holothuria atra', 'Holothuriidae', '30 cm', '8.0 a 8.4', '24 a 28 ºC', 'Pacífico, filtra substrato. Pode liberar toxinas se estressado.', 'Aquário mínimo: 150 litros. Cuidado: pode envenenar o aquário.'],
  ['Lagosta Bailarina', 'Enoplometopus debelius', 'Enoplometopidae', '12 cm', '8.0 a 8.4', '24 a 28 ºC', 'Semi-agressiva, noturna, cores rosa/roxo vibrantes.', 'Aquário mínimo: 80 litros.'],
  ['Nudibranquio Berghia', 'Berghia stephanieae', 'Aeolidiidae', '3 cm', '8.0 a 8.4', '24 a 28 ºC', 'Pacífico, se alimenta exclusivamente de aiptásias (praga).', 'Controle biológico de aiptásias. Morre quando acaba a comida.'],
  ['Água-Viva Lua', 'Aurelia aurita', 'Ulmaridae', '25 cm', '8.0 a 8.4', '15 a 22 ºC', 'Pacífico, aquário circular dedicado (kreisel). Visual hipnótico.', 'Aquário kreisel mínimo: 50 litros. NÃO manter com peixes.'],
]

async function main() {
  console.log('Importando invertebrados marinhos...\n')

  const content = readFileSync(DATA_FILE, 'utf-8')
  const match = content.match(/const data: Fish\[\] = (\[[\s\S]*?\])\n\nexport/)
  if (!match) { console.log('Erro'); return }
  const records = JSON.parse(match[1])

  const existing = new Set<string>()
  for (const r of records) {
    if (r.nomeCientifico) existing.add(r.nomeCientifico.toLowerCase())
    if (r.nomePopular) existing.add(r.nomePopular.toLowerCase())
  }

  let maxId = records.reduce((m: number, r: any) => Math.max(m, r.id), 0)
  let added = 0

  for (const [pop, sci, fam, tam, ph, temp, comp, info] of inverts) {
    if (existing.has(sci.toLowerCase()) || existing.has(pop.toLowerCase())) {
      console.log(`  Existe: ${pop}`)
      continue
    }
    console.log(`  + ${pop}`)
    const e = await getEnrichment(sci)
    records.push({
      id: ++maxId, alimentacao: '', caracteristica: '', comportamento: comp,
      diformismoSexual: '', familia: fam, gh: '', imagem: '', kh: '',
      nomeCientifico: sci, nomePopular: pop, origem: '',
      outrasInformacoes: info, outrosNome: '', ph, posicaoAquario: '',
      reproducao: '', tamanhoAdulto: tam, temperatura: temp,
      tipo: 'PEIXESINVERTEBRADOSMARINHOS', subTipo: '', fonte: '',
      ...(e && { enrichment: e }),
    })
    added++
  }

  writeFileSync(DATA_FILE, `import type { Fish } from '../types'\n\nconst data: Fish[] = ${JSON.stringify(records, null, 2)}\n\nexport default data\n`)
  console.log(`\nAdicionados: ${added} (total: ${records.length})`)
}

main().catch(console.error)
