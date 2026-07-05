'use client';
import { useEffect, useState } from 'react';
import { Store } from 'lucide-react';
import { Card } from '../Card';
import { FormField, inputClass } from '../FormField';
import { maskPhone } from '@/lib/masks';

interface Cidade {
  slug: string;
  nome: string;
}

interface Categoria {
  slug: string;
  nome: string;
  icone: string;
  ativo: boolean;
  ordem: number;
}

interface Props {
  nome: string;
  descricao: string;
  historia: string;
  cidade: string;
  categoria_slug: string;
  whatsapp: string;
  website: string;
  onChange: (campo: string, valor: string) => void;
}

export function InformacoesBasicasCard({
  nome,
  descricao,
  historia,
  cidade,
  categoria_slug,
  whatsapp,
  website,
  onChange,
}: Props) {
  const [cidades, setCidades] = useState<Cidade[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);

  useEffect(() => {
    fetch('/api/proxy/cidades/')
      .then((r) => r.json())
      .then((data) => setCidades(Array.isArray(data) ? data : []))
      .catch(() => {});

    fetch('/api/proxy/categorias/')
      .then((r) => r.json())
      .then((data) => {
        const lista = Array.isArray(data) ? data : (data.results ?? []);
        setCategorias(lista.filter((c: Categoria) => c.ativo));
      })
      .catch(() => {});
  }, []);

  return (
    <Card title="Informações básicas" icon={Store}>
      <div className="flex flex-col gap-4">
        <FormField label="Nome do negócio" htmlFor="nome" required>
          <input
            id="nome"
            type="text"
            value={nome}
            onChange={(e) => onChange('nome', e.target.value)}
            className={inputClass}
          />
        </FormField>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField label="Cidade" htmlFor="cidade" required>
            <select
              id="cidade"
              value={cidade}
              onChange={(e) => onChange('cidade', e.target.value)}
              className={inputClass}
            >
              <option value="">Selecione a cidade</option>
              {cidades.map((c) => (
                <option key={c.slug} value={c.nome}>
                  {c.nome}
                </option>
              ))}
            </select>
          </FormField>

          <FormField label="Categoria" htmlFor="categoria_slug" required>
            <select
              id="categoria_slug"
              value={categoria_slug}
              onChange={(e) => onChange('categoria_slug', e.target.value)}
              className={inputClass}
            >
              <option value="">Selecione a categoria</option>
              {categorias.map((c) => (
                <option key={c.slug} value={c.slug}>
                  {c.icone} {c.nome}
                </option>
              ))}
            </select>
          </FormField>
        </div>

        <FormField
          label="Descrição curta"
          htmlFor="descricao"
          hint={`${descricao.length} caracteres`}
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

        <FormField label="WhatsApp" htmlFor="whatsapp" required>
          <input
            id="whatsapp"
            type="tel"
            value={whatsapp}
            onChange={(e) => onChange('whatsapp', maskPhone(e.target.value))}
            placeholder="+55 (48) 99999-0000"
            className={inputClass}
          />
        </FormField>

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
