'use client';
import { Clock } from 'lucide-react';
import { Card } from '../Card';
import { FormField, inputClass } from '../FormField';

const DIAS = [
  { slug: 'seg', label: 'Seg' },
  { slug: 'ter', label: 'Ter' },
  { slug: 'qua', label: 'Qua' },
  { slug: 'qui', label: 'Qui' },
  { slug: 'sex', label: 'Sex' },
  { slug: 'sab', label: 'Sáb' },
  { slug: 'dom', label: 'Dom' },
];

interface Props {
  horario_abertura: string;
  horario_fechamento: string;
  dias_funcionamento: string[];
  onChange: (campo: string, valor: string) => void;
  onDiasChange: (dias: string[]) => void;
}

export function HorarioCard({
  horario_abertura,
  horario_fechamento,
  dias_funcionamento,
  onChange,
  onDiasChange,
}: Props) {
  function toggleDia(slug: string) {
    if (dias_funcionamento.includes(slug)) {
      onDiasChange(dias_funcionamento.filter((d) => d !== slug));
    } else {
      onDiasChange([...dias_funcionamento, slug]);
    }
  }

  return (
    <Card title="Horário de atendimento" icon={Clock}>
      <div className="flex flex-col gap-4">
        <div>
          <p className="text-sm font-medium text-ink-muted mb-2">Dias de atendimento</p>
          <div className="flex flex-wrap gap-2">
            {DIAS.map(({ slug, label }) => {
              const ativo = dias_funcionamento.includes(slug);
              return (
                <button
                  key={slug}
                  type="button"
                  onClick={() => toggleDia(slug)}
                  className={`px-3.5 py-1.5 rounded-full text-sm font-medium border transition-all ${
                    ativo
                      ? 'bg-[#00602a] border-[#00602a] text-white'
                      : 'bg-white border-[#becabc] text-[#3f493f] hover:border-[#00602a] hover:text-[#00602a]'
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormField label="Abre às" htmlFor="horario_abertura">
            <input
              id="horario_abertura"
              type="time"
              value={horario_abertura}
              onChange={(e) => onChange('horario_abertura', e.target.value)}
              className={inputClass}
            />
          </FormField>
          <FormField label="Fecha às" htmlFor="horario_fechamento">
            <input
              id="horario_fechamento"
              type="time"
              value={horario_fechamento}
              onChange={(e) => onChange('horario_fechamento', e.target.value)}
              className={inputClass}
            />
          </FormField>
        </div>
      </div>
    </Card>
  );
}
