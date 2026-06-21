'use client';
import { Store } from 'lucide-react';
import { Card } from '../Card';
import { FormField, inputClass } from '../FormField';

interface Props {
  nome: string;
  descricao: string;
  historia: string;
  bairro: string;
  whatsapp: string;
  website: string;
  onChange: (campo: string, valor: string) => void;
}

export function InformacoesBasicasCard({
  nome,
  descricao,
  historia,
  bairro,
  whatsapp,
  website,
  onChange,
}: Props) {
  return (
    <Card title="Informações básicas" icon={Store}>
      <div className="flex flex-col gap-4">
        <FormField label="Nome do negócio" htmlFor="nome">
          <input
            id="nome"
            type="text"
            value={nome}
            onChange={(e) => onChange('nome', e.target.value)}
            className={inputClass}
          />
        </FormField>

        <FormField
          label="Descrição curta"
          htmlFor="descricao"
          hint={`${descricao.length} caracteres`}
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
          label="História do negócio"
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField label="Bairro" htmlFor="bairro">
            <input
              id="bairro"
              type="text"
              value={bairro}
              onChange={(e) => onChange('bairro', e.target.value)}
              className={inputClass}
            />
          </FormField>
          <FormField label="WhatsApp" htmlFor="whatsapp">
            <input
              id="whatsapp"
              type="tel"
              value={whatsapp}
              onChange={(e) => onChange('whatsapp', e.target.value)}
              placeholder="(48) 99999-0000"
              className={inputClass}
            />
          </FormField>
        </div>

        <FormField label="Site (opcional)" htmlFor="website">
          <input
            id="website"
            type="url"
            value={website}
            onChange={(e) => onChange('website', e.target.value)}
            placeholder="https://..."
            className={inputClass}
          />
        </FormField>
      </div>
    </Card>
  );
}
