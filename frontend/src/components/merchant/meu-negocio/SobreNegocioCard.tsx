'use client';
import { FileText } from 'lucide-react';
import { Card } from '../Card';
import { FormField, inputClass } from '../FormField';
import { UpgradeLock } from '../UpgradeLock';

interface Props {
  descricao: string;
  historia: string;
  isPro: boolean;
  onChange: (campo: string, valor: string) => void;
}

export function SobreNegocioCard({ descricao, historia, isPro, onChange }: Props) {
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

        <div>
          <p className="text-sm font-medium text-ink mb-1.5">
            Sobre a empresa{' '}
            {!isPro && <span className="text-ink/40">(opcional)</span>}
          </p>
          {isPro ? (
            <FormField
              label=""
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
          ) : (
            <UpgradeLock mensagem="Disponível nos planos Conexão Sul e Destaque Sul." />
          )}
        </div>
      </div>
    </Card>
  );
}
