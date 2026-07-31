/**
 * Tira do head as tags que o build gravou, quando o React assume o lugar.
 *
 * O `scripts/generate-seo.ts` grava um head completo entre os marcadores
 * `<!--seo-->` e `<!--/seo-->`, que e o que rastreador sem JavaScript le. Assim
 * que o app sobe, o `components/SEO.tsx` monta as mesmas tags de novo, e o head
 * fica com duas description, dois canonical e dois og:title.
 *
 * Duplicata nao e cosmetica: dois canonical apontando para URLs diferentes
 * fazem o Google descartar o sinal inteiro, e ai a pagina perde a definicao de
 * qual URL e a boa.
 *
 * Nao da para pedir ao Helmet que substitua as tags do HTML. Nesta versao
 * (react-helmet-async 3 sobre React 19) ele nao mexe mais no DOM na mao: so
 * renderiza <title>, <meta> e <link> como elemento normal e deixa o React 19
 * icar sozinho para o head. Como o React nao sabe da existencia das tags que
 * vieram no HTML, ele soma em vez de trocar. Marcar com `data-rh` tambem nao
 * resolve: esse atributo so vale no caminho antigo, para React 18 e anteriores.
 *
 * Entao a limpeza e nossa, e acontece na montagem do SEO em vez de na subida do
 * app de proposito. Nas fichas os dados chegam por import dinamico, e o SEO so
 * monta depois disso; limpar antes deixaria a pagina alguns instantes sem
 * description nenhuma, bem na janela em que um rastreador que roda JavaScript
 * pode tirar a foto.
 *
 * O <title> escapa da limpeza. Ele e o unico que o React 19 nao duplica: em vez
 * de criar outro, reaproveita o que ja esta no head e troca o texto. Remove-lo
 * levaria junto o elemento que o React gerencia, e a aba ficaria sem titulo.
 */

const START = 'seo'
const END = '/seo'

let released = false

export function releasePrerenderedHead(): void {
  if (released || typeof document === 'undefined') return
  released = true

  const doomed: ChildNode[] = []
  let node: ChildNode | null = document.head.firstChild
  let inside = false

  while (node) {
    if (node.nodeType === Node.COMMENT_NODE) {
      const marker = node.nodeValue?.trim()
      if (marker === START) {
        inside = true
        node = node.nextSibling
        continue
      }
      if (marker === END) break
    }

    if (inside && node.nodeName !== 'TITLE') doomed.push(node)
    node = node.nextSibling
  }

  for (const tag of doomed) tag.remove()
}
