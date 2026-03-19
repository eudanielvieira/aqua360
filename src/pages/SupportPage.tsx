import { Heart, Coffee, QrCode, Copy, Check, Globe, ExternalLink } from 'lucide-react'
import { useState } from 'react'
import PageHeader from '../components/PageHeader'

const PIX_KEY = 'c2b5d366-6596-42cc-b23a-0a3dd01c64ce'
const BMAC_USERNAME = 'danielvieira'

export default function SupportPage() {
  const [copied, setCopied] = useState(false)
  const [tab, setTab] = useState<'pix' | 'international'>('pix')

  const handleCopy = () => {
    if (!PIX_KEY) return
    navigator.clipboard.writeText(PIX_KEY)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <PageHeader title="Apoie o Aqua360" />

      <div className="bg-card rounded-2xl shadow-sm shadow-black/5 p-6 sm:p-8 text-center">
        <div className="w-16 h-16 rounded-2xl bg-rose-500/10 flex items-center justify-center mx-auto mb-4">
          <Heart size={28} className="text-rose-500" />
        </div>

        <h2 className="text-xl font-bold text-text mb-2">Ajude a manter o Aqua360 no ar</h2>
        <p className="text-sm text-text-secondary max-w-md mx-auto leading-relaxed">
          O Aqua360 e um projeto independente, mantido com dedicacao para a comunidade de aquarismo.
          Com dados cientificos de mais de 788 especies, mapas de distribuicao, verificador de compatibilidade
          e muito mais -- tudo gratuito e sem anuncios.
        </p>

        <div className="flex justify-center gap-2 mt-6 mb-2">
          <button
            onClick={() => setTab('pix')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
              tab === 'pix'
                ? 'bg-primary text-white'
                : 'bg-surface-alt text-text-secondary hover:bg-surface'
            }`}
          >
            <QrCode size={16} />
            Brasil (Pix)
          </button>
          <button
            onClick={() => setTab('international')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
              tab === 'international'
                ? 'bg-primary text-white'
                : 'bg-surface-alt text-text-secondary hover:bg-surface'
            }`}
          >
            <Globe size={16} />
            International
          </button>
        </div>

        <div className="my-6 py-6 border-y border-border/60">
          {tab === 'pix' ? (
            <>
              <p className="text-xs font-bold text-text-secondary uppercase tracking-wider mb-4">Apoie via Pix</p>

              {PIX_KEY ? (
                <>
                  <div className="w-48 h-48 mx-auto bg-white rounded-xl p-3 mb-4 border border-border overflow-hidden">
                    <img
                      src="/pix-qrcode.png"
                      alt="QR Code Pix"
                      className="w-full h-full object-contain"
                      onError={e => {
                        const target = e.target as HTMLImageElement
                        target.style.display = 'none'
                        target.parentElement!.innerHTML = '<div class="w-full h-full bg-surface-alt rounded-lg flex items-center justify-center"><p class="text-xs text-text-secondary text-center px-4">Aponte a camera do banco para o QR Code ou copie a chave abaixo</p></div>'
                      }}
                    />
                  </div>
                  <p className="text-xs text-text-secondary mb-2">Chave Pix:</p>
                  <button
                    onClick={handleCopy}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-surface-alt rounded-xl text-sm font-mono text-text hover:bg-surface transition-colors"
                  >
                    {PIX_KEY}
                    {copied ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} className="text-text-secondary" />}
                  </button>
                  {copied && <p className="text-xs text-emerald-500 mt-2 font-medium">Chave copiada!</p>}
                </>
              ) : (
                <div className="w-48 h-48 mx-auto bg-surface-alt rounded-xl flex items-center justify-center mb-4">
                  <div className="text-center">
                    <QrCode size={48} className="text-text-secondary/30 mx-auto mb-2" />
                    <p className="text-xs text-text-secondary">QR Code em breve</p>
                  </div>
                </div>
              )}
            </>
          ) : (
            <>
              <p className="text-xs font-bold text-text-secondary uppercase tracking-wider mb-4">Support via Buy Me a Coffee</p>

              <div className="max-w-sm mx-auto">
                <p className="text-sm text-text-secondary leading-relaxed mb-6">
                  Hey! I'm Daniel, a software developer from Brazil passionate about technology, open source, and the aquarium hobby.
                  Aqua360 is my independent project -- a free, ad-free encyclopedia with 788+ species, scientific data, compatibility
                  checker, distribution maps, and calculators. Your support helps keep the servers running and everything free for the community!
                </p>

                <a
                  href={`https://buymeacoffee.com/${BMAC_USERNAME}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-[#FFDD00] hover:bg-[#e6c800] text-gray-900 font-bold rounded-xl transition-colors text-sm"
                >
                  <Coffee size={18} />
                  Buy me a coffee
                  <ExternalLink size={14} />
                </a>

                <p className="text-xs text-text-secondary/60 mt-4">
                  Accepts credit card, debit card, and PayPal.
                </p>
              </div>
            </>
          )}
        </div>

        <div className="grid gap-4 sm:grid-cols-3 text-left">
          <div className="p-4 rounded-xl bg-surface-alt/50">
            <Coffee size={20} className="text-amber-500 mb-2" />
            <p className="text-sm font-bold text-text">Servidor e dominio</p>
            <p className="text-xs text-text-secondary mt-1">Sua contribuicao ajuda a pagar a hospedagem e manter o site no ar.</p>
          </div>
          <div className="p-4 rounded-xl bg-surface-alt/50">
            <Heart size={20} className="text-rose-500 mb-2" />
            <p className="text-sm font-bold text-text">Novos conteudos</p>
            <p className="text-xs text-text-secondary mt-1">Mais especies, fotos, guias de montagem e funcionalidades novas.</p>
          </div>
          <div className="p-4 rounded-xl bg-surface-alt/50">
            <Globe size={20} className="text-primary mb-2" />
            <p className="text-sm font-bold text-text">Sem anuncios</p>
            <p className="text-xs text-text-secondary mt-1">Com seu apoio o Aqua360 continua 100% gratuito e sem propagandas.</p>
          </div>
        </div>

        <p className="text-xs text-text-secondary/50 mt-8">
          Qualquer valor faz diferenca. Obrigado por apoiar a comunidade de aquarismo!
        </p>
      </div>
    </div>
  )
}
