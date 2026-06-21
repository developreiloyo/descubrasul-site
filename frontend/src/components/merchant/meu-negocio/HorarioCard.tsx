'use client';
import { Clock } from 'lucide-react';
import { Card } from '../Card';
import { FormField, inputClass } from '../FormField';

interface Props {
  horario_abertura: string;
  horario_fechamento: string;
  onChange: (campo: string, valor: string) => void;
}

export function HorarioCard({ horario_abertura, horario_fechamento, onChange }: Props) {
  return (
    <Card title="Horário de funcionamento" icon={Clock}>
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
    </Card>
  );
}
