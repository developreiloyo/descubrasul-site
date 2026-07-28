'use client';
import { useEffect, useState } from 'react';
import { Building2 } from 'lucide-react';
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
}

interface Props {
  nome: string;
  categoria_slug: string;
  cidade: string;
  whatsapp: string;
  nome_responsavel: string;
  telefone: string;
  email_contato: string;
  website: string;
  onChange: (campo: string, valor: string) => void;
}

export function InformacoesBasicasCard({
  nome,
  categoria_slug,
  cidade,
  whatsapp,
  nome_responsavel,
  telefone,
  email_contato,
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

    fetch('/api/proxy/categorias/?ordering=ordem&limit=100')
      .then((r) => r.json())
      .then((data) => setCategorias(data.results ?? data ?? []))
      .catch(() => {});
  }, []);

  return (
    <Card title="Dados do negócio ou perfil profissional" icon={Building2}>
      <div className="flex flex-col gap-5">

        {/* ── Identificação ──────────────────────────────── */}
        <div className="flex flex-col gap-4">
          <p className="text-xs font-semibold text-ink/40 uppercase tracking-widest">
            Identificação
          </p>

          <FormField label="Nome do negócio" htmlFor="nome" required>
            <input
              id="nome"
              type="text"
              value={nome}
              onChange={(e) => onChange('nome', e.target.value)}
              placeholder="Ex.: Padaria Central, Studio Ana Lima…"
              className={inputClass}
            />
          </FormField>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                    {c.nome}
                  </option>
                ))}
              </select>
            </FormField>

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
          </div>
        </div>

        <hr className="border-border" />

        {/* ── Contato ────────────────────────────────────── */}
        <div className="flex flex-col gap-4">
          <p className="text-xs font-semibold text-ink/40 uppercase tracking-widest">
            Contato
          </p>

          <FormField label="WhatsApp" htmlFor="whatsapp" required>
            <input
              id="whatsapp"
              type="tel"
              value={whatsapp}
              onChange={(e) => onChange('whatsapp', maskPhone(e.target.value))}
              placeholder="(48) 99999-0000"
              className={inputClass}
            />
          </FormField>

          <FormField label="Nome do responsável" htmlFor="nome_responsavel" required>
            <input
              id="nome_responsavel"
              type="text"
              value={nome_responsavel}
              onChange={(e) => onChange('nome_responsavel', e.target.value)}
              placeholder="Nome de quem gerencia o perfil"
              className={inputClass}
            />
          </FormField>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField label="Telefone (opcional)" htmlFor="telefone">
              <input
                id="telefone"
                type="tel"
                value={telefone}
                onChange={(e) => onChange('telefone', maskPhone(e.target.value))}
                placeholder="(48) 3333-0000"
                className={inputClass}
              />
            </FormField>

            <FormField label="E-mail (opcional)" htmlFor="email_contato">
              <input
                id="email_contato"
                type="email"
                value={email_contato}
                onChange={(e) => onChange('email_contato', e.target.value)}
                placeholder="contato@seunegocio.com.br"
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
      </div>
    </Card>
  );
}
