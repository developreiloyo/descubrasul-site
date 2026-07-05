'use client';
import { useState, useEffect } from 'react';
import { MapPin, Loader2 } from 'lucide-react';
import { Card } from '../Card';
import { FormField, inputClass } from '../FormField';
import { maskCep } from '@/lib/masks';

interface Cidade {
  slug: string;
  nome: string;
}

interface Props {
  cep: string;
  logradouro: string;
  numero: string;
  loc_bairro: string;
  loc_cidade: string;
  estado: string;
  onChange: (campo: string, valor: string) => void;
}

export function EnderecoCard({
  cep,
  logradouro,
  numero,
  loc_bairro,
  loc_cidade,
  estado,
  onChange,
}: Props) {
  const [buscando, setBuscando] = useState(false);
  const [cidades, setCidades] = useState<Cidade[]>([]);

  useEffect(() => {
    fetch('/api/proxy/cidades/')
      .then((r) => r.json())
      .then((data) => setCidades(Array.isArray(data) ? data : []))
      .catch(() => {});
  }, []);

  const buscarCep = async () => {
    const limpo = cep.replace(/\D/g, '');
    if (limpo.length !== 8) return;
    setBuscando(true);
    try {
      const res = await fetch(`https://viacep.com.br/ws/${limpo}/json/`);
      const d = await res.json();
      if (d.erro) return;
      if (d.logradouro) onChange('logradouro', d.logradouro);
      if (d.bairro) onChange('loc_bairro', d.bairro);
      if (d.localidade) onChange('loc_cidade', d.localidade);
      if (d.uf) onChange('estado', d.uf);
    } catch {
      // ViaCEP fora do ar — comerciante preenche manual
    } finally {
      setBuscando(false);
    }
  };

  return (
    <Card title="Endereço" icon={MapPin}>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <FormField label="CEP" htmlFor="cep" required>
          <div className="flex gap-2">
            <input
              id="cep"
              type="text"
              value={cep}
              maxLength={9}
              placeholder="88801-000"
              onChange={(e) => onChange('cep', maskCep(e.target.value))}
              onBlur={buscarCep}
              className={inputClass}
            />
            <button
              type="button"
              onClick={buscarCep}
              disabled={buscando}
              className="px-4 py-2.5 bg-[#2b3fd4] hover:bg-[#1e30b0] text-white text-sm font-semibold rounded-lg transition-colors disabled:opacity-60 flex items-center gap-1.5 whitespace-nowrap"
            >
              {buscando ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Buscar'}
            </button>
          </div>
        </FormField>

        <FormField label="Logradouro / Rua" htmlFor="logradouro" className="md:col-span-2" required>
          <input
            id="logradouro"
            type="text"
            value={logradouro}
            onChange={(e) => onChange('logradouro', e.target.value)}
            className={inputClass}
          />
        </FormField>

        <FormField label="Número" htmlFor="numero">
          <input
            id="numero"
            type="text"
            value={numero}
            placeholder="S/N"
            onChange={(e) => onChange('numero', e.target.value)}
            className={inputClass}
          />
        </FormField>

        <FormField label="Bairro" htmlFor="loc_bairro">
          <input
            id="loc_bairro"
            type="text"
            value={loc_bairro}
            onChange={(e) => onChange('loc_bairro', e.target.value)}
            className={inputClass}
          />
        </FormField>

        <FormField label="Cidade" htmlFor="loc_cidade" required>
          <select
            id="loc_cidade"
            value={loc_cidade}
            onChange={(e) => onChange('loc_cidade', e.target.value)}
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

        <FormField label="Estado" htmlFor="estado">
          <input
            id="estado"
            type="text"
            value={estado}
            maxLength={2}
            onChange={(e) => onChange('estado', e.target.value.toUpperCase())}
            className={inputClass}
          />
        </FormField>
      </div>
    </Card>
  );
}
