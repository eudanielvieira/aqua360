function fmt(valor: number): string {
  return valor.toFixed(2)
}

export function calcularVolumeRetangulo(comprimento: number, largura: number, altura: number): string {
  const total = (largura * altura * comprimento) / 1000
  return `O aquário possui ${fmt(total)} litros.`
}

export function calcularVolumeTriangulo(altura: number, ladoY: number, ladoZ: number): string {
  const total = ((ladoY * ladoZ) * altura) / 1000 / 2
  return `O aquário possui ${fmt(total)} litros.`
}

export function calcularVolumeCilindro(altura: number, diametro: number): string {
  const valor = Math.PI * diametro * diametro
  const total = (altura * valor) / 1000
  return `O aquário possui ${fmt(total)} litros.`
}

export function calcularWatts(litros: number, watts: number): string {
  return `Você tem uma média de ${fmt(watts / litros)} watts por litro.`
}

export function calcularLitrosTPA(litros: number, porcentagem: number): string {
  const valorPercentual = porcentagem / 100
  return `Valor da troca: ${fmt(valorPercentual * litros)} litros.`
}

export function calcularFiltragemPorHora(qdtFiltro: number, qtdLitrosAquario: number): string {
  const res = qdtFiltro / qtdLitrosAquario
  if (res < 3) {
    return `O seu filtro faz ${fmt(res)} ciclos por hora. O recomendado é no mínimo 3 ciclos.`
  }
  if (res > 9.9) {
    return `O seu filtro faz ${fmt(res)} ciclos por hora. O recomendado é no máximo 9 ciclos.`
  }
  return `O seu filtro faz ${fmt(res)} ciclos por hora. Os requisitos estão cumpridos.`
}

export function calcularVolumeCascalho(litros: number): string {
  const quilos = (litros / 100) * 15
  return `Para um aquário de ${Math.floor(litros)} litros, recomenda-se ${fmt(quilos)} quilos de substrato.`
}

export function calcularFiltroIdeal(litros: number): string {
  return `Para um aquário de ${litros} litros de água doce, recomenda-se um filtro de ${fmt(litros * 5)} litros/hora. Para água salgada, recomenda-se uma bomba submersa de ${fmt(litros * 10)} watts.`
}

export function calcularAquecedor(litros: number): string {
  return `Para um aquário de ${litros} litros, recomenda-se um aquecedor de ${fmt(litros / 2)} watts ou um termostato de ${litros} watts.`
}

export function calcularQtdMaximaPeixes(litros: number): string {
  const qtdBemPequeno = Math.floor(litros / 2.5)
  const qtdPequeno = Math.floor(litros / 10)
  const qtdMedio = Math.floor(litros / 20)
  const qtdGrande = Math.floor(litros / 50)
  return `Para um aquário de ${litros} litros, recomenda-se no máximo: ${qtdBemPequeno} peixe(s) bem pequenos (até 5 cm), ou ${qtdPequeno} peixe(s) pequenos (até 10 cm), ou ${qtdMedio} peixe(s) médios (até 20 cm), ou ${qtdGrande} peixe(s) grandes (acima de 20 cm).`
}

export interface CalculatorConfig {
  id: string
  nome: string
  descricao: string
  icon: string
  fields: { key: string; label: string; placeholder: string; type?: string }[]
  calculate: (values: Record<string, number>) => string
}

