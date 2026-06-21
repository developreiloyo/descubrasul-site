import { Search } from 'lucide-react';
import { Card } from '../Card';
import { FormField, inputClass } from '../FormField';

interface Props {
  nome: string;
  seo_title: string;
  seo_description: string;
  palavras_chave: string;
  onChange: (campo: string, valor: string) => void;
}

export function SeoCard({
  nome,
  seo_title,
  seo_description,
  palavras_chave,
  onChange,
}: Props) {
  return (
    <Card title="Como você aparece no Google" icon={Search}>
      <p className="text-sm text-ink-subtle mb-4">
        Opcional — se deixar em branco, geramos automaticamente.
      </p>
      <div className="flex flex-col gap-4">
        <FormField
          label="Título no Google (máx 60)"
          htmlFor="seo_title"
          hint={`${seo_title.length}/60`}
        >
          <input
            id="seo_title"
            type="text"
            maxLength={60}
            value={seo_title}
            onChange={(e) => onChange('seo_title', e.target.value)}
            placeholder={`Ex: ${nome || 'Seu Negócio'} em Criciúma | DescubraSul`}
            className={`${inputClass} ${seo_title.length > 55 ? 'border-amber-400' : ''}`}
          />
        </FormField>

        <FormField
          label="Descrição no Google (máx 160)"
          htmlFor="seo_description"
          hint={`${seo_description.length}/160`}
        >
          <textarea
            id="seo_description"
            rows={2}
            maxLength={160}
            value={seo_description}
            onChange={(e) => onChange('seo_description', e.target.value)}
            className={`${inputClass} resize-none ${seo_description.length > 150 ? 'border-amber-400' : ''}`}
          />
        </FormField>

        <FormField
          label="Palavras-chave (separadas por vírgula)"
          htmlFor="palavras_chave"
          hint="Usadas na busca interna — nunca aparecem na sua página."
        >
          <input
            id="palavras_chave"
            type="text"
            value={palavras_chave}
            onChange={(e) => onChange('palavras_chave', e.target.value)}
            placeholder="Ex: pizzaria, pizza artesanal, delivery"
            className={inputClass}
          />
        </FormField>
      </div>
    </Card>
  );
}
