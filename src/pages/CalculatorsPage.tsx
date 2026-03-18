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
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-4 p-4 text-left hover:bg-gray-50/50 transition-colors"
      >
        <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
          <Icon size={20} />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-sm text-text">{config.nome}</h3>
          <p className="text-xs text-text-secondary mt-0.5">{config.descricao}</p>
        </div>
        {open ? <ChevronUp size={18} className="text-gray-400" /> : <ChevronDown size={18} className="text-gray-400" />}
      </button>

      {open && (
        <div className="px-4 pb-4 border-t border-gray-100 pt-4">
          <div className="grid gap-3 sm:grid-cols-2">
            {config.fields.map(field => (
              <div key={field.key}>
                <label className="block text-xs font-medium text-text-secondary mb-1">
                  {field.label}
                </label>
                <input
                  type="number"
                  placeholder={field.placeholder}
                  value={values[field.key] || ''}
                  onChange={e => setValues(prev => ({ ...prev, [field.key]: e.target.value }))}
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                />
              </div>
            ))}
          </div>

          <button
            onClick={handleCalculate}
            className="mt-4 w-full py-2.5 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary-dark transition-colors"
          >
            Calcular
          </button>

          {result && (
            <div className="mt-3 p-3 rounded-lg bg-surface-alt text-sm text-text leading-relaxed">
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
    <div className="max-w-2xl mx-auto px-4 py-6">
      <PageHeader title="Calculadoras" subtitle="Ferramentas úteis para o seu aquário" />

      <div className="grid gap-3">
        {calculators.map(calc => (
          <CalculatorCard key={calc.id} config={calc} />
        ))}
      </div>
    </div>
  )
}