export const calculators: CalculatorConfig[] = [
  {
    id: 'retangulo',
    nome: 'Aquário Retangular',
    descricao: 'Calcula o volume em litros',
    icon: 'Box',
    fields: [
      { key: 'comprimento', label: 'Comprimento (cm)', placeholder: '60' },
      { key: 'largura', label: 'Largura (cm)', placeholder: '30' },
      { key: 'altura', label: 'Altura (cm)', placeholder: '40' },
    ],
    calculate: (v) => calcularVolumeRetangulo(v.comprimento, v.largura, v.altura),
  },
  {
    id: 'triangulo',
    nome: 'Aquário Triangular',
    descricao: 'Calcula o volume em litros',
    icon: 'Triangle',
    fields: [
      { key: 'altura', label: 'Altura (cm)', placeholder: '40' },
      { key: 'ladoY', label: 'Lado Y (cm)', placeholder: '30' },
      { key: 'ladoZ', label: 'Lado Z (cm)', placeholder: '30' },
    ],
    calculate: (v) => calcularVolumeTriangulo(v.altura, v.ladoY, v.ladoZ),
  },
  {
    id: 'cilindro',
    nome: 'Aquário Cilíndrico',
    descricao: 'Calcula o volume em litros',
    icon: 'Cylinder',
    fields: [
      { key: 'altura', label: 'Altura (cm)', placeholder: '40' },
      { key: 'diametro', label: 'Diâmetro (cm)', placeholder: '30' },
    ],
    calculate: (v) => calcularVolumeCilindro(v.altura, v.diametro),
  },
  {
    id: 'tpa',
    nome: 'TPA (Troca Parcial de Água)',
    descricao: 'Calcula a quantidade de litros para TPA',
    icon: 'Droplets',
    fields: [
      { key: 'litros', label: 'Litros do aquário', placeholder: '200' },
      { key: 'porcentagem', label: 'Porcentagem (%)', placeholder: '30' },
    ],
    calculate: (v) => calcularLitrosTPA(v.litros, v.porcentagem),
  },
  {
    id: 'watts',
    nome: 'Watts por Litro',
    descricao: 'Calcula a média de watts por litro',
    icon: 'Zap',
    fields: [
      { key: 'litros', label: 'Litros do aquário', placeholder: '200' },
      { key: 'watts', label: 'Total de Watts', placeholder: '60' },
    ],
    calculate: (v) => calcularWatts(v.litros, v.watts),
  },
  {
    id: 'filtragem',
    nome: 'Ciclos de Filtragem',
    descricao: 'Verifica se o filtro está adequado',
    icon: 'Filter',
    fields: [
      { key: 'qdtFiltro', label: 'Litros/hora do filtro', placeholder: '600' },
      { key: 'qtdLitrosAquario', label: 'Litros do aquário', placeholder: '200' },
    ],
    calculate: (v) => calcularFiltragemPorHora(v.qdtFiltro, v.qtdLitrosAquario),
  },
  {
    id: 'substrato',
    nome: 'Quantidade de Substrato',
    descricao: 'Calcula a quantidade ideal de substrato',
    icon: 'Mountain',
    fields: [
      { key: 'litros', label: 'Litros do aquário', placeholder: '200' },
    ],
    calculate: (v) => calcularVolumeCascalho(v.litros),
  },
  {
    id: 'filtro-ideal',
    nome: 'Filtro Ideal',
    descricao: 'Recomenda o filtro ideal para seu aquário',
    icon: 'Gauge',
    fields: [
      { key: 'litros', label: 'Litros do aquário', placeholder: '200' },
    ],
    calculate: (v) => calcularFiltroIdeal(v.litros),
  },
  {
    id: 'aquecedor',
    nome: 'Aquecedor Ideal',
    descricao: 'Recomenda o aquecedor ideal para seu aquário',
    icon: 'Thermometer',
    fields: [
      { key: 'litros', label: 'Litros do aquário', placeholder: '200' },
    ],
    calculate: (v) => calcularAquecedor(v.litros),
  },
  {
    id: 'qtd-peixes',
    nome: 'Quantidade Máxima de Peixes',
    descricao: 'Calcula quantos peixes o seu aquário suporta',
    icon: 'Fish',
    fields: [
      { key: 'litros', label: 'Litros do aquário', placeholder: '200' },
    ],
    calculate: (v) => calcularQtdMaximaPeixes(v.litros),
  },
]
