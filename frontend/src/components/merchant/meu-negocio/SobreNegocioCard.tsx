'use client';
import { FileText } from 'lucide-react';
import { Card } from '../Card';
import { FormField, inputClass } from '../FormField';

interface Props {
  descricao: string;
  historia: string;
  onChange: (campo: string, valor: string) => void;
}

export function SobreNegocioCard({ descricao, historia, onChange }: Props) {
  return (
    <Card title="Sobre o negócio" icon={FileText}>
      <div className="flex flex-col gap-4">
        <FormField
          label="Apresentação"
          htmlFor="descricao"
          hint={`${descricao.length} / 300 caracteres — aparece nos resultados de busca`}
          required
        >
          <textarea
            id="descricao"
            rows={3}
            value={descricao}
            onChange={(e) => onChange('descricao', e.target.value)}
            placeholder="Escreva uma breve apresentação da sua empresa."
            className={`${inputClass} resize-none`}
          />
        </FormField>

        <FormField
          label="Sobre a empresa (opcional)"
          htmlFor="historia"
          hint={`${historia.length} caracteres · Pode usar parágrafos`}
        >
          <textarea
            id="historia"
            rows={6}
            value={historia}
            onChange={(e) => onChange('historia', e.target.value)}
            placeholder="Conte mais sobre sua empresa, seus serviços, experiência e diferenciais."
            className={`${inputClass} resize-none`}
          />
        </FormField>
      </div>
    </Card>
  );
}
