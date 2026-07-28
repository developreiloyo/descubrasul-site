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
          label="Descrição curta"
          htmlFor="descricao"
          hint={`${descricao.length} / 300 caracteres — aparece nos resultados de busca`}
          required
        >
          <textarea
            id="descricao"
            rows={3}
            value={descricao}
            onChange={(e) => onChange('descricao', e.target.value)}
            placeholder="Frase de impacto sobre o negócio — aparece nos resultados de busca."
            className={`${inputClass} resize-none`}
          />
        </FormField>

        <FormField
          label="História do negócio (opcional)"
          htmlFor="historia"
          hint={`${historia.length} caracteres · Pode usar parágrafos`}
        >
          <textarea
            id="historia"
            rows={6}
            value={historia}
            onChange={(e) => onChange('historia', e.target.value)}
            placeholder="Conte a história do seu negócio. Quando surgiu? O que o torna especial?"
            className={`${inputClass} resize-none`}
          />
        </FormField>
      </div>
    </Card>
  );
}
