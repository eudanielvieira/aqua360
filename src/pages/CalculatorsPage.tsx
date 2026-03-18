import { useState } from 'react'
import * as icons from 'lucide-react'
import { calculators, type CalculatorConfig } from '../utils/calculators'
import PageHeader from '../components/PageHeader'
import { ChevronDown, ChevronUp } from 'lucide-react'

function CalculatorCard({ config }: { config: CalculatorConfig }) {
  const [open, setOpen] = useState(false)
  const [values, setValues] = useState<Record<string, string>>({})
  const [result, setResult] = useState('')

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const Icon = (icons as any)[config.icon] || icons.Calculator

  function handleCalculate() {
    const numValues: Record<string, number> = {}
    for (const field of config.fields) {
      const val = parseFloat(values[field.key] || '0')
      if (isNaN(val) || val <= 0) {
        setResult('Preencha todos os campos com valores válidos.')
        return
      }
      numValues[field.key] = val
    }
    setResult(config.calculate(numValues))
  }

  return (
    <div className="bg-card rounded-2xl shadow-sm shadow-black/5 overflow-hidden transition-all duration-200 hover:shadow-md">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-4 p-5 text-left hover:bg-surface-alt/50 transition-colors"
      >
        <div className="flex-shrink-0 w-11 h-11 rounded-xl bg-gradient-to-br from-primary to-primary-light text-white flex items-center justify-center shadow-sm">
          <Icon size={20} />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-sm text-text">{config.nome}</h3>
          <p className="text-xs text-text-secondary mt-0.5">{config.descricao}</p>
        </div>
        {open
          ? <ChevronUp size={18} className="text-text-secondary" />
          : <ChevronDown size={18} className="text-text-secondary" />
        }
      </button>

      {open && (
        <div className="px-5 pb-5 border-t border-border/60 pt-5">
          <div className="grid gap-3 sm:grid-cols-2">
            {config.fields.map(field => (
              <div key={field.key}>
                <label className="block text-xs font-semibold text-text-secondary mb-1.5">
                  {field.label}
                </label>
                <input
                  type="number"
                  placeholder={field.placeholder}
                  value={values[field.key] || ''}
                  onChange={e => setValues(prev => ({ ...prev, [field.key]: e.target.value }))}
                  className="w-full px-4 py-2.5 rounded-xl border border-border bg-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                />
              </div>
            ))}
          </div>

          <button
            onClick={handleCalculate}
            className="mt-4 w-full py-3 bg-gradient-to-r from-primary to-primary-light text-white rounded-xl text-sm font-bold hover:shadow-lg hover:shadow-primary/20 transition-all duration-200"
          >
            Calcular
          </button>

          {result && (
            <div className="mt-4 p-4 rounded-xl bg-surface-alt border border-border/50 text-sm text-text leading-relaxed">
              {result}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default function CalculatorsPage() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <PageHeader title="Calculadoras" subtitle="Ferramentas úteis para o seu aquário" />

      <div className="grid gap-3">
        {calculators.map(calc => (
          <CalculatorCard key={calc.id} config={calc} />
        ))}
      </div>
    </div>
  )
}
